# DAFTAR FORM
VERSI INFO: 1.4.0
UPDATE TERAKHIR: 2026-05-04

## CARA BACA FORMAT
- Nama Field (id) → manual/otomatis | tipe | source | simpan ke | contoh

═══════════════════════════════════════

## FORM BOOKING TOUR (buat baru)
Fungsi: buat booking baru
File: js/engine.js
Fungsi buka: Engine.bukaFormOrder()
Fungsi simpan: Engine.simpanOrder(event)

1. ID Booking (fOrderId) → otomatis | text readonly | generate dari prefix setting | plt_booking.id | PL-001
2. Nama Tamu (fOrderNama) → manual | text | user input | plt_booking.namaTamu | John Doe
3. No HP (fOrderHP) → manual | tel | user input | plt_booking.noHP | 08123456789
4. Jumlah Pax (fOrderPax) → manual | number | user input | plt_booking.jumlahPax | 4
5. Negara (fOrderNegara) → manual | select | hardcode list | plt_booking.negara | Indonesia
6. Negara Manual (fOrderNegaraManual) → manual | text | muncul jika pilih Lainnya | plt_booking.negara | Malaysia
7. Paket Tour (fOrderPaket) → manual | select + tambah baru | plt_master_paket | plt_booking.paketId | PKT-001
8. Info Paket (fOrderInfoPaket) → otomatis | div info | dari master paket | tidak disimpan | -
9. Fasilitas (fOrderFasilitas) → otomatis | div checkbox | dari paket terpilih | plt_booking.fasilitas* | -
10. Harga Paket (fOrderHarga) → manual | number | user input | plt_booking.totalHarga | 2500000
11. Tgl Berangkat (fOrderTglBerangkat) → manual | date | user input | plt_booking.tglBerangkat | 2025-08-01
12. Tgl Pulang (fOrderTglPulang) → manual/otomatis | date | dihitung dari durasi paket | plt_booking.tglPulang | 2025-08-03
13. Info Penerbangan (fOrderFlight) → manual | text | user input | plt_booking.infoPenerbangan | GA-302
14. Waktu Tiba (fOrderTiba) → manual | datetime-local | user input | plt_booking.waktuTiba | 2025-08-01T06:00
15. Bandara (fOrderBandara) → manual | text | user input | plt_booking.bandara | Juanda
16. Jumlah Bayar (fOrderBayar) → manual | number | user input | plt_arus_kas (pembayaran awal) | 500000
17. Sisa Bayar (fOrderSisaBayar) → otomatis | div info | harga - bayar | tidak disimpan | -
18. Status Bayar (fOrderStatusBayar) → otomatis | div info | dari hitungan | tidak disimpan | -

## FORM EDIT BOOKING
Fungsi: edit booking yang sudah ada (data lama terisi)
File: js/engine.js
Fungsi buka: Engine.editBooking(bookingId)
Fungsi simpan: Engine.updateBooking(event, bookingId)
Catatan: field sama dengan form booking baru, tapi tanpa fOrderBayar

## FORM FASILITAS (checkbox di dalam form booking)
19. Hotel (fFasHotel) → manual | checkbox | dari paket | plt_booking.fasilitasHotel
20. Driver Tour (fFasDriverTour) → manual | checkbox | dari paket | plt_booking.fasilitasDriverTour
21. Driver Jeep (fFasDriverJeep) → manual | checkbox | muncul jika ada Bromo | plt_booking.fasilitasDriverJeep
22. Piknik (fFasPiknik) → manual | checkbox | muncul jika ada Bromo | plt_booking.fasilitasPiknik

═══════════════════════════════════════

## FORM PEMBAYARAN
Fungsi: tambah pembayaran untuk booking
File: js/engine.js
Fungsi buka: Engine.bukaFormPembayaran(bookingId)
Fungsi simpan: Engine.simpanPembayaran(event, bookingId)

23. Jumlah Bayar (fBayarJumlah) → manual | number | user input | plt_arus_kas.jumlah | 500000
24. Tanggal Bayar (fBayarTanggal) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-01T10:00
25. Metode Bayar (fBayarMetode) → manual | select | hardcode | plt_arus_kas.metode | Transfer
26. Keterangan (fBayarKet) → manual | text | user input | plt_arus_kas.keterangan | Cicilan ke-2

═══════════════════════════════════════

