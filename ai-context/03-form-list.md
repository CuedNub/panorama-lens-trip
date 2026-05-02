# DAFTAR FORM
VERSI INFO: 1.0.0
UPDATE TERAKHIR: 2025-07-12

## CARA BACA FORMAT
- Nama Field (id) → manual/otomatis | tipe | source | simpan ke | contoh

═══════════════════════════════════════

## FORM BOOKING TOUR (buat baru)
Fungsi: buat booking baru
File: js/engine.js
Fungsi buka: Engine.bukaFormOrder()
Fungsi simpan: Engine.simpanOrder(event)

1. ID Booking (`fOrderId`) → otomatis | text readonly | generate dari prefix setting | plt_booking.id | PL-001
2. Nama Tamu (`fOrderNama`) → manual | text | user input | plt_booking.namaTamu | John Doe
3. No HP (`fOrderHP`) → manual | tel | user input | plt_booking.noHP | 08123456789
4. Jumlah Pax (`fOrderPax`) → manual | number | user input | plt_booking.jumlahPax | 4
5. Negara (`fOrderNegara`) → manual | select | hardcode list | plt_booking.negara | Indonesia
6. Negara Manual (`fOrderNegaraManual`) → manual | text | muncul jika pilih Lainnya | plt_booking.negara | Malaysia
7. Paket Tour (`fOrderPaket`) → manual | select + tambah baru | plt_master_paket | plt_booking.paketId | PKT-001
8. Info Paket (`fOrderInfoPaket`) → otomatis | div info | dari master paket | tidak disimpan | -
9. Fasilitas (`fOrderFasilitas`) → otomatis | div checkbox | dari paket terpilih | plt_booking.fasilitas* | -
10. Harga Paket (`fOrderHarga`) → manual | number | user input | plt_booking.totalHarga | 2500000
11. Tgl Berangkat (`fOrderTglBerangkat`) → manual | date | user input | plt_booking.tglBerangkat | 2025-08-01
12. Tgl Pulang (`fOrderTglPulang`) → manual/otomatis | date | dihitung dari durasi paket | plt_booking.tglPulang | 2025-08-03
13. Info Penerbangan (`fOrderFlight`) → manual | text | user input | plt_booking.infoPenerbangan | GA-302
14. Waktu Tiba (`fOrderTiba`) → manual | datetime-local | user input | plt_booking.waktuTiba | 2025-08-01T06:00
15. Bandara (`fOrderBandara`) → manual | text | user input | plt_booking.bandara | Juanda
16. Jumlah Bayar (`fOrderBayar`) → manual | number | user input | plt_arus_kas (pembayaran awal) | 500000
17. Sisa Bayar (`fOrderSisaBayar`) → otomatis | div info | harga - bayar | tidak disimpan | -
18. Status Bayar (`fOrderStatusBayar`) → otomatis | div info | dari hitungan | tidak disimpan | -

## FORM EDIT BOOKING
Fungsi: edit booking yang sudah ada (data lama terisi)
File: js/engine.js
Fungsi buka: Engine.editBooking(bookingId)
Fungsi simpan: Engine.updateBooking(event, bookingId)
Catatan: field sama dengan form booking baru, tapi tanpa fOrderBayar (pembayaran lewat form terpisah)

## FORM FASILITAS (checkbox di dalam form booking)
19. Hotel (`fFasHotel`) → manual | checkbox | dari paket | plt_booking.fasilitasHotel
20. Driver Tour (`fFasDriverTour`) → manual | checkbox | dari paket | plt_booking.fasilitasDriverTour
21. Driver Jeep (`fFasDriverJeep`) → manual | checkbox | muncul jika ada Bromo | plt_booking.fasilitasDriverJeep
22. Piknik (`fFasPiknik`) → manual | checkbox | muncul jika ada Bromo | plt_booking.fasilitasPiknik

═══════════════════════════════════════

## FORM PEMBAYARAN
Fungsi: tambah pembayaran untuk booking
File: js/engine.js
Fungsi buka: Engine.bukaFormPembayaran(bookingId)
Fungsi simpan: Engine.simpanPembayaran(event, bookingId)

23. Jumlah Bayar (`fBayarJumlah`) → manual | number | user input | plt_arus_kas.jumlah | 500000
24. Tanggal Bayar (`fBayarTanggal`) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-01T10:00
25. Metode Bayar (`fBayarMetode`) → manual | select | hardcode | plt_arus_kas.metode | Transfer
26. Keterangan (`fBayarKet`) → manual | text | user input | plt_arus_kas.keterangan | Cicilan ke-2

═══════════════════════════════════════

