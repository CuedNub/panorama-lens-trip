/*
  FILE    : js/core.js
  VERSI   : 1.0.0
  FUNGSI  : Konstanta, struktur data, storage, dan utilitas utama
*/

/* STORAGE KEYS:
  plt_settings        = profil & pengaturan aplikasi
  plt_booking         = data booking tamu
  plt_arus_kas        = data transaksi arus kas
  plt_master_paket    = data master paket tour
  plt_master_driver   = data master driver
  plt_master_hotel    = data master hotel
  plt_master_destinasi= data master destinasi
  plt_last_backup     = tanggal terakhir backup
  plt_last_restore    = tanggal terakhir restore
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS Core
// =════════════════════════════════

// ---------------------------------
// KONSTANTA APLIKASI
// ---------------------------------
const APP_NAME_DEFAULT = 'Panorama Lens Trip';
const APP_VERSION      = '1.1.3';
const PREFIX_DEFAULT   = 'PL';

// ---------------------------------
// PENGATURAN DEFAULT
// ---------------------------------
const SETTINGS_DEFAULT = {
  namaApp      : APP_NAME_DEFAULT,
  noWA         : '',
  email        : '',
  website      : '',
  warnaTema    : '#16a34a',
  prefixBooking: PREFIX_DEFAULT,
  tempatJemput : ['Bandara Juanda', 'Stasiun Gubeng', 'Hotel'],
  logo         : ''
};

// ---------------------------------
// STORAGE: GET & SAVE
// ---------------------------------
const Core = {

  // Ambil data dari localStorage
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Core.get error:', key, e);
      return null;
    }
  },

  // Simpan data ke localStorage
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Core.save error:', key, e);
      return false;
    }
  },

  // Hapus data dari localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Core.remove error:', key, e);
      return false;
    }
  },

  // ---------------------------------
  // PENGATURAN
  // ---------------------------------
  getSettings() {
    const saved = this.get('plt_settings');
    return Object.assign({}, SETTINGS_DEFAULT, saved || {});
  },

  saveSettings(data) {
    return this.save('plt_settings', data);
  },

  // ---------------------------------
  // MIGRASI DATA
  // ---------------------------------
  migrateBookingData() {
    if (localStorage.getItem('plt_migrated_v2')) return;
    var bookings = this.get('plt_booking') || [];
    var changed = false;
    bookings.forEach(function(b) {
      if ('tempatJemput' in b) { delete b.tempatJemput; changed = true; }
      if ('waktuJemput' in b) { delete b.waktuJemput; changed = true; }
    });
    if (changed) {
      this.save('plt_booking', bookings);
    }
    localStorage.removeItem('plt_master_destinasi');
    if (!localStorage.getItem('plt_daftar_destinasi')) {
      this.save('plt_daftar_destinasi', ['Bromo', 'Ijen', 'Semeru']);
    }
    localStorage.setItem('plt_migrated_v2', '1');
  },

  // ---------------------------------
  // BOOKING
  // ---------------------------------
  getBooking() {
    return this.get('plt_booking') || [];
  },

  saveBooking(data) {
    return this.save('plt_booking', data);
  },

  getBookingById(id) {
    return this.getBooking().find(b => b.id === id) || null;
  },

  // ---------------------------------
  // ARUS KAS
  // ---------------------------------
  getArusKas() {
    return this.get('plt_arus_kas') || [];
  },

  saveArusKas(data) {
    return this.save('plt_arus_kas', data);
  },

  getArusKasByBookingId(bookingId) {
    return this.getArusKas().filter(a => a.bookingId === bookingId);
  },

  // ---------------------------------
  // MASTER PAKET
  // ---------------------------------
  getMasterPaket() {
    return this.get('plt_master_paket') || [];
  },

  saveMasterPaket(data) {
    return this.save('plt_master_paket', data);
  },

  getMasterPaketById(id) {
    return this.getMasterPaket().find(p => p.id === id) || null;
  },

  // ---------------------------------
  // MASTER DRIVER
  // ---------------------------------
  getMasterDriver() {
    return this.get('plt_master_driver') || [];
  },

  saveMasterDriver(data) {
    return this.save('plt_master_driver', data);
  },

  getMasterDriverById(id) {
    return this.getMasterDriver().find(d => d.id === id) || null;
  },

  getMasterDriverByTipe(tipe) {
    return this.getMasterDriver().filter(
      d => d.tipe === tipe && d.status === 'Aktif'
    );
  },

  // ---------------------------------
  // MASTER HOTEL
  // ---------------------------------
  getMasterHotel() {
    return this.get('plt_master_hotel') || [];
  },

  saveMasterHotel(data) {
    return this.save('plt_master_hotel', data);
  },

  getMasterHotelById(id) {
    return this.getMasterHotel().find(h => h.id === id) || null;
  },

  getMasterHotelByDestinasi(destinasi) {
    return this.getMasterHotel().filter(
      h => h.destinasi === destinasi && h.status === 'Aktif'
    );
  },

  // ---------------------------------
  // MASTER DESTINASI
  // ---------------------------------
  getMasterDestinasi() {
    return this.get('plt_master_destinasi') || [];
  },

  saveMasterDestinasi(data) {
    return this.save('plt_master_destinasi', data);
  },

  getMasterDestinasiById(id) {
    return this.getMasterDestinasi().find(d => d.id === id) || null;
  },

  getMasterDestinasiAktif() {
    return this.getMasterDestinasi().filter(d => d.status === 'Aktif');
  },

  // ---------------------------------
  // DAFTAR DESTINASI (plt_daftar_destinasi)
  // ---------------------------------
  getDaftarDestinasi() {
    return this.get('plt_daftar_destinasi') || ['Bromo', 'Ijen', 'Semeru'];
  },

  saveDaftarDestinasi(data) {
    return this.save('plt_daftar_destinasi', data);
  },

  capitalizeNama(nama) {
    if (!nama) return '';
    return nama.trim().replace(/\s+/g, ' ')
      .split(' ')
      .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
      .join(' ');
  },

  tambahDestinasi(nama) {
    var clean = this.capitalizeNama(nama);
    if (!clean) return { ok: false, msg: 'Nama destinasi tidak boleh kosong' };
    var list = this.getDaftarDestinasi();
    var sudahAda = list.some(function(d) { return d.toLowerCase() === clean.toLowerCase(); });
    if (sudahAda) return { ok: false, msg: 'Destinasi "' + clean + '" sudah ada di daftar' };
    list.push(clean);
    list.sort();
    this.saveDaftarDestinasi(list);
    return { ok: true, nama: clean };
  },

  editDestinasi(namaLama, namaBaru) {
    var clean = this.capitalizeNama(namaBaru);
    if (!clean) return { ok: false, msg: 'Nama destinasi tidak boleh kosong' };
    var list = this.getDaftarDestinasi();
    var idx = list.findIndex(function(d) { return d === namaLama; });
    if (idx < 0) return { ok: false, msg: 'Destinasi lama tidak ditemukan' };
    var sudahAda = list.some(function(d, i) { return i !== idx && d.toLowerCase() === clean.toLowerCase(); });
    if (sudahAda) return { ok: false, msg: 'Destinasi "' + clean + '" sudah ada di daftar' };
    var namaLamaStr = list[idx];
    list[idx] = clean;
    list.sort();
    this.saveDaftarDestinasi(list);
    var hotels = this.getMasterHotel();
    var changed = false;
    hotels.forEach(function(h) {
      if (h.destinasi === namaLamaStr) { h.destinasi = clean; changed = true; }
    });
    if (changed) this.saveMasterHotel(hotels);
    return { ok: true, nama: clean };
  },

  hapusDestinasi(nama) {
    var hotels = this.getMasterHotel().filter(function(h) { return h.destinasi === nama; });
    if (hotels.length > 0) {
      return { ok: false, msg: 'Destinasi "' + nama + '" masih dipakai ' + hotels.length + ' data hotel. Edit atau pindahkan datanya dulu.' };
    }
    var list = this.getDaftarDestinasi().filter(function(d) { return d !== nama; });
    this.saveDaftarDestinasi(list);
    return { ok: true };
  },

  // ---------------------------------
  // DAFTAR KENDARAAN (plt_daftar_kendaraan)
  // ---------------------------------
  getDaftarKendaraan() {
    return this.get('plt_daftar_kendaraan') || ['Hiace', 'Avanza', 'Innova', 'Jeep', 'Elf'];
  },

  saveDaftarKendaraan(data) {
    return this.save('plt_daftar_kendaraan', data);
  },

  tambahKendaraan(nama) {
    var clean = this.capitalizeNama(nama);
    if (!clean) return { ok: false, msg: 'Nama kendaraan tidak boleh kosong' };
    var list = this.getDaftarKendaraan();
    var sudahAda = list.some(function(k) { return k.toLowerCase() === clean.toLowerCase(); });
    if (sudahAda) return { ok: false, msg: 'Kendaraan "' + clean + '" sudah ada di daftar' };
    list.push(clean);
    list.sort();
    this.saveDaftarKendaraan(list);
    return { ok: true, nama: clean };
  },

  // ---------------------------------
  // GENERATE ID OTOMATIS
  // ---------------------------------
  generateId(prefix, dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return prefix + '-001';
    }
    const nums = dataArray
      .map(item => {
        const parts = item.id ? item.id.split('-') : [];
        return parts.length >= 2 ? parseInt(parts[parts.length - 1]) || 0 : 0;
      })
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const next = max + 1;
    return prefix + '-' + String(next).padStart(3, '0');
  },

  generateBookingId() {
    const settings = this.getSettings();
    const prefix   = settings.prefixBooking || PREFIX_DEFAULT;
    return this.generateId(prefix, this.getBooking());
  },

  generatePaketId() {
    return this.generateId('PKT', this.getMasterPaket());
  },

  generateDriverId() {
    return this.generateId('DRV', this.getMasterDriver());
  },

  generateHotelId() {
    return this.generateId('HTL', this.getMasterHotel());
  },

  generateDestinasiId() {
    return this.generateId('DST', this.getMasterDestinasi());
  },

  generateArusKasId() {
    return this.generateId('AK', this.getArusKas());
  },

  // ---------------------------------
  // FORMAT UTILITAS
  // ---------------------------------
  formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + Number(angka)
      .toLocaleString('id-ID');
  },

  parseRupiah(str) {
    if (!str) return 0;
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
  },

  formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const bulan = [
      'Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember'
    ];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatTanggalPendek(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const bulan = [
      'Jan','Feb','Mar','Apr','Mei','Jun',
      'Jul','Ags','Sep','Okt','Nov','Des'
    ];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatWaktu(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    return String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0');
  },

  formatTanggalWaktu(dateStr) {
    if (!dateStr) return '-';
    return this.formatTanggal(dateStr) + ', ' + this.formatWaktu(dateStr);
  },

  // ---------------------------------
  // HITUNG KEUANGAN PER BOOKING
  // ---------------------------------
  hitungKeuanganBooking(bookingId) {
    const transaksi = this.getArusKasByBookingId(bookingId);
    let masuk  = 0;
    let keluar = 0;
    transaksi.forEach(t => {
      if (t.jenis === 'pemasukan') masuk  += Number(t.jumlah) || 0;
      if (t.jenis === 'pengeluaran') keluar += Number(t.jumlah) || 0;
    });
    return { masuk, keluar, laba: masuk - keluar };
  },

  // ---------------------------------
  // STATUS BAYAR OTOMATIS
  // ---------------------------------
  getStatusBayar(bookingId, totalHarga) {
    const { masuk } = this.hitungKeuanganBooking(bookingId);
    if (masuk <= 0)              return 'Belum bayar';
    if (masuk >= Number(totalHarga)) return 'Lunas';
    return 'DP';
  },

  // ---------------------------------
  // CEK BROMO DI PAKET
  // ---------------------------------
  adaBromo(destinasiList) {
    if (!Array.isArray(destinasiList)) return false;
    return destinasiList.some(
      d => String(d).toLowerCase().includes('bromo')
    );
  },

  // ---------------------------------
  // BACKUP INFO
  // ---------------------------------
  getLastBackup() {
    return this.get('plt_last_backup') || null;
  },

  saveLastBackup() {
    return this.save('plt_last_backup', new Date().toISOString());
  },

  getLastRestore() {
    return this.get('plt_last_restore') || null;
  },

  saveLastRestore() {
    return this.save('plt_last_restore', new Date().toISOString());
  },

  // ---------------------------------
  // CEK PERLU BACKUP
  // ---------------------------------
  perluBackup() {
    const last = this.getLastBackup();
    if (!last) return true;
    const selisih = Date.now() - new Date(last).getTime();
    const tigaHari = 3 * 24 * 60 * 60 * 1000;
    return selisih >= tigaHari;
  }

};

// Daftarkan ke window
window.Core = Core;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS Core
// =════════════════════════════════
