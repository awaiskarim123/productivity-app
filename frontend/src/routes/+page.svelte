<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let message = 'Preparing your workspace...';

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			if (!state.initialized) return;
			if (state.user) {
				goto('/dashboard');
			} else {
				goto('/login');
			}
			unsubscribe();
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
	<div class="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-8 shadow-lg backdrop-blur">
		<div class="flex items-center gap-3">
			<span class="h-3 w-3 animate-ping rounded-full bg-emerald-400"></span>
			<p class="text-sm font-medium text-slate-300">{message}</p>
		</div>
	</div>
</div>
