<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let errorMessage: string | null = null;

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		errorMessage = null;
		try {
			await authStore.login(email, password);
			goto('/dashboard');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to login';
		}
	};
</script>

<div class="w-full max-w-md space-y-8">
	<div class="text-center">
		<h1 class="text-3xl font-semibold text-white">Welcome back</h1>
		<p class="mt-2 text-sm text-slate-400">Track your focus and stay productive</p>
	</div>

	<form class="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur" on:submit={handleSubmit}>
		{#if errorMessage}
			<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
				{errorMessage}
			</div>
		{/if}

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-200">Email</span>
			<input
				type="email"
				bind:value={email}
				required
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
				placeholder="you@example.com"
				autocomplete="email"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-200">Password</span>
			<input
				type="password"
				bind:value={password}
				minlength={8}
				required
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
				placeholder="••••••••"
				autocomplete="current-password"
			/>
		</label>

		<button
			type="submit"
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
			disabled={$authStore.loading}
		>
			{#if $authStore.loading}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Signing in...</span>
			{:else}
				<span>Sign in</span>
			{/if}
		</button>
	</form>

	<p class="text-center text-sm text-slate-400">
		Don't have an account?
		<a class="font-medium text-emerald-400 hover:text-emerald-300" href="/register">Create one</a>
	</p>
</div>

