<script>
    import { fly } from "svelte/transition";

    export let q;
    export let index;
    export let total;
    export let answers;
    export let onAnswer;
    export let onNav;
    export let direction;

    $: progressWidth = total > 0 ? (index / total) * 100 : 0;
    $: flyX = direction === "forward" ? 30 : -30;

    function formatValue(val) {
        if (typeof val === 'boolean') return val;
        if (val === 'true') return true;
        if (val === 'false') return false;
        return Number(val);
    }
</script>

{#if q}
    <div class="part">
        <div class="frage darkbox">
            <img src="/ui/question/{q.icon}" alt="" class="question-icon" />
            <p>{@html q.question}</p>

            <div class="progress">
                <div class="progressinner" style="width: {progressWidth}%"></div>
            </div>

            {#if index > 0}
                <button class="nav-btn back-btn" on:click={() => onNav(index - 1)}>
                    <img src="/ui/arrow.svg" alt="back" />
                </button>
            {/if}

            {#if index < total - 1}
                <button
                    class="nav-btn forward-btn"
                    on:click={() => onNav(index + 1)}
                >
                    <img src="/ui/arrow.svg" alt="forward" />
                </button>
            {/if}
        </div>

        {#key q.id}
            <div class="choice" in:fly={{ x: flyX, duration: 300, opacity: 0 }}>
                {#each q.options as opt}
                    <label
                        class="whitebox"
                        class:active={answers[q.id] === formatValue(opt.value)}
                        on:mousedown|preventDefault={() =>
                            onAnswer(q.id, formatValue(opt.value))}
                    >
                        <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={answers[q.id] === formatValue(opt.value)}
                        />
                        {@html opt.text}
                    </label>
                {/each}
            </div>
        {/key}
    </div>
{/if}

<style>
    .frage {
    padding: 16px 64px 16px 64px;
    margin-top: 18vh;
    overflow: visible;
}



.frage img {
    width: auto;
    margin-left: auto;
    margin-right: auto;

    color: var(--text-white);
}

.question-icon {
    margin-top: 24px;
    height: 48px;
    margin-top: 32px;
    margin-bottom: 0px;
}

input[type="radio"] {
    display: none;
}

label {
    width: auto;
    height: auto;
    min-height: 60px;
    font-size: var(--font-sm);
    display: block;
    cursor: pointer;
    user-select: none;
    background-position: -64px -64px !important;
    margin: 0 16px 16px 16px;
    border: var(--outline-strong) !important;
    transition: var(--transition-snappy);
}


label:hover {
    box-shadow: var(--shadow-hard-hover);
    transform: translateY(-2px);
    background-position: 0px 0px !important;
    color: var(--text-dark);
}

.nav-btn {
    position: absolute;
    top: 0;
    height: 100%;
    width: 64px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
     transition: var(--transition-snappy);
    opacity: 0.6;
    z-index: 10;
}

.nav-btn.back-btn {
    left: 0;
}

.nav-btn.forward-btn {
    right: 0;
}

.nav-btn.back-btn:hover {
    background: linear-gradient(
        to right,
        rgba(100, 100, 100, 0.1),
        transparent
    );
    opacity: 1;
    border-top-left-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
}

.nav-btn.forward-btn:hover {
    background: linear-gradient(to left, rgba(100, 100, 100, 0.1), transparent);
    opacity: 1;
    border-top-right-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
}

.nav-btn img {
    width: 20px;
    height: auto;
    position: relative;
 
}

.forward-btn img {
    transform: rotate(90deg);
}

.back-btn img {
    transform: rotate(-90deg);
}

.frage .progress {
    display: block;
    position: relative;
    bottom: 0;
    left: 0;
    background: var(--bg-alt-dark);
    overflow: hidden;
    margin-top: 32px;
    margin-bottom: 24px;
}

</style>