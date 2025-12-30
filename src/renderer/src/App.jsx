import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AddProduct from './components/AddProduct'
import DodajNaStanje from './components/DodajNaStanje'
import SkiniSaStanja from './components/SkiniSaStanja'
import Isporuke from './components/Isporuke'

// Pomocna funkcija za ID (koristi se samo ako bas mora)
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
      // console.log("App.jsx: Osvežavam podatke iz baze...") 
      const data = await window.api.getProducts()
      
      if (Array.isArray(data)) {
        const sigurniPodaci = data.map((p, index) => ({
          ...p,
          // --- POPRAVKA ZA STABILNOST ---
          // Ako proizvod nema ID, koristimo 'temp-index' umesto random broja.
          // Ovo sprečava da React misli da su svi podaci novi i da "zabode".
          id: p.id ? String(p.id) : `temp-${index}`, 
          stanje: Number(p.stanje) || 0,
          cena: Number(p.cena) || 0
        }))
        
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

  // --- FUNKCIJA ZA BRISANJE (POPRAVLJENA) ---
  const obrisiProizvod = async (id) => {
    // UKLONIO SAM "confirm" JER ON ZAMRZAVA EKRAN U ELECTRONU!
    // Kasnije možemo napraviti lepši React modal za potvrdu.
    // if (confirm('Da li ste sigurni...')) { ... } <--- OVO JE PRAVILO PROBLEM
    
    try {
        await window.api.deleteProduct(id)
        // Odmah nakon brisanja osvežavamo podatke
        await ucitajPodatke() 
    } catch (err) {
        console.error("Greška pri brisanju:", err)
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
            osveziPodatke={ucitajPodatke} 
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

        {/* SKINI SA STANJA / PRODAJA */}
        {aktivnaStranica === 'prodaja' && (
          <SkiniSaStanja />
        )}
        
        {/* ISPORUKE */}
        {aktivnaStranica === 'isporuke' && (
          <Isporuke />
        )}

      </div>
    </div>
  )
}

export default App