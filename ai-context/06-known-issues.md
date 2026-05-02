# KNOWN ISSUES
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## BUG YANG BELUM DIPERBAIKI
- Tidak ada bug yang diketahui saat ini

## AREA RAWAN RUSAK
- Form hotel booking dengan multiple hotel ([n] dinamis)
  - kenapa rawan: field ID pakai nomor urut dinamis (fHotelDest1, fHotelDest2, dst)
  - file terkait: js/engine.js (renderHotelField, simpanHotel)
  - cara cek: test tambah 2-3 hotel dalam 1 form, lalu simpan

- Escape karakter di string HTML JS
  - kenapa rawan: form dibuat lewat string concatenation di JS, mudah salah escape
  - file terkait: js/engine.js
  - cara cek: node --check js/engine.js

- Replace blok panjang dengan python3
  - kenapa rawan: jika isi file berubah sedikit dari target, replace gagal
  - solusi: baca ulang kode terbaru sebelum replace, atau pakai metode penanda awal-akhir

## FITUR YANG BELUM SELESAI
- js/itinerary.js masih ada di repo
  - status: tombol sudah dihapus dari UI, file masih dimuat di index.html
  - opsi: hapus dari index.html dan sw.js, atau biarkan untuk nanti

## HAL YANG HARUS DICEK SEBELUM MODIFIKASI
- Pastikan migrasi data (plt_migrated_v2) sudah jalan sebelum ubah struktur booking
- Pastikan plt_daftar_destinasi sudah terinisialisasi sebelum ubah form yang pakai destinasi
- Jika ubah form master paket, cek juga bukaFormMasterPaketDariBooking (form ganda)
- Jika ubah dropdown destinasi, cek semua form yang pakai: master paket, master hotel, hotel booking, pengaturan

## CATATAN
- File backup engine_backup_*.js bisa dihapus jika versi aktif sudah stabil
- Kelola daftar kendaraan belum ada di Pengaturan (hanya bisa tambah dari form driver)
