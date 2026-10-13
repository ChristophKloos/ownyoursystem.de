<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import { baseTransition } from '$lib/scripts/transitionConfig';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import type {
		Answers,
		DesktopCollection,
		NameMapping,
		Question,
		Result,
		Tag
	} from '$lib/scripts/types';

	interface Props {
		results?: Result[];
		questions?: Question[];
		desktopModifiers?: DesktopCollection;
		answers?: Answers;
		tags?: Tag[];
		nameMapping?: NameMapping;
	}

	let { results, questions, desktopModifiers, answers, tags, nameMapping }: Props = $props();

	let shown = $state(1000);
	let expandedCards = $state<Record<string, boolean>>({});
	let expandedTags = $state<Record<string, boolean>>({});

	let modalImage = $state<string | null>(null);
	let isModalOpen = $state(false);

	function openModal(src: string) {
		modalImage = src;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		setTimeout(() => {
			if (!isModalOpen) modalImage = null;
		}, 300);
	}

	function toggleCard(uid: string) {
		expandedCards[uid] = !expandedCards[uid];
	}

	function toggleTag(tagKey: string) {
		expandedTags[tagKey] = !expandedTags[tagKey];
	}

	function handleKeydown(e: KeyboardEvent, action: (param: string) => void, param: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			action(param);
		}
	}

	let chartQuestions = $derived((questions ?? []).filter((q) => q._ruleType === 'match'));
	let chartLabels = $derived(chartQuestions.map((q) => q.title ?? q.id));
	let maxTotal = $derived(results && results.length > 0 ? Math.max(results[0].totalScore, 1) : 1);

	interface VisibleResult extends Result {
		displayName: string;
		displayIcon?: string;
		screenshot: string | null;
		resTags: Tag[];
		legendName: string;
		uid: string;
		chartLabels: string[];
		chartQuestions: Question[];
		distroDataset: {
			label: string;
			data: number[];
			backgroundColor: string;
			borderColor: string;
			pointBackgroundColor: string;
		};
	}

	let visibleResults = $derived(
		(results ?? []).slice(0, shown).map((res): VisibleResult => {
			const key = `${res.distro}+${res.desktop}`;
			const mapping = nameMapping?.[key] ?? {};
			const mods = desktopModifiers?.desktops?.[res.desktop];

			const displayName = mapping.name || `<strong>${res.distro}</strong> ${res.desktop}`;
			const displayIcon = mapping.icon || res.icon;
			const screenshot = mapping.screenshot
				? `/img/desktops/${mapping.screenshot}`
				: mods?.Screenshot
					? `/img/desktops/${mods.Screenshot}`
					: null;

			const resTags = (res.tags ?? [])
				.map((tId) => tags?.find((x) => x.id === tId))
				.filter((t): t is Tag => Boolean(t));

			const cleanName = displayName.replace(/<span.*<\/span>/, '').replace(/<[^>]*>/g, '');

			const distroDataset = {
				label: cleanName,
				data: chartQuestions.map((q) => {
					const value = res.sysDetails?.[q.id];
					return typeof value === 'number' ? value : 0;
				}),
				backgroundColor: 'rgba(23, 147, 209, 0.2)',
				borderColor: 'rgb(23, 147, 209)',
				pointBackgroundColor: 'rgb(23, 147, 209)'
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
				distroDataset
			};
		})
	);
</script>

