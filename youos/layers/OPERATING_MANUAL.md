# YouOS Operating Manual

## Overview

YouOS is a tool-agnostic personal AI operating system built on the AgentOS framework. It stores your identity, context, skills, and memory in plain files that any AI tool can read.

## 7-Layer Architecture

| Layer | File | Purpose |
|-------|------|---------|
| 1 | identity.md | Who you are: values, style, preferences |
| 2 | context.md | What you know: projects, background, learnings |
| 3 | skills.md | Your workflows: processes, tools, expertise |
| 4 | memory.json | Persistent data: decisions, notes, history |
| 5 | connections.json | Your tools: API connections and integrations |
| 6 | automations.json | Update schedules: what syncs and when |
| 7 | OPERATING_MANUAL.md | This file |

## Commands

### Initialise
```bash
node youos.js init
```

### Check status
```bash
node youos.js status
```

### Sync automations
```bash
node youos.js sync
```

### Export all layers
```bash
node youos.js export
```

## Compatibility

Works with: Claude, OpenAI, OpenClaw, Cursor, and any AI tool that accepts context files.

## Getting Started

1. Run `node youos.js init` to create the layer files
2. Edit `youos/layers/identity.md` with your details
3. Edit `youos/layers/context.md` with your current projects
4. Edit `youos/layers/skills.md` with your workflows
5. Paste the relevant layer content into your AI tool's system prompt or context window
