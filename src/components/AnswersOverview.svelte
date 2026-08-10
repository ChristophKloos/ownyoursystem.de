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

<style>

    .slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: transparent;
  overflow: hidden; 
}

.slider::-webkit-slider-runnable-track {
  background-color: var(--bg-alt);
  height: 6px;
  border-radius: 10px;
  border: var(--outline-weak);
    box-shadow: var(--shadow-harder);
}

.slider::-moz-range-track {
  background-color: var(--bg-alt);
  height: 6px;
  border-radius: 10px;
  border: var(--outline-weak);
    box-shadow: var(--shadow-harder);
  
}

.slider::-moz-range-progress {
  background-color: var(--bg-pop);
  height: 6px;
  border-radius: 3px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  width: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  margin-top: -5px;
  box-shadow: -10000px 0 0 10000px var(--bg-pop);
}
.question-tag .small-icon {
    height: 16px;
}

.overview-list {
    display: flex;
    flex-direction: column;
    margin: 0 16px 64px 16px;
    margin-bottom: 64px;
    overflow-y: auto;
   
    border-radius: var(--radius-md);

    padding-bottom:20vh;
}
.overview-item {
    padding: 20px 24px 16px 24px;
    min-height: auto;
    margin-top: 8px;
    margin-bottom: 8px;

}

.answer-text {
    margin-top: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-xs);
    opacity: 0.7;
    text-align: right;
}

.question-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: var(--text-weight-normal);

    border-radius: var(--radius-sm);
    padding: 0px 0px 0px 0px;
    font-size: var(--font-xs) !important;
    margin-bottom: 8px;
 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0;
    flex-shrink: 0;
}



.title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.boolean-toggles {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 16px 0px;

}
.item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

input[type="radio"] {
    display: none;
}

.radioanswer {
    background-color: var(--bg-alt);
    color: var(--text-muted);
    border-radius: var(--radius-md);
    border: var(--outline-weak)!important;
    padding: 8px 8px;
    width:100%;
    font-size: var(--font-xs);
    min-height: 0;
    border-radius: var(--radius-sm);
    opacity: 0.5;
}
.radioanswer:hover{
    cursor: pointer;
    border: var(--outline-strong)!important;
    transform: translateY(-0.5px);
    box-shadow: var(--shadow-hard);
     opacity: 1;
     background-color: var(--bg-bright);
}
.active{
    background-color: var(--bg-bright);
    border: var(--outline-strong)!important;
    color: var(--text-dark);
    opacity: 1;
}

.resultheader {
    padding: 32px 64px 42px 64px;
    margin-top: 18vh;
    overflow: visible;
    text-align: center;
}

.resultheader img {
    width: auto;
    margin-left: auto;
    margin-right: auto;
    display: block;
}

.resultheader .question-icon {
    height: 48px;
    margin-top: 16px;
    margin-bottom: 16px;
}
</style>