<script lang="ts">
	import {
		endWorkSession,
		fetchProfile,
		fetchWorkSessions,
		fetchWorkSummary,
		startWorkSession,
		updateProfile
	} from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type { TimeSummary, User, WorkSession, WorkSummaryPoint } from '$lib/types';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);

	let loading = true;
	let errorMessage: string | null = null;

	let profile: User | null = null;
	let summary: TimeSummary | null = null;
	let workSessions: WorkSession[] = [];
	let workSummary: WorkSummaryPoint | null = null;
	let activeWorkSession: WorkSession | null = null;
	let selectedSummaryPeriod: 'daily' | 'weekly' | 'monthly' = 'daily';

	async function loadSessions() {
		loading = true;
		errorMessage = null;
		try {
			const [profileResponse, sessionsResponse, summaryResponse] = await Promise.all([
				fetchProfile(),
				fetchWorkSessions({ limit: 100 }),
				fetchWorkSummary(selectedSummaryPeriod)
			]);

			profile = profileResponse.profile;
			summary = profileResponse.summary;
			workSessions = sessionsResponse.sessions;
			workSummary = summaryResponse;

			activeWorkSession = workSessions.find((session) => session.endedAt === null) ?? null;

			if (profile) {
				authStore.setUser(profile);
			}
		} catch (error) {
			console.error(error);
			errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSessions();
	});

	async function refreshSummary(period: 'daily' | 'weekly' | 'monthly') {
		selectedSummaryPeriod = period;
		try {
			workSummary = await fetchWorkSummary(period);
		} catch (error) {
			console.error('Failed to refresh summary', error);
		}
	}

	function formatMinutes(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const remaining = minutes % 60;
		if (hours === 0) return `${minutes}m`;
		return `${hours}h ${remaining}m`;
	}

	async function handleStartWork() {
		try {
			const response = await startWorkSession({});
			activeWorkSession = response.session;
			workSessions = [response.session, ...workSessions];
		} catch (error) {
			console.error('Unable to start work session', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to start session';
		}
	}

	async function handleEndWork() {
		if (!activeWorkSession) return;
		try {
			const response = await endWorkSession({ sessionId: activeWorkSession.id });
			activeWorkSession = null;
			workSessions = workSessions.map((session) =>
				session.id === response.session.id ? response.session : session
			);
			if (summary) {
				summary = response.summary;
			}
			if (profile) {
				profile = { ...profile, focusStreak: response.focusStreak };
				authStore.setUser(profile);
			}
			await Promise.all([refreshSummary(selectedSummaryPeriod), loadSessions()]);
		} catch (error) {
			console.error('Unable to end work session', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to end session';
		}
	}

	const summaryPeriods: Array<{ label: string; value: 'daily' | 'weekly' | 'monthly' }> = [
		{ label: 'Last 7 days', value: 'daily' },
		{ label: 'Last 8 weeks', value: 'weekly' },
		{ label: 'Last 6 months', value: 'monthly' }
	];

	// Group sessions by date
	function groupSessionsByDate(sessions: WorkSession[]) {
		const groups = new Map<string, WorkSession[]>();
		sessions.forEach((session) => {
			const dateKey = dayjs(session.startedAt).format('YYYY-MM-DD');
			if (!groups.has(dateKey)) {
				groups.set(dateKey, []);
			}
			groups.get(dateKey)?.push(session);
		});
		return Array.from(groups.entries())
			.map(([date, sessions]) => ({
				date,
				dateFormatted: dayjs(date).format('MMMM D, YYYY'),
				sessions: sessions.sort((a, b) => 
					new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
				)
			}))
			.sort((a, b) => b.date.localeCompare(a.date));
	}

	$: groupedSessions = groupSessionsByDate(workSessions);
</script>

<div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-100 sm:text-3xl">Work Sessions</h1>
			<p class="mt-2 text-sm text-slate-400 sm:text-base">
				Track and manage your deep work sessions
			</p>
		</div>
		<div class="flex gap-2">
			{#if activeWorkSession}
				<button
					type="button"
					class="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
					onclick={handleEndWork}
				>
					End Active Session
				</button>
			{:else}
				<button
					type="button"
					class="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
					onclick={handleStartWork}
				>
					Start Work Session
				</button>
			{/if}
		</div>
	</div>

	{#if errorMessage}
		<div class="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-6 py-5 text-rose-200">
			<h2 class="text-lg font-semibold">Error</h2>
			<p class="mt-2 text-sm">{errorMessage}</p>
		</div>
	{/if}

	{#if loading}
		<div class="flex min-h-[60vh] items-center justify-center">
			<div class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-sm text-slate-300">
				<span class="h-3 w-3 animate-ping rounded-full bg-emerald-400"></span>
				<span>Loading sessions...</span>
			</div>
		</div>
	{:else if summary && workSummary}
		<!-- Summary Stats -->
		<section class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-3">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Total Sessions</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
					{workSessions.length}
				</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Today's Time</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
					{formatMinutes(summary.todayMinutes)}
				</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Weekly Time</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
					{formatMinutes(summary.weeklyMinutes)}
				</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Monthly Time</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
					{formatMinutes(summary.monthlyMinutes)}
				</p>
			</div>
		</section>

		<!-- Active Session Banner -->
		{#if activeWorkSession}
			<div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 sm:px-6 sm:py-5">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex items-center gap-3">
						<div class="flex h-3 w-3 animate-pulse rounded-full bg-emerald-400"></div>
						<div>
							<h3 class="text-base font-semibold text-emerald-100 sm:text-lg">Active Work Session</h3>
							<p class="mt-1 text-sm text-emerald-200/80">
								Started {dayjs(activeWorkSession.startedAt).format('MMM D, HH:mm')} • 
								{dayjs().diff(dayjs(activeWorkSession.startedAt), 'minute')} minutes elapsed
							</p>
							{#if activeWorkSession.notes}
								<p class="mt-1 text-sm text-emerald-200/70">{activeWorkSession.notes}</p>
							{/if}
						</div>
					</div>
					<button
						type="button"
						class="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
						onclick={handleEndWork}
					>
						End Session
					</button>
				</div>
			</div>
		{/if}

		<!-- Sessions List -->
		<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4 lg:p-5">
			<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Session History</h2>
			{#if workSessions.length === 0}
				<div class="mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-400">
					No sessions logged yet. Start a work session to begin tracking your productivity.
				</div>
			{:else}
				<div class="mt-4 space-y-6">
					{#each groupedSessions as group}
						<div>
							<h3 class="mb-3 text-sm font-semibold text-slate-300">{group.dateFormatted}</h3>
							<ul class="space-y-2">
								{#each group.sessions as session}
									<li
										class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-4 transition hover:border-slate-700"
									>
										<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
											<div class="flex-1">
												<div class="flex items-center gap-2">
													<p class="text-sm font-semibold text-slate-100">
														{dayjs(session.startedAt).format('HH:mm')}
														{#if session.endedAt}
															<span class="text-slate-500"> - {dayjs(session.endedAt).format('HH:mm')}</span>
														{/if}
													</p>
													{#if !session.endedAt}
														<span
															class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300"
														>
															Active
														</span>
													{/if}
												</div>
												<p class="mt-1 text-xs text-slate-400">
													{session.notes ?? 'Focused work'}
												</p>
											</div>
											<div class="text-right sm:text-left">
												<p class="text-sm font-semibold text-white">
													{session.durationMinutes != null
														? formatMinutes(session.durationMinutes)
														: 'In progress'}
												</p>
												{#if session.endedAt}
													<p class="text-xs text-slate-500">
														Ended {dayjs(session.endedAt).fromNow()}
													</p>
												{/if}
											</div>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

