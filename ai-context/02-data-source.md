# DATA SOURCE
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## PENYIMPANAN
Semua data disimpan di localStorage.

## DAFTAR STORAGE KEY

### Data Utama
- plt_booking → data booking tamu
  - getter: Core.getBooking()
  - saver: Core.saveBooking(data)
  - helper: Core.getBookingById(id)
  - dipakai oleh: form booking, card booking, arus kas
  - field utama: id, namaTamu, noHP, jumlahPax, negara, paketId, destinasi, totalHarga, tglBerangkat, tglPulang, infoPenerbangan, waktuTiba, bandara, fasilitasHotel, fasilitasDriverTour, fasilitasDriverJeep, fasilitasPiknik, statusBooking, snapshotPaket

- plt_arus_kas → data transaksi keuangan terkait booking
  - getter: Core.getArusKas()
  - saver: Core.saveArusKas(data)
  - helper: Core.getArusKasByBookingId(bookingId)
  - dipakai oleh: pembayaran, hotel booking, driver, piknik
  - relasi: bookingId → plt_booking.id
  - kategori: pembayaran tamu, booking hotel, sewa driver tour, sewa driver jeep, piknik bromo

### Data Master
- plt_master_paket → data master paket tour
  - getter: Core.getMasterPaket()
  - saver: Core.saveMasterPaket(data)
  - helper: Core.getMasterPaketById(id)
  - dipakai oleh: form booking (dropdown paket), halaman master paket
  - field: id, nama, destinasi[], durHari, durMalam, status
  - catatan: harga TIDAK ada di master paket, harga diisi manual per booking

- plt_master_driver → data master driver
  - getter: Core.getMasterDriver()
  - saver: Core.saveMasterDriver(data)
  - helper: Core.getMasterDriverById(id), Core.getMasterDriverByTipe(tipe)
  - dipakai oleh: form driver tour, form driver jeep, halaman master driver
  - field: id, nama, noHP, kendaraan, tipe, status

- plt_master_hotel → data master hotel
  - getter: Core.getMasterHotel()
  - saver: Core.saveMasterHotel(data)
  - helper: Core.getMasterHotelById(id), Core.getMasterHotelByDestinasi(dest)
  - dipakai oleh: form hotel booking, halaman master hotel
  - field: id, nama, destinasi, harga, keterangan, status

### Data Daftar (dropdown / checkbox)
- plt_daftar_destinasi → daftar nama destinasi
  - getter: Core.getDaftarDestinasi()
  - saver: Core.saveDaftarDestinasi(data)
  - helper: Core.tambahDestinasi(nama), Core.editDestinasi(lama, baru), Core.hapusDestinasi(nama)
  - data awal: ['Bromo', 'Ijen', 'Semeru']
  - bisa tambah manual: ya
  - auto-capitalize: ya
  - cegah duplikat: ya
  - kelola dari: Pengaturan, form paket, form hotel master, form hotel booking
  - dipakai oleh: form master paket (checkbox), form master hotel (dropdown), form hotel booking (dropdown)

- plt_daftar_kendaraan → daftar jenis kendaraan
  - getter: Core.getDaftarKendaraan()
  - saver: Core.saveDaftarKendaraan(data)
  - helper: Core.tambahKendaraan(nama)
  - data awal: ['Hiace', 'Avanza', 'Innova', 'Jeep', 'Elf']
  - bisa tambah manual: ya
  - auto-capitalize: ya
  - cegah duplikat: ya
  - dipakai oleh: form master driver (dropdown)

### Data Pengaturan
- plt_settings → profil & pengaturan aplikasi
  - getter: Core.getSettings()
  - saver: Core.saveSettings(data)
  - field: namaApp, noWA, email, website, warnaTema, prefixBooking, tempatJemput[]

### Data Lisensi
- plt_license → data lisensi utama (via License.key('license'))
- plt_used_codes → riwayat kode lisensi (via License.key('used_codes'))
- plt_usage_log → log penggunaan (via License.key('usage_log'))
- plt_last_open → tanggal terakhir buka (via License.key('last_open'))
- plt_last_server_time → waktu server terakhir
- plt_last_server_check → cek server terakhir
- plt_revoke_key → kunci revoke

### Data Lama (sudah dihapus)
- plt_master_destinasi → DIHAPUS via migrasi, diganti plt_daftar_destinasi

## RELASI DATA
- plt_arus_kas.bookingId → plt_booking.id
- plt_booking.paketId → plt_master_paket.id
- plt_master_hotel.destinasi → plt_daftar_destinasi (nama destinasi)
- plt_master_paket.destinasi[] → plt_daftar_destinasi (nama destinasi)

## MIGRASI DATA
- migrateBookingData() di core.js
  - hapus field tempatJemput dari booking lama
  - hapus field waktuJemput dari booking lama
  - hapus plt_master_destinasi dari localStorage
  - inisialisasi plt_daftar_destinasi jika belum ada
  - flag: plt_migrated_v2

## HELPER UMUM
- Core.capitalizeNama(nama) → bersihkan spasi + kapital huruf awal
- Core.formatRupiah(angka) → format ke Rupiah
- Core.formatTanggalPendek(tgl) → format tanggal pendek
- Core.formatTanggalWaktu(tgl) → format tanggal + waktu
- Core.generateBookingId() → generate ID booking otomatis
- Core.generateArusKasId() → generate ID arus kas
- Core.generatePaketId() → generate ID paket
- Core.generateDriverId() → generate ID driver
- Core.generateHotelId() → generate ID hotel
- Core.hitungKeuanganBooking(bookingId) → hitung masuk/keluar
- Core.getStatusBayar(bookingId, totalHarga) → status bayar
- Core.adaBromo(destinasiList) → cek apakah ada Bromo
