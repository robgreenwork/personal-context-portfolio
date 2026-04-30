#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LAYER_TEMPLATES = {
  'identity.md': `# Identity Layer

## Who I Am
- Name: Rob Green
- Role:
- Organisation: Bridgit

## Core Values
-

## Working Style
- No em dashes
- UK English
- Concise tone

## Communication Preferences
- Direct and clear
- Structured over verbose
`,

  'context.md': `# Context Layer

## Current Focus
-

## Active Projects
- Bridgit (charity integration software)

## Background Knowledge
- Charity sector
- Fundraising software
- Nonprofit technology

## Recent Learnings
-
`,

  'skills.md': `# Skills Layer

## Core Workflows
-

## Tools and Systems
- Claude Code
- GitHub

## Expertise Areas
-

## Learning Goals
-
`,

  'memory.json': `{
  "version": "1.0.0",
  "created": "${new Date().toISOString()}",
  "entries": []
}
`,

  'connections.json': `{
  "version": "1.0.0",
  "tools": {
    "claude": { "enabled": true, "api_key_env": "ANTHROPIC_API_KEY" },
    "openai": { "enabled": false, "api_key_env": "OPENAI_API_KEY" },
    "github": { "enabled": true, "username": "robgreenwork" },
    "cursor": { "enabled": false },
    "openclaw": { "enabled": false }
  },
  "integrations": []
}
`,

  'automations.json': `{
  "version": "1.0.0",
  "schedules": {
    "daily": [],
    "weekly": [],
    "monthly": []
  },
  "triggers": []
}
`,

  'OPERATING_MANUAL.md': `# YouOS Operating Manual

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
\`\`\`bash
node youos.js init
\`\`\`

### Check status
\`\`\`bash
node youos.js status
\`\`\`

### Sync automations
\`\`\`bash
node youos.js sync
\`\`\`

### Export all layers
\`\`\`bash
node youos.js export
\`\`\`

## Compatibility

Works with: Claude, OpenAI, OpenClaw, Cursor, and any AI tool that accepts context files.

## Getting Started

1. Run \`node youos.js init\` to create the layer files
2. Edit \`youos/layers/identity.md\` with your details
3. Edit \`youos/layers/context.md\` with your current projects
4. Edit \`youos/layers/skills.md\` with your workflows
5. Paste the relevant layer content into your AI tool's system prompt or context window
`
};

function init(force = false) {
  const layersDir = join(process.cwd(), 'youos', 'layers');

  if (existsSync(layersDir) && !force) {
    console.log('YouOS already initialised. Use --force to reinitialise.');
    return;
  }

  mkdirSync(layersDir, { recursive: true });

  for (const [filename, content] of Object.entries(LAYER_TEMPLATES)) {
    const filepath = join(layersDir, filename);
    writeFileSync(filepath, content, 'utf8');
    console.log(`  created  youos/layers/${filename}`);
  }

  console.log('\nYouOS initialised. Edit youos/layers/ with your personal information.');
}

function status() {
  const layersDir = join(process.cwd(), 'youos', 'layers');

  if (!existsSync(layersDir)) {
    console.log('YouOS not initialised. Run: node youos.js init');
    return;
  }

  console.log('YouOS Status\n');

  let allOk = true;
  for (const filename of Object.keys(LAYER_TEMPLATES)) {
    const filepath = join(layersDir, filename);
    const exists = existsSync(filepath);
    if (!exists) allOk = false;
    const label = exists ? 'OK     ' : 'MISSING';
    const size = exists ? `${statSync(filepath).size}b` : '';
    console.log(`  ${label}  youos/layers/${filename} ${size}`);
  }

  console.log(allOk ? '\nAll layers present.' : '\nRun init to create missing layers.');
}

function sync() {
  const automationsPath = join(process.cwd(), 'youos', 'layers', 'automations.json');

  if (!existsSync(automationsPath)) {
    console.log('No automations file found. Run: node youos.js init');
    return;
  }

  const automations = JSON.parse(readFileSync(automationsPath, 'utf8'));
  const total = Object.values(automations.schedules).flat().length;
  console.log(`Sync complete. ${total} scheduled automation${total === 1 ? '' : 's'} found.`);
}

function exportSystem() {
  const layersDir = join(process.cwd(), 'youos', 'layers');

  if (!existsSync(layersDir)) {
    console.log('YouOS not initialised. Run: node youos.js init');
    return;
  }

  const exportData = {
    exported: new Date().toISOString(),
    layers: {}
  };

  for (const filename of Object.keys(LAYER_TEMPLATES)) {
    const filepath = join(layersDir, filename);
    if (existsSync(filepath)) {
      exportData.layers[filename] = readFileSync(filepath, 'utf8');
    }
  }

  const exportPath = join(process.cwd(), 'youos-export.json');
  writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
  console.log(`Exported to: youos-export.json`);
}

const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1);

switch (command) {
  case 'init':
    init(flags.includes('--force'));
    break;
  case 'status':
    status();
    break;
  case 'sync':
    sync();
    break;
  case 'export':
    exportSystem();
    break;
  default:
    console.log('YouOS - Personal Operating System\n');
    console.log('Commands:');
    console.log('  node youos.js init            Initialise 7-layer structure');
    console.log('  node youos.js init --force    Reinitialise (overwrites existing)');
    console.log('  node youos.js status          Check layer status');
    console.log('  node youos.js sync            Run automations');
    console.log('  node youos.js export          Export all layers to JSON');
}
