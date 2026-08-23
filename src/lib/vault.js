import fs from 'node:fs';
import path from 'node:path';
import { BASE_TEMPLATE_DIR } from './paths.js';
import { fillTokens } from './claude.js';
import { renderBrain, renderRoadmap, renderNoteTemplate } from './brain.js';

const SKIP_NAMES = new Set(['.gitkeep']);
const TEXT_EXT = new Set(['.md', '.txt']);

// Scaffold a vault for the given preset. Non-destructive: only writes files that
// don't already exist, so re-running (or pointing at an existing vault) is safe.
export function scaffoldPreset(vaultDir, preset, tokens = {}) {
  const created = [];
  const skipped = [];

  const writeIfAbsent = (rel, content) => {
    const to = path.join(vaultDir, rel);
    if (fs.existsSync(to)) {
      skipped.push(to);
      return;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, content, 'utf8');
    created.push(to);
  };

  // 1. Shared base — identity notes, decision-log, inbox (token-filled, non-destructive).
  copyTree(BASE_TEMPLATE_DIR, vaultDir, tokens, created, skipped);

  // 2. Generated root notes.
  writeIfAbsent('Brain.md', renderBrain(preset, tokens));
  writeIfAbsent('roadmap.md', renderRoadmap(tokens));

  // 3. Preset domain folders (created empty; described in Brain.md).
  for (const d of preset.domains) {
    fs.mkdirSync(path.join(vaultDir, d.dir), { recursive: true });
  }

  // 4. One starter template per note type.
  for (const type of preset.noteTypes) {
    writeIfAbsent(path.join('templates', type + '.md'), renderNoteTemplate(type, tokens));
  }

  return { created, skipped };
}

function copyTree(src, dest, tokens, created, skipped) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to, tokens, created, skipped);
      continue;
    }
    if (SKIP_NAMES.has(entry.name)) continue;
    if (fs.existsSync(to)) {
      skipped.push(to);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (TEXT_EXT.has(ext)) {
      fs.writeFileSync(to, fillTokens(fs.readFileSync(from, 'utf8'), tokens), 'utf8');
    } else {
      fs.copyFileSync(from, to);
    }
    created.push(to);
  }
}
