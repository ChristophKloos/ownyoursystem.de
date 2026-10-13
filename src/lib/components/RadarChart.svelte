<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		Chart,
		Filler,
		Legend,
		LineElement,
		PointElement,
		RadarController,
		RadialLinearScale,
		Tooltip,
		type ChartDataset
	} from 'chart.js';

	Chart.register(
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler,
		Legend,
		Tooltip
	);

	Chart.defaults.font.family = "'Geist', sans-serif";

	interface RadarDataset {
		label: string;
		data: number[];
		backgroundColor: string;
		borderColor: string;
		pointBackgroundColor: string;
	}

	interface Props {
		labels?: string[];
		datasets?: RadarDataset[];
	}

	let { labels = [], datasets = [] }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined = $state();

	$effect(() => {
		const currentLabels = labels;
		const currentDatasets = datasets;

		const current = chart;
		if (!current) return;

		untrack(() => {
			current.data.labels = [...currentLabels];
			const chartDatasets = current.data.datasets as ChartDataset<'radar'>[];

			currentDatasets.forEach((ds, i) => {
				const existing = chartDatasets[i];
				if (existing) {
					existing.data = [...ds.data];
					existing.label = ds.label;
				} else {
					chartDatasets[i] = { ...ds, data: [...ds.data] };
				}

				if (i === 0) {
					chartDatasets[0].borderColor = 'oklch(81.5% 0.137 163.1)';
					chartDatasets[0].backgroundColor = 'oklch(81.5% 0.137 163.1 / 0.2)';
					chartDatasets[0].pointBackgroundColor = 'oklch(81.5% 0.137 163.1)';
				}
			});

			current.update();
		});
	});

	onMount(() => {
		if (!canvas) return;

		const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		Chart.defaults.color = isDark ? '#ffffff' : '#666666';
		Chart.defaults.borderColor = isDark ? '#333333' : '#e0e0e0';

		const initDatasets = datasets.map((ds, i) => {
			const copy = { ...ds, data: [...ds.data] };
			if (i === 0) {
				copy.borderColor = 'oklch(81.5% 0.137 163.1)';
				copy.backgroundColor = 'oklch(81.5% 0.137 163.1 / 0.2)';
				copy.pointBackgroundColor = 'oklch(81.5% 0.137 163.1)';
			}
			return copy;
		});

		chart = new Chart(canvas, {
			type: 'radar',
			data: {
				labels: [...labels],
				datasets: initDatasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						labels: {
							font: {
								weight: 'bold'
							}
						}
					}
				},
				elements: {
					line: { borderWidth: 2 }
				},
				scales: {
					r: {
						min: -25,
						max: 100,
						ticks: {
							stepSize: 25,
							backdropColor: 'transparent',
							callback: function (value) {
								if (Number(value) < 0) return '';
								return value;
							}
						}
					}
				}
			}
		});

		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<div class="chart-container">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
		height: 300px;
	}
</style>
