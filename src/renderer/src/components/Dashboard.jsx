import React, { useState, useMemo } from 'react'
import EditProductModal from './EditProductModal'
import DetaljiModal from './DetaljiModal'

// --- KOMPONENTA ZA RED ---
const RedTabele = ({ p, dobijBojuReda, naKlik, naIzmenu, naBrisanje }) => {
  const [hover, setHover] = useState(false)
  const trenutnaBoja = hover ? '#4f944bff' : dobijBojuReda(p.stanje)

  return (
    <tr 
      onClick={() => naKlik(p.id)} 
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
        <button onClick={() => naIzmenu(p)} style={{ marginRight: '10px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2em' }} title="Izmeni">✏️</button>
        <button onClick={() => naBrisanje(p.id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2em' }} title="Obriši">🗑️</button>
      </td>
    </tr>
  )
}

// --- GLAVNA KOMPONENTA ---
export default function Dashboard({ proizvodi, onDelete, onUpdate, osveziPodatke }) {
  const [trazenaRec, setTrazenaRec] = useState("")
  const [sortiranje, setSortiranje] = useState("naziv")
  
  const [odabraniProizvodId, setOdabraniProizvodId] = useState(null) 
  const [proizvodZaIzmenu, setProizvodZaIzmenu] = useState(null)

  // --- OVO REŠAVA ZALEĐIVANJE EKRANA ---
  const handleBrisanje = async (id) => {
    // 1. Resetuj selekciju da ne bi puklo ako je taj otvoren
    if (odabraniProizvodId === id) setOdabraniProizvodId(null);
    
    // 2. Pozovi brisanje
    await onDelete(id);

    // 3. TRIK: Simuliraj promenu veličine prozora da "probudiš" Electron
    // Ovo rešava problem gde moraš da minimizuješ da bi video promene
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  // --- LOGIKA PRIKAZA ---
  const odabraniProizvod = useMemo(() => {
    if (!odabraniProizvodId) return null;
    return proizvodi.find(p => String(p.id) === String(odabraniProizvodId)) || null;
  }, [proizvodi, odabraniProizvodId]);

  const filtriraniLista = useMemo(() => {
    const term = trazenaRec.toLowerCase()
    return (proizvodi || []).filter(p => {
        if (!p) return false
        const naziv = (p.naziv || "").toLowerCase()
        const sifra = String(p.id || "").toLowerCase()
        return naziv.includes(term) || sifra.includes(term)
    }).sort((a, b) => {
        if (sortiranje === 'stanje') {
          return (a.stanje || 0) - (b.stanje || 0)
        } else {
          return (a.naziv || "").localeCompare(b.naziv || "")
        }
    })
  }, [proizvodi, trazenaRec, sortiranje])

  const dobijBojuReda = (stanje) => {
    if (stanje === undefined || stanje === null) return '#ffffff';
    if (stanje <= 10) return '#eca0acff' 
    if (stanje > 10 && stanje <= 50) return '#cdaf7fff' 
    return '#ffffff' 
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* PRETRAGA */}
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #ddd', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Pretraži (naziv ili šifra)..." 
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
                  naKlik={setOdabraniProizvodId}
                  naIzmenu={setProizvodZaIzmenu}
                  naBrisanje={handleBrisanje} // <-- KORISTIMO NOVU FUNKCIJU
                />
              ))
            ) : (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>Nema rezultata za "{trazenaRec}"</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* MODALI */}
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
            onClose={() => setOdabraniProizvodId(null)}
            osveziSve={osveziPodatke} 
        />
      )}

    </div>
  )
}