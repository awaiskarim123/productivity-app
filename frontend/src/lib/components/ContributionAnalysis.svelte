<script lang="ts">
	import { fetchGoalContributions } from '$lib/api';
	import type { GoalContributions } from '$lib/types';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	export let goalId: string;

	let contributions: GoalContributions | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadContributions();
	});

	async function loadContributions() {
		loading = true;
		error = null;
		try {
			const response = await fetchGoalContributions(goalId);
			contributions = response.contributions;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load contributions';
		} finally {
			loading = false;
		}
	}

	function getContributionColor(contribution: number) {
		if (contribution >= 70) return 'text-emerald-400';
		if (contribution >= 40) return 'text-yellow-400';
		return 'text-slate-400';
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'URGENT':
				return 'bg-rose-500/20 text-rose-300';
			case 'HIGH':
				return 'bg-orange-500/20 text-orange-300';
			case 'MEDIUM':
				return 'bg-yellow-500/20 text-yellow-300';
			case 'LOW':
				return 'bg-blue-500/20 text-blue-300';
			default:
				return 'bg-slate-500/20 text-slate-300';
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-white">What Contributed Most?</h3>

	{#if loading}
		<div class="text-center py-8">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500"></div>
			<p class="mt-2 text-sm text-slate-400">Loading contributions...</p>
		</div>
	{:else if error}
		<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
			{error}
		</div>
	{:else if contributions}
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
					<div class="text-xs font-medium text-slate-400 mb-1">Tasks</div>
					<div class="text-2xl font-bold text-emerald-400 mb-1">
						{contributions.tasks.completed}/{contributions.tasks.total}
					</div>
					<div class="text-xs {getContributionColor(contributions.tasks.contribution)}">
						{Math.round(contributions.tasks.contribution)}% contribution
					</div>
				</div>
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
					<div class="text-xs font-medium text-slate-400 mb-1">Habits</div>
					<div class="text-2xl font-bold text-blue-400 mb-1">
						{contributions.habits.logs} logs
					</div>
					<div class="text-xs {getContributionColor(contributions.habits.contribution)}">
						{Math.round(contributions.habits.contribution)}% contribution
					</div>
				</div>
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
					<div class="text-xs font-medium text-slate-400 mb-1">Focus Sessions</div>
					<div class="text-2xl font-bold text-purple-400 mb-1">
						{Math.round(contributions.focusSessions.totalMinutes / 60)}h
					</div>
					<div class="text-xs {getContributionColor(contributions.focusSessions.contribution)}">
						{Math.round(contributions.focusSessions.contribution)}% contribution
					</div>
				</div>
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
					<div class="text-xs font-medium text-slate-400 mb-1">Key Results</div>
					<div class="text-2xl font-bold text-yellow-400 mb-1">
						{contributions.keyResults.length}
					</div>
					<div class="text-xs text-slate-500">
						Active OKRs
					</div>
				</div>
			</div>

			<!-- Tasks Section -->
			{#if contributions.tasks.items.length > 0}
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
					<h4 class="text-sm font-semibold text-white mb-4">Tasks ({contributions.tasks.completed}/{contributions.tasks.total} completed)</h4>
					<div class="space-y-2">
						{#each contributions.tasks.items as task}
							<div class="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/30">
								<div class="flex items-center gap-3 flex-1 min-w-0">
									<input
										type="checkbox"
										checked={task.completed}
										disabled
										class="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
									/>
									<span class="text-sm text-slate-200 truncate {task.completed ? 'line-through text-slate-500' : ''}">
										{task.title}
									</span>
									<span class="px-2 py-0.5 rounded text-xs font-medium {getPriorityColor(task.priority)}">
										{task.priority}
									</span>
								</div>
								{#if task.completedAt}
									<span class="text-xs text-slate-500 ml-2">
										{dayjs(task.completedAt).format('MMM D')}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Habits Section -->
			{#if contributions.habits.items.length > 0}
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
					<h4 class="text-sm font-semibold text-white mb-4">Habits ({contributions.habits.logs} total logs)</h4>
					<div class="space-y-2">
						{#each contributions.habits.items as habit}
							<div class="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/30">
								<span class="text-sm text-slate-200">{habit.name}</span>
								<span class="text-xs text-slate-500">{habit.logCount} logs</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Focus Sessions Section -->
			{#if contributions.focusSessions.items.length > 0}
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
					<h4 class="text-sm font-semibold text-white mb-4">
						Focus Sessions ({Math.round(contributions.focusSessions.totalMinutes / 60)} hours total)
					</h4>
					<div class="space-y-2 max-h-64 overflow-y-auto">
						{#each contributions.focusSessions.items as session}
							<div class="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/30">
								<div class="flex-1">
									<div class="text-sm text-slate-200">
										{dayjs(session.startedAt).format('MMM D, h:mm A')}
									</div>
									<div class="text-xs text-slate-500 mt-1">
										{session.durationMinutes || 0} minutes
										{#if session.completed}
											<span class="ml-2 text-emerald-400">✓ Completed</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Key Results Section -->
			{#if contributions.keyResults.length > 0}
				<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
					<h4 class="text-sm font-semibold text-white mb-4">Key Results Progress</h4>
					<div class="space-y-4">
						{#each contributions.keyResults as kr}
							<div>
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-slate-200">{kr.title}</span>
									<span class="text-sm font-medium text-emerald-400">
										{Math.round(kr.progressPercent)}%
									</span>
								</div>
								<div class="w-full bg-slate-800 rounded-full h-2">
									<div
										class="h-2 rounded-full bg-emerald-500 transition-all duration-300"
										style="width: {Math.min(100, Math.max(0, kr.progressPercent))}%"
									></div>
								</div>
								<div class="flex items-center justify-between mt-1 text-xs text-slate-500">
									<span>{kr.currentValue} / {kr.targetValue}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
