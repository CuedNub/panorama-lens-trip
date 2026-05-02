# ATURAN MODIFIKASI
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## FILE AKTIF (yang boleh dimodifikasi)
- index.html
- css/style.css
- js/core.js
- js/engine.js
- js/data_sync.js
- js/app_update.js
- sw.js
- version.json
- manifest.json

## FILE BACKUP (jangan dimodifikasi)
- js/engine_backup_modif.js
- js/engine_backup_search_button.js
- js/engine_backup_step19.js
- js/engine_backup_step19b.js
- js/engine_backup_step19c.js
- js/engine_backup_step20.js

## FILE SENSITIF (jangan ubah tanpa konfirmasi)
- js/license.js → algoritma lisensi CuedNub
- sw.js → CACHE_NAME harus sinkron dengan APP_VERSION
- js/core.js bagian migrateBookingData → jangan hapus flag migrasi

## POLA NAMING FUNCTION
- bukaFormX() → buka form / modal
- bukaFormXDariY() → buka form dari konteks lain (contoh: paket dari booking)
- simpanX() → simpan data baru dari form
- updateX() → update data lama dari form edit
- renderX() → tampilkan halaman / komponen
- hapusX() → hapus data dengan konfirmasi
- onXChange() → handler saat field berubah
- toggleX() → toggle tampilan (expand/collapse, show/hide)
- editFormX() → buka form edit dengan data lama terisi
- editArusKas() → router edit berdasarkan kategori arus kas
- hapusArusKas() → hapus transaksi arus kas
- editBooking() → buka form edit booking
- hapusBooking() → hapus booking + semua arus kas terkait

## SOURCE DATA TERPUSAT
- plt_daftar_destinasi → dipakai oleh:
  - form master paket (checkbox)
  - form master paket dari booking (checkbox)
  - form master hotel (dropdown)
  - form hotel booking (dropdown)
  - pengaturan (kelola tambah/edit/hapus)

- plt_daftar_kendaraan → dipakai oleh:
  - form master driver (dropdown)

## ATURAN DROPDOWN / CHECKBOX TAMBAH MANUAL
- simpan ke source terpusat (plt_daftar_destinasi atau plt_daftar_kendaraan)
- auto-capitalize via Core.capitalizeNama()
- cegah duplikat (case-insensitive)
- untuk destinasi: kelola tambah/edit/hapus dari Pengaturan
- untuk kendaraan: tambah manual dari form driver
- hapus destinasi dicegah jika masih dipakai master hotel

## ATURAN SAAT HAPUS MODUL
- hapus menu dari sidebar (renderSidebar)
- hapus routing di showHalaman
- hapus fungsi render, form, simpan, hapus
- bersihkan data localStorage lama via migrasi

## FORM GANDA (harus selalu sinkron)
- bukaFormMasterPaket() ↔ bukaFormMasterPaketDariBooking()
  - source destinasi: plt_daftar_destinasi
  - fitur tambah destinasi baru: ada di keduanya
  - field: sama (nama, destinasi, hari, malam)
  - perbedaan: setelah simpan dari booking, otomatis kembali ke form booking dengan paket baru terpilih

## AREA SENSITIF
- algoritma lisensi di js/license.js
- migrasi data di Core.migrateBookingData()
- CACHE_NAME di sw.js harus sinkron dengan APP_VERSION di core.js
- version.json harus sinkron dengan APP_VERSION
