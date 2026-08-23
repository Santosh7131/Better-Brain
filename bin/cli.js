#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as log from '../src/lib/log.js';
import { setAutoYes } from '../src/lib/prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') opts.yes = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--version' || a === '-v') opts.version = true;
    else if (a === '--vault') opts.vault = argv[++i];
    else if (a === '--name') opts.name = argv[++i];
    else if (a === '--preset') opts.preset = argv[++i];
    else if (a.startsWith('--')) opts[a.slice(2)] = true;
    else opts._.push(a);
  }
  return opts;
}

const HELP = `
better-brain — a persistent, shared second brain for Claude Code

Usage:
  npx better-brain <command> [options]

Commands:
  init                 Scaffold the vault, wire Claude Code, install Obsidian
  connect [path]       Connect a project (default: current dir) to the brain
  doctor               Check that the brain, wiring, and Obsidian are in place
  presets              List the available vault presets

Options:
  --vault <path>       Vault location (default: ~/Documents/Second Brain)
  --name <name>        Your name, used to seed about-me
  --preset <id>        Persona preset for the vault (see: better-brain presets)
  -y, --yes            Accept defaults, no prompts
  -h, --help           Show this help
  -v, --version        Show version

Docs: https://github.com/Santosh7131/Better-Brain
`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.yes) setAutoYes(true);

  if (opts.version) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(pkg.version);
    return;
  }

  const cmd = opts._.shift();
  if (!cmd || opts.help) {
    console.log(HELP);
    return;
  }

  switch (cmd) {
    case 'init':
      return (await import('../src/commands/init.js')).run(opts);
    case 'connect':
      return (await import('../src/commands/connect.js')).run(opts);
    case 'doctor':
      return (await import('../src/commands/doctor.js')).run(opts);
    case 'presets':
      return (await import('../src/commands/presets.js')).run(opts);
    default:
      log.err(`Unknown command: ${cmd}`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((e) => {
  log.err((e && e.stack) || String(e));
  process.exitCode = 1;
});
