

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,

  openExternal: (url) =>
    ipcRenderer.invoke('open-external', url),

  launchLocalApp: (app) =>
    ipcRenderer.invoke('launch-local-app', app),

  launchAndroidApp: (packageName) =>
    ipcRenderer.invoke('launch-android-app', packageName),

  scanLocalApps: () =>
    ipcRenderer.invoke('scan-local-apps')
});
