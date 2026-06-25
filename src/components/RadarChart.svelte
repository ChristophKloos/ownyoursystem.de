<script>
    import { onMount } from "svelte";
    import {
        Chart,
        RadarController,
        RadialLinearScale,
        PointElement,
        LineElement,
        Filler,
        Legend,
        Tooltip,
    } from "chart.js";

    Chart.register(
        RadarController,
        RadialLinearScale,
        PointElement,
        LineElement,
        Filler,
        Legend,
        Tooltip,
    );

    Chart.defaults.font.family = "'Atkinson Hyperlegible Next', sans-serif";

    export let labels = [];
    export let datasets = [];

    let canvas;
    let chart;
    let initialRender = true;

    $: if (chart && datasets && labels) {
        if (initialRender) {
            initialRender = false;
        } else {
            chart.data.labels = labels;

            datasets.forEach((newDataset, index) => {
                if (chart.data.datasets[index]) {
                    chart.data.datasets[index].data = newDataset.data;
                    chart.data.datasets[index].label = newDataset.label;
                } else {
                    chart.data.datasets[index] = newDataset;
                }
            });

            chart.update();
        }
    }

    onMount(() => {
        chart = new Chart(canvas, {
            type: "radar",
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                weight: "bold",
                            },
                        },
                    },
                },
                elements: {
                    line: { borderWidth: 2 },
                },
                scales: {
                    r: {
                        min: 0,
                        max: 3,
                        ticks: { stepSize: 1 },
                    },
                },
            },
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
