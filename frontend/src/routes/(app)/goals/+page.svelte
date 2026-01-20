<script lang="ts">
	import GoalsList from '$lib/components/GoalsList.svelte';
	import GoalForm from '$lib/components/GoalForm.svelte';
	import GoalTimeline from '$lib/components/GoalTimeline.svelte';
	import ContributionAnalysis from '$lib/components/ContributionAnalysis.svelte';
	import type { Goal } from '$lib/types';
	import { fetchGoal } from '$lib/api';

	let showCreateForm = false;
	let selectedGoal: Goal | null = null;
	let editingGoal: Goal | null = null;
	let showDetails = false;
	let loadingDetails = false;

	async function handleGoalClick(goal: Goal) {
		selectedGoal = goal;
		showDetails = true;
		loadingDetails = true;
		try {
			const response = await fetchGoal(goal.id);
			selectedGoal = response.goal;
		} catch (err) {
			console.error('Failed to load goal details:', err);
		} finally {
			loadingDetails = false;
		}
	}

	function handleEditGoal(goal: Goal) {
		editingGoal = goal;
		showCreateForm = true;
		showDetails = false;
	}

	function handleFormSuccess(goal: Goal) {
		showCreateForm = false;
		editingGoal = null;
		selectedGoal = null;
		showDetails = false;
	}

	function handleFormCancel() {
		showCreateForm = false;
		editingGoal = null;
	}

	function closeDetails() {
		showDetails = false;
		selectedGoal = null;
	}
</script>

<div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Goals & OKRs</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-slate-400 sm:text-base">
				Set long-term goals, track progress, and achieve your objectives
			</p>
		</div>
		<button
			type="button"
			onclick={() => {
				editingGoal = null;
				showCreateForm = true;
				showDetails = false;
			}}
			class="rounded-xl bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
		>
			+ New Goal
		</button>
	</div>

	{#if showCreateForm}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					{editingGoal ? 'Edit Goal' : 'Create New Goal'}
				</h2>
				<button
					type="button"
					onclick={handleFormCancel}
					class="rounded-lg p-1.5 text-gray-600 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200"
					aria-label="Close form"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<GoalForm goal={editingGoal} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
		</div>
	{:else if showDetails && selectedGoal}
		<div class="space-y-6">
			<!-- Goal Header -->
			<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-2">
							<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{selectedGoal.title}</h2>
							<span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-transparent">
								{selectedGoal.type}
							</span>
							<span
								class="px-2 py-1 rounded text-xs font-medium border {selectedGoal.healthStatus === 'ON_TRACK'
									? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
									: selectedGoal.healthStatus === 'AT_RISK'
										? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
										: 'bg-rose-500/20 text-rose-400 border-rose-500/50'}"
							>
								{selectedGoal.healthStatus === 'ON_TRACK'
									? 'On Track'
									: selectedGoal.healthStatus === 'AT_RISK'
										? 'At Risk'
										: 'Off Track'}
							</span>
						</div>
						{#if selectedGoal.description}
							<p class="text-gray-600 dark:text-slate-400 mb-4">{selectedGoal.description}</p>
						{/if}
						<div class="space-y-2">
							<div class="flex items-center justify-between text-sm">
								<span class="text-gray-600 dark:text-slate-400">Progress</span>
								<span class="font-medium text-gray-900 dark:text-slate-200">{Math.round(selectedGoal.progressPercent)}%</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3">
								<div
									class="h-3 rounded-full transition-all duration-300 {selectedGoal.healthStatus === 'ON_TRACK'
										? 'bg-emerald-500'
										: selectedGoal.healthStatus === 'AT_RISK'
											? 'bg-yellow-500'
											: 'bg-rose-500'}"
									style="width: {Math.min(100, Math.max(0, selectedGoal.progressPercent))}%"
								></div>
							</div>
						</div>
					</div>
					<div class="flex gap-2 ml-4">
						<button
							type="button"
							onclick={() => handleEditGoal(selectedGoal!)}
							class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition border border-gray-200 dark:border-transparent"
						>
							Edit
						</button>
						<button
							type="button"
							onclick={closeDetails}
							class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition border border-gray-200 dark:border-transparent"
						>
							Close
						</button>
					</div>
				</div>
			</div>

			<!-- Timeline and Contributions -->
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl">
					<GoalTimeline goalId={selectedGoal.id} />
				</div>
				<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl">
					<ContributionAnalysis goalId={selectedGoal.id} />
				</div>
			</div>
		</div>
	{:else}
		<GoalsList onGoalClick={handleGoalClick} onEditGoal={handleEditGoal} />
	{/if}
</div>
