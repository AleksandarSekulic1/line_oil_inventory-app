# 📦 Line Oil Inventory System

Profesionalna Desktop aplikacija za vođenje magacina, praćenje zaliha i generisanje otpremnica. Razvijena specijalno za potrebe firme **Line Oil**.

Aplikacija omogućava kompletan uvid u stanje robe, istoriju promena, praćenje naplate i generisanje PDF izveštaja.

---

## ✨ Ključne Funkcionalnosti

### 1. 🏠 Upravljanje Lagerom (Dashboard)
- Pregled svih proizvoda sa trenutnim stanjem.
- Brza pretraga proizvoda.
- Dodavanje novih proizvoda, izmena i brisanje.
- Vizuelni indikatori za kritične zalihe (crvena boja za stanje 0).

### 2. 🔄 Ulaz i Izlaz Robe
- **Dodaj na stanje:** Evidencija nabavke robe.
- **Skini sa stanja (Prodaja):** Kreiranje isporuke za kupca.
- Automatsko ažuriranje količina u realnom vremenu.

### 3. 🚚 Isporuke i Naplata
- Pregled svih isporuka grupisanih po kupcu i datumu.
- **Statusi:** Praćenje da li je roba plaćena (✅) ili se čeka uplata (⏳).
- **Alarm za kašnjenje:** Upozorenje ako uplata kasni više od 3 dana.
- Mogućnost unosa napomene i cene za svaku isporuku.

### 4. 🖨️ Štampa i PDF Izveštaji
- **Otpremnice:** Generisanje profesionalnih otpremnica/računa za kupce jednim klikom.
- **Izveštaji o kretanju robe:**
  - Kompletna istorija (kartica proizvoda).
  - Filtriranje po tipu (Ulaz/Izlaz).
  - Filtriranje po periodu (Dnevni, Mesečni, Godišnji nivo).
- Automatsko računanje sumarnog prometa.

### 5. ⚙️ Sigurnost i Podešavanja
- **Backup (Izvoz):** Čuvanje kompletne baze podataka na lokalni disk ili USB.
- **Restore (Uvoz):** "Pametan uvoz" podataka koji prepoznaje i **ignoriše duplikate** (sprečava duplo knjiženje istih stavki).

---

## 🛠️ Korišćene Tehnologije

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Backend / Shell:** [Electron](https://www.electronjs.org/)
- **Baza Podataka:** [LowDB](https://github.com/typicode/lowdb) (Lokalna JSON baza)
- **Stilizacija:** CSS Modules / Inline Styles
- **Ikonice:** [Lucide React](https://lucide.dev/)
- **Build Tool:** Electron Builder

---

## 🚀 Pokretanje Projekta (Development)

Ako želite da pokrenete kod u razvojnom režimu:

1. **Instalacija zavisnosti:**
   ```bash
   npm install
2. **Pokretanje aplikacije:**
   ```bash
   npm run dev

## 📦 Pravljenje Instalacije (Build)
Za kreiranje .exe instalacionog fajla za Windows:

    npm run build:win
Instalacioni fajl će se nalaziti u folderu: dist/Line Oil Inventory-Setup-1.0.0.exe

## 📂 Gde se čuvaju podaci?
Aplikacija čuva podatke lokalno na računaru korisnika u AppData folderu.

## Putanja baze:%APPDATA%\inventory-app\inventory-db.json

## 👨‍💻 Autor
Razvio: Aleksandar Sekulić Verzija: 1.0.0