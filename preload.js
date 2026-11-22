const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  launchLocalApp: (app) => ipcRenderer.invoke('launch-local-app', app),
  scanLocalApps: () => ipcRenderer.invoke('scan-local-apps')
});
