<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let name = '';
	let email = '';
	let password = '';
	let dailyGoalMinutes = 300;
	let errorMessage: string | null = null;

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		errorMessage = null;
		try {
			await authStore.register({ email, password, name, dailyGoalMinutes });
			goto('/dashboard');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to register';
		}
	};
</script>

<style>
	:global(.input-field) {
		@apply w-full rounded-xl border px-4 py-3 shadow-inner transition-all duration-200;
		@apply border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100;
		@apply placeholder:text-slate-400 dark:placeholder:text-slate-500;
		@apply focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30;
		@apply hover:border-slate-400 dark:hover:border-slate-600;
		@apply [&:-webkit-autofill]:!bg-white dark:[&:-webkit-autofill]:!bg-slate-800/50 [&:-webkit-autofill]:!text-slate-900 dark:[&:-webkit-autofill]:!text-slate-100;
		@apply [&:-webkit-autofill]:!shadow-[0_0_0_1000px_rgb(255_255_255)_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_1000px_rgb(30_41_59_/_0.5)_inset];
		@apply [&:-webkit-autofill:hover]:!bg-white dark:[&:-webkit-autofill:hover]:!bg-slate-800/50 [&:-webkit-autofill:focus]:!bg-white dark:[&:-webkit-autofill:focus]:!bg-slate-800/70 [&:-webkit-autofill:active]:!bg-white dark:[&:-webkit-autofill:active]:!bg-slate-800/50;
	}
</style>

<div class="w-full max-w-md space-y-6 sm:space-y-8 px-4">
	<div class="text-center">
		<h1 class="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Create your focus hub</h1>
		<p class="mt-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">Set goals, track work, and stay motivated</p>
	</div>

	<form class="space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 shadow-xl backdrop-blur sm:space-y-6 sm:p-8" on:submit={handleSubmit}>
		{#if errorMessage}
			<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
				{errorMessage}
			</div>
		{/if}

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
			<input
				type="text"
				bind:value={name}
				placeholder="Your name"
				autocomplete="name"
				class="input-field"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
			<input
				type="email"
				bind:value={email}
				required
				placeholder="you@example.com"
				autocomplete="email"
				class="input-field"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
			<input
				type="password"
				bind:value={password}
				required
				minlength={8}
				placeholder="Minimum 8 characters"
				autocomplete="new-password"
				class="input-field"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Daily focus goal (minutes)</span>
			<input
				type="number"
				min={30}
				max={1440}
				step={15}
				bind:value={dailyGoalMinutes}
				placeholder="300"
				class="input-field"
			/>
		</label>

		<button
			type="submit"
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
			disabled={$authStore.loading}
		>
			{#if $authStore.loading}
				<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
				<span>Creating workspace...</span>
			{:else}
				<span>Sign up</span>
			{/if}
		</button>
	</form>

	<p class="text-center text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
		Already tracking your focus?
		<a class="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300" href="/login">Sign in</a>
	</p>
</div>

