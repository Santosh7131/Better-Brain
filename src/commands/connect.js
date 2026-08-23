import fs from 'node:fs';
import path from 'node:path';
import * as log from '../lib/log.js';
import { ask } from '../lib/prompt.js';
import { connectProject } from '../lib/claude.js';
import { defaultVaultDir, globalClaudeMd } from '../lib/paths.js';

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

  const r = connectProject(projectDir, vault);
  if (r.created) log.ok(`Created ${r.file} and connected it to the brain`);
  else if (r.changed) log.ok(`Connected ${r.file} to the brain`);
  else log.ok(`Already connected (${r.file})`);

  log.info(`Vault: ${vault}`);
  log.say('\nClaude Code sessions in this project will now read and write the shared brain.');
}
