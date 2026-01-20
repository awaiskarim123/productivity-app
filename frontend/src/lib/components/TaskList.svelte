<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createTask,
		fetchTasks,
		updateTask,
		deleteTask,
		fetchTaskStats
	} from '$lib/api';
	import type { Task, TaskStats } from '$lib/types';
	import dayjs from 'dayjs';

	let tasks: Task[] = [];
	let stats: TaskStats | null = null;
	let loading = true;
	let error: string | null = null;
	let showCompleted = false;
	let newTaskTitle = '';
	let newTaskDescription = '';
	let newTaskPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
	let isCreating = false;

	export let limit = 10;

	async function loadTasks() {
		loading = true;
		error = null;
		try {
			const [tasksResponse, statsResponse] = await Promise.all([
				fetchTasks({ completed: false, limit }),
				fetchTaskStats()
			]);
			tasks = tasksResponse.tasks;
			stats = statsResponse;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
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

	async function handleCreateTask() {
		if (!newTaskTitle.trim()) return;
		isCreating = true;
		try {
			const response = await createTask({
				title: newTaskTitle,
				description: newTaskDescription || undefined,
				priority: newTaskPriority
			});
			tasks = [response.task, ...tasks];
			newTaskTitle = '';
			newTaskDescription = '';
			newTaskPriority = 'MEDIUM';
			await loadTasks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create task';
		} finally {
			isCreating = false;
		}
	}

	async function handleToggleComplete(task: Task) {
		try {
			const response = await updateTask(task.id, { completed: !task.completed });
			tasks = tasks.map((t) => (t.id === task.id ? response.task : t));
			await loadTasks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update task';
		}
	}

	async function handleDeleteTask(id: string) {
		try {
			await deleteTask(id);
			tasks = tasks.filter((t) => t.id !== id);
			await loadTasks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete task';
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'URGENT':
				return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
			case 'HIGH':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
			case 'MEDIUM':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
			case 'LOW':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
			default:
				return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
		}
	}

	function isOverdue(dueDate: string | null) {
		if (!dueDate) return false;
		return dayjs(dueDate).isBefore(dayjs(), 'day');
	}

	onMount(() => {
		loadTasks();
	});
</script>

<div class="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4 shadow-sm dark:shadow-none">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Tasks</h2>
			{#if stats}
				<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">
					{stats.total} active • {stats.overdue} overdue
				</p>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
			{error}
		</div>
	{/if}

	<!-- Create Task Form -->
	<div class="mb-3 space-y-2 rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
		<input
			type="text"
			bind:value={newTaskTitle}
			placeholder="Add a new task..."
			class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			onkeydown={(e) => e.key === 'Enter' && handleCreateTask()}
			disabled={isCreating}
		/>
		<div class="flex gap-2">
			<select
				bind:value={newTaskPriority}
				class="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs text-gray-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
			>
				<option value="LOW">Low</option>
				<option value="MEDIUM">Medium</option>
				<option value="HIGH">High</option>
				<option value="URGENT">Urgent</option>
			</select>
			<button
				type="button"
				onclick={handleCreateTask}
				disabled={isCreating || !newTaskTitle.trim()}
				class="rounded-lg bg-emerald-500 dark:bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-600 dark:hover:bg-emerald-400 disabled:opacity-50"
			>
				Add
			</button>
		</div>
	</div>

	{#if loading}
		<div class="py-4 text-center text-sm text-gray-600 dark:text-slate-400">Loading tasks...</div>
	{:else if tasks.length === 0}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-6 text-center text-sm text-gray-600 dark:text-slate-400">
			No tasks yet. Create one to get started!
		</div>
	{:else}
		<ul class="space-y-2">
			{#each tasks as task}
				<li
					class="group rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 px-4 py-3 transition hover:border-gray-300 dark:hover:border-slate-700"
				>
					<div class="flex items-start gap-3">
						<button
							type="button"
							onclick={() => handleToggleComplete(task)}
							class="mt-0.5 flex-shrink-0"
						>
							<div
								class="h-5 w-5 rounded border-2 transition {task.completed
									? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500 dark:bg-emerald-400'
									: 'border-gray-400 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400'}"
							>
								{#if task.completed}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-full w-full text-white"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
							</div>
						</button>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 min-w-0">
									<p
										class="text-sm font-medium {task.completed
											? 'text-gray-400 dark:text-slate-500 line-through'
											: 'text-gray-900 dark:text-slate-100'}"
									>
										{task.title}
									</p>
									{#if task.description}
										<p class="mt-1 text-xs text-gray-600 dark:text-slate-400">{task.description}</p>
									{/if}
									<div class="mt-2 flex flex-wrap items-center gap-2">
										<span
											class="rounded-full border px-2 py-0.5 text-xs font-medium {getPriorityColor(
												task.priority
											)}"
										>
											{task.priority}
										</span>
										{#if task.dueDate}
											<span
												class="text-xs {isOverdue(task.dueDate)
													? 'text-rose-600 dark:text-rose-400'
													: 'text-gray-600 dark:text-slate-400'}"
											>
												Due: {dayjs(task.dueDate).format('MMM D')}
											</span>
										{/if}
									</div>
								</div>
								<button
									type="button"
									onclick={() => handleDeleteTask(task.id)}
									class="opacity-100 md:opacity-0 transition md:group-hover:opacity-100"
									aria-label="Delete task"
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
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

