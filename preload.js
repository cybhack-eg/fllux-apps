const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('installer', {
  accept: () => ipcRenderer.send('installer:accept'),
  onProgress: (cb) => ipcRenderer.on('installer:progress', (_e, v) => cb(v))
})

contextBridge.exposeInMainWorld('electron', {
  showContextMenu: (params) => ipcRenderer.send('show-context-menu', params),
  onOpenLinkNewTab: (cb) => ipcRenderer.on('open-link-new-tab', (_e, url) => cb(url)),
  logActivity: (data) => ipcRenderer.send('log-activity', data),
  getActivities: () => ipcRenderer.invoke('get-activities'),
  deleteLog: (id) => ipcRenderer.send('delete-log', id),
  checkSession: () => ipcRenderer.invoke('check-session'),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  savePassword: (creds) => ipcRenderer.send('save-password', creds),
  deletePassword: (id) => ipcRenderer.send('delete-password', id),
  getReminders: () => ipcRenderer.invoke('get-reminders'),
  saveReminder: (rem) => ipcRenderer.send('save-reminder', rem),
  deleteReminder: (id) => ipcRenderer.send('delete-reminder', id),
  showReminderPopup: (data) => ipcRenderer.send('show-reminder-popup', data),
  onTogglePinTab: (cb) => ipcRenderer.on('toggle-pin-tab', (_e, tabId) => cb(tabId)),
  zoomIn: () => ipcRenderer.send('zoom-in'),
  zoomOut: () => ipcRenderer.send('zoom-out'),
  zoomReset: () => ipcRenderer.send('zoom-reset'),
  onGlobalZoomIn: (cb) => ipcRenderer.on('global-zoom-in', () => cb()),
  onGlobalZoomOut: (cb) => ipcRenderer.on('global-zoom-out', () => cb()),
  onGlobalZoomReset: (cb) => ipcRenderer.on('global-zoom-reset', () => cb()),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  platform: process.platform
})