## FORM HOTEL BOOKING (1 form = 1 hotel)
Fungsi: pesan hotel untuk booking, 1 form untuk 1 hotel
File: js/engine.js
Fungsi buka: Engine.bukaFormHotel(bookingId)
Fungsi simpan: Engine.simpanHotel(event, bookingId)
Fungsi simpan + lagi: Engine.simpanHotelDanTambahLagi(bookingId)
Fungsi proses: Engine.prosesSimanHotel(bookingId, tambahLagi)
Fungsi edit: Engine.editFormHotel(ak)
Fungsi update: Engine.updateHotel(event, arusKasId, bookingId)
Fungsi update + lagi: Engine.updateHotelDanTambahLagi(arusKasId, bookingId)
Fungsi proses update: Engine.prosesUpdateHotel(arusKasId, bookingId, tambahLagi)
Catatan: model lama multi-hotel sudah dihapus sejak v1.4.0

Info booking ditampilkan di atas form:
- total malam dari snapshotPaket.durMalam
- hotel yang sudah diinput per destinasi
- sisa malam yang belum ter-cover
- auto pilih destinasi berikutnya yang belum ada hotel

27. Nama Tamu → otomatis | text readonly | dari booking | tidak disimpan
28. Destinasi (fHotelDest1) → manual+tambah | select | plt_daftar_destinasi + destinasi paket | plt_arus_kas.snapshotHotel.destinasi | Bromo
29. Destinasi Manual (fHotelDestManual1) → manual | text | muncul jika tambah baru | simpan ke plt_daftar_destinasi | Malang
30. Nama Hotel (fHotelNama1) → manual+tambah | select | plt_master_hotel per destinasi | plt_arus_kas.snapshotHotel.nama | Hotel Bromo View
31. Nama Hotel Manual (fHotelNamaManual1) → manual | text | muncul jika tambah baru | simpan ke plt_master_hotel | Hotel Baru
32. Warning Duplikat (fHotelWarning1) → otomatis | div info | cek duplikat hotel di booking ini | tidak disimpan
33. Biaya (fHotelBiaya1) → manual | text format ribuan | user input + kalkulator | plt_arus_kas.jumlah | 350000
34. Tanggal (fHotelTgl1) → manual | datetime-local | muncul jika biaya > 0 | plt_arus_kas.tanggal | 2025-08-01T14:00
35. Status Bayar (fHotelStatus1) → manual | select | muncul jika biaya > 0 | plt_arus_kas.statusBayar | Lunas
36. Keterangan (fHotelKet1) → manual | text UPPERCASE | user input | plt_arus_kas.keterangan | 1 KAMAR 1 MALAM

Tombol:
- Simpan → simpan + kembali ke detail booking
- Tambah Hotel → simpan + buka form hotel baru lagi

═══════════════════════════════════════

## FORM DRIVER TOUR
Fungsi: pesan driver tour untuk booking
File: js/engine.js
Fungsi buka: Engine.bukaFormDriverTour(bookingId)
Fungsi simpan: Engine.simpanDriverTour(event, bookingId)
Fungsi proses: Engine.simpanDriver(bookingId, tipe, kategori)
Fungsi edit: Engine.editFormDriverTour(ak)
Fungsi update: Engine.updateDriver(event, arusKasId, bookingId, kategori)
Fungsi proses update: Engine.prosesUpdateDriver(arusKasId, bookingId, kategori, tambahJeepLagi)
Catatan: kendaraan dipilih per transaksi, bukan dari master driver

37. ID Booking → hidden | dari booking | tidak ditampilkan
38. Nama Tamu → otomatis | text readonly | dari booking | tidak disimpan
39. Tipe Driver → readonly | text | hardcode DRIVER TOUR | tidak disimpan
40. Nama Driver (fDriverTourId) → manual | select | plt_master_driver semua aktif + tambah baru | plt_arus_kas.snapshotDriver.nama
41. No HP (fDriverTourHP) → otomatis | tel readonly | dari driver terpilih | plt_arus_kas.snapshotDriver.noHP
42. Kendaraan (fDriverTourKendaraan) → manual | select | plt_daftar_kendaraan + tambah baru | plt_arus_kas.snapshotDriver.kendaraan
43. Biaya (fDriverTourBiaya) → manual | text format ribuan + kalkulator | user input | plt_arus_kas.jumlah | 400000
44. Tanggal (fDriverTourTgl) → manual | datetime-local | muncul jika biaya > 0 | plt_arus_kas.tanggal
45. Status Bayar (fDriverTourStatus) → manual | select | muncul jika biaya > 0 | plt_arus_kas.statusBayar
46. Keterangan (fDriverTourKet) → manual | text UPPERCASE | user input | plt_arus_kas.keterangan

