<script lang="ts">
	import { fetchFocusHeatmap } from '$lib/api';
	import type { FocusHeatmap as FocusHeatmapType } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let heatmap: FocusHeatmapType | null = null;
	let daysBack = 14;

	async function load() {
		loading = true;
		error = null;
		try {
			heatmap = await fetchFocusHeatmap(daysBack);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load heatmap';
		} finally {
			loading = false;
		}
	}

	onMount(() => load());

	function getCellMinutes(dayIndex: number, hour: number): number {
		if (!heatmap) return 0;
		const c = heatmap.cells.find((x) => x.dayIndex === dayIndex && x.hour === hour);
		return c?.minutes ?? 0;
	}

	function getIntensity(minutes: number): number {
		if (minutes <= 0) return 0;
		const max = 60;
		return Math.min(1, minutes / max);
	}
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Focus by hour & day</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">When you focus most (heatmap)</p>
		</div>
		<div class="flex items-center gap-2">
			<select
				bind:value={daysBack}
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
		<div class="flex h-48 items-center justify-center text-sm text-gray-500 dark:text-slate-400">Loading heatmap...</div>
	{:else if heatmap}
		{@const totalMinutes = heatmap.cells.reduce((s, c) => s + c.minutes, 0)}
		{#if totalMinutes === 0}
			<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/40 py-10 px-4 text-center">
				<span class="text-3xl text-gray-400 dark:text-slate-500" aria-hidden="true">📊</span>
				<p class="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300">No focus data yet</p>
				<p class="mt-1 max-w-xs text-xs text-gray-500 dark:text-slate-400">
					Complete focus sessions from the Dashboard or Work Sessions to see when you focus most.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<div class="inline-block min-w-0">
					<!-- Hour labels (0–23) -->
					<div class="mb-1 flex gap-px pl-8 text-[10px] text-gray-500 dark:text-slate-500">
						{#each heatmap.hours as hour}
							{#if hour % 3 === 0}
								<span class="w-3 flex-shrink-0 text-center">{hour}</span>
							{:else}
								<span class="w-3 flex-shrink-0"></span>
							{/if}
						{/each}
					</div>
					<!-- Rows: day label + cells -->
					{#each heatmap.days as day, dayIndex}
						<div class="flex items-center gap-1">
							<span class="w-6 flex-shrink-0 text-xs text-gray-600 dark:text-slate-400">{day}</span>
							<div class="flex gap-px">
								{#each heatmap.hours as hour}
									{@const minutes = getCellMinutes(dayIndex, hour)}
									{@const intensity = getIntensity(minutes)}
									<div
										class="h-3 w-3 flex-shrink-0 rounded-sm transition-colors"
										style="background-color: rgba(52, 211, 153, {intensity * 0.15 + 0.08});"
										title="{day} {hour}:00 — {minutes} min"
										role="img"
										aria-label="{day} {hour}:00 {minutes} minutes"
									></div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<p class="mt-2 text-[10px] text-gray-500 dark:text-slate-500">Lighter = less focus, darker = more (max ~60 min/cell)</p>
		{/if}
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">No data</p>
	{/if}
</div>
