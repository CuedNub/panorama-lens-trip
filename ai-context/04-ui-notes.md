# UI NOTES
VERSI INFO: 1.4.0
UPDATE TERAKHIR: 2026-05-04

## NAVIGASI
- Bottom nav: Booking, Arus Kas
- Sidebar:
  - Master Paket
  - Master Driver
  - Master Hotel
  - Pengaturan
  - Tentang
  - Panduan

Menu yang sudah DIHAPUS:
  - Master Destinasi (dihapus, diganti kelola di Pengaturan)

## HALAMAN UTAMA
- Booking → list card booking dengan filter & search
- Arus Kas → list transaksi keuangan per booking

## HALAMAN MASTER
- Master Paket → list card paket (tanpa filter status, hanya search)
- Master Driver → list card driver (tanpa filter, hanya search)
- Master Hotel → list card hotel (tanpa filter, hanya search)

Catatan:
- Filter status Master Driver dihapus sejak v1.3.0 karena field tipe dan kendaraan sudah tidak ada
- Filter status Master Hotel dihapus sejak v1.4.0 karena field status tidak lagi tampil di form

## CARD BOOKING
- Info yang ditampilkan:
  - ID + Nama Tamu
  - Badge status booking
  - Nama paket
  - Tanggal berangkat - pulang
  - Badge status bayar

- Expand card berisi:
  - No HP + link WA
  - Jumlah pax + negara
  - Sudah pesan: list item + tombol Edit + Hapus per item
  - Belum pesan: list item + tombol Pesan per item
  - Tombol: + Pembayaran, Ubah Status
  - Tombol: Edit Booking, Hapus Booking

- Tombol yang sudah DIHAPUS dari card booking:
  - Itinerary
  - Itinerary Tamu
  - Itinerary Driver

## CARD MASTER PAKET
- Info: ID, nama, durasi hari/malam
- Expand: daftar destinasi, tombol edit/hapus
- TIDAK ada: badge status, info pax, info harga

## CARD MASTER DRIVER
- Info: ID, nama, no HP
- Expand: tombol edit/hapus
- TIDAK ada: kendaraan, tipe, badge status
- Catatan: field kendaraan dan tipe dihapus dari master driver sejak v1.3.0

## CARD MASTER HOTEL
- Info: ID, nama, destinasi
- Expand: tombol edit/hapus
- TIDAK ada: harga, keterangan, badge status
- Catatan: field harga, keterangan, status dihapus dari tampilan form sejak v1.4.0
  tapi data lama tetap dipertahankan di storage saat edit

## MODAL / POPUP
- form dibuka via modal utama: Engine.bukaModal(judul, html)
- form ditutup: Engine.tutupModal()
- popup di atas modal utama: Engine.bukaModal2(judul, html)
- popup ditutup: Engine.tutupModal2()
- state.modalLayer2 → menyimpan referensi overlay popup layer 2

## POPUP TAMBAH DRIVER BARU
- Dipanggil dari dropdown driver di form sewa driver
- Fungsi: Engine.bukaPopupTambahDriver(tipe)
- Simpan: Engine.simpanPopupDriver(event, tipe)
- Field: Nama Driver (wajib), No HP (wajib)
- Status otomatis Aktif
- Setelah simpan: refresh dropdown driver

## POPUP TAMBAH KENDARAAN BARU
- Dipanggil dari dropdown kendaraan di form sewa driver tour
- Fungsi: Engine.bukaPopupTambahKendaraan(tipe, idx)
- Simpan: Engine.simpanPopupKendaraan(event)
- Field: Nama Kendaraan (wajib)
- Auto capitalize
- Cek duplikat + deteksi mirip
- Setelah simpan: refresh dropdown kendaraan

## ALUR FORM DRIVER TOUR
- Dropdown driver: pilih driver + opsi tambah baru
- No HP otomatis terisi saat driver dipilih
- Kendaraan: dropdown dari plt_daftar_kendaraan + opsi tambah baru
- Biaya: format ribuan + tombol kalkulator
- Tanggal + Status: hanya muncul jika biaya > 0
- Keterangan: UPPERCASE otomatis
- Tombol: Simpan

## ALUR FORM DRIVER JEEP
- Sama seperti Driver Tour tapi:
  - Kendaraan readonly JEEP
  - Ada 2 tombol: Simpan dan Tambah Jeep
  - Tambah Jeep: simpan data + buka form jeep baru lagi

## ALUR FORM HOTEL BOOKING
- 1 form = 1 hotel
- Info booking ditampilkan: total malam, hotel per destinasi, sisa malam
- Destinasi auto terpilih ke destinasi yang belum ada hotel
- Nama hotel terfilter sesuai destinasi
- Warning jika hotel yang dipilih sudah pernah diinput di booking ini
- Biaya: format ribuan + tombol kalkulator
- Tanggal + Status: hanya muncul jika biaya > 0
- Keterangan: UPPERCASE otomatis
- 2 tombol: Simpan dan Tambah Hotel
  - Simpan: simpan + kembali ke detail booking
  - Tambah Hotel: simpan + buka form hotel baru lagi

## POLA UI YANG BERLAKU
- dropdown bisa tambah dari dalam dropdown:
  - destinasi (form hotel booking, form hotel master)
  - hotel baru (form hotel booking)
  - driver baru (form sewa driver tour, form sewa driver jeep)
  - kendaraan baru (form sewa driver tour)
  - paket (form booking → buka form paket baru)
- checkbox list bisa tambah manual:
  - destinasi (form paket master)
- tombol edit/hapus di samping item:
  - sudah pesan di card booking
- tombol Tambah X di dalam dropdown untuk hotel, paket, driver, kendaraan

## PENGATURAN
- Profil App (nama, WA, email, website, warna tema, prefix)
- Daftar Tempat Jemput (tambah/hapus)
- Daftar Destinasi (tambah/edit/hapus)
- Simpan Data (export JSON)
- Pulihkan Data (import JSON)

## GAYA VISUAL
- warna tema: bisa dipilih user (hijau default)
- tema gelap: tidak
- responsive: ya
- target device: HP

## CSS CUSTOM
- file: css/style.css
- class penting:
  - .card-booking → card booking utama
  - .card-master → card master data
  - .checklist-item → item sudah/belum pesan (flex layout)
  - .checklist-actions → wrapper tombol edit/hapus mini
  - .btn-mini → tombol kecil edit/hapus
  - .btn-mini.btn-hapus → tombol hapus (merah muda)
  - .btn-mini.btn-pesan → tombol pesan (biru muda)
  - .card-actions .btn-hapus → tombol hapus booking (merah)
  - .fab → floating action button (+)
  - .badge → badge status
  - .modal-layer2 → overlay popup layer 2 (di atas modal utama)
  - .info-booking-hotel → box info booking di form hotel
