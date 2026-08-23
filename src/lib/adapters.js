import path from 'node:path';
import { connectFile } from './claude.js';

// Each adapter writes the same connect block into the rule file its agent reads.
// AGENTS.md is a shared standard (Codex, OpenCode, and others read it), so the
// `codex` adapter also reaches those. Anything MCP-aware is covered separately by
// `better-brain mcp`, so it needs no adapter here.
export const ADAPTERS = [
  { id: 'claude-code', label: 'Claude Code', file: 'CLAUDE.md' },
  { id: 'codex', label: 'Codex / AGENTS.md', file: 'AGENTS.md' },
  { id: 'cursor', label: 'Cursor', file: '.cursor/rules/better-brain.md' },
  { id: 'windsurf', label: 'Windsurf', file: '.windsurfrules' },
  { id: 'cline', label: 'Cline', file: '.clinerules' },
];

export function adapterIds() {
  return ADAPTERS.map((a) => a.id);
}

export function getAdapter(id) {
  return ADAPTERS.find((a) => a.id === id) || null;
}

// Wire one agent: write the connect block into its rule file (idempotent).
export function connectAdapter(projectDir, id, vaultPath, tokens = {}) {
  const a = getAdapter(id);
  if (!a) throw new Error('unknown adapter: ' + id);
  const target = path.join(projectDir, ...a.file.split('/'));
  const r = connectFile(target, 'project-connect-block.md', vaultPath, tokens);
  return { adapter: a.id, label: a.label, ...r };
}
