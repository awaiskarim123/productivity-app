<script lang="ts">
	import FocusHeatmap from '$lib/components/FocusHeatmap.svelte';
	import BurnoutCard from '$lib/components/BurnoutCard.svelte';
	import ProductivityScoreCard from '$lib/components/ProductivityScoreCard.svelte';
	import PeriodComparison from '$lib/components/PeriodComparison.svelte';
	import WeeklyInsights from '$lib/components/WeeklyInsights.svelte';
	import RecommendationsPanel from '$lib/components/RecommendationsPanel.svelte';
	import HabitImpactVisualization from '$lib/components/HabitImpactVisualization.svelte';
</script>

<div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Analytics</h1>
		<p class="mt-2 text-sm text-gray-600 dark:text-slate-400 sm:text-base">
			Focus heatmaps, burnout signals, productivity score, and period comparison
		</p>
	</div>

	<!-- Advanced analytics: heatmap, burnout, score, compare -->
	<section>
		<h2 class="mb-2 text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Focus & productivity</h2>
		<div class="grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-3">
			<FocusHeatmap />
			<div class="grid gap-2 sm:gap-3 sm:grid-cols-2">
				<BurnoutCard />
				<ProductivityScoreCard />
			</div>
			<div class="lg:col-span-2">
				<PeriodComparison />
			</div>
		</div>
	</section>

	<!-- Weekly insights & recommendations -->
	<section>
		<h2 class="mb-2 text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">Insights & recommendations</h2>
		<div class="grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-3">
			<WeeklyInsights />
			<RecommendationsPanel />
		</div>
	</section>

	<!-- Habit impact -->
	<section>
		<HabitImpactVisualization />
	</section>
</div>
