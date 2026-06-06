#!/usr/bin/env node

/**
 * Multi-Workspace Notion MCP Server v3
 *
 * Fixed for Rob's actual database structure:
 * - Real status values: Backlog, To do, Ready To Deploy, In Progress, Blocked/Waiting, Done, Not Going To Fix
 * - Real database ID: f83d9c21-15bf-4ff8-b8f6-56ebb5909584
 * - Maps statuses into 3 logical groups (To Do / In Progress / Complete)
 */

import { Client } from '@notionhq/client';
import express from 'express';

const PERSONAL_TOKEN = process.env.NOTION_PERSONAL_TOKEN;
const BRIDGIT_TOKEN = process.env.NOTION_BRIDGIT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!PERSONAL_TOKEN || !BRIDGIT_TOKEN) {
  console.error('ERROR: Both NOTION_PERSONAL_TOKEN and NOTION_BRIDGIT_TOKEN must be set');
  process.exit(1);
}

const personalNotion = new Client({ auth: PERSONAL_TOKEN });
const bridgitNotion = new Client({ auth: BRIDGIT_TOKEN });

const workspaces = {
  personal: {
    client: personalNotion,
    name: 'Personal Notion',
    description: 'Rob\'s personal Notion workspace - personal projects, life management, master Kanban'
  },
  bridgit: {
    client: bridgitNotion,
    name: 'Bridgit Notion',
    description: 'Bridgit company workspace - charity tech, clients, team coordination'
  }
};

// Map your actual status values to logical groups
const STATUS_GROUPS = {
  'To Do': ['Backlog', 'To do', 'To Do'],
  'In Progress': ['Ready To Deploy', 'In Progress', 'In progress', 'Blocked / Waiting', 'Blocked/Waiting'],
  'Complete': ['Done', 'Not Going To Fix']
};

function getStatusGroup(statusValue) {
  for (const [group, statuses] of Object.entries(STATUS_GROUPS)) {
    if (statuses.includes(statusValue)) {
      return group;
    }
  }
  return 'To Do'; // Default
}

function detectWorkspace(query, explicitWorkspace) {
  if (explicitWorkspace && workspaces[explicitWorkspace]) {
    return explicitWorkspace;
  }

  const lowerQuery = query.toLowerCase();

  const bridgitKeywords = [
    'bridgit', 'charity', 'charities', 'nonprofit', 'fundraising',
    'donor', 'justgiving', 'gofundme', 'mailchimp', 'salesforce',
    'raisers edge', 'sean', 'mat', 'integration hub',
    'hibridgit', 'engaging networks'
  ];

  const personalKeywords = [
    'personal', 'ottercorns', 'robgreen.io', 'esco', 'care',
    'family', 'fig', 'home', 'kanban', 'task list', 'tasks', 'standup'
  ];

  const bridgitScore = bridgitKeywords.filter(k => lowerQuery.includes(k)).length;
  const personalScore = personalKeywords.filter(k => lowerQuery.includes(k)).length;

  if (bridgitScore > personalScore) return 'bridgit';
  if (personalScore > bridgitScore) return 'personal';

  return 'personal';
}

const tools = [
  {
    name: 'search_notion',
    description: 'Search across Notion workspace(s). Auto-detects whether to search personal or Bridgit based on query context.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to search for' },
        workspace: {
          type: 'string',
          enum: ['personal', 'bridgit', 'both'],
          description: 'Which workspace to search. Defaults to auto-detect.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'fetch_notion_page',
    description: 'Fetch a specific Notion page by URL or ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The page ID or URL' },
        workspace: {
          type: 'string',
          enum: ['personal', 'bridgit'],
          description: 'Which workspace the page is in'
        }
      },
      required: ['id', 'workspace']
    }
  },
  {
    name: 'list_workspaces',
    description: 'List the available Notion workspaces and their descriptions',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_kanban_status',
    description: 'Get current status of personal Kanban board (Tasks)',
    inputSchema: {
      type: 'object',
      properties: {
        filter_by_org: {
          type: 'string',
          description: 'Optional: filter by organization (Bridgit, ESco, CARE, Ottercorns, robgreen.io, Personal, ARUK)'
        },
        show_completed: {
          type: 'boolean',
          description: 'Include completed tasks (default false)'
        }
      }
    }
  },
  {
    name: 'create_notion_task',
    description: 'Create a new task in personal Notion Kanban',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        organization: { type: 'string', description: 'Which org/project this is for' },
        status: {
          type: 'string',
          description: 'Initial status: Backlog, To do, Ready To Deploy, In Progress, Blocked / Waiting, Done, or Not Going To Fix'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'debug_database',
    description: 'Debug tool: show database structure and properties',
    inputSchema: { type: 'object', properties: {} }
  }
];

