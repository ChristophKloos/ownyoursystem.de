<script lang="ts">
	import '$lib/styles/variables.css';
	import '$lib/styles/global.css';
	import '$lib/styles/mobile.css';

	let { children } = $props();
</script>

<svelte:head>
	<script>
		if (history.scrollRestoration) {
			history.scrollRestoration = 'manual';
		}

		window.addEventListener('load', function () {
			window.scrollTo(0, 0);
		});
	</script>
</svelte:head>

<main>
	{@render children()}
</main>
