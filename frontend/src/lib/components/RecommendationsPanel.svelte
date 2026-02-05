<script lang="ts">
	import { fetchRecommendations } from '$lib/api';
	import type { RecommendationsResponse } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let recommendations: RecommendationsResponse | null = null;

	async function loadRecommendations() {
		loading = true;
		error = null;
		try {
			recommendations = await fetchRecommendations();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load recommendations';
			console.error('Failed to load recommendations:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadRecommendations();
	});

	function getConfidenceColor(confidence: 'low' | 'medium' | 'high'): string {
		switch (confidence) {
			case 'high':
				return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
			case 'medium':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
			case 'low':
				return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
		}
	}

	function getConfidenceLabel(confidence: 'low' | 'medium' | 'high'): string {
		switch (confidence) {
			case 'high':
				return 'High confidence';
			case 'medium':
				return 'Medium confidence';
			case 'low':
				return 'Low confidence';
		}
	}

	function getRecommendationIcon(type: string): string {
		switch (type) {
			case 'focus_duration':
				return '⏱️';
			case 'focus_target':
				return '🎯';
			case 'daily_goal':
				return '📊';
			case 'break_timing':
				return '☕';
			default:
				return '💡';
		}
	}
</script>

<div class="min-w-0 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Recommendations</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Personalized suggestions for you</p>
		</div>
		<button
			type="button"
			onclick={loadRecommendations}
			class="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-100 dark:hover:bg-slate-700/50"
			title="Refresh recommendations"
		>
			↻
		</button>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading recommendations...</div>
	{:else if recommendations && recommendations.recommendations.length > 0}
		<div class="space-y-3">
			{#each recommendations.recommendations as recommendation}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<div class="flex items-start gap-3">
						<span class="text-lg">{getRecommendationIcon(recommendation.type)}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2">
								<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">{recommendation.title}</h3>
								<span
									class="rounded-full border px-2 py-0.5 text-xs font-medium {getConfidenceColor(
										recommendation.confidence
									)}"
									title={getConfidenceLabel(recommendation.confidence)}
								>
									{recommendation.confidence}
								</span>
							</div>
							<p class="mt-1.5 text-xs leading-relaxed text-gray-700 dark:text-slate-300">{recommendation.description}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
			No recommendations at this time. Keep tracking to get personalized suggestions!
		</div>
	{/if}
</div>

