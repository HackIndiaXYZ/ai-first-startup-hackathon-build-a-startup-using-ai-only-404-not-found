import { ArrowUpRight, GitCommit, Robot, User } from "@phosphor-icons/react";
import { usePageIntro } from "../lib/motion";
import { useEffect } from "react";
import { TOOL_SCHEMAS } from "../ai/tools";
import { Stat } from "../components/ui";
import { REPO_BLOB } from "../config";
import buildlog from "../data/buildlog.json";
import { num } from "../engine/format";
import "../styles/built.css";

interface Commit {
  hash: string;
  date: string;
  subject: string;
  added: number;
  deleted: number;
  files: number;
  areas: string[];
}
const LOG = buildlog as { generated: string; stats: { commits: number; files: number; linesAdded: number; loc: number; tests: number; docs: number; docWords: number }; commits: Commit[] };

const STAGES = [
  {
    k: "Research",
    ai: "Read the event page and found the weighted rubric (AI-First 25%, Product 20%, Functionality 20%, Market 15%, AI Workflow 10%, Pitch 10%). Profiled the judges, priced the SHARP prize, mapped saturated ideas, and gathered 40+ sourced 2026 data points with a fact-check log.",
    human: "Wrote the brief.",
    doc: "docs/01-research.md",
  },
  {
    k: "Ideation",
    ai: "Generated 25 startup ideas across all five tracks, each mapped on problem, payer, AI role, MVP, demo moment, data, model, market, competitors, moat, risks and visual hook. Scored on an 8-factor rubric derived from the judging weights.",
    human: "None.",
    doc: "docs/02-ideation.md",
  },
  {
    k: "Selection",
    ai: "Ran pairwise debates on the top 9, fused three money-recovery ideas into one challenger, red-teamed the final three with each judge's likely question, then looped stress tests until the ranking held twice.",
    human: "None.",
    doc: "docs/03-selection.md",
  },
  {
    k: "Planning",
    ai: "Wrote the full engineering and design plan, then re-read it as a judge, a homeowner on a cheap phone, an installer, a VC and an awwwards designer, and folded nine changes back in.",
    human: "None.",
    doc: "docs/04-plan.md",
  },
  {
    k: "Engine",
    ai: "Implemented the PV model (Klein, Erbs, Liu-Jordan), NOAA sun position, subsidy and state top-ups, net metering, 25-year finance, the 14-rule quote audit and the bill audit. Fetched NASA POWER data for 72 cities. Wrote the unit tests.",
    human: "None.",
    doc: "app/src/engine",
  },
  {
    k: "AI layer",
    ai: "Designed seven typed tools shared by two agents: a Claude agent loop on the server and an on-device intent router. Wrote the document extractors (Claude structured output, OCR, PDF text, rules) and a sourced knowledge base in English and Hindi.",
    human: "None.",
    doc: "app/src/ai",
  },
  {
    k: "Design & 3D",
    ai: "Chose the visual world (Indian rooftop at golden hour), the palette and type, built the procedural 3D roof, neighbourhood, kites and sky shader, the scroll-driven day cycle with GSAP and Lenis, and every page. Screenshotted its own work in headless Chromium and fixed what it saw.",
    human: "Supplied the design skills and shadcn/ui reference in the repo.",
    doc: "app/src/three",
  },
  {
    k: "Design overhaul",
    ai: "From a second brief: re-read the Awwwards, taste and GSAP skills, wrote a design brief, pulled six CC0 models from Poly Haven through its API and packed them to 738 KB with glTF-Transform. Rebuilt the renderer (sky-baked reflections, ambient occlusion, bloom, adaptive quality) and the landing (preloader, SplitText chapters, velocity marquee, stacking cards, route curtain).",
    human: "Wrote the second brief.",
    doc: "docs/05-design.md",
  },
  {
    k: "Test phase",
    ai: "Added design-system unit tests (including a WCAG contrast check across the whole day, which caught a real dusk-contrast bug) and a Playwright suite: every route, every tool flow, axe-core accessibility, keyboard, reduced motion, no-WebGL, phones and a four-width viewport sweep.",
    human: "None.",
    doc: "docs/test-report.md",
  },
  {
    k: "Business",
    ai: "Built the business plan and a formula-driven financial model: unit economics, 5-year P&L, cash flow, funding ask, sensitivity.",
    human: "None.",
    doc: "business",
  },
  {
    k: "Pitch & demo",
    ai: "Wrote and designed the pitch deck (this site's /deck route, exported to PDF), the demo script, and recorded the walkthrough video with a scripted browser.",
    human: "Optional: voice-over on the demo video.",
    doc: "pitch",
  },
];

