<script lang="ts">
	import FocusTimer from '$lib/components/FocusTimer.svelte';
	import WorkSummaryChart from '$lib/components/WorkSummaryChart.svelte';
	import {
		endFocusSession,
		endWorkSession,
		fetchActiveFocusSession,
		fetchAnalyticsOverview,
		fetchFocusStats,
		fetchMotivationQuote,
		fetchProfile,
		fetchWorkSessions,
		fetchWorkSummary,
		startFocusSession,
		startWorkSession
	} from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type {
		AnalyticsOverview,
		FocusSession,
		FocusStats,
		Quote,
		TimeSummary,
		User,
		WorkSession,
		WorkSummaryPoint
	} from '$lib/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';

dayjs.extend(relativeTime);

	let loading = true;
	let errorMessage: string | null = null;

	let profile: User | null = null;
	let summary: TimeSummary | null = null;
	let analytics: AnalyticsOverview | null = null;
	let focusStats: FocusStats | null = null;
	let workSessions: WorkSession[] = [];
	let workSummary: WorkSummaryPoint | null = null;
	let quote: Quote | null = null;
	let activeFocusSession: FocusSession | null = null;
	let selectedSummaryPeriod: 'daily' | 'weekly' | 'monthly' = 'daily';
	let activeWorkSession: WorkSession | null = null;

	async function loadDashboard() {
		loading = true;
		errorMessage = null;
		try {
			const [
				profileResponse,
				analyticsResponse,
				focusResponse,
				sessionsResponse,
				summaryResponse,
				quoteResponse,
				activeFocusResponse
			] = await Promise.all([
				fetchProfile(),
				fetchAnalyticsOverview(),
				fetchFocusStats(),
				fetchWorkSessions({ limit: 10 }),
				fetchWorkSummary(selectedSummaryPeriod),
				fetchMotivationQuote(),
				fetchActiveFocusSession()
			]);

			profile = profileResponse.profile;
			summary = profileResponse.summary;
			analytics = analyticsResponse;
			focusStats = focusResponse;
			workSessions = sessionsResponse.sessions;
			workSummary = summaryResponse;
			quote = quoteResponse.quote;
			activeFocusSession = activeFocusResponse.activeSession;

			activeWorkSession = workSessions.find((session) => session.endedAt === null) ?? null;

			if (profile) {
				authStore.setUser(profile);
			}
		} catch (error) {
			console.error(error);
			errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDashboard();
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
			await Promise.all([refreshSummary(selectedSummaryPeriod), refreshAnalytics()]);
		} catch (error) {
			console.error('Unable to end work session', error);
		}
	}

	async function refreshAnalytics() {
		try {
			[analytics, focusStats] = await Promise.all([
				fetchAnalyticsOverview(),
				fetchFocusStats()
			]);
		} catch (error) {
			console.error('Failed to refresh analytics', error);
		}
	}

	async function handleFocusStart(targetMinutes: number, notes?: string) {
		const response = await startFocusSession({
			mode: 'FOCUS',
			targetMinutes,
			notes
		});
		activeFocusSession = response.session;
		return response.session;
	}

	async function handleBreakStart(targetMinutes: number, notes?: string) {
		const response = await startFocusSession({
			mode: 'BREAK',
			targetMinutes,
			notes
		});
		activeFocusSession = response.session;
		return response.session;
	}

	async function handleFocusEnd(
		sessionId: string,
		payload: { completed: boolean; distractions: number; notes?: string }
	) {
		await endFocusSession({
			sessionId,
			completed: payload.completed,
			distractions: payload.distractions,
			notes: payload.notes
		});
		activeFocusSession = null;
		await refreshAnalytics();
	}

	const summaryPeriods: Array<{ label: string; value: 'daily' | 'weekly' | 'monthly' }> = [
		{ label: 'Last 7 days', value: 'daily' },
		{ label: 'Last 8 weeks', value: 'weekly' },
		{ label: 'Last 6 months', value: 'monthly' }
	];
</script>

