import React, { useState } from 'react'
import { Save, Upload, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Podesavanja() {
  const [poruka, setPoruka] = useState(null)
  const [tipPoruke, setTipPoruke] = useState('') // 'success' ili 'error'

  const handleExport = async () => {
    setPoruka("Pripremam podatke...")
    try {
      const res = await window.api.exportData()
      if (res.success) {
        setTipPoruke('success')
        setPoruka(res.message)
      } else {
        setTipPoruke('info') // Ako je otkazao
        setPoruka(res.message)
      }
    } catch (err) {
      setTipPoruke('error')
      setPoruka("Greška pri čuvanju.")
    }
  }

  const handleImport = async () => {
    const potvrda = confirm("UPOZORENJE: Ovo će spojiti podatke iz fajla sa trenutnim podacima.\n\nDuplikati (isti datum i količina) će biti ignorisani.\n\nDa li želite da nastavite?")
    if (!potvrda) return

    setPoruka("Učitavam i spajam podatke...")
    try {
      const res = await window.api.importData()
      if (res.success) {
        setTipPoruke('success')
        setPoruka(`${res.message} (Osveži aplikaciju ili idi na Početnu da vidiš promene)`)
      } else {
        setTipPoruke('error')
        setPoruka(res.message)
      }
    } catch (err) {
      setTipPoruke('error')
      setPoruka("Greška pri uvozu.")
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>⚙️ Podešavanja i Sigurnost</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
        
        {/* KARTICA ZA EXPORT */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{ background: '#e8f6f3', padding: '10px', borderRadius: '50%', color: '#27ae60' }}>
               <Save size={32} />
            </div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Sačuvaj podatke (Backup)</h2>
          </div>
          <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
            Napravite kopiju svih proizvoda, istorije ulaza i izlaza. <br/>
            Preporučujemo da ovo radite <strong>jednom nedeljno</strong> i čuvate na USB-u.
          </p>
          <button 
            onClick={handleExport}
            style={{ 
                background: '#27ae60', color: 'white', border: 'none', padding: '12px 25px', 
                borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' 
            }}
          >
            💾 Sačuvaj na računar
          </button>
        </div>

        {/* KARTICA ZA IMPORT */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{ background: '#fff5f5', padding: '10px', borderRadius: '50%', color: '#c0392b' }}>
               <Upload size={32} />
            </div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Učitaj podatke (Restore)</h2>
          </div>
          <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
            Uvezite podatke iz sačuvanog fajla. <br/>
            <strong>Pametan uvoz:</strong> Aplikacija će prepoznati i preskočiti duplikate (isti datum i količina).
          </p>
          <button 
            onClick={handleImport}
            style={{ 
                background: '#34495e', color: 'white', border: 'none', padding: '12px 25px', 
                borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' 
            }}
          >
            📂 Učitaj fajl
          </button>
        </div>

      </div>

      {/* STATUS PORUKA */}
      {poruka && (
        <div style={{ 
            marginTop: '30px', padding: '15px', borderRadius: '8px', 
            background: tipPoruke === 'success' ? '#d5f5e3' : (tipPoruke === 'error' ? '#fdedec' : '#e8f4fd'),
            color: tipPoruke === 'success' ? '#1e8449' : (tipPoruke === 'error' ? '#c0392b' : '#2980b9'),
            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'
        }}>
            {tipPoruke === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
            {poruka}
        </div>
      )}

    </div>
  )
}