<script lang="ts">
	import { onMount } from 'svelte';
	import { createNote, fetchNotes, updateNote, deleteNote, fetchAllTags } from '$lib/api';
	import type { Note } from '$lib/types';
	import dayjs from 'dayjs';

	let notes: Note[] = [];
	let allTags: string[] = [];
	let loading = true;
	let error: string | null = null;
	let newNoteTitle = '';
	let newNoteContent = '';
	let newNoteTags = '';
	let newNotePinned = false;
	let searchQuery = '';
	let filterTag = '';
	let isCreating = false;
	let editingNoteId: string | null = null;
	let editTitle = '';
	let editContent = '';
	let editPinned = false;
	let editTagsInput = '';

	export let limit = 10;

	function parseTags(s: string): string[] {
		return s
			.split(/[\s,]+/)
			.map((t) => t.trim())
			.filter(Boolean)
			.slice(0, 10);
	}

	async function loadNotes() {
		loading = true;
		error = null;
		try {
			const params: { search?: string; tag?: string; limit: number } = { limit };
			if (searchQuery.trim()) params.search = searchQuery.trim();
			if (filterTag) params.tag = filterTag;
			const [notesRes, tagsRes] = await Promise.all([
				fetchNotes(params),
				fetchAllTags()
			]);
			notes = notesRes.notes;
			allTags = tagsRes.tags;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
			if (!errorMessage.includes('Unable to connect')) {
				error = errorMessage;
			} else {
				error = 'Connection error. Please check if the server is running.';
			}
		} finally {
			loading = false;
		}
	}

	function startEdit(note: Note) {
		editingNoteId = note.id;
		editTitle = note.title;
		editContent = note.content;
		editTagsInput = note.tags.join(', ');
		editPinned = note.isPinned;
	}

	function cancelEdit() {
		editingNoteId = null;
	}

	async function saveEdit() {
		if (!editingNoteId || !editTitle.trim()) return;
		const tags = parseTags(editTagsInput);
		try {
			const response = await updateNote(editingNoteId, {
				title: editTitle.trim(),
				content: editContent,
				tags,
				isPinned: editPinned
			});
			notes = notes.map((n) => (n.id === editingNoteId ? response.note : n));
			editingNoteId = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update note';
		}
	}

	async function handleTogglePin(note: Note) {
		try {
			const response = await updateNote(note.id, { isPinned: !note.isPinned });
			notes = notes.map((n) => (n.id === note.id ? response.note : n));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update note';
		}
	}

	async function handleCreateNote() {
		if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
		isCreating = true;
		try {
			const tags = parseTags(newNoteTags);
			await createNote({
				title: newNoteTitle.trim(),
				content: newNoteContent.trim(),
				tags: tags.length > 0 ? tags : undefined,
				isPinned: newNotePinned
			});
			newNoteTitle = '';
			newNoteContent = '';
			newNoteTags = '';
			newNotePinned = false;
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
			if (editingNoteId === id) editingNoteId = null;
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
	<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Quick Notes</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Capture your thoughts</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<input
				type="text"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && loadNotes()}
				placeholder="Search notes..."
				class="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 w-32 sm:w-40 px-2 py-1.5 text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
			/>
			<select
				bind:value={filterTag}
				onchange={() => loadNotes()}
				class="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-xs text-gray-700 dark:text-slate-300 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
			>
				<option value="">All tags</option>
				{#each allTags as tag}
					<option value={tag}>{tag}</option>
				{/each}
			</select>
			<button
				type="button"
				onclick={() => loadNotes()}
				class="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
			>
				Search
			</button>
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
		<input
			type="text"
			bind:value={newNoteTags}
			placeholder="Tags (comma-separated, optional)"
			class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-1.5 text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			disabled={isCreating}
		/>
		<div class="flex items-center justify-between gap-2">
			<label class="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
				<input type="checkbox" bind:checked={newNotePinned} class="rounded border-gray-300 dark:border-slate-600 text-emerald-500 focus:ring-emerald-500/40" />
				Pin to top
			</label>
			<button
				type="button"
				onclick={handleCreateNote}
				disabled={isCreating || !newNoteTitle.trim() || !newNoteContent.trim()}
				class="rounded-lg bg-emerald-500 dark:bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-600 dark:hover:bg-emerald-400 disabled:opacity-50"
			>
				Add Note
			</button>
		</div>
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
					class="group rounded-xl border px-4 py-3 transition {note.isPinned
						? 'border-emerald-500/40 dark:border-emerald-400/40 bg-emerald-50/50 dark:bg-emerald-950/20'
						: 'border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 hover:border-gray-300 dark:hover:border-slate-700'}"
				>
					{#if editingNoteId === note.id}
						<!-- Inline edit form -->
						<div class="space-y-2">
							<input
								type="text"
								bind:value={editTitle}
								placeholder="Title"
								class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
							/>
							<textarea
								bind:value={editContent}
								placeholder="Content"
								rows="3"
								class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 resize-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
							></textarea>
							<input
								type="text"
								bind:value={editTagsInput}
								placeholder="Tags (comma-separated)"
								class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-2 py-1.5 text-xs focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
							/>
							<div class="flex flex-wrap items-center gap-2">
								<label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
									<input type="checkbox" bind:checked={editPinned} class="rounded border-gray-300 dark:border-slate-600 text-emerald-500 focus:ring-emerald-500/40" />
									Pin
								</label>
								<button
									type="button"
									onclick={saveEdit}
									disabled={!editTitle.trim()}
									class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
								>
									Save
								</button>
								<button
									type="button"
									onclick={cancelEdit}
									class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									{#if note.isPinned}
										<span class="text-amber-500 dark:text-amber-400" title="Pinned">📌</span>
									{/if}
									<h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">{note.title}</h3>
								</div>
								<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">{truncateContent(note.content)}</p>
								<div class="mt-2 flex flex-wrap items-center gap-2">
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
							<div class="flex items-center gap-1 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
								<button
									type="button"
									onclick={() => handleTogglePin(note)}
									class="p-1 rounded text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 {note.isPinned ? 'text-amber-500 dark:text-amber-400' : ''}"
									aria-label={note.isPinned ? 'Unpin' : 'Pin'}
									title={note.isPinned ? 'Unpin' : 'Pin to top'}
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2h-2v2l2 2 2-2h2a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V5z" />
									</svg>
								</button>
								<button
									type="button"
									onclick={() => startEdit(note)}
									class="p-1 rounded text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
									aria-label="Edit note"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
								<button
									type="button"
									onclick={() => handleDeleteNote(note.id)}
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
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

