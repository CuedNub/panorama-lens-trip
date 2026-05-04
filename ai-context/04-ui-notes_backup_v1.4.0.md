# UI NOTES
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## NAVIGASI
- Bottom nav: Booking, Arus Kas
- Sidebar:
  - 📦 Master Paket
  - 🚗 Master Driver
  - 🏨 Master Hotel
  - ⚙️ Pengaturan
  - ℹ️ Tentang
  - 📖 Panduan

Menu yang sudah DIHAPUS:
  - 📍 Master Destinasi (dihapus, diganti kelola di Pengaturan)

## HALAMAN UTAMA
- Booking → list card booking dengan filter & search
- Arus Kas → list transaksi keuangan per booking

## HALAMAN MASTER
- Master Paket → list card paket (tanpa filter status, hanya search)
- Master Driver → list card driver dengan filter status & search
- Master Hotel → list card hotel dengan filter status & search

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
  - ✅ Sudah pesan: list item + tombol ✏️ Edit + 🗑️ Hapus per item
  - ⚠️ Belum pesan: list item + tombol Pesan per item
  - Tombol: + Pembayaran, Ubah Status
  - Tombol: ✏️ Edit Booking, 🗑️ Hapus Booking

- Tombol yang sudah DIHAPUS dari card booking:
  - 🏨 Hotel (diganti tombol Pesan di belum pesan)
  - 🚗 Driver Tour (diganti tombol Pesan di belum pesan)
  - 🚙 Driver Jeep (diganti tombol Pesan di belum pesan)
  - 🏕️ Piknik (diganti tombol Pesan di belum pesan)
  - 📍 Itinerary
  - 📸 Itinerary Tamu
  - 📸 Itinerary Driver

## CARD MASTER PAKET
- Info: ID, nama, durasi hari/malam
- Expand: daftar destinasi, tombol edit/hapus
- TIDAK ada: badge status, info pax, info harga

## CARD MASTER DRIVER
- Info: ID, nama, kendaraan, tipe, badge status
- Expand: no HP, tombol edit/hapus

## CARD MASTER HOTEL
- Info: ID, nama, destinasi, harga, badge status
- Expand: keterangan, tombol edit/hapus

## MODAL / POPUP
- form dibuka via modal: ya
- cara buka: Engine.bukaModal(judul, html)
- cara tutup: Engine.tutupModal()

## POLA UI YANG BERLAKU
- dropdown bisa tambah manual:
  - destinasi (form hotel master, form hotel booking)
  - kendaraan (form driver master)
  - paket (form booking → buka form paket baru)
- checkbox list bisa tambah manual:
  - destinasi (form paket master)
- tombol edit/hapus di samping item:
  - sudah pesan di card booking
- popup prompt() untuk tambah destinasi di form paket
- tombol "➕ Tambah X Baru" di dropdown untuk hotel, paket, kendaraan

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
