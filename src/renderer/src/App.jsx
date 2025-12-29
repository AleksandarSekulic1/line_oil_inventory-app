import { useEffect, useState } from 'react'

function App() {
  const [proizvodi, setProizvodi] = useState([])
  const [filtriraniProizvodi, setFiltriraniProizvodi] = useState([])
  const [odabraniProizvod, setOdabraniProizvod] = useState(null)
  const [trazenaRec, setTrazenaRec] = useState("")
  const [sortiranje, setSortiranje] = useState("naziv") // 'naziv' ili 'stanje'

  // Učitavanje podataka
  useEffect(() => {
    const ucitajPodatke = async () => {
      const data = await window.api.getProducts()
      setProizvodi(data)
      setFiltriraniProizvodi(data)
    }
    ucitajPodatke()
  }, [])

  // Logika za filtriranje i sortiranje
  useEffect(() => {
    let rezultat = proizvodi.filter(p => 
      p.naziv.toLowerCase().includes(trazenaRec.toLowerCase()) || 
      p.id.toLowerCase().includes(trazenaRec.toLowerCase())
    )

    if (sortiranje === 'stanje') {
      rezultat.sort((a, b) => a.stanje - b.stanje)
    } else {
      rezultat.sort((a, b) => a.naziv.localeCompare(b.naziv))
    }

    setFiltriraniProizvodi(rezultat)
  }, [trazenaRec, sortiranje, proizvodi])

  // Funkcija koja određuje boju reda na osnovu stanja
  const dobijBojuReda = (stanje) => {
    if (stanje <= 10) return '#ffebee' // Crvenkasta (Alarmantno)
    if (stanje > 10 && stanje <= 50) return '#fff3e0' // Narandžasta (Upozorenje)
    return '#ffffff' // Bela (OK)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8', color: '#333' }}>
      
      {/* --- ZAGLAVLJE I FILTERI --- */}
      <div style={{ padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 2 }}>
        <h1 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📦 Lista proizvoda - Line Oil</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 Pretraži po nazivu ili šifri..." 
            value={trazenaRec}
            onChange={(e) => setTrazenaRec(e.target.value)}
            style={{ 
              flex: 1, padding: '10px', fontSize: '16px', borderRadius: '5px', 
              border: '1px solid #ccc', outline: 'none' 
            }}
          />
          <select 
            onChange={(e) => setSortiranje(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}
          >
            <option value="naziv">Sortiraj po Nazivu</option>
            <option value="stanje">Sortiraj po Stanju (Najmanje prvo)</option>
          </select>
        </div>
      </div>

      {/* --- TABELA --- */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#34495e', color: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #455a64' }}>Šifra</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #455a64' }}>Naziv Proizvoda</th>
              <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #455a64' }}>Zapremina</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Stanje</th>
            </tr>
          </thead>
          <tbody>
            {filtriraniProizvodi.map((p) => (
              <tr 
                key={p.id} 
                onClick={() => setOdabraniProizvod(p)}
                style={{ 
                  backgroundColor: dobijBojuReda(p.stanje), 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #ddd',
                  color: '#000' // Osiguravamo crnu boju teksta
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'} // Efekat na hover
                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#555' }}>{p.id}</td>
                <td style={{ padding: '12px', fontSize: '1.05em' }}>{p.naziv}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ 
                    backgroundColor: '#e0e0e0', color: '#333', 
                    padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' 
                  }}>
                    {p.zapremina}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
                  {p.stanje} kom
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL (POPUP DETALJI) --- */}
      {odabraniProizvod && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', padding: '0', borderRadius: '12px', 
            width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            
            {/* Header Modala */}
            <div style={{ backgroundColor: '#34495e', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.4em' }}>Detalji Proizvoda</h2>
              <button 
                onClick={() => setOdabraniProizvod(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Sadržaj Modala */}
            <div style={{ padding: '30px', color: '#333' }}>
              
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <span style={{ color: '#777', fontSize: '0.9em' }}>NAZIV PROIZVODA:</span>
                <h3 style={{ margin: '5px 0', fontSize: '1.6em', color: '#2c3e50' }}>{odabraniProizvod.naziv}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ color: '#777', fontSize: '0.9em' }}>ŠIFRA</span>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{odabraniProizvod.id}</div>
                </div>
                
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ color: '#777', fontSize: '0.9em' }}>ZAPREMINA</span>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{odabraniProizvod.zapremina}</div>
                </div>

                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', gridColumn: 'span 2', textAlign: 'center' }}>
                  <span style={{ color: '#1565c0', fontSize: '0.9em', fontWeight: 'bold' }}>TRENUTNO STANJE</span>
                  <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1565c0' }}>
                    {odabraniProizvod.stanje} <span style={{ fontSize: '0.5em' }}>kom</span>
                  </div>
                </div>
              </div>

              {/* Ovde cemo uskoro dodati dugmice za + i - */}
              <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button 
                   onClick={() => setOdabraniProizvod(null)}
                   style={{ padding: '10px 25px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
                >
                  Zatvori
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App