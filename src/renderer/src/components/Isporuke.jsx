import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Truck, 
  Box, 
  CheckCircle2,
  AlertTriangle,
  Printer 
} from 'lucide-react';

export default function Isporuke() {
  const [sveIsporuke, setSveIsporuke] = useState([]); 
  const [grupe, setGrupe] = useState([]); 
  const [odabraniMesec, setOdabraniMesec] = useState('svi');
  const [proizvodiInfo, setProizvodiInfo] = useState({}); 

  useEffect(() => {
    ucitajPodatke();
  }, []);

  const ucitajPodatke = async () => {
    const isporuke = await window.api.getAllDeliveries();
    setSveIsporuke(isporuke);

    const proizvodi = await window.api.getProducts();
    const infoMap = {};
    if (proizvodi) {
      proizvodi.forEach((p) => {
        infoMap[p.id] = { naziv: p.naziv, zapremina: p.zapremina };
      });
    }
    setProizvodiInfo(infoMap);
  };

  useEffect(() => {
    if (sveIsporuke.length === 0) return;

    const filtrirano = sveIsporuke.filter((item) => {
      if (odabraniMesec === 'svi') return true;
      const refDatum = item.datumIsporuke || item.datum;
      return refDatum.startsWith(odabraniMesec);
    });

    const grupisanoObj = {};

    filtrirano.forEach((item) => {
      const key = `${item.kupac || 'Nepoznat'}_${item.datumIsporuke || item.datum}`;

      if (!grupisanoObj[key]) {
        grupisanoObj[key] = {
          ids: [],
          kupac: item.kupac || 'Nepoznat',
          adresa: item.adresa,
          datumKreiranja: item.datum, 
          datumIsporuke: item.datumIsporuke || item.datum,
          stavke: [],
          placeno: item.placeno || false,
          napomena: item.napomena || '',
        };
      }

      grupisanoObj[key].ids.push(item.id);
      grupisanoObj[key].stavke.push({
        proizvodId: item.proizvodId,
        kolicina: Math.abs(item.kolicina),
      });
    });

    const grupeNiz = Object.values(grupisanoObj).sort(
      (a, b) => new Date(b.datumIsporuke) - new Date(a.datumIsporuke)
    );

    setGrupe(grupeNiz);
  }, [sveIsporuke, odabraniMesec]);

  const promeniStatus = async (grupa, novoPlaceno, novaNapomena) => {
    try {
      await window.api.updateDeliveryGroup({
        ids: grupa.ids,
        placeno: novoPlaceno,
        napomena: novaNapomena,
      });
      ucitajPodatke();
    } catch (err) {
      console.error('Greska:', err);
      alert('Greska pri cuvanju.');
    }
  };

  const dostupniMeseci = [
    ...new Set(sveIsporuke.map((s) => (s.datumIsporuke || s.datum).substring(0, 7))),
  ].sort().reverse();

  // STILOVI KONTEJNERA
  const containerStyle = {
    padding: '30px',
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: '#ecf0f1', 
    fontFamily: 'sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    paddingBottom: '50px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ color: '#2c3e50', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          🚚 Isporuke & Naplata
        </h1>

        <select
          value={odabraniMesec}
          onChange={(e) => setOdabraniMesec(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '16px', cursor: 'pointer' }}
        >
          <option value="svi">📅 Prikaži sve</option>
          {dostupniMeseci.map((mesec) => (
            <option key={mesec} value={mesec}>
              🗓️ {mesec}
            </option>
          ))}
        </select>
      </div>

      <div style={gridStyle}>
        {grupe.map((grupa, index) => (
          <KarticaIsporuke
            key={index}
            grupa={grupa}
            proizvodiInfo={proizvodiInfo}
            onUpdate={promeniStatus}
          />
        ))}
        {grupe.length === 0 && (
          <p style={{ color: '#7f8c8d', fontSize: '18px', gridColumn: '1/-1', textAlign: 'center' }}>
            Nema isporuka za izabrani period.
          </p>
        )}
      </div>
    </div>
  );
}

