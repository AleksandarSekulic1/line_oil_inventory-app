import React, { useState, useEffect } from 'react'

export default function DodajNaStanje() {
  const [proizvodi, setProizvodi] = useState([])
  const [odabraniId, setOdabraniId] = useState('')
  const [kolicina, setKolicina] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]) // Danasnji datum
  const [statusPoruka, setStatusPoruka] = useState(null) // Za prikaz poruke umesto alerta

  useEffect(() => {
    ucitajProizvode()
  }, [])

  const ucitajProizvode = async () => {
    try {
        const data = await window.api.getProducts()
        setProizvodi(data || [])
    } catch (err) {
        console.error("Greska pri ucitavanju proizvoda:", err)
    }
  }

  const sacuvajPromenu = async (e) => {
    e.preventDefault()
    setStatusPoruka(null) // Resetujemo poruku pre slanja

    // Validacija
    if (!odabraniId || !kolicina) {
        setStatusPoruka({ tip: 'greska', tekst: "Popunite sva polja!" })
        return
    }

    try {
        await window.api.addStockEntry({
          proizvodId: odabraniId,
          kolicina: kolicina,
          datum: datum,
          tip: 'ulaz'
        })

        // 1. Prikazi uspesnu poruku
        setStatusPoruka({ tip: 'uspeh', tekst: `✅ Uspešno dodato: ${kolicina} kom!` })
        
        // 2. Resetuj SAMO kolicinu (proizvod ostaje selektovan za brzi unos)
        setKolicina('')
        
        // 3. Osvezi listu proizvoda da se vidi novo stanje u padajucoj listi
        await ucitajProizvode()
        
    } catch (error) {
        console.error("Greska na frontendu:", error)
        setStatusPoruka({ tip: 'greska', tekst: "Došlo je do greške prilikom čuvanja." })
    }
  }

  // Pronalazimo trenutno selektovan proizvod da bi znali ime
  const selektovaniProizvod = proizvodi.find(p => String(p.id) === String(odabraniId))

  return (
    <div style={{ padding: '40px', color: '#2c3e50', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '30px' }}>📦 Ažuriranje Stanja</h1>
        
        <form onSubmit={sacuvajPromenu} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Izaberi Proizvod:</label>
            <select 
              value={odabraniId} 
              onChange={(e) => setOdabraniId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '16px', backgroundColor: 'white' }}
            >
              <option value="">-- Izaberi --</option>
              {proizvodi.map(p => (
                <option key={p.id} value={p.id}>
                  {p.naziv} ({p.zapremina}) - Trenutno: {p.stanje}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Datum promene:</label>
            <input 
              type="date" 
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '16px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Količina (kom/l) {selektovaniProizvod ? `za ${selektovaniProizvod.naziv}` : ''}:
            </label>
            <input 
              type="number" 
              placeholder="Unesi količinu (npr. 10)"
              value={kolicina}
              onChange={(e) => setKolicina(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '16px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', transition: 'opacity 0.2s' }}
          >
            💾 Sačuvaj Promenu
          </button>

          {/* STATUS PORUKA (Umesto iritantnog alerta) */}
          {statusPoruka && (
            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
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