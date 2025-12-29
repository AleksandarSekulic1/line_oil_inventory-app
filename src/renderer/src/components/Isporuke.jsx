import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Truck, 
  Box, 
  CheckCircle2,
  AlertTriangle // <--- DODAO SAM OVO
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
    backgroundColor: '#ecf0f1', // Svetla pozadina da se kartice vide
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
// --- REDIZAJNIRANA KARTICA (Inline CSS) ---
function KarticaIsporuke({ grupa, proizvodiInfo, onUpdate }) {
  const [napomena, setNapomena] = useState(grupa.napomena);

  // --- PODESAVANJE ---
  // Ovde upisi posle koliko dana kasnjenja da iskoci uzvicnik!
  const GRANICA_ZA_ALARM = 3; 
  // --------------------

  // Logika za dane
  const danas = new Date();
  const datumIsporuke = new Date(grupa.datumIsporuke);
  const razlikaVreme = datumIsporuke - danas;
  const razlikaDana = Math.ceil(razlikaVreme / (1000 * 60 * 60 * 24));

  // Da li kasni kriticno? (npr. ako je granica 3, ovo hvata -3, -4, -5...)
  const kriticnoKasnjenje = razlikaDana <= -GRANICA_ZA_ALARM && !grupa.placeno;

  const handleBlur = () => {
    if (napomena !== grupa.napomena) {
      onUpdate(grupa, grupa.placeno, napomena);
    }
  };

  // Odredjivanje boja
  let borderColor = '#3498db'; // Plava (default)
  let statusBg = '#ebf5fb';
  let statusText = '#2980b9';

  if (grupa.placeno) {
    borderColor = '#27ae60'; // Zelena
  } else if (razlikaDana < 0) {
    borderColor = '#c0392b'; // Crvena
    statusBg = '#fdedec';
    statusText = '#c0392b';
  } else if (razlikaDana === 0) {
    borderColor = '#e67e22'; // Narandzasta
    statusBg = '#fef5e7';
    statusText = '#d35400';
  }

  // Ako je kriticno, dodajemo jos jaci vizuelni efekat (senka)
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: kriticnoKasnjenje ? '0 0 15px rgba(192, 57, 43, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)', // Crvena senka ako je kriticno
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

        {/* Status Badge + UZVICNIK */}
        {!grupa.placeno && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* OVO JE UZVICNIK KOJI SE POJAVLJUJE SAMO KAD JE KRITICNO */}
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

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: 0 }} />

      {/* DVA DATUMA (GRID) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Kreirano */}
        <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#adb5bd', fontWeight: 'bold', marginBottom: '4px' }}>Kreirano</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#495057', fontSize: '14px', fontWeight: '500' }}>
            <Calendar size={14} />
            {grupa.datumKreiranja}
          </div>
        </div>
        {/* Isporuka */}
        <div style={{ padding: '8px', background: '#e8f4fd', borderRadius: '6px', border: '1px solid #d0e1fd' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7fb1e8', fontWeight: 'bold', marginBottom: '4px' }}>Isporuka</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2980b9', fontSize: '14px', fontWeight: 'bold' }}>
            <Truck size={14} />
            {grupa.datumIsporuke}
          </div>
        </div>
      </div>

      {/* STAVKE (SIVI BOX) */}
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