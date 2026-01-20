<script lang="ts">
	import { onMount } from 'svelte';
	import { createNote, fetchNotes, updateNote, deleteNote } from '$lib/api';
	import type { Note } from '$lib/types';
	import dayjs from 'dayjs';

	let notes: Note[] = [];
	let loading = true;
	let error: string | null = null;
	let newNoteTitle = '';
	let newNoteContent = '';
	let isCreating = false;
	let editingNote: Note | null = null;

	export let limit = 5;

	async function loadNotes() {
		loading = true;
		error = null;
		try {
			const response = await fetchNotes({ isPinned: false, limit });
			notes = response.notes;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
			// Only show error if it's not a connection issue
			if (!errorMessage.includes('Unable to connect')) {
				error = errorMessage;
			} else {
				error = 'Connection error. Please check if the server is running.';
			}
		} finally {
			loading = false;
		}
	}

	async function handleCreateNote() {
		if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
		isCreating = true;
		try {
			await createNote({
				title: newNoteTitle,
				content: newNoteContent
			});
			newNoteTitle = '';
			newNoteContent = '';
			await loadNotes();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create note';
		} finally {
			isCreating = false;
		}
	}

	async function handleDeleteNote(id: string) {
		try {
			await deleteNote(id);
			notes = notes.filter((n) => n.id !== id);
			await loadNotes();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete note';
		}
	}

	function truncateContent(content: string, maxLength = 100) {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + '...';
	}

	onMount(() => {
		loadNotes();
	});
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Quick Notes</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Capture your thoughts</p>
		</div>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{/if}

	<!-- Create Note Form -->
	<div class="mb-3 space-y-2 rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
		<input
			type="text"
			bind:value={newNoteTitle}
			placeholder="Note title..."
			class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			disabled={isCreating}
		/>
		<textarea
			bind:value={newNoteContent}
			placeholder="Write your note..."
			rows="2"
			class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40 resize-none"
			disabled={isCreating}
		></textarea>
		<button
			type="button"
			onclick={handleCreateNote}
			disabled={isCreating || !newNoteTitle.trim() || !newNoteContent.trim()}
			class="w-full rounded-lg bg-emerald-500 dark:bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-600 dark:hover:bg-emerald-400 disabled:opacity-50"
		>
			Add Note
		</button>
	</div>

	{#if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading notes...</div>
	{:else if notes.length === 0}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
			No notes yet. Create one to get started!
		</div>
	{:else}
		<ul class="space-y-2">
			{#each notes as note}
				<li
					class="group rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3 transition hover:border-gray-300 dark:hover:border-slate-700"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">{note.title}</h3>
							<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">{truncateContent(note.content)}</p>
							<div class="mt-2 flex items-center gap-2">
								{#if note.tags.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each note.tags as tag}
											<span
												class="rounded-full bg-gray-200 dark:bg-slate-800/60 px-2 py-0.5 text-xs text-gray-700 dark:text-slate-400"
											>
												{tag}
											</span>
										{/each}
									</div>
								{/if}
								<span class="text-xs text-gray-500 dark:text-slate-500">
									{dayjs(note.updatedAt).format('MMM D')}
								</span>
							</div>
						</div>
						<button
							type="button"
							onclick={() => handleDeleteNote(note.id)}
							class="opacity-100 md:opacity-0 transition md:group-hover:opacity-100"
							aria-label="Delete note"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 text-gray-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

