'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, narrow API surface to the renderer.
// No Node.js APIs leak through — only the functions listed here.
contextBridge.exposeInMainWorld('electronAPI', {
  generateImage: (prompt) => ipcRenderer.invoke('generate-image', prompt),
});
