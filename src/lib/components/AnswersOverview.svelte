<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { DEFAULT_BIAS } from '$lib/scripts/logic';
	import type { AnswerValue, Answers, Question, QuestionOption } from '$lib/scripts/types';

	interface Props {
		questions?: Question[];
		answers: Answers;
		onUpdate: (id: string, value: AnswerValue) => void;
	}

	let { questions, answers, onUpdate }: Props = $props();

	let localValues = $state<Record<string, AnswerValue>>(
		untrack(() => ({
			bias: answers.bias !== undefined ? Number(answers.bias) : DEFAULT_BIAS
		}))
	);

	onMount(() => {
		if (answers.bias === undefined) {
			updateGlobal('bias', DEFAULT_BIAS);
		}
	});

	function getMin(options: QuestionOption[] | undefined): number {
		if (!options || options.length === 0) return 0;
		return Math.min(...options.map((o) => Number(o.value)));
	}

	function getMax(options: QuestionOption[] | undefined): number {
		if (!options || options.length === 0) return 100;
		return Math.max(...options.map((o) => Number(o.value)));
	}

	function clamp(val: AnswerValue, min: number, max: number): number {
		return Math.max(min, Math.min(max, Number(val)));
	}

	$effect(() => {
		for (const q of questions ?? []) {
			const id = q.id;
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
	});

	function getClosestText(
		options: QuestionOption[] | undefined,
		val: AnswerValue | undefined
	): string {
		if (val === undefined || !options || options.length === 0) return '';

		if (typeof val === 'boolean' || options.some((o) => typeof o.value === 'boolean')) {
			const opt = options.find((o) => String(o.value) === String(val));
			return opt ? opt.text : '';
		}

		const numVal = Number(val);
		return options.reduce((prev, curr) => {
			const prevDiff = Math.abs(Number(prev.value) - numVal);
			const currDiff = Math.abs(Number(curr.value) - numVal);
			return currDiff < prevDiff ? curr : prev;
		}).text;
	}

	function updateGlobal(id: string, val: string | number | boolean, isBoolean = false) {
		const finalVal: AnswerValue = isBoolean ? String(val) === 'true' : Number(val);
		localValues[id] = finalVal;
		onUpdate(id, finalVal);
	}
</script>

<div class="resultheader darkbox">
	<img alt="Placeholder" class="question-icon" src="/ui/application-x-sharedlib-symbolic.svg" />
	<p>You can fine tune <b>your answers</b> by dragging the slider or toggling options.</p>
</div>

<div class="overview-list">
	{#each questions ?? [] as q (q.id)}
		<div class="whitebox overview-item">
			<div class="item-header">
				<div class="question-tag">
					<img src="/ui/question/{q.icon}" alt={q.title} class="small-icon" />
					<span class="title-text">{q.title}</span>
				</div>
				<p class="answer-text">
					{@html getClosestText(q.options, localValues[q.id])}
				</p>
			</div>

			{#if q._ruleType === 'boolean'}
				<div class="boolean-toggles">
					{#each q.options as opt (opt.value)}
						<label
							class="radioanswer"
							class:active={String(localValues[q.id]) === String(opt.value)}
						>
							<input
								type="radio"
								name={q.id}
								value={opt.value}
								checked={String(localValues[q.id]) === String(opt.value)}
								onchange={(e) =>
									updateGlobal(q.id, (e.currentTarget as HTMLInputElement).value, true)}
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
					onchange={(e) => updateGlobal(q.id, (e.currentTarget as HTMLInputElement).value)}
				/>
			{/if}
		</div>
	{/each}

	<div class="whitebox overview-item">
		<div class="item-header">
			<div class="question-tag">
				<img alt="Bias" class="small-icon" src="/ui/application-x-sharedlib-symbolic.svg" />
				<span class="title-text">Community Bias</span>
			</div>
			<p class="answer-text">{localValues.bias}% Influence</p>
		</div>
		<input
			class="slider"
			max="100"
			min="0"
			onchange={(e) => updateGlobal('bias', (e.currentTarget as HTMLInputElement).value)}
			step="1"
			type="range"
			value={localValues.bias}
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

		padding-bottom: 20vh;
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
		transition: var(--transition-snappy);
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	input[type='radio'] {
		display: none;
	}

	.radioanswer {
		background-color: var(--bg-alt);
		color: var(--text-muted);
		border-radius: var(--radius-md);
		border: var(--outline-weak) !important;
		padding: 8px 8px;
		width: 100%;
		font-size: var(--font-xs);
		min-height: 0;
		border-radius: var(--radius-sm);
		opacity: 0.5;
		transition: var(--transition-snappy);
	}

	.radioanswer:hover {
		cursor: pointer;
		border: var(--outline-strong) !important;
		transform: translateY(-0.5px);
		box-shadow: var(--shadow-hard);
		opacity: 1;
		background-color: var(--bg-bright);
	}

	.active {
		background-color: var(--bg-bright);
		border: var(--outline-strong) !important;
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
