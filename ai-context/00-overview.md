# OVERVIEW APLIKASI
VERSI INFO: 1.1.0
UPDATE TERAKHIR: 2026-05-02

## NAMA APLIKASI
Panorama Lens Trip

## DESKRIPSI SINGKAT
Aplikasi manajemen booking tour travel. Mengelola booking paket tour, hotel, driver, pembayaran, dan arus kas.

## LINK
- Repo: https://github.com/CuedNub/panorama-lens-trip
- Demo: https://cuednub.github.io/panorama-lens-trip/
- Password Admin: cued-nub

## FILE UTAMA
- index.html → entry point
- css/style.css → styling utama
- js/core.js → fungsi data, helper, migrasi, CRUD daftar
- js/engine.js → UI, form, render halaman, logika app
- js/license.js → sistem lisensi
- js/itinerary.js → (masih ada tapi tombol itinerary sudah dihapus dari UI)
- js/data_sync.js → export/import data
- js/app_update.js → cek update PWA
- sw.js → service worker PWA
- version.json → versi app
- manifest.json → manifest PWA

## FILE YANG BOLEH DIABAIKAN
- js/engine_backup_modif.js
- js/engine_backup_search_button.js
- js/engine_backup_step19.js
- js/engine_backup_step19b.js
- js/engine_backup_step19c.js
- js/engine_backup_step20.js

## TEKNOLOGI
- HTML / CSS / JS murni
- PWA: ya
- Service Worker: ya
- Lisensi: ya (sistem lisensi CuedNub)

## CATATAN PENTING
- Master Destinasi sudah dihapus (form, halaman, menu sidebar, data localStorage)
- Destinasi sekarang dikelola lewat plt_daftar_destinasi (di Pengaturan)
- Harga paket tidak lagi di master paket, tapi diisi manual per booking
- Tombol itinerary sudah dihapus dari card booking
- js/itinerary.js masih ada di repo tapi tidak dipanggil dari UI
- PWA sudah berhasil diperbaiki dan sekarang bisa diinstal dari GitHub Pages
- Versi aplikasi saat ini: 1.1.6
