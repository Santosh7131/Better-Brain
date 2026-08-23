import fs from 'node:fs';
import path from 'node:path';
import { PKG_ROOT } from './paths.js';

const CATALOG = path.join(PKG_ROOT, 'src', 'presets.json');

let _cache = null;
function catalog() {
  if (!_cache) _cache = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  return _cache;
}

// The folders every preset shares (00-identity, templates, 99-inbox).
export function anchors() {
  return catalog().anchors;
}

export function listPresets() {
  return catalog().presets;
}

export function presetIds() {
  return catalog().presets.map((p) => p.id);
}

// Resolve a preset by id; with no id, return the default (or the first).
export function getPreset(id) {
  const { presets } = catalog();
  if (!id) return presets.find((p) => p.default) || presets[0];
  return presets.find((p) => p.id === id) || null;
}
