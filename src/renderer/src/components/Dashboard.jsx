import React, { useState, useEffect } from 'react'
import EditProductModal from './EditProductModal'
import DetaljiModal from './DetaljiModal'

// --- KOMPONENTA ZA RED (Van glavne funkcije) ---
const RedTabele = ({ p, dobijBojuReda, naKlik, naIzmenu, naBrisanje }) => {
  const [hover, setHover] = useState(false)
  const trenutnaBoja = hover ? '#fff9c4' : dobijBojuReda(p.stanje)

  return (
    <tr 
      onClick={() => naKlik(p)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        backgroundColor: trenutnaBoja, 
        borderBottom: '1px solid #eee', 
        cursor: 'pointer', 
        color: '#333',
        transition: 'background-color 0.1s ease'
      }}
    >
      <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.id}</td>
      <td style={{ padding: '12px' }}>{p.naziv}</td>
      <td style={{ padding: '12px', textAlign: 'center' }}>{p.zapremina || '-'}</td>
      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: p.stanje <= 10 ? '#c0392b' : '#27ae60' }}>
        {p.stanje}
      </td>
      <td style={{ padding: '12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => naIzmenu(p)} style={{ marginRight: '8px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2em' }}>✏️</button>
        <button onClick={() => naBrisanje(p.id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2em' }}>🗑️</button>
      </td>
    </tr>
  )
}

export default function Dashboard({ proizvodi, onDelete, onUpdate, osveziPodatke }) {
  const [trazenaRec, setTrazenaRec] = useState("")
  const [sortiranje, setSortiranje] = useState("naziv")
  
  // Stanja za modale
  const [odabraniProizvod, setOdabraniProizvod] = useState(null) 
  const [proizvodZaIzmenu, setProizvodZaIzmenu] = useState(null)

  // --- OVO JE KLJUČNO ZA AZURIRANJE MODALA ---
  // Kada se "proizvodi" promene (jer je DetaljiModal pozvao osveziSve),
  // ovaj kod pronalazi novu verziju tog proizvoda i odmah je ubacuje u modal!
  useEffect(() => {
    if (odabraniProizvod) {
        // Nadji najnoviju verziju trenutno otvorenog proizvoda
        const osvezenProizvod = proizvodi.find(p => String(p.id) === String(odabraniProizvod.id))
        
        // Ako postoji (nije obrisan), azuriraj modal
        if (osvezenProizvod) {
            setOdabraniProizvod(osvezenProizvod)
        }
    }
  }, [proizvodi]) // Prati svaku promenu u glavnoj listi

  // Filtriranje
  const filtriraniLista = (proizvodi || []).filter(p => {
    if (!p) return false
    const term = trazenaRec.toLowerCase()
    const naziv = p.naziv ? String(p.naziv).toLowerCase() : ""
    const sifra = p.id ? String(p.id).toLowerCase() : ""
    return naziv.includes(term) || sifra.includes(term)
  }).sort((a, b) => {
    if (sortiranje === 'stanje') {
      return (a.stanje || 0) - (b.stanje || 0)
    } else {
      return (a.naziv || "").localeCompare(b.naziv || "")
    }
  })

  const dobijBojuReda = (stanje) => {
    if (stanje === undefined || stanje === null) return '#ffffff';
    if (stanje <= 10) return '#ffebee' 
    if (stanje > 10 && stanje <= 50) return '#fff3e0' 
    return '#ffffff' 
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* PRETRAGA */}
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #ddd', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Pretraži lager..." 
          value={trazenaRec}
          onChange={(e) => setTrazenaRec(e.target.value)} 
          style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }}
        />
        <select 
          value={sortiranje}
          onChange={(e) => setSortiranje(e.target.value)}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', background: 'white', cursor: 'pointer' }}
        >
          <option value="naziv">Sortiraj: Naziv</option>
          <option value="stanje">Sortiraj: Stanje</option>
        </select>
      </div>

      {/* TABELA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#34495e', color: 'white', zIndex: 10 }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Šifra</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Naziv</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Zapremina</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Stanje</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filtriraniLista.length > 0 ? (
              filtriraniLista.map((p) => (
                <RedTabele 
                  key={p.id} 
                  p={p} 
                  dobijBojuReda={dobijBojuReda}
                  naKlik={setOdabraniProizvod}
                  naIzmenu={setProizvodZaIzmenu}
                  naBrisanje={onDelete}
                />
              ))
            ) : (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nema rezultata</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {proizvodZaIzmenu && (
        <EditProductModal 
          proizvod={proizvodZaIzmenu} 
          onClose={() => setProizvodZaIzmenu(null)} 
          onSave={onUpdate} 
        />
      )}

      {odabraniProizvod && (
        <DetaljiModal 
            proizvod={odabraniProizvod} 
            onClose={() => setOdabraniProizvod(null)}
            osveziSve={osveziPodatke} // Prosleđujemo funkciju za osvežavanje
        />
      )}

    </div>
  )
}