import React, { useEffect, useState } from 'react'

// --- IZDVOJENA KOMPONENTA ZA RED ISTORIJE ---
const RedIstorije = ({ stavka, editId, editData, setEditData, zapocniEdit, sacuvajEdit, otkazhiEdit }) => {
  const jeIzlaz = stavka.kolicina < 0;

  if (editId === stavka.id) {
    return (
      <tr style={{ borderBottom: '1px solid #eee', background: '#fff9c4' }}>
        <td>
          <input 
            type="date" 
            value={editData.datum} 
            onChange={e => setEditData({...editData, datum: e.target.value})} 
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
          />
        </td>
        <td>
          <input 
            type="number" 
            value={editData.kolicina} 
            onChange={e => setEditData({...editData, kolicina: e.target.value})} 
            style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </td>
        <td style={{ fontSize: '0.8em', color: '#7f8c8d' }}>(Ne menja se)</td>
        <td>
          <button onClick={sacuvajEdit} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✓</button>
          <button onClick={otkazhiEdit} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>✗</button>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ borderBottom: '1px solid #eee', color: '#333', backgroundColor: jeIzlaz ? '#fff5f5' : 'white' }}>
      <td style={{ padding: '10px' }}>{stavka.datum}</td>
      
      <td style={{ padding: '10px', fontWeight: 'bold', color: jeIzlaz ? '#c0392b' : '#27ae60' }}>
        {stavka.kolicina > 0 ? `+${stavka.kolicina}` : stavka.kolicina}
      </td>

      <td style={{ padding: '10px', fontSize: '0.9em' }}>
        {jeIzlaz ? (
            <div>
                <strong>👤 {stavka.kupac || "Nepoznat kupac"}</strong>
                {stavka.datumIsporuke && (
                    <div style={{ color: '#c0392b', marginTop: '2px', fontWeight: '500', fontSize: '0.85em' }}>
                        🚚 Isporuka: {stavka.datumIsporuke}
                    </div>
                )}
                {stavka.adresa && <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>📍 {stavka.adresa}</div>}
            </div>
        ) : (
            <span style={{ color: '#27ae60' }}>📦 Nabavka / Korekcija</span>
        )}
      </td>

      <td style={{ padding: '10px' }}>
        <button onClick={() => zapocniEdit(stavka)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
      </td>
    </tr>
  )
}

// --- GLAVNA KOMPONENTA ---
export default function DetaljiModal({ proizvod, onClose, osveziSve }) {
  const [istorija, setIstorija] = useState([])
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({ kolicina: '', datum: '' })
  
  // --- NOVO: STANJE ZA FILTER ---
  const [odabraniMesec, setOdabraniMesec] = useState('svi')

  useEffect(() => {
    if (proizvod) {
      ucitajIstoriju()
    }
  }, [proizvod])

  const ucitajIstoriju = async () => {
    const data = await window.api.getProductHistory(proizvod.id)
    setIstorija(data)
  }

  // --- LOGIKA ZA FILTER I SORTIRANJE ---
  
  // 1. Izvlacimo sve dostupne mesece iz istorije (format YYYY-MM)
  const dostupniMeseci = [...new Set(istorija.map(s => s.datum.substring(0, 7)))].sort().reverse()

  // 2. Filtriramo podatke
  const filtriranaIstorija = istorija
    .filter(stavka => {
        if (odabraniMesec === 'svi') return true
        return stavka.datum.startsWith(odabraniMesec)
    })
    // 3. Sortiramo od PROSLOSTI KA BUDUCNOSTI (Stariji datumi gore)
    .sort((a, b) => new Date(a.datum) - new Date(b.datum))

  // -------------------------------------

  const zapocniEdit = (stavka) => {
    setEditId(stavka.id)
    setEditData({ kolicina: stavka.kolicina, datum: stavka.datum })
  }

  const otkazhiEdit = () => {
      setEditId(null)
  }

  const sacuvajEdit = async () => {
    try {
        await window.api.editHistoryEntry({
            entryId: editId,
            novaKolicina: editData.kolicina,
            noviDatum: editData.datum
        })
        setEditId(null)
        await ucitajIstoriju() 
        if (osveziSve) await osveziSve()
    } catch (err) {
        console.error("Greska:", err)
        alert("Greška pri izmeni.")
    }
  }

  if (!proizvod) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ 
          background: 'white', width: '700px', maxHeight: '85vh', overflowY: 'auto', 
          borderRadius: '12px', padding: '25px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#2c3e50'
      }}>
        
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#e74c3c' }}>✖</button>
        
        <h2 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '15px', marginTop: 0, color: '#2c3e50' }}>
          {proizvod.naziv} <span style={{ fontSize: '0.6em', color: '#7f8c8d' }}>({proizvod.zapremina})</span>
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <div style={{color: '#2c3e50'}}><strong>Šifra:</strong> {proizvod.id}</div>
            <div style={{ fontSize: '1.2em', color: '#2c3e50' }}><strong>Trenutno stanje:</strong> <span style={{ color: '#2980b9', fontWeight: 'bold' }}>{proizvod.stanje}</span></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{color: '#34495e', margin: 0}}>📅 Istorija Promena</h3>
            
            {/* FILTER DROPDOWN */}
            <select 
                value={odabraniMesec} 
                onChange={(e) => setOdabraniMesec(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #bdc3c7', cursor: 'pointer' }}
            >
                <option value="svi">📅 Prikaži sve vreme</option>
                {dostupniMeseci.map(mesec => (
                    <option key={mesec} value={mesec}>
                        🗓️ {mesec}
                    </option>
                ))}
            </select>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid #ecf0f1' }}>
          <thead>
            <tr style={{ background: '#ecf0f1', textAlign: 'left', color: '#2c3e50' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #bdc3c7' }}>Datum</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #bdc3c7' }}>Promena</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #bdc3c7' }}>Opis / Kupac</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #bdc3c7' }}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {filtriranaIstorija.length > 0 ? (
                filtriranaIstorija.map(stavka => (
                    <RedIstorije 
                        key={stavka.id}
                        stavka={stavka}
                        editId={editId}
                        editData={editData}
                        setEditData={setEditData}
                        zapocniEdit={zapocniEdit}
                        sacuvajEdit={sacuvajEdit}
                        otkazhiEdit={otkazhiEdit}
                    />
                ))
            ) : (
                <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#7f8c8d'}}>
                        Nema istorije za izabrani period.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}