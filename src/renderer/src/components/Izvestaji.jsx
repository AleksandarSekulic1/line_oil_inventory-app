import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History,
  Box,
  Calendar,
  Search
} from 'lucide-react';

export default function Izvestaji() {
  // --- STATE ---
  const [proizvodi, setProizvodi] = useState([]);
  const [odabraniProizvodId, setOdabraniProizvodId] = useState('');
  
  const [tipIzvestaja, setTipIzvestaja] = useState('sve'); // 'sve', 'ulaz', 'izlaz'
  const [period, setPeriod] = useState('mesecni'); 
  const [odabraniDatum, setOdabraniDatum] = useState(new Date().toISOString().slice(0, 10));
  
  const [istorija, setIstorija] = useState([]);
  const [filtriraniPodaci, setFiltriraniPodaci] = useState([]);

  // 1. UCITAJ SVE PROIZVODE ZA PADAJUCI MENI
  useEffect(() => {
    const ucitaj = async () => {
      const data = await window.api.getProducts();
      setProizvodi(data || []);
    };
    ucitaj();
  }, []);

  // 2. KAD SE ODABERE PROIZVOD, UCITAJ NJEGOVU ISTORIJU
  useEffect(() => {
    const ucitajIstoriju = async () => {
      if (!odabraniProizvodId) {
        setIstorija([]);
        return;
      }
      const data = await window.api.getProductHistory(odabraniProizvodId);
      setIstorija(data || []);
    };
    ucitajIstoriju();
  }, [odabraniProizvodId]);

  // 3. FILTRIRANJE PODATAKA (Tip + Period)
  useEffect(() => {
    if (!istorija.length) {
      setFiltriraniPodaci([]);
      return;
    }

    let temp = istorija.filter(stavka => {
        // Filter po TIPU
        const kol = parseInt(stavka.kolicina);
        if (tipIzvestaja === 'ulaz' && kol <= 0) return false;
        if (tipIzvestaja === 'izlaz' && kol >= 0) return false;
        
        // Filter po DATUMU
        const datumStavke = stavka.datum.substring(0, 10);
        if (period === 'dnevni') {
            return datumStavke === odabraniDatum;
        }
        if (period === 'mesecni') {
            return datumStavke.substring(0, 7) === odabraniDatum.substring(0, 7);
        }
        if (period === 'godisnji') {
            return datumStavke.substring(0, 4) === odabraniDatum.substring(0, 4);
        }
        return true;
    });

    // Sortiranje: Najnovije gore
    temp.sort((a, b) => new Date(b.datum) - new Date(a.datum));
    setFiltriraniPodaci(temp);

  }, [istorija, tipIzvestaja, period, odabraniDatum]);

  // --- FUNKCIJA ZA FORMATIRANJE DATUMA (za prikaz) ---
  const formatDatumPrikaz = () => {
    if (period === 'dnevni') return odabraniDatum;
    if (period === 'godisnji') return odabraniDatum.substring(0, 4);
    // Mesecni
    const [g, m] = odabraniDatum.split('-');
    const imena = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
    return `${imena[parseInt(m)-1]} ${g}`;
  };

  // --- STAMPA ---
  const handlePrint = () => {
    if (!odabraniProizvodId) return alert("Molimo izaberite proizvod.");
    
    const proizvodInfo = proizvodi.find(p => String(p.id) === String(odabraniProizvodId));
    if (!proizvodInfo) return;

    // --- LOGIKA ZA SUMIRANJE (NOVO) ---
    let statistikaHTML = '';

    if (tipIzvestaja === 'sve') {
        // Ako je izabrano SVE, razdvajamo Ulaz i Izlaz
        const totalUlaz = filtriraniPodaci.reduce((acc, curr) => parseInt(curr.kolicina) > 0 ? acc + parseInt(curr.kolicina) : acc, 0);
        const totalIzlaz = filtriraniPodaci.reduce((acc, curr) => parseInt(curr.kolicina) < 0 ? acc + Math.abs(parseInt(curr.kolicina)) : acc, 0); // Absolutna vrednost za prikaz
        const neto = totalUlaz - totalIzlaz;

        statistikaHTML = `
            <div style="margin-top: 20px; border-top: 2px dashed #ccc; padding-top: 10px;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
                    <span style="margin-right: 10px;">📥 UKUPAN ULAZ:</span>
                    <strong style="color: #27ae60;">+${totalUlaz}</strong>
                </div>
                <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
                    <span style="margin-right: 10px;">📤 UKUPAN IZLAZ:</span>
                    <strong style="color: #c0392b;">-${totalIzlaz}</strong>
                </div>
                <div style="display: flex; justify-content: flex-end; font-size: 18px; margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px;">
                    <span style="margin-right: 10px;">∑ NETO PROMENA:</span>
                    <strong>${neto > 0 ? '+' : ''}${neto}</strong>
                </div>
            </div>
        `;
    } else {
        // Ako je samo Ulaz ili samo Izlaz
        const suma = filtriraniPodaci.reduce((acc, curr) => acc + parseInt(curr.kolicina), 0);
        const boja = suma > 0 ? '#27ae60' : '#c0392b';
        const prefiks = suma > 0 ? '+' : '';
        
        statistikaHTML = `
            <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; border-top: 2px dashed #ccc; padding-top: 10px;">
                UKUPNO U PERIODU: <span style="color: ${boja};">${prefiks}${suma}</span>
            </div>
        `;
    }

    const naslovTipa = 
        tipIzvestaja === 'sve' ? '📦 KARTICA PROIZVODA (KOMPLETNA ISTORIJA)' : 
        (tipIzvestaja === 'ulaz' ? '📥 IZVEŠTAJ O ULAZU ROBE' : '📤 IZVEŠTAJ O IZLAZU ROBE');

    // Generisanje redova tabele
    const redoviHTML = filtriraniPodaci.map(s => {
        const kolicina = parseInt(s.kolicina);
        const jeUlaz = kolicina > 0;
        const boja = jeUlaz ? '#27ae60' : '#c0392b';
        const znak = jeUlaz ? '+' : '';
        const ikona = jeUlaz ? '📥' : '📤';

        return `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.datum}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${ikona} <strong>${jeUlaz ? 'NABAVKA / KOREKCIJA' : 'ISPORUKA'}</strong><br/>
                    <small style="color: #666;">${s.kupac || s.adresa || '-'}</small>
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: ${boja}; font-weight: bold;">
                    ${znak}${kolicina}
                </td>
            </tr>
        `;
    }).join('');

    const htmlSadrzaj = `
      <html>
        <head>
          <title>Izveštaj - ${proizvodInfo.naziv}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #3498db; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { text-align: left; background: #f0f0f0; padding: 10px; border-bottom: 2px solid #ccc; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LINE OIL</h1>
            <p>${naslovTipa}</p>
          </div>

          <div class="info-box">
            <div class="info-grid">
                <div>
                    <strong>PROIZVOD:</strong> ${proizvodInfo.naziv}<br/>
                    <strong>ZAPREMINA:</strong> ${proizvodInfo.zapremina}<br/>
                    <strong>ŠIFRA:</strong> ${proizvodInfo.id}
                </div>
                <div style="text-align: right;">
                    <strong>PERIOD:</strong> ${formatDatumPrikaz()}<br/>
                    <strong>TRENUTNO STANJE NA LAGERU:</strong> <span style="font-size: 18px; color: #2980b9;">${proizvodInfo.stanje}</span>
                </div>
            </div>
          </div>

          <table>
            <thead>
                <tr>
                    <th>📅 Datum</th>
                    <th>📝 Opis Promene</th>
                    <th style="text-align: right;">⚖️ Količina</th>
                </tr>
            </thead>
            <tbody>
                ${filtriraniPodaci.length > 0 ? redoviHTML : '<tr><td colspan="3" style="text-align:center; padding: 20px;">Nema promena u ovom periodu.</td></tr>'}
            </tbody>
          </table>

          ${statistikaHTML}

          <div class="footer">
            Generisano: ${new Date().toLocaleString()}<br/>
            Line Oil Inventory System
          </div>
        </body>
      </html>
    `;

    // Iframe trik za stampu
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(htmlSadrzaj); doc.close();
    iframe.onload = () => { iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => document.body.removeChild(iframe), 1000); };
  };

  return (
    <div style={{ padding: '30px', height: '100vh', overflowY: 'auto', backgroundColor: '#ecf0f1', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          📊 Izveštaji o Proizvodima
        </h1>
      </div>

      {/* --- GLAVNA FORMA ZA GENERISANJE --- */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. RED - TIP IZVESTAJA */}
        <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>1. Odaberi vrstu promene</label>
            <div style={{ display: 'flex', gap: '15px' }}>
                <OpcijaDugme 
                    label="Kompletna Istorija" 
                    subLabel="(Ulaz + Izlaz)"
                    icon={<History size={20}/>} 
                    active={tipIzvestaja === 'sve'} 
                    onClick={() => setTipIzvestaja('sve')} 
                    color="#34495e"
                />
                <OpcijaDugme 
                    label="Samo Ulaz" 
                    subLabel="(Nabavka)"
                    icon={<ArrowDownCircle size={20}/>} 
                    active={tipIzvestaja === 'ulaz'} 
                    onClick={() => setTipIzvestaja('ulaz')} 
                    color="#27ae60" 
                />
                <OpcijaDugme 
                    label="Samo Izlaz" 
                    subLabel="(Prodaja)"
                    icon={<ArrowUpCircle size={20}/>} 
                    active={tipIzvestaja === 'izlaz'} 
                    onClick={() => setTipIzvestaja('izlaz')} 
                    color="#c0392b" 
                />
            </div>
        </div>

        {/* 2. RED - ODABIR PROIZVODA (DROPDOWN) */}
        <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>2. Izaberi Proizvod</label>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6' }} />
                <select 
                    value={odabraniProizvodId}
                    onChange={(e) => setOdabraniProizvodId(e.target.value)}
                    style={{ 
                        width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', 
                        border: '1px solid #bdc3c7', fontSize: '16px', outline: 'none',
                        cursor: 'pointer', backgroundColor: '#fdfdfd', color: '#2c3e50'
                    }}
                >
                    <option value="">-- Izaberi proizvod sa lagera --</option>
                    {proizvodi.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.naziv} ({p.zapremina}) - Stanje: {p.stanje}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* 3. RED - PERIOD I DATUM */}
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>3. Vremenski Period</label>
                <div style={{ display: 'flex', border: '1px solid #bdc3c7', borderRadius: '8px', overflow: 'hidden' }}>
                    <button onClick={() => setPeriod('dnevni')} style={{ flex: 1, padding: '10px', border: 'none', background: period === 'dnevni' ? '#34495e' : 'white', color: period === 'dnevni' ? 'white' : '#333', cursor: 'pointer' }}>Dnevni</button>
                    <button onClick={() => setPeriod('mesecni')} style={{ flex: 1, padding: '10px', borderLeft: '1px solid #bdc3c7', borderRight: '1px solid #bdc3c7', borderTop:'none', borderBottom:'none', background: period === 'mesecni' ? '#34495e' : 'white', color: period === 'mesecni' ? 'white' : '#333', cursor: 'pointer' }}>Mesečni</button>
                    <button onClick={() => setPeriod('godisnji')} style={{ flex: 1, padding: '10px', border: 'none', background: period === 'godisnji' ? '#34495e' : 'white', color: period === 'godisnji' ? 'white' : '#333', cursor: 'pointer' }}>Godišnji</button>
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>Odaberi Datum / Mesec / Godinu</label>
                <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6' }} />
                    <input 
                        type={period === 'mesecni' ? 'month' : (period === 'godisnji' ? 'number' : 'date')} 
                        value={period === 'godisnji' ? odabraniDatum.substring(0,4) : (period === 'mesecni' ? odabraniDatum.substring(0,7) : odabraniDatum)}
                        onChange={(e) => {
                            let val = e.target.value;
                            if (period === 'godisnji') val = val + '-01-01'; 
                            if (period === 'mesecni') val = val + '-01';
                            setOdabraniDatum(val);
                        }}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '16px', outline: 'none', color: '#2c3e50' }}
                    />
                </div>
            </div>
        </div>

        {/* 4. RED - DUGME ZA STAMPU */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
             <button 
                onClick={handlePrint}
                disabled={!odabraniProizvodId}
                style={{ 
                    background: odabraniProizvodId ? '#2980b9' : '#95a5a6', 
                    color: 'white', border: 'none', padding: '15px 30px', 
                    borderRadius: '8px', cursor: odabraniProizvodId ? 'pointer' : 'not-allowed', 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s'
                }}
             >
                <Printer size={24} /> 
                GENERISI I ŠTAMPAJ PDF
             </button>
        </div>

      </div>

      {/* PREVIEW REZULTATA (Samo ako je proizvod odabran) */}
      {odabraniProizvodId && (
          <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Pregled podataka ({filtriraniPodaci.length} stavki)
              </h3>
              
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                          <tr>
                              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Datum</th>
                              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Promena</th>
                              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Opis</th>
                              <th style={{ padding: '15px', textAlign: 'right', color: '#7f8c8d' }}>Količina</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filtriraniPodaci.length > 0 ? (
                              filtriraniPodaci.map((red, i) => {
                                  const kol = parseInt(red.kolicina);
                                  return (
                                      <tr key={i} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                          {/* POPRAVLJENA BOJA TEKSTA - SADA JE TAMNA! */}
                                          <td style={{ padding: '15px', color: '#2c3e50' }}>{red.datum}</td>
                                          <td style={{ padding: '15px' }}>
                                              {kol > 0 
                                                  ? <span style={{ color: '#27ae60', background: '#eafaf1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ULAZ</span> 
                                                  : <span style={{ color: '#c0392b', background: '#fdedec', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>IZLAZ</span>
                                              }
                                          </td>
                                          {/* POPRAVLJENA BOJA TEKSTA - SADA JE TAMNA! */}
                                          <td style={{ padding: '15px', color: '#2c3e50' }}>{red.kupac || red.adresa || 'Korekcija'}</td>
                                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: kol > 0 ? '#27ae60' : '#c0392b' }}>
                                              {kol > 0 ? '+' : ''}{kol}
                                          </td>
                                      </tr>
                                  )
                              })
                          ) : (
                              <tr>
                                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Nema podataka za izabrani period.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

    </div>
  );
}

// --- KOMPONENTA ZA DUGME OPCIJE ---
const OpcijaDugme = ({ label, subLabel, icon, active, onClick, color }) => {
    return (
        <button 
            onClick={onClick}
            style={{
                flex: 1,
                padding: '15px',
                border: active ? `2px solid ${color}` : '1px solid #e0e0e0',
                background: active ? `${color}10` : 'white', 
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
                boxShadow: active ? `0 4px 10px ${color}30` : 'none'
            }}
        >
            <div style={{ color: active ? color : '#95a5a6' }}>{icon}</div>
            <div style={{ fontSize: '16px', fontWeight: active ? 'bold' : 'normal', color: active ? color : '#555' }}>{label}</div>
            {subLabel && <div style={{ fontSize: '12px', color: '#95a5a6' }}>{subLabel}</div>}
        </button>
    )
}