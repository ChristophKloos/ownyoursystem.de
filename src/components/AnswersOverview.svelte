<script>
    import { onMount } from 'svelte';
    import { DEFAULT_BIAS } from '../scripts/logic.ts'; 

    export let questions;
    export let answers;
    export let onUpdate;

    let localValues = {
        bias: answers.bias !== undefined ? Number(answers.bias) : DEFAULT_BIAS
    };

    onMount(() => {
        if (answers.bias === undefined) {
            updateGlobal('bias', DEFAULT_BIAS);
        }
    });

    function getMin(options) {
        if (!options || options.length === 0) return 0;
        return Math.min(...options.map((o) => Number(o.value)));
    }

    function getMax(options) {
        if (!options || options.length === 0) return 100;
        return Math.max(...options.map((o) => Number(o.value)));
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, Number(val)));
    }

    // Sync incoming answers to local values and ensure they are clamped
    $: {
        for (let q of (questions || [])) {
            let id = q.id;
            if (answers[id] !== undefined) {
                if (q._ruleType === 'boolean') {
                    localValues[id] = answers[id];
                } else {
                    localValues[id] = clamp(answers[id], getMin(q.options), getMax(q.options));
                }
            } else if (localValues[id] === undefined) {
                localValues[id] = q._ruleType === 'boolean' ? false : getMin(q.options);
            }
        }
    }

    function getClosestText(options, val) {
        if (val === undefined || !options || options.length === 0) return "";
        
        if (typeof val === 'boolean' || options.some(o => typeof o.value === 'boolean' || o.value === 'true' || o.value === 'false')) {
            const opt = options.find((o) => String(o.value) === String(val));
            return opt ? opt.text : "";
        }

        const numVal = Number(val);
        return options.reduce((prev, curr) => {
            const prevDiff = Math.abs(Number(prev.value) - numVal);
            const currDiff = Math.abs(Number(curr.value) - numVal);
            return currDiff < prevDiff ? curr : prev;
        }).text;
    }

    function updateGlobal(id, val, isBoolean = false) {
        let finalVal = isBoolean ? (String(val) === 'true') : Number(val);
        localValues[id] = finalVal;
        answers[id] = finalVal;
        onUpdate(id, finalVal);
    }
</script>

<div class="resultheader darkbox">
    <img
        src="/ui/application-x-sharedlib-symbolic.svg"
        alt="Placeholder"
        class="question-icon"
    />
    <p>You can fine tune <b>your answers</b> by dragging the slider or toggling options.</p>
</div>

<div class="overview-list">
    {#each questions as q}
        <div class="whitebox overview-item">
            <div class="item-header">
                <div class="question-tag">
                    <img
                        src="/ui/question/{q.icon}"
                        alt={q.title}
                        class="small-icon"
                    />
                    <span class="title-text">{q.title}</span>
                </div>
                <p class="answer-text">
                    {@html getClosestText(q.options, localValues[q.id])}
                </p>
            </div>

           {#if q._ruleType === 'boolean'}
                <div class="boolean-toggles">
                    {#each q.options as opt}
                        <label 
                            class="radioanswer" 
                            class:active={String(localValues[q.id]) === String(opt.value)}
                        >
                            <input
                                type="radio"
                                name={q.id}
                                value={opt.value}
                                checked={String(localValues[q.id]) === String(opt.value)}
                                on:change={(e) => updateGlobal(q.id, e.target.value, true)}
                            />
                            {@html opt.text}
                        </label>
                    {/each}
                </div>
            {:else}
                <input
                    type="range"
                    class="slider"
                    min={getMin(q.options)}
                    max={getMax(q.options)}
                    step="1"
                    value={localValues[q.id]}
                    on:change={(e) => updateGlobal(q.id, e.target.value)}
                />
            {/if}
        </div>
    {/each}

    <div class="whitebox overview-item">
        <div class="item-header">
            <div class="question-tag">
                <img
                    src="/ui/application-x-sharedlib-symbolic.svg" 
                    alt="Bias"
                    class="small-icon"
                />
                <span class="title-text">Community Bias</span>
            </div>
            <p class="answer-text">
                {localValues.bias}% Influence
            </p>
        </div>
        <input
            type="range"
            class="slider"
            min="0"
            max="100"
            step="1"
            value={localValues.bias}
            on:change={(e) => updateGlobal('bias', e.target.value)}
        />
    </div>
</div>