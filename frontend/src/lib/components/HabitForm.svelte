<script lang="ts">
	import { createHabit, updateHabit } from '$lib/api';
	import type { Habit } from '$lib/types';

	export let habit: Habit | null = null;
	export let onSuccess: ((habit: Habit) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let name = habit?.name || '';
	let description = habit?.description || '';
	let color = habit?.color || '#34d399';
	let icon = habit?.icon || '';
	let targetDays = habit?.targetDays || 7;
	let isActive = habit?.isActive ?? true;
	let isSubmitting = false;
	let error: string | null = null;

	const isEditMode = habit !== null;

	const colorPresets = [
		'#34d399', // emerald
		'#60a5fa', // blue
		'#a78bfa', // purple
		'#f472b6', // pink
		'#fb923c', // orange
		'#fbbf24', // yellow
		'#f87171', // red
		'#22d3ee'  // cyan
	];

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {
				name: name.trim(),
				color,
				targetDays
			};

			if (description.trim()) {
				payload.description = description.trim();
			}

			if (icon.trim()) {
				payload.icon = icon.trim();
			}

			if (isEditMode) {
				payload.isActive = isActive;
			}

			let result: { habit: Habit };
			if (isEditMode && habit) {
				result = await updateHabit(habit.id, payload);
			} else {
				result = await createHabit(payload);
			}

			if (onSuccess) {
				onSuccess(result.habit);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save habit';
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
		<label for="name" class="block text-sm font-medium text-slate-200 mb-2">
			Habit Name <span class="text-rose-400">*</span>
		</label>
		<input
			id="name"
			type="text"
			bind:value={name}
			required
			maxlength="100"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			placeholder="e.g., Morning Exercise"
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
			maxlength="500"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
			placeholder="Add habit description (optional)"
		></textarea>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="color" class="block text-sm font-medium text-slate-200 mb-2">
				Color
			</label>
			<div class="flex gap-2 items-center">
				<input
					id="color"
					type="color"
					bind:value={color}
					class="h-10 w-20 rounded-lg border border-slate-700 bg-slate-900/80 cursor-pointer"
				/>
				<div class="flex gap-1 flex-1">
					{#each colorPresets as preset}
						<button
							type="button"
							onclick={() => color = preset}
							class="h-10 w-10 rounded-lg border-2 transition {color === preset
								? 'border-white scale-110'
								: 'border-slate-700 hover:border-slate-600'}"
							style="background-color: {preset}"
							title={preset}
						></button>
					{/each}
				</div>
			</div>
		</div>

		<div>
			<label for="targetDays" class="block text-sm font-medium text-slate-200 mb-2">
				Target Days
			</label>
			<input
				id="targetDays"
				type="number"
				bind:value={targetDays}
				min="1"
				max="365"
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
			<p class="mt-1 text-xs text-slate-400">
				Number of days to complete this habit (1-365)
			</p>
		</div>
	</div>

	<div>
		<label for="icon" class="block text-sm font-medium text-slate-200 mb-2">
			Icon (emoji or text)
		</label>
		<input
			id="icon"
			type="text"
			bind:value={icon}
			maxlength="50"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			placeholder="🏃 or exercise"
		/>
	</div>

	{#if isEditMode}
		<div class="flex items-center gap-2">
			<input
				id="isActive"
				type="checkbox"
				bind:checked={isActive}
				class="h-4 w-4 rounded border-slate-700 bg-slate-900/80 text-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
			/>
			<label for="isActive" class="text-sm font-medium text-slate-200">
				Active
			</label>
		</div>
	{/if}

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={isSubmitting || !name.trim()}
			class="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if isSubmitting}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Saving...</span>
			{:else}
				{isEditMode ? 'Update Habit' : 'Create Habit'}
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

