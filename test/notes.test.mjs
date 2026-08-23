import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { listNotes, readNote, searchNotes, writeNote, parseFrontmatter } from '../src/lib/notes.js';

function tmpVault() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-notes-'));
  fs.mkdirSync(path.join(d, '10-projects'), { recursive: true });
  fs.writeFileSync(path.join(d, 'Brain.md'), '---\ntitle: Brain\ntype: index\n---\n# Brain\nhello world\n');
  fs.writeFileSync(
    path.join(d, '10-projects', 'alpha.md'),
    '---\ntitle: Alpha\ntype: project\n---\n# Alpha\nsecret sauce here\n'
  );
  return d;
}

test('parseFrontmatter extracts keys and body', () => {
  const { frontmatter, body } = parseFrontmatter('---\ntitle: X\ntype: project\n---\nbody text\n');
  assert.equal(frontmatter.title, 'X');
  assert.equal(frontmatter.type, 'project');
  assert.match(body, /body text/);
});

test('listNotes finds all markdown with titles and types', () => {
  const d = tmpVault();
  const notes = listNotes(d);
  assert.equal(notes.length, 2);
  const alpha = notes.find((n) => n.path === '10-projects/alpha.md');
  assert.equal(alpha.title, 'Alpha');
  assert.equal(alpha.type, 'project');
});

test('readNote returns frontmatter and body', () => {
  const d = tmpVault();
  const n = readNote(d, '10-projects/alpha.md');
  assert.equal(n.frontmatter.title, 'Alpha');
  assert.match(n.body, /secret sauce/);
});

test('searchNotes matches content across notes', () => {
  const d = tmpVault();
  const r = searchNotes(d, 'secret sauce');
  assert.equal(r.length, 1);
  assert.equal(r[0].path, '10-projects/alpha.md');
});

test('writeNote creates a note and blocks path traversal', () => {
  const d = tmpVault();
  const res = writeNote(d, '20-areas/new.md', '---\ntitle: New\n---\nx\n');
  assert.equal(res.existed, false);
  assert.ok(fs.existsSync(path.join(d, '20-areas', 'new.md')));
  assert.throws(() => writeNote(d, '../escape.md', 'nope'));
});
