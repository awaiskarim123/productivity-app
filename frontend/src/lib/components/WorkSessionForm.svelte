<script lang="ts">
	import { updateWorkSession } from '$lib/api';
	import type { WorkSession } from '$lib/types';
	import dayjs from 'dayjs';

	export let session: WorkSession;
	export let onSuccess: ((session: WorkSession) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let notes = session.notes || '';
	let startedAt = dayjs(session.startedAt).format('YYYY-MM-DDTHH:mm');
	let endedAt = session.endedAt ? dayjs(session.endedAt).format('YYYY-MM-DDTHH:mm') : '';
	let isSubmitting = false;
	let error: string | null = null;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {
				notes: notes.trim() || undefined
			};

			if (startedAt) {
				payload.startedAt = startedAt;
			}

			if (endedAt) {
				payload.endedAt = endedAt;
			} else if (session.endedAt) {
				payload.endedAt = null;
			}

			const response = await updateWorkSession(session.id, payload);
			if (onSuccess) {
				onSuccess(response.session);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update work session';
		} finally {
			isSubmitting = false;
		}
	}

	function calculateDuration() {
		if (!startedAt || !endedAt) return null;
		const start = dayjs(startedAt);
		const end = dayjs(endedAt);
		if (end.isBefore(start)) return null;
		const minutes = end.diff(start, 'minute');
		return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="rounded-lg border border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
			{error}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="startedAt" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				Started At
			</label>
			<input
				id="startedAt"
				type="datetime-local"
				bind:value={startedAt}
				required
				class="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			/>
		</div>

		<div>
			<label for="endedAt" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
				Ended At
			</label>
			<input
				id="endedAt"
				type="datetime-local"
				bind:value={endedAt}
				class="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			/>
			{#if calculateDuration()}
				<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">
					Duration: {calculateDuration()}
				</p>
			{/if}
		</div>
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
			Notes
		</label>
		<textarea
			id="notes"
			bind:value={notes}
			rows="4"
			maxlength="500"
			class="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-4 py-3 text-gray-900 dark:text-slate-100 shadow-inner focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40 resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
			placeholder="Add notes about this work session..."
		></textarea>
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
				class="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/80 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
			>
				Cancel
			</button>
		{/if}
	</div>
</form>

