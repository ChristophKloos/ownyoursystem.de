<script>
    import { flip } from "svelte/animate";
    import { fade, slide } from "svelte/transition";
    import { baseTransition } from "../scripts/transitionConfig.js";
    import RadarChart from "./RadarChart.svelte";

    export let results;
    export let questions;
    export let desktopModifiers;
    export let answers;
    export let tags;
    export let nameMapping;

    let shown = 1000;
    let expandedCards = {};
    let expandedTags = {};

    let modalImage = null;
    let isModalOpen = false;

    let delayedAnswers = answers;
    let debounceTimer;

    $: {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            delayedAnswers = answers;
        }, 50);
    }

    function openModal(src) {
        modalImage = src;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        setTimeout(() => {
            if (!isModalOpen) modalImage = null;
        }, 300);
    }

    $: visibleResults = (results || []).slice(0, shown).map((res) => {
        const key = `${res.distro}+${res.desktop}`;
        const mapping = nameMapping?.[key];

        let displayName = `<strong>${res.distro}</strong> ${res.desktop}`;
        let displayIcon = res.icon;
        let screenshot = null;

        if (mapping) {
            if (mapping.name) displayName = mapping.name;
            if (mapping.icon) displayIcon = mapping.icon;
            if (mapping.screenshot)
                screenshot = `/img/desktops/${mapping.screenshot}`;
        }

        const mods =
            desktopModifiers?.[res.desktop] ||
            desktopModifiers?.desktops?.[res.desktop];

        if (!screenshot && mods?.Screenshot) {
            screenshot = `/img/desktops/${mods.Screenshot}`;
        }

        let resTags = [];
        if (res.tags && Array.isArray(res.tags) && tags) {
            resTags = res.tags
                .map((tId) => (tags || []).find((x) => x.id === tId))
                .filter(Boolean);
        }

        const cleanName = displayName
            .replace(/<span.*<\/span>/, "")
            .replace(/<[^>]*>/g, "");

        const chartQuestions = (questions || []).filter((q) => q._ruleType === "match");
        const chartLabels = chartQuestions.map((q) => q.title || q.id);

        const distroDataset = {
            label: cleanName,
            data: chartQuestions.map((q) => res.sysDetails?.[q.id] || 0),
            backgroundColor: "rgba(23, 147, 209, 0.2)",
            borderColor: "rgb(23, 147, 209)",
            pointBackgroundColor: "rgb(23, 147, 209)",
        };

        return {
            ...res,
            displayName,
            displayIcon,
            screenshot,
            resTags,
            legendName: cleanName,
            uid: key,
            chartLabels,
            chartQuestions,
            distroDataset,
        };
    });

    $: maxTotal = results.length > 0 ? Math.max(results[0].totalScore, 1) : 1;

    function toggleCard(uid) {
        expandedCards[uid] = !expandedCards[uid];
    }

    function toggleTag(tagKey) {
        expandedTags[tagKey] = !expandedTags[tagKey];
    }
</script>

<div id="results-list">
    {#each visibleResults as res, index (res.uid)}
        <div
            class="result-card whitebox"
            class:penalized={res.isPenalized}
            on:click={() => toggleCard(res.uid)}
            role="button"
            animate:flip={baseTransition}
            in:fade={baseTransition}
        >
            <div class="result-header">
                {#if res.displayIcon}
                    <img
                        src="/ui/distro/{res.displayIcon}"
                        class="distro-icon"
                        alt=""
                    />
                {/if}
                <p class="result-name">
                    {@html res.displayName}
                    {#if index === 0 && !res.isPenalized}
                        <span class="best-match">Best Match</span>
                    {/if}
                    {#if res.isPenalized}
                        <span class="hardware-warn">Punished</span>
                    {/if}
                </p>
                <img
                    src="/ui/arrow.svg"
                    class="arrow-icon"
                    class:rotated={expandedCards[res.uid]}
                    alt=""
                />
            </div>

            <div class="progress white">
                <div
                    class="progressinner main-bar"
                    style="width: {res.totalScore > 0 ? Math.pow(res.totalScore / maxTotal, 4) * 100 : 0}%"
                ></div>
            </div>

            {#if expandedCards[res.uid]}
                <div
                    class="stats-container"
                    transition:slide={baseTransition}
                    on:click|stopPropagation
                >
                    {#if res.description}
                        <p class="result-desc">{res.description}</p>
                    {/if}

                    <div class="result-tags">
                        {#each res.resTags as t}
                            <div
                                class="tag-item"
                                class:open={expandedTags[`${res.uid}-${t.id}`]}
                                on:click|stopPropagation={() =>
                                    toggleTag(`${res.uid}-${t.id}`)}
                            >
                                <div class="tag-head">
                                    <img
                                        class="tagimage"
                                        src="/ui/tags/{t.icon}"
                                        alt=""
                                    />
                                    {t.name}
                                </div>
                                <div class="tag-body">
                                    {t.description || ""}
                                </div>
                            </div>
                        {/each}
                    </div>

                    {#if res.warning}
                        <p class="result-warn">
                            <img src="/ui/warn.svg" alt="Warning" />
                            {res.warning}
                        </p>
                    {/if}

                    {#if res.screenshot}
                        <div
                            class="gallery-item-container"
                            on:click|stopPropagation={() =>
                                openModal(res.screenshot)}
                        >
                            <img
                                src={res.screenshot}
                                class="gallery-item-image"
                                alt="Screenshot"
                            />
                        </div>
                    {/if}

                    <RadarChart
                        labels={res.chartLabels}
                        datasets={[
                            res.distroDataset,
                            {
                                label: "Your Answer",
                                data: res.chartQuestions.map((q) => (delayedAnswers || {})[q.id] ?? 50),
                                backgroundColor: "rgba(233, 84, 32, 0.2)",
                                borderColor: "rgb(233, 84, 32)",
                                pointBackgroundColor: "rgb(23, 147, 209)",
                            }
                        ]}
                    />

                    {#if res.link}
                        <a
                            href={res.link}
                            class="distro-link"
                            target="_blank"
                            on:click|stopPropagation
                        >
                            Official Website
                        </a>
                    {/if}
                </div>
            {/if}
        </div>
    {/each}
</div>

<div
    id="image-modal"
    class:flex={isModalOpen}
    class:hidden={!isModalOpen}
    on:click={closeModal}
>
    <div on:click|stopPropagation>
        {#if modalImage}
            <img
                id="modal-image"
                src={modalImage}
                alt="Fullscreen screenshot"
            />
        {/if}
        <div id="modal-caption">
            Recency and accuracy of screenshots may vary.
        </div>
    </div>
</div>