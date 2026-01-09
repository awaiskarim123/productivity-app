<script lang="ts">
	import { fetchWeeklyInsights } from '$lib/api';
	import type { WeeklyInsight } from '$lib/types';
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';

	let loading = true;
	let error: string | null = null;
	let insights: WeeklyInsight | null = null;

	async function loadInsights() {
		loading = true;
		error = null;
		try {
			insights = await fetchWeeklyInsights();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load insights';
			console.error('Failed to load weekly insights:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadInsights();
	});

	function formatHour(hour: number): string {
		if (hour === 0) return '12 AM';
		if (hour < 12) return `${hour} AM`;
		if (hour === 12) return '12 PM';
		return `${hour - 12} PM`;
	}

	function getConfidenceColor(confidence: 'low' | 'medium' | 'high'): string {
		switch (confidence) {
			case 'high':
				return 'text-emerald-400';
			case 'medium':
				return 'text-yellow-400';
			case 'low':
				return 'text-slate-400';
		}
	}

	function getTrendIcon(trend: 'improving' | 'declining' | 'stable'): string {
		switch (trend) {
			case 'improving':
				return '📈';
			case 'declining':
				return '📉';
			case 'stable':
				return '➡️';
		}
	}
</script>

<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-slate-100 sm:text-lg">Weekly Insights</h2>
			<p class="mt-1 text-xs text-slate-400">AI-powered productivity analysis</p>
		</div>
		<button
			type="button"
			onclick={loadInsights}
			class="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700/50"
			title="Refresh insights"
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
		<div class="py-4 text-center text-sm text-slate-400">Loading insights...</div>
	{:else if insights}
		<div class="space-y-3">
			<!-- Peak Hours -->
			{#if insights.peakHours.length > 0}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">⏰</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-slate-100">Peak Productivity Hours</h3>
							<p class="mt-1 text-xs text-slate-300">
								You focus best between {insights.peakHours.map(h => formatHour(h)).join(', ')}. Schedule important work during these times.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Low Productivity Days -->
			{#if insights.lowProductivityDays.length > 0}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">📅</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-slate-100">Low Productivity Days</h3>
							<p class="mt-1 text-xs text-slate-300">
								{insights.lowProductivityDays.join(', ')} tend to be less productive. Consider planning lighter tasks or breaks on these days.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Week-over-Week Trend -->
			{#if insights.weekOverWeekTrend !== 'stable'}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">{getTrendIcon(insights.weekOverWeekTrend)}</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-slate-100">
								{insights.weekOverWeekTrend === 'improving' ? 'Productivity Improving' : 'Productivity Declining'}
							</h3>
							<p class="mt-1 text-xs text-slate-300">
								{insights.weekOverWeekTrend === 'improving'
									? 'Your productivity is up compared to last week. Keep up the momentum!'
									: 'Your productivity is down compared to last week. Consider reviewing your schedule.'}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Additional Insights -->
			{#each insights.insights.filter(i => !['peak_hours', 'low_productivity_days', 'trend'].includes(i.type)) as insight}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">💡</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-semibold text-slate-100">{insight.title}</h3>
								<span class="text-xs {getConfidenceColor(insight.confidence)}">
									{insight.confidence}
								</span>
							</div>
							<p class="mt-1 text-xs text-slate-300">{insight.description}</p>
						</div>
					</div>
				</div>
			{/each}

			<!-- Empty State -->
			{#if insights.insights.length === 0 && insights.peakHours.length === 0 && insights.lowProductivityDays.length === 0}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
					Not enough data yet. Keep tracking your sessions to get insights!
				</div>
			{/if}
		</div>
	{:else}
		<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
			No insights available
		</div>
	{/if}
</div>

