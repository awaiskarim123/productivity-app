<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			if (!state.initialized) return;
			if (!state.user) {
				goto('/login');
			}
		});

		return () => unsubscribe();
	});
</script>

<div class="flex min-h-screen w-full bg-slate-950 text-slate-100">
	<div class="flex w-full flex-col">
		<header class="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
			<div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
				<div class="min-w-0 flex-1">
					<h1 class="text-lg font-semibold text-white sm:text-xl">Focus Flow</h1>
					<p class="hidden text-xs text-slate-400 sm:block">Stay consistent. Stay motivated.</p>
				</div>
				{#if $authStore.user}
					<div class="flex flex-shrink-0 items-center gap-2 sm:gap-4">
						<div class="hidden text-right sm:block">
							<p class="text-sm font-medium text-slate-100">
								{$authStore.user.name ?? 'Teammate'}
							</p>
							<p class="text-xs text-slate-400">Daily goal: {$authStore.user.dailyGoalMinutes} min</p>
						</div>
						<div class="block text-right sm:hidden">
							<p class="text-xs font-medium text-slate-100">
								{$authStore.user.name ?? 'User'}
							</p>
						</div>
						<button
							type="button"
							class="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 sm:px-4 sm:py-2"
							onclick={() => authStore.logout()}
						>
							<span class="hidden sm:inline">Log out</span>
							<span class="sm:hidden">Out</span>
						</button>
					</div>
				{/if}
			</div>
		</header>

		<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
			{@render children()}
		</main>
	</div>
</div>

