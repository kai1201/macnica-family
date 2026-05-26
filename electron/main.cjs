'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// ─── .env loader (no extra npm packages) ─────────────────────────────────────
// Reads KEY=VALUE lines and merges into process.env (existing vars win).
function loadDotEnv() {
  const envPath = app.isPackaged
    ? path.join(process.resourcesPath, '.env')   // packaged: extraResources
    : path.join(__dirname, '..', '.env');          // dev: project root

  try {
    const src = fs.readFileSync(envPath, 'utf8');
    for (const line of src.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
      }
    }
  } catch {
    // .env not present — rely on environment variables already in process.env
  }
}

loadDotEnv();

const isDev = !app.isPackaged;

// ─── Main window ──────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a2a',
    title: 'Magical Macnica',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,   // renderer cannot access Node
      nodeIntegration: false,   // Node disabled in renderer
      sandbox: true,            // renderer sandboxed; preload still has ipcRenderer
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // Uncomment to open DevTools automatically during development:
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Azure image generation ─────────────────────────────────────────────
// API credentials are read here in the main process and never sent to renderer.
ipcMain.handle('generate-image', async (_event, prompt) => {
  const endpoint   = process.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey     = process.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = process.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.VITE_AZURE_API_VERSION;

  if (!endpoint || !apiKey || !deployment || !apiVersion) {
    return { error: 'Azure OpenAI environment variables are not configured.' };
  }

  const url =
    `${endpoint}/openai/deployments/${deployment}/images/generations` +
    `?api-version=${apiVersion}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size: '1024x1024',
        quality: 'low',
        output_format: 'png',
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { error: err?.error?.message || `API error: ${response.status}` };
    }

    const data = await response.json();
    const item = data.data?.[0];
    if (!item) return { error: 'No image data in response' };

    if (item.b64_json) return { dataUrl: `data:image/png;base64,${item.b64_json}` };
    if (item.url)      return { dataUrl: item.url };
    return { error: 'No image URL in response' };
  } catch (err) {
    return { error: err.message || 'Network error' };
  }
});
