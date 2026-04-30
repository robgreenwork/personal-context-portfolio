# YouOS: Personal Operating System

A tool-agnostic personal AI operating system built on the AgentOS framework.

## What It Is

YouOS stores your identity, working context, skills, and memory in plain files. Any AI tool (Claude, OpenAI, Cursor, OpenClaw) can read these files to instantly understand who you are and what you are working on.

## Quick Start

```bash
# Initialise your 7 layers
node youos.js init

# Check everything is in place
node youos.js status

# Export all layers to a single JSON file
node youos.js export
```

## The 7 Layers

```
youos/layers/
  identity.md          Who you are
  context.md           What you know and are working on
  skills.md            Your workflows and expertise
  memory.json          Persistent notes and decisions
  connections.json     Tool integrations and API keys
  automations.json     Sync schedules
  OPERATING_MANUAL.md  Full documentation
```

## How to Use With an AI Tool

Paste relevant layer content into the system prompt or context window of any AI tool. Suggested prompts:

**For a new session:**
> Here is my personal context. Please read it before responding.
> [paste identity.md + context.md]

**For a specific project:**
> [paste context.md + skills.md]

## Compatibility

| Tool | Method |
|------|--------|
| Claude | System prompt or file attachment |
| OpenAI | System prompt |
| Cursor | .cursorrules or context file |
| OpenClaw | Context injection |

## Maintenance

Update your layers whenever your focus shifts. The system is only as useful as the information in it.

---

Built on the [AgentOS framework](https://github.com/agentOS).
