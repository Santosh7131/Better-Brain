import fs from 'node:fs';
import path from 'node:path';
import { globalClaudeMd, defaultVaultDir } from '../lib/paths.js';

// Recover the vault path from the machine-wide contract, same as connect/doctor.
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
  const vault = path.resolve(
    opts.vault || process.env.BETTER_BRAIN_VAULT || discoverVault() || defaultVaultDir()
  );
  // Log to stderr only — stdout is the MCP JSON-RPC channel and must stay clean.
  process.stderr.write(`better-brain MCP server — serving vault: ${vault}\n`);
  // Lazy-load the SDK-backed server so init/connect/doctor/presets never need the dependency.
  const { startServer } = await import('../mcp/server.js');
  await startServer(vault);
}
