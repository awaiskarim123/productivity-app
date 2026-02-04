<script lang="ts">
	import { fetchProductivityScore } from '$lib/api';
	import type { ProductivityScore as ProductivityScoreType } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let scoreData: ProductivityScoreType | null = null;
	let periodDays = 7;

	async function load() {
		loading = true;
		error = null;
		try {
			scoreData = await fetchProductivityScore(periodDays);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load score';
		} finally {
			loading = false;
		}
	}

	onMount(() => load());

	function scoreColor(score: number): string {
		if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
		if (score >= 40) return 'text-amber-600 dark:text-amber-400';
		return 'text-rose-600 dark:text-rose-400';
	}
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Productivity score</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Weighted: focus, completion, consistency, tasks</p>
		</div>
		<div class="flex items-center gap-2">
			<select
				bind:value={periodDays}
				onchange={load}
				class="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-2 py-1 text-xs text-gray-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value={7}>7 days</option>
				<option value={14}>14 days</option>
				<option value={30}>30 days</option>
			</select>
			<button
				type="button"
				onclick={load}
				class="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
			>
				↻
			</button>
		</div>
	</div>

	{#if error}
		<p class="text-sm text-rose-600 dark:text-rose-400">{error}</p>
	{:else if loading}
		<div class="text-sm text-gray-500 dark:text-slate-400">Loading...</div>
	{:else if scoreData}
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
			<div class="flex flex-shrink-0 items-center justify-center">
				<div
					class="flex h-20 w-20 rounded-full border-4 border-emerald-200 dark:border-emerald-500/40 flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-500/10"
					aria-label="Productivity score {scoreData.score}"
				>
					<span class="text-2xl font-bold {scoreColor(scoreData.score)}">{scoreData.score}</span>
					<span class="text-[10px] text-gray-500 dark:text-slate-400">/ 100</span>
				</div>
			</div>
			<div class="min-w-0 flex-1 space-y-2">
				<div>
					<div class="flex justify-between text-xs text-gray-600 dark:text-slate-400">
						<span>Focus time</span>
						<span>{scoreData.breakdown.focusTime}%</span>
					</div>
					<div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
						<div
							class="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
							style="width: {Math.min(100, scoreData.breakdown.focusTime)}%"
						></div>
					</div>
				</div>
				<div>
					<div class="flex justify-between text-xs text-gray-600 dark:text-slate-400">
						<span>Completion rate</span>
						<span>{scoreData.breakdown.completionRate}%</span>
					</div>
					<div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
						<div
							class="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
							style="width: {Math.min(100, scoreData.breakdown.completionRate)}%"
						></div>
					</div>
				</div>
				<div>
					<div class="flex justify-between text-xs text-gray-600 dark:text-slate-400">
						<span>Consistency (streak)</span>
						<span>{scoreData.breakdown.consistency}%</span>
					</div>
					<div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
						<div
							class="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
							style="width: {Math.min(100, scoreData.breakdown.consistency)}%"
						></div>
					</div>
				</div>
				<div>
					<div class="flex justify-between text-xs text-gray-600 dark:text-slate-400">
						<span>Task completion</span>
						<span>{scoreData.breakdown.taskCompletion}%</span>
					</div>
					<div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
						<div
							class="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
							style="width: {Math.min(100, scoreData.breakdown.taskCompletion)}%"
						></div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">No data</p>
	{/if}
</div>
