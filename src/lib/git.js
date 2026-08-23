import { execFileSync } from 'node:child_process';

function git(dir, args) {
  return execFileSync('git', args, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

export function gitAvailable() {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function isRepo(dir) {
  try {
    git(dir, ['rev-parse', '--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

// Turn a vault folder into a git repo: init (if needed), point origin at `remote`
// (only if no origin exists — never clobber one), and make an initial commit.
// Identity comes from the user's global git config unless name/email are passed.
export function initRepo(dir, { remote, commit = true, name, email } = {}) {
  const result = { initialized: false, remoteSet: false, committed: false };
  if (!isRepo(dir)) {
    git(dir, ['init']);
    result.initialized = true;
  }
  try {
    git(dir, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  } catch {
    /* branch already set / has commits */
  }
  if (name) git(dir, ['config', 'user.name', name]);
  if (email) git(dir, ['config', 'user.email', email]);
  if (remote) {
    try {
      git(dir, ['remote', 'get-url', 'origin']); // exists → leave it
    } catch {
      git(dir, ['remote', 'add', 'origin', remote]);
      result.remoteSet = true;
    }
  }
  if (commit) {
    git(dir, ['add', '-A']);
    try {
      git(dir, ['commit', '-m', 'Initial brain (via Better-Brain)']);
      result.committed = true;
    } catch {
      /* nothing staged to commit */
    }
  }
  return result;
}
