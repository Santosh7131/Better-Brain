import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// <root>/src/lib/paths.js -> <root>
export const PKG_ROOT = path.resolve(__dirname, '..', '..');
export const TEMPLATES_DIR = path.join(PKG_ROOT, 'src', 'templates');
export const BASE_TEMPLATE_DIR = path.join(TEMPLATES_DIR, 'base');

export function home() {
  return os.homedir();
}
export function claudeDir() {
  return path.join(os.homedir(), '.claude');
}
export function globalClaudeMd() {
  return path.join(claudeDir(), 'CLAUDE.md');
}
export function defaultVaultDir() {
  return path.join(os.homedir(), 'Documents', 'Second Brain');
}
