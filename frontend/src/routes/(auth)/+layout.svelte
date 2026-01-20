<script lang="ts">
	import { themeStore } from '$lib/stores/theme';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
	<!-- Theme Toggle Button -->
	<button
		type="button"
		onclick={() => themeStore.toggle()}
		aria-label="Toggle theme"
		class="fixed top-4 right-4 z-50 rounded-lg p-2.5 text-slate-600 dark:text-slate-400 transition bg-white dark:bg-slate-800 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
	>
		{#if $themeStore === 'dark'}
			<!-- Sun icon for light mode -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
		{:else}
			<!-- Moon icon for dark mode -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		{/if}
	</button>

	<div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
		{@render children()}
	</div>
</div>