const PROMPT = `Hack India startup with AI hackathon.

First, you need to research everything about it … every factor you can ever think of.
1. You have to plan your deep research.
2. You have to map out every factor, do the research, and check it.
3. You have to verify it, fact-check, and see what's important and what's not.
4. You have to find out what's good for winning.
5. You have to debate it.
6. Once you have all the information with you, you need to start an ideaotron.
…
9. You need to make 25 fully functional ideas …
10. You will debate all of them …

You will choose one idea after comparing them absolutely rigorously in a repetitive loop until you get one perfect idea.
You will plan that idea in exhaustive detail … You will plan it again from a new, fresh perspective …
After planning, you will implement that plan in absolute entirety … do not make it look like AI …
… financials and a business plan … in the shoes of a financial advisor while making the website in the shoes of a web designer …
You have to behave completely autonomously.

+ "use GitHub and existing codebases and animation, three.js, OpenGL, WebGL and 3D models … awwwards … GSAP smooth scroll and scroll animation … Lenis … all the design skills in the skills folder … react components folder too. So get to work."`;

const SYSTEM_EXCERPT = `You are Chhat, an independent rooftop-solar advisor for Indian homes. You don't sell panels.
- Every rupee figure, kW size, unit count, subsidy or payback you state must come from a tool result in this conversation.
- For rules and process questions, call search_knowledge first and cite the source it returns.
- Reply in the user's language and script. Use gender-neutral Hindi phrasing for yourself.
- Be brief and concrete: 2 to 6 sentences, or a short list. Indian number formatting.`;

