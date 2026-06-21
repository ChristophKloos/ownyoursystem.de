export function calculateResults(
  distros,
  desktopModifiers,
  answers,
  questions,
) {
  const weights = {};
  questions.forEach((q) => (weights[q.id] = q.weight || 1));

  const results = [];

  distros.forEach((distro) => {
    distro.desktops.forEach((desktop) => {
      let raw = { ...distro.scores };
      let distroExtra = Number(raw.Extra_Score || 0);
      delete raw.Extra_Score;

      let desktopExtra = 0;
      const mods =
        desktopModifiers[desktop] || desktopModifiers.desktops?.[desktop];

      if (mods) {
        desktopExtra = Number(mods.Extra_Score || 0);
        Object.entries(mods).forEach(([key, mod]) => {
          if (key !== "Extra_Score" && raw[key] !== undefined) {
            raw[key] += mod;
          }
        });
      }

      Object.keys(raw).forEach(
        (k) => (raw[k] = Math.max(1, Math.min(3, raw[k]))),
      );

      let match = { ...raw };
      const debugLog = {};

      questions.forEach((q) => {
        const field = q.id;
        if (match[field] !== undefined) {
          const userAns =
            answers[field] !== undefined && answers[field] !== null
              ? answers[field]
              : 2;
          const diff = Math.abs(userAns - raw[field]);
          const baseScore = Math.max(0, Math.min(3, 3 - diff));
          const finalScore = baseScore * weights[field];
          match[field] = finalScore;

          debugLog[field] = {
            User_Answer: userAns,
            System_Value: raw[field],
            Weight: weights[field],
            Score: finalScore,
          };
        }
      });

      const matchSum = Object.values(match).reduce((a, b) => a + b, 0);
      const total = matchSum + distroExtra + desktopExtra;

      console.groupCollapsed(`${distro.name} - ${desktop} | Total: ${total}`);
      console.table(debugLog);
      console.log({
        Match_Sum: matchSum,
        Distro_Extra: distroExtra,
        Desktop_Extra: desktopExtra,
        Final_Total: total,
      });
      console.groupEnd();
      console.log("DEBUG TAGS:", distro.name, desktop, [
        ...(distro.tags || []),
        ...(mods?.tags || []),
      ]);

      results.push({
        distro: distro.name,
        icon: distro.icon,
        link: distro.link,
        warning: distro.warning,
        description: distro.description,
        tags: [...(distro.tags || []), ...(mods?.tags || [])],
        desktop,
        rawScore: raw,
        matchScore: match,
        total,
      });
    });
  });

  return results.sort((a, b) => b.total - a.total);
}
