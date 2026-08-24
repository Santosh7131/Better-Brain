import { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPresets, getPreset } from '../src/lib/presets.js';
import { ADAPTERS, connectAdapter } from '../src/lib/adapters.js';
import { scaffoldPreset } from '../src/lib/vault.js';
import { ensureGlobalBlock } from '../src/lib/claude.js';
import * as obsidian from '../src/lib/obsidian.js';
import { initRepo, gitAvailable } from '../src/lib/git.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function createWindow() {
  Menu.setApplicationMenu(null); // installers have no menu bar
  const win = new BrowserWindow({
    width: 620,
    height: 512,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    title: 'Better-Brain Setup',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#17181b' : '#ffffff',
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

// Create the vault for a preset, wire the machine-wide contract, and write the
// chosen agents' rule files into the vault folder.
ipcMain.handle('install', (_e, { vault, name, presetId, agents, github, obsidian: setupObsidian }) => {
  const preset = getPreset(presetId) || getPreset();
  const tokens = { NAME: name || 'me', DATE: today(), VAULT_PATH: vault };
  const { created } = scaffoldPreset(vault, preset, tokens);
  const g = ensureGlobalBlock(vault, tokens);
  const wired = (agents || []).map((id) => connectAdapter(vault, id, vault, tokens).label);
  const summary = { preset: preset.label, filesWritten: created.length, contract: g.file, wired };

  if (github && github.url && gitAvailable()) {
    try {
      initRepo(vault, { remote: github.url, commit: true });
      summary.github = github.url;
    } catch (e) {
      summary.githubError = String((e && e.message) || e);
    }
  }
  if (setupObsidian) {
    const det = obsidian.detect();
    summary.obsidian = det.installed ? 'detected' : obsidian.install().ok ? 'installed' : 'download needed';
  }
  return summary;
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
