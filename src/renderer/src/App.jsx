import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AddProduct from './components/AddProduct'

function App() {
  const [aktivnaStranica, setAktivnaStranica] = useState('pocetna')
  const [proizvodi, setProizvodi] = useState([])

  const ucitajPodatke = async () => {
    try {
      console.log("Učitavam podatke...") // <--- OVO CE SE VIDETI U KONZOLI
      const data = await window.api.getProducts()
      console.log("Stigli podaci:", data.length) // <--- VIDECES KOLIKO IH IMA
      setProizvodi([...data])
    } catch (error) {
      console.error("Greška pri učitavanju:", error)
    }
  }

  useEffect(() => { ucitajPodatke() }, [])

  const obrisiProizvod = async (id) => {
    if (confirm('Obriši proizvod?')) {
      await window.api.deleteProduct(id)
      ucitajPodatke()
    }
  }

  const sacuvajNoviProizvod = async (noviProizvod) => {
    console.log("Čuvam proizvod:", noviProizvod)
    await window.api.addProduct(noviProizvod)
    await ucitajPodatke()
    setAktivnaStranica('pocetna')
  }

  const azurirajProizvod = async (izmenjenProizvod) => {
    console.log("Menjam proizvod:", izmenjenProizvod)
    await window.api.updateProduct(izmenjenProizvod)
    await ucitajPodatke()
    alert('Uspešna izmena!')
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