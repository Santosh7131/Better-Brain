import fs from 'node:fs';
import path from 'node:path';
import * as log from '../lib/log.js';
import { ask, confirm } from '../lib/prompt.js';
import { defaultVaultDir } from '../lib/paths.js';
import { scaffoldPreset } from '../lib/vault.js';
import { getPreset, presetIds } from '../lib/presets.js';
import { ensureGlobalBlock } from '../lib/claude.js';
import * as obsidian from '../lib/obsidian.js';

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export async function run(opts = {}) {
  log.heading('better-brain — give your AI a persistent second brain');
  log.say('Scaffolds an Obsidian vault, teaches your AI the memory protocol, and wires the two');
  log.say('together. It never overwrites files you already have.');

  // 1. Preset.
  let preset;
  if (opts.preset) {
    preset = getPreset(opts.preset);
    if (!preset) {
      log.err(`Unknown preset "${opts.preset}". Available: ${presetIds().join(', ')}`);
      process.exitCode = 1;
      return;
    }
  } else if (opts.yes) {
    preset = getPreset();
  } else {
    const id = await ask(`\nWhich preset? (${presetIds().join(' / ')})`, 'generic');
    preset = getPreset(id);
    if (!preset) {
      log.warn(`No preset "${id}" — using the default (generic).`);
      preset = getPreset();
    }
  }
  log.step(`Preset: ${preset.label}`);

  // 2. Where the vault lives.
  const vaultDir = path.resolve(opts.vault || (await ask('Where should the vault live?', defaultVaultDir())));
  const existed = fs.existsSync(vaultDir);
  log.step(existed ? `Using existing folder: ${vaultDir}` : `Creating vault at: ${vaultDir}`);

  // 3. Who it's for (seeds about-me only; no facts are invented).
  const name = opts.name || (await ask('Your name (for about-me)?', 'me'));
  const tokens = { NAME: name, DATE: today(), VAULT_PATH: vaultDir };

  // 4. Scaffold the preset, non-destructively.
  const { created, skipped } = scaffoldPreset(vaultDir, preset, tokens);
  log.ok(
    `${created.length} file(s) written` + (skipped.length ? `, ${skipped.length} left untouched (already existed)` : '')
  );

  // 5. Wire the machine-wide contract into ~/.claude/CLAUDE.md.
  const g = ensureGlobalBlock(vaultDir, tokens);
  log.ok(g.changed ? `Wired the brain contract into ${g.file}` : `Global contract already current (${g.file})`);

  // 6. Obsidian: detect, then auto-install with a download fallback.
  const det = obsidian.detect();
  if (det.installed) {
    log.ok(`Obsidian detected (${det.path})`);
  } else {
    const wants = opts.yes ? true : await confirm('\nObsidian is not installed. Install it now?', true);
    if (wants) {
      log.step('Installing Obsidian (a package-manager window may appear)...');
      const r = obsidian.install();
      if (r.ok) {
        log.ok(`Obsidian installed via ${r.method}`);
      } else {
        log.warn(`Could not auto-install (${r.reason}). Download it here:`);
        log.info(obsidian.DOWNLOAD_URL);
      }
    } else {
      log.info(`Get Obsidian later at ${obsidian.DOWNLOAD_URL}`);
    }
  }

  // 7. Offer to open the vault.
  if (!opts.yes) {
    const openIt = await confirm('Open the vault in Obsidian now?', false);
    if (openIt) obsidian.openVault(vaultDir);
  }

  // 8. Next steps.
  log.heading('Done — your brain is ready.');
  log.say(`Preset: ${preset.label} — domains: ${preset.domains.map((d) => d.dir).join(', ')}`);
  log.say('Next:');
  log.say(`  1. Fill in ${path.join(vaultDir, '00-identity', 'about-me.md')} and how-to-work-with-me.md`);
  log.say('  2. In any project you want connected, run:  better-brain connect');
  log.say('  3. Ask your AI (in a connected project) to "read the brain" to confirm the wiring.');
  log.say('');
}
