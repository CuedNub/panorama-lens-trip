# STRUKTUR FILE
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## STRUKTUR FOLDER
./css/style.css
./icons/icon-192.png
./icons/icon-512.png
./index.html
./js/app_update.js
./js/core.js
./js/data_sync.js
./js/engine.js
./js/itinerary.js
./js/license.js
./manifest.json
./sw.js
./version.json

## FILE AKTIF
- index.html → entry point
- css/style.css → styling utama
- js/core.js → fungsi data & helper & migrasi & CRUD daftar
- js/engine.js → UI & logika halaman & semua form
- js/license.js → sistem lisensi
- js/data_sync.js → export/import data
- js/app_update.js → cek update PWA
- sw.js → service worker
- version.json → versi app
- manifest.json → manifest PWA

## FILE BACKUP / TIDAK AKTIF
- js/engine_backup_modif.js
- js/engine_backup_search_button.js
- js/engine_backup_step19.js
- js/engine_backup_step19b.js
- js/engine_backup_step19c.js
- js/engine_backup_step20.js
- js/itinerary.js (masih ada tapi tidak dipanggil dari UI)

## ENTRY POINT APLIKASI
- Browser memuat: index.html
- JS dimuat berurutan:
  1. js/core.js
  2. js/license.js
  3. js/engine.js
  4. js/itinerary.js
  5. js/data_sync.js
  6. js/app_update.js

## FILE SENSITIF (jangan ubah tanpa konfirmasi)
- js/license.js → algoritma lisensi
- sw.js → service worker, CACHE_NAME harus sinkron
- js/core.js → migrasi data, jangan hapus flag migrasi
