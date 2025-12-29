import { app } from 'electron'
import path from 'path'
import fs from 'fs' 
import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
  proizvodnja: [],
  prodaja: [],
  istorija: [],
  proizvodi: [
    // --- ULJA ---
    { id: "364", naziv: "SAE 10w40 UNIVERSAL", zapremina: "1L", stanje: 0 },
    { id: "1108", naziv: "SAE 10w40 UNIVERSAL", zapremina: "5L", stanje: 0 },
    { id: "476", naziv: "SAE 15w40 POWER", zapremina: "1L", stanje: 0 },
    { id: "1117", naziv: "SAE 15w40 POWER", zapremina: "5L", stanje: 0 },
    { id: "368", naziv: "SAE 15w40 POWER", zapremina: "10L", stanje: 0 },
    { id: "486", naziv: "SAE 20w50 LONG LIFE", zapremina: "1L", stanje: 0 },
    { id: "1121", naziv: "SAE 20w50 LONG LIFE", zapremina: "5L", stanje: 0 },
    { id: "323", naziv: "SAE 30 PP", zapremina: "1L", stanje: 0 },
    { id: "331", naziv: "SAE 30 PP", zapremina: "2L", stanje: 0 },
    { id: "365", naziv: "SAE 30 PP", zapremina: "5L", stanje: 0 },
    { id: "487", naziv: "SAE 30 W-3", zapremina: "1L", stanje: 0 },
    { id: "312", naziv: "SAE 30 W-3", zapremina: "10L", stanje: 0 },
    { id: "1326", naziv: "SAE 40 W-3", zapremina: "1L", stanje: 0 },
    { id: "483", naziv: "SAE 40 W-3", zapremina: "10L", stanje: 0 },
    
    // --- OSTALA ULJA I TECNOSTI ---
    { id: "332", naziv: "DVOTAKTOL-W", zapremina: "100ml", stanje: 0 },
    { id: "488", naziv: "DVOTAKTOL-W", zapremina: "1L", stanje: 0 },
    { id: "888", naziv: "DVOTAKTOL-W", zapremina: "5L", stanje: 0 },
    { id: "890", naziv: "TRAKTOR OIL 80", zapremina: "5L", stanje: 0 }, 
    { id: "391", naziv: "TRAKTOR OIL 80", zapremina: "5L", stanje: 0 },
    { id: "307", naziv: "TRAKTOR OIL 80", zapremina: "10L", stanje: 0 },
    { id: "319", naziv: "SAE 90 GEAR-2", zapremina: "1L", stanje: 0 },
    { id: "351", naziv: "SAE 90 GEAR-2", zapremina: "2L", stanje: 0 },
    { id: "360", naziv: "SAE 90 GEAR-2", zapremina: "5L", stanje: 0 },
    { id: "354", naziv: "SAE 140 GEAR-4", zapremina: "1L", stanje: 0 },
    { id: "473", naziv: "SAE 140 GEAR-4", zapremina: "2L", stanje: 0 },
    { id: "481", naziv: "SAE 140 GEAR-4", zapremina: "10L", stanje: 0 },
    { id: "1194", naziv: "SAE 80w90 GEAR-5", zapremina: "1L", stanje: 0 },
    { id: "1195", naziv: "SAE 80w90 GEAR-5", zapremina: "5L", stanje: 0 },
    { id: "1413", naziv: "SAE 80w90 GEAR-5", zapremina: "10L", stanje: 0 },
    { id: "1196", naziv: "ATF sufix A", zapremina: "500ml", stanje: 0 },
    { id: "461", naziv: "ATF sufix A", zapremina: "1L", stanje: 0 },
    { id: "328", naziv: "ATF sufix A", zapremina: "10L", stanje: 0 },
    { id: "505", naziv: "HIDROL M 46", zapremina: "5L", stanje: 0 },
    { id: "313", naziv: "HIDROL M 46", zapremina: "10L", stanje: 0 },
    { id: "618", naziv: "HIDROL M 68", zapremina: "5L", stanje: 0 },
    { id: "310", naziv: "HIDROL M 68", zapremina: "10L", stanje: 0 },
    { id: "485", naziv: "LANCOL", zapremina: "1L", stanje: 0 },
    { id: "363", naziv: "LANCOL", zapremina: "2L", stanje: 0 },
    { id: "460", naziv: "LANCOL", zapremina: "5L", stanje: 0 },
    { id: "271", naziv: "OPLATOL", zapremina: "5L", stanje: 0 },
    { id: "246", naziv: "OPLATOL", zapremina: "10L", stanje: 0 },
    { id: "1260", naziv: "UK ulje DOT-3", zapremina: "250ml", stanje: 0 },
    { id: "1261", naziv: "UK ulje DOT-3", zapremina: "500ml", stanje: 0 },
    { id: "1262", naziv: "UK ulje DOT-4", zapremina: "250ml", stanje: 0 },
    { id: "1263", naziv: "UK ulje DOT-4", zapremina: "500ml", stanje: 0 },
    { id: "498", naziv: "Demineralizovana voda", zapremina: "1L", stanje: 0 },
    { id: "352", naziv: "Demineralizovana voda", zapremina: "2L", stanje: 0 },
    { id: "499", naziv: "Demineralizovana voda", zapremina: "5L", stanje: 0 },

    // --- ZIMA I MASTI ---
    { id: "494", naziv: "Zimska tecnost", zapremina: "1L", stanje: 0 },
    { id: "495", naziv: "Zimska tecnost", zapremina: "2L", stanje: 0 },
    { id: "1423", naziv: "Zimska tecnost", zapremina: "3L", stanje: 0 },
    { id: "536", naziv: "Zimska tecnost", zapremina: "5L", stanje: 0 },
    { id: "1408", naziv: "Line Blue", zapremina: "5L", stanje: 0 },
    { id: "1409", naziv: "Line Blue", zapremina: "10L", stanje: 0 },
    { id: "241", naziv: "Antifriz G 11 40%", zapremina: "1kg", stanje: 0 },
    { id: "239", naziv: "Antifriz G 11 100%", zapremina: "1kg", stanje: 0 },
    { id: "798", naziv: "Antifriz G 11 100%", zapremina: "5L", stanje: 0 },
    { id: "1077", naziv: "Antifriz G 12 40%", zapremina: "1kg", stanje: 0 },
    { id: "242", naziv: "Antifriz G 12 100%", zapremina: "1kg", stanje: 0 },
    { id: "837", naziv: "Antifriz G 12 100%", zapremina: "5L", stanje: 0 },
    { id: "1433", naziv: "Kalcijumova mast", zapremina: "850gr", stanje: 0 },
    { id: "518", naziv: "Kalcijumova mast", zapremina: "5kg", stanje: 0 },
    { id: "875", naziv: "Kalcijumova mast", zapremina: "15kg", stanje: 0 },
    { id: "519", naziv: "Litijumska mast", zapremina: "800gr", stanje: 0 },
    { id: "506", naziv: "Litijumska mast", zapremina: "5kg", stanje: 0 },
    { id: "517", naziv: "Grafitna mast", zapremina: "400gr", stanje: 0 },
    { id: "520", naziv: "Grafitna mast", zapremina: "800gr", stanje: 0 },

    // --- DODATO (LETNJA TECNOST) ---
    { id: "400", naziv: "Letnja tecnost", zapremina: "1L", stanje: 0 },
    { id: "293", naziv: "Letnja tecnost", zapremina: "2L", stanje: 0 },
    { id: "501", naziv: "Letnja tecnost", zapremina: "5L", stanje: 0 }
  ]
}

export const connectDB = async () => {
  // 1. OVO MORA BITI PRVA LINIJA U FUNKCIJI - pravljenje putanje
  const dbPath = path.join(app.getPath('userData'), 'inventory-db.json')
  
  // 2. TEK SADA MOZEMO DA JE KORISTIMO - ispis u konzolu
  console.log("--------------------------------------------------")
  console.log("PUTANJA BAZE PODATAKA JE:", dbPath)
  console.log("--------------------------------------------------")

  // 3. BRISANJE BAZE (Otkomentarisi linije ispod AKO ZELIS RESET, inace neka ostanu pod //)
  // if (fs.existsSync(dbPath)) {
  //   try {
  //     fs.unlinkSync(dbPath)
  //     console.log("!!! STARA BAZA JE OBRISANA. KREIRAM NOVU... !!!")
  //   } catch (err) {
  //     console.error("Greska pri brisanju baze:", err)
  //   }
  // }

  // 4. Ucitavanje baze (ovo ce kreirati novu ako je stara obrisana)
  const db = await JSONFilePreset(dbPath, defaultData)
  return db
}