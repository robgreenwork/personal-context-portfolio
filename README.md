# Personal Context Portfolio

Every AI agent, tool, and system you use needs to know who you are. Right now, you re-explain yourself from scratch every time — your role, your projects, your preferences, your constraints. It's the most repetitive, highest-friction part of working with AI, and it gets exponentially worse as the number of agents in your life grows from one to ten to fifty.

The personal context portfolio fixes this. It's a structured set of markdown files that together represent you as a context package — something any agent, any tool, any AI system can ingest and immediately understand who it's working with.

It's not a resume. It's not a profile. It's an operating manual for any AI that works for you.

## What's In It

Ten files, each covering a different dimension of who you are and how you work:

| File | What It Captures |
|------|-----------------|
| `identity.md` | Who you are in one page — the file an agent reads if it can only read one |
| `role-and-responsibilities.md` | What your weeks actually look like, not what your job description says |
| `current-projects.md` | Active workstreams, status, priority, what done looks like |
| `team-and-relationships.md` | Key people, how you interact, what they need from you |
| `tools-and-systems.md` | Your stack, your setup, what connects to what |
| `communication-style.md` | How you write, how you want things written for you |
| `goals-and-priorities.md` | What you're optimizing for and what you're deliberately ignoring |
| `preferences-and-constraints.md` | Hard rules, strong opinions, things any agent should respect |
| `domain-knowledge.md` | What you know that a general-purpose AI doesn't |
| `decision-log.md` | How you make decisions, with real examples |

## Design Principles

**Markdown-first.** Every AI system on earth can read markdown. It's the universal interchange format for context. Not JSON, not PDFs, not databases. Markdown files that are human-readable AND machine-readable.

**Modular, not monolithic.** Not one giant "about me" file. Separate files for separate domains. An agent prepping your meetings doesn't need your full life story — it needs your calendar context, team roster, and meeting preferences. Modularity lets agents grab what's relevant.

**Living, not static.** This isn't a thing you write once. It's a thing you maintain — or better, that your agents help you maintain. Your projects file updates as projects change. Your priorities file shifts quarterly. The portfolio evolves with you.

**Portable across everything.** Works with Claude, works with ChatGPT, works with OpenClaw and Hermes agents, works with whatever comes next. No vendor lock-in. It's just files.

## Two Ways to Build Yours

**Use the web app.** A purpose-built interviewer agent walks you through the whole process. You answer questions, it drafts your files, you correct what it gets wrong, and you walk away with your complete portfolio. Zero setup, zero friction. → [Link to app]

**Do it yourself.** Fork this repo and use the templates in `/templates`. Each template includes the interview questions your AI build partner should ask you, plus the output structure for the finished file. Hand any template to Claude or ChatGPT and say "let's do this one."

## After You Build It

The portfolio is raw material. What makes it powerful is wiring it into the systems you actually use. The `/wiring` directory has guides for exposing your portfolio as an MCP resource, using it in Claude Projects, connecting it to OpenClaw and Hermes agents, and more. That's the real work — and it's on you.

## Repo Structure

```
personal-context-portfolio/
├── README.md                    ← you are here
├── GETTING-STARTED.md           ← step-by-step for both paths
├── templates/                   ← empty templates with interview protocols
├── examples/                    ← filled-out examples for three personas
│   ├── knowledge-worker/
│   ├── executive/
│   └── entrepreneur/
├── wiring/                      ← guides for connecting your portfolio to AI tools
└── interview-protocol/
    └── agent-system-prompt.md   ← the full system prompt from the web app
```

## License

MIT. Fork it, customize it, use it however you want.
