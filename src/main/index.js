import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { connectDB } from './db' // <--- Ovo ti je dobro, ostavljamo
import fs from 'fs' // <--- 1. DODATO: Treba nam za brisanje fajla

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

  // --- HANDLERI ZA BAZU (Optimizovani) ---

  // 1. Učitaj sve proizvode
  ipcMain.handle('get-products', async () => {
    const db = await connectDB()
    await db.read()
    // Vraćamo prazan niz ako nema proizvoda, da ne pukne frontend
    return db.data.proizvodi || []
  })

  // 2. Dodaj novi proizvod
  ipcMain.handle('add-product', async (event, noviProizvod) => {
    const db = await connectDB()
    await db.update((data) => {
      // Pravimo novu kopiju niza sa novim proizvodom (Sigurnije od push)
      data.proizvodi = [...(data.proizvodi || []), noviProizvod]
    })
    return true
  })

  // 3. Obriši proizvod
  ipcMain.handle('delete-product', async (event, idProizvoda) => {
    const db = await connectDB()
    await db.update((data) => {
      // Koristimo filter umesto splice - mnogo stabilnije
      // Pretvaramo u String da bismo bili sigurni da brišemo pravi ID
      data.proizvodi = (data.proizvodi || []).filter(p => String(p.id) !== String(idProizvoda))
    })
    return true
  })

  // 4. Ažuriraj proizvod
  ipcMain.handle('update-product', async (event, azuriranProizvod) => {
    const db = await connectDB()
    await db.update((data) => {
      // Mapiramo niz i zamenjujemo samo onaj koji se menja
      data.proizvodi = (data.proizvodi || []).map(p => 
        String(p.id) === String(azuriranProizvod.id) ? azuriranProizvod : p
      )
    })
    return true
  })

  // 5. DODAJ NA STANJE (Unos nove promene)
  ipcMain.handle('add-stock-entry', async (event, { proizvodId, kolicina, datum, tip }) => {
  console.log("------------------------------------------------")
  console.log("BACKEND PRIMIO ZAHTEV:", { proizvodId, kolicina, datum, tip })

  const db = await connectDB()
  
  // Pretvaramo kolicinu u broj (za svaki slucaj)
  const kolicinaBroj = parseInt(kolicina)
  
  if (isNaN(kolicinaBroj)) {
    console.error("GRESKA: Kolicina nije broj!")
    return false
  }

  await db.update((data) => {
    // 1. Dodajemo zapis u istoriju
    const entryId = Date.now().toString()
    data.istorija = [...(data.istorija || []), {
      id: entryId,
      proizvodId,
      kolicina: kolicinaBroj,
      datum,
      tip
    }]
    console.log("-> Upisano u istoriju.")

    // 2. Azuriramo trenutno stanje proizvoda
    let proizvodPronadjen = false
    
    data.proizvodi = data.proizvodi.map(p => {
      // POREDJENJE ID-a: Pretvaramo oba u String da budemo 100% sigurni
      if (String(p.id) === String(proizvodId)) {
        console.log(`-> Proizvod pronadjen: ${p.naziv}`)
        console.log(`-> Staro stanje: ${p.stanje}, Dodajem: ${kolicinaBroj}`)
        
        const novoStanje = (parseInt(p.stanje) || 0) + kolicinaBroj
        proizvodPronadjen = true
        
        console.log(`-> NOVO STANJE: ${novoStanje}`)
        return { ...p, stanje: novoStanje }
      }
      return p
    })

    if (!proizvodPronadjen) {
      console.error("GRESKA: Proizvod sa ID-jem " + proizvodId + " nije pronadjen u bazi!")
    }
  })
  
  console.log("------------------------------------------------")
  return true
})
  // 6. UČITAJ ISTORIJU ZA PROIZVOD
  ipcMain.handle('get-product-history', async (event, proizvodId) => {
    const db = await connectDB()
    await db.read()
    const istorija = (db.data.istorija || [])
      .filter(item => String(item.proizvodId) === String(proizvodId))
      .sort((a, b) => new Date(b.datum) - new Date(a.datum)) // Sortiramo od najnovijeg
    return istorija
  })

  // 7. IZMENI ISTORIJU (U slucaju greske)
  ipcMain.handle('edit-history-entry', async (event, { entryId, novaKolicina, noviDatum }) => {
    const db = await connectDB()
    const novaKol = parseInt(novaKolicina)

    await db.update((data) => {
      // Nadjemo stari zapis da vidimo kolika je bila stara kolicina
      const stariZapis = data.istorija.find(i => i.id === entryId)
      if (!stariZapis) return

      const staraKolicina = parseInt(stariZapis.kolicina)
      const razlika = novaKol - staraKolicina

      // 1. Azuriramo zapis u istoriji
      data.istorija = data.istorija.map(i => 
        i.id === entryId ? { ...i, kolicina: novaKol, datum: noviDatum } : i
      )

      // 2. Azuriramo stanje proizvoda za tu razliku (da se matematika slozi)
      data.proizvodi = data.proizvodi.map(p => {
        if (String(p.id) === String(stariZapis.proizvodId)) {
          return { ...p, stanje: (parseInt(p.stanje) || 0) + razlika }
        }
        return p
      })
    })
    return true
  })

  // 8. SKINI SA STANJA
  ipcMain.handle('remove-stock-entry', async (event, params) => {
    // Dodali smo datumIsporuke u destrukturiranje
    const { proizvodId, kolicina, datum, kupac, adresa, datumIsporuke } = params
    
    console.log("--- PRODAJA ---")
    console.log(`Kupac: ${kupac}, Datum isporuke: ${datumIsporuke}`)

    const db = await connectDB()
    const kolicinaBroj = parseInt(kolicina)

    let uspesno = false
    let poruka = ""

    await db.update((data) => {
      const proizvodIndex = data.proizvodi.findIndex(p => String(p.id) === String(proizvodId))
      
      if (proizvodIndex === -1) {
        poruka = "Proizvod nije pronađen!"
        return
      }

      const proizvod = data.proizvodi[proizvodIndex]
      const trenutnoStanje = parseInt(proizvod.stanje) || 0

      if (trenutnoStanje < kolicinaBroj) {
        poruka = `Nema dovoljno na stanju! Trenutno: ${trenutnoStanje}, Traženo: ${kolicinaBroj}`
        return
      }

      // Skini stanje
      data.proizvodi[proizvodIndex].stanje = trenutnoStanje - kolicinaBroj
      
      // Upisi u istoriju
      const noviZapis = {
        id: Date.now().toString(),
        proizvodId,
        kolicina: -kolicinaBroj,
        datum,
        tip: 'izlaz',
        kupac: kupac || 'Nepoznat kupac',
        adresa: adresa || '',
        datumIsporuke: datumIsporuke || '' // <--- NOVO POLJE U BAZI
      }

      data.istorija = [...(data.istorija || []), noviZapis]
      uspesno = true
    })

    if (!uspesno) {
      throw new Error(poruka)
    }
    
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