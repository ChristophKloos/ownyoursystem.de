export interface Question {
  id: string;
  title?: string;
  icon?: string;
  options?: any[];
  _ruleType: 'match' | 'limit' | 'boolean';
  [key: string]: any;
}

export interface DataPayload {
  questions: Question[];
  distros: any[];
  desktops: any[];
  nameMapping: Record<string, any>;
  tags: any[];
}

export async function fetchData(): Promise<DataPayload> {
  const fetchOpts: RequestInit = { cache: "no-store" };

  const [qResp, dResp, deResp, nResp, tResp] = await Promise.all([
    fetch("data/questions.json", fetchOpts),
    fetch("data/distros.json", fetchOpts),
    fetch("data/desktops.json", fetchOpts),
    fetch("data/distros_combinations.json", fetchOpts),
    fetch("data/tags.json", fetchOpts),
  ]);

  const rawQuestions = await qResp.json();

  const combinedQuestions: Question[] = [
    ...(rawQuestions.matches || []).map((q: any) => ({ ...q, _ruleType: "match" })),
    ...(rawQuestions.filters || []).map((q: any) => ({ ...q, _ruleType: "limit" })),
    ...(rawQuestions.booleans || []).map((q: any) => ({ ...q, _ruleType: "boolean" })),
  ];

  return {
    questions: combinedQuestions,
    distros: await dResp.json(),
    desktops: await deResp.json(),
    nameMapping: await nResp.json(),
    tags: await tResp.json(),
  };
}