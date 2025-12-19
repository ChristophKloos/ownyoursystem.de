export async function fetchData() {
  const [qResp, dResp, deResp, nResp] = await Promise.all([
    fetch('/js/json/en.json'),
    fetch('/js/json/distros.json'),
    fetch('/js/json/desktops.json'),
    fetch('/js/json/nameMapping.json')
  ]);

  return {
    questions: await qResp.json(),
    distros: await dResp.json(),
    desktops: await deResp.json(),
    nameMapping: await nResp.json()
  };
}