<div id="results-list">
	{#each visibleResults as res, index (res.uid)}
		<div
			class="result-card whitebox"
			class:penalized={res.isPenalized}
			onclick={() => toggleCard(res.uid)}
			onkeydown={(e) => handleKeydown(e, toggleCard, res.uid)}
			role="button"
			tabindex="0"
			animate:flip={baseTransition}
			in:fade={baseTransition}
		>
			<div class="result-header">
				{#if res.displayIcon}
					<img src="/ui/distro/{res.displayIcon}" class="distro-icon" alt="" />
				{/if}
				<p class="result-name">
					{@html res.displayName}
					{#if index === 0 && !res.isPenalized}
						<span class="best-match">Best Match</span>
					{/if}
					{#if res.isPenalized}
						<span class="hardware-warn">Limited support</span>
					{/if}
				</p>
				<img src="/ui/arrow.svg" class="arrow-icon" class:rotated={expandedCards[res.uid]} alt="" />
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
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="presentation"
				>
					{#if res.description}
						<p class="result-desc">{res.description}</p>
					{/if}

					<div class="result-tags">
						{#each res.resTags as t (t.id)}
							<div
								class="tag-item"
								class:open={expandedTags[`${res.uid}-${t.id}`]}
								onclick={(e) => {
									e.stopPropagation();
									toggleTag(`${res.uid}-${t.id}`);
								}}
								onkeydown={(e) => handleKeydown(e, toggleTag, `${res.uid}-${t.id}`)}
								role="button"
								tabindex="0"
							>
								<div class="tag-head">
									<img class="tagimage" src="/ui/tags/{t.icon}" alt="" />
									{t.name}
								</div>
								<div class="tag-body">
									{t.description || ''}
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
							onclick={(e) => {
								e.stopPropagation();
								openModal(res.screenshot as string);
							}}
							onkeydown={(e) => handleKeydown(e, openModal, res.screenshot as string)}
							role="button"
							tabindex="0"
						>
							<img src={res.screenshot} class="gallery-item-image" alt="Screenshot" />
						</div>
					{/if}

					<RadarChart
						labels={res.chartLabels}
						datasets={[
							res.distroDataset,
							{
								label: 'Your Answer',
								data: res.chartQuestions.map((q) => {
									const value = (answers ?? {})[q.id];
									return typeof value === 'number' ? value : 50;
								}),
								backgroundColor: 'rgba(233, 84, 32, 0.2)',
								borderColor: 'rgb(233, 84, 32)',
								pointBackgroundColor: 'rgb(23, 147, 209)'
							}
						]}
					/>

					{#if res.link}
						<a
							href={res.link}
							class="distro-link"
							target="_blank"
							rel="noreferrer"
							onclick={(e) => e.stopPropagation()}
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
	onclick={closeModal}
	onkeydown={(e) => {
		if (e.key === 'Escape') closeModal();
	}}
	role="button"
	tabindex="0"
>
	<div
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="presentation"
	>
		{#if modalImage}
			<img id="modal-image" src={modalImage} alt="Fullscreen screenshot" />
		{/if}
		<div id="modal-caption">Recency and accuracy of screenshots may vary.</div>
	</div>
</div>

<style>
	.result-card .progress {
		margin-top: 8px;
		margin-bottom: 8px;
		background-color: var(--bg-alt);
		outline: var(--outline-weak);
	}
	#results-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		margin-top: 128px;
		padding: 0px 0px !important;
	}

	.result-card:first-child {
		box-shadow: var(--shadow-glow);
	}
	.result-card {
		width: 100%;
		max-width: none;
		min-width: 100%;
		margin: 0;
		box-sizing: border-box;
		align-self: stretch;
		padding: 16px 24px !important;
		transition: var(--transition-snappy);
	}

	.result-header {
		cursor: pointer;
		display: flex;
		align-items: center;
		margin-bottom: 0px;
	}
	.result-name {
		margin: 0;
		font-weight: inherit !important;
		font-size: var(--font-sm);
		color: var(--text-dark);
	}
	.distro-icon {
		width: 32px;
		height: 32px;
		object-fit: contain;
		margin-left: -4px;
		flex-shrink: 0;
	}

	.best-match {
		width: max-content;
		max-width: 100%;
		background-color: var(--bg-alt);
		border-radius: var(--radius-sm);
		padding: 6px 12px;
		font-size: var(--font-xs);
		font-weight: var(--text-weight-normal);
		cursor: pointer;
		transition: background-color 0.2s;
		margin: 0;
		margin-left: 8px;
	}

	.arrow-icon {
		width: 15px;

		transition: transform 0.3s ease;
		opacity: 1;
		transform: rotate(180deg);
		margin-left: auto;
	}
	.arrow-icon.rotated {
		transform: rotate(0deg);
	}

	.result-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 10px;
		margin-bottom: 16px;
		align-items: flex-start;
		width: 100%;
		line-height: 12px;
	}

	.tag-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: max-content;
		max-width: 100%;
		background-color: var(--bg-alt);
		border-radius: var(--radius-sm);
		padding: 6px 12px 7px 12px;
		font-size: var(--font-xs);
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		margin: 0;
		outline: var(--outline-weak);
	}

	.tag-head {
		text-decoration: underline;
		text-decoration-style: dashed;
		text-decoration-color: grey;
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
	}

	.tag-body {
		max-height: 0;
		letter-spacing: -0.3px;
		overflow: hidden;
		transition: all 0.15s ease;
		font-weight: 500;
		margin-top: 0;
		padding-top: 0;
		width: 0;
		min-width: 100%;
		white-space: normal;
	}

	.tag-item.open .tag-body {
		max-height: 300px;
		opacity: 1;
		padding-top: 6px;
	}

	.result-desc,
	.result-warn {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin: 0px 0px 16px 0px;
		font-size: var(--font-xs);
		border-radius: var(--radius-sm);
	}

	.result-desc {
		font-size: var(--font-sm);
		margin-bottom: 16px;
		padding-top: 16px;
	}

	.result-warn {
		background-color: var(--bg-alt);
		padding: 8px 16px;
		margin-top: 16px;
		display: flex;
		align-items: center;
	}

	.result-warn img {
		margin-right: 3px;
	}

	.distro-link {
		display: flex;
		width: fit-content;
		margin: 32px auto 10px auto;
		font-weight: var(--text-weight-normal);
		opacity: 0.8;
		padding: 16px 32px;
		border-radius: var(--radius-lg);
		cursor: pointer;
		font-size: var(--font-sm);
		text-decoration: none;
		border: none;
		color: var(--text-dark);
		background-color: transparent;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.gallery-item-image {
		width: 100%;
		height: auto;
		display: block;
		cursor: pointer;
		margin: 32px auto 32px auto;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		transition: all 0.15s ease;
	}

	.gallery-item-container {
		position: relative;
	}

	.gallery-item-container::before {
		content: '';
		position: absolute;
		bottom: 0px;
		right: 0;
		width: 120px;
		height: 120px;
		background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.5));
		border-bottom-right-radius: var(--radius-md);
		pointer-events: none;
		z-index: 2;
		transition: all 0.15s ease;
	}

	.gallery-item-container:hover::before {
		width: 160px;
		height: 160px;
	}

	.gallery-item-container::after {
		content: '';
		position: absolute;
		pointer-events: none;
		bottom: 12px;
		right: 12px;
		width: 16px;
		height: 16px;
		background: url('/ui/fullscreen.svg') no-repeat center center / contain;
		transition: all 0.32s ease;
		filter: invert(1) brightness(2) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
		z-index: 6;
	}

	.gallery-item-container:hover::after {
		width: 20px;
		height: 20px;
	}

	#image-modal {
		position: fixed;
		inset: 0;
		background-color: var(--bg-translucent);
		backdrop-filter: blur(40px) contrast(150%);
		box-shadow: var(--shadow-hard);
		z-index: 9999;
		justify-content: center;
		align-items: center;
		cursor: zoom-out;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.15s ease,
			visibility 0.15s ease;
		display: flex;
	}

	#image-modal.hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}
	#image-modal.flex {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}

	#modal-image {
		max-width: 90vw;
		max-height: 80vh;
		object-fit: contain;
		cursor: default;
		transform: scale(0.95);
		transition: transform 0.15s ease;
	}

	#image-modal.flex #modal-image {
		transform: scale(1);
	}
	#modal-caption {
		text-align: center;
		color: var(--text-dark);
		margin-top: 15px;
		font-size: var(--font-md);
	}

	.penalized {
		opacity: 0.5;
	}

	.hardware-warn {
		width: max-content;
		max-width: 100%;
		background-color: var(--bg-alt);
		border-radius: var(--radius-sm);
		padding: 6px 10px;
		margin-left: 16px;
		font-size: var(--font-xs);
		font-weight: var(--text-weight-normal);
		cursor: pointer;
		transition: background-color 0.2s;

		outline: var(--outline-weak);
	}
</style>
