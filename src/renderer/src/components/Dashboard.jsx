import React, { useState } from 'react'
import EditProductModal from './EditProductModal'

export default function Dashboard({ proizvodi, onDelete, onUpdate }) {
  const [trazenaRec, setTrazenaRec] = useState("")
  const [sortiranje, setSortiranje] = useState("naziv")
  
  const [odabraniProizvod, setOdabraniProizvod] = useState(null)
  const [proizvodZaIzmenu, setProizvodZaIzmenu] = useState(null)

  // --- NEPROBOJNO FILTRIRANJE ---
  // Koristimo (proizvodi || []) da osiguramo da nikad ne pukne ako je undefined
  const filtriraniLista = (proizvodi || []).filter(p => {
    if (!p) return false // Ignorisi prazne redove
    
    // Bezbedno pretvaranje u tekst
    const naziv = p.naziv ? String(p.naziv).toLowerCase() : ""
    const sifra = p.id ? String(p.id).toLowerCase() : ""
    const pretraga = trazenaRec.toLowerCase()

    return naziv.includes(pretraga) || sifra.includes(pretraga)
  }).sort((a, b) => {
    if (sortiranje === 'stanje') {
      return (a.stanje || 0) - (b.stanje || 0)
    } else {
      const nazivA = a.naziv || ""
      const nazivB = b.naziv || ""
      return nazivA.localeCompare(nazivB)
    }
  })

  const dobijBojuReda = (stanje) => {
    if (stanje <= 10) return '#ffebee'
    if (stanje > 10 && stanje <= 50) return '#fff3e0'
    return '#ffffff'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Search Bar */}
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #ddd', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Pretraži lager..." 
          value={trazenaRec}
          onChange={(e) => setTrazenaRec(e.target.value)}
          style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
          autoFocus
        />
        <select 
          onChange={(e) => setSortiranje(e.target.value)}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', background: 'white', cursor: 'pointer' }}
        >
          <option value="naziv">Po Nazivu</option>
          <option value="stanje">Po Stanju</option>
        </select>
      </div>

      {/* Tabela */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#34495e', color: 'white', zIndex: 10 }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Šifra</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Naziv</th>
              <th style={{ padding: '15px' }}>Zapremina</th>
              <th style={{ padding: '15px' }}>Stanje</th>
              <th style={{ padding: '15px' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filtriraniLista.length > 0 ? (
              filtriraniLista.map((p) => (
                <tr 
                  key={p.id || Math.random()} // Fallback key ako nema ID-a
                  onClick={() => setOdabraniProizvod(p)}
                  style={{ backgroundColor: dobijBojuReda(p.stanje), borderBottom: '1px solid #eee', cursor: 'pointer', color: '#333' }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.id}</td>
                  <td style={{ padding: '12px' }}>{p.naziv}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{p.zapremina}</span></td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{p.stanje}</td>
                  <td style={{ padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProizvodZaIzmenu(p); }}
                      style={{ background: '#f39c12', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >✏️</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                      style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                  {proizvodi && proizvodi.length > 0 ? `Nema rezultata za "${trazenaRec}"` : "Lager je prazan ili se učitava..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {odabraniProizvod && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '500px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setOdabraniProizvod(null)} style={{ position: 'absolute', right: 15, top: 15, border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginTop: 0 }}>{odabraniProizvod.naziv}</h2>
            <p>Šifra: <b>{odabraniProizvod.id}</b></p>
            <p>Stanje: <b style={{ color: '#27ae60' }}>{odabraniProizvod.stanje} kom</b></p>
          </div>
        </div>
      )}

      {proizvodZaIzmenu && (
        <EditProductModal 
          proizvod={proizvodZaIzmenu} 
          onClose={() => setProizvodZaIzmenu(null)} 
          onSave={onUpdate} 
        />
      )}
    </div>
  )
}