{#if loading}
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-sm text-slate-300">
			<span class="h-3 w-3 animate-ping rounded-full bg-emerald-400"></span>
			<span>Loading dashboard...</span>
		</div>
	</div>
{:else if errorMessage}
	<div class="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-6 py-5 text-rose-200">
		<h2 class="text-lg font-semibold">Something went wrong</h2>
		<p class="mt-2 text-sm">{errorMessage}</p>
		<button
			class="mt-4 rounded-lg border border-rose-400/50 px-4 py-2 text-xs font-medium text-rose-100"
			type="button"
			onclick={loadDashboard}
		>
			Try again
		</button>
	</div>
{:else if profile && summary && analytics && focusStats && workSummary}
	<div class="space-y-10">
		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Today's focus</h3>
				<p class="mt-3 text-2xl font-semibold text-white">{formatMinutes(summary.todayMinutes)}</p>
				<p class="text-xs text-slate-500">Goal: {profile.dailyGoalMinutes} minutes</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Weekly progress</h3>
				<p class="mt-3 text-2xl font-semibold text-white">{formatMinutes(summary.weeklyMinutes)}</p>
				<p class="text-xs text-slate-500">Last 7 days of work</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Monthly output</h3>
				<p class="mt-3 text-2xl font-semibold text-white">{formatMinutes(summary.monthlyMinutes)}</p>
				<p class="text-xs text-slate-500">Steady habit is forming</p>
			</div>
			<div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
				<h3 class="text-xs font-medium uppercase tracking-wide text-emerald-200">Focus streak</h3>
				<p class="mt-3 text-2xl font-semibold text-emerald-100">{profile.focusStreak} days</p>
				<p class="text-xs text-emerald-200/70">Keep the momentum going</p>
			</div>
		</section>

		<section class="grid gap-6 lg:grid-cols-[1fr,420px]">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-slate-100">Focus trends</h2>
						<p class="text-sm text-slate-400">
							Monitor how your focus time evolves across chosen ranges
						</p>
					</div>
					<div class="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-1 py-1">
						{#each summaryPeriods as period}
							<button
								type="button"
								class={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedSummaryPeriod === period.value ? 'bg-emerald-500/30 text-emerald-100' : 'text-slate-400'}`}
								onclick={() => refreshSummary(period.value)}
							>
								{period.label}
							</button>
						{/each}
					</div>
				</div>
				<div class="mt-6">
					<WorkSummaryChart
						title="Focus minutes"
						labels={workSummary.summary.map((point) => dayjs(point.periodStart).format('MMM D'))}
						data={workSummary.summary.map((point) => point.minutes)}
						accentColor="#34d399"
					/>
				</div>
			</div>

			<div class="space-y-6">
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
					<h2 class="text-lg font-semibold text-slate-100">Motivation snapshot</h2>
					<p class="mt-4 text-sm text-slate-300">{quote?.text}</p>
					<p class="mt-2 text-xs uppercase tracking-wide text-slate-500">
						{quote?.author ?? 'Unknown'}
					</p>
				</div>

				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
					<h2 class="text-lg font-semibold text-slate-100">Focus stats</h2>
					<div class="mt-5 space-y-4">
						<div class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
							<span class="text-sm text-slate-400">Past {focusStats.rangeDays} days</span>
							<span class="text-sm font-semibold text-white">
								{formatMinutes(focusStats.totalFocusMinutes)}
							</span>
						</div>
						<div class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
							<span class="text-sm text-slate-400">Sessions completed</span>
							<span class="text-sm font-semibold text-white">
								{focusStats.completedSessions}/{focusStats.daily.length}
							</span>
						</div>
						<div class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
							<span class="text-sm text-slate-400">Average focus session</span>
							<span class="text-sm font-semibold text-white">
								{analytics.focus.averageFocusMinutes.toFixed(1)} min
							</span>
						</div>
						<div class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
							<span class="text-sm text-slate-400">Distractions tracked</span>
							<span class="text-sm font-semibold text-white">
								{analytics.focus.distractions}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="grid gap-6 lg:grid-cols-[1fr,420px]">
			<div class="space-y-6">
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 class="text-lg font-semibold text-slate-100">
								{activeWorkSession ? 'Active session' : 'Work sessions'}
							</h2>
							<p class="text-sm text-slate-400">
								Track deep work from start to finish
							</p>
						</div>
						<div class="flex gap-2">
							{#if activeWorkSession}
								<button
									type="button"
									class="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
									onclick={handleEndWork}
								>
									End session
								</button>
							{:else}
								<button
									type="button"
									class="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
									onclick={handleStartWork}
								>
									Start work
								</button>
							{/if}
						</div>
					</div>

					<ul class="mt-6 space-y-3">
						{#if workSessions.length === 0}
							<li class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-6 text-sm text-slate-400">
								No sessions logged yet. Start one to see your progress here.
							</li>
						{:else}
							{#each workSessions.slice(0, 8) as session}
								<li class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-4">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p class="text-sm font-semibold text-slate-100">
												{dayjs(session.startedAt).format('MMM D, HH:mm')}
											</p>
											<p class="text-xs text-slate-400">
												{session.notes ?? 'Focused work'}
											</p>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold text-white">
												{session.durationMinutes
													? formatMinutes(session.durationMinutes)
													: 'In progress'}
											</p>
											<p class="text-xs text-slate-500">
												{session.endedAt
													? `Ended ${dayjs(session.endedAt).fromNow()}`
													: 'Active now'}
											</p>
										</div>
									</div>
								</li>
							{/each}
						{/if}
					</ul>
				</div>

				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
					<h2 class="text-lg font-semibold text-slate-100">Productivity insights</h2>
					<ul class="mt-4 space-y-3">
						{#each analytics.suggestions as suggestion}
							<li class="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
								<span class="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
								<span>{suggestion}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<FocusTimer
				activeSession={activeFocusSession}
				onStartFocus={handleFocusStart}
				onStartBreak={handleBreakStart}
				onEndSession={handleFocusEnd}
			/>
		</section>
	</div>
{:else}
	<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-slate-300">
		Unable to load dashboard data.
	</div>
{/if}

