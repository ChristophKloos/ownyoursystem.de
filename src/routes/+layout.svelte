<script lang="ts">
    import { onMount } from 'svelte';
    import Header from './Header.svelte';
    import Sidebar from './Sidebar.svelte';

    import '../styles/global.css';
    import '../styles/theme_light.css';
    import '../styles/theme_dark.css';
    import '../styles/mobile.css';

    export let title = "Own Your System";

    let isSidebarOpen = false;

    function handleOpenSidebar() {
        isSidebarOpen = true;
    }

    onMount(() => {
        if (history.scrollRestoration) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
    });
</script>

<svelte:head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=0.75" />
    <title>{title}</title>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
</svelte:head>

<Sidebar bind:isOpen={isSidebarOpen} />
<Header on:openSidebar={handleOpenSidebar} />

<main>
    <slot />
</main>