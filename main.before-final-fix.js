const electron = require('electron');
const path = require('path');
const { exec ,spawn} = require('child_process');
const fs = require('fs');

const { app, BrowserWindow, shell, ipcMain } = electron;

let mainWindow = null;
// Android emulator configuration
const emulatorPath = path.join(
  process.env.LOCALAPPDATA,
  'Android',
  'Sdk',
  'emulator',
  'emulator.exe'
);

const adbPath = path.join(
  process.env.LOCALAPPDATA,
  'Android',
  'Sdk',
  'platform-tools',
  'adb.exe'
);

let emulatorProcess = null;
let isQuitting = false;

function startAndroidEmulator() {
  if (emulatorProcess) return;

  if (!fs.existsSync(emulatorPath)) {
    console.error('Android emulator not found:', emulatorPath);
    return;
  }

  emulatorProcess = spawn(
    emulatorPath,
    ['-avd', 'EazyStack_Android16'],
    { stdio: 'ignore', windowsHide: false }
  );

  emulatorProcess.on('error', (error) => {
    console.error('Emulator startup failed:', error);
    emulatorProcess = null;
  });

  emulatorProcess.on('exit', () => {
    emulatorProcess = null;
  });

  console.log('Eazy Stack Android emulator started.');
}

function stopAndroidEmulator() {
  return new Promise((resolve) => {
    if (!emulatorProcess) {
      resolve();
      return;
    }

    exec(
      `"${adbPath}" -s emulator-5554 emu kill`,
      (error) => {
        if (error) {
          console.error('Normal emulator shutdown failed:', error);
        }

        emulatorProcess = null;
        resolve();
      }
    );
  });
}

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

  // Keep the global reference
  mainWindow = win;

  // Display the window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open Developer Tools for debugging
  win.webContents.openDevTools({ mode: 'detach' });

  // Log JavaScript errors
    win.webContents.on('console-message', (event, details) => {
    if (details.level >= 2) {
      console.error('[Renderer error]', details.message);
    }
  });

  // Load Eazy Stack's HTML
  win.loadFile(path.join(__dirname, 'index.html'))
    .catch(error => {
      console.error('Could not load index.html:', error);
    });

  win.setMenu(null);
}

 

  // Open Developer Tools automatically
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Log errors from the page to the terminal
  mainWindow.webContents.on('console-message', (event, details) => {
    if (details.level >= 2) {
      console.error(
        '[Renderer error]',
        details.message,
        'Line:',
        details.lineNumber
      );
    }
  });

  // Detect if the page fails to load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[Page load failed]', errorCode, errorDescription);
  });

  // Detect JavaScript errors
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('[Preload error]', preloadPath, error);
  });

  // Load your app
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
    .catch(error => {
      console.error('[HTML loading error]', error);
    });

  mainWindow.setMenu(null);
}

   
  

 


app.whenReady().then(() => {
  createWindow();
  startAndroidEmulator();
});

app.on('before-quit', (event) => {
  if (isQuitting) return;

  event.preventDefault();
  isQuitting = true;

  stopAndroidEmulator().finally(() => {
    app.quit();
  });


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
