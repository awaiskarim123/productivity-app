<script lang="ts">
	import { onMount } from 'svelte';
	import { createHabit, fetchHabits, updateHabit, logHabit, deleteHabitLog, deleteHabit } from '$lib/api';
	import type { Habit, HabitLog } from '$lib/types';
	import dayjs from 'dayjs';

	let habits: Habit[] = [];
	let loading = true;
	let error: string | null = null;
	let newHabitName = '';
	let newHabitColor = '#34d399';
	let newHabitTargetDays = 7;
	let isCreating = false;
	let editingHabitId: string | null = null;
	let editName = '';
	let editColor = '#34d399';
	let editTargetDays = 7;

	export let limit = 10;

	const colors = [
		'#34d399',
		'#60a5fa',
		'#a78bfa',
		'#f472b6',
		'#fb923c',
		'#fbbf24',
		'#22d3ee',
		'#f87171'
	];

	async function loadHabits() {
		loading = true;
		error = null;
		try {
			const response = await fetchHabits({ isActive: true });
			habits = response.habits.slice(0, limit);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load habits';
			if (!errorMessage.includes('Unable to connect')) {
				error = errorMessage;
			} else {
				error = 'Connection error. Please check if the server is running.';
			}
		} finally {
			loading = false;
		}
	}

	function startEdit(habit: Habit) {
		editingHabitId = habit.id;
		editName = habit.name;
		editColor = habit.color;
		editTargetDays = habit.targetDays;
	}

	function cancelEdit() {
		editingHabitId = null;
	}

	async function saveEdit() {
		if (!editingHabitId || !editName.trim()) return;
		try {
			const response = await updateHabit(editingHabitId, {
				name: editName.trim(),
				color: editColor,
				targetDays: editTargetDays
			});
			habits = habits.map((h) => (h.id === editingHabitId ? response.habit : h));
			editingHabitId = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update habit';
		}
	}

	/** Count logs in the last 7 days (this week) for progress display */
	function logsThisWeek(habit: Habit): number {
		if (!habit.logs) return 0;
		const weekStart = dayjs().subtract(6, 'day').startOf('day');
		return habit.logs.filter((log) => dayjs(log.date).isAfter(weekStart) || dayjs(log.date).isSame(weekStart, 'day')).length;
	}

	async function handleCreateHabit() {
		if (!newHabitName.trim()) return;
		isCreating = true;
		try {
			await createHabit({
				name: newHabitName,
				color: newHabitColor,
				targetDays: newHabitTargetDays
			});
			newHabitName = '';
			newHabitColor = '#34d399';
			newHabitTargetDays = 7;
			await loadHabits();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create habit';
		} finally {
			isCreating = false;
		}
	}

	async function handleLogHabit(habitId: string, date?: string) {
		try {
			await logHabit(habitId, { date });
			await loadHabits();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to log habit';
		}
	}

	async function handleUnlogHabit(habitId: string, logId: string) {
		try {
			await deleteHabitLog(habitId, logId);
			await loadHabits();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to remove log';
		}
	}

	async function handleDeleteHabit(id: string) {
		try {
			await deleteHabit(id);
			await loadHabits();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete habit';
		}
	}

	function isLoggedToday(habit: Habit): boolean {
		if (!habit.logs) return false;
		const today = dayjs().startOf('day').toISOString();
		return habit.logs.some((log) => dayjs(log.date).startOf('day').toISOString() === today);
	}

	function getTodayLog(habit: Habit): HabitLog | null {
		if (!habit.logs) return null;
		const today = dayjs().startOf('day').toISOString();
		return habit.logs.find((log) => dayjs(log.date).startOf('day').toISOString() === today) || null;
	}

	onMount(() => {
		loadHabits();
	});
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Habits</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">Track your daily routines</p>
		</div>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{/if}

	<!-- Create Habit Form -->
	<div class="mb-3 space-y-2 rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
		<input
			type="text"
			bind:value={newHabitName}
			placeholder="Add a new habit..."
			class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			onkeydown={(e) => e.key === 'Enter' && handleCreateHabit()}
			disabled={isCreating}
		/>
		<div class="flex flex-wrap items-center gap-2">
			<div class="flex gap-1">
				{#each colors as color, index}
					<button
						type="button"
						onclick={() => (newHabitColor = color)}
						class="h-6 w-6 rounded-full border-2 transition {newHabitColor === color
							? 'border-gray-900 dark:border-white scale-110'
							: 'border-gray-300 dark:border-slate-600 hover:border-gray-500 dark:hover:border-slate-400'}"
						style="background-color: {color}"
						aria-label={`Select habit color ${index + 1}`}
					></button>
				{/each}
			</div>
			<label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
				<span>Target:</span>
				<select
					bind:value={newHabitTargetDays}
					class="rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-2 py-1 text-gray-900 dark:text-slate-100"
				>
					<option value={1}>1 day</option>
					<option value={3}>3 days</option>
					<option value={5}>5 days</option>
					<option value={7}>7 days</option>
				</select>
			</label>
			<button
				type="button"
				onclick={handleCreateHabit}
				disabled={isCreating || !newHabitName.trim()}
				class="ml-auto rounded-lg bg-emerald-500 dark:bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-600 dark:hover:bg-emerald-400 disabled:opacity-50"
			>
				Add
			</button>
		</div>
	</div>

	{#if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading habits...</div>
	{:else if habits.length === 0}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
			No habits yet. Create one to start tracking!
		</div>
	{:else}
		<ul class="space-y-2">
			{#each habits as habit}
				{@const loggedToday = isLoggedToday(habit)}
				{@const todayLog = getTodayLog(habit)}
				{@const weekCount = logsThisWeek(habit)}
				<li
					class="group rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3 transition hover:border-gray-300 dark:hover:border-slate-700"
				>
					{#if editingHabitId === habit.id}
						<!-- Inline edit form -->
						<div class="space-y-2">
							<input
								type="text"
								bind:value={editName}
								placeholder="Habit name"
								class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
							/>
							<div class="flex gap-1" role="group" aria-label="Habit color">
								{#each colors as c}
									<button
										type="button"
										onclick={() => (editColor = c)}
										class="h-6 w-6 rounded-full border-2 {editColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}"
										style="background-color: {c}"
										aria-label="Color {c}"
										aria-pressed={editColor === c}
									></button>
								{/each}
							</div>
							<div class="flex items-center gap-2">
								<select
									bind:value={editTargetDays}
									class="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-xs"
								>
									<option value={1}>1 day</option>
									<option value={3}>3 days</option>
									<option value={5}>5 days</option>
									<option value={7}>7 days</option>
								</select>
								<button
									type="button"
									onclick={saveEdit}
									disabled={!editName.trim()}
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
						<div class="flex items-center justify-between gap-3">
							<div class="flex items-center gap-3 flex-1 min-w-0">
								<div
									class="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
									style="background-color: {habit.color}20; border: 1px solid {habit.color}40"
								>
									{#if habit.icon}
										<span class="text-lg">{habit.icon}</span>
									{:else}
										<span class="text-lg">✓</span>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-gray-900 dark:text-slate-100">{habit.name}</p>
									<div class="mt-1 flex items-center gap-2 flex-wrap">
										<span class="text-xs text-gray-600 dark:text-slate-400">
											🔥 {habit.streak} day streak
										</span>
										{#if habit.targetDays > 0}
											<span class="text-xs text-gray-500 dark:text-slate-500">
												{weekCount}/{habit.targetDays} this week
											</span>
										{/if}
										{#if habit.bestStreak > habit.streak}
											<span class="text-xs text-gray-500 dark:text-slate-500">
												Best: {habit.bestStreak}
											</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								{#if loggedToday && todayLog}
									<button
										type="button"
										onclick={() => handleUnlogHabit(habit.id, todayLog.id)}
										class="rounded-lg border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-400/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100 dark:hover:bg-emerald-400/30"
									>
										✓ Done
									</button>
								{:else}
									<button
										type="button"
										onclick={() => handleLogHabit(habit.id)}
										class="rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-200 dark:hover:bg-slate-700/50"
									>
										Mark done
									</button>
								{/if}
								<button
									type="button"
									onclick={() => startEdit(habit)}
									class="opacity-100 md:opacity-0 transition md:group-hover:opacity-100 p-1 rounded text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
									aria-label="Edit habit"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
								<button
									type="button"
									onclick={() => handleDeleteHabit(habit.id)}
									class="opacity-100 md:opacity-0 transition md:group-hover:opacity-100"
									aria-label="Delete habit"
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

