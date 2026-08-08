export async function fetchData() {
  const fetchOpts = { cache: "no-store" };

  const [qResp, dResp, deResp, nResp, tResp] = await Promise.all([
    fetch("data/questions.json", fetchOpts),
    fetch("data/distros.json", fetchOpts),
    fetch("data/desktops.json", fetchOpts),
    fetch("data/distros_combinations.json", fetchOpts),
    fetch("data/tags.json", fetchOpts),
  ]);

  const rawQuestions = await qResp.json();

  const combinedQuestions = [
    ...(rawQuestions.matches || []).map((q) => ({ ...q, _ruleType: "match" })),
    ...(rawQuestions.filters || []).map((q) => ({ ...q, _ruleType: "limit" })),
    ...(rawQuestions.booleans || []).map((q) => ({ ...q, _ruleType: "boolean" })),
  ];

  return {
    questions: combinedQuestions,
    distros: await dResp.json(),
    desktops: await deResp.json(),
    nameMapping: await nResp.json(),
    tags: await tResp.json(),
  };
}