<script lang="ts">
	import { createNote, updateNote, fetchAllTags } from '$lib/api';
	import type { Note } from '$lib/types';
	import { onMount } from 'svelte';

	export let note: Note | null = null;
	export let onSuccess: ((note: Note) => void) | null = null;
	export let onCancel: (() => void) | null = null;

	let title = note?.title || '';
	let content = note?.content || '';
	let tags = note?.tags || [];
	let isPinned = note?.isPinned || false;
	let newTag = '';
	let availableTags: string[] = [];
	let isSubmitting = false;
	let error: string | null = null;

	const isEditMode = note !== null;

	onMount(async () => {
		try {
			const response = await fetchAllTags();
			availableTags = response.tags;
		} catch (err) {
			console.error('Failed to load tags:', err);
		}
	});

	function addTag() {
		const tag = newTag.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			tags = [...tags, tag];
			newTag = '';
		}
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter((t) => t !== tagToRemove);
	}

	function addExistingTag(tag: string) {
		if (!tags.includes(tag)) {
			tags = [...tags, tag];
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		isSubmitting = true;

		try {
			const payload: any = {
				title: title.trim(),
				content: content.trim(),
				tags,
				isPinned
			};

			let result: { note: Note };
			if (isEditMode && note) {
				result = await updateNote(note.id, payload);
			} else {
				result = await createNote(payload);
			}

			if (onSuccess) {
				onSuccess(result.note);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save note';
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
			placeholder="Enter note title"
		/>
	</div>

	<div>
		<label for="content" class="block text-sm font-medium text-slate-200 mb-2">
			Content <span class="text-rose-400">*</span>
		</label>
		<textarea
			id="content"
			bind:value={content}
			required
			rows="8"
			class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none font-mono text-sm"
			placeholder="Write your note content..."
		></textarea>
	</div>

	<div>
		<label class="block text-sm font-medium text-slate-200 mb-2">
			Tags
		</label>
		<div class="space-y-2">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={newTag}
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
					class="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
					placeholder="Add a tag"
				/>
				<button
					type="button"
					onclick={addTag}
					disabled={!newTag.trim()}
					class="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
				>
					Add
				</button>
			</div>

			{#if tags.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each tags as tag}
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300">
							{tag}
							<button
								type="button"
								onclick={() => removeTag(tag)}
								class="hover:text-emerald-200"
							>
								×
							</button>
						</span>
					{/each}
				</div>
			{/if}

			{#if availableTags.length > 0}
				<div>
					<p class="text-xs text-slate-400 mb-1">Existing tags:</p>
					<div class="flex flex-wrap gap-1">
						{#each availableTags.filter(t => !tags.includes(t)) as tag}
							<button
								type="button"
								onclick={() => addExistingTag(tag)}
								class="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 transition"
							>
								+ {tag}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-2">
		<input
			id="isPinned"
			type="checkbox"
			bind:checked={isPinned}
			class="h-4 w-4 rounded border-slate-700 bg-slate-900/80 text-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
		/>
		<label for="isPinned" class="text-sm font-medium text-slate-200">
			Pin this note
		</label>
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			disabled={isSubmitting || !title.trim() || !content.trim()}
			class="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if isSubmitting}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Saving...</span>
			{:else}
				{isEditMode ? 'Update Note' : 'Create Note'}
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

