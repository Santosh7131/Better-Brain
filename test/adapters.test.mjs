import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { connectAdapter, ADAPTERS, adapterIds } from '../src/lib/adapters.js';

const VAULT = 'C:/Users/me/Second Brain';
const tmpProj = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bb-adapt-'));

test('every adapter writes its rule file with the fenced block and VAULT line', () => {
  assert.deepEqual(adapterIds(), ['claude-code', 'codex', 'cursor', 'windsurf', 'cline']);
  for (const a of ADAPTERS) {
    const proj = tmpProj();
    const r = connectAdapter(proj, a.id, VAULT);
    assert.equal(r.created, true, a.id + ' created');
    const target = path.join(proj, ...a.file.split('/'));
    assert.ok(fs.existsSync(target), a.id + ' file exists');
    const txt = fs.readFileSync(target, 'utf8');
    assert.match(txt, /better-brain:start/, a.id + ' has start marker');
    assert.ok(txt.includes('VAULT: `' + VAULT + '`'), a.id + ' has VAULT line');
  }
});

test('re-connecting the same agent is idempotent (no duplicate block)', () => {
  const proj = tmpProj();
  connectAdapter(proj, 'codex', VAULT);
  const r2 = connectAdapter(proj, 'codex', VAULT);
  assert.equal(r2.changed, false);
  const txt = fs.readFileSync(path.join(proj, 'AGENTS.md'), 'utf8');
  assert.equal(txt.split('better-brain:start').length - 1, 1);
});

test('an unknown adapter id throws', () => {
  assert.throws(() => connectAdapter(tmpProj(), 'nope', VAULT));
});
