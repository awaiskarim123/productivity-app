<script lang="ts">
	import type { FocusSession } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';

	export let activeSession: FocusSession | null = null;
	export let onStartFocus: (targetMinutes: number, notes?: string) => Promise<FocusSession>;
	export let onStartBreak: (targetMinutes: number, notes?: string) => Promise<FocusSession>;
	export let onEndSession: (
		sessionId: string,
		payload: { completed: boolean; distractions: number; notes?: string }
	) => Promise<FocusSession | void>;

	let focusDuration = 25;
	let breakDuration = 5;
	let notes = '';
	let distractions = 0;

	let remainingSeconds = focusDuration * 60;
	let timerId: ReturnType<typeof setInterval> | null = null;
let currentSessionId: string | null = null;

	function clearTimer() {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	function setupTimer(session: FocusSession | null) {
	if (session?.id === currentSessionId && timerId) {
		return;
	}
	currentSessionId = session ? session.id : null;
		clearTimer();
		if (!session) {
			remainingSeconds = focusDuration * 60;
			return;
		}

		const computeRemaining = () => {
			const startedAt = new Date(session.startedAt).getTime();
			const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
			const targetSeconds = session.targetMinutes * 60;
			const remaining = targetSeconds - elapsedSeconds;
			remainingSeconds = remaining > 0 ? remaining : 0;
			if (remainingSeconds === 0) {
				clearTimer();
			}
		};

		computeRemaining();
		timerId = setInterval(computeRemaining, 1000);
	}

	onMount(() => {
		setupTimer(activeSession);
	});

	onDestroy(() => {
		clearTimer();
	});

	$: setupTimer(activeSession);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleStart = async (mode: 'FOCUS' | 'BREAK') => {
		try {
			const session =
				mode === 'FOCUS'
					? await onStartFocus(focusDuration, notes || undefined)
					: await onStartBreak(breakDuration, notes || undefined);
			distractions = 0;
			setupTimer(session);
		} catch (error) {
			console.error('Failed to start focus session', error);
		}
	};

	const handleEnd = async (completed: boolean) => {
		if (!activeSession) return;
		try {
			await onEndSession(activeSession.id, {
				completed,
				distractions,
				notes: notes || undefined
			});
		} catch (error) {
			console.error('Failed to end session', error);
		} finally {
			currentSessionId = null;
			distractions = 0;
			notes = '';
			setupTimer(null);
		}
	};

	const incrementDistractions = (delta: number) => {
		distractions = Math.max(0, distractions + delta);
	};
</script>

<div class="min-w-0 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm dark:shadow-lg backdrop-blur sm:p-6">
	<div class="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start md:justify-between">
		<div class="min-w-0">
			<h2 class="text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Focus Timer</h2>
			<p class="mt-1 text-xs text-gray-600 dark:text-slate-400 sm:text-sm">
				Stay in flow with guided Pomodoro-style focus and recovery blocks
			</p>
		</div>
		{#if activeSession}
			<span
				class="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
			>
				{activeSession.mode === 'FOCUS' ? 'Focus session' : 'Break in progress'}
			</span>
		{/if}
	</div>

	<div class="mt-6 grid min-w-0 grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
		<div class="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/50 p-4 sm:p-6 md:p-8">
			<div class="relative flex h-40 w-40 items-center justify-center rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 sm:h-48 sm:w-48">
				<svg class="absolute h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
					<circle
						class="stroke-gray-200 dark:stroke-slate-800"
						cx="50"
						cy="50"
						r="45"
						stroke-width="6"
						fill="none"
					/>
					{#if activeSession}
						<circle
							class="transition-all duration-500 ease-out"
							cx="50"
							cy="50"
							r="45"
							stroke-width="6"
							fill="none"
							stroke={activeSession.mode === 'FOCUS' ? '#34d399' : '#60a5fa'}
							stroke-dasharray="282"
							stroke-dashoffset={Math.max(
								0,
								282 -
									(remainingSeconds / (activeSession.targetMinutes * 60)) *
										282
							)}
						/>
					{/if}
				</svg>
				<div class="relative flex flex-col items-center justify-center gap-1">
					<span class="text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
						{formatTime(activeSession ? remainingSeconds : focusDuration * 60)}
					</span>
					<span class="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
						{#if activeSession}
							{activeSession.mode === 'FOCUS' ? 'Focus' : 'Break'} remaining
						{:else}
							Ready to start
						{/if}
					</span>
				</div>
			</div>

			{#if activeSession}
				<div class="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
					<button
						class="rounded-xl border border-emerald-200 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-200 transition hover:bg-emerald-100 dark:hover:bg-emerald-500/20 sm:px-4 sm:py-2 sm:text-sm"
						type="button"
						onclick={() => handleEnd(true)}
					>
						Complete session
					</button>
					<button
						class="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 transition hover:bg-gray-200 dark:hover:bg-slate-700 sm:px-4 sm:py-2 sm:text-sm"
						type="button"
						onclick={() => handleEnd(false)}
					>
						End early
					</button>
				</div>
			{:else}
				<div class="mt-4 grid w-full gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
					<button
						class="rounded-xl bg-emerald-500 dark:bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 dark:hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 sm:px-4 sm:py-3 sm:text-sm"
						type="button"
						onclick={() => handleStart('FOCUS')}
					>
						Start focus session
					</button>
					<button
						class="rounded-xl bg-sky-500 dark:bg-sky-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-600 dark:hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:px-4 sm:py-3 sm:text-sm"
						type="button"
						onclick={() => handleStart('BREAK')}
					>
						Start break
					</button>
				</div>
			{/if}
		</div>

		<div class="min-w-0 space-y-4 sm:space-y-6">
			<div class="grid gap-3 sm:gap-4">
				<label class="space-y-2">
					<span class="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-400">
						<span>Focus length</span>
						<span class="text-emerald-600 dark:text-emerald-300">{focusDuration} minutes</span>
					</span>
					<input
						type="range"
						min={15}
						max={90}
						step={5}
						bind:value={focusDuration}
						disabled={Boolean(activeSession)}
						class="w-full accent-emerald-500 dark:accent-emerald-400"
					/>
				</label>

				<label class="space-y-2">
					<span class="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-400">
						<span>Break length</span>
						<span class="text-sky-600 dark:text-sky-300">{breakDuration} minutes</span>
					</span>
					<input
						type="range"
						min={3}
						max={30}
						step={1}
						bind:value={breakDuration}
						disabled={Boolean(activeSession)}
						class="w-full accent-sky-500 dark:accent-sky-400"
					/>
				</label>
			</div>

			<div class="space-y-3">
				<div class="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-400">
					<span>Distractions tracked</span>
					<span class="text-rose-600 dark:text-rose-300">{distractions}</span>
				</div>
				<div class="flex items-center gap-3">
					<button
						type="button"
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-slate-700 text-lg text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-800"
						onclick={() => incrementDistractions(-1)}
					>
						-
					</button>
					<button
						type="button"
						class="flex h-10 w-10 items-center justify-center rounded-full border border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-lg text-rose-600 dark:text-rose-200 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
						onclick={() => incrementDistractions(1)}
					>
						+
					</button>
				</div>
			</div>

			<div class="space-y-2">
				<label class="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-400" for="focus-notes"
					>Notes</label
				>
				<textarea
					id="focus-notes"
					bind:value={notes}
					rows={3}
					placeholder="What are you focusing on? Any blockers?"
					class="w-full resize-none rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40"
				></textarea>
			</div>
		</div>
	</div>
</div>