## FORM HOTEL BOOKING (pesan hotel, bisa lebih dari 1)
Fungsi: pesan hotel untuk booking
File: js/engine.js
Fungsi buka: Engine.bukaFormHotel(bookingId)
Fungsi simpan: Engine.simpanHotel(event, bookingId)
Fungsi edit: Engine.editFormHotel(ak)
Fungsi update: Engine.updateHotel(event, arusKasId, bookingId)

27. Destinasi (`fHotelDest[n]`) → manual+tambah | select | plt_daftar_destinasi + destinasi paket | plt_arus_kas.snapshotHotel.destinasi | Bromo
28. Destinasi Manual (`fHotelDestManual[n]`) → manual | text | muncul jika tambah baru | simpan ke plt_daftar_destinasi | Malang
29. Nama Hotel (`fHotelNama[n]`) → manual+tambah | select | plt_master_hotel per destinasi | plt_arus_kas.snapshotHotel.nama | Hotel Bromo View
30. Nama Hotel Manual (`fHotelNamaManual[n]`) → manual | text | muncul jika tambah baru | simpan ke plt_master_hotel | Hotel Baru
31. Tgl Check-in (`fHotelTgl[n]`) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-01T14:00
32. Biaya (`fHotelBiaya[n]`) → manual/otomatis | number | dari master hotel, bisa diubah | plt_arus_kas.jumlah | 350000
33. Status Bayar (`fHotelStatus[n]`) → manual | select | hardcode | plt_arus_kas.statusBayar | Lunas
34. Keterangan (`fHotelKet[n]`) → manual | text | user input | plt_arus_kas.keterangan | 1 kamar, 1 malam

═══════════════════════════════════════

## FORM DRIVER TOUR
Fungsi: pesan driver tour untuk booking
File: js/engine.js
Fungsi buka: Engine.bukaFormDriverTour(bookingId)
Fungsi simpan: Engine.simpanDriverTour(event, bookingId)
Fungsi edit: Engine.editFormDriverTour(ak)
Fungsi update: Engine.updateDriver(event, arusKasId, bookingId, kategori)

35. Pilih Driver (`fDriverTourId`) → manual | select | plt_master_driver tipe Tour | plt_arus_kas.snapshotDriver | Pak Anto
36. Info Driver (`fDriverTourInfo`) → otomatis | div info | dari master driver | tidak disimpan | -
37. Tanggal (`fDriverTourTgl`) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-01T07:00
38. Biaya (`fDriverTourBiaya`) → manual | number | user input | plt_arus_kas.jumlah | 400000
39. Status Bayar (`fDriverTourStatus`) → manual | select | hardcode | plt_arus_kas.statusBayar | Lunas
40. Keterangan (`fDriverTourKet`) → manual | text | user input | plt_arus_kas.keterangan | Antar jemput

═══════════════════════════════════════

## FORM DRIVER JEEP
Fungsi: pesan driver jeep untuk booking (hanya jika ada Bromo)
File: js/engine.js
Fungsi buka: Engine.bukaFormDriverJeep(bookingId)
Fungsi simpan: Engine.simpanDriverJeep(event, bookingId)
Fungsi edit: Engine.editFormDriverJeep(ak)
Fungsi update: Engine.updateDriver(event, arusKasId, bookingId, kategori)

41. Pilih Driver (`fDriverJeepId`) → manual | select | plt_master_driver tipe Jeep | plt_arus_kas.snapshotDriver | Pak Budi
42. Info Driver (`fDriverJeepInfo`) → otomatis | div info | dari master driver | tidak disimpan | -
43. Tanggal (`fDriverJeepTgl`) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-02T03:00
44. Biaya (`fDriverJeepBiaya`) → manual | number | user input | plt_arus_kas.jumlah | 300000
45. Status Bayar (`fDriverJeepStatus`) → manual | select | hardcode | plt_arus_kas.statusBayar | Belum Bayar
46. Keterangan (`fDriverJeepKet`) → manual | text | user input | plt_arus_kas.keterangan | Sunrise Bromo

═══════════════════════════════════════

## FORM PIKNIK BROMO
Fungsi: pesan piknik untuk booking (hanya jika ada Bromo)
File: js/engine.js
Fungsi buka: Engine.bukaFormPiknik(bookingId)
Fungsi simpan: Engine.simpanPiknik(event, bookingId)
Fungsi edit: Engine.editFormPiknik(ak)
Fungsi update: Engine.updatePiknik(event, arusKasId, bookingId)

47. Tanggal (`fPiknikTgl`) → manual | datetime-local | user input | plt_arus_kas.tanggal | 2025-08-02T08:00
48. Biaya (`fPiknikBiaya`) → manual | number | user input | plt_arus_kas.jumlah | 150000
49. Status Bayar (`fPiknikStatus`) → manual | select | hardcode | plt_arus_kas.statusBayar | Lunas
50. Keterangan (`fPiknikKet`) → manual | text | user input | plt_arus_kas.keterangan | Tiket 4 orang

