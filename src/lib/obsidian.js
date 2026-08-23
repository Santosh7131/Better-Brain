import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const DOWNLOAD_URL = 'https://obsidian.md/download';

function tryCmd(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return null;
  }
}

function has(cmd) {
  const probe = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
  return !!tryCmd(probe);
}

// Best-effort detection of an existing Obsidian install.
export function detect() {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      const local = process.env.LOCALAPPDATA || '';
      const candidates = [
        path.join(local, 'Obsidian', 'Obsidian.exe'),
        path.join(local, 'Programs', 'obsidian', 'Obsidian.exe'),
      ];
      for (const c of candidates) if (c && fs.existsSync(c)) return { installed: true, path: c };
    } else if (platform === 'darwin') {
      const app = '/Applications/Obsidian.app';
      if (fs.existsSync(app)) return { installed: true, path: app };
    } else {
      const which = tryCmd('command -v obsidian');
      if (which) return { installed: true, path: which.trim() };
      if (tryCmd('flatpak info md.obsidian.Obsidian')) {
        return { installed: true, path: 'flatpak:md.obsidian.Obsidian' };
      }
    }
  } catch {
    /* fall through to not-installed */
  }
  return { installed: false };
}

// Auto-install via the platform's package manager. Returns { ok, method } on
// success or { ok:false, reason } so the caller can fall back to the download link.
export function install() {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      if (has('winget')) {
        execSync(
          'winget install --id Obsidian.Obsidian -e --accept-package-agreements --accept-source-agreements',
          { stdio: 'inherit' }
        );
        return { ok: true, method: 'winget' };
      }
    } else if (platform === 'darwin') {
      if (has('brew')) {
        execSync('brew install --cask obsidian', { stdio: 'inherit' });
        return { ok: true, method: 'brew' };
      }
    } else {
      if (has('flatpak')) {
        execSync('flatpak install -y flathub md.obsidian.Obsidian', { stdio: 'inherit' });
        return { ok: true, method: 'flatpak' };
      }
      if (has('snap')) {
        execSync('sudo snap install obsidian --classic', { stdio: 'inherit' });
        return { ok: true, method: 'snap' };
      }
    }
  } catch (e) {
    return { ok: false, reason: 'package-manager-failed', error: String((e && e.message) || e) };
  }
  return { ok: false, reason: 'no-package-manager' };
}

// Best-effort "open this folder as a vault" via the obsidian:// URI handler.
export function openVault(vaultDir) {
  const uri = 'obsidian://open?path=' + encodeURIComponent(vaultDir);
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', uri], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [uri], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [uri], { detached: true, stdio: 'ignore' }).unref();
    }
    return true;
  } catch {
    return false;
  }
}
