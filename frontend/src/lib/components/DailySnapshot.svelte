<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchDailySummary } from '$lib/api';
	import type { DailySummary } from '$lib/types';

	let summary: DailySummary | null = null;
	let loading = true;
	let error: string | null = null;

	function load() {
		loading = true;
		error = null;
		fetchDailySummary()
			.then((data) => {
				summary = data;
			})
			.catch((err) => {
				error = err instanceof Error ? err.message : 'Failed to load summary';
			})
			.finally(() => {
				loading = false;
			});
	}

	onMount(load);
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3">
		<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Today at a glance</h2>
		<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Your productivity snapshot for today</p>
	</div>

	{#if error}
		<div class="rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{:else if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading...</div>
	{:else if summary}
		<div class="space-y-4">
			<div class="grid grid-cols-3 gap-2 text-center">
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<p class="text-xl font-bold text-gray-900 dark:text-slate-100">{summary.tasksCompletedToday}</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Tasks done</p>
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<p class="text-xl font-bold text-gray-900 dark:text-slate-100">{summary.focusMinutesToday}</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Focus min</p>
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<p class="text-xl font-bold text-gray-900 dark:text-slate-100">{summary.habitsLoggedToday}</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Habits</p>
				</div>
			</div>

			<div>
				<div class="mb-1 flex justify-between text-xs text-gray-600 dark:text-slate-400">
					<span>Daily focus goal</span>
					<span>{summary.focusMinutesToday} / {summary.dailyGoalMinutes} min</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
					<div
						class="h-full rounded-full bg-emerald-500 dark:bg-emerald-500/90 transition-all duration-300"
						style="width: {Math.min(100, summary.goalProgressPercent)}%"
					></div>
				</div>
			</div>

			{#if summary.focusStreak > 0}
				<p class="text-xs text-gray-600 dark:text-slate-400">
					<span class="font-medium text-emerald-600 dark:text-emerald-400">{summary.focusStreak}</span>
					day focus streak
				</p>
			{/if}
		</div>
	{/if}
</div>