═══════════════════════════════════════

## FORM UBAH STATUS BOOKING
Fungsi: ubah status booking
File: js/engine.js
Fungsi buka: Engine.bukaFormUbahStatus(bookingId)
Fungsi simpan: Engine.simpanUbahStatus(event, bookingId)

51. Status Baru (`fUbahStatus`) → manual | select | hardcode | plt_booking.statusBooking | Selesai
52. Keterangan (`fUbahKet`) → manual | text | user input | plt_booking.catatanStatus | Tamu puas

═══════════════════════════════════════

## FORM MASTER PAKET
Fungsi: tambah/edit paket tour
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterPaket(editId)
Fungsi simpan: Engine.simpanMasterPaket(event, editId)

53. Nama Paket (`fPaketNama`) → manual | text | user input | plt_master_paket.nama | Bromo + Ijen
54. Pilih Destinasi (`fPaketDest`) → manual+tambah | checkbox | plt_daftar_destinasi | plt_master_paket.destinasi[] | Bromo, Ijen
55. Durasi Hari (`fPaketHari`) → manual | number | user input | plt_master_paket.durHari | 3
56. Durasi Malam (`fPaketMalam`) → manual | number | user input | plt_master_paket.durMalam | 2

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

57. Nama Driver (`fDriverNama`) → manual | text | user input | plt_master_driver.nama | Pak Anto
58. No HP (`fDriverHP`) → manual | tel | user input | plt_master_driver.noHP | 08123456789
59. Kendaraan (`fDriverKendaraan`) → manual+tambah | select | plt_daftar_kendaraan | plt_master_driver.kendaraan | Hiace
60. Kendaraan Manual (`fDriverKendaraanManual`) → manual | text | muncul jika tambah baru | simpan ke plt_daftar_kendaraan | Fortuner
61. Tipe Driver (`fDriverTipe`) → manual | select | hardcode | plt_master_driver.tipe | Driver Tour
62. Status (`fDriverStatus`) → manual | select | hardcode | plt_master_driver.status | Aktif

═══════════════════════════════════════

## FORM MASTER HOTEL
Fungsi: tambah/edit hotel
File: js/engine.js
Fungsi buka: Engine.bukaFormMasterHotel(editId)
Fungsi simpan: Engine.simpanMasterHotel(event, editId)

63. Nama Hotel (`fHotelNamaM`) → manual | text | user input | plt_master_hotel.nama | Hotel Bromo View
64. Destinasi (`fHotelDestM`) → manual+tambah | select | plt_daftar_destinasi | plt_master_hotel.destinasi | Bromo
65. Destinasi Manual (`fHotelDestManual`) → manual | text | muncul jika tambah baru | simpan ke plt_daftar_destinasi | Malang
66. Harga (`fHotelHargaM`) → manual | number | user input | plt_master_hotel.harga | 350000
67. Keterangan (`fHotelKetM`) → manual | text | user input | plt_master_hotel.keterangan | View Bromo
68. Status (`fHotelStatusM`) → manual | select | hardcode | plt_master_hotel.status | Aktif

═══════════════════════════════════════

## FORM SETTING APLIKASI
Fungsi: pengaturan profil dan preferensi app
File: js/engine.js
Fungsi render: Engine.renderPengaturan(konten)
Fungsi simpan: Engine.simpanPengaturan()

69. Nama App (`sNamaApp`) → manual | text | user input | plt_settings.namaApp | Panorama Lens Trip
70. No WA (`sNoWA`) → manual | tel | user input | plt_settings.noWA | 08123456789
71. Email (`sEmail`) → manual | email | user input | plt_settings.email | panorama@email.com
72. Website (`sWebsite`) → manual | text | user input | plt_settings.website | panoramalens.com
73. Prefix Booking (`sPrefix`) → manual | text | user input | plt_settings.prefixBooking | PL
74. Tempat Jemput Baru (`sTempatBaru`) → manual | text | user input | plt_settings.tempatJemput[] | Terminal
75. Destinasi Baru (`sDestBaru`) → manual | text | user input | plt_daftar_destinasi | Malang

Kelola daftar destinasi: tambah/edit/hapus dari Pengaturan

═══════════════════════════════════════

## FORM LISENSI
Fungsi: input kode lisensi
File: js/license.js
Fungsi buka: License.bukaFormInput()

76. Kode Lisensi (`fLicenseCode`) → manual | text | user input | License storage | XXXX-XXXX-XXXX

═══════════════════════════════════════

## FORM YANG PUNYA VERSI GANDA
- bukaFormMasterPaket() → dari halaman Master Paket
- bukaFormMasterPaketDariBooking() → dari form booking (opsi tambah paket baru)
- keduanya harus selalu sinkron jika ada perubahan field atau source destinasi
