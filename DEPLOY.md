# Deploy Multi-Workspace Notion MCP Server

This MCP server connects Claude to BOTH personal and Bridgit Notion workspaces.

## Setup Steps

### 1. Deploy to Railway
- Go to https://railway.app
- Sign up with GitHub
- New Project → Deploy from GitHub → select personal-context-portfolio
- Railway auto-deploys

### 2. Add Environment Variables in Railway
- NOTION_PERSONAL_TOKEN (your personal Notion token)
- NOTION_BRIDGIT_TOKEN (your Bridgit Notion token)
- PERSONAL_KANBAN_DB_ID (your Kanban database ID)

### 3. Get your Railway URL
- Railway dashboard → Settings → Generate Domain
- You'll get: your-app.up.railway.app

### 4. Test
- Visit https://your-app.up.railway.app/
- Should see status: running

### 5. Connect to Claude
- Add as custom MCP server in Claude
- URL: https://your-app.up.railway.app/mcp

## What It Does

- Auto-detects which Notion to use (personal vs Bridgit) based on context
- Searches both workspaces
- Reads/writes to your Kanban
- Lets Claude work across both seamlessly
