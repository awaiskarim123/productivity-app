<script lang="ts">
	import TaskList from '$lib/components/TaskList.svelte';
	import HabitTracker from '$lib/components/HabitTracker.svelte';
	import QuickNotes from '$lib/components/QuickNotes.svelte';
</script>

<div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-100 sm:text-3xl">Productivity Tools</h1>
		<p class="mt-2 text-sm text-slate-400 sm:text-base">
			Manage your tasks, track your habits, and capture your thoughts
		</p>
	</div>

	<div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<TaskList limit={20} />
		</div>
		<div class="space-y-4 sm:space-y-6">
			<HabitTracker limit={10} />
			<QuickNotes limit={10} />
		</div>
	</div>
</div>

