import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AddProduct from './components/AddProduct'
import DodajNaStanje from './components/DodajNaStanje' // <--- 1. IMPORT JE TU

const generateId = () => {
  // Koristi crypto.randomUUID ako postoji, inače koristi vreme
  return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Date.now().toString()
}

function App() {
  const [aktivnaStranica, setAktivnaStranica] = useState('pocetna')
  const [proizvodi, setProizvodi] = useState([])

  // Učitavanje i ČIŠĆENJE podataka
  const ucitajPodatke = async () => {
    try {
      const data = await window.api.getProducts()
      if (Array.isArray(data)) {
        // OBAVEZNO: Prolazimo kroz podatke i osiguravamo da svaki ima ID
        const sigurniPodaci = data.map((p) => ({
          ...p,
          id: p.id || generateId(),
          stanje: Number(p.stanje) || 0,
          cena: Number(p.cena) || 0
        }))
        setProizvodi(sigurniPodaci)
      } else {
        setProizvodi([])
      }
    } catch (error) {
      console.error('Greška pri učitavanju:', error)
      setProizvodi([])
    }
  }

  // --- BITNA IZMENA: Dodali smo [aktivnaStranica] ---
  // Ovo znaci: Kad god korisnik promeni stranicu (npr. sa "Dodaj na stanje" ode na "Pocetna"),
  // podaci se ponovo ucitavaju iz baze. Tako ce stanje uvek biti azurno!
  useEffect(() => {
    ucitajPodatke()
  }, [aktivnaStranica])

  const obrisiProizvod = async (id) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      await window.api.deleteProduct(id)
      await ucitajPodatke() // Osveži listu odmah
    }
  }

  const sacuvajNoviProizvod = async (noviProizvod) => {
    // Osiguraj da novi proizvod ima ID pre slanja
    const proizvodZaSlanje = {
      ...noviProizvod,
      id: noviProizvod.id || generateId()
    }
    await window.api.addProduct(proizvodZaSlanje)
    await ucitajPodatke()
    setAktivnaStranica('pocetna')
  }

  const azurirajProizvod = async (izmenjenProizvod) => {
    await window.api.updateProduct(izmenjenProizvod)
    await ucitajPodatke()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8' }}>
      <Sidebar aktivnaStranica={aktivnaStranica} setAktivnaStranica={setAktivnaStranica} />
      
      <div style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        {/* 1. STRANICA: LAGER LISTA */}
        {aktivnaStranica === 'pocetna' && (
          <Dashboard 
            proizvodi={proizvodi} 
            onDelete={obrisiProizvod} 
            onUpdate={azurirajProizvod} 
          />
        )}

        {/* 2. STRANICA: DODAJ NOVI PROIZVOD */}
        {aktivnaStranica === 'dodaj' && (
          <AddProduct 
            onSave={sacuvajNoviProizvod} 
            onCancel={() => setAktivnaStranica('pocetna')}
          />
        )}

        {/* 3. STRANICA: DODAJ NA STANJE (NOVO) */}
        {aktivnaStranica === 'stanje' && (
          <DodajNaStanje />
        )}

      </div>
    </div>
  )
}

export default App