<script lang="ts">
	import { updateFocusSession } from '$lib/api';
	import type { FocusSession } from '$lib/types';

	export let session: FocusSession;
	export let onSuccess: ((session: FocusSession) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let notes = session.notes || '';
	let distractions = session.distractions || 0;
	let completed = session.completed;
	let isSubmitting = false;
	let error: string | null = null;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {};

			if (notes.trim()) {
				payload.notes = notes.trim();
			} else {
				payload.notes = null;
			}

			payload.distractions = distractions;
			payload.completed = completed;

			const response = await updateFocusSession(session.id, payload);
			if (onSuccess) {
				onSuccess(response.session);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update focus session';
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

	<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
		<div class="flex items-center justify-between mb-2">
			<span class="text-sm font-medium text-slate-300">Session Info</span>
			<span class="text-xs px-2 py-1 rounded-full {session.mode === 'FOCUS'
				? 'bg-emerald-500/20 text-emerald-300'
				: 'bg-blue-500/20 text-blue-300'}">
				{session.mode}
			</span>
		</div>
		<div class="text-xs text-slate-400 space-y-1">
			<p>Target: {session.targetMinutes} minutes</p>
			{#if session.durationMinutes}
				<p>Duration: {session.durationMinutes} minutes</p>
			{/if}
		</div>
	</div>

	<div>
		<label for="distractions" class="block text-sm font-medium text-slate-200 mb-2">
			Distractions
		</label>
		<input
			id="distractions"
			type="number"
			bind:value={distractions}
			min="0"
			max="99"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
		/>
		<p class="mt-1 text-xs text-slate-400">
			Number of distractions during this session
		</p>
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium text-slate-200 mb-2">
			Notes
		</label>
		<textarea
			id="notes"
			bind:value={notes}
			rows="4"
			maxlength="500"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
			placeholder="Add notes about this focus session..."
		></textarea>
	</div>

	<div class="flex items-center gap-2">
		<input
			id="completed"
			type="checkbox"
			bind:checked={completed}
			class="h-4 w-4 rounded border-slate-700 bg-slate-900/80 text-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
		/>
		<label for="completed" class="text-sm font-medium text-slate-200">
			Mark as completed
		</label>
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={isSubmitting}
			class="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if isSubmitting}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Updating...</span>
			{:else}
				Update Session
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

