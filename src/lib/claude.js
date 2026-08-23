import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_DIR, globalClaudeMd, claudeDir } from './paths.js';

// Injected blocks are fenced by these markers so re-running updates in place
// instead of duplicating, and so the block can be found or removed later.
export const START = '<!-- better-brain:start -->';
export const END = '<!-- better-brain:end -->';

export function fillTokens(str, tokens = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in tokens ? tokens[key] : m));
}

export function readTemplate(relPath) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, relPath), 'utf8');
}

// Insert or replace the fenced block inside `existing`, returning the new text.
function upsertBlock(existing, block) {
  const s = existing.indexOf(START);
  const e = existing.indexOf(END);
  if (s !== -1 && e !== -1 && e > s) {
    return existing.slice(0, s) + block + existing.slice(e + END.length);
  }
  if (existing.length === 0) return block + '\n';
  const gap = existing.endsWith('\n') ? '\n' : '\n\n';
  return existing + gap + block + '\n';
}

function applyBlock(file, templateName, tokens) {
  const raw = readTemplate(templateName);
  const filled = fillTokens(raw, tokens).trim();
  const block = `${START}\n${filled}\n${END}`;
  let existing = '';
  if (fs.existsSync(file)) existing = fs.readFileSync(file, 'utf8');
  const updated = upsertBlock(existing, block);
  const changed = updated !== existing;
  if (changed) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, updated, 'utf8');
  }
  return { file, changed, created: existing === '' };
}

// Write the machine-wide contract into ~/.claude/CLAUDE.md.
export function ensureGlobalBlock(vaultPath, tokens = {}) {
  fs.mkdirSync(claudeDir(), { recursive: true });
  return applyBlock(globalClaudeMd(), 'claude-global-block.md', { VAULT_PATH: vaultPath, ...tokens });
}

// Opt a single project in by writing the block into <project>/CLAUDE.md.
export function connectProject(projectDir, vaultPath, tokens = {}) {
  return applyBlock(path.join(projectDir, 'CLAUDE.md'), 'project-connect-block.md', {
    VAULT_PATH: vaultPath,
    ...tokens,
  });
}
