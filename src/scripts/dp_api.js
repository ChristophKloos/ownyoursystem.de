export async function fetchData() {
  const [qResp, dResp, deResp, nResp, tResp] = await Promise.all([
    fetch("data/questions.json"),
    fetch("data/distros.json"),
    fetch("data/desktops.json"),
    fetch("data/distros_combinations.json"),
    fetch("data/tags.json"),
  ]);

  return {
    questions: await qResp.json(),
    distros: await dResp.json(),
    desktops: await deResp.json(),
    nameMapping: await nResp.json(),
    tags: await tResp.json(),
  };
}
