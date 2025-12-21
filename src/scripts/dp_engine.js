import { QUESTION_MAP } from './dp_config.js';

export function calculateResults(distros, desktopModifiers, answers) {
  const results = [];

  distros.forEach(distro => {
    distro.desktops.forEach(desktop => {
      let raw = { ...distro.scores };
      let distroExtra = Number(raw.Extra_Score || 0);
      delete raw.Extra_Score;

      let desktopExtra = 0;
      const mods = desktopModifiers[desktop] || desktopModifiers.desktops?.[desktop];

      if (mods) {
        desktopExtra = Number(mods.Extra_Score || 0);
        Object.entries(mods).forEach(([key, mod]) => {
          if (key !== "Extra_Score" && raw[key] !== undefined) {
            raw[key] += mod;
          }
        });
      }

      Object.keys(raw).forEach(k => raw[k] = Math.max(0, Math.min(3, raw[k])));

      let match = { ...raw };
      Object.entries(QUESTION_MAP).forEach(([qid, field]) => {
        if (match[field] !== undefined) {
          const userAns = (answers[qid] !== undefined && answers[qid] !== null) ? answers[qid] : 2;
          const diff = Math.abs(userAns - raw[field]);
          match[field] = Math.max(0, Math.min(3, 3 - diff));
        }
      });

      const matchSum = Object.values(match).reduce((a, b) => a + b, 0);
      const total = matchSum + distroExtra + desktopExtra;

      results.push({
        distro: distro.name,
        icon: distro.icon,
        link: distro.link,
        description: distro.description,
        desktop,
        rawScore: raw,
        matchScore: match,
        total
      });
    });
  });

  return results.sort((a, b) => b.total - a.total);
}