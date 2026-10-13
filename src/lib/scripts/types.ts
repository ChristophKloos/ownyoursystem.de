// Shared domain types for the distro picker.
// The raw JSON in `static/data` is tagged with `_ruleType` at load time in `api.ts`.

export type RuleType = 'match' | 'limit' | 'boolean';

export type AnswerValue = number | boolean;

export type Answers = Record<string, AnswerValue>;

export interface QuestionOption {
	text: string;
	value: AnswerValue;
}

export interface Question {
	id: string;
	title?: string;
	icon?: string;
	weight?: number;
	question?: string;
	options: QuestionOption[];
	_ruleType: RuleType;
}

export type ScoreValue = number | boolean;

export interface Scores {
	[key: string]: ScoreValue;
}

export interface Distro {
	name: string;
	id?: string;
	tags?: string[];
	warning?: string;
	link?: string;
	icon?: string;
	description?: string;
	desktops?: string[];
	scores?: Scores;
}

export interface Desktop {
	Screenshot?: string;
	tags?: string[];
	scores?: Scores;
}

/** Shape of `static/data/desktops.json`. */
export interface DesktopCollection {
	desktops: Record<string, Desktop>;
}

export interface Tag {
	id: string;
	name: string;
	icon: string;
	description?: string;
}

export interface NameMappingEntry {
	name?: string;
	icon?: string;
	screenshot?: string;
}

/** Shape of `static/data/distros_combinations.json`, keyed by `"Distro+Desktop"`. */
export type NameMapping = Record<string, NameMappingEntry>;

export interface Rule {
	type: RuleType;
	weight?: number;
}

export type RuleMap = Record<string, Rule>;

/** A single distro + desktop combination produced by `processDistroPicker`. */
export interface Result extends Distro {
	distro: string;
	desktop: string;
	totalScore: number;
	matchDetails: Record<string, number>;
	sysDetails: Record<string, number>;
	isPenalized: boolean;
}
