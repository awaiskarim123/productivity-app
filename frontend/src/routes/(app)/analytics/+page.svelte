<script lang="ts">
	import FocusHeatmap from '$lib/components/FocusHeatmap.svelte';
	import BurnoutCard from '$lib/components/BurnoutCard.svelte';
	import ProductivityScoreCard from '$lib/components/ProductivityScoreCard.svelte';
	import PeriodComparison from '$lib/components/PeriodComparison.svelte';
	import WeeklyInsights from '$lib/components/WeeklyInsights.svelte';
	import RecommendationsPanel from '$lib/components/RecommendationsPanel.svelte';
	import HabitImpactVisualization from '$lib/components/HabitImpactVisualization.svelte';
	import {
		fetchAnalyticsOverview,
		fetchProductivityScore,
		fetchBurnoutSignal,
		fetchComparePeriods
	} from '$lib/api';
	import { onMount } from 'svelte';

	let metricsLoading = true;
	let metricsError: string | null = null;
	let overview: Awaited<ReturnType<typeof fetchAnalyticsOverview>> | null = null;
	let score: Awaited<ReturnType<typeof fetchProductivityScore>> | null = null;
	let burnout: Awaited<ReturnType<typeof fetchBurnoutSignal>> | null = null;
	let comparison: Awaited<ReturnType<typeof fetchComparePeriods>> | null = null;

	async function loadMetrics() {
		metricsLoading = true;
		metricsError = null;
		try {
			const [overviewRes, scoreRes, burnoutRes, comparisonRes] = await Promise.all([
				fetchAnalyticsOverview(),
				fetchProductivityScore(7),
				fetchBurnoutSignal(7),
				fetchComparePeriods()
			]);
			overview = overviewRes;
			score = scoreRes;
			burnout = burnoutRes;
			comparison = comparisonRes;
		} catch (err) {
			metricsError = err instanceof Error ? err.message : 'Failed to load metrics';
		} finally {
			metricsLoading = false;
		}
	}

	onMount(() => loadMetrics());

	function formatMinutes(m: number): string {
		const h = Math.floor(m / 60);
		const r = m % 60;
		return h === 0 ? `${m}m` : `${h}h ${r}m`;
	}

	function scoreColor(s: number): string {
		if (s >= 70) return 'text-emerald-600 dark:text-emerald-400';
		if (s >= 40) return 'text-amber-600 dark:text-amber-400';
		return 'text-rose-600 dark:text-rose-400';
	}

	function trendLabel(): string {
		if (!comparison) return '—';
		const p = comparison.delta.focusMinutesPercent;
		if (p > 5) return '↑ Up';
		if (p < -5) return '↓ Down';
		return '→ Stable';
	}

	function trendClass(): string {
		if (!comparison) return 'text-gray-500 dark:text-slate-400';
		const p = comparison.delta.focusMinutesPercent;
		if (p > 5) return 'text-emerald-600 dark:text-emerald-400';
		if (p < -5) return 'text-rose-600 dark:text-rose-400';
		return 'text-gray-500 dark:text-slate-400';
	}
</script>

<div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
	<!-- Page header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Analytics</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-slate-400 sm:text-base">
				Focus heatmaps, burnout signals, productivity score, and period comparison
			</p>
		</div>
		<button
			type="button"
			onclick={loadMetrics}
			disabled={metricsLoading}
			class="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 {metricsLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
			{metricsLoading ? 'Loading…' : 'Refresh metrics'}
		</button>
	</div>

	<!-- Key metrics strip -->
	<section class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
		{#if metricsError}
			<div class="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
				{metricsError}
			</div>
		{:else if metricsLoading}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
				{#each [1, 2, 3, 4] as _}
					<div class="h-20 rounded-xl bg-gray-100 dark:bg-slate-800/50 animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Productivity score</p>
					<p class="mt-1 text-xl font-bold {score != null ? scoreColor(score.score) : 'text-gray-900 dark:text-slate-100'}">
						{score != null ? score.score : '—'}<span class="text-sm font-normal text-gray-500 dark:text-slate-400">/100</span>
					</p>
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">This week</p>
					<p class="mt-1 text-xl font-bold text-gray-900 dark:text-slate-100">
						{overview != null ? formatMinutes(overview.summary.weeklyMinutes) : '—'}
					</p>
					<p class="text-xs text-gray-500 dark:text-slate-400">focus</p>
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Burnout</p>
					<p class="mt-1 text-lg font-semibold {burnout?.atRisk ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}">
						{burnout != null ? (burnout.atRisk ? 'At risk' : 'OK') : '—'}
					</p>
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Week trend</p>
					<p class="mt-1 text-lg font-semibold {trendClass()}">
						{trendLabel()}
					</p>
					{#if comparison != null && Math.abs(comparison.delta.focusMinutesPercent) >= 1}
						<p class="text-xs text-gray-500 dark:text-slate-400">
							{comparison.delta.focusMinutes >= 0 ? '+' : ''}{comparison.delta.focusMinutes} min
						</p>
					{/if}
				</div>
			</div>
		{/if}
	</section>

	<!-- Focus & productivity -->
	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<div>
				<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Focus & productivity</h2>
				<p class="text-xs text-gray-600 dark:text-slate-400">Heatmap, burnout signal, score, and week-over-week comparison</p>
			</div>
		</div>
		<div class="grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-3">
			<FocusHeatmap />
			<div class="grid gap-2 sm:gap-3 sm:grid-cols-2">
				<BurnoutCard />
				<ProductivityScoreCard />
			</div>
			<div class="lg:col-span-2">
				<PeriodComparison />
			</div>
		</div>
	</section>

	<!-- Insights & recommendations -->
	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
			</div>
			<div>
				<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Insights & recommendations</h2>
				<p class="text-xs text-gray-600 dark:text-slate-400">Weekly patterns and personalized suggestions</p>
			</div>
		</div>
		<div class="grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-3">
			<WeeklyInsights />
			<RecommendationsPanel />
		</div>
	</section>

	<!-- Habit impact -->
	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
				</svg>
			</div>
			<div>
				<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Habit impact</h2>
				<p class="text-xs text-gray-600 dark:text-slate-400">How habits correlate with your productivity</p>
			</div>
		</div>
		<HabitImpactVisualization />
	</section>
</div>
