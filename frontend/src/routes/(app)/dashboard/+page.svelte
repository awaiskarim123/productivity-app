<script lang="ts">
	import FocusTimer from '$lib/components/FocusTimer.svelte';
	import WorkSummaryChart from '$lib/components/WorkSummaryChart.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import HabitTracker from '$lib/components/HabitTracker.svelte';
	import QuickNotes from '$lib/components/QuickNotes.svelte';
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
		startWorkSession,
		updateProfile
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

	let editingDailyGoal = false;
	let newDailyGoal = 300;
	let goalUpdateError: string | null = null;

	function startEditingGoal() {
		if (profile) {
			newDailyGoal = profile.dailyGoalMinutes;
			editingDailyGoal = true;
			goalUpdateError = null;
		}
	}

	function cancelEditingGoal() {
		editingDailyGoal = false;
		goalUpdateError = null;
	}

	async function saveDailyGoal() {
		if (!profile) return;
		
		if (newDailyGoal < 30 || newDailyGoal > 1440) {
			goalUpdateError = 'Daily goal must be between 30 and 1440 minutes';
			return;
		}

		try {
			const response = await updateProfile({ dailyGoalMinutes: newDailyGoal });
			profile = response.profile;
			authStore.setUser(response.profile);
			editingDailyGoal = false;
			goalUpdateError = null;
		} catch (error) {
			goalUpdateError = error instanceof Error ? error.message : 'Failed to update daily goal';
		}
	}
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
	<div class="space-y-2 sm:space-y-3 lg:space-y-4">
		<section class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-3">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<div class="flex items-start justify-between">
					<div class="flex-1 min-w-0">
						<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Today's focus</h3>
						<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{formatMinutes(summary.todayMinutes)}</p>
						{#if editingDailyGoal}
							<div class="mt-2 space-y-2">
								<input
									type="number"
									bind:value={newDailyGoal}
									min="30"
									max="1440"
									class="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
									placeholder="Minutes"
									onkeydown={(e) => e.key === 'Enter' && saveDailyGoal()}
								/>
								{#if goalUpdateError}
									<p class="text-xs text-rose-400">{goalUpdateError}</p>
								{/if}
								<div class="flex gap-2">
									<button
										type="button"
										onclick={saveDailyGoal}
										class="flex-1 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-400"
									>
										Save
									</button>
									<button
										type="button"
										onclick={cancelEditingGoal}
										class="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
									>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<div class="mt-2 flex items-center gap-2">
								<p class="text-xs text-slate-500">Goal: {profile.dailyGoalMinutes} minutes</p>
								<button
									type="button"
									onclick={startEditingGoal}
									class="text-xs text-emerald-400 hover:text-emerald-300 transition"
									title="Edit daily goal"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-3.5 w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Weekly progress</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{formatMinutes(summary.weeklyMinutes)}</p>
				<p class="mt-1 text-xs text-slate-500">Last 7 days of work</p>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-slate-400">Monthly output</h3>
				<p class="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{formatMinutes(summary.monthlyMinutes)}</p>
				<p class="mt-1 text-xs text-slate-500">Steady habit is forming</p>
			</div>
			<div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 sm:px-4 sm:py-3">
				<h3 class="text-xs font-medium uppercase tracking-wide text-emerald-200">Focus streak</h3>
				<p class="mt-2 text-xl font-semibold text-emerald-100 sm:mt-3 sm:text-2xl">{profile.focusStreak} days</p>
				<p class="mt-1 text-xs text-emerald-200/70">Keep the momentum going</p>
			</div>
		</section>

		<!-- Focus Timer Section - Prominent placement -->
		<section class="grid gap-2 sm:gap-3 lg:grid-cols-[1.2fr,0.8fr] lg:gap-3">
			<FocusTimer
				activeSession={activeFocusSession}
				onStartFocus={handleFocusStart}
				onStartBreak={handleBreakStart}
				onEndSession={handleFocusEnd}
			/>

			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3 lg:p-4">
				<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Focus stats</h2>
				<div class="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
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
		</section>

		<!-- Focus Trends and Motivation Section - Side by side -->
		<section class="grid gap-2 sm:gap-3 lg:grid-cols-[1fr,400px] lg:gap-3">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3 lg:p-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Focus trends</h2>
						<p class="mt-1 text-xs text-slate-400 sm:text-sm">
							Monitor how your focus time evolves across chosen ranges
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-1 py-1">
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
				<div class="mt-3 sm:mt-4">
					<WorkSummaryChart
						title="Focus minutes"
						labels={workSummary.summary.map((point) => dayjs(point.periodStart).format('MMM D'))}
						data={workSummary.summary.map((point) => point.minutes)}
						accentColor="#34d399"
					/>
				</div>
			</div>

			<div class="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-900/70 p-3 sm:p-4 lg:p-5">
				<div class="flex items-start gap-3">
					<div class="flex-shrink-0 mt-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-emerald-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<h2 class="text-sm font-semibold text-emerald-100 sm:text-base">Daily motivation</h2>
						<blockquote class="mt-3">
							<p class="text-sm leading-relaxed text-slate-200 sm:text-base">
								"{quote?.text}"
							</p>
						</blockquote>
						<cite class="mt-3 block not-italic">
							<span class="text-xs font-medium text-emerald-300/80 sm:text-sm">
								— {quote?.author ?? 'Unknown'}
							</span>
						</cite>
					</div>
				</div>
			</div>
		</section>

		<!-- Work Sessions and Insights Section -->
		<section class="grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-3">
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3 lg:p-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 class="text-base font-semibold text-slate-100 sm:text-lg">
							{activeWorkSession ? 'Active session' : 'Work sessions'}
						</h2>
						<p class="mt-1 text-xs text-slate-400 sm:text-sm">
							Track deep work from start to finish
						</p>
					</div>
					<div class="flex gap-2 sm:flex-shrink-0">
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

				<ul class="mt-3 space-y-2 sm:mt-4 sm:space-y-2">
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
											{session.durationMinutes != null
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

			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3 lg:p-4">
				<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Productivity insights</h2>
				<ul class="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
					{#each analytics.suggestions as suggestion}
						<li class="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
							<span class="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
							<span>{suggestion}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- New Features: Tasks, Habits, and Notes -->
		<section class="grid gap-2 sm:gap-3 lg:grid-cols-3 lg:gap-3">
			<TaskList limit={5} />
			<HabitTracker limit={5} />
			<QuickNotes limit={5} />
		</section>
	</div>
{:else}
	<div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-slate-300">
		Unable to load dashboard data.
	</div>
{/if}

