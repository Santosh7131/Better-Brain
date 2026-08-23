import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPresets, getPreset } from '../src/lib/presets.js';
import { ADAPTERS, connectAdapter } from '../src/lib/adapters.js';
import { scaffoldPreset } from '../src/lib/vault.js';
import { ensureGlobalBlock } from '../src/lib/claude.js';
import * as obsidian from '../src/lib/obsidian.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 920,
    height: 700,
    backgroundColor: '#140A2E',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

// --- IPC: the renderer talks to the engine only through these channels ---
ipcMain.handle('presets', () =>
  listPresets().map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    domains: p.domains.map((d) => d.dir),
    default: !!p.default,
  }))
);

ipcMain.handle('adapters', () => ADAPTERS.map((a) => ({ id: a.id, label: a.label, file: a.file })));

ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('obsidian-detect', () => obsidian.detect());

// Create the vault for a preset and wire the machine-wide contract.
ipcMain.handle('install', (_e, { vault, name, presetId }) => {
  const preset = getPreset(presetId) || getPreset();
  const tokens = { NAME: name || 'me', DATE: today(), VAULT_PATH: vault };
  const { created } = scaffoldPreset(vault, preset, tokens);
  const g = ensureGlobalBlock(vault, tokens);
  return { preset: preset.label, filesWritten: created.length, contract: g.file };
});

// Wire a chosen project folder to the vault for the selected agents.
ipcMain.handle('connect-project', (_e, { projectDir, vault, agents }) => {
  const results = (agents || []).map((id) => {
    const r = connectAdapter(projectDir, id, vault);
    return { label: r.label, file: r.file, created: r.created, changed: r.changed };
  });
  return { projectDir, results };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
