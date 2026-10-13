import type { DesktopCollection, Distro, NameMapping, Question, RuleType, Tag } from './types';

/** A question as it appears in the raw JSON (before `_ruleType` is attached). */
interface RawQuestion {
	id: string;
	title?: string;
	icon?: string;
	weight?: number;
	question?: string;
	options: Question['options'];
}

interface RawQuestions {
	matches?: RawQuestion[];
	filters?: RawQuestion[];
	booleans?: RawQuestion[];
}

export interface DataPayload {
	questions: Question[];
	distros: Distro[];
	desktops: DesktopCollection;
	nameMapping: NameMapping;
	tags: Tag[];
}

function tag(items: RawQuestion[] | undefined, type: RuleType): Question[] {
	return (items ?? []).map((q) => ({ ...q, _ruleType: type }));
}

export async function fetchData(): Promise<DataPayload> {
	const fetchOpts: RequestInit = { cache: 'no-store' };

	const [qResp, dResp, deResp, nResp, tResp] = await Promise.all([
		fetch('data/questions.json', fetchOpts),
		fetch('data/distros.json', fetchOpts),
		fetch('data/desktops.json', fetchOpts),
		fetch('data/distros_combinations.json', fetchOpts),
		fetch('data/tags.json', fetchOpts)
	]);

	const raw = (await qResp.json()) as RawQuestions;

	const questions: Question[] = [
		...tag(raw.matches, 'match'),
		...tag(raw.filters, 'limit'),
		...tag(raw.booleans, 'boolean')
	];

	return {
		questions,
		distros: (await dResp.json()) as Distro[],
		desktops: (await deResp.json()) as DesktopCollection,
		nameMapping: (await nResp.json()) as NameMapping,
		tags: (await tResp.json()) as Tag[]
	};
}
