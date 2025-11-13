<script lang="ts">
	import '../app.postcss';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
