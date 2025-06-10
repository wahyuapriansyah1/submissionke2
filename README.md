# Kuliner Nusantara

Aplikasi web SPA (Single Page Application) bertema review makanan khas Indonesia, dengan fitur modern seperti PWA, offline mode, IndexedDB, kamera, lokasi, peta, dan push notification.

## Fitur Utama
- **SPA**: Navigasi antar halaman tanpa reload.
- **Review Kuliner**: Tambah, lihat, dan kelola review makanan khas Indonesia.
- **Peta Interaktif**: Pilih lokasi kuliner langsung di peta (Leaflet/OpenStreetMap).
- **Kamera & Upload Foto**: Ambil foto langsung dari kamera atau upload dari galeri.
- **Lokasi & Geotagging**: Sertakan lokasi kuliner dengan mudah.
- **PWA & Offline Mode**: Bisa diakses tanpa internet, mendukung install ke home screen.
- **IndexedDB**: Data review tetap tersimpan saat offline, otomatis sinkron saat online.
- **Push Notification**: Notifikasi update/rekomendasi kuliner.
- **Aksesibilitas**: Navigasi keyboard, label ARIA, dan skip to content.
- **Transisi Halaman**: Animasi transisi antar halaman.

## Struktur Folder
- `src/index.html` — Halaman utama aplikasi
- `src/public/` — Asset publik (manifest, favicon, logo, service worker, gambar)
- `src/scripts/` — Semua kode JavaScript (pages, utils, API, routes)
- `src/styles/` — Semua file CSS

## Cara Menjalankan
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```
3. **Akses di browser**
   Buka [http://localhost:9019](http://localhost:9019) (atau port sesuai konfigurasi)

## Catatan Pengembangan
- **PWA**: Service worker otomatis cache file statis dan halaman utama.
- **IndexedDB**: Review yang ditambah saat offline akan otomatis dikirim saat online.
- **Push Notification**: Aktifkan notifikasi dari navbar (ikon lonceng).
- **Aksesibilitas**: Semua form dan navigasi sudah mendukung label ARIA dan keyboard.

## Kustomisasi
- Ganti logo di `src/public/images/logo.png`.
- Ganti warna tema di `src/styles/styles.css`.
- Ganti icon manifest di `src/public/images/icons/`.

## Deployment
Aplikasi siap deploy ke Vercel, Netlify, atau static hosting lain. Link demo: [https://submissionke2.vercel.app/](https://submissionke2.vercel.app/)

---

**Dibuat untuk submission Dicoding, dirombak total bertema Kuliner Nusantara.**
