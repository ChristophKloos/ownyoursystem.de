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

    Chart.defaults.font.family = "'Gabarito', sans-serif";

    export let labels = [];
    export let datasets = [];

    let canvas;
    let chart;

    $: if (chart && datasets && labels) {
        chart.data.labels = labels;
        
        datasets.forEach((newDs, i) => {
            if (chart.data.datasets[i]) {
                chart.data.datasets[i].data = [...newDs.data];
                chart.data.datasets[i].label = newDs.label;
            } else {
                chart.data.datasets[i] = { ...newDs, data: [...newDs.data] };
            }
        });

        chart.update(); 
    }

    onMount(() => {
        chart = new Chart(canvas, {
            type: "radar",
            data: { 
                labels, 
                datasets: datasets.map(ds => ({ ...ds, data: [...ds.data] })) 
            },
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
                        max: 100,
                        ticks: { stepSize: 25 },
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
