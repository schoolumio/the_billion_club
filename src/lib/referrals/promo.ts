/** Phrases that read as financial promises are rejected; approved disclaimers are allowed. */
const ALLOWED_DISCLAIMERS = [/not an investment/gi, /no guaranteed (financial )?returns?/gi, /does not guarantee[^.]*/gi, /no financial return/gi];
const BANNED: [RegExp, string][] = [
  [/guarantee/i, "guarantee"], [/get rich/i, "get rich"], [/jackpot/i, "jackpot"], [/\binvest(ment|ments|ing|or|ors)?\b/i, "investment"],
  [/\breturns?\b/i, "returns"], [/passive income/i, "passive income"], [/double your/i, "double your"], [/\bprofits?\b/i, "profit"],
  [/\bearn(ings)?\b/i, "earn"], [/you will become/i, "you will become"],
];
export function promoViolation(body: string): string | null {
  let t = body;
  for (const re of ALLOWED_DISCLAIMERS) t = t.replace(re, "");
  return BANNED.find(([re]) => re.test(t))?.[1] ?? null;
}

