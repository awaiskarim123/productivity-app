<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onDestroy, onMount } from 'svelte';

	export let title = 'Productivity';
	export let labels: string[] = [];
	export let data: number[] = [];
	export let accentColor = '#34d399';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function isDarkTheme(): boolean {
		if (typeof document === 'undefined') return true;
		return document.documentElement.classList.contains('dark');
	}

	const chartConfig = () => {
		const isDark = isDarkTheme();
		return {
			type: 'line' as const,
			data: {
				labels,
				datasets: [
					{
						label: title,
						data,
						borderColor: accentColor,
						backgroundColor: `${accentColor}33`,
						fill: true,
						tension: 0.35,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: accentColor,
						pointBorderColor: isDark ? '#0f172a' : '#ffffff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						backgroundColor: isDark ? '#0f172a' : '#ffffff',
						titleColor: isDark ? '#e2e8f0' : '#111827',
						bodyColor: isDark ? '#cbd5f5' : '#374151',
						borderColor: isDark ? '#1e293b' : '#e5e7eb',
						borderWidth: 1,
						padding: 12
					}
				},
				scales: {
					x: {
						grid: {
							color: isDark ? '#1e293b66' : '#e5e7eb66'
						},
						ticks: {
							color: isDark ? '#94a3b8' : '#6b7280'
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: isDark ? '#1e293b33' : '#e5e7eb33'
						},
						ticks: {
							color: isDark ? '#94a3b8' : '#6b7280'
						}
					}
				}
			}
		};
	};

	onMount(() => {
		chart = new Chart(canvas, chartConfig());

		// Listen for theme changes
		const observer = new MutationObserver(() => {
			if (chart) {
				chart.destroy();
				chart = new Chart(canvas, chartConfig());
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	$: if (chart) {
		chart.data.labels = labels;
		chart.data.datasets[0].data = data;
		chart.update();
	}
</script>

<div class="h-48 w-full sm:h-64">
	<canvas bind:this={canvas}></canvas>
</div>

