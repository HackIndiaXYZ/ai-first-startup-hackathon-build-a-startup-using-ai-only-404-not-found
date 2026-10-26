// Small BM25 index for the knowledge base. Handles Hinglish spellings by
// mapping common romanized Hindi words to their English equivalents.

const STOP = new Set(
  "a an the is are was were be to of in on for and or with my me i you your it this that what how do does can should will much many about from at by as if so we our".split(" "),
);

const HINGLISH: Record<string, string> = {
  kitna: "how much",
  kitni: "how much",
  kitne: "how many",
  sabsidi: "subsidy",
  sabsidy: "subsidy",
  bijli: "electricity",
  bill: "bill",
  chhat: "roof",
  chat: "roof",
  lagaye: "install",
  lagana: "install",
  lagwana: "install",
  kaise: "how",
  kab: "when",
  paisa: "money",
  kharcha: "cost",
  baarish: "monsoon rain",
  safai: "cleaning",
  fayda: "worth savings",
  labh: "worth savings",
  "सब्सिडी": "subsidy",
  "लोन": "loan",
  "बिल": "bill",
  "छत": "roof",
  "पैनल": "panel",
  "नेट": "net",
  "मीटर": "meter",
  "कितनी": "how much",
  "कितना": "how much",
  "आवेदन": "apply",
  "वेंडर": "vendor",
  "सफ़ाई": "cleaning",
  "बैटरी": "battery",
  "मानसून": "monsoon",
  "जीएसटी": "gst",
};

export function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const t of raw) {
    const mapped = HINGLISH[t];
    if (mapped) out.push(...mapped.split(" "));
    else if (!STOP.has(t)) out.push(t.replace(/\.$/, ""));
  }
  return out;
}

export function bm25(docs: string[], k1 = 1.4, bParam = 0.75) {
  const toks = docs.map(tokenize);
  const avg = toks.reduce((a, t) => a + t.length, 0) / Math.max(1, toks.length);
  const df = new Map<string, number>();
  toks.forEach((t) => new Set(t).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
  const N = docs.length;
  return (query: string, k = 3): number[] => {
    const q = tokenize(query);
    const scores = toks.map((t, i) => {
      let sc = 0;
      for (const w of q) {
        const f = t.filter((x) => x === w || (w.length > 4 && x.startsWith(w.slice(0, -1)))).length;
        if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(w) ?? 0) + 0.5) / ((df.get(w) ?? 0) + 0.5));
        sc += idf * ((f * (k1 + 1)) / (f + k1 * (1 - bParam + (bParam * t.length) / avg)));
      }
      return { i, sc };
    });
    return scores
      .filter((x) => x.sc > 0.5)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, k)
      .map((x) => x.i);
  };
}
