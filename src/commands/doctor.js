import fs from 'node:fs';
import path from 'node:path';
import * as log from '../lib/log.js';
import { globalClaudeMd, defaultVaultDir } from '../lib/paths.js';
import { START } from '../lib/claude.js';
import * as obsidian from '../lib/obsidian.js';

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

export async function run() {
  log.heading('better-brain doctor');

  // Machine-wide contract.
  const g = globalClaudeMd();
  const wired = fs.existsSync(g) && fs.readFileSync(g, 'utf8').includes(START);
  if (wired) log.ok(`Global contract present (${g})`);
  else log.warn('Global contract not found. Run: npx better-brain init');

  // Vault.
  const vault = discoverVault() || defaultVaultDir();
  if (fs.existsSync(path.join(vault, 'Brain.md'))) log.ok(`Vault present (${vault})`);
  else log.warn(`No vault at ${vault}. Run: npx better-brain init`);

  // Obsidian.
  const det = obsidian.detect();
  if (det.installed) log.ok(`Obsidian installed (${det.path})`);
  else log.warn(`Obsidian not detected. Get it at ${obsidian.DOWNLOAD_URL}`);

  log.say('');
}
