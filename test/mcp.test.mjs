import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '..', 'bin', 'cli.js');

function tmpVault() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-mcp-'));
  fs.writeFileSync(path.join(d, 'Brain.md'), '---\ntitle: Brain\ntype: index\n---\n# Brain\nhello\n');
  fs.mkdirSync(path.join(d, '10-projects'));
  fs.writeFileSync(path.join(d, '10-projects', 'alpha.md'), '---\ntitle: Alpha\ntype: project\n---\n# Alpha\nsecret sauce\n');
  return d;
}

test('MCP server exposes the four tools and serves the vault', async () => {
  const vault = tmpVault();
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [CLI, 'mcp', '--vault', vault],
  });
  const client = new Client({ name: 'better-brain-test', version: '0' }, { capabilities: {} });
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((t) => t.name).sort(),
      ['list_notes', 'read_note', 'search_notes', 'write_note']
    );

    const listed = await client.callTool({ name: 'list_notes', arguments: {} });
    assert.match(listed.content[0].text, /10-projects\/alpha\.md/);

    const read = await client.callTool({ name: 'read_note', arguments: { path: '10-projects/alpha.md' } });
    assert.match(read.content[0].text, /secret sauce/);

    const searched = await client.callTool({ name: 'search_notes', arguments: { query: 'secret sauce' } });
    assert.match(searched.content[0].text, /alpha\.md/);

    const written = await client.callTool({
      name: 'write_note',
      arguments: { path: '20-areas/n.md', content: '---\ntitle: N\n---\nx\n' },
    });
    assert.match(written.content[0].text, /"existed": false/);
    assert.ok(fs.existsSync(path.join(vault, '20-areas', 'n.md')));
  } finally {
    await client.close();
  }
});
