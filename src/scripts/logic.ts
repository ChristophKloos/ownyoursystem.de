export const DEFAULT_BIAS = 50;

export interface Rule {
  type: 'match' | 'boolean' | 'limit';
  weight?: number;
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const toMap = (arr: any[], keyFallback: string, mapFn: (i: any) => any = i => i) =>
  Array.isArray(arr) 
    ? Object.fromEntries(arr.map(i => [i.id || i.name || i[keyFallback], mapFn(i)])) 
    : (arr || {});

export function processDistroPicker(
  distros: any[],
  desktopsData: any,
  answers: Record<string, number | boolean>,
  rulesData: any
) {
  if (!distros) return [];

  const deskMap = toMap(desktopsData?.desktops || desktopsData, 'desktop');
  const ruleMap = toMap(rulesData, 'id', q => ({ type: q._ruleType, weight: q.weight || 1 }));
  
  const { bias: rawBias, ...actualAnswers } = answers || {};
  const biasMultiplier = (rawBias !== undefined ? Number(rawBias) : DEFAULT_BIAS) / 100;
  const answerEntries = Object.entries(actualAnswers);

  return distros.flatMap(distro =>
    (distro.desktops || [])
      .filter(name => deskMap[name])
      .map(deskName => {
        const desktop = deskMap[deskName];
        const baseScore = clamp((distro.scores?.bias ?? 50) + ((desktop.scores?.bias ?? 50) - 50));
        
        const result = {
          ...distro,
          distro: distro.name || distro.id,
          desktop: deskName,
          totalScore: baseScore,
          matchDetails: {} as Record<string, number>,
          sysDetails: {} as Record<string, number>,
          isPenalized: false
        };

        let matchSum = 0;
        let weightSum = 0;
        let penaltyMultiplier = 1.0;

        for (const [key, userVal] of answerEntries) {
          const rule = ruleMap[key];
          const rawDVal = distro.scores?.[key];
          const rawDkVal = desktop.scores?.[key];

          if (!rule || (rawDVal === undefined && rawDkVal === undefined)) continue;

          const dVal = typeof rawDVal === 'boolean' ? (rawDVal ? 100 : 0) : rawDVal;
          const dkVal = typeof rawDkVal === 'boolean' ? (rawDkVal ? 100 : 0) : rawDkVal;
          const sysVal = clamp((dVal ?? 50) + (dkVal !== undefined ? dkVal - 50 : 0));
          
          result.sysDetails[key] = sysVal;

          if (rule.type === 'match') {
            const points = clamp(100 - Math.abs(Number(userVal) - sysVal));
            matchSum += points * rule.weight;
            weightSum += rule.weight;
            result.matchDetails[key] = points;
          } 
          else if (
            (rule.type === 'limit' && sysVal > Number(userVal)) ||
            (rule.type === 'boolean' && userVal === true && sysVal < 50)
          ) {
            penaltyMultiplier *= 0.5;
          }
        }

        if (weightSum > 0) {
          const avgMatch = matchSum / weightSum;
          result.totalScore = clamp(avgMatch + ((baseScore - 50) * biasMultiplier));
        }

        result.totalScore *= penaltyMultiplier;
        result.isPenalized = penaltyMultiplier < 1.0;

        return result;
      })
  ).sort((a, b) => b.totalScore - a.totalScore);
}