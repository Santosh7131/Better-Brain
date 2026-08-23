import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listNotes, readNote, searchNotes, writeNote } from '../lib/notes.js';

// The tools this server exposes over MCP. Any MCP-aware client (Claude Desktop,
// Cursor, OpenCode, ChatGPT desktop, …) can call these to use the brain vault.
const TOOLS = [
  {
    name: 'list_notes',
    description: 'List every note in the brain vault (path, title, type).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'read_note',
    description: 'Read one note by its vault-relative path (e.g. 10-projects/alpha.md).',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Vault-relative path to the note.' } },
      required: ['path'],
    },
  },
  {
    name: 'search_notes',
    description: 'Search notes (title, path, body) for a query; returns matches with snippets.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Words to search for (AND-matched).' } },
      required: ['query'],
    },
  },
  {
    name: 'write_note',
    description: 'Create or overwrite a note at a vault-relative path with markdown content.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative path to write.' },
        content: { type: 'string', description: 'Full markdown content for the note.' },
      },
      required: ['path', 'content'],
    },
  },
];

// Start the Better-Brain MCP server over stdio, serving the vault at `vaultDir`.
export async function startServer(vaultDir) {
  const server = new Server(
    { name: 'better-brain', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    try {
      let data;
      if (name === 'list_notes') data = listNotes(vaultDir);
      else if (name === 'read_note') data = readNote(vaultDir, args.path);
      else if (name === 'search_notes') data = searchNotes(vaultDir, args.query);
      else if (name === 'write_note') data = writeNote(vaultDir, args.path, args.content);
      else throw new Error('unknown tool: ' + name);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: 'Error: ' + ((e && e.message) || String(e)) }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
