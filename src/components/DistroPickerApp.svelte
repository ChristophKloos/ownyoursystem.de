<script>
    import { onMount } from "svelte";
    import { fetchData } from "../scripts/dp_api.js";
    import { calculateResults } from "../scripts/dp_engine.js";
    import Question from "./Question.svelte";
    import Results from "./Results.svelte";
    import AnswersOverview from "./AnswersOverview.svelte";
    import { fly, fade } from "svelte/transition";
    import { baseTransition } from "../scripts/transitionConfig.js";
    
    import { 
        sheetY, 
        isDragging, 
        handlePointerDown, 
        handlePointerMove, 
        handlePointerUp, 
        handleSidebarClick,
        triggerBounce
    } from "../scripts/slide.js";

    let state = {
        questions: [],
        distros: [],
        desktops: [],
        nameMapping: {},
        tags: [],
        currentIndex: 0,
        answers: {},
    };

    let step = "start";
    let direction = "forward";
    let mounted = false;

    $: liveResults =
        Object.keys(state.answers).length > 0
            ? calculateResults(
                  state.distros,
                  state.desktops,
                  state.answers,
                  state.questions,
              )
            : [];

    onMount(async () => {
        mounted = true;
        const data = await fetchData();
        state = { ...state, ...data };
    });

    function startQuiz() {
        step = "quiz";
    }

    function handleAnswer(qId, value) {
        if (state.currentIndex === 0) {
            triggerBounce();
        }

        state.answers[qId] = value;
        state.answers = { ...state.answers };

        if (state.currentIndex + 1 < state.questions.length) {
            direction = "forward";
            state.currentIndex++;
        } else {
            step = "overview";
        }
    }

    function handleNav(idx) {
        direction = idx > state.currentIndex ? "forward" : "back";
        state.currentIndex = idx;
    }
</script>

<svelte:window
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
/>

{#if step === "start"}
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
                <button on:click={startQuiz} id="start-btn">Start</button>
            </div>
        {/if}
    </div>
{:else}
    <div class="app-layout">
        <div class="main-content">
            <div class="quiz-container" id="quiz-container">
                {#if step === "quiz"}
                    <Question
                        q={state.questions[state.currentIndex]}
                        index={state.currentIndex}
                        total={state.questions.length}
                        answers={state.answers}
                        onAnswer={handleAnswer}
                        onNav={handleNav}
                        {direction}
                    />
                {:else if step === "overview"}
                    <div in:fly={{ y: 50, ...baseTransition }}>
                        <AnswersOverview
                            questions={state.questions}
                            answers={state.answers}
                            onUpdate={(qId, value) => {
                                state.answers[qId] = value;
                                state.answers = { ...state.answers };
                            }}
                        />
                    </div>
                {/if}
            </div>
        </div>

        <div
            class="sidebar"
            style="--sheet-y: {$sheetY}vh;"
            class:dragging={$isDragging}
            on:click={handleSidebarClick}
            role="presentation"
        >
            <div class="sheet-handle" on:pointerdown={handlePointerDown}>
                <div class="pill"></div>
            </div>

            <div class="sidebar-content">
                {#if liveResults.length > 0}
                    <div in:fly={{ y: 50, ...baseTransition }}>
                        <Results
                            results={liveResults}
                            questions={state.questions}
                            nameMapping={state.nameMapping}
                            desktopModifiers={state.desktops}
                            answers={state.answers}
                            tags={state.tags}
                        />
                    </div>
                {:else}
                    <div class="sidebar-placeholder">
                        <img
                            src="/ui/application-x-sharedlib-symbolic.svg"
                            alt="Placeholder"
                            class="placeholder-icon"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}