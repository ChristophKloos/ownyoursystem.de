<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { fetchData } from '$lib/scripts/api';
	import { processDistroPicker } from '$lib/scripts/logic';
	import type {
		Answers,
		AnswerValue,
		DesktopCollection,
		Distro,
		NameMapping,
		Question as QuestionData,
		RuleMap,
		Tag
	} from '$lib/scripts/types';
	import Question from '$lib/components/Question.svelte';
	import Results from '$lib/components/Results.svelte';
	import AnswersOverview from '$lib/components/AnswersOverview.svelte';
	import Header from '$lib/components/Header.svelte';
	import NavSidebar from '$lib/components/Sidebar.svelte';
	import LandingPage from '$lib/components/LandingPage.svelte';
	import { baseTransition } from '$lib/scripts/transitionConfig';

	import {
		sheetY,
		isDragging,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleSidebarClick,
		triggerBounce
	} from '$lib/scripts/slide';

	interface AppState {
		questions: QuestionData[];
		rules: RuleMap;
		distros: Distro[];
		desktops: DesktopCollection;
		nameMapping: NameMapping;
		tags: Tag[];
		currentIndex: number;
		answers: Answers;
	}

	let app: AppState = $state({
		questions: [],
		rules: {},
		distros: [],
		desktops: { desktops: {} },
		nameMapping: {},
		tags: [],
		currentIndex: 0,
		answers: {}
	});

	let step = $state<'start' | 'quiz' | 'overview'>('start');
	let direction = $state<'forward' | 'back'>('forward');
	let mounted = $state(false);
	let isNavSidebarOpen = $state(false);

	let liveResults = $derived(
		Object.keys(app.answers).length > 0
			? processDistroPicker(app.distros, app.desktops, app.answers, app.rules)
			: []
	);

	onMount(async () => {
		const data = await fetchData();

		const rules: RuleMap = {};
		data.questions.forEach((q) => {
			rules[q.id] = { type: q._ruleType, weight: q.weight };
		});

		app = {
			...app,
			distros: data.distros,
			desktops: data.desktops,
			nameMapping: data.nameMapping,
			tags: data.tags,
			questions: data.questions,
			rules
		};

		mounted = true;
	});

	function startQuiz() {
		step = 'quiz';
	}

	function handleAnswer(qId: string, value: AnswerValue) {
		if (app.currentIndex === 0) {
			triggerBounce();
		}

		app.answers[qId] = value;
		app.answers = { ...app.answers };

		if (app.currentIndex + 1 < app.questions.length) {
			direction = 'forward';
			app.currentIndex++;
		} else {
			step = 'overview';
		}
	}

	function handleNav(idx: number) {
		direction = idx > app.currentIndex ? 'forward' : 'back';
		app.currentIndex = idx;
	}
</script>

<svelte:window
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
/>

<NavSidebar bind:isOpen={isNavSidebarOpen} />
<Header onOpenSidebar={() => (isNavSidebarOpen = true)} />

{#if step === 'start'}
	<LandingPage {mounted} onStart={startQuiz} />
{:else}
	<div class="app-layout">
		<div class="main-content">
			<div class="quiz-container" id="quiz-container">
				{#if step === 'quiz'}
					<Question
						q={app.questions[app.currentIndex]}
						index={app.currentIndex}
						total={app.questions.length}
						answers={app.answers}
						onAnswer={handleAnswer}
						onNav={handleNav}
						{direction}
					/>
				{:else if step === 'overview'}
					<div in:fly={{ y: 50, ...baseTransition }}>
						<AnswersOverview
							questions={app.questions}
							answers={app.answers}
							onUpdate={(qId, value) => {
								app.answers[qId] = value;
								app.answers = { ...app.answers };
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
			onclick={handleSidebarClick}
			role="presentation"
		>
			<div
				class="sheet-handle"
				onpointerdown={handlePointerDown}
				role="button"
				tabindex="0"
				aria-label="Resize results panel"
			>
				<div class="pill"></div>
			</div>

			<div class="sidebar-content">
				{#if liveResults.length > 0}
					<div in:fly={{ y: 50, ...baseTransition }}>
						<Results
							results={liveResults}
							questions={app.questions}
							nameMapping={app.nameMapping}
							desktopModifiers={app.desktops}
							answers={app.answers}
							tags={app.tags}
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

<style>
	.sidebar {
		width: 100%;
		height: 100vh;
		position: sticky;
		top: 0;
		background-color: var(--bg-backdrop-alt);
		overflow-y: auto;
		display: block;
		scrollbar-width: none;
	}
	.sidebar-content {
		display: block;
		min-height: 100%;
	}

	.sidebar::-webkit-scrollbar {
		display: none;
	}

	.sidebar::after {
		content: '';
		position: sticky;
		bottom: 0;
		left: 0;
		display: block;
		width: 100%;
		height: 80px;
		background: linear-gradient(to bottom, transparent, rgba(52, 52, 52, 0.04));
		pointer-events: none;
		z-index: 100;
	}

	.sidebar-placeholder {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		opacity: 0.2;
	}

	.placeholder-icon {
		width: 64px;
		height: auto;
		margin-bottom: 16px;
	}
</style>
