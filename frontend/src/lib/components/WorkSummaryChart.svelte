<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onDestroy, onMount } from 'svelte';

	export let title = 'Productivity';
	export let labels: string[] = [];
	export let data: number[] = [];
	export let accentColor = '#34d399';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	const chartConfig = () => ({
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
					pointBorderColor: '#0f172a'
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
					backgroundColor: '#0f172a',
					titleColor: '#e2e8f0',
					bodyColor: '#cbd5f5',
					borderColor: '#1e293b',
					borderWidth: 1,
					padding: 12
				}
			},
			scales: {
				x: {
					grid: {
						color: '#1e293b66'
					},
					ticks: {
						color: '#94a3b8'
					}
				},
				y: {
					beginAtZero: true,
					grid: {
						color: '#1e293b33'
					},
					ticks: {
						color: '#94a3b8'
					}
				}
			}
		}
	});

	onMount(() => {
		chart = new Chart(canvas, chartConfig());
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

