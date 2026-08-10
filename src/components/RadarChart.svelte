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

    function applyStyles(ds, i) {
        const styledDs = { ...ds, data: [...ds.data] };
        if (i === 0) {
            styledDs.borderColor = "oklch(81.5% 0.137 163.1)";
            styledDs.backgroundColor = "oklch(81.5% 0.137 163.1 / 0.2)";
            styledDs.pointBackgroundColor = "oklch(81.5% 0.137 163.1)";
        }
        return styledDs;
    }

    $: if (chart && datasets && labels) {
        chart.data.labels = labels;
        
        datasets.forEach((rawDs, i) => {
            const newDs = applyStyles(rawDs, i);
            if (chart.data.datasets[i]) {
                Object.assign(chart.data.datasets[i], newDs);
            } else {
                chart.data.datasets[i] = newDs;
            }
        });

        chart.update(); 
    }

    onMount(() => {
        chart = new Chart(canvas, {
            type: "radar",
            data: { 
                labels, 
                datasets: datasets.map(applyStyles)
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
                        ticks: { stepSize: 25, backdropColor: "transparent" },
                        
                    },
                },
            },
        });

        return () => {
            if (chart) chart.destroy();
        };
    });

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    Chart.defaults.color = isDark ? '#ffffff' : '#666666';
    Chart.defaults.borderColor = isDark ? '#333333' : '#e0e0e0';
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