export default function BuiltWithAI() {
  const intro = usePageIntro<HTMLDivElement>();
  useEffect(() => {
    document.title = "Built with AI · Chhat";
  }, []);
  const s = LOG.stats;
  return (
    <div className="page built-page" ref={intro}>
      <header className="wrap page__head">
        <p className="eyebrow">AI usage report · live</p>
        <h1 className="page__title">One brief in. A startup out.</h1>
        <p className="page__lede">
          Claude Code (Anthropic) did the research, ran the idea tournament, wrote every line of code and copy, designed the 3D world, built the financial model and the deck, and tested its own output in a headless browser. A person wrote the brief and reviewed the result.
        </p>
      </header>

      <section className="wrap">
        <div className="built-stats">
          <Stat label="Product commits" value={num(s.commits)} />
          <Stat label="Lines of source" value={num(s.loc)} />
          <Stat label="Unit tests" value={num(s.tests)} />
          <Stat label="Words of research & planning" value={num(s.docWords)} />
          <Stat label="Code written by a human" value="0 lines" />
        </div>
      </section>

      <section className="wrap built-section">
        <h2 className="section-h">The lifecycle, stage by stage</h2>
        <div className="stages">
          {STAGES.map((st, i) => (
            <article key={st.k} className="stage-row">
              <span className="stage-row__n mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="stage-row__k">{st.k}</h3>
              <div className="stage-row__ai">
                <Robot size={16} weight="fill" />
                <p>{st.ai}</p>
              </div>
              <div className="stage-row__human">
                <User size={16} weight="fill" />
                <p>{st.human}</p>
              </div>
              <a className="stage-row__doc mono" href={`${REPO_BLOB}/${st.doc}`} target="_blank" rel="noreferrer">
                {st.doc} <ArrowUpRight size={12} weight="bold" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap built-section built-two">
        <div>
          <h2 className="section-h">How the product's AI works</h2>
          <figure className="arch" aria-label="Architecture diagram">
            <svg viewBox="0 0 640 430" role="img">
              <title>Chhat's agent architecture</title>
              <defs>
                <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
              </defs>
              <g className="arch__box arch__box--ink">
                <rect x="220" y="14" width="200" height="52" rx="12" />
                <text x="320" y="46">Browser (any device)</text>
              </g>
              <g className="arch__box">
                <rect x="30" y="120" width="250" height="70" rx="12" />
                <text x="155" y="148">Live mode</text>
                <text x="155" y="170" className="arch__sub">/api/agent → Claude Opus 5.5</text>
              </g>
              <g className="arch__box">
                <rect x="360" y="120" width="250" height="70" rx="12" />
                <text x="485" y="148">On-device mode</text>
                <text x="485" y="170" className="arch__sub">intent router + BM25 KB</text>
              </g>
              <g className="arch__box arch__box--haldi">
                <rect x="100" y="240" width="440" height="78" rx="12" />
                <text x="320" y="268">7 typed tools (strict JSON schemas)</text>
                <text x="320" y="292" className="arch__sub">get_irradiance · size_system · compute_subsidy · finance_options</text>
                <text x="320" y="308" className="arch__sub">audit_quote · audit_bill · search_knowledge</text>
              </g>
              <g className="arch__box arch__box--ink">
                <rect x="140" y="360" width="360" height="56" rx="12" />
                <text x="320" y="385">Deterministic engine (tested)</text>
                <text x="320" y="404" className="arch__sub arch__sub--inv">NASA POWER · MNRE rules · CEA · finance</text>
              </g>
              <path d="M290,66 L170,120" className="arch__line" markerEnd="url(#ar)" />
              <path d="M350,66 L470,120" className="arch__line" markerEnd="url(#ar)" />
              <path d="M155,190 L240,240" className="arch__line" markerEnd="url(#ar)" />
              <path d="M485,190 L400,240" className="arch__line" markerEnd="url(#ar)" />
              <path d="M320,318 L320,360" className="arch__line" markerEnd="url(#ar)" />
              <text x="232" y="98" className="arch__note">key set on server</text>
              <text x="408" y="98" className="arch__note">no key / offline</text>
            </svg>
          </figure>
          <p className="muted small">
            The model never computes a rupee figure itself. Both agents call the same tools, and the UI shows the trace. Documents go through Claude structured output when live, and through on-device OCR, PDF text and parsing rules otherwise. Every extracted field lands in an editable form before anything is computed.
          </p>
        </div>
        <div>
          <h2 className="section-h">The tools Claude can call</h2>
          <ul className="toollist">
            {TOOL_SCHEMAS.map((t) => (
              <li key={t.name}>
                <code>{t.name}</code>
                <p>{t.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap built-section built-two">
        <div>
          <h2 className="section-h">The brief (the human's whole contribution)</h2>
          <pre className="prompt" data-lenis-prevent tabIndex={0} aria-label="The brief">
            {PROMPT}
          </pre>
        </div>
        <div>
          <h2 className="section-h">The product's system prompt</h2>
          <pre className="prompt prompt--sys" data-lenis-prevent tabIndex={0} aria-label="System prompt">
            {SYSTEM_EXCERPT}
          </pre>
          <p className="muted small">
            Full prompts, tool schemas and extraction instructions: <a href={`${REPO_BLOB}/app/server/claude.ts`}>app/server/claude.ts</a> · full usage report: <a href={`${REPO_BLOB}/docs/ai-usage-report.md`}>docs/ai-usage-report.md</a>
          </p>
        </div>
      </section>

      <section className="wrap built-section">
        <h2 className="section-h">Commit log</h2>
        <p className="muted small">Generated from git at build time ({new Date(LOG.generated).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}). Every commit is co-authored by Claude.</p>
        <ol className="commits">
          {[...LOG.commits].reverse().map((c) => (
            <li key={c.hash}>
              <GitCommit size={18} weight="bold" />
              <div>
                <p className="commits__s">{c.subject}</p>
                <p className="commits__m mono">
                  {c.hash} · {new Date(c.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · +{num(c.added)} −{num(c.deleted)} · {c.files} files
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
