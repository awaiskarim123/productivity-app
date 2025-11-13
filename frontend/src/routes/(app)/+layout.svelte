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
			<div class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
				<div>
					<h1 class="text-xl font-semibold text-white">Focus Flow</h1>
					<p class="text-xs text-slate-400">Stay consistent. Stay motivated.</p>
				</div>
				{#if $authStore.user}
					<div class="flex items-center gap-4">
						<div class="text-right">
							<p class="text-sm font-medium text-slate-100">
								{$authStore.user.name ?? 'Teammate'}
							</p>
							<p class="text-xs text-slate-400">Daily goal: {$authStore.user.dailyGoalMinutes} min</p>
						</div>
						<button
							type="button"
							class="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
							onclick={() => authStore.logout()}
						>
							Log out
						</button>
					</div>
				{/if}
			</div>
		</header>

		<main class="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
			{@render children()}
		</main>
	</div>
</div>

