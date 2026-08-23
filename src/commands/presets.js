import * as log from '../lib/log.js';
import { listPresets } from '../lib/presets.js';

export async function run() {
  log.heading('Available presets');
  for (const p of listPresets()) {
    const tag = p.default ? log.dim(' (default)') : '';
    log.say('\n  ' + log.bold(p.id) + tag);
    log.say('    ' + p.label + ' — ' + log.dim(p.description));
    log.say('    ' + log.dim('domains: ' + p.domains.map((d) => d.dir).join(' · ')));
  }
  log.say('\nUse one with:  npx better-brain init --preset <id>\n');
}
