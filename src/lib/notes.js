import fs from 'node:fs';
import path from 'node:path';

// Minimal frontmatter reader: pulls the leading `--- ... ---` block into a flat
// key -> value map (values kept as trimmed strings). Enough for note metadata;
// not a full YAML parser.
export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { frontmatter: {}, body: raw };
  const frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) frontmatter[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body: raw.slice(m[0].length) };
}

// List every markdown note in the vault with its title and type.
export function listNotes(vaultDir) {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
        continue;
      }
      if (!e.name.toLowerCase().endsWith('.md')) continue;
      const rel = path.relative(vaultDir, full).split(path.sep).join('/');
      const { frontmatter } = parseFrontmatter(fs.readFileSync(full, 'utf8'));
      out.push({
        path: rel,
        title: frontmatter.title || e.name.replace(/\.md$/i, ''),
        type: frontmatter.type || null,
        frontmatter,
      });
    }
  })(vaultDir);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function readNote(vaultDir, relPath) {
  const raw = fs.readFileSync(safeJoin(vaultDir, relPath), 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);
  return { path: relPath, frontmatter, body, raw };
}

// Case-insensitive AND-search across title, path, and body. Returns a snippet.
export function searchNotes(vaultDir, query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const results = [];
  for (const note of listNotes(vaultDir)) {
    const raw = fs.readFileSync(path.join(vaultDir, note.path), 'utf8').toLowerCase();
    const hay = note.title.toLowerCase() + ' ' + note.path.toLowerCase() + ' ' + raw;
    if (!terms.every((t) => hay.includes(t))) continue;
    const idx = raw.indexOf(terms[0]);
    const snippet = idx >= 0 ? raw.slice(Math.max(0, idx - 40), idx + 80).replace(/\s+/g, ' ').trim() : '';
    results.push({ path: note.path, title: note.title, type: note.type, snippet });
  }
  return results;
}

export function writeNote(vaultDir, relPath, content) {
  const full = safeJoin(vaultDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const existed = fs.existsSync(full);
  fs.writeFileSync(full, content, 'utf8');
  return { path: relPath, existed, bytes: Buffer.byteLength(content, 'utf8') };
}

// Resolve a vault-relative path, refusing anything that escapes the vault
// (path-traversal guard — important since these back an MCP write tool).
function safeJoin(vaultDir, relPath) {
  const root = path.resolve(vaultDir);
  const full = path.resolve(root, relPath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('path escapes the vault: ' + relPath);
  }
  return full;
}
