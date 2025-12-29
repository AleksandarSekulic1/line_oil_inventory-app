import React, { useState, useEffect } from 'react'

export default function SkiniSaStanja() {
  const [proizvodi, setProizvodi] = useState([])
  const [odabraniId, setOdabraniId] = useState('')
  const [kolicina, setKolicina] = useState('')
  
  // Podaci o prodaji
  const [kupac, setKupac] = useState('')
  const [adresa, setAdresa] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]) // Datum transakcije
  const [datumIsporuke, setDatumIsporuke] = useState('') // <--- NOVO: Datum isporuke
  
  const [statusPoruka, setStatusPoruka] = useState(null)

  useEffect(() => {
    ucitajProizvode()
  }, [])

  const ucitajProizvode = async () => {
    const data = await window.api.getProducts()
    setProizvodi(data || [])
  }

  const sacuvajPromenu = async (e) => {
    e.preventDefault()
    setStatusPoruka(null)

    // Validacija - DODAT DATUM ISPORUKE
    if (!odabraniId || !kolicina || !kupac || !datumIsporuke) {
      setStatusPoruka({ tip: 'greska', tekst: "Obavezna polja: Proizvod, Količina, Kupac i Datum Isporuke!" })
      return
    }

    const selektovani = proizvodi.find(p => String(p.id) === String(odabraniId))
    if (selektovani && parseInt(kolicina) > selektovani.stanje) {
       setStatusPoruka({ tip: 'greska', tekst: `Greška: Imate samo ${selektovani.stanje} na stanju!` })
       return
    }

    try {
      await window.api.removeStockEntry({
        proizvodId: odabraniId,
        kolicina: kolicina,
        datum: datum,
        kupac: kupac,
        adresa: adresa,
        datumIsporuke: datumIsporuke // <--- SALJEMO NOVI PODATAK
      })

      setStatusPoruka({ tip: 'uspeh', tekst: `✅ Uspešno skinuto: ${kolicina} kom!` })
      
      // Reset polja
      setKolicina('')
      // Ostavljamo kupca i datume za brzi unos sledece stavke
      
      await ucitajProizvode() 

    } catch (error) {
      console.error("Greska:", error)
      setStatusPoruka({ tip: 'greska', tekst: error.message.replace('Error invoking remote method:', '') })
    }
  }

  const selektovaniProizvod = proizvodi.find(p => String(p.id) === String(odabraniId))

  return (
    <div style={{ padding: '40px', color: '#2c3e50', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '30px', color: '#c0392b' }}>📉 Prodaja / Skidanje</h1>
        
        <form onSubmit={sacuvajPromenu} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          
          {/* PROIZVOD */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Izaberi Proizvod:</label>
            <select 
              value={odabraniId} 
              onChange={(e) => setOdabraniId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '16px', background: 'white' }}
            >
              <option value="">-- Izaberi --</option>
              {proizvodi.map(p => (
                <option key={p.id} value={p.id} disabled={p.stanje <= 0} style={{ color: p.stanje <= 0 ? 'lightgray' : 'black'}}>
                  {p.naziv} ({p.zapremina}) - Stanje: {p.stanje}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            {/* DATUM TRANSAKCIJE */}
            <div style={{ marginBottom: '20px', flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Datum knjiženja:</label>
                <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            </div>

            {/* KOLICINA */}
            <div style={{ marginBottom: '20px', flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Količina {selektovaniProizvod ? `(max: ${selektovaniProizvod.stanje})` : ''}:
                </label>
                <input 
                type="number" 
                placeholder="0"
                value={kolicina}
                onChange={(e) => setKolicina(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
                />
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
          
          {/* KUPAC */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ime Kupca (Obavezno):</label>
            <input 
              type="text" 
              placeholder="npr. Marko Marković"
              value={kupac}
              onChange={(e) => setKupac(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
            />
          </div>

          {/* DATUM ISPORUKE (NOVO) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#c0392b' }}>Datum Isporuke (Obavezno):</label>
            <input 
                type="date" 
                value={datumIsporuke} 
                onChange={(e) => setDatumIsporuke(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', backgroundColor: '#fff5f5' }} 
            />
          </div>

          {/* ADRESA */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Adresa Isporuke (Opciono):</label>
            <input 
              type="text" 
              placeholder="npr. Kralja Petra 12, Beograd"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
          >
            📉 Skini sa Stanja
          </button>

          {statusPoruka && (
            <div style={{ 
                marginTop: '20px', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold',
                backgroundColor: statusPoruka.tip === 'greska' ? '#fadbd8' : '#d4efdf',
                color: statusPoruka.tip === 'greska' ? '#c0392b' : '#1e8449'
            }}>
                {statusPoruka.tekst}
            </div>
          )}

        </form>
      </div>
    </div>
  )
}