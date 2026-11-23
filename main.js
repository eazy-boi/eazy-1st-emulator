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

  if (!fs.existsSync(emulatorPath) || !fs.existsSync(adbPath)) {
    console.error('Android emulator or ADB not found.');
    return;
  }

  // Check whether an emulator is already running.
// Use ADB's device list synchronously for a reliable check.
  const { execFileSync } = require('child_process');
  let devices = '';

  try {
    devices = execFileSync(adbPath, ['devices'], { encoding: 'utf8' });
  } catch (error) {
    console.error('Could not check Android devices:', error);
    return;
  }

  if (/^emulator-\d+\s+device$/m.test(devices)) {
    console.log('An Android emulator is already running. Eazy Stack will not start another.');
    return;
  }

  emulatorProcess = spawn(
    emulatorPath,
    ['-avd', 'EazyStack_Android16', '-port', '5554', '-camera-front', 'webcam0', '-camera-back', 'webcam0'],
    { stdio: 'ignore', windowsHide: false }
  );

  emulatorProcess.on('error', (error) => {
    console.error('Emulator startup failed:', error);
    emulatorProcess = null;
  });

  emulatorProcess.on('exit', () => {
    emulatorProcess = null;
  });

  console.log('Eazy Stack started its Android emulator.');
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
        } else {
          console.log('Eazy Stack emulator shut down normally.');
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

const androidPackages = new Set([
  'com.android.camera2',
  'com.android.chrome',
  'com.google.android.apps.messaging',
  'com.google.android.contacts',
  'com.google.android.calendar',
  'com.android.deskclock',
  'com.google.android.apps.photos'
]);

ipcMain.handle('launch-android-app', async (event, packageName) => {
  if (!androidPackages.has(packageName)) {
    throw new Error('Android app is not approved for launching.');
  }

  if (!fs.existsSync(adbPath)) {
    throw new Error('Android ADB was not found.');
  }

  return new Promise((resolve, reject) => {
    const { execFile } = require('child_process');

    execFile(
      adbPath,
      ['-s', 'emulator-5554', 'shell', 'monkey', '-p', packageName, '1'],
      { windowsHide: true, timeout: 15000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Could not open Android app: ${stderr || error.message}`));
        } else {
          resolve(stdout);
        }
      }
    );
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
              icon: 'ðŸ“±',
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});



