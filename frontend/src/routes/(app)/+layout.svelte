<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	let sidebarOpen = $state(false);

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			if (!state.initialized) return;
			if (!state.user) {
				goto('/login');
			}
		});

		return () => unsubscribe();
	});

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function handleOverlayKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			closeSidebar();
		}
	}

	const navItems = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>`
		},
		{
			label: 'Work Sessions',
			href: '/sessions',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>`
		},
		{
			label: 'Productivity',
			href: '/productivity',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
			</svg>`
		},
		{
			label: 'Goals & OKRs',
			href: '/goals',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
			</svg>`
		}
	];

	function isActive(href: string) {
		return $page.url.pathname === href;
	}
</script>

<div class="flex min-h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/95 backdrop-blur transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-72 {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<!-- Sidebar Header -->
			<div class="flex items-center justify-between border-b border-gray-200 dark:border-slate-800/60 px-3 py-3 sm:px-4">
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-emerald-500 dark:text-emerald-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-base font-semibold text-gray-900 dark:text-white">Focus Flow</h2>
						<p class="text-xs text-gray-500 dark:text-slate-400">Productivity</p>
					</div>
				</div>
				<div class="flex items-center gap-1">
					<!-- Theme Toggle -->
					<button
						type="button"
						onclick={() => themeStore.toggle()}
						aria-label="Toggle theme"
						class="rounded-lg p-1.5 text-gray-600 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200"
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
					<!-- Close Sidebar Button (Mobile) -->
					<button
						type="button"
						onclick={closeSidebar}
						aria-label="Close sidebar"
						class="rounded-lg p-1.5 text-gray-600 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200 lg:hidden"
					>
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
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 space-y-1 px-2 py-3 sm:px-3">
				{#each navItems as item}
					{@const active = isActive(item.href)}
					<a
						href={item.href}
						onclick={closeSidebar}
						class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition {active
							? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
							: 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'}"
					>
						{@html item.icon}
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<!-- User Section -->
			{#if $authStore.user}
				<div class="border-t border-gray-200 dark:border-slate-800/60 p-3">
					<div class="rounded-lg border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/50 p-2.5 sm:p-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
								<span class="text-sm font-semibold">
									{($authStore.user.name ?? 'U').charAt(0).toUpperCase()}
								</span>
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-gray-900 dark:text-slate-100">
									{$authStore.user.name ?? 'User'}
								</p>
								<p class="truncate text-xs text-gray-600 dark:text-slate-400">
									{$authStore.user.dailyGoalMinutes ?? 0} min goal
								</p>
							</div>
						</div>
						<button
							type="button"
							onclick={() => {
								authStore.logout();
								closeSidebar();
							}}
							class="mt-3 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-100 dark:hover:bg-slate-800"
						>
							Log out
						</button>
					</div>
				</div>
			{/if}
		</div>
	</aside>

	<!-- Overlay for mobile -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-20 bg-black/50 lg:hidden"
			role="button"
			aria-label="Close sidebar"
			onclick={closeSidebar}
			onkeydown={handleOverlayKeydown}
			tabindex="-1"
		></div>
	{/if}

	<!-- Main Content -->
	<div class="flex flex-1 flex-col">
		<!-- Mobile hamburger menu button -->
		<button
			type="button"
			onclick={toggleSidebar}
			aria-label="Open sidebar"
			class="fixed top-4 left-4 z-40 rounded-lg bg-white dark:bg-slate-800 p-2 text-gray-600 dark:text-slate-400 shadow-md dark:shadow-none border border-gray-200 dark:border-transparent transition hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200 lg:hidden"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<main class="flex-1 py-1.5 pr-1 pl-1 sm:py-2 sm:pr-1.5 sm:pl-1.5 lg:py-2 lg:pr-1 lg:pl-2">
			{@render children()}
		</main>
	</div>
</div>

