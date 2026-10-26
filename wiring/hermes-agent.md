# Wiring: Connect Your Portfolio to Hermes Agent

## What This Does

[Hermes Agent](https://github.com/NousResearch/hermes-agent) from Nous Research is a self-hosted agent that runs in your terminal or on a VPS and talks to you over Telegram, Slack, Discord, WhatsApp, Signal and email. It keeps its own memory, writes its own skills and runs scheduled jobs. Wiring your portfolio into it means every one of those surfaces starts from who you are, not from a blank slate.

## Where Hermes Gets Its Context

Hermes reads context from a few fixed places. Each one maps to a different part of your portfolio.

| Hermes location | What it is | What to put there |
|-----------------|-----------|-------------------|
| `~/.hermes/SOUL.md` | Global identity and tone, loaded into every session | `identity.md` + the key rules from `communication-style.md` |
| `~/.hermes/memories/USER.md` | Agent-managed user profile, capped at about 1,375 characters | A short pointer to your portfolio, not the portfolio itself |
| `AGENTS.md` (or `.hermes.md`) in the working directory | Project context, loaded when you start Hermes in that folder | An index of your portfolio files |
| `~/.hermes/skills/<name>/SKILL.md` | On-demand instructions, loaded only when relevant | Per-workflow instructions on which portfolio files to read |
| `mcp_servers` in `~/.hermes/config.yaml` | External tool servers | A filesystem or custom MCP server that serves your portfolio |

## Setup

**Step 1: Put your identity in SOUL.md**

`SOUL.md` is the one file Hermes always loads, whatever directory you start it in and whichever platform you message it from. Keep it tight: paste in `identity.md` and the hard rules from `communication-style.md` and `preferences-and-constraints.md`. Hermes seeds a default `SOUL.md` on install, so replace its contents rather than appending.

If you use profiles (`hermes -p work`), each profile has its own `SOUL.md` under `~/.hermes/profiles/<name>/`. That is a good way to keep a work persona and a personal persona apart.

**Step 2: Point Hermes at the rest of the portfolio**

Do not try to fit the portfolio into `USER.md`. It is a small, agent-curated store and writes fail once it is full. Instead, keep your portfolio in a folder (for example `~/context-portfolio/`) and either:

- add an `AGENTS.md` to that folder listing each file and when to read it, then run `hermes` from there, or
- ask Hermes once: "Use the memory tool to save to my user profile: my full context portfolio lives at `~/context-portfolio/`; read the relevant file before any task about my work, projects, team or writing." Then check `~/.hermes/memories/USER.md` to confirm the entry actually landed.

In the CLI you can also attach a file to a single message with `@file:~/context-portfolio/current-projects.md`.

**Step 3 (optional): Serve the portfolio over MCP**

If Hermes runs on a different machine from your portfolio, or you want it reachable from the messaging gateway, expose the folder through MCP (see `mcp-resource.md`). For a local folder:

```yaml
# ~/.hermes/config.yaml
mcp_servers:
  portfolio:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/you/context-portfolio"]
```

For a remote server, such as the Notion MCP server in this repo once it is deployed (see `DEPLOY.md`):

```yaml
mcp_servers:
  notion:
    url: "https://your-app.up.railway.app/mcp"
```

Restart Hermes and its tools are discovered automatically.

## Which Files for Which Workflows

Hermes skills are the natural home for the "which files for which agent" pattern. A skill only loads when the task calls for it, so it does not bloat every conversation. A minimal example:

```markdown
---
name: morning-briefing
description: Daily briefing that prioritises against my current projects and goals
---

# Morning Briefing

Before writing the briefing, read these files from ~/context-portfolio/:
- identity.md
- current-projects.md
- goals-and-priorities.md

Lead with anything that moves a top-priority project. Follow communication-style.md.
```

Save it as `~/.hermes/skills/morning-briefing/SKILL.md`, then schedule it in plain language: "Every weekday at 7:30, run the morning-briefing skill and send it to me on Telegram."

Good pairings:

- **Morning briefing:** `identity.md`, `current-projects.md`, `goals-and-priorities.md`
- **Meeting prep:** `team-and-relationships.md`, `current-projects.md`
- **Writing in your voice:** `communication-style.md`, `domain-knowledge.md`
- **Inbox or message triage:** `preferences-and-constraints.md`, `current-projects.md`, `team-and-relationships.md`
- **Decisions and trade-offs:** `decision-log.md`, `goals-and-priorities.md`

## Tips

- **Hermes scans context files for prompt injection.** `AGENTS.md`, `.hermes.md` and similar files are blocked if they contain hidden HTML comments, phrases like "ignore previous instructions" or zero-width characters. Keep portfolio files as plain markdown.
- **Memory is a frozen snapshot.** Changes to `USER.md` or `MEMORY.md` only appear at the start of the next session. On messaging platforms, run `/new` after updating your portfolio so the agent picks it up.
- **Let the portfolio stay the source of truth.** Hermes will learn things about you on its own and write them to memory. Every so often, review `~/.hermes/memories/` and move anything durable back into the relevant portfolio file.
- **Coming from Claude Code?** Hermes also reads `CLAUDE.md`, and `hermes import-agent claude-code` migrates your MCP servers, skills and instructions.
- The portfolio is context, not instructions. `SOUL.md` and your skills say how Hermes behaves. The portfolio says who it is working for.
