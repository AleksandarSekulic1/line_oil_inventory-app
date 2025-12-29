import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AddProduct from './components/AddProduct'

function App() {
  const [aktivnaStranica, setAktivnaStranica] = useState('pocetna')
  const [proizvodi, setProizvodi] = useState([]) // Počinjemo sa praznim nizom

  const ucitajPodatke = async () => {
    try {
      const data = await window.api.getProducts()
      if (Array.isArray(data)) {
        setProizvodi([...data]) // Osvežavamo samo ako je niz validan
      } else {
        console.error("Podaci nisu niz:", data)
        setProizvodi([])
      }
    } catch (error) {
      console.error("Greška pri učitavanju:", error)
    }
  }

  useEffect(() => { ucitajPodatke() }, [])

  const obrisiProizvod = async (id) => {
    if (confirm('Da li ste sigurni?')) {
      await window.api.deleteProduct(id)
      await ucitajPodatke()
    }
  }

  const sacuvajNoviProizvod = async (noviProizvod) => {
    await window.api.addProduct(noviProizvod)
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
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        
        {aktivnaStranica === 'pocetna' && (
          <Dashboard 
            proizvodi={proizvodi} 
            onDelete={obrisiProizvod} 
            onUpdate={azurirajProizvod} 
          />
        )}

        {aktivnaStranica === 'dodaj' && (
          <AddProduct 
            onSave={sacuvajNoviProizvod} 
            proizvodi={proizvodi}
          />
        )}

      </div>
    </div>
  )
}

export default App