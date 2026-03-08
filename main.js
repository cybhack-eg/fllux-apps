const { app, BrowserWindow, Menu, shell, session, nativeImage, ipcMain, MenuItem, safeStorage } = require('electron')
const path = require('path')
const fs = require('fs')

function createAppWindow() {
  Menu.setApplicationMenu(null)
  app.setAppUserModelId('org.fllux.desktop')
  
  // Use standard paths for production, local paths for development
  if (!app.isPackaged) {
    try {
      const baseDir = process.cwd()
      app.setPath('userData', path.join(baseDir, 'electron-user-data'))
      app.setAppLogsPath(path.join(baseDir, 'electron-logs'))
    } catch {}
  }
  
  const LOGIN_URL = 'https://fllux.org/login'
  const ROOT_URLS = new Set(['https://fllux.org', 'https://fllux.org/'])
  const iconPath = path.join(__dirname, 'icon.png')
  const appIcon = nativeImage.createFromPath(iconPath)
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    fullscreenable: true,
    frame: !isMac, // Use native frame on non-Mac, or custom logic
    titleBarStyle: isMac ? 'hidden' : 'default', // macOS native traffic lights
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    title: 'FLLUX',
    show: false,
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setContentProtection(true)

  // macOS specific menu
  if (isMac) {
    const template = [
      {
        label: app.name,
        submenu: [
          { role: 'about', label: 'حول التطبيق' },
          { type: 'separator' },
          { role: 'services', label: 'الخدمات' },
          { type: 'separator' },
          { role: 'hide', label: 'إخفاء' },
          { role: 'hideOthers', label: 'إخفاء الآخرين' },
          { role: 'unhide', label: 'إظهار الكل' },
          { type: 'separator' },
          { role: 'quit', label: 'خروج' }
        ]
      },
      {
        label: 'تعديل',
        submenu: [
          { role: 'undo', label: 'تراجع' },
          { role: 'redo', label: 'إعادة' },
          { type: 'separator' },
          { role: 'cut', label: 'قص' },
          { role: 'copy', label: 'نسخ' },
          { role: 'paste', label: 'لصق' },
          { role: 'selectAll', label: 'تحديد الكل' }
        ]
      },
      {
        label: 'عرض',
        submenu: [
          { role: 'reload', label: 'إعادة تحميل' },
          { role: 'forceReload', label: 'إعادة تحميل إجباري' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'إعادة تعيين الحجم' },
          { role: 'zoomIn', label: 'تكبير' },
          { role: 'zoomOut', label: 'تصغير' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'شاشة كاملة' }
        ]
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  // Window Controls
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })
  ipcMain.on('window-close', () => win.close())

  // Zoom Shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    const modifier = isMac ? input.meta : input.control
    if (modifier && input.key === '=') {
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5)
      event.preventDefault()
    }
    if (modifier && input.key === '-') {
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5)
      event.preventDefault()
    }
    if (modifier && input.key === '0') {
      win.webContents.setZoomLevel(0)
      event.preventDefault()
    }
  })

  const ses = win.webContents.session
  ses.setPermissionRequestHandler((wc, permission, callback, details) => {
    const url = (details && details.requestingUrl) || ''
    const isFllux = url.startsWith('https://fllux.org')
    const allowed = ['notifications', 'geolocation', 'media']
    callback(isFllux && allowed.includes(permission))
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (ROOT_URLS.has(url)) {
      e.preventDefault()
      win.loadURL(LOGIN_URL)
    }
  })
  win.webContents.on('will-redirect', (e, url) => {
    if (ROOT_URLS.has(url)) {
      e.preventDefault()
      win.loadURL(LOGIN_URL)
    }
  })
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  win.once('ready-to-show', () => win.show())
  win.loadFile(path.join(__dirname, 'shell.html'))

  // Global Zoom Shortcuts (even inside Webviews)
  win.webContents.on('before-input-event', (event, input) => {
    const modifier = isMac ? input.meta : input.control
    if (modifier && (input.key === '=' || input.key === '+')) {
      win.webContents.send('global-zoom-in')
      event.preventDefault()
    }
    if (modifier && input.key === '-') {
      win.webContents.send('global-zoom-out')
      event.preventDefault()
    }
    if (modifier && input.key === '0') {
      win.webContents.send('global-zoom-reset')
      event.preventDefault()
    }
  })

  // Zoom Shortcuts for Tabs and Webviews
  ipcMain.on('zoom-in', (event) => {
    const webContents = event.sender
    const currentZoom = webContents.getZoomLevel()
    webContents.setZoomLevel(currentZoom + 0.5)
  })

  ipcMain.on('zoom-out', (event) => {
    const webContents = event.sender
    const currentZoom = webContents.getZoomLevel()
    webContents.setZoomLevel(currentZoom - 0.5)
  })

  ipcMain.on('zoom-reset', (event) => {
    event.sender.setZoomLevel(0)
  })

  // Mouse Wheel Zoom for Main Window (Ctrl/Cmd + Wheel)
  win.webContents.on('mouse-wheel', (event, delta) => {
    const modifier = isMac ? event.metaKey : event.ctrlKey
    if (modifier) {
      if (delta.wheelTicksY > 0) {
        win.webContents.send('global-zoom-in')
      } else if (delta.wheelTicksY < 0) {
        win.webContents.send('global-zoom-out')
      }
    }
  })

  // Context Menu for Tabs and Webviews
  ipcMain.on('show-context-menu', (event, params) => {
    const menu = new Menu()
    
    if (params.linkURL) {
      menu.append(new MenuItem({
        label: 'فتح في تبويب جديد',
        click: () => { event.sender.send('open-link-new-tab', params.linkURL) }
      }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    if (params.isTab) {
      menu.append(new MenuItem({
        label: params.isPinned ? 'إلغاء تثبيت التبويب' : 'تثبيت التبويب',
        click: () => { event.sender.send('toggle-pin-tab', params.tabId) }
      }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    if (params.isEditable || params.selectionText) {
      menu.append(new MenuItem({ label: 'قص', role: 'cut' }))
      menu.append(new MenuItem({ label: 'نسخ', role: 'copy' }))
      menu.append(new MenuItem({ label: 'لصق', role: 'paste' }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    menu.popup(BrowserWindow.fromWebContents(event.sender))
  })

  // Activity Logger
  ipcMain.on('log-activity', (event, data) => {
    const logPath = path.join(app.getPath('userData'), 'activity.json')
    let logs = []
    if (fs.existsSync(logPath)) {
      try { logs = JSON.parse(fs.readFileSync(logPath, 'utf8')) } catch {}
    }
    const entry = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      time: new Date().toISOString(),
      title: data.title || 'بدون عنوان',
      url: data.url || '',
      type: data.type || 'info'
    }
    logs.unshift(entry)
    fs.writeFileSync(logPath, JSON.stringify(logs.slice(0, 100), null, 2))
  })

  ipcMain.handle('get-activities', () => {
    const logPath = path.join(app.getPath('userData'), 'activity.json')
    if (fs.existsSync(logPath)) {
      return JSON.parse(fs.readFileSync(logPath, 'utf8'))
    }
    return []
  })

  ipcMain.on('delete-log', (event, id) => {
    const logPath = path.join(app.getPath('userData'), 'activity.json')
    if (fs.existsSync(logPath)) {
      let logs = JSON.parse(fs.readFileSync(logPath, 'utf8'))
      logs = logs.filter(l => l.id !== id)
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))
    }
  })

  // Session Check Handler
  ipcMain.handle('check-session', async () => {
    const cookies = await session.defaultSession.cookies.get({ domain: 'fllux.org' })
    // البحث عن كوكي يدل على وجود جلسة (مثل laravel_session أو XSRF-TOKEN أو cookies المتعلقة بالدخول)
    const hasSession = cookies.some(c => c.name.includes('session') || c.name.includes('token'))
    return hasSession
  })

  // Password Manager Handlers
  ipcMain.handle('get-passwords', () => {
    const passPath = path.join(app.getPath('userData'), 'vault.json')
    if (!fs.existsSync(passPath)) return []
    try {
      const data = JSON.parse(fs.readFileSync(passPath, 'utf8'))
      return data.map(item => ({
        ...item,
        password: safeStorage.isEncryptionAvailable() 
          ? safeStorage.decryptString(Buffer.from(item.password, 'base64'))
          : 'غير متاح'
      }))
    } catch (e) { return [] }
  })

  ipcMain.on('save-password', (event, creds) => {
    const passPath = path.join(app.getPath('userData'), 'vault.json')
    let vault = []
    if (fs.existsSync(passPath)) {
      try { vault = JSON.parse(fs.readFileSync(passPath, 'utf8')) } catch {}
    }
    
    const encrypted = safeStorage.isEncryptionAvailable() 
      ? safeStorage.encryptString(creds.password).toString('base64')
      : creds.password

    vault.push({
      id: Date.now().toString(),
      site: creds.site,
      username: creds.username,
      password: encrypted
    })
    fs.writeFileSync(passPath, JSON.stringify(vault, null, 2))
  })

  ipcMain.on('delete-password', (event, id) => {
    const passPath = path.join(app.getPath('userData'), 'vault.json')
    if (fs.existsSync(passPath)) {
      let vault = JSON.parse(fs.readFileSync(passPath, 'utf8'))
      vault = vault.filter(v => v.id !== id)
      fs.writeFileSync(passPath, JSON.stringify(vault, null, 2))
    }
  })

  // Reminder System Handlers
  ipcMain.handle('get-reminders', () => {
    const remPath = path.join(app.getPath('userData'), 'reminders.json')
    if (!fs.existsSync(remPath)) return []
    try { return JSON.parse(fs.readFileSync(remPath, 'utf8')) } catch (e) { return [] }
  })

  ipcMain.on('save-reminder', (event, reminder) => {
    const remPath = path.join(app.getPath('userData'), 'reminders.json')
    let reminders = []
    if (fs.existsSync(remPath)) {
      try { reminders = JSON.parse(fs.readFileSync(remPath, 'utf8')) } catch {}
    }
    reminders.push({ ...reminder, id: Date.now().toString() })
    fs.writeFileSync(remPath, JSON.stringify(reminders, null, 2))
  })

  ipcMain.on('delete-reminder', (event, id) => {
    const remPath = path.join(app.getPath('userData'), 'reminders.json')
    if (fs.existsSync(remPath)) {
      let reminders = JSON.parse(fs.readFileSync(remPath, 'utf8'))
      reminders = reminders.filter(r => r.id !== id)
      fs.writeFileSync(remPath, JSON.stringify(reminders, null, 2))
    }
  })

  ipcMain.on('show-reminder-popup', (event, data) => {
    const popup = new BrowserWindow({
      width: 400,
      height: 200,
      frame: false,
      alwaysOnTop: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    
    popup.setMenu(null)
    popup.loadURL(`data:text/html;charset=utf-8,
      <html dir="rtl" style="font-family:system-ui, sans-serif; background:#fff; color:#1e293b; padding:20px; border:2px solid #0ea5e9; border-radius:12px; overflow:hidden">
        <body style="margin:0; display:flex; flex-direction:column; height:100%">
          <div style="font-weight:800; font-size:18px; color:#0ea5e9; margin-bottom:10px">⏰ تذكير جديد!</div>
          <div style="font-size:16px; flex:1">${data.text}</div>
          <button onclick="window.close()" style="margin-top:15px; padding:8px; background:#0ea5e9; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600">تم الإطلاع</button>
        </body>
      </html>
    `)
  })
}

function createInstallerWindow(next) {
  Menu.setApplicationMenu(null)
  const iconPath = path.join(__dirname, 'icon.png')
  const win = new BrowserWindow({
    width: 640,
    height: 420,
    resizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    title: 'FLLUX Installer',
    show: false,
    titleBarOverlay: false,
    icon: nativeImage.createFromPath(iconPath),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setContentProtection(true)
  win.once('ready-to-show', () => win.show())
  win.loadFile(path.join(__dirname, 'installer', 'index.html'))
  const installedFlag = path.join(app.getPath('userData'), 'installed.flag')
  ipcMain.once('installer:accept', () => {
    try { fs.writeFileSync(installedFlag, 'ok') } catch {}
    let p = 0
    const tm = setInterval(() => {
      p = Math.min(1, p + 0.12)
      win.setProgressBar(p)
      win.webContents.send('installer:progress', p)
      if (p >= 1) {
        clearInterval(tm)
        win.close()
        next()
      }
    }, 220)
  })
}

app.whenReady().then(() => {
  const installedFlag = path.join(app.getPath('userData'), 'installed.flag')
  const hasInstalled = fs.existsSync(installedFlag)
  if (!hasInstalled) {
    createInstallerWindow(() => createAppWindow())
  } else {
    createAppWindow()
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createAppWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
