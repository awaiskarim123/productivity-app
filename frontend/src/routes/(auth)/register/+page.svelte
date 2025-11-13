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

<div class="w-full max-w-2xl space-y-8">
	<div class="text-center">
		<h1 class="text-3xl font-semibold text-white">Create your focus hub</h1>
		<p class="mt-2 text-sm text-slate-400">Set goals, track work, and stay motivated</p>
	</div>

	<form class="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur md:grid-cols-2" on:submit={handleSubmit}>
		{#if errorMessage}
			<div class="md:col-span-2 rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
				{errorMessage}
			</div>
		{/if}

		<label class="space-y-2">
			<span class="text-sm font-medium text-slate-200">Name</span>
			<input
				type="text"
				bind:value={name}
				placeholder="Your name"
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
		</label>

		<label class="space-y-2">
			<span class="text-sm font-medium text-slate-200">Email</span>
			<input
				type="email"
				bind:value={email}
				required
				placeholder="you@example.com"
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
		</label>

		<label class="space-y-2">
			<span class="text-sm font-medium text-slate-200">Password</span>
			<input
				type="password"
				bind:value={password}
				required
				minlength={8}
				placeholder="Minimum 8 characters"
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
		</label>

		<label class="space-y-2">
			<span class="text-sm font-medium text-slate-200">Daily focus goal (minutes)</span>
			<input
				type="number"
				min={30}
				max={1440}
				step={15}
				bind:value={dailyGoalMinutes}
				class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
			/>
		</label>

		<button
			type="submit"
			class="md:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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

	<p class="text-center text-sm text-slate-400">
		Already tracking your focus?
		<a class="font-medium text-emerald-400 hover:text-emerald-300" href="/login">Sign in</a>
	</p>
</div>

