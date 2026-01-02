<script lang="ts">
	import { updateProfile, changePassword, fetchProfile } from '$lib/api';
	import type { User, TimeSummary } from '$lib/types';
	import { onMount } from 'svelte';

	let profile: User | null = null;
	let summary: TimeSummary | null = null;
	let name = '';
	let dailyGoalMinutes = 300;
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let isSubmitting = false;
	let isChangingPassword = false;
	let error: string | null = null;
	let success: string | null = null;

	onMount(async () => {
		try {
			const response = await fetchProfile();
			profile = response.profile;
			summary = response.summary;
			name = profile.name || '';
			dailyGoalMinutes = profile.dailyGoalMinutes;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load profile';
		}
	});

	async function handleUpdateProfile(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		success = null;
		isSubmitting = true;

		try {
			const response = await updateProfile({
				name: name.trim() || undefined,
				dailyGoalMinutes
			});
			profile = response.profile;
			success = 'Profile updated successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update profile';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleChangePassword(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		success = null;

		if (newPassword !== confirmPassword) {
			error = 'New passwords do not match';
			return;
		}

		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		isChangingPassword = true;

		try {
			await changePassword({
				currentPassword,
				newPassword
			});
			success = 'Password changed successfully';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to change password';
		} finally {
			isChangingPassword = false;
		}
	}
</script>

<div class="space-y-6">
	{#if error}
		<div class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
			{success}
		</div>
	{/if}

	<!-- Profile Settings -->
	<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
		<h2 class="text-lg font-semibold text-slate-100 mb-4">Profile Settings</h2>
		<form on:submit={handleUpdateProfile} class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-slate-200 mb-2">
					Display Name
				</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label for="dailyGoalMinutes" class="block text-sm font-medium text-slate-200 mb-2">
					Daily Goal (minutes)
				</label>
				<input
					id="dailyGoalMinutes"
					type="number"
					bind:value={dailyGoalMinutes}
					min="30"
					max="1440"
					class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
				/>
				<p class="mt-1 text-xs text-slate-400">
					Target: {Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m per day
				</p>
			</div>

			{#if summary}
				<div class="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
					<p class="text-xs font-medium text-slate-400 mb-2">Today's Progress</p>
					<div class="flex items-center gap-2">
						<div class="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-emerald-500 transition-all"
								style="width: {Math.min(100, (summary.todayMinutes / dailyGoalMinutes) * 100)}%"
							></div>
						</div>
						<span class="text-xs text-slate-300 whitespace-nowrap">
							{summary.todayMinutes} / {dailyGoalMinutes} min
						</span>
					</div>
				</div>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isSubmitting}
					<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
					<span>Saving...</span>
				{:else}
					Save Profile
				{/if}
			</button>
		</form>
	</div>

	<!-- Change Password -->
	<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
		<h2 class="text-lg font-semibold text-slate-100 mb-4">Change Password</h2>
		<form on:submit={handleChangePassword} class="space-y-4">
			<div>
				<label for="currentPassword" class="block text-sm font-medium text-slate-200 mb-2">
					Current Password
				</label>
				<input
					id="currentPassword"
					type="password"
					bind:value={currentPassword}
					required
					minlength="8"
					class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
					placeholder="••••••••"
					autocomplete="current-password"
				/>
			</div>

			<div>
				<label for="newPassword" class="block text-sm font-medium text-slate-200 mb-2">
					New Password
				</label>
				<input
					id="newPassword"
					type="password"
					bind:value={newPassword}
					required
					minlength="8"
					class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
					placeholder="••••••••"
					autocomplete="new-password"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-slate-200 mb-2">
					Confirm New Password
				</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					required
					minlength="8"
					class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
					placeholder="••••••••"
					autocomplete="new-password"
				/>
			</div>

			<button
				type="submit"
				disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
				class="w-full rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isChangingPassword}
					<span class="h-3 w-3 animate-ping rounded-full bg-white"></span>
					<span>Changing...</span>
				{:else}
					Change Password
				{/if}
			</button>
		</form>
	</div>
</div>

