<script>
    import { fly } from "svelte/transition";

    export let q;
    export let index;
    export let total;
    export let answers;
    export let onAnswer;
    export let onNav;
    export let direction;

    $: progressWidth = (index / total) * 100;
    $: flyX = direction === "forward" ? 30 : -30;
</script>

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
                    class:active={answers[q.id] === parseInt(opt.value)}
                    on:mousedown|preventDefault={() =>
                        onAnswer(q.id, parseInt(opt.value))}
                >
                    <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={answers[q.id] === parseInt(opt.value)}
                    />
                    {@html opt.text}
                </label>
            {/each}
        </div>
    {/key}
</div>