// --- REDIZAJNIRANA KARTICA (Inline CSS) ---
function KarticaIsporuke({ grupa, proizvodiInfo, onUpdate }) {
  const [napomena, setNapomena] = useState(grupa.napomena);
  const GRANICA_ZA_ALARM = 3; 

  const danas = new Date();
  const datumIsporuke = new Date(grupa.datumIsporuke);
  const razlikaVreme = datumIsporuke - danas;
  const razlikaDana = Math.ceil(razlikaVreme / (1000 * 60 * 60 * 24));
  const kriticnoKasnjenje = razlikaDana <= -GRANICA_ZA_ALARM && !grupa.placeno;

  const handleBlur = () => {
    if (napomena !== grupa.napomena) {
      onUpdate(grupa, grupa.placeno, napomena);
    }
  };

  // --- NOVA FUNKCIJA ZA ŠTAMPU (SA NAPOMENOM) ---
  const handlePrint = (e) => {
    e.stopPropagation(); 
    
    // 1. Sadržaj tabele
    const sadrzajStavki = grupa.stavke.map(stavka => {
        const info = proizvodiInfo[stavka.proizvodId] || { naziv: 'Nepoznat proizvod', zapremina: '' };
        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong>${info.naziv}</strong>
                    <br/>
                    <span style="font-size: 11px; color: #666;">${info.zapremina}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
                    ${stavka.kolicina} kom
                </td>
            </tr>
        `;
    }).join('');

    const statusColor = grupa.placeno ? '#27ae60' : '#c0392b';
    const statusBg = grupa.placeno ? '#f0fff4' : '#fff5f5';
    const statusText = grupa.placeno ? '✅ PLAĆENO' : '⏳ ČEKA SE UPLATA';

    // 2. Kompletan HTML
    const htmlSadrzaj = `
      <html>
        <head>
          <title>Otpremnica - ${grupa.kupac}</title>
          <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                color: #333;
                background: white;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; letter-spacing: 2px; text-transform: uppercase; font-size: 24px; }
            .header p { margin: 5px 0 0; color: #7f8c8d; font-size: 14px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-box h3 { margin: 0 0 5px 0; font-size: 12px; color: #95a5a6; text-transform: uppercase; }
            .info-box p { margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 5px; }
            .address { font-size: 14px; font-weight: normal; color: #555; margin-top: 5px; display: flex; align-items: center; gap: 5px;}

            .status-banner {
                padding: 12px;
                text-align: center;
                background-color: ${statusBg};
                color: ${statusColor};
                border: 2px solid ${statusColor};
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 30px;
                border-radius: 6px;
                font-size: 16px;
                letter-spacing: 1px;
            }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #f8f9fa; padding: 12px; font-size: 12px; text-transform: uppercase; color: #7f8c8d; border-bottom: 2px solid #ddd; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #bdc3c7; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚚 LINE OIL</h1>
            <p>📄 EVIDENCIJA ISPORUKE</p>
          </div>

          <div class="status-banner">
            ${statusText}
          </div>

          <div class="info-grid">
            <div class="info-box">
                <h3>Kupac</h3>
                <p>👤 ${grupa.kupac}</p>
                <div class="address">📍 ${grupa.adresa || 'Adresa nije uneta'}</div>
            </div>
            <div class="info-box" style="text-align: right;">
                <h3>Datum Isporuke</h3>
                <p style="justify-content: flex-end;">🚚 ${grupa.datumIsporuke}</p>
                <h3 style="margin-top: 15px;">Datum Kreiranja</h3>
                <p style="font-size: 14px; justify-content: flex-end; color: #7f8c8d;">📅 ${grupa.datumKreiranja}</p>
            </div>
          </div>

          <table>
            <thead>
                <tr>
                    <th>📦 Proizvod / Artikal</th>
                    <th style="text-align: right;">⚖️ Količina</th>
                </tr>
            </thead>
            <tbody>
                ${sadrzajStavki}
            </tbody>
          </table>

          ${napomena ? `
            <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #7f8c8d;">
                <h4 style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #95a5a6;">📝 Napomena / Dodatne informacije</h4>
                <p style="margin: 0; font-size: 14px; color: #2c3e50;">${napomena}</p>
            </div>
          ` : ''}

          <div class="footer">
            🤝 Hvala na poverenju!<br/>
            Line Oil Inventory System
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlSadrzaj);
    doc.close();

    iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };
  };

  // Odredjivanje boja kartice
  let borderColor = '#3498db'; 
  let statusBg = '#ebf5fb';
  let statusText = '#2980b9';

  if (grupa.placeno) {
    borderColor = '#27ae60'; 
  } else if (razlikaDana < 0) {
    borderColor = '#c0392b'; 
    statusBg = '#fdedec';
    statusText = '#c0392b';
  } else if (razlikaDana === 0) {
    borderColor = '#e67e22'; 
    statusBg = '#fef5e7';
    statusText = '#d35400';
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: kriticnoKasnjenje ? '0 0 15px rgba(192, 57, 43, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: `5px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    color: '#333',
    position: 'relative'
  };

  return (
    <div style={cardStyle}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: '#f0f2f5', borderRadius: '50%', color: '#555' }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>{grupa.kupac}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#7f8c8d', marginTop: '4px' }}>
              <MapPin size={12} />
              <span>{grupa.adresa || 'Nema adrese'}</span>
            </div>
          </div>
        </div>

        {/* DESNI DEO HEADERA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* DUGME ZA ŠTAMPU */}
          <button 
            onClick={handlePrint}
            title="Štampaj Otpremnicu (PDF)"
            style={{
                border: 'none',
                background: '#f1f2f6', 
                color: '#2c3e50',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e6ea'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f2f6'}
          >
            <Printer size={18} />
          </button>

          {!grupa.placeno && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {kriticnoKasnjenje && (
                  <div title="Ozbiljno kašnjenje!" style={{ animation: 'pulse 2s infinite' }}>
                      <AlertTriangle size={24} color="#e74c3c" fill="#fdedec" />
                  </div>
              )}
              
              <div style={{ 
                fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px',
                backgroundColor: statusBg, color: statusText, whiteSpace: 'nowrap'
              }}>
                {razlikaDana < 0 ? `${Math.abs(razlikaDana)} d. kasni` : razlikaDana === 0 ? 'Danas' : `${razlikaDana} dana`}
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: 0 }} />

      {/* DVA DATUMA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#adb5bd', fontWeight: 'bold', marginBottom: '4px' }}>Kreirano</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#495057', fontSize: '14px', fontWeight: '500' }}>
            <Calendar size={14} />
            {grupa.datumKreiranja}
          </div>
        </div>
        <div style={{ padding: '8px', background: '#e8f4fd', borderRadius: '6px', border: '1px solid #d0e1fd' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7fb1e8', fontWeight: 'bold', marginBottom: '4px' }}>Isporuka</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2980b9', fontSize: '14px', fontWeight: 'bold' }}>
            <Truck size={14} />
            {grupa.datumIsporuke}
          </div>
        </div>
      </div>

      {/* STAVKE */}
      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px', border: '1px solid #e9ecef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#95a5a6', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>
          <Box size={12} />
          Stavke porudžbine
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {grupa.stavke.map((stavka, i) => {
             const info = proizvodiInfo[stavka.proizvodId] || { naziv: 'Nepoznato', zapremina: '' };
             return (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                 <span style={{ color: '#2c3e50', fontWeight: '500', fontSize: '14px' }}>
                   {info.naziv} <span style={{ color: '#95a5a6', fontWeight: 'normal', fontSize: '12px' }}>{info.zapremina}</span>
                 </span>
                 <span style={{ background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                   {stavka.kolicina} kom
                 </span>
               </div>
             )
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: 'auto' }}>
        {grupa.placeno ? (
          <div 
            onClick={() => onUpdate(grupa, false, napomena)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#d5f5e3', color: '#1e8449', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            <CheckCircle2 size={18} />
            PLAĆENO
            <span style={{ marginLeft: 'auto', fontWeight: 'normal', fontSize: '12px' }}>{napomena}</span>
          </div>
        ) : (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={grupa.placeno} 
                onChange={(e) => onUpdate(grupa, e.target.checked, napomena)}
                style={{ width: '16px', height: '16px', accentColor: '#27ae60' }}
              />
              <span style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>Označi kao plaćeno</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>💰</span>
              <input 
                type="text"
                placeholder="Unesi cenu ili napomenu..."
                value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBlur() }}
                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '14px', outline: 'none', color: '#333' }}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}