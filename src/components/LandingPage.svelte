<script>
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';
    import { baseTransition } from '../scripts/transitionConfig.js';

    export let mounted = false;

    const dispatch = createEventDispatcher();

    function start() {
        dispatch('start');
    }
</script>

<div class="quiz-container start-container" id="quiz-container">
    <div class="frage darkbox">
        <img src="/img/radar.webp" class="radar" alt="Radar Icon" />
        <h1>Distro Picker</h1>
    </div>
    {#if mounted}
        <div class="startpage whitebox" in:fly={{ y: -20, ...baseTransition }}>
            <p>
                Linux is all about choice, but finding the right start can be
                overwhelming. This <strong>community project</strong>
                helps you navigate the ecosystem by matching your workflow with the
                right desktop environment and distribution.<br /><br />
                It’s a quick 13-question journey.
                <strong>Privacy-first, no tracking, and no ads</strong>. Just a
                simple tool to help you discover a setup that feels like home.<br />
                <span class="attention">
                    <img src="/ui/warn.svg" class="warn-icon" alt="attention" /> Keep in mind that the weights are still being optimized so accuracy might vary.
                </span><br />
            </p>
            <button on:click={start} id="start-btn">Start</button>
        </div>
    {/if}
</div>

<style>
    .frage {
        padding: 16px 64px 16px 64px;
        margin-top: 18vh;
        overflow: visible;
    }

    .frage img.radar {
        width: auto;
        margin-left: auto;
        margin-right: auto;
        color: var(--text-white);
    }
       .start-container {
        margin: 0 auto;
    }

    .startpage {
        text-align: center;
        padding: 55px 32px 0 32px !important;
        margin-top: 0;
        margin: 0 32px;
    }

    .startpage p {
        font-size: var(--font-sm);
        
    }

    #start-btn {
        background: var(--bg-pop);
        color: var(--bg-backdrop);
          box-shadow: var(--shadow-harder);
         transition: var(--transition-snappy);
        border: none;
        padding: 12px 32px;
        border-radius: var(--radius-md);
        margin: 32px 0;
        cursor: pointer;
        font-weight: var(--text-weight-fat);
        font-size: var(--font-sm);
        border: var(--outline-weak);
    }

    #start-btn:hover {
        box-shadow: var(--shadow-hard);
        transform: translateY(-1.5px);

    }

    .radar {
        width: 64px !important;
        height: 64px !important;
        margin-bottom: 16px;
        margin-top: 24px;
        filter: drop-shadow(0rem 0.35rem 1rem rgba(0, 0, 0, 0.1)) !important;
        animation: fadeInOut 1s forwards ease 0.5s;
    }

   
.attention {
    display: inline-flex;
    align-items: center;
    text-align: left;
    gap: 8px;
    background-color: var(--bg-alt);
    padding: 8px 10px;
    margin-top: 28px;
    border-radius: var(--radius-sm);
    border: var(--outline-strong);
}
.warn-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: -1px;
    opacity: 0.8;
}
</style>