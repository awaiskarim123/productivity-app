<script lang="ts">
	import { createGoal, updateGoal } from '$lib/api';
	import type { Goal, KeyResult } from '$lib/types';
	import dayjs from 'dayjs';

	export let goal: Goal | null = null;
	export let onSuccess: ((goal: Goal) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let title = goal?.title || '';
	let description = goal?.description || '';
	let type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = goal?.type || 'MONTHLY';
	let startDate = goal?.startDate ? dayjs(goal.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
	let endDate = goal?.endDate ? dayjs(goal.endDate).format('YYYY-MM-DD') : (() => {
		// Set default end date based on type
		const today = dayjs();
		switch (type) {
			case 'DAILY':
				return today.add(1, 'day').format('YYYY-MM-DD');
			case 'WEEKLY':
				return today.add(1, 'week').format('YYYY-MM-DD');
			case 'MONTHLY':
				return today.add(1, 'month').format('YYYY-MM-DD');
			case 'QUARTERLY':
				return today.add(3, 'month').format('YYYY-MM-DD');
			case 'YEARLY':
				return today.add(1, 'year').format('YYYY-MM-DD');
			default:
				return today.add(1, 'month').format('YYYY-MM-DD');
		}
	})();
	let targetValue = goal?.targetValue || 100;
	let keyResults: Array<{ title: string; description: string; targetValue: number; weight: number }> = 
		goal?.keyResults?.map(kr => ({
			title: kr.title,
			description: kr.description || '',
			targetValue: kr.targetValue,
			weight: kr.weight
		})) || [];
	let isSubmitting = false;
	let error: string | null = null;

	$: isEditMode = goal !== null;

	// Reset form fields when goal prop changes
	$: if (goal) {
		title = goal.title || '';
		description = goal.description || '';
		type = goal.type || 'MONTHLY';
		startDate = goal.startDate ? dayjs(goal.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
		endDate = goal.endDate ? dayjs(goal.endDate).format('YYYY-MM-DD') : (() => {
			const today = dayjs();
			switch (type) {
				case 'DAILY': return today.add(1, 'day').format('YYYY-MM-DD');
				case 'WEEKLY': return today.add(1, 'week').format('YYYY-MM-DD');
				case 'MONTHLY': return today.add(1, 'month').format('YYYY-MM-DD');
				case 'QUARTERLY': return today.add(3, 'month').format('YYYY-MM-DD');
				case 'YEARLY': return today.add(1, 'year').format('YYYY-MM-DD');
				default: return today.add(1, 'month').format('YYYY-MM-DD');
			}
		})();
		targetValue = goal.targetValue || 100;
		keyResults = goal.keyResults?.map(kr => ({
			title: kr.title,
			description: kr.description || '',
			targetValue: kr.targetValue,
			weight: kr.weight
		})) || [];
	} else {
		title = '';
		description = '';
		type = 'MONTHLY';
		startDate = dayjs().format('YYYY-MM-DD');
		endDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
		targetValue = 100;
		keyResults = [];
	}

	function addKeyResult() {
		keyResults = [...keyResults, { title: '', description: '', targetValue: 0, weight: 1.0 }];
	}

	function removeKeyResult(index: number) {
		keyResults = keyResults.filter((_, i) => i !== index);
	}

	function updateKeyResult(index: number, field: string, value: any) {
		keyResults = keyResults.map((kr, i) => 
			i === index ? { ...kr, [field]: value } : kr
		);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {
				title: title.trim(),
				type,
				startDate: dayjs(startDate).toISOString(),
				endDate: dayjs(endDate).toISOString(),
				targetValue
			};

			if (description.trim()) {
				payload.description = description.trim();
			}

			if (keyResults.length > 0) {
				payload.keyResults = keyResults
					.filter(kr => kr.title.trim())
					.map(kr => ({
						title: kr.title.trim(),
						description: kr.description.trim() || undefined,
						targetValue: kr.targetValue,
						weight: kr.weight
					}));
			}

			let result: { goal: Goal };
			if (isEditMode && goal) {
				result = await updateGoal(goal.id, payload);
			} else {
				result = await createGoal(payload);
			}

			if (onSuccess) {
				onSuccess(result.goal);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save goal';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="rounded-lg border border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
			{error}
		</div>
	{/if}

	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
			Goal Title <span class="text-rose-400">*</span>
		</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			required
			maxlength="200"
			class="input-field"
			placeholder="e.g., Launch Product Q1"
		/>
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
			Description
		</label>
		<textarea
			id="description"
			bind:value={description}
			rows="3"
			maxlength="1000"
			class="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 hover:border-gray-400 dark:hover:border-slate-600 resize-none"
			placeholder="Describe your goal and what success looks like..."
		></textarea>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="type" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				Type <span class="text-rose-400">*</span>
			</label>
			<select
				id="type"
				bind:value={type}
				required
				class="w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner transition-all duration-200 cursor-pointer hover:border-gray-400 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
				onchange={() => {
					// Update end date based on type when changed
					if (!goal) {
						const today = dayjs();
						switch (type) {
							case 'DAILY':
								endDate = today.add(1, 'day').format('YYYY-MM-DD');
								break;
							case 'WEEKLY':
								endDate = today.add(1, 'week').format('YYYY-MM-DD');
								break;
							case 'MONTHLY':
								endDate = today.add(1, 'month').format('YYYY-MM-DD');
								break;
							case 'QUARTERLY':
								endDate = today.add(3, 'month').format('YYYY-MM-DD');
								break;
							case 'YEARLY':
								endDate = today.add(1, 'year').format('YYYY-MM-DD');
								break;
						}
					}
				}}
			>
				<option value="DAILY">Daily</option>
				<option value="WEEKLY">Weekly</option>
				<option value="MONTHLY">Monthly</option>
				<option value="QUARTERLY">Quarterly</option>
				<option value="YEARLY">Yearly</option>
			</select>
		</div>

		<div>
			<label for="targetValue" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				Target Value
			</label>
			<input
				id="targetValue"
				type="number"
				bind:value={targetValue}
				min="1"
				step="1"
				class="input-field"
				placeholder="100"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				Start Date <span class="text-rose-400">*</span>
			</label>
			<input
				id="startDate"
				type="date"
				bind:value={startDate}
				required
				class="input-field"
			/>
		</div>

		<div>
			<label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				End Date <span class="text-rose-400">*</span>
			</label>
			<input
				id="endDate"
				type="date"
				bind:value={endDate}
				required
				class="input-field"
			/>
		</div>
	</div>

	<div>
		<div class="flex items-center justify-between mb-2">
			<p class="block text-sm font-medium text-gray-700 dark:text-slate-200">
				Key Results (OKRs)
			</p>
			<button
				type="button"
				onclick={addKeyResult}
				class="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
			>
				+ Add Key Result
			</button>
		</div>

		{#if keyResults.length > 0}
			<div class="space-y-3">
				{#each keyResults as kr, index}
					<div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30 p-4 space-y-3">
						<div class="flex items-start justify-between">
							<span class="text-xs font-medium text-gray-600 dark:text-slate-400">Key Result #{index + 1}</span>
							<button
								type="button"
								onclick={() => removeKeyResult(index)}
								class="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
							>
								Remove
							</button>
						</div>

						<input
							type="text"
							value={kr.title}
							oninput={(e) => updateKeyResult(index, 'title', e.currentTarget.value)}
							placeholder="Key result title"
							maxlength="200"
							class="input-field"
						/>

						<textarea
							value={kr.description}
							oninput={(e) => updateKeyResult(index, 'description', e.currentTarget.value)}
							placeholder="Description (optional)"
							rows="2"
							maxlength="500"
							class="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2 text-gray-900 dark:text-slate-100 shadow-inner transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 hover:border-gray-400 dark:hover:border-slate-600 resize-none text-sm"
						></textarea>

						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									for={`kr-target-${index}`}
									class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1"
								>
									Target Value
								</label>
								<input
									id={`kr-target-${index}`}
									type="number"
									value={kr.targetValue}
									oninput={(e) =>
										updateKeyResult(index, 'targetValue', parseFloat(e.currentTarget.value) || 0)}
									min="0"
									step="0.1"
									class="input-field text-sm py-2"
								/>
							</div>
							<div>
								<label
									for={`kr-weight-${index}`}
									class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1"
								>
									Weight (0-1)
								</label>
								<input
									id={`kr-weight-${index}`}
									type="number"
									value={kr.weight}
									oninput={(e) =>
										updateKeyResult(
											index,
											'weight',
											Math.max(0, Math.min(1, parseFloat(e.currentTarget.value) || 1))
										)}
									min="0"
									max="1"
									step="0.1"
									class="input-field text-sm py-2"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-gray-600 dark:text-slate-400 italic">No key results added. Click "+ Add Key Result" to add one.</p>
		{/if}
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={isSubmitting}
			class="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if isSubmitting}
				<span class="flex items-center justify-center gap-2">
					<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
					<span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
				</span>
			{:else}
				{isEditMode ? 'Update Goal' : 'Create Goal'}
			{/if}
		</button>
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-800/70"
			>
				Cancel
			</button>
		{/if}
	</div>
</form>

<style>
	:global(.input-field) {
		@apply w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner transition-all duration-200;
		@apply placeholder:text-gray-400 dark:placeholder:text-slate-500;
		@apply focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30;
		@apply hover:border-gray-400 dark:hover:border-slate-600;
	}

	/* Custom select dropdown styling */
	select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a0aec0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
		background-position: right 0.75rem center;
		background-repeat: no-repeat;
		background-size: 1.25em 1.25em;
		padding-right: 2.5rem;
	}

	select:focus {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
	}

	/* Style select options */
	select option {
		background-color: rgb(255 255 255);
		color: rgb(17 24 39);
		padding: 0.5rem;
	}

	select option:hover,
	select option:checked,
	select option:focus {
		background-color: rgb(16 185 129 / 0.2);
		color: rgb(4 120 87);
	}
</style>
