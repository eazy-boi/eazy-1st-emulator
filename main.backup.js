const electron = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const { app, BrowserWindow, shell, ipcMain } = electron;

let mainWindow = null;

ipcMain.handle('open-external', async (event, url) => {
  return shell.openExternal(url);
});

ipcMain.handle('launch-local-app', async (event, appObj) => {
  return new Promise((resolve, reject) => {
    const target = appObj.local || appObj.command || appObj.name;
    let cmd;
    if (process.platform === 'win32') {
      if (fs.existsSync(target)) {
        cmd = `"${target}"`;
      } else {
        cmd = `start "" "${target}"`;
      }
    } else {
      cmd = target;
    }
    exec(cmd, { shell: true }, (err) => {
      if (err) reject(new Error(`Failed to launch ${appObj.name}: ${err.message}`));
      else resolve();
    });
  });
});

ipcMain.handle('scan-local-apps', async () => {
  if (process.platform !== 'win32') return [];
  const searchDirs = [
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    path.join(process.env.LOCALAPPDATA || '', 'Programs'),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];
  const found = [];
  const exes = new Set();

  function scanDir(dir, depth) {
    if (!fs.existsSync(dir) || depth > 3) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full, depth + 1);
        } else if (entry.name.toLowerCase().endsWith('.exe')) {
          const lower = entry.name.toLowerCase();
          if (!exes.has(lower)) {
            exes.add(lower);
            found.push({
              name: entry.name.replace('.exe', ''),
              command: full,
              icon: '📱',
              category: 'System',
              rating: 4,
              size: 'Unknown',
              desc: 'Installed desktop application',
              type: 'local'
            });
          }
        }
      }
    } catch (e) {}
  }

  searchDirs.forEach(d => scanDir(d, 0));
  return found.slice(0, 200);
});

ipcMain.handle('set-window-size', async (event, size) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;
  const [w, h] = size.split('x').map(Number);
  if (w && h) win.setSize(w, h);
});


function createWindow() {
  const win = new BrowserWindow({
    width: 430,
    height: 900,
    minWidth: 350,
    minHeight: 600,
    title: 'Eazy Stack',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#000000',
    resizable: true,
    show: false
  });

  // Save the window reference
  mainWindow = win;

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open Developer Tools
  win.webContents.openDevTools({ mode: 'detach' });

  // Capture renderer errors
  win.webContents.on('console-message', (event, details) => {
    if (details.level >= 2) {
      console.error('[Renderer error]', details.message);
    }
  });

  // Detect loading errors
  win.webContents.on('did-fail-load', (event, code, description) => {
    console.error('[Page load failed]', code, description);
  });

  // Load Eazy Stack
  win.loadFile(path.join(__dirname, 'index.html'))
    .catch(error => {
      console.error('[HTML loading error]', error);
    });

  win.setMenu(null);
}


 

  


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
