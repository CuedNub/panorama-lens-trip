# TESTING CHECKLIST
VERSI INFO: 1.1.0
UPDATE TERAKHIR: 2026-05-02

## LEVEL 1 — CEK SYNTAX
Jalankan:
for f in js/core.js js/engine.js js/license.js js/data_sync.js js/app_update.js; do
  node --check "$f" \
  && echo "✅ Syntax valid: $f" \
  || echo "❌ Syntax error: $f"
done

## LEVEL 2 — CEK VISUAL
Jalankan server:
cd ~/panorama-lens-trip && python3 -m http.server 8080
atau:
startpls

Buka di browser:
http://localhost:8080

Cek:
- [ ] halaman booking tampil normal
- [ ] sidebar bisa dibuka
- [ ] bottom nav berfungsi (Booking, Arus Kas)
- [ ] semua halaman master bisa diakses
- [ ] pengaturan bisa diakses

## LEVEL 3 — CEK FORM BOOKING
- [ ] form booking bisa dibuka (tombol +)
- [ ] dropdown paket berisi data + opsi tambah baru
- [ ] tambah paket baru dari booking berfungsi
- [ ] harga paket manual bisa diisi
- [ ] sisa bayar & status bayar terhitung otomatis
- [ ] simpan booking berhasil

## LEVEL 4 — CEK CARD BOOKING
- [ ] card booking tampil dengan data benar
- [ ] expand card berfungsi
- [ ] ✅ Sudah pesan: ada tombol ✏️ dan 🗑️
- [ ] ⚠️ Belum pesan: ada tombol Pesan
- [ ] tombol + Pembayaran berfungsi
- [ ] tombol Ubah Status berfungsi
- [ ] tombol ✏️ Edit Booking berfungsi (form terisi data lama)
- [ ] tombol 🗑️ Hapus Booking berfungsi (konfirmasi + hapus semua data)

## LEVEL 5 — CEK FORM HOTEL
- [ ] form hotel bisa dibuka dari card booking
- [ ] dropdown destinasi gabungan (paket + daftar destinasi)
- [ ] tambah destinasi baru berfungsi
- [ ] dropdown hotel per destinasi muncul + opsi tambah baru
- [ ] tambah hotel baru otomatis masuk master hotel
- [ ] edit hotel berfungsi (data lama terisi)
- [ ] hapus hotel berfungsi

## LEVEL 6 — CEK FORM DRIVER
- [ ] form driver tour bisa dibuka
- [ ] form driver jeep bisa dibuka (jika ada Bromo)
- [ ] edit driver berfungsi
- [ ] hapus driver berfungsi

## LEVEL 7 — CEK FORM PIKNIK
- [ ] form piknik bisa dibuka (jika ada Bromo)
- [ ] edit piknik berfungsi
- [ ] hapus piknik berfungsi

## LEVEL 8 — CEK MASTER PAKET
- [ ] halaman master paket tampil (tanpa filter status)
- [ ] form tambah paket: checkbox destinasi dari plt_daftar_destinasi
- [ ] tambah destinasi baru dari form paket berfungsi (popup prompt)
- [ ] simpan paket berhasil
- [ ] edit paket berhasil
- [ ] hapus paket berhasil

## LEVEL 9 — CEK MASTER DRIVER
- [ ] form tambah driver: dropdown kendaraan dari plt_daftar_kendaraan
- [ ] tambah kendaraan baru berfungsi
- [ ] simpan/edit/hapus driver berhasil

## LEVEL 10 — CEK MASTER HOTEL
- [ ] form tambah hotel: dropdown destinasi dari plt_daftar_destinasi
- [ ] tambah destinasi baru berfungsi
- [ ] simpan/edit/hapus hotel berhasil

## LEVEL 11 — CEK PENGATURAN
- [ ] section daftar destinasi tampil
- [ ] tambah destinasi baru berhasil
- [ ] edit destinasi berhasil
- [ ] hapus destinasi berhasil (jika tidak dipakai hotel)
- [ ] hapus destinasi ditolak (jika masih dipakai hotel)
- [ ] simpan profil berhasil

## LEVEL 12 — CEK INSTALL PWA (GITHUB PAGES)
- [ ] buka: https://cuednub.github.io/panorama-lens-trip/
- [ ] tunggu beberapa detik lalu refresh 1x
- [ ] cek apakah browser menampilkan opsi Install app / Tambahkan ke layar utama
- [ ] setelah install, app harus terbuka sebagai standalone, bukan tab browser biasa
- [ ] cek manifest live terbaca benar
- [ ] cek sw.js live terbaca benar
- [ ] cek ukuran icon PWA:
  - [ ] icons/icon-192.png = 192x192
  - [ ] icons/icon-512.png = 512x512

## LEVEL 12 — CEK SEBELUM PUSH
- [ ] APP_VERSION sudah dinaikkan
- [ ] CACHE_NAME di sw.js sudah sinkron
- [ ] version.json sudah diupdate
- [ ] file baru sudah masuk ASSETS di sw.js
- [ ] tidak ada console.log debug tertinggal
- [ ] sudah export / backup data
