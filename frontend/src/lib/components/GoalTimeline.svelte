<script lang="ts">
	import { fetchGoalTimeline } from '$lib/api';
	import type { GoalTimeline } from '$lib/types';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	export let goalId: string;

	let timeline: GoalTimeline | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadTimeline();
	});

	async function loadTimeline() {
		loading = true;
		error = null;
		try {
			const response = await fetchGoalTimeline(goalId);
			timeline = response.timeline;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load timeline';
		} finally {
			loading = false;
		}
	}

	function formatDate(date: string) {
		return dayjs(date).format('MMM D');
	}

	function getMaxValue() {
		if (!timeline) return 100;
		return Math.max(
			...timeline.timeline.map((point) => Math.max(point.progress, point.tasksCompleted, point.habitLogs, point.focusMinutes / 10))
		);
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-white">Timeline Progress</h3>

	{#if loading}
		<div class="text-center py-8">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500"></div>
			<p class="mt-2 text-sm text-slate-400">Loading timeline...</p>
		</div>
	{:else if error}
		<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
			{error}
		</div>
	{:else if timeline}
		<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
			<div class="mb-6">
				<h4 class="text-sm font-medium text-slate-300 mb-1">{timeline.goal.title}</h4>
				<p class="text-xs text-slate-500">
					{dayjs(timeline.goal.startDate).format('MMM D, YYYY')} - {dayjs(timeline.goal.endDate).format('MMM D, YYYY')}
				</p>
			</div>

			<div class="space-y-4">
				<!-- Progress Chart -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-slate-300">Progress Over Time</span>
						<span class="text-xs text-slate-500">{Math.round(timeline.goal.currentProgress)}%</span>
					</div>
					<div class="relative h-32 bg-slate-800/50 rounded-lg p-2">
						<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
							{#each timeline.timeline as point, index}
								{#if index > 0}
									{@const prevPoint = timeline.timeline[index - 1]}
									{@const x1 = (index - 1) * (100 / (timeline.timeline.length - 1))}
									{@const x2 = index * (100 / (timeline.timeline.length - 1))}
									{@const y1 = 100 - (prevPoint.progress / getMaxValue()) * 100}
									{@const y2 = 100 - (point.progress / getMaxValue()) * 100}
									<line
										x1={x1}
										y1={y1}
										x2={x2}
										y2={y2}
										stroke="rgb(16, 185, 129)"
										stroke-width="2"
										fill="none"
									/>
								{/if}
							{/each}
						</svg>
					</div>
				</div>

				<!-- Activity Breakdown -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
						<div class="text-xs font-medium text-slate-400 mb-1">Tasks Completed</div>
						<div class="text-2xl font-bold text-emerald-400">
							{timeline.timeline.reduce((sum, p) => sum + p.tasksCompleted, 0)}
						</div>
					</div>
					<div class="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
						<div class="text-xs font-medium text-slate-400 mb-1">Habit Logs</div>
						<div class="text-2xl font-bold text-blue-400">
							{timeline.timeline.reduce((sum, p) => sum + p.habitLogs, 0)}
						</div>
					</div>
					<div class="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
						<div class="text-xs font-medium text-slate-400 mb-1">Focus Minutes</div>
						<div class="text-2xl font-bold text-purple-400">
							{Math.round(timeline.timeline.reduce((sum, p) => sum + p.focusMinutes, 0) / 60)}h
						</div>
					</div>
				</div>

				<!-- Timeline Points -->
				<div class="space-y-2 max-h-64 overflow-y-auto">
					{#each timeline.timeline as point}
						<div class="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/20 hover:bg-slate-800/40 transition">
							<div class="flex-1">
								<div class="text-sm font-medium text-slate-200">{formatDate(point.date)}</div>
								<div class="flex items-center gap-4 mt-1 text-xs text-slate-500">
									<span>{point.tasksCompleted} tasks</span>
									<span>{point.habitLogs} logs</span>
									<span>{Math.round(point.focusMinutes / 60)}h focus</span>
								</div>
							</div>
							<div class="text-sm font-medium text-emerald-400">{Math.round(point.progress)}%</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
