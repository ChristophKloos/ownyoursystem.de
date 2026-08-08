<script lang="ts">
    import { onMount } from "svelte";
    import { fetchData } from "../scripts/api.ts";
    import { processDistroPicker } from "../scripts/logic.ts"; 
    import Question from "./Question.svelte";
    import Results from "./Results.svelte";
    import AnswersOverview from "./AnswersOverview.svelte";
    import Header from "./Header.svelte";
    import NavSidebar from "./Sidebar.svelte"; 
    import LandingPage from "./LandingPage.svelte";
    import { fly } from "svelte/transition";
    import { baseTransition } from "../scripts/transitionConfig.js";
    
    import { 
        sheetY, 
        isDragging, 
        handlePointerDown, 
        handlePointerMove, 
        handlePointerUp, 
        handleSidebarClick,
        triggerBounce
    } from "../scripts/slide.ts";

    let state = {
        questions: [],
        rules: {}, 
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
    let isNavSidebarOpen = false;

    $: liveResults =
        Object.keys(state.answers).length > 0
            ? processDistroPicker(
                  state.distros,
                  state.desktops,
                  state.answers,
                  state.rules 
              )
            : [];

    onMount(async () => {
        const data = await fetchData();
        
        const rules = {};
        data.questions.forEach(q => {
            rules[q.id] = { type: q._ruleType, weight: q.weight };
        });

        state = { 
            ...state, 
            distros: data.distros,
            desktops: data.desktops,
            nameMapping: data.nameMapping,
            tags: data.tags,
            questions: data.questions,
            rules: rules 
        };

        mounted = true;
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

<NavSidebar bind:isOpen={isNavSidebarOpen} />
<Header on:openSidebar={() => (isNavSidebarOpen = true)} />

{#if step === "start"}
    <LandingPage {mounted} on:start={startQuiz} />
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