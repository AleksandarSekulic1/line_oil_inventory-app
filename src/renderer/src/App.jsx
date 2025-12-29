import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AddProduct from './components/AddProduct'
import DodajNaStanje from './components/DodajNaStanje'

// Pomocna funkcija za ID
const generateId = () => {
  return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Date.now().toString()
}

function App() {
  const [aktivnaStranica, setAktivnaStranica] = useState('pocetna')
  const [proizvodi, setProizvodi] = useState([])

  // --- GLAVNA FUNKCIJA ZA UCITAVANJE ---
  const ucitajPodatke = async () => {
    try {
      console.log("App.jsx: Osvežavam podatke iz baze...") // Debug ispis
      const data = await window.api.getProducts()
      
      if (Array.isArray(data)) {
        const sigurniPodaci = data.map((p) => ({
          ...p,
          id: p.id || generateId(),
          stanje: Number(p.stanje) || 0,
          cena: Number(p.cena) || 0
        }))
        
        // Bitno: React prepoznaje promenu samo ako je novi niz
        setProizvodi([...sigurniPodaci]) 
      } else {
        setProizvodi([])
      }
    } catch (error) {
      console.error('App.jsx Greška:', error)
      setProizvodi([])
    }
  }

  // Ucitaj podatke cim se aplikacija pokrene ili promeni stranica
  useEffect(() => {
    ucitajPodatke()
  }, [aktivnaStranica])

  // Funkcije za brisanje i dodavanje
  const obrisiProizvod = async (id) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      await window.api.deleteProduct(id)
      await ucitajPodatke() 
    }
  }

  const sacuvajNoviProizvod = async (noviProizvod) => {
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
        
        {/* LAGER LISTA */}
        {aktivnaStranica === 'pocetna' && (
          <Dashboard 
            proizvodi={proizvodi} 
            
            // --- OVO JE KLJUČNO! OVO JE FALILO ---
            // Ovim dajemo Dashboard-u daljinski upravljač da osveži sve
            osveziPodatke={ucitajPodatke} 
            // -------------------------------------
            
            onDelete={obrisiProizvod} 
            onUpdate={azurirajProizvod} 
          />
        )}

        {/* DODAJ NOVI PROIZVOD */}
        {aktivnaStranica === 'dodaj' && (
          <AddProduct 
            onSave={sacuvajNoviProizvod} 
            onCancel={() => setAktivnaStranica('pocetna')}
          />
        )}

        {/* DODAJ NA STANJE */}
        {aktivnaStranica === 'stanje' && (
          <DodajNaStanje />
        )}

      </div>
    </div>
  )
}

export default App