Popup Tambah Driver Baru (dari dropdown):
- Nama Driver (wajib)
- No HP / WA (wajib)
- Status otomatis Aktif
- Tipe tidak lagi dipakai di master driver

Popup Tambah Kendaraan Baru (dari dropdown):
- Nama Kendaraan (wajib)
- Auto capitalize
- Cek duplikat + deteksi mirip

═══════════════════════════════════════

## FORM DRIVER JEEP
Fungsi: pesan driver jeep untuk booking (hanya jika ada Bromo)
File: js/engine.js
Fungsi buka: Engine.bukaFormDriverJeep(bookingId)
Fungsi simpan: Engine.simpanDriverJeep(event, bookingId)
Fungsi simpan + lagi: Engine.simpanJeepDanTambahLagi(bookingId)
Fungsi proses: Engine.prosesSimanJeep(bookingId, tambahLagi)
Fungsi edit: Engine.editFormDriverJeep(ak)
Fungsi update: Engine.updateDriver(event, arusKasId, bookingId, kategori)
Fungsi update + lagi: Engine.updateJeepDanTambahLagi(arusKasId, bookingId)
Fungsi proses update: Engine.prosesUpdateDriver(arusKasId, bookingId, kategori, tambahJeepLagi)
Catatan: kendaraan readonly JEEP, 1 simpan = 1 transaksi jeep

47. ID Booking → hidden | dari booking | tidak ditampilkan
48. Nama Tamu → otomatis | text readonly | dari booking | tidak disimpan
49. Tipe Driver → readonly | text | hardcode DRIVER JEEP | tidak disimpan
50. Nama Driver (fDriverJeepId) → manual | select | plt_master_driver semua aktif + tambah baru | plt_arus_kas.snapshotDriver.nama
51. No HP (fDriverJeepHP) → otomatis | tel readonly | dari driver terpilih | plt_arus_kas.snapshotDriver.noHP
52. Kendaraan (fDriverJeepKendaraan) → readonly | text | hardcode JEEP | plt_arus_kas.snapshotDriver.kendaraan
53. Biaya (fDriverJeepBiaya) → manual | text format ribuan + kalkulator | user input | plt_arus_kas.jumlah | 300000
54. Tanggal (fDriverJeepTgl) → manual | datetime-local | muncul jika biaya > 0 | plt_arus_kas.tanggal
55. Status Bayar (fDriverJeepStatus) → manual | select | muncul jika biaya > 0 | plt_arus_kas.statusBayar
56. Keterangan (fDriverJeepKet) → manual | text UPPERCASE | user input | plt_arus_kas.keterangan

Tombol:
- Simpan → simpan + kembali ke detail booking
- Tambah Jeep → simpan + buka form jeep baru lagi

═══════════════════════════════════════

## FORM PIKNIK BROMO
Fungsi: pesan piknik untuk booking (hanya jika ada Bromo)
File: js/engine.js
Fungsi buka: Engine.bukaFormPiknik(bookingId)
Fungsi simpan: Engine.simpanPiknik(event, bookingId)
Fungsi edit: Engine.editFormPiknik(ak)
Fungsi update: Engine.updatePiknik(event, arusKasId, bookingId)

57. Tanggal (fPiknikTgl) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-02T08:00
58. Biaya (fPiknikBiaya) → manual | number | user input | plt_arus_kas.jumlah | 150000
59. Status Bayar (fPiknikStatus) → manual | select | hardcode | plt_arus_kas.statusBayar | Lunas
60. Keterangan (fPiknikKet) → manual | text | user input | plt_arus_kas.keterangan | Tiket 4 orang

═══════════════════════════════════════

## FORM UBAH STATUS BOOKING
Fungsi: ubah status booking
File: js/engine.js
Fungsi buka: Engine.bukaFormUbahStatus(bookingId)
Fungsi simpan: Engine.simpanUbahStatus(event, bookingId)

