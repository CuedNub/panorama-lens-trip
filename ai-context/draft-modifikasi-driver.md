# DRAFT MODIFIKASI FORM DRIVER
STATUS: WIREFRAME SUDAH DISETUJUI, BELUM CODING
TANGGAL: 2026-05-03

## RINGKASAN PERUBAHAN
1. Master Driver disederhanakan (hanya nama + no HP)
2. Kendaraan tidak lagi di master driver, dipilih per transaksi
3. Form sewa driver tour dan jeep pakai 1 fungsi shared
4. Driver jeep bisa tambah lebih dari 1 unit
5. Tambah fitur cari driver
6. Tambah fitur tambah driver baru dari form (popup sederhana)
7. Tambah fitur tambah kendaraan baru + deteksi mirip
8. Logika biaya/tanggal/status sama seperti hotel
9. Kelola daftar kendaraan di Pengaturan (edit/hapus + update transaksi)
10. Format ribuan + kalkulator untuk biaya
11. Uppercase otomatis untuk nama dan keterangan

## FORM SEWA DRIVER TOUR
- Tipe Driver: readonly DRIVER TOUR
- Nama Driver: dropdown + cari + tambah baru
- No HP: otomatis readonly
- Jenis Kendaraan: dropdown + tambah baru + deteksi mirip
- Biaya Sewa: format ribuan + kalkulator
- Tanggal: muncul jika biaya > 0
- Status Bayar: muncul jika biaya > 0 (DP/LUNAS), otomatis BELUM BAYAR jika biaya 0
- Keterangan: manual uppercase

## FORM SEWA DRIVER JEEP
- Tipe Driver: readonly DRIVER JEEP
- Per unit jeep:
  - Nama Driver: dropdown + cari + tambah baru
  - No HP: otomatis readonly
  - Kendaraan: readonly JEEP
  - Biaya Sewa: format ribuan + kalkulator
  - Tanggal: muncul jika biaya > 0
  - Status Bayar: muncul jika biaya > 0
  - Keterangan: manual uppercase
- Tombol + Tambah Driver Jeep
- Tombol hapus per unit (kecuali unit pertama)

## POPUP TAMBAH DRIVER BARU
- Nama Driver (wajib)
- No HP / WA (wajib)
- Tipe otomatis dari konteks
- Status otomatis Aktif

## POPUP TAMBAH KENDARAAN BARU
- Nama Kendaraan (wajib)
- Auto capitalize
- Cek duplikat
- Deteksi mirip: jika ada nama mirip, tampil saran

## DATA SIMPAN
- Driver Tour: 1 transaksi ke plt_arus_kas
- Driver Jeep: 1 transaksi per unit ke plt_arus_kas
- Driver baru: ke plt_master_driver
- Kendaraan baru: ke plt_daftar_kendaraan

## PENGATURAN
- Kelola daftar kendaraan (tambah/edit/hapus)
- Edit kendaraan: update semua transaksi yang pakai nama lama
- Hapus kendaraan: cek dulu apakah masih dipakai
