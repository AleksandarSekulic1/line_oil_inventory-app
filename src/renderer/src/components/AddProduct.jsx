import React, { useState } from 'react'

export default function AddProduct({ onSave, proizvodi }) {
  // Resetujemo formu na početne vrednosti
  const [noviProizvod, setNoviProizvod] = useState({ id: '', naziv: '', zapremina: '', stanje: 0 })
  const [greska, setGreska] = useState('')

  const sacuvaj = () => {
    // Validacija praznih polja
    if (!noviProizvod.id || !noviProizvod.naziv || !noviProizvod.zapremina) {
      setGreska('Sva polja su obavezna!')
      return
    }

    // Provera duplikata (sa zaštitom da 'proizvodi' ne bude undefined)
    const postojeProizvodi = proizvodi || []
    if (postojeProizvodi.some(p => String(p.id) === String(noviProizvod.id))) {
      setGreska('Proizvod sa ovom šifrom već postoji!')
      return
    }
    
    // Slanje u App.js
    onSave(noviProizvod)
    
    // Resetovanje forme nakon uspešnog čuvanja
    setNoviProizvod({ id: '', naziv: '', zapremina: '', stanje: 0 })
    setGreska('')
  }

  // Stilovi
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '16px', color: '#333', background: '#fff' }

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        <h2 style={{ color: '#2c3e50', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          Unos Novog Proizvoda
        </h2>
        
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          
          {greska && (
            <div style={{ background: '#ff7675', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              ⚠️ {greska}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Šifra Proizvoda</label>
            <input 
              type="text" 
              placeholder="npr. 1234"
              value={noviProizvod.id}
              onChange={(e) => setNoviProizvod({...noviProizvod, id: e.target.value})}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Naziv Proizvoda</label>
            <input 
              type="text" 
              placeholder="npr. Motorno Ulje"
              value={noviProizvod.naziv}
              onChange={(e) => setNoviProizvod({...noviProizvod, naziv: e.target.value})}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Zapremina</label>
            <input 
              type="text" 
              placeholder="npr. 1L"
              value={noviProizvod.zapremina}
              onChange={(e) => setNoviProizvod({...noviProizvod, zapremina: e.target.value})}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Početno Stanje</label>
            <input 
              type="number" 
              value={noviProizvod.stanje}
              onChange={(e) => setNoviProizvod({...noviProizvod, stanje: Number(e.target.value)})}
              style={inputStyle}
            />
          </div>

          <button 
            onClick={sacuvaj}
            style={{ 
              width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(39, 174, 96, 0.2)'
            }}
          >
            💾 Sačuvaj Proizvod
          </button>

        </div>
      </div>
    </div>
  )
}