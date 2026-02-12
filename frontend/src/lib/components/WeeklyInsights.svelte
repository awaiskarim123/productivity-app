<script lang="ts">
	import { fetchWeeklyInsights } from '$lib/api';
	import type { WeeklyInsight } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;
	let insights: WeeklyInsight | null = null;

	type WeekOption = 'this' | 'last' | 'two-ago';
	let selectedWeek: WeekOption = 'this';

	function getWeekStartISO(option: WeekOption): string | undefined {
		if (option === 'this') return undefined;
		const d = new Date();
		d.setDate(d.getDate() - (option === 'last' ? 7 : 14));
		return d.toISOString().slice(0, 10);
	}

	function weekLabel(option: WeekOption): string {
		switch (option) {
			case 'this':
				return 'This week';
			case 'last':
				return 'Last week';
			case 'two-ago':
				return '2 weeks ago';
		}
	}

	async function loadInsights() {
		loading = true;
		error = null;
		try {
			insights = await fetchWeeklyInsights(getWeekStartISO(selectedWeek));
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

	function onWeekChange() {
		loadInsights();
	}

	function formatHour(hour: number): string {
		if (hour === 0) return '12 AM';
		if (hour < 12) return `${hour} AM`;
		if (hour === 12) return '12 PM';
		return `${hour - 12} PM`;
	}

	function getConfidenceColor(confidence: 'low' | 'medium' | 'high'): string {
		switch (confidence) {
			case 'high':
				return 'text-emerald-600 dark:text-emerald-400';
			case 'medium':
				return 'text-yellow-600 dark:text-yellow-400';
			case 'low':
				return 'text-gray-500 dark:text-slate-400';
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

	/** Cluster consecutive hours, format each cluster as "start – end" or single hour, return comma-separated list. */
	function bestFocusWindow(peakHours: number[]): string {
		if (peakHours.length === 0) return '';
		const sorted = [...new Set(peakHours)].sort((a, b) => a - b);
		const clusters: number[][] = [];
		let current: number[] = [];
		for (const h of sorted) {
			if (current.length === 0 || h === current[current.length - 1]! + 1) {
				current.push(h);
			} else {
				clusters.push(current);
				current = [h];
			}
		}
		if (current.length > 0) clusters.push(current);
		const formatted = clusters.map((c) => {
			if (c.length === 1) return formatHour(c[0]!);
			return `${formatHour(c[0]!)} – ${formatHour(c[c.length - 1]!)}`;
		});
		return formatted.join(', ');
	}

	function getImpactColor(impact: 'positive' | 'neutral' | 'negative'): string {
		switch (impact) {
			case 'positive':
				return 'text-emerald-600 dark:text-emerald-400';
			case 'negative':
				return 'text-rose-600 dark:text-rose-400';
			case 'neutral':
				return 'text-gray-500 dark:text-slate-400';
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

	function formatWeekRangeLabel(weekStart: string | undefined, weekEnd: string | undefined): string | null {
		if (!weekStart || !weekEnd) return null;
		const startDate = new Date(weekStart);
		const endDate = new Date(weekEnd);
		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
		const startStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
		const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
		return `${startStr} – ${endStr}`;
	}
</script>

<div class="min-w-0 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Weekly Insights</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Productivity patterns and habits</p>
		</div>
		<div class="flex items-center gap-2">
			<select
				class="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
				bind:value={selectedWeek}
				onchange={onWeekChange}
				disabled={loading}
				aria-label="Select week"
			>
				<option value="this">This week</option>
				<option value="last">Last week</option>
				<option value="two-ago">2 weeks ago</option>
			</select>
			<button
				type="button"
				onclick={loadInsights}
				disabled={loading}
				class="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-100 dark:hover:bg-slate-700/50 disabled:opacity-50"
				title="Refresh insights"
			>
				↻
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading insights...</div>
	{:else if insights}
		<div class="space-y-3">
			<!-- Week label (for past weeks) -->
			{#if selectedWeek !== 'this'}
				{@const weekLabelStr = formatWeekRangeLabel(insights.weekStart, insights.weekEnd)}
				{#if weekLabelStr}
					<p class="text-xs text-gray-500 dark:text-slate-400">
						Week of {weekLabelStr}
					</p>
				{/if}
			{/if}

			<!-- Quick stats -->
			<div class="grid grid-cols-3 gap-2 rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
				<div class="text-center">
					<p class="text-lg font-bold tabular-nums text-gray-900 dark:text-slate-100">{insights.totalSessions}</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Sessions</p>
				</div>
				<div class="text-center border-x border-gray-200 dark:border-slate-700">
					<p class="text-lg font-bold tabular-nums text-gray-900 dark:text-slate-100">{Math.round(insights.averageDailyMinutes)}</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Avg min/day</p>
				</div>
				<div class="text-center">
					<p class="text-lg font-bold tabular-nums text-gray-900 dark:text-slate-100">
						{insights.totalSessions > 0
							? Math.round((insights.completedFocusSessions / insights.totalSessions) * 100)
							: 0}%
					</p>
					<p class="text-xs text-gray-600 dark:text-slate-400">Completed</p>
				</div>
			</div>

			<!-- Best focus window -->
			{#if insights.peakHours.length > 0 && bestFocusWindow(insights.peakHours)}
				<div class="rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 p-3">
					<div class="flex items-center gap-2">
						<span class="text-lg">🎯</span>
						<div>
							<h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Best focus window</h3>
							<p class="text-xs text-emerald-700 dark:text-emerald-300">
								{bestFocusWindow(insights.peakHours)} — schedule deep work in this window.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Peak Hours -->
			{#if insights.peakHours.length > 0}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">⏰</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">Peak Productivity Hours</h3>
							<p class="mt-1 text-xs text-gray-700 dark:text-slate-300">
								You focus best between {insights.peakHours.map(h => formatHour(h)).join(', ')}. Schedule important work during these times.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Low Productivity Days -->
			{#if insights.lowProductivityDays.length > 0}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">📅</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">Low Productivity Days</h3>
							<p class="mt-1 text-xs text-gray-700 dark:text-slate-300">
								{insights.lowProductivityDays.join(', ')} tend to be less productive. Consider planning lighter tasks or breaks on these days.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Week-over-Week Trend -->
			{#if insights.weekOverWeekTrend !== 'stable'}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">{getTrendIcon(insights.weekOverWeekTrend)}</span>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">
								{insights.weekOverWeekTrend === 'improving' ? 'Productivity Improving' : 'Productivity Declining'}
							</h3>
							<p class="mt-1 text-xs text-gray-700 dark:text-slate-300">
								{insights.weekOverWeekTrend === 'improving'
									? 'Your productivity is up compared to last week. Keep up the momentum!'
									: 'Your productivity is down compared to last week. Consider reviewing your schedule.'}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Habit correlations -->
			{#if insights.habitCorrelations && insights.habitCorrelations.length > 0}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">Habits & productivity</h3>
					<ul class="space-y-1.5">
						{#each insights.habitCorrelations as h}
							<li class="flex items-center justify-between gap-2 text-xs">
								<span class="truncate text-gray-700 dark:text-slate-300">{h.habitName}</span>
								<span class="flex shrink-0 items-center gap-1 {getImpactColor(h.impact)}">
									<span aria-hidden="true">{getImpactIcon(h.impact)}</span>
									<span>{h.impact === 'positive' ? 'Boosts focus' : h.impact === 'negative' ? 'Lower focus' : 'Neutral'}</span>
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Additional Insights -->
			{#each insights.insights.filter(i => !['peak_hours', 'low_productivity_days', 'trend'].includes(i.type)) as insight}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
					<div class="flex items-start gap-2">
						<span class="text-lg">💡</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">{insight.title}</h3>
								<span class="text-xs {getConfidenceColor(insight.confidence)}">
									{insight.confidence}
								</span>
							</div>
							<p class="mt-1 text-xs text-gray-700 dark:text-slate-300">{insight.description}</p>
						</div>
					</div>
				</div>
			{/each}

			<!-- Empty State -->
			{#if insights.insights.length === 0 && insights.peakHours.length === 0 && insights.lowProductivityDays.length === 0 && (!insights.habitCorrelations || insights.habitCorrelations.length === 0)}
				<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
					Not enough data yet. Keep tracking your sessions to get insights!
				</div>
			{/if}
		</div>
	{:else}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
			No insights available
		</div>
	{/if}
</div>

