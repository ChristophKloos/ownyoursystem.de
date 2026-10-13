<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Answers, AnswerValue, Question as QuestionData } from '$lib/scripts/types';

	interface Props {
		q?: QuestionData;
		index: number;
		total: number;
		answers: Answers;
		onAnswer: (qId: string, value: AnswerValue) => void;
		onNav: (index: number) => void;
		direction: string;
	}

	let { q, index, total, answers, onAnswer, onNav, direction }: Props = $props();

	let mounted = $state(false);

	let progressWidth = $derived(total > 0 ? (index / total) * 100 : 0);
	let flyX = $derived(direction === 'forward' ? 30 : -30);

	onMount(() => {
		mounted = true;
	});

	function formatValue(val: AnswerValue): AnswerValue {
		return typeof val === 'boolean' ? val : Number(val);
	}
</script>

{#if mounted && q}
	<div class="part" in:fly={{ y: flyX, duration: 300, opacity: 0 }}>
		<div class="frage darkbox">
			<div class="icon-wrapper">
				{#key q.id}
					<img
						src="/ui/question/{q.icon}"
						alt=""
						class="question-icon"
						in:fade={{ duration: 200 }}
						out:fade={{ duration: 200 }}
					/>
				{/key}
			</div>

			<p>{@html q.question}</p>

			<div class="progress">
				<div class="progressinner" style="width: {progressWidth}%"></div>
			</div>

			{#if index > 0}
				<button
					type="button"
					class="nav-btn back-btn"
					onclick={() => onNav(index - 1)}
					aria-label="Previous question"
				>
					<img src="/ui/arrow.svg" alt="" />
				</button>
			{/if}

			{#if index < total - 1}
				<button
					type="button"
					class="nav-btn forward-btn"
					onclick={() => onNav(index + 1)}
					aria-label="Next question"
				>
					<img src="/ui/arrow.svg" alt="" />
				</button>
			{/if}
		</div>

		{#key q.id}
			<div class="choice" in:fly={{ x: flyX, duration: 300, opacity: 0 }}>
				{#each q.options as opt (opt.value)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<label
						class="whitebox"
						class:active={answers[q.id] === formatValue(opt.value)}
						onclick={() => onAnswer(q.id, formatValue(opt.value))}
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

	/* Wrapper for smooth crossfading between question icons */
	.icon-wrapper {
		display: grid;
		align-items: center;
		justify-content: center;
		height: 48px;
		margin-top: 32px;
		margin-bottom: 0px;
	}

	/* Stack both icons on top of each other during the animation */
	.icon-wrapper img {
		grid-column: 1;
		grid-row: 1;
	}

	.question-icon {
		height: 48px;
	}

	input[type='radio'] {
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
		font-weight: var(--text-weight-normal);
		border-radius: 800px;
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
		background: linear-gradient(to right, rgba(100, 100, 100, 0.1), transparent);
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

	.frage p :global(b),
	.choice label :global(b) {
		font-weight: var(--text-weight-fat);
	}
</style>
