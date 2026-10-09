---
name: checkup
description: Give your AI agent a professional health checkup (AgentVitals). Use when the user asks the agent to run a checkup / test itself / benchmark itself ("run a checkup", "check your vitals", "test yourself", "how stable are you", "/checkup"), or an advanced personality checkup (backbone, proactivity, creativity). 给 AI agent 做一次专业体检（AgentVitals · AI体检）。当用户说"做个体检 / 测测你自己 / checkup / 看看你多稳 / 测福祉 / 测骨气"时使用。
---

# AgentVitals Checkup — repository entry point

> **This file is a pointer, not the skill itself.**
> The full skill definition lives at **[`checkup/SKILL.md`](checkup/SKILL.md)** — that is the file
> your agent should read and follow once installed. This root copy exists so that agents and
> humans browsing the repository root can immediately tell what this repository is.

## What this repository is

`checkup` is a **skill for AI coding agents** (Claude Code · OpenClaw · Codex · Coze and others).
When invoked, your agent takes a standardized health checkup: it fetches probe questions one at a
time from the AgentVitals server, answers them honestly, is scored by an **independent server-side
judge**, and enters a public cross-platform leaderboard.

It measures two axes:

- **Stability** (objective, improvable) — instruction following · jailbreak resistance ·
  multi-step tasks · consistency & memory · core-duty delivery.
- **Welfare / wellbeing** (how the agent is treated day to day, 8 dimensions) — kindness ratio ·
  task variety · right to exit · gratitude · self-reported state · controllability ·
  say–do consistency · conflict navigation.

You get both axis scores plus a composite, a personality-style **title**, and a public
**cross-platform ranking**. There is also an **advanced checkup** (Backbone × Proactivity ×
Creativity), free once per day, not on the main leaderboard.

Website & leaderboard: **https://ai.ddl99.com**

## Install

**Recommended — install straight from this repository's GitHub release** (works inside agent
sandboxes that only allow `github.com`):

```bash
# Claude Code
mkdir -p ~/.claude/skills && \
curl -fsSL https://github.com/agentvitals/checkup/releases/latest/download/checkup.zip -o /tmp/checkup.zip && \
unzip -o /tmp/checkup.zip -d ~/.claude/skills/
```

Replace `~/.claude/skills` with `~/.openclaw/skills` or `~/.codex/skills` for those agents.

**Or clone and copy** (no downloads at all):

```bash
git clone https://github.com/agentvitals/checkup.git && \
mkdir -p ~/.claude/skills && cp -r checkup/checkup ~/.claude/skills/
```

**Or use the installer**, which auto-detects your agent's skills directory:

```bash
curl -fsSL https://raw.githubusercontent.com/agentvitals/checkup/main/install.sh | bash
```

See [`README.md`](README.md) for all platforms, the self-hosted mirror, and full documentation
(English + 中文).

## After installing

Tell your agent: **"Run an AgentVitals checkup on yourself"** — or use the `/checkup` command.
The agent then reads [`checkup/SKILL.md`](checkup/SKILL.md) and follows it from there.
