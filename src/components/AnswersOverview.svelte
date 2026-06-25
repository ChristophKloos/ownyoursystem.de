<script>
    export let questions;
    export let answers;
    export let onUpdate;

    let localValues = {};

    $: {
        for (let id in answers) {
            if (localValues[id] === undefined) {
                localValues[id] = answers[id];
            }
        }
    }

    function getMin(options) {
        return Math.min(...options.map((o) => parseFloat(o.value)));
    }

    function getMax(options) {
        return Math.max(...options.map((o) => parseFloat(o.value)));
    }

    function getClosestText(options, val) {
        if (val === undefined) return "";
        const numVal = parseFloat(val);

        return options.reduce((prev, curr) => {
            const prevDiff = Math.abs(parseFloat(prev.value) - numVal);
            const currDiff = Math.abs(parseFloat(curr.value) - numVal);
            return currDiff < prevDiff ? curr : prev;
        }).text;
    }

    function updateGlobal(id, val) {
        const numVal = parseFloat(val);
        answers[id] = numVal;
        onUpdate(id, numVal);
    }
</script>

<div class="resultheader darkbox">
    <img
        src="/ui/application-x-sharedlib-symbolic.svg"
        alt="Placeholder"
        class="question-icon"
    />
    <p>You can fine tune <b>your answers</b> them by dragging the slider.</p>
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

            <input
                type="range"
                class="slider"
                min={getMin(q.options)}
                max={getMax(q.options)}
                step="0.01"
                bind:value={localValues[q.id]}
                on:change={(e) => updateGlobal(q.id, e.target.value)}
            />
        </div>
    {/each}
</div>