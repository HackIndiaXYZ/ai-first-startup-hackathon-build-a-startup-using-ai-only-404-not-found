// Generates src/data/buildlog.json from git history so the "Built with AI"
// page shows the real build timeline. Runs before every build.
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const repo = join(root, "..");
const OUT = join(root, "src/data/buildlog.json");
const PRODUCT = /^(app|docs|business|pitch|README\.md|\.github|vercel\.json|netlify\.toml)/;

function git(cmd) {
  try {
    return execSync(`git -C "${repo}" ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

const raw = git(`log --reverse --date=iso-strict --pretty=format:"@@%H|%ad|%s|%an" --numstat`);
const commits = [];
let cur = null;
for (const line of raw.split("\n")) {
  if (line.startsWith("@@")) {
    const [hash, date, subject, author] = line.slice(2).split("|");
    cur = { hash: hash.slice(0, 7), date, subject, author, added: 0, deleted: 0, files: 0, areas: new Set() };
    commits.push(cur);
  } else if (cur && line.trim()) {
    const [a, d, file] = line.split("\t");
    if (!file || !PRODUCT.test(file) || /package-lock|cities\.json|buildlog\.json/.test(file)) continue;
    cur.added += Number(a) || 0;
    cur.deleted += Number(d) || 0;
    cur.files += 1;
    cur.areas.add(file.split("/").slice(0, file.startsWith("app/") ? 3 : 1).join("/"));
  }
}
const product = commits.filter((c) => c.files > 0).map((c) => ({ ...c, areas: [...c.areas].slice(0, 6) }));

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const srcFiles = [...walk(join(root, "src")), ...walk(join(root, "server")), ...walk(join(root, "api")), ...walk(join(root, "tests")), ...walk(join(root, "scripts"))].filter(
  (f) => /\.(tsx?|css|mjs)$/.test(f) && !/buildlog\.json/.test(f),
);
const loc = srcFiles.reduce((a, f) => a + readFileSync(f, "utf8").split("\n").length, 0);
const tests = walk(join(root, "tests"))
  .filter((f) => f.endsWith(".test.ts"))
  .reduce((a, f) => a + (readFileSync(f, "utf8").match(/\bit\(/g) ?? []).length, 0);
const docs = walk(join(repo, "docs")).filter((f) => f.endsWith(".md"));
const docWords = docs.reduce((a, f) => a + readFileSync(f, "utf8").split(/\s+/).length, 0);

const data = {
  generated: new Date().toISOString(),
  stats: {
    commits: product.length,
    files: srcFiles.length,
    linesAdded: product.reduce((a, c) => a + c.added, 0),
    loc,
    tests,
    docs: docs.length,
    docWords,
  },
  commits: product,
};
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(`buildlog: ${product.length} commits, ${loc} lines of source, ${tests} tests`);