async function handleToolCall(name, args) {
  switch (name) {
    case 'search_notion': {
      const workspace = args.workspace || detectWorkspace(args.query);

      if (workspace === 'both') {
        const [personalResults, bridgitResults] = await Promise.all([
          personalNotion.search({ query: args.query }),
          bridgitNotion.search({ query: args.query })
        ]);

        return {
          personal: personalResults.results.slice(0, 5),
          bridgit: bridgitResults.results.slice(0, 5),
          workspace_used: 'both'
        };
      }

      const client = workspaces[workspace].client;
      const results = await client.search({ query: args.query });

      return {
        results: results.results.slice(0, 10),
        workspace_used: workspace,
        workspace_name: workspaces[workspace].name
      };
    }

    case 'fetch_notion_page': {
      const client = workspaces[args.workspace].client;

      try {
        const page = await client.pages.retrieve({ page_id: args.id });
        const blocks = await client.blocks.children.list({ block_id: args.id });
        return { type: 'page', page, content: blocks.results, workspace: args.workspace };
      } catch (pageError) {
        if (pageError.message?.includes('is a database')) {
          const database = await client.databases.retrieve({ database_id: args.id });
          const items = await client.databases.query({ database_id: args.id });
          return { type: 'database', database, items: items.results, workspace: args.workspace };
        }
        throw pageError;
      }
    }

    case 'list_workspaces': {
      return {
        workspaces: Object.entries(workspaces).map(([key, ws]) => ({
          id: key,
          name: ws.name,
          description: ws.description
        }))
      };
    }

    case 'debug_database': {
      const KANBAN_DB_ID = process.env.PERSONAL_KANBAN_DB_ID;

      if (!KANBAN_DB_ID) {
        return { error: 'Kanban database ID not configured' };
      }

      try {
        const database = await personalNotion.databases.retrieve({ database_id: KANBAN_DB_ID });

        return {
          success: true,
          database_id: KANBAN_DB_ID,
          title: database.title?.[0]?.plain_text || 'Unknown',
          properties: Object.keys(database.properties).map(name => ({
            name,
            type: database.properties[name].type,
            options: database.properties[name].select?.options?.map(o => o.name)
              || database.properties[name].status?.options?.map(o => o.name)
              || null
          }))
        };
      } catch (error) {
        return {
          error: true,
          message: error.message,
          code: error.code,
          database_id: KANBAN_DB_ID
        };
      }
    }

    case 'get_kanban_status': {
      const KANBAN_DB_ID = process.env.PERSONAL_KANBAN_DB_ID;

      if (!KANBAN_DB_ID) {
        return { error: 'Kanban database ID not configured' };
      }

      try {
        const database = await personalNotion.databases.retrieve({ database_id: KANBAN_DB_ID });
        const availableProperties = Object.keys(database.properties);

        const queryParams = { database_id: KANBAN_DB_ID };

        if (args.filter_by_org && availableProperties.includes('Organization')) {
          queryParams.filter = {
            property: 'Organization',
            select: { equals: args.filter_by_org }
          };
        }

        const response = await personalNotion.databases.query(queryParams);

        // Group by logical status
        const grouped = { 'To Do': [], 'In Progress': [], 'Complete': [] };

        response.results.forEach(page => {
          const rawStatus = page.properties.Status?.status?.name || 'Backlog';
          const statusGroup = getStatusGroup(rawStatus);

          // Skip completed tasks unless requested
          if (statusGroup === 'Complete' && !args.show_completed) return;

          const taskTitle = page.properties.Name?.title?.[0]?.plain_text
            || page.properties['Task name']?.title?.[0]?.plain_text
            || 'Untitled';

          if (grouped[statusGroup]) {
            grouped[statusGroup].push({
              id: page.id,
              title: taskTitle,
              status: rawStatus,
              organization: page.properties.Organization?.select?.name || 'Unassigned',
              url: page.url
            });
          }
        });

        return {
          kanban: grouped,
          total_tasks: response.results.length,
          showing_completed: args.show_completed || false
        };
      } catch (error) {
        return {
          error: true,
          message: error.message,
          code: error.code
        };
      }
    }

    case 'create_notion_task': {
      const KANBAN_DB_ID = process.env.PERSONAL_KANBAN_DB_ID;

      if (!KANBAN_DB_ID) {
        return { error: 'Kanban database ID not configured' };
      }

      try {
        const properties = {
          Name: { title: [{ text: { content: args.title } }] }
        };

        if (args.status) {
          properties.Status = { status: { name: args.status } };
        }

        if (args.organization) {
          properties.Organization = { select: { name: args.organization } };
        }

        const newPage = await personalNotion.pages.create({
          parent: { database_id: KANBAN_DB_ID },
          properties
        });

        return {
          success: true,
          task: { id: newPage.id, title: args.title, url: newPage.url }
        };
      } catch (error) {
        return {
          error: true,
          message: error.message,
          code: error.code
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    version: '3.0',
    workspaces: Object.keys(workspaces),
    tools: tools.map(t => t.name)
  });
});

app.post('/mcp', async (req, res) => {
  try {
    const { method, params } = req.body;

    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {},
          serverInfo: { name: 'multi-workspace-notion-mcp', version: '3.0.0' }
        };
        break;

      case 'tools/list':
        result = { tools };
        break;

      case 'tools/call':
        result = await handleToolCall(params.name, params.arguments);
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    res.json({ jsonrpc: '2.0', id: req.body.id, result });
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: { code: -32603, message: error.message }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Multi-Workspace Notion MCP Server v3.0 running on port ${PORT}`);
  console.log(`Connected workspaces: ${Object.keys(workspaces).join(', ')}`);
  console.log(`Tools available: ${tools.map(t => t.name).join(', ')}`);
});
