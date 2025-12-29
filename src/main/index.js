import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { connectDB } from './db' // <--- UVOZIMO NASU BAZU

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // --- OVO JE DEO GDE SPAJAMO BAZU ---
  // 1. Učitaj sve proizvode
  ipcMain.handle('get-products', async () => {
    const db = await connectDB()
    await db.read()
    return db.data.proizvodi
  })

  // 2. Dodaj novi proizvod
  ipcMain.handle('add-product', async (event, noviProizvod) => {
    const db = await connectDB()
    await db.update(({ proizvodi }) => proizvodi.push(noviProizvod))
    return true
  })

  // 3. Obriši proizvod
  ipcMain.handle('delete-product', async (event, idProizvoda) => {
    const db = await connectDB()
    await db.update(({ proizvodi }) => {
      const index = proizvodi.findIndex(p => p.id === idProizvoda)
      if (index !== -1) proizvodi.splice(index, 1)
    })
    return true
  })

  // 4. Ažuriraj (Izmeni) proizvod
  ipcMain.handle('update-product', async (event, azuriranProizvod) => {
    const db = await connectDB()
    await db.update(({ proizvodi }) => {
      const index = proizvodi.findIndex(p => p.id === azuriranProizvod.id)
      if (index !== -1) proizvodi[index] = azuriranProizvod
    })
    return true
  })
  // ------------------------------------

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})