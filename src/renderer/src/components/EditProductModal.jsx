import React, { useState } from 'react'

export default function EditProductModal({ proizvod, onClose, onSave }) {
  // Kopiramo podatke u lokalno stanje da bismo mogli da ih menjamo
  const [izmena, setIzmena] = useState({ ...proizvod })

  const sacuvaj = () => {
    onSave(izmena)
    onClose()
  }

  // Stilovi (isti kao pre)
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50', fontSize: '0.9em' }
  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '16px', color: '#333' }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '10px', width: '450px', padding: '0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#f39c12', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <h3 style={{ margin: 0 }}>✏️ Izmena Proizvoda</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        {/* Body */}
        <div style={{ padding: '25px' }}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Šifra (Ne može se menjati)</label>
            <input type="text" value={izmena.id} disabled style={{ ...inputStyle, background: '#eee', color: '#777' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Naziv Proizvoda</label>
            <input 
              type="text" 
              value={izmena.naziv} 
              onChange={(e) => setIzmena({...izmena, naziv: e.target.value})}
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Zapremina</label>
            <input 
              type="text" 
              value={izmena.zapremina} 
              onChange={(e) => setIzmena({...izmena, zapremina: e.target.value})}
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Koriguj Stanje (Ručno)</label>
            <input 
              type="number" 
              value={izmena.stanje} 
              onChange={(e) => setIzmena({...izmena, stanje: Number(e.target.value)})}
              style={inputStyle} 
            />
            <small style={{ color: '#e74c3c' }}>*Menjaj samo ako je greška u brojanju</small>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#95a5a6', color: 'white', cursor: 'pointer' }}>Otkaži</button>
            <button onClick={sacuvaj} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#27ae60', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>💾 Sačuvaj</button>
          </div>

        </div>
      </div>
    </div>
  )
}