61. Status Baru (fUbahStatus) → manual | select | hardcode | plt_booking.statusBooking | Selesai
62. Keterangan (fUbahKet) → manual | text | user input | plt_booking.catatanStatus | Tamu puas

═══════════════════════════════════════

## FORM MASTER PAKET
Fungsi: tambah/edit paket tour
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterPaket(editId)
Fungsi simpan: Engine.simpanMasterPaket(event, editId)

63. Nama Paket (fPaketNama) → manual | text | user input | plt_master_paket.nama | Bromo + Ijen
64. Pilih Destinasi (fPaketDest) → manual+tambah | checkbox | plt_daftar_destinasi | plt_master_paket.destinasi[] | Bromo, Ijen
65. Durasi Hari (fPaketHari) → manual | number | user input | plt_master_paket.durHari | 3
66. Durasi Malam (fPaketMalam) → manual | number | user input | plt_master_paket.durMalam | 2

Catatan: field pax, harga, status sudah DIHAPUS dari form master paket

═══════════════════════════════════════

## FORM MASTER PAKET DARI BOOKING
Fungsi: tambah paket baru dari dalam form booking
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterPaketDariBooking()
Fungsi simpan: Engine.simpanMasterPaketDariBooking(event)
Catatan: field sama dengan form master paket, setelah simpan otomatis kembali ke form booking dengan paket baru terpilih

═══════════════════════════════════════

## FORM MASTER DRIVER
Fungsi: tambah/edit driver
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterDriver(editId)
Fungsi simpan: Engine.simpanMasterDriver(event, editId)
Catatan: field kendaraan dan tipe sudah DIHAPUS sejak v1.3.0

67. Nama Driver (fDriverNama) → manual | text | user input | plt_master_driver.nama | Pak Anto
68. No HP (fDriverHP) → manual | tel | user input | plt_master_driver.noHP | 08123456789
69. Status (fDriverStatus) → manual | select | hardcode | plt_master_driver.status | Aktif

═══════════════════════════════════════

## FORM MASTER HOTEL
Fungsi: tambah/edit hotel
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterHotel(editId)
Fungsi simpan: Engine.simpanMasterHotel(event, editId)
Catatan: field harga, keterangan, status tidak tampil di form tapi tetap dipertahankan saat edit

70. Nama Hotel (fHotelNamaM) → manual | text | user input | plt_master_hotel.nama | Hotel Bromo View
71. Destinasi (fHotelDestM) → manual+tambah | select | plt_daftar_destinasi | plt_master_hotel.destinasi | Bromo
72. Destinasi Manual (fHotelDestManual) → manual | text | muncul jika tambah baru | simpan ke plt_daftar_destinasi | Malang

═══════════════════════════════════════

## FORM SETTING APLIKASI
Fungsi: pengaturan profil dan preferensi app
File: js/engine.js
Fungsi render: Engine.renderPengaturan(konten)
Fungsi simpan: Engine.simpanPengaturan()

73. Nama App (sNamaApp) → manual | text | user input | plt_settings.namaApp | Panorama Lens Trip
74. No WA (sNoWA) → manual | tel | user input | plt_settings.noWA | 08123456789
75. Email (sEmail) → manual | email | user input | plt_settings.email | panorama@email.com
76. Website (sWebsite) → manual | text | user input | plt_settings.website | panoramalens.com
77. Prefix Booking (sPrefix) → manual | text | user input | plt_settings.prefixBooking | PL
78. Tempat Jemput Baru (sTempatBaru) → manual | text | user input | plt_settings.tempatJemput[] | Terminal
79. Destinasi Baru (sDestBaru) → manual | text | user input | plt_daftar_destinasi | Malang

Kelola daftar destinasi: tambah/edit/hapus dari Pengaturan

═══════════════════════════════════════

## FORM LISENSI
Fungsi: input kode lisensi
File: js/license.js
Fungsi buka: License.bukaFormInput()

80. Kode Lisensi (fLicenseCode) → manual | text | user input | License storage | XXXX-XXXX-XXXX

═══════════════════════════════════════

## FORM YANG PUNYA VERSI GANDA
- bukaFormMasterPaket() → dari halaman Master Paket
- bukaFormMasterPaketDariBooking() → dari form booking (opsi tambah paket baru)
- keduanya harus selalu sinkron jika ada perubahan field atau source destinasi
