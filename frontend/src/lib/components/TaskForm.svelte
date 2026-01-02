<script lang="ts">
	import { createTask, updateTask } from '$lib/api';
	import type { Task } from '$lib/types';
	import dayjs from 'dayjs';

	export let task: Task | null = null;
	export let onSuccess: ((task: Task) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let title = task?.title || '';
	let description = task?.description || '';
	let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = task?.priority || 'MEDIUM';
	let dueDate = task?.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : '';
	let category = task?.category || '';
	let isSubmitting = false;
	let error: string | null = null;

	const isEditMode = task !== null;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {
				title: title.trim(),
				priority
			};

			if (description.trim()) {
				payload.description = description.trim();
			}

			if (dueDate) {
				payload.dueDate = dueDate;
			}

			if (category.trim()) {
				payload.category = category.trim();
			}

			let result: { task: Task };
			if (isEditMode && task) {
				result = await updateTask(task.id, payload);
			} else {
				result = await createTask(payload);
			}

			if (onSuccess) {
				onSuccess(result.task);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save task';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form on:submit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
			{error}
		</div>
	{/if}

	<div>
		<label for="title" class="block text-sm font-medium text-slate-200 mb-2">
			Title <span class="text-rose-400">*</span>
		</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			required
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			placeholder="Enter task title"
		/>
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-slate-200 mb-2">
			Description
		</label>
		<textarea
			id="description"
			bind:value={description}
			rows="3"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
			placeholder="Add task description (optional)"
		></textarea>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="priority" class="block text-sm font-medium text-slate-200 mb-2">
				Priority
			</label>
			<select
				id="priority"
				bind:value={priority}
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			>
				<option value="LOW">Low</option>
				<option value="MEDIUM">Medium</option>
				<option value="HIGH">High</option>
				<option value="URGENT">Urgent</option>
			</select>
		</div>

		<div>
			<label for="dueDate" class="block text-sm font-medium text-slate-200 mb-2">
				Due Date
			</label>
			<input
				id="dueDate"
				type="date"
				bind:value={dueDate}
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
		</div>
	</div>

	<div>
		<label for="category" class="block text-sm font-medium text-slate-200 mb-2">
			Category
		</label>
		<input
			id="category"
			type="text"
			bind:value={category}
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			placeholder="e.g., Work, Personal"
		/>
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={isSubmitting || !title.trim()}
			class="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if isSubmitting}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Saving...</span>
			{:else}
				{isEditMode ? 'Update Task' : 'Create Task'}
			{/if}
		</button>
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				disabled={isSubmitting}
				class="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
			>
				Cancel
			</button>
		{/if}
	</div>
</form>

