import fs from 'node:fs';
import path from 'node:path';
import * as log from '../lib/log.js';
import { ask } from '../lib/prompt.js';
import { defaultVaultDir, globalClaudeMd } from '../lib/paths.js';
import { adapterIds, getAdapter, connectAdapter } from '../lib/adapters.js';

// Recover the vault path from the machine-wide contract written by `init`.
function discoverVault() {
  try {
    const raw = fs.readFileSync(globalClaudeMd(), 'utf8');
    const m = raw.match(/VAULT:\s*`?([^`\n]+)`?/);
    if (m) return m[1].trim();
  } catch {
    /* not wired yet */
  }
  return null;
}

export async function run(opts = {}) {
  const projectDir = path.resolve(opts._[0] || process.cwd());
  if (!fs.existsSync(projectDir)) {
    log.err(`No such directory: ${projectDir}`);
    process.exitCode = 1;
    return;
  }

  let vault = opts.vault || discoverVault();
  if (!vault) vault = await ask('Path to your brain vault?', defaultVaultDir());
  vault = path.resolve(vault);

  // Which agents to wire.
  let ids;
  if (opts.all) ids = adapterIds();
  else if (opts.agents) ids = String(opts.agents).split(',').map((s) => s.trim()).filter(Boolean);
  else if (opts.yes) ids = ['claude-code'];
  else {
    const ans = await ask(`Which agents to wire? (comma list of ${adapterIds().join(', ')}, or "all")`, 'claude-code');
    ids = ans.trim().toLowerCase() === 'all' ? adapterIds() : ans.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const unknown = ids.filter((id) => !getAdapter(id));
  if (unknown.length) {
    log.err(`Unknown agent(s): ${unknown.join(', ')}. Valid: ${adapterIds().join(', ')}`);
    process.exitCode = 1;
    return;
  }

  for (const id of ids) {
    const r = connectAdapter(projectDir, id, vault);
    const verb = r.created ? 'created' : r.changed ? 'updated' : 'already connected';
    log.ok(`${r.label}: ${verb} (${path.relative(projectDir, r.file) || r.file})`);
  }

  log.info(`Vault: ${vault}`);
  log.say(`\nConnected agents (${ids.join(', ')}) in this project will now read and write the shared brain.`);
}
