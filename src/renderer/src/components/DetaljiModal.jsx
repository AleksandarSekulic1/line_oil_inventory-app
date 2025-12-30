import React, { useEffect, useState } from 'react'

// --- IZDVOJENA KOMPONENTA ZA RED ISTORIJE ---
const RedIstorije = ({ stavka, editId, editData, setEditData, zapocniEdit, sacuvajEdit, otkazhiEdit, traziPotvrdu }) => {
  const kolicina = parseInt(stavka.kolicina);
  const jeIzlaz = kolicina < 0;
  
  const bojaTeksta = jeIzlaz ? '#c0392b' : '#27ae60';
  const znak = kolicina > 0 ? '+' : ''; 

  // --- REŽIM IZMENE ---
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

  // --- REŽIM PRIKAZA ---
  return (
    <tr style={{ borderBottom: '1px solid #eee', color: '#333', backgroundColor: jeIzlaz ? '#fff5f5' : 'white' }}>
      <td style={{ padding: '10px' }}>{stavka.datum}</td>
      
      <td style={{ padding: '10px', fontWeight: 'bold', color: bojaTeksta }}>
        {znak}{kolicina}
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

      <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
        <button 
            onClick={() => zapocniEdit(stavka)} 
            title="Izmeni"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}
        >
            ✏️
        </button>
        
        {/* DUGME ZA BRISANJE - Sada zove "traziPotvrdu" umesto direktnog brisanja */}
        <button 
            onClick={() => traziPotvrdu(stavka.id)} 
            title="Obriši"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}
        >
            🗑️
        </button>
      </td>
    </tr>
  )
}

// --- GLAVNA KOMPONENTA ---
export default function DetaljiModal({ proizvod, onClose, osveziSve }) {
  const [istorija, setIstorija] = useState([])
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({ kolicina: '', datum: '' })
  const [odabraniMesec, setOdabraniMesec] = useState('svi')

  // --- NOVO: STANJE ZA POTVRDU BRISANJA ---
  const [idZaBrisanje, setIdZaBrisanje] = useState(null) // Ako nije null, prikazuje se pitanje

  useEffect(() => {
    if (proizvod) {
      ucitajIstoriju()
    }
  }, [proizvod])

  const ucitajIstoriju = async () => {
    const data = await window.api.getProductHistory(proizvod.id)
    setIstorija(data || [])
  }

  // --- FILTRIRANJE ---
  const dostupniMeseci = [...new Set(istorija.map(s => s.datum.substring(0, 7)))].sort().reverse()
  const filtriranaIstorija = istorija
    .filter(stavka => odabraniMesec === 'svi' ? true : stavka.datum.startsWith(odabraniMesec))
    .sort((a, b) => new Date(b.datum) - new Date(a.datum))

  // --- EDIT ---
  const zapocniEdit = (stavka) => {
    setEditId(stavka.id)
    setEditData({ kolicina: stavka.kolicina, datum: stavka.datum })
  }
  const otkazhiEdit = () => setEditId(null)
  
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
    }
  }

  // --- BRISANJE SA POTVRDOM ---
  // 1. Korisnik klikne kanticu -> otvori se pitanje
  const zatraziPotvrdu = (id) => {
      setIdZaBrisanje(id);
  }

  // 2. Korisnik klikne "DA" -> brisemo
  const potvrdiBrisanje = async () => {
      if (!idZaBrisanje) return;
      try {
          await window.api.deleteHistoryEntry(idZaBrisanje);
          setIdZaBrisanje(null); // Zatvori pitanje
          await ucitajIstoriju(); 
          if (osveziSve) await osveziSve(); 
      } catch (err) {
          console.error("Greška pri brisanju:", err);
          alert("Greška.");
      }
  }

  // 3. Korisnik klikne "NE" -> samo zatvorimo pitanje
  const odustaniOdBrisanja = () => {
      setIdZaBrisanje(null);
  }

  if (!proizvod) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ 
          background: 'white', width: '700px', maxHeight: '85vh', overflowY: 'hidden', 
          borderRadius: '12px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#2c3e50',
          display: 'flex', flexDirection: 'column'
      }}>
        
        {/* BUTTON ZA ZATVARANJE MODALA */}
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#e74c3c' }}>✖</button>
        
        <div style={{ padding: '25px', borderBottom: '2px solid #ecf0f1' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>{proizvod.naziv} <span style={{ fontSize: '0.6em', color: '#7f8c8d' }}>({proizvod.zapremina})</span></h2>
            <div style={{ marginTop: '10px' }}>
                Trenutno stanje: <strong style={{ color: '#2980b9', fontSize: '1.2em' }}>{proizvod.stanje}</strong>
            </div>
        </div>

        <div style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
            <h3 style={{color: '#34495e', margin: 0}}>📅 Istorija Promena</h3>
            <select 
                value={odabraniMesec} 
                onChange={(e) => setOdabraniMesec(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #bdc3c7', cursor: 'pointer' }}
            >
                <option value="svi">📅 Prikaži sve vreme</option>
                {dostupniMeseci.map(mesec => <option key={mesec} value={mesec}>🗓️ {mesec}</option>)}
            </select>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 25px 25px 25px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr style={{ textAlign: 'left', color: '#7f8c8d', fontSize: '0.9em', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Datum</th>
                <th style={{ padding: '10px' }}>Promena</th>
                <th style={{ padding: '10px' }}>Opis / Kupac</th>
                <th style={{ padding: '10px' }}>Akcija</th>
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
                            traziPotvrdu={zatraziPotvrdu} // <--- Šaljemo novu funkciju
                        />
                    ))
                ) : (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#7f8c8d'}}>Nema istorije.</td></tr>
                )}
            </tbody>
            </table>
        </div>

        {/* --- NOVO: PROZORČIĆ ZA POTVRDU BRISANJA (POPUP) --- */}
        {idZaBrisanje && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(255,255,255,0.9)', 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                zIndex: 10000, borderRadius: '12px'
            }}>
                <div style={{ 
                    background: 'white', padding: '30px', borderRadius: '10px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid #eee', textAlign: 'center' 
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>Potvrda brisanja</h3>
                    <p style={{ color: '#555', marginBottom: '25px' }}>
                        Da li ste sigurni da želite da obrišete ovu stavku?<br/>
                        <strong>Stanje lagera će biti automatski korigovano.</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button 
                            onClick={odustaniOdBrisanja}
                            style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Odustani
                        </button>
                        <button 
                            onClick={potvrdiBrisanje}
                            style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#c0392b', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            Da, obriši
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}