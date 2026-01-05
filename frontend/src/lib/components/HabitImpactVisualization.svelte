<script lang="ts">
	import { fetchRecommendations } from '$lib/api';
	import type { RecommendationsResponse } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let habitCorrelations: RecommendationsResponse['habitCorrelations'] = [];

	async function loadHabitCorrelations() {
		loading = true;
		error = null;
		try {
			const response = await fetchRecommendations();
			habitCorrelations = response.habitCorrelations || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load habit correlations';
			console.error('Failed to load habit correlations:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadHabitCorrelations();
	});

	function getImpactColor(impact: 'positive' | 'neutral' | 'negative'): string {
		switch (impact) {
			case 'positive':
				return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
			case 'negative':
				return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
			case 'neutral':
				return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
		}
	}

	function getImpactIcon(impact: 'positive' | 'neutral' | 'negative'): string {
		switch (impact) {
			case 'positive':
				return '↑';
			case 'negative':
				return '↓';
			case 'neutral':
				return '→';
		}
	}

	function getImpactLabel(impact: 'positive' | 'neutral' | 'negative'): string {
		switch (impact) {
			case 'positive':
				return 'Positive impact';
			case 'negative':
				return 'Negative impact';
			case 'neutral':
				return 'Neutral impact';
		}
	}

	$: positiveHabits = habitCorrelations.filter((h) => h.impact === 'positive');
	$: negativeHabits = habitCorrelations.filter((h) => h.impact === 'negative');
	$: neutralHabits = habitCorrelations.filter((h) => h.impact === 'neutral');
</script>

<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Habit Impact</h2>
			<p class="mt-1 text-xs text-slate-400">How your habits affect productivity</p>
		</div>
		<button
			type="button"
			onclick={loadHabitCorrelations}
			class="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700/50"
			title="Refresh habit impact"
		>
			↻
		</button>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="py-4 text-center text-sm text-slate-400">Loading habit impact...</div>
	{:else if habitCorrelations.length > 0}
		<div class="space-y-3">
			<!-- Positive Impact Habits -->
			{#if positiveHabits.length > 0}
				<div>
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
						Positive Impact ({positiveHabits.length})
					</h3>
					<div class="space-y-2">
						{#each positiveHabits as habit}
							<div class="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-emerald-300">{getImpactIcon(habit.impact)}</span>
									<span class="text-sm text-slate-100">{habit.habitName}</span>
								</div>
								<span class="text-xs text-emerald-300">+{Math.abs(habit.correlationScore * 100).toFixed(0)}%</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Negative Impact Habits -->
			{#if negativeHabits.length > 0}
				<div>
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-rose-400">
						Negative Impact ({negativeHabits.length})
					</h3>
					<div class="space-y-2">
						{#each negativeHabits as habit}
							<div class="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-rose-300">{getImpactIcon(habit.impact)}</span>
									<span class="text-sm text-slate-100">{habit.habitName}</span>
								</div>
								<span class="text-xs text-rose-300">{habit.correlationScore * 100 < 0 ? '' : '-'}{Math.abs(habit.correlationScore * 100).toFixed(0)}%</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Neutral Impact Habits -->
			{#if neutralHabits.length > 0}
				<div>
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
						Neutral Impact ({neutralHabits.length})
					</h3>
					<div class="space-y-2">
						{#each neutralHabits as habit}
							<div class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-2">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-slate-400">{getImpactIcon(habit.impact)}</span>
									<span class="text-sm text-slate-300">{habit.habitName}</span>
								</div>
								<span class="text-xs text-slate-400">~0%</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
			No habit correlation data available. Complete habits and work sessions to see impact analysis.
		</div>
	{/if}
</div>

