import type { Answers, Desktop, DesktopCollection, Distro, Result, RuleMap } from './types';

export const DEFAULT_BIAS = 50;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * The desktops data can arrive either as the full `{ desktops: {…} }` payload
 * (from `desktops.json`) or already unwrapped as a plain `{ name: desktop }` map.
 */
function normalizeDesktops(
	data: DesktopCollection | Record<string, Desktop> | null | undefined
): Record<string, Desktop> {
	if (!data) return {};
	const maybe = data as DesktopCollection;
	if (maybe.desktops) return maybe.desktops;
	return data as Record<string, Desktop>;
}

export function processDistroPicker(
	distros: Distro[] | null | undefined,
	desktopsData: DesktopCollection | Record<string, Desktop> | null | undefined,
	answers: Answers | null | undefined,
	rulesData: RuleMap | null | undefined
): Result[] {
	if (!distros) return [];

	const deskMap = normalizeDesktops(desktopsData);
	const ruleMap = rulesData ?? {};

	const { bias: rawBias, ...actualAnswers } = answers ?? {};
	const biasMultiplier = (rawBias !== undefined ? Number(rawBias) : DEFAULT_BIAS) / 100;

	return distros
		.flatMap((distro) =>
			(distro.desktops ?? [])
				.filter((name) => deskMap[name])
				.map((deskName) => {
					const desktop = deskMap[deskName];
					const distroBias = typeof distro.scores?.bias === 'number' ? distro.scores.bias : 50;
					const desktopBias = typeof desktop.scores?.bias === 'number' ? desktop.scores.bias : 50;
					const baseScore = clamp(distroBias + (desktopBias - 50));

					const result: Result = {
						...distro,
						distro: distro.name || distro.id || 'Unknown',
						desktop: deskName,
						totalScore: baseScore,
						matchDetails: {},
						sysDetails: {},
						isPenalized: false
					};

					let matchSum = 0;
					let weightSum = 0;
					let penaltyMultiplier = 1.0;

					for (const key of Object.keys(ruleMap)) {
						const rule = ruleMap[key];
						const rawDVal = distro.scores?.[key];
						const rawDkVal = desktop.scores?.[key];

						if (!rule || (rawDVal === undefined && rawDkVal === undefined)) continue;

						const dVal = typeof rawDVal === 'boolean' ? (rawDVal ? 100 : 0) : rawDVal;
						const dkVal = typeof rawDkVal === 'boolean' ? (rawDkVal ? 100 : 0) : rawDkVal;
						const sysVal = clamp((dVal ?? 50) + (dkVal !== undefined ? dkVal - 50 : 0));

						result.sysDetails[key] = sysVal;

						if (Object.prototype.hasOwnProperty.call(actualAnswers, key)) {
							const userVal = actualAnswers[key];

							if (rule.type === 'match') {
								const weight = rule.weight ?? 1;
								const points = clamp(100 - Math.abs(Number(userVal) - sysVal));
								matchSum += points * weight;
								weightSum += weight;
								result.matchDetails[key] = points;
							} else if (
								(rule.type === 'limit' && sysVal > Number(userVal)) ||
								(rule.type === 'boolean' && userVal === true && sysVal < 50)
							) {
								penaltyMultiplier *= 0.5;
							}
						}
					}

					if (weightSum > 0) {
						const avgMatch = matchSum / weightSum;
						result.totalScore = clamp(avgMatch + (baseScore - 50) * biasMultiplier);
					}

					result.totalScore *= penaltyMultiplier;
					result.isPenalized = penaltyMultiplier < 1.0;

					return result;
				})
		)
		.sort((a, b) => b.totalScore - a.totalScore);
}
