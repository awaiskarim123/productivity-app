<script lang="ts">
	import { fetchBurnoutSignal } from '$lib/api';
	import type { BurnoutSignal } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let signal: BurnoutSignal | null = null;
	let windowDays = 7;

	async function load() {
		loading = true;
		error = null;
		try {
			signal = await fetchBurnoutSignal(windowDays);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load burnout signal';
		} finally {
			loading = false;
		}
	}

	onMount(() => load());
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Burnout signal</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Long sessions + low completion</p>
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
	{:else if signal}
		{#if signal.atRisk}
			<div class="rounded-xl border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 p-3">
				<p class="text-sm font-medium text-amber-800 dark:text-amber-200">At risk</p>
				{#if signal.message}
					<p class="mt-1 text-xs text-amber-700 dark:text-amber-300">{signal.message}</p>
				{/if}
				<p class="mt-2 text-xs text-amber-600 dark:text-amber-400">
					Long sessions (≥60 min): {signal.longSessionsCount} · Completion: {(signal.completionRate * 100).toFixed(0)}%
				</p>
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3">
				<p class="text-sm font-medium text-emerald-700 dark:text-emerald-300">No burnout signal</p>
				<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">
					Long sessions: {signal.longSessionsCount} · Completion: {(signal.completionRate * 100).toFixed(0)}%
				</p>
			</div>
		{/if}
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">No data</p>
	{/if}
</div>
