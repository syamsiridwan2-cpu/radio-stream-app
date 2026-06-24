# Radio Stream

Aplikasi **radio streaming** berbasis web yang mengambil data stasiun radio dari [Radio Browser API](https://api.radio-browser.info/) — direktori radio global dengan 100.000+ stasiun.

Mendukung pencarian, autocomplete, favorit (localStorage), dark/light theme, dan navigasi playlist.

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Pencarian** | Cari berdasarkan nama stasiun, negara, atau genre |
| ⚡ **Autocomplete** | Saran实时 (real-time) saat mengetik dengan debounce |
| 🔥 **Populer** | Stasiun paling populer dari seluruh dunia |
| ⭐ **Favorit** | Simpan stasiun ke favorit (tersimpan di localStorage) |
| ▶️ **Pemutar** | Play/stop, volume slider, mute toggle |
| ⏮️ **Playlist** | Navigasi prev/next berdasarkan daftar yang tampil |
| 🌙 **Tema** | Dark/Light mode dengan toggle |
| 📱 **Responsif** | Mendukung desktop, tablet, dan mobile |

## Struktur Proyek

```
radio-stream-app/
├── index.html              # Entry point utama
├── server.py               # Python HTTP server (untuk deploy)
├── radio-stream.service    # Systemd service (auto-start di boot)
├── README.md               # Dokumentasi ini
├── VERSION                 # Versi aplikasi
│
├── css/
│   ├── 1-base.css          # Reset, CSS variables, global
│   ├── 2-layout.css        # Container, header, grid, player position
│   ├── 3-components.css    # Search, cards, buttons, player controls
│   ├── 4-responsive.css    # Media queries (768px, 480px)
│   └── 5-scrollbar.css     # Custom scrollbar
│
└── js/
    ├── 1-state.js          # State global, konstanta, utilities
    ├── 2-api.js            # Radio Browser API wrapper
    ├── 3-storage.js        # Favorites localStorage CRUD
    ├── 4-player.js         # Audio engine & player controls
    ├── 5-search.js         # Search & autocomplete
    ├── 6-ui.js             # Rendering, tabs, theme
    └── 7-init.js           # Bootstrap & initialization
```

## Cara Penggunaan

1. **Clone atau download** repositori ini
2. **Buka `index.html`** di browser modern (Chrome, Firefox, Edge, Safari)
3. **Tidak perlu server** — aplikasi berjalan langsung dari file HTML

```bash
# Cukup double-click index.html
# Atau buka via terminal:
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

## Teknologi

- **HTML5** — Semantic markup
- **CSS3** — CSS Variables, Flexbox, Grid, Media Queries
- **Vanilla JavaScript** — ES6+, Fetch API, localStorage
- **Radio Browser API** — Sumber data stasiun radio

## API Reference

Aplikasi menggunakan [Radio Browser API](https://api.radio-browser.info/) (gratis, tanpa API key):

| Endpoint | Deskripsi |
|----------|-----------|
| `GET /json/stations/search?name={query}` | Cari stasiun by nama |
| `GET /json/stations/topclick/50` | 50 stasiun terpopuler |
| `GET /json/stations/bycountry/{country}` | Stasiun by negara |
| `GET /json/stations/bytag/{tag}` | Stasiun by genre/tag |
| `GET /json/countries` | Daftar negara |
| `GET /json/tags` | Daftar genre/tag |

## Kustomisasi

### Menambahkan Tema Baru

Edit CSS variables di `css/1-base.css`:

```css
:root {
  --bg: #0d0d1a;        /* Ubah warna background */
  --accent: #7c6aff;     /* Ubah warna aksen */
  --radius: 14px;        /* Ubah border radius */
  /* ... */
}
```

### Mengubah Jumlah Hasil Pencarian

Di `js/2-api.js`, ubah parameter `limit`:

```js
data = await api(`/stations/search?limit=100&name=...`);
```

### API Endpoint Server

Di `js/1-state.js`, ubah konstanta `API`:

```js
const API = 'https://de1.api.radio-browser.info/json';
// Ganti dengan server lain:
// const API = 'https://at1.api.radio-browser.info/json';
```

## Deploy ke Raspberry Pi

### 1. Transfer File ke Pi

```bash
# Dari laptop/PC, kirim folder via SCP:
scp -r /path/to/radio-stream-app/ pi@<ip-raspberry>:/home/pi/

# Contoh:
scp -r /c/Users/LENOVO/Desktop/radio-stream-app/ pi@192.168.1.10:/home/pi/
```

### 2. Jalankan Server

```bash
# SSH ke Raspberry Pi dulu
ssh pi@192.168.1.10

# Masuk ke folder
cd ~/radio-stream-app

# Jalankan server Python (bawaan Raspberry Pi OS)
python3 server.py
```

Akses dari browser di jaringan lokal: `http://<ip-raspberry>:8000`

### 3. Auto-Start Saat Boot (Opsional)

Agar server tetap jalan meski SSH ditutup dan otomatis menyala saat boot:

```bash
# Pasang systemd service
sudo cp ~/radio-stream-app/radio-stream.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable radio-stream
sudo systemctl start radio-stream

# Cek status
sudo systemctl status radio-stream
```

### 4. Akses dari Luar Jaringan

**Opsional — lakukan hanya jika benar-benar ingin akses dari internet.**

#### Opsi A: Port Forwarding (Router)
1. Cari IP Raspberry Pi: `ip a` atau `hostname -I`
2. Set DHCP reservation / IP static di router
3. Forward port (misal: 8000) ke IP Pi di pengaturan router
4. Akses via: `http://<ip-publik>:8000`
5. **⚠️  Ganti port default** di `server.py` agar tidak kena scan bot

#### Opsi B: Cloudflare Tunnel (Rekomendasi)
```bash
# Install cloudflared di Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Login & tunnel (dijelaskan oleh wizard)
cloudflared tunnel login
cloudflared tunnel create radio-stream
cloudflared tunnel route dns radio-stream radio-studio.domain.com
cloudflared tunnel run radio-stream --url http://localhost:8000
```

#### Opsi C: Tunnel via Serveo (Paling Sederhana)
```bash
# SSH tunnel — tanpa install apa pun
ssh -R 80:localhost:8000 serveo.net
# Output: https://random-name.serveo.net
```

### 5. Cari IP Raspberry Pi

```bash
hostname -I
# Contoh output: 192.168.1.10
```

Gunakan IP tersebut untuk akses dari perangkat lain di jaringan yang sama.

## Versioning

Lihat file `VERSION` untuk versi terkini.

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0.0 | Juni 2026 | Rilis awal — search, autocomplete, player, favorites, theme |

## Lisensi

Dibuat untuk koleksi pribadi. Bebas digunakan, dimodifikasi, dan didistribusikan.
