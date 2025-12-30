// src/renderer/src/components/Sidebar.jsx
import React from 'react'

export default function Sidebar({ aktivnaStranica, setAktivnaStranica }) {
  const dugmeStil = (stranica) => ({
    width: '100%',
    padding: '15px 20px',
    textAlign: 'left',
    background: aktivnaStranica === stranica ? '#34495e' : 'transparent',
    color: '#ecf0f1', // Svetlo siva slova
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '5px',
    borderRadius: '8px',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  })

  return (
    <div style={{ 
      width: '260px', 
      backgroundColor: '#2c3e50', 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', // Fiksna visina
      flexShrink: 0 // Ne dozvoljava sužavanje
    }}>
      <div style={{ padding: '30px 20px', borderBottom: '1px solid #34495e' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Line Oil</h2>
        <small style={{ color: '#95a5a6' }}>Inventory v1.0</small>
      </div>
      
      <nav style={{ padding: '20px', flex: 1 }}>
        <button 
          onClick={() => setAktivnaStranica('pocetna')}
          style={dugmeStil('pocetna')}
        >
          🏠 Lager Lista
        </button>
        <button 
          onClick={() => setAktivnaStranica('dodaj')}
          style={dugmeStil('dodaj')}
        >
          ➕ Dodaj Proizvod
        </button>
        <button 
          onClick={() => setAktivnaStranica('stanje')}
          style={dugmeStil('stanje')}
        >
          📦 Dodaj na Stanje
        </button>
        <button 
          onClick={() => setAktivnaStranica('prodaja')}
          style={{ ...dugmeStil('prodaja') }} 
        >
          📉 Skini / Prodaj
        </button>
        <button 
          onClick={() => setAktivnaStranica('isporuke')}
          style={{ ...dugmeStil('isporuke') }} 
        >
          🚚 Isporuke & Računi
        </button>

        {/* --- NOVO DUGME ZA IZVEŠTAJE --- */}
        <div style={{ margin: '15px 0', borderTop: '1px solid #34495e' }}></div>
        
        <button 
          onClick={() => setAktivnaStranica('izvestaji')}
          style={{ ...dugmeStil('izvestaji')}} // Zlatkasta boja da se istakne
        >
          📊 Izveštaji
        </button>

        <button 
          onClick={() => setAktivnaStranica('podesavanja')}
          style={{ ...dugmeStil('podesavanja'), marginTop: 'auto' }} // auto ga gura na dno ako je flex kontejner
        >
          ⚙️ Podešavanja
        </button>

      </nav>

      <div style={{ padding: '20px', fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>
        &copy; 2026  Line  Oil  System, Application created by Aleksandar Sekulic
      </div>
    </div>
  )
}