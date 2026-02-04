<script lang="ts">
	import { fetchComparePeriods } from '$lib/api';
	import type { PeriodComparison as PeriodComparisonType } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let comparison: PeriodComparisonType | null = null;

	async function load() {
		loading = true;
		error = null;
		try {
			comparison = await fetchComparePeriods();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load comparison';
		} finally {
			loading = false;
		}
	}

	onMount(() => load());

	function formatMinutes(m: number) {
		const h = Math.floor(m / 60);
		const r = m % 60;
		return h === 0 ? `${m}m` : `${h}h ${r}m`;
	}

	function deltaClass(value: number): string {
		if (value > 0) return 'text-emerald-600 dark:text-emerald-400';
		if (value < 0) return 'text-rose-600 dark:text-rose-400';
		return 'text-gray-500 dark:text-slate-400';
	}

	function deltaSign(value: number): string {
		if (value > 0) return '+';
		if (value < 0) return '';
		return '';
	}
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">This week vs last week</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Focus time, completion & tasks</p>
		</div>
		<button
			type="button"
			onclick={load}
			class="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
		>
			↻
		</button>
	</div>

	{#if error}
		<p class="text-sm text-rose-600 dark:text-rose-400">{error}</p>
	{:else if loading}
		<div class="text-sm text-gray-500 dark:text-slate-400">Loading...</div>
	{:else if comparison}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">This week</h3>
				<p class="mt-1 text-lg font-semibold text-gray-900 dark:text-slate-100">{formatMinutes(comparison.thisWeek.focusMinutes)}</p>
				<p class="text-xs text-gray-600 dark:text-slate-400">
					{comparison.thisWeek.completedSessions}/{comparison.thisWeek.totalSessions} sessions · {comparison.thisWeek.taskCompleted}/{comparison.thisWeek.taskTotal} tasks
				</p>
			</div>
			<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Last week</h3>
				<p class="mt-1 text-lg font-semibold text-gray-900 dark:text-slate-100">{formatMinutes(comparison.lastWeek.focusMinutes)}</p>
				<p class="text-xs text-gray-600 dark:text-slate-400">
					{comparison.lastWeek.completedSessions}/{comparison.lastWeek.totalSessions} sessions · {comparison.lastWeek.taskCompleted}/{comparison.lastWeek.taskTotal} tasks
				</p>
			</div>
		</div>
		<div class="mt-3 flex flex-wrap gap-3 border-t border-gray-200 dark:border-slate-800 pt-3">
			<span class="text-sm {deltaClass(comparison.delta.focusMinutes)}">
				Focus: {deltaSign(comparison.delta.focusMinutes)}{comparison.delta.focusMinutes} min
				({deltaSign(comparison.delta.focusMinutesPercent)}{comparison.delta.focusMinutesPercent.toFixed(0)}%)
			</span>
			<span class="text-sm {deltaClass(comparison.delta.completionRateChange)}">
				Completion: {deltaSign(comparison.delta.completionRateChange)}{comparison.delta.completionRateChange.toFixed(1)}%
			</span>
			<span class="text-sm {deltaClass(comparison.delta.taskCompletionChange)}">
				Tasks: {deltaSign(comparison.delta.taskCompletionChange)}{comparison.delta.taskCompletionChange.toFixed(1)}%
			</span>
		</div>
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">No data</p>
	{/if}
</div>
