import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isRepo, initRepo, gitAvailable } from '../src/lib/git.js';

test('initRepo inits, sets origin, and makes a first commit', { skip: !gitAvailable() && 'git not installed' }, () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-git-'));
  fs.writeFileSync(path.join(d, 'Brain.md'), '# Brain\n');

  assert.equal(isRepo(d), false);
  const r = initRepo(d, { remote: 'https://github.com/x/y.git', name: 'Test', email: 't@e.st' });

  assert.equal(r.initialized, true);
  assert.equal(r.remoteSet, true);
  assert.equal(r.committed, true);
  assert.ok(fs.existsSync(path.join(d, '.git')));
  assert.equal(isRepo(d), true);
});

test('initRepo is idempotent and never clobbers an existing origin', { skip: !gitAvailable() && 'git not installed' }, () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-git-'));
  fs.writeFileSync(path.join(d, 'a.md'), 'x\n');
  initRepo(d, { remote: 'https://github.com/first/repo.git', name: 'T', email: 't@e.st' });
  const r2 = initRepo(d, { remote: 'https://github.com/second/repo.git', name: 'T', email: 't@e.st' });
  assert.equal(r2.remoteSet, false); // origin already existed
});
