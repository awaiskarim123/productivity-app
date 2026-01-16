<script lang="ts">
	import { fetchGoals, deleteGoal, recalculateGoalProgress } from '$lib/api';
	import type { Goal } from '$lib/types';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	export let onGoalClick: ((goal: Goal) => void) | null = null;
	export let onEditGoal: ((goal: Goal) => void) | null = null;

	let goals: Goal[] = [];
	let loading = true;
	let error: string | null = null;
	let filterType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL' = 'ALL';
	let filterActive: boolean | null = null;

	onMount(async () => {
		await loadGoals();
	});

	async function loadGoals() {
		loading = true;
		error = null;
		try {
			const params: any = {};
			if (filterType !== 'ALL') {
				params.type = filterType;
			}
			if (filterActive !== null) {
				params.isActive = filterActive;
			}
			const response = await fetchGoals(params);
			goals = response.goals;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load goals';
		} finally {
			loading = false;
		}
	}

	async function handleDelete(goalId: string, event: MouseEvent) {
		event.stopPropagation();
		if (!confirm('Are you sure you want to delete this goal?')) return;

		try {
			await deleteGoal(goalId);
			await loadGoals();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete goal');
		}
	}

	async function handleRecalculate(goalId: string, event: MouseEvent) {
		event.stopPropagation();
		try {
			await recalculateGoalProgress(goalId);
			await loadGoals();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to recalculate progress');
		}
	}

	function getHealthColor(status: Goal['healthStatus']) {
		switch (status) {
			case 'ON_TRACK':
				return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
			case 'AT_RISK':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
			case 'OFF_TRACK':
				return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
			default:
				return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
		}
	}

	function getHealthLabel(status: Goal['healthStatus']) {
		switch (status) {
			case 'ON_TRACK':
				return 'On Track';
			case 'AT_RISK':
				return 'At Risk';
			case 'OFF_TRACK':
				return 'Off Track';
			default:
				return 'Unknown';
		}
	}

	function formatDate(date: string) {
		return dayjs(date).format('MMM D, YYYY');
	}

	function getDaysRemaining(endDate: string) {
		const days = dayjs(endDate).diff(dayjs(), 'day');
		return days > 0 ? `${days} days left` : days === 0 ? 'Ends today' : `${Math.abs(days)} days overdue`;
	}
</script>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
		<h2 class="text-xl font-semibold text-white">Goals & OKRs</h2>
		<div class="flex gap-2 flex-wrap">
			<select
				bind:value={filterType}
				on:change={loadGoals}
				class="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 cursor-pointer transition hover:border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
			>
				<option value="ALL">All Types</option>
				<option value="DAILY">Daily</option>
				<option value="WEEKLY">Weekly</option>
				<option value="MONTHLY">Monthly</option>
				<option value="QUARTERLY">Quarterly</option>
				<option value="YEARLY">Yearly</option>
			</select>
			<select
				bind:value={filterActive}
				on:change={loadGoals}
				class="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 cursor-pointer transition hover:border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
			>
				<option value={null}>All Status</option>
				<option value={true}>Active</option>
				<option value={false}>Inactive</option>
			</select>
			<button
				on:click={loadGoals}
				class="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70 transition"
			>
				Refresh
			</button>
		</div>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500"></div>
			<p class="mt-2 text-sm text-slate-400">Loading goals...</p>
		</div>
	{:else if error}
		<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
			{error}
		</div>
	{:else if goals.length === 0}
		<div class="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/50">
			<p class="text-slate-400">No goals found. Create your first goal to get started!</p>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each goals as goal}
				<div
					class="group relative rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-slate-700 transition cursor-pointer"
					on:click={() => onGoalClick?.(goal)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && onGoalClick?.(goal)}
				>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-lg font-semibold text-white truncate">{goal.title}</h3>
								<span class="px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300">
									{goal.type}
								</span>
								<span class="px-2 py-1 rounded text-xs font-medium border {getHealthColor(goal.healthStatus)}">
									{getHealthLabel(goal.healthStatus)}
								</span>
							</div>

							{#if goal.description}
								<p class="text-sm text-slate-400 mb-3 line-clamp-2">{goal.description}</p>
							{/if}

							<div class="space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="text-slate-400">Progress</span>
									<span class="font-medium text-slate-200">{Math.round(goal.progressPercent)}%</span>
								</div>
								<div class="w-full bg-slate-800 rounded-full h-2.5">
									<div
										class="h-2.5 rounded-full transition-all duration-300 {goal.healthStatus === 'ON_TRACK' ? 'bg-emerald-500' : goal.healthStatus === 'AT_RISK' ? 'bg-yellow-500' : 'bg-rose-500'}"
										style="width: {Math.min(100, Math.max(0, goal.progressPercent))}%"
									></div>
								</div>
							</div>

							<div class="flex items-center gap-4 mt-4 text-xs text-slate-500">
								<span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
								<span>•</span>
								<span>{getDaysRemaining(goal.endDate)}</span>
								{#if goal._count}
									<span>•</span>
									<span>{goal._count.tasks} tasks, {goal._count.habits} habits, {goal._count.focusSessions} sessions</span>
								{/if}
							</div>

							{#if goal.keyResults && goal.keyResults.length > 0}
								<div class="mt-4 pt-4 border-t border-slate-800">
									<p class="text-xs font-medium text-slate-400 mb-2">Key Results:</p>
									<div class="space-y-2">
										{#each goal.keyResults as kr}
											<div class="flex items-center justify-between text-xs">
												<span class="text-slate-300 truncate flex-1 mr-2">{kr.title}</span>
												<span class="text-slate-500">{Math.round(kr.progressPercent)}%</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<div class="flex flex-col gap-2 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
							<button
								on:click={(e) => {
									e.stopPropagation();
									onEditGoal?.(goal);
								}}
								class="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
								title="Edit goal"
							>
								Edit
							</button>
							<button
								on:click={(e) => handleRecalculate(goal.id, e)}
								class="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
								title="Recalculate progress"
							>
								Refresh
							</button>
							<button
								on:click={(e) => handleDelete(goal.id, e)}
								class="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
								title="Delete goal"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
