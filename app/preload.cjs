const { contextBridge, ipcRenderer } = require('electron');

// The only surface the renderer can touch — no Node, no direct fs access.
contextBridge.exposeInMainWorld('brain', {
  presets: () => ipcRenderer.invoke('presets'),
  adapters: () => ipcRenderer.invoke('adapters'),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  obsidianDetect: () => ipcRenderer.invoke('obsidian-detect'),
  install: (opts) => ipcRenderer.invoke('install', opts),
  connectProject: (opts) => ipcRenderer.invoke('connect-project', opts),
});
