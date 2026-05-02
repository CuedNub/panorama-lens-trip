/*
  FILE    : js/engine.js
  VERSI   : 1.0.0
  FUNGSI  : Logika utama, render UI, form handler, otomatisasi
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS Engine
// =════════════════════════════════

const Engine = {

  // ---------------------------------
  // STATE APLIKASI
  // ---------------------------------
  state: {
    halamanAktif    : 'booking',
    sidebarAktif    : false,
    filterBooking     : 'Semua',
    filterArusKas     : 'Semua',
    filterMaster      : {},
    searchBooking     : '',
    searchBookingDraft: '',
    searchArusKas     : '',
    searchArusKasDraft: '',
    bulanArusKas    : new Date().toISOString().substring(0, 7),
    expandedBooking : null,
    expandedArusKas : null,
    hotelCount      : 1,
    isFormOpen      : false,
    dirtyForm       : false
  },

  // ---------------------------------
  // INIT APLIKASI
  // ---------------------------------
  init() {
    Core.migrateBookingData();
    this.applyTema();
    this.renderHeader();
    this.renderBottomNav();
    this.renderSidebar();
    this.showHalaman('booking');
    this.initBackUnload();
    this.cekBackupReminder();
    this.cekNotifTglPulang();

    if (window.License) {
      const ok = License.init();
      if (!ok) return;
    }
  },

  // ---------------------------------
  // TEMA WARNA
  // ---------------------------------
  applyTema() {
    const s = Core.getSettings();
    document.documentElement.style
      .setProperty('--warna-tema', s.warnaTema || '#16a34a');
  },

  // ---------------------------------
  // RENDER HEADER
  // ---------------------------------
  renderHeader() {
    const s       = Core.getSettings();
    const namaApp = s.namaApp || 'Panorama Lens Trip';
    const el      = document.getElementById('header');
    if (!el) return;

    let sisaLisensi = '';
    if (window.License) {
      const sisa = License.getSisaHari();
      if (sisa !== null) {
        sisaLisensi =
          '<span class="lisensi-badge">🔑' + sisa + ' hari</span>';
      }
    }

    el.innerHTML =
      '<div class="header-kiri">' +
        '<button class="btn-sidebar" onclick="Engine.toggleSidebar()">≡</button>' +
        '<span class="nama-app">' + namaApp + '</span>' +
        sisaLisensi +
      '</div>' +
      '<div class="header-kanan">' +
        '<span class="nama-halaman" id="namaHalaman">Booking</span>' +
      '</div>';
  },

  updateNamaHalaman(nama) {
    const el = document.getElementById('namaHalaman');
    if (el) el.textContent = nama;
  },

  // ---------------------------------
  // SIDEBAR
  // ---------------------------------
  renderSidebar() {
    const s       = Core.getSettings();
    const namaApp = s.namaApp || 'Panorama Lens Trip';
    const el      = document.getElementById('sidebar');
    if (!el) return;

    el.innerHTML =
      '<div class="sidebar-header">' +
        '<span>' + namaApp + '</span>' +
        '<button onclick="Engine.toggleSidebar()">✕</button>' +
      '</div>' +
      '<nav class="sidebar-nav">' +
        '<a onclick="Engine.showHalaman(\'masterPaket\')">📦 Master Paket</a>' +
        '<a onclick="Engine.showHalaman(\'masterDriver\')">🚗 Master Driver</a>' +
        '<a onclick="Engine.showHalaman(\'masterHotel\')">🏨 Master Hotel</a>' +
        '<a onclick="Engine.showHalaman(\'pengaturan\')">⚙️ Pengaturan</a>' +
        '<a onclick="Engine.showHalaman(\'tentang\')">ℹ️ Tentang</a>' +
        '<a onclick="Engine.bukaPanduan()">📖 Panduan</a>' +
      '</nav>';
  },

  toggleSidebar() {
    const el = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!el) return;
    this.state.sidebarAktif = !this.state.sidebarAktif;
    el.classList.toggle('aktif', this.state.sidebarAktif);
    if (overlay) overlay.classList.toggle('aktif', this.state.sidebarAktif);
  },

  bukaPanduan() {
    window.open('panduan.html', '_blank');
    this.toggleSidebar();
  },

  // ---------------------------------
  // BOTTOM NAVIGATION
  // ---------------------------------
  renderBottomNav() {
    const el = document.getElementById('bottomNav');
    if (!el) return;
    el.innerHTML =
      '<button id="btnNavBooking" onclick="Engine.showHalaman(\'booking\')">' +
        '📋<span>Booking</span>' +
      '</button>' +
      '<button id="btnNavArusKas" onclick="Engine.showHalaman(\'arusKas\')">' +
        '💰<span>Arus Kas</span>' +
      '</button>';
  },

  updateBottomNav() {
    document.querySelectorAll('#bottomNav button')
      .forEach(b => b.classList.remove('aktif'));
    const h = this.state.halamanAktif;
    if (h === 'booking') {
      const b = document.getElementById('btnNavBooking');
      if (b) b.classList.add('aktif');
    } else if (h === 'arusKas') {
      const b = document.getElementById('btnNavArusKas');
      if (b) b.classList.add('aktif');
    }
  },

  // ---------------------------------
  // NAVIGASI HALAMAN
  // ---------------------------------
  showHalaman(nama) {
    if (this.state.sidebarAktif) this.toggleSidebar();
    this.state.halamanAktif = nama;

    const peta = {
      booking        : 'Booking',
      arusKas        : 'Arus Kas',
      masterPaket    : 'Master Paket',
      masterDriver   : 'Master Driver',
      masterHotel    : 'Master Hotel',
      masterDestinasi: 'Master Destinasi',
      pengaturan     : 'Pengaturan',
      tentang        : 'Tentang'
    };

    this.updateNamaHalaman(peta[nama] || nama);
    this.updateBottomNav();

    const konten = document.getElementById('konten');
    if (!konten) return;

    if (nama === 'booking')              this.renderHalamanBooking(konten);
    else if (nama === 'arusKas')         this.renderHalamanArusKas(konten);
    else if (nama === 'masterPaket')     this.renderMasterPaket(konten);
    else if (nama === 'masterDriver')    this.renderMasterDriver(konten);
    else if (nama === 'masterHotel')     this.renderMasterHotel(konten);
    else if (nama === 'pengaturan')      this.renderPengaturan(konten);
    else if (nama === 'tentang')         this.renderTentang(konten);
  },

  // ---------------------------------
  // HALAMAN BOOKING
  // ---------------------------------
  renderHalamanBooking(konten) {
    const bookings = this.getFilteredBooking();
    const tabs = ['Semua','Baru','Proses','Siap Berangkat','Selesai','Batal'];

    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (this.state.filterBooking === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterBooking(\'' + t + '\')">' + t + '</button>'
    ).join('');

    let cardsHtml = '';
    if (bookings.length === 0) {
      cardsHtml =
        '<div class="empty-state">' +
          '<div class="empty-icon">📋</div>' +
          '<p>Belum ada data booking.</p>' +
          '<p>Klik tombol <strong>+</strong> untuk membuat order baru.</p>' +
        '</div>';
    } else {
      cardsHtml = bookings.map(b => this.renderCardBooking(b)).join('');
    }

    konten.innerHTML =
      '<div class="halaman-booking">' +
        '<div class="search-bar">' +
          '<input type="text" placeholder="Cari nama tamu / ID..." ' +
          'value="' + this.state.searchBookingDraft + '" ' +
          'oninput="Engine.setDraftSearchBooking(this.value)">' +
          '<button type="button" onclick="Engine.applySearchBooking()">🔍</button>' +
        '</div>' +
        '<div class="tabs">' + tabsHtml + '</div>' +
        '<div id="listBooking">' + cardsHtml + '</div>' +
      '</div>' +
      '<button class="fab" onclick="Engine.bukaFormOrder()">+</button>';
  },

  renderCardBooking(b) {
    const expanded    = this.state.expandedBooking === b.id;
    const keu         = Core.hitungKeuanganBooking(b.id);
    const statusBayar = Core.getStatusBayar(b.id, b.totalHarga);
    const sisaBayar   = (Number(b.totalHarga) || 0) - keu.masuk;
    const adaBromo    = Core.adaBromo(b.destinasi);

    const badgeStatus = this.getBadgeStatus(b.statusBooking);
    const badgeBayar  = this.getBadgeBayar(statusBayar, sisaBayar);

    let sudahPesan = [];
    let belumPesan = [];

    if (b.fasilitasHotel) {
      const hotels = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'booking hotel');
      if (hotels.length > 0) {
        hotels.forEach(h => {
          sudahPesan.push({
            label: 'Hotel ' +
              (h.snapshotHotel ? h.snapshotHotel.nama : '') +
              ' (' + (h.snapshotHotel ? h.snapshotHotel.destinasi : '') + ')',
            id: h.id,
            kategori: 'booking hotel'
          });
        });
      } else {
        belumPesan.push({ label: 'Hotel', icon: '🏨', action: 'bukaFormHotel', bookingId: b.id });
      }
    }

    if (b.fasilitasDriverTour) {
      const dt = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'sewa driver tour');
      if (dt.length > 0) {
        dt.forEach(d => {
          sudahPesan.push({
            label: (d.snapshotDriver ? d.snapshotDriver.nama : 'Driver Tour') +
              ' - ' + (d.snapshotDriver ? d.snapshotDriver.kendaraan : ''),
            id: d.id,
            kategori: 'sewa driver tour'
          });
        });
      } else {
        belumPesan.push({ label: 'Driver Tour', icon: '🚗', action: 'bukaFormDriverTour', bookingId: b.id });
      }
    }

    if (adaBromo && b.fasilitasDriverJeep) {
      const dj = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'sewa driver jeep');
      if (dj.length > 0) {
        dj.forEach(d => {
          sudahPesan.push({
            label: (d.snapshotDriver ? d.snapshotDriver.nama : 'Driver Jeep') +
              ' (Bromo)',
            id: d.id,
            kategori: 'sewa driver jeep'
          });
        });
      } else {
        belumPesan.push({ label: 'Driver Jeep', icon: '🚙', action: 'bukaFormDriverJeep', bookingId: b.id });
      }
    }

    if (adaBromo && b.fasilitasPiknik) {
      const pk = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'piknik bromo');
      if (pk.length > 0) {
        pk.forEach(p => {
          sudahPesan.push({
            label: 'Piknik Bromo',
            id: p.id,
            kategori: 'piknik bromo'
          });
        });
      } else {
        belumPesan.push({ label: 'Piknik Bromo', icon: '🏕️', action: 'bukaFormPiknik', bookingId: b.id });
      }
    }

    const tglBerangkat = Core.formatTanggalPendek(b.tglBerangkat);
    const tglPulang    = Core.formatTanggalPendek(b.tglPulang);

    let html =
      '<div class="card-booking' + (expanded ? ' expanded' : '') +
      '" onclick="Engine.toggleCardBooking(\'' + b.id + '\')">' +
        '<div class="card-header">' +
          '<span class="card-id">' + b.id + ' — ' + b.namaTamu + '</span>' +
          badgeStatus +
        '</div>' +
        '<div class="card-info">' +
          '📦 ' + (b.snapshotPaket ? b.snapshotPaket.nama : '-') + '<br>' +
          '📅 ' + tglBerangkat + ' - ' + tglPulang + '<br>' +
          '💰 ' + badgeBayar +
        '</div>';

    if (expanded) {
      html +=
        '<div class="card-detail" onclick="event.stopPropagation()">' +
          '<div class="card-row">' +
            '📱 ' + b.noHP +
            ' <a href="https://wa.me/' + b.noHP.replace(/\D/g,'') +
            '" target="_blank" class="btn-wa">💬 WA</a>' +
          '</div>' +
          '<div class="card-row">👥 ' + b.jumlahPax +
            ' pax | 🌍 ' + b.negara + '</div>';

      if (sudahPesan.length > 0) {
        html +=
          '<div class="checklist-group">' +
            '<div class="checklist-title">✅ Sudah pesan:</div>' +
            sudahPesan.map(s =>
              '<div class="checklist-item">' +
                '<span>• ' + s.label + '</span>' +
                '<span class="checklist-actions">' +
                  '<button class="btn-mini" onclick="event.stopPropagation();Engine.editArusKas(\'' + s.id + '\',\'' + s.kategori + '\')">✏️</button>' +
                  '<button class="btn-mini btn-hapus" onclick="event.stopPropagation();Engine.hapusArusKas(\'' + s.id + '\')">🗑️</button>' +
                '</span>' +
              '</div>'
            ).join('') +
          '</div>';
      }

      if (belumPesan.length > 0) {
        html +=
          '<div class="checklist-group warning">' +
            '<div class="checklist-title">⚠️ Belum pesan:</div>' +
            belumPesan.map(s =>
              '<div class="checklist-item">' +
                '<span>• ' + s.label + '</span>' +
                '<button class="btn-mini btn-pesan" onclick="event.stopPropagation();Engine.' + s.action + '(\'' + s.bookingId + '\')">' + s.icon + ' Pesan</button>' +
              '</div>'
            ).join('') +
          '</div>';
      }

      html +=
          '<div class="card-actions">' +
            '<button onclick="Engine.bukaFormPembayaran(\'' + b.id +
              '\')">+ Pembayaran</button>' +
            '<button onclick="Engine.bukaFormUbahStatus(\'' + b.id +
              '\')">Ubah Status</button>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button onclick="Engine.editBooking(\'' + b.id +
              '\')">✏️ Edit Booking</button>' +
            '<button class="btn-hapus" onclick="Engine.hapusBooking(\'' + b.id +
              '\')">🗑️ Hapus Booking</button>' +
          '</div>' +
        '</div>';
    }

    html += '</div>';
    return html;
  },

  toggleCardBooking(id) {
    this.state.expandedBooking =
      this.state.expandedBooking === id ? null : id;
    this.showHalaman('booking');
  },

  getFilteredBooking() {
    let data = Core.getBooking();
    const f  = this.state.filterBooking;
    const s  = this.state.searchBooking.toLowerCase();
    if (f !== 'Semua') data = data.filter(b => b.statusBooking === f);
    if (s) data = data.filter(b =>
      b.namaTamu.toLowerCase().includes(s) ||
      b.id.toLowerCase().includes(s)
    );
    return data.reverse();
  },

  setFilterBooking(f) {
    this.state.filterBooking = f;
    this.showHalaman('booking');
  },

  setDraftSearchBooking(v) {
    this.state.searchBookingDraft = v;
  },

  applySearchBooking() {
    this.state.searchBooking = this.state.searchBookingDraft;
    this.showHalaman('booking');
  },

  getBadgeStatus(status) {
    const map = {
      'Baru'           : 'badge-biru',
      'Proses'         : 'badge-kuning',
      'Siap Berangkat' : 'badge-hijau',
      'Selesai'        : 'badge-hijau-tua',
      'Batal'          : 'badge-merah'
    };
    return '<span class="badge ' + (map[status] || 'badge-abu') +
           '">' + (status || '-') + '</span>';
  },

  getBadgeBayar(status, sisa) {
    if (status === 'Lunas')
      return '<span class="badge badge-hijau">Lunas</span>';
    if (status === 'DP')
      return '<span class="badge badge-kuning">DP (sisa ' +
             Core.formatRupiah(sisa) + ')</span>';
    return '<span class="badge badge-merah">Belum bayar</span>';
  },

  // ---------------------------------
  // HALAMAN ARUS KAS
  // ---------------------------------
  renderHalamanArusKas(konten) {
    const bulan = this.state.bulanArusKas;
    const semua = Core.getArusKas().filter(a => {
      if (!a.tanggal) return false;
      return a.tanggal.substring(0, 7) === bulan;
    });

    let totalMasuk  = 0;
    let totalKeluar = 0;
    semua.forEach(a => {
      if (a.jenis === 'pemasukan')   totalMasuk  += Number(a.jumlah) || 0;
      if (a.jenis === 'pengeluaran') totalKeluar += Number(a.jumlah) || 0;
    });
    const totalSaldo = totalMasuk - totalKeluar;

    const bookings  = Core.getBooking();
    const filterTab = this.state.filterArusKas;
    const searchVal = this.state.searchArusKas.toLowerCase();

    let filteredBookings = bookings.filter(b => {
      const trx = Core.getArusKasByBookingId(b.id).filter(a =>
        a.tanggal && a.tanggal.substring(0, 7) === bulan
      );
      return trx.length > 0;
    });

    if (searchVal) {
      filteredBookings = filteredBookings.filter(b =>
        b.namaTamu.toLowerCase().includes(searchVal) ||
        b.id.toLowerCase().includes(searchVal)
      );
    }

    const tabs = ['Semua', 'Masuk', 'Keluar'];
    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (filterTab === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterArusKas(\'' + t + '\')">' + t + '</button>'
    ).join('');

    const [tahun, bln] = bulan.split('-');
    const namaBulan = [
      'Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember'
    ];
    const labelBulan = namaBulan[parseInt(bln) - 1] + ' ' + tahun;

    let cardsHtml = '';
    if (filteredBookings.length === 0) {
      cardsHtml =
        '<div class="empty-state">' +
          '<div class="empty-icon">💰</div>' +
          '<p>Belum ada transaksi di bulan ini.</p>' +
        '</div>';
    } else {
      cardsHtml = filteredBookings.map(b =>
        this.renderCardArusKas(b, bulan, filterTab)
      ).join('');
    }

    konten.innerHTML =
      '<div class="halaman-arus-kas">' +
        '<div class="filter-bulan">' +
          '<button onclick="Engine.ubahBulan(-1)">◀</button>' +
          '<span>📅 ' + labelBulan + '</span>' +
          '<button onclick="Engine.ubahBulan(1)">▶</button>' +
        '</div>' +
        '<div class="card-ringkasan">' +
          '<div class="ringkasan-row">' +
            '<span>💚 Masuk</span>' +
            '<span>' + Core.formatRupiah(totalMasuk) + '</span>' +
          '</div>' +
          '<div class="ringkasan-row">' +
            '<span>🔴 Keluar</span>' +
            '<span>' + Core.formatRupiah(totalKeluar) + '</span>' +
          '</div>' +
          '<div class="ringkasan-row saldo">' +
            '<span>💛 Saldo</span>' +
            '<span>' + Core.formatRupiah(totalSaldo) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="search-bar">' +
          '<input type="text" placeholder="Cari nama tamu / ID..." ' +
          'value="' + this.state.searchArusKasDraft + '" ' +
          'oninput="Engine.setDraftSearchArusKas(this.value)">' +
          '<button type="button" onclick="Engine.applySearchArusKas()">🔍</button>' +
        '</div>' +
        '<div class="tabs">' + tabsHtml + '</div>' +
        '<div id="listArusKas">' + cardsHtml + '</div>' +
      '</div>';
  },

  renderCardArusKas(b, bulan, filterTab) {
    const expanded = this.state.expandedArusKas === b.id;
    const keu      = Core.hitungKeuanganBooking(b.id);

    let trxList = Core.getArusKasByBookingId(b.id).filter(a =>
      a.tanggal && a.tanggal.substring(0, 7) === bulan
    );

    if (filterTab === 'Masuk')
      trxList = trxList.filter(a => a.jenis === 'pemasukan');
    if (filterTab === 'Keluar')
      trxList = trxList.filter(a => a.jenis === 'pengeluaran');

    trxList.sort((a, c) =>
      new Date(c.tanggal) - new Date(a.tanggal)
    );

    let html =
      '<div class="card-arus-kas' + (expanded ? ' expanded' : '') +
      '" onclick="Engine.toggleCardArusKas(\'' + b.id + '\')">' +
        '<div class="card-header">' +
          '<span>' + b.id + ' — ' + b.namaTamu + '</span>' +
        '</div>' +
        '<div class="card-keu">' +
          '<span>💚 Masuk: ' + Core.formatRupiah(keu.masuk) + '</span>' +
          '<span>🔴 Keluar: ' + Core.formatRupiah(keu.keluar) + '</span>' +
          '<span>💛 Laba: ' + Core.formatRupiah(keu.laba) + '</span>' +
        '</div>';

    if (expanded) {
      html +=
        '<div class="card-detail" onclick="event.stopPropagation()">' +
          '<div class="trx-title">📋 Riwayat Transaksi</div>';

      if (trxList.length === 0) {
        html += '<div class="empty-state-kecil">Belum ada transaksi.</div>';
      } else {
        trxList.forEach(t => {
          const isMasuk = t.jenis === 'pemasukan';
          const icon    = isMasuk ? '💚' : '🔴';
          const prefix  = isMasuk ? '+' : '-';
          let keterangan = t.keterangan || t.kategori || '';
          let subInfo    = '';

          if (t.snapshotHotel)
            subInfo = t.snapshotHotel.nama;
          if (t.snapshotDriver)
            subInfo = t.snapshotDriver.nama +
              ' (' + t.snapshotDriver.kendaraan + ')';

          html +=
            '<div class="trx-item">' +
              '<div class="trx-label">' + icon + ' ' + keterangan + '</div>' +
              (subInfo ? '<div class="trx-sub">' + subInfo + '</div>' : '') +
              '<div class="trx-tanggal">' +
                Core.formatTanggalWaktu(t.tanggal) +
              '</div>' +
              '<div class="trx-jumlah' + (isMasuk ? ' masuk' : ' keluar') +
              '">' + prefix + ' ' + Core.formatRupiah(t.jumlah) +
              '</div>' +
            '</div>';
        });
      }

      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  toggleCardArusKas(id) {
    this.state.expandedArusKas =
      this.state.expandedArusKas === id ? null : id;
    this.showHalaman('arusKas');
  },

  setFilterArusKas(f) {
    this.state.filterArusKas = f;
    this.showHalaman('arusKas');
  },

  setDraftSearchArusKas(v) {
    this.state.searchArusKasDraft = v;
  },

  applySearchArusKas() {
    this.state.searchArusKas = this.state.searchArusKasDraft;
    this.showHalaman('arusKas');
  },

  ubahBulan(arah) {
    const [tahun, bln] = this.state.bulanArusKas.split('-').map(Number);
    const d = new Date(tahun, bln - 1 + arah, 1);
    this.state.bulanArusKas =
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0');
    this.showHalaman('arusKas');
  },

  // ---------------------------------
  // MODAL: BUKA & TUTUP
  // ---------------------------------
  bukaModal(judul, isiHtml) {
    this.state.isFormOpen = true;
    this.state.dirtyForm  = false;
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-overlay" onclick="Engine.tutupModal()">' +
        '<div class="modal-content" onclick="event.stopPropagation()">' +
          '<div class="modal-header">' +
            '<span>' + judul + '</span>' +
            '<button onclick="Engine.tutupModal()">✕</button>' +
          '</div>' +
          '<div class="modal-body">' + isiHtml + '</div>' +
        '</div>' +
      '</div>';
    modal.classList.add('aktif');
  },

  tutupModal() {
    if (this.state.dirtyForm) {
      if (!confirm('Ada perubahan belum disimpan. Yakin tutup?')) return;
    }
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.remove('aktif');
      modal.innerHTML = '';
    }
    this.state.isFormOpen = false;
    this.state.dirtyForm  = false;
    this.state.hotelCount = 1;
  },

  tandaiDirty() {
    this.state.dirtyForm = true;
  },

  // ---------------------------------
  // FORM ORDER PAKET TOUR
  // ---------------------------------
  bukaFormOrder() {
    const id       = Core.generateBookingId();
    const pakets   = Core.getMasterPaket().filter(p => p.status === 'Aktif');
    const settings = Core.getSettings();
    const tempat   = settings.tempatJemput || [];

    let opsiPaket = '<option value="">Pilih paket...</option>';
    pakets.forEach(p => {
      opsiPaket += '<option value="' + p.id + '">' + p.nama + '</option>';
    });
    opsiPaket += '<option value="__tambahBaru">➕ Tambah Paket Baru</option>';

    const negaraList = ['Indonesia','Malaysia','Singapore','Thailand',
      'Vietnam','Philippines','Japan','South Korea','China','India',
      'Australia','USA','UK','Germany','France','Netherlands'];
    let opsiNegara = negaraList.map(n =>
      '<option value="' + n + '">' + n + '</option>'
    ).join('');
    opsiNegara += '<option value="__lainnya">Lainnya (ketik manual)</option>';

    const html =
      '<form onsubmit="Engine.simpanOrder(event)" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" id="fOrderId" value="' + id + '" readonly>' +

        '<label>Nama Tamu *</label>' +
        '<input type="text" id="fOrderNama" required placeholder="Nama tamu">' +

        '<label>No. HP / WA *</label>' +
        '<input type="tel" id="fOrderHP" required placeholder="08xxxxxxxxxx">' +

        '<label>Jumlah Pax *</label>' +
        '<input type="number" id="fOrderPax" min="1" required placeholder="4">' +

        '<label>Negara</label>' +
        '<select id="fOrderNegara" onchange="Engine.toggleNegaraManual()">' +
          opsiNegara +
        '</select>' +
        '<input type="text" id="fOrderNegaraManual" style="display:none" ' +
          'placeholder="Ketik nama negara">' +

        '<label>Paket Tour *</label>' +
        '<select id="fOrderPaket" onchange="Engine.onPaketChange()" required>' +
          opsiPaket +
        '</select>' +
        '<div id="fOrderInfoPaket"></div>' +
        '<div id="fOrderFasilitas"></div>' +

        '<label>Harga Paket *</label>' +
        '<input type="number" id="fOrderHarga" min="0" required ' +
          'placeholder="0" oninput="Engine.updateSisaBayarOrder()">' +

        '<label>Tanggal Berangkat *</label>' +
        '<input type="date" id="fOrderTglBerangkat" ' +
          'onchange="Engine.onTglBerangkatChange()" required>' +

        '<label>Tanggal Pulang</label>' +
        '<input type="date" id="fOrderTglPulang">' +

        '<div class="section-divider">── Info Penerbangan (opsional) ──</div>' +

        '<label>Info Penerbangan</label>' +
        '<input type="text" id="fOrderFlight" ' +
          'placeholder="contoh: Lion Air JT-123">' +

        '<label>Tanggal & Waktu Tiba</label>' +
        '<input type="datetime-local" id="fOrderTiba" ' +
          'onchange="Engine.onTibaChange()">' +

        '<label>Bandara / Tempat Tiba</label>' +
        '<input type="text" id="fOrderBandara" ' +
          'placeholder="contoh: Bandara Juanda, Surabaya" ' +
          'oninput="Engine.onBandaraChange()">' +

        '<div class="section-divider">── Pembayaran ──</div>' +

        '<label>Jumlah Bayar *</label>' +
        '<input type="number" id="fOrderBayar" min="0" required ' +
          'placeholder="0" oninput="Engine.updateSisaBayarOrder()">' +

        '<div id="fOrderSisaBayar"></div>' +
        '<div id="fOrderStatusBayar"></div>' +

        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('📋 Order Paket Tour', html);
  },

  toggleNegaraManual() {
    const sel = document.getElementById('fOrderNegara');
    const man = document.getElementById('fOrderNegaraManual');
    if (sel && man) {
      man.style.display = sel.value === '__lainnya' ? 'block' : 'none';
    }
  },

  onBandaraChange() {
    const bandara  = document.getElementById('fOrderBandara');
    const jemput   = document.getElementById('fOrderTempatJemput');
    if (!bandara || !jemput) return;
    if (bandara.value.trim()) {
      jemput.value = bandara.value.trim();
    }
  },

  onTibaChange() {
    const tiba   = document.getElementById('fOrderTiba');
    const jemput = document.getElementById('fOrderWaktuJemput');
    if (!tiba || !jemput) return;
    if (tiba.value) {
      jemput.value = tiba.value;
    }
  },

  onPaketChange() {
    const sel  = document.getElementById('fOrderPaket');
    const info = document.getElementById('fOrderInfoPaket');
    const fas  = document.getElementById('fOrderFasilitas');
    if (!sel || !info || !fas) return;

    if (sel.value === '__tambahBaru') {
      sel.value = '';
      info.innerHTML = '';
      fas.innerHTML  = '';
      Engine.bukaFormMasterPaketDariBooking();
      return;
    }

    const paket = Core.getMasterPaketById(sel.value);
    if (!paket) {
      info.innerHTML = '';
      fas.innerHTML  = '';
      return;
    }

    const destNames = paket.destinasi || [];
    const adaBromo  = Core.adaBromo(destNames);

    info.innerHTML =
      '<div class="info-paket">' +
        '📍 Destinasi: ' + destNames.join(', ') + '<br>' +
        '📅 Durasi: ' + paket.durHari + ' hari ' +
          paket.durMalam + ' malam' +
      '</div>';

    let fasHtml =
      '<div class="fasilitas-group">' +
        '<label>Fasilitas untuk booking:</label>' +
        '<label class="checkbox"><input type="checkbox" id="fFasHotel" ' +
          'checked onchange="Engine.tandaiDirty()"> Hotel</label>' +
        '<label class="checkbox"><input type="checkbox" id="fFasDriverTour" ' +
          'checked onchange="Engine.tandaiDirty()"> Driver Tour</label>';

    if (adaBromo) {
      fasHtml +=
        '<label class="checkbox"><input type="checkbox" id="fFasDriverJeep" ' +
          'checked onchange="Engine.tandaiDirty()"> Driver Jeep (Bromo)</label>' +
        '<label class="checkbox"><input type="checkbox" id="fFasPiknik" ' +
          'checked onchange="Engine.tandaiDirty()"> Piknik Bromo</label>';
    }

    fasHtml += '</div>';
    fas.innerHTML = fasHtml;

    this.updateSisaBayarOrder();
    this.onTglBerangkatChange();
  },

  onTglBerangkatChange() {
    const paketSel  = document.getElementById('fOrderPaket');
    const tglInput  = document.getElementById('fOrderTglBerangkat');
    const tglPulang = document.getElementById('fOrderTglPulang');
    if (!paketSel || !tglInput || !tglPulang) return;

    const paket = Core.getMasterPaketById(paketSel.value);
    if (!paket || !tglInput.value) return;

    const tgl = new Date(tglInput.value);
    tgl.setDate(tgl.getDate() + (Number(paket.durHari) - 1));
    tglPulang.value = tgl.toISOString().substring(0, 10);
  },

  updateSisaBayarOrder() {
    const hargaInput = document.getElementById('fOrderHarga');
    const bayarInput = document.getElementById('fOrderBayar');
    const sisaEl     = document.getElementById('fOrderSisaBayar');
    const statusEl   = document.getElementById('fOrderStatusBayar');
    if (!hargaInput || !bayarInput || !sisaEl || !statusEl) return;

    const total = Number(hargaInput.value) || 0;
    const bayar = Number(bayarInput.value) || 0;
    const sisa  = total - bayar;

    let status = 'Belum bayar';
    if (total > 0 && bayar >= total) status = 'Lunas';
    else if (bayar > 0) status = 'DP';

    sisaEl.innerHTML = 'Sisa Bayar: ' + Core.formatRupiah(sisa);
    statusEl.innerHTML = 'Status Bayar: ' + status;
  },

  simpanOrder(event) {
    event.preventDefault();
    const nama    = document.getElementById('fOrderNama').value.trim();
    const hp      = document.getElementById('fOrderHP').value.trim();
    const pax     = document.getElementById('fOrderPax').value;
    const paketId = document.getElementById('fOrderPaket').value;
    const harga   = document.getElementById('fOrderHarga').value;
    const tglBrkt = document.getElementById('fOrderTglBerangkat').value;
    const bayar   = document.getElementById('fOrderBayar').value;

    if (!nama || !hp || !pax || !paketId || !harga || !tglBrkt) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    const paket = Core.getMasterPaketById(paketId);
    if (!paket) { alert('Paket tidak ditemukan'); return; }

    const negaraSel    = document.getElementById('fOrderNegara').value;
    const negaraManual = document.getElementById('fOrderNegaraManual')
                           .value.trim();
    const negara = negaraSel === '__lainnya'
                     ? (negaraManual || 'Indonesia')
                     : negaraSel;

    const adaBromo = Core.adaBromo(paket.destinasi);
    const id       = document.getElementById('fOrderId').value;

    const fasHotel = document.getElementById('fFasHotel');
    const fasDT    = document.getElementById('fFasDriverTour');
    const fasDJ    = document.getElementById('fFasDriverJeep');
    const fasPK    = document.getElementById('fFasPiknik');

    const data = {
      id              : id,
      namaTamu        : nama,
      noHP            : hp,
      jumlahPax       : Number(pax),
      negara          : negara,
      paketId         : paketId,
      destinasi       : paket.destinasi || [],
      totalHarga      : Number(harga),
      tglBerangkat    : tglBrkt,
      tglPulang       : document.getElementById('fOrderTglPulang').value || '',
      infoPenerbangan : document.getElementById('fOrderFlight').value || '',
      waktuTiba       : document.getElementById('fOrderTiba').value || '',
      bandara         : document.getElementById('fOrderBandara').value || '',
      fasilitasHotel      : fasHotel ? fasHotel.checked : false,
      fasilitasDriverTour : fasDT ? fasDT.checked : false,
      fasilitasDriverJeep : adaBromo && fasDJ ? fasDJ.checked : false,
      fasilitasPiknik     : adaBromo && fasPK ? fasPK.checked : false,
      statusBooking   : 'Baru',
      snapshotPaket   : {
        nama      : paket.nama,
        destinasi : paket.destinasi,
        durHari   : paket.durHari,
        durMalam  : paket.durMalam
      }
    };

    const bookings = Core.getBooking();
    bookings.push(data);
    Core.saveBooking(bookings);

    if (Number(bayar) > 0) {
      const arusKas = Core.getArusKas();
      arusKas.push({
        id             : Core.generateArusKasId(),
        bookingId      : id,
        jenis          : 'pemasukan',
        kategori       : 'pembayaran tamu',
        jumlah         : Number(bayar),
        tanggal        : new Date().toISOString(),
        metode         : '',
        keterangan     : 'Pembayaran awal',
        snapshotHotel  : null,
        snapshotDriver : null
      });
      Core.saveArusKas(arusKas);
    }

    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // FORM TAMBAH PEMBAYARAN
  // ---------------------------------
  bukaFormPembayaran(bookingId) {
    const b     = Core.getBookingById(bookingId);
    if (!b) return;
    const keu   = Core.hitungKeuanganBooking(bookingId);
    const sisa  = (Number(b.totalHarga) || 0) - keu.masuk;

    const html =
      '<form onsubmit="Engine.simpanPembayaran(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<div class="info-bayar">' +
          '💰 Total Harga: ' + Core.formatRupiah(b.totalHarga) + '<br>' +
          '💚 Sudah Bayar: ' + Core.formatRupiah(keu.masuk) + '<br>' +
          '🔴 Sisa Bayar: ' + Core.formatRupiah(sisa) +
        '</div>' +
        '<label>Jumlah Bayar *</label>' +
        '<input type="number" id="fBayarJumlah" min="1" required placeholder="0">' +
        '<label>Tanggal & Waktu Bayar *</label>' +
        '<input type="datetime-local" id="fBayarTanggal" required>' +
        '<label>Metode Bayar *</label>' +
        '<select id="fBayarMetode" required>' +
          '<option value="">Pilih metode...</option>' +
          '<option value="Cash">Cash</option>' +
          '<option value="Transfer">Transfer</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fBayarKet" placeholder="contoh: Cicilan ke-2">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('💰 Tambah Pembayaran', html);
  },

  simpanPembayaran(event, bookingId) {
    event.preventDefault();
    const jumlah  = document.getElementById('fBayarJumlah').value;
    const tanggal = document.getElementById('fBayarTanggal').value;
    const metode  = document.getElementById('fBayarMetode').value;
    const ket     = document.getElementById('fBayarKet').value.trim();

    if (!jumlah || !tanggal || !metode) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    const arusKas = Core.getArusKas();
    arusKas.push({
      id             : Core.generateArusKasId(),
      bookingId      : bookingId,
      jenis          : 'pemasukan',
      kategori       : 'pembayaran tamu',
      jumlah         : Number(jumlah),
      tanggal        : tanggal,
      metode         : metode,
      keterangan     : ket || 'Pembayaran',
      snapshotHotel  : null,
      snapshotDriver : null
    });
    Core.saveArusKas(arusKas);

    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // FORM SEWA HOTEL
  // ---------------------------------
  bukaFormHotel(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;
    const destList = b.destinasi || [];

    const html =
      '<form onsubmit="Engine.simpanHotel(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<div id="hotelFields">' +
          this.renderHotelField(1, destList) +
        '</div>' +
        '<button type="button" class="btn-tambah" ' +
          'onclick="Engine.tambahHotelField()">+ Tambah Hotel</button>' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🏨 Sewa Hotel', html);
  },

  renderHotelField(nomor, destList) {
    var allDest = Core.getDaftarDestinasi();
    var merged = allDest.slice();
    destList.forEach(function(d) {
      if (merged.indexOf(d) < 0) merged.push(d);
    });
    merged.sort();

    let opsiDest = '<option value="">Pilih destinasi...</option>';
    merged.forEach(d => {
      opsiDest += '<option value="' + d + '">' + d + '</option>';
    });
    opsiDest += '<option value="__tambahDest">➕ Tambah Destinasi Baru</option>';

    let hapusBtn = '';
    if (nomor > 1) {
      hapusBtn = '<button type="button" class="btn-hapus" ' +
        'onclick="Engine.hapusHotelField(' + nomor + ')">🗑️ Hapus</button>';
    }

    return '<div class="hotel-field" id="hotelField' + nomor + '">' +
      '<div class="section-divider">── Hotel ' + nomor + ' ──</div>' +
      hapusBtn +
      '<label>Destinasi *</label>' +
      '<select id="fHotelDest' + nomor + '" ' +
        'onchange="Engine.onHotelDestChange(' + nomor + ')" required>' +
        opsiDest +
      '</select>' +
      '<input type="text" id="fHotelDestManual' + nomor + '" style="display:none" ' +
        'placeholder="Ketik nama destinasi baru">' +
      '<label>Hotel *</label>' +
      '<select id="fHotelNama' + nomor + '" ' +
        'onchange="Engine.onHotelNamaChange(' + nomor + ')" required>' +
        '<option value="">Pilih hotel...</option>' +
      '</select>' +
      '<input type="text" id="fHotelNamaManual' + nomor + '" style="display:none" ' +
        'placeholder="Ketik nama hotel baru">' +
      '<label>Tanggal & Waktu Booking *</label>' +
      '<input type="datetime-local" id="fHotelTgl' + nomor + '" required>' +
      '<label>Biaya Booking</label>' +
      '<input type="number" id="fHotelBiaya' + nomor + '" min="0" placeholder="0">' +
      '<label>Status Pembayaran *</label>' +
      '<select id="fHotelStatus' + nomor + '" required>' +
        '<option value="">Pilih status...</option>' +
        '<option value="Lunas">Lunas</option>' +
        '<option value="Belum Bayar">Belum Bayar</option>' +
        '<option value="DP">DP</option>' +
      '</select>' +
      '<label>Keterangan</label>' +
      '<input type="text" id="fHotelKet' + nomor +
        '" placeholder="contoh: 1 kamar, 1 malam">' +
    '</div>';
  },

  tambahHotelField() {
    const b = Core.getBookingById(
      document.querySelector('[id^="fHotelDest"]')
        .closest('form').querySelector('input[readonly]').value
    );
    if (!b) return;
    this.state.hotelCount++;
    const container = document.getElementById('hotelFields');
    if (container) {
      container.insertAdjacentHTML('beforeend',
        this.renderHotelField(this.state.hotelCount, b.destinasi || [])
      );
    }
  },

  hapusHotelField(nomor) {
    const el = document.getElementById('hotelField' + nomor);
    if (el) el.remove();
  },

  onHotelDestChange(nomor) {
    const destSel = document.getElementById('fHotelDest' + nomor);
    const destManual = document.getElementById('fHotelDestManual' + nomor);
    const selHotel = document.getElementById('fHotelNama' + nomor);
    const hotelManual = document.getElementById('fHotelNamaManual' + nomor);
    if (!destSel || !selHotel) return;

    if (destSel.value === '__tambahDest') {
      if (destManual) destManual.style.display = 'block';
      selHotel.innerHTML = '<option value="">Pilih hotel...</option>';
      if (hotelManual) hotelManual.style.display = 'none';
      return;
    }

    if (destManual) { destManual.style.display = 'none'; destManual.value = ''; }

    const dest = destSel.value;
    const hotels = Core.getMasterHotelByDestinasi(dest);
    let opsi = '<option value="">Pilih hotel...</option>';
    hotels.forEach(h => {
      opsi += '<option value="' + h.id + '">' + h.nama +
        ' (' + Core.formatRupiah(h.harga) + '/malam)</option>';
    });
    opsi += '<option value="__tambahHotel">➕ Tambah Hotel Baru</option>';
    selHotel.innerHTML = opsi;
    if (hotelManual) { hotelManual.style.display = 'none'; hotelManual.value = ''; }
  },

  onHotelNamaChange(nomor) {
    const hotelSel = document.getElementById('fHotelNama' + nomor);
    const hotelManual = document.getElementById('fHotelNamaManual' + nomor);
    const biaya = document.getElementById('fHotelBiaya' + nomor);

    if (hotelSel && hotelSel.value === '__tambahHotel') {
      if (hotelManual) hotelManual.style.display = 'block';
      if (biaya) biaya.value = '';
      return;
    }

    if (hotelManual) { hotelManual.style.display = 'none'; hotelManual.value = ''; }
    if (!biaya) return;

    const hotel = Core.getMasterHotelById(hotelSel.value);
    if (hotel) biaya.value = hotel.harga || 0;
  },

  simpanHotel(event, bookingId) {
    event.preventDefault();
    const arusKas = Core.getArusKas();

    for (let i = 1; i <= this.state.hotelCount; i++) {
      const field = document.getElementById('hotelField' + i);
      if (!field) continue;

      var destSel = document.getElementById('fHotelDest' + i).value;
      var destManual = document.getElementById('fHotelDestManual' + i);
      var htlSel  = document.getElementById('fHotelNama' + i).value;
      var htlManual = document.getElementById('fHotelNamaManual' + i);
      const tgl    = document.getElementById('fHotelTgl' + i).value;
      const biaya  = document.getElementById('fHotelBiaya' + i).value;
      const status = document.getElementById('fHotelStatus' + i).value;
      const ket    = document.getElementById('fHotelKet' + i).value.trim();

      var dest = destSel;
      if (destSel === '__tambahDest') {
        if (!destManual || !destManual.value.trim()) {
          alert('Ketik nama destinasi baru untuk Hotel ' + i);
          return;
        }
        var hasilDest = Core.tambahDestinasi(destManual.value.trim());
        if (!hasilDest.ok) { alert(hasilDest.msg); return; }
        dest = hasilDest.nama;
      }

      var hotel = null;
      var htlId = htlSel;
      if (htlSel === '__tambahHotel') {
        if (!htlManual || !htlManual.value.trim()) {
          alert('Ketik nama hotel baru untuk Hotel ' + i);
          return;
        }
        var namaHotelBaru = htlManual.value.trim();
        var newHotelId = Core.generateHotelId();
        hotel = {
          id        : newHotelId,
          nama      : namaHotelBaru,
          destinasi : dest,
          harga     : Number(biaya) || 0,
          keterangan: ket || '',
          status    : 'Aktif'
        };
        var hotelList = Core.getMasterHotel();
        hotelList.push(hotel);
        Core.saveMasterHotel(hotelList);
        htlId = newHotelId;
      } else {
        hotel = Core.getMasterHotelById(htlId);
      }

      if (!dest || (!htlId || htlId === '__tambahHotel') || !tgl || !status) {
        alert('Lengkapi semua field Hotel ' + i + ' bertanda *');
        return;
      }

      arusKas.push({
        id             : Core.generateArusKasId(),
        bookingId      : bookingId,
        jenis          : 'pengeluaran',
        kategori       : 'booking hotel',
        jumlah         : Number(biaya) || 0,
        tanggal        : tgl,
        metode         : '',
        keterangan     : ket || 'Booking hotel',
        statusBayar    : status,
        snapshotHotel  : hotel ? {
          nama     : hotel.nama,
          harga    : hotel.harga,
          destinasi: hotel.destinasi
        } : null,
        snapshotDriver : null
      });
    }

    Core.saveArusKas(arusKas);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // FORM DRIVER TOUR
  // ---------------------------------
  bukaFormDriverTour(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;
    const drivers = Core.getMasterDriverByTipe('Driver Tour');

    let opsiDriver = '<option value="">Pilih driver...</option>';
    drivers.forEach(d => {
      opsiDriver += '<option value="' + d.id + '">' + d.nama +
        ' (' + d.kendaraan + ')</option>';
    });

    const html =
      '<form onsubmit="Engine.simpanDriverTour(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<label>Pilih Driver *</label>' +
        '<select id="fDriverTourId" onchange="Engine.onDriverChange(\'Tour\')" ' +
          'required>' + opsiDriver + '</select>' +
        '<div id="fDriverTourInfo"></div>' +
        '<label>Tanggal & Waktu Sewa *</label>' +
        '<input type="datetime-local" id="fDriverTourTgl" required>' +
        '<label>Biaya Sewa *</label>' +
        '<input type="number" id="fDriverTourBiaya" min="0" required placeholder="0">' +
        '<label>Status Pembayaran *</label>' +
        '<select id="fDriverTourStatus" required>' +
          '<option value="">Pilih status...</option>' +
          '<option value="Lunas">Lunas</option>' +
          '<option value="Belum Bayar">Belum Bayar</option>' +
          '<option value="DP">DP</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fDriverTourKet" ' +
          'placeholder="contoh: Include bensin 3 hari">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🚗 Driver Tour', html);
  },

  // ---------------------------------
  // FORM DRIVER JEEP
  // ---------------------------------
  bukaFormDriverJeep(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;
    const drivers = Core.getMasterDriverByTipe('Driver Jeep');

    let opsiDriver = '<option value="">Pilih driver...</option>';
    drivers.forEach(d => {
      opsiDriver += '<option value="' + d.id + '">' + d.nama +
        ' (' + d.kendaraan + ')</option>';
    });

    const html =
      '<form onsubmit="Engine.simpanDriverJeep(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<label>Pilih Driver Jeep *</label>' +
        '<select id="fDriverJeepId" onchange="Engine.onDriverChange(\'Jeep\')" ' +
          'required>' + opsiDriver + '</select>' +
        '<div id="fDriverJeepInfo"></div>' +
        '<label>Tanggal & Waktu Sewa *</label>' +
        '<input type="datetime-local" id="fDriverJeepTgl" required>' +
        '<label>Biaya Sewa *</label>' +
        '<input type="number" id="fDriverJeepBiaya" min="0" required placeholder="0">' +
        '<label>Status Pembayaran *</label>' +
        '<select id="fDriverJeepStatus" required>' +
          '<option value="">Pilih status...</option>' +
          '<option value="Lunas">Lunas</option>' +
          '<option value="Belum Bayar">Belum Bayar</option>' +
          '<option value="DP">DP</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fDriverJeepKet" ' +
          'placeholder="contoh: Jeep untuk sunrise Bromo">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🚙 Driver Jeep', html);
  },

  onDriverChange(tipe) {
    const selId  = 'fDriver' + tipe + 'Id';
    const infoId = 'fDriver' + tipe + 'Info';
    const drvId  = document.getElementById(selId).value;
    const infoEl = document.getElementById(infoId);
    if (!infoEl) return;

    const driver = Core.getMasterDriverById(drvId);
    if (!driver) { infoEl.innerHTML = ''; return; }

    infoEl.innerHTML =
      '<div class="info-driver">' +
        '👤 Nama: ' + driver.nama + '<br>' +
        '📱 No. HP: ' + driver.noHP + '<br>' +
        '🚐 Kendaraan: ' + driver.kendaraan +
      '</div>';
  },

  simpanDriverTour(event, bookingId) {
    event.preventDefault();
    this.simpanDriver(bookingId, 'Tour', 'sewa driver tour');
  },

  simpanDriverJeep(event, bookingId) {
    event.preventDefault();
    this.simpanDriver(bookingId, 'Jeep', 'sewa driver jeep');
  },

  simpanDriver(bookingId, tipe, kategori) {
    const drvId  = document.getElementById('fDriver' + tipe + 'Id').value;
    const tgl    = document.getElementById('fDriver' + tipe + 'Tgl').value;
    const biaya  = document.getElementById('fDriver' + tipe + 'Biaya').value;
    const status = document.getElementById('fDriver' + tipe + 'Status').value;
    const ket    = document.getElementById('fDriver' + tipe + 'Ket')
                     .value.trim();

    if (!drvId || !tgl || !biaya || !status) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    const driver  = Core.getMasterDriverById(drvId);
    const arusKas = Core.getArusKas();

    arusKas.push({
      id             : Core.generateArusKasId(),
      bookingId      : bookingId,
      jenis          : 'pengeluaran',
      kategori       : kategori,
      jumlah         : Number(biaya),
      tanggal        : tgl,
      metode         : '',
      keterangan     : ket || kategori,
      statusBayar    : status,
      snapshotHotel  : null,
      snapshotDriver : driver ? {
        nama      : driver.nama,
        noHP      : driver.noHP,
        kendaraan : driver.kendaraan
      } : null
    });

    Core.saveArusKas(arusKas);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // FORM PIKNIK BROMO
  // ---------------------------------
  bukaFormPiknik(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;

    const html =
      '<form onsubmit="Engine.simpanPiknik(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<label>Tanggal & Waktu Piknik *</label>' +
        '<input type="datetime-local" id="fPiknikTgl" required>' +
        '<label>Biaya Piknik *</label>' +
        '<input type="number" id="fPiknikBiaya" min="0" required placeholder="0">' +
        '<label>Status Pembayaran *</label>' +
        '<select id="fPiknikStatus" required>' +
          '<option value="">Pilih status...</option>' +
          '<option value="Lunas">Lunas</option>' +
          '<option value="Belum Bayar">Belum Bayar</option>' +
          '<option value="DP">DP</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fPiknikKet" ' +
          'placeholder="contoh: Paket piknik 4 orang">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🏕️ Piknik Bromo', html);
  },

  simpanPiknik(event, bookingId) {
    event.preventDefault();
    const tgl    = document.getElementById('fPiknikTgl').value;
    const biaya  = document.getElementById('fPiknikBiaya').value;
    const status = document.getElementById('fPiknikStatus').value;
    const ket    = document.getElementById('fPiknikKet').value.trim();

    if (!tgl || !biaya || !status) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    const arusKas = Core.getArusKas();
    arusKas.push({
      id             : Core.generateArusKasId(),
      bookingId      : bookingId,
      jenis          : 'pengeluaran',
      kategori       : 'piknik bromo',
      jumlah         : Number(biaya),
      tanggal        : tgl,
      metode         : '',
      keterangan     : ket || 'Piknik Bromo',
      statusBayar    : status,
      snapshotHotel  : null,
      snapshotDriver : null
    });

    Core.saveArusKas(arusKas);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // EDIT & HAPUS ARUS KAS
  // ---------------------------------
  editArusKas(arusKasId, kategori) {
    const ak = Core.getArusKas().find(a => a.id === arusKasId);
    if (!ak) { alert('Data tidak ditemukan'); return; }

    if (kategori === 'booking hotel') {
      this.editFormHotel(ak);
    } else if (kategori === 'sewa driver tour') {
      this.editFormDriverTour(ak);
    } else if (kategori === 'sewa driver jeep') {
      this.editFormDriverJeep(ak);
    } else if (kategori === 'piknik bromo') {
      this.editFormPiknik(ak);
    }
  },

  editFormHotel(ak) {
    const b = Core.getBookingById(ak.bookingId);
    if (!b) return;
    const destList = b.destinasi || [];

    let opsiDest = '<option value="">Pilih destinasi...</option>';
    destList.forEach(d => {
      const sel = ak.snapshotHotel && ak.snapshotHotel.destinasi === d ? ' selected' : '';
      opsiDest += '<option value="' + d + '"' + sel + '>' + d + '</option>';
    });

    const hotels = ak.snapshotHotel && ak.snapshotHotel.destinasi
      ? Core.getMasterHotelByDestinasi(ak.snapshotHotel.destinasi) : [];
    let opsiHotel = '<option value="">Pilih hotel...</option>';
    hotels.forEach(h => {
      const sel = ak.snapshotHotel && ak.snapshotHotel.nama === h.nama ? ' selected' : '';
      opsiHotel += '<option value="' + h.id + '"' + sel + '>' + h.nama + '</option>';
    });

    const html =
      '<form onsubmit="Engine.updateHotel(event,\'' + ak.id + '\',\'' + ak.bookingId + '\')">' +
        '<label>Destinasi *</label>' +
        '<select id="fHotelDest1" onchange="Engine.onHotelDestChange(1)" required>' + opsiDest + '</select>' +
        '<label>Hotel *</label>' +
        '<select id="fHotelNama1" onchange="Engine.onHotelChange(1)" required>' + opsiHotel + '</select>' +
        '<label>Tanggal Check-in *</label>' +
        '<input type="datetime-local" id="fHotelTgl1" required value="' + (ak.tanggal || '') + '">' +
        '<label>Biaya *</label>' +
        '<input type="number" id="fHotelBiaya1" min="0" value="' + (ak.jumlah || 0) + '">' +
        '<label>Status Bayar *</label>' +
        '<select id="fHotelStatus1" required>' +
          '<option value="Belum Bayar"' + (ak.statusBayar === 'Belum Bayar' ? ' selected' : '') + '>Belum Bayar</option>' +
          '<option value="DP"' + (ak.statusBayar === 'DP' ? ' selected' : '') + '>DP</option>' +
          '<option value="Lunas"' + (ak.statusBayar === 'Lunas' ? ' selected' : '') + '>Lunas</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fHotelKet1" value="' + (ak.keterangan || '') + '">' +
        '<button type="submit" class="btn-simpan">Update Hotel</button>' +
      '</form>';
    this.bukaModal('✏️ Edit Hotel', html);
  },

  updateHotel(event, arusKasId, bookingId) {
    event.preventDefault();
    const dest   = document.getElementById('fHotelDest1').value;
    const htlId  = document.getElementById('fHotelNama1').value;
    const tgl    = document.getElementById('fHotelTgl1').value;
    const biaya  = document.getElementById('fHotelBiaya1').value;
    const status = document.getElementById('fHotelStatus1').value;
    const ket    = document.getElementById('fHotelKet1').value.trim();

    if (!dest || !htlId || !tgl || !status) {
      alert('Lengkapi semua field bertanda *'); return;
    }

    const hotel = Core.getMasterHotelById(htlId);
    const arusKas = Core.getArusKas();
    const idx = arusKas.findIndex(a => a.id === arusKasId);
    if (idx < 0) { alert('Data tidak ditemukan'); return; }

    arusKas[idx].jumlah      = Number(biaya);
    arusKas[idx].tanggal     = tgl;
    arusKas[idx].keterangan  = ket || 'Booking hotel';
    arusKas[idx].statusBayar = status;
    arusKas[idx].snapshotHotel = hotel ? {
      nama: hotel.nama, harga: hotel.harga, destinasi: hotel.destinasi
    } : arusKas[idx].snapshotHotel;

    Core.saveArusKas(arusKas);
    this.tutupModal();
    this.showHalaman('booking');
  },

  editFormDriverTour(ak) {
    const drivers = Core.getMasterDriverByTipe('Driver Tour');
    let opsiDriver = '<option value="">Pilih driver...</option>';
    drivers.forEach(d => {
      const sel = ak.snapshotDriver && ak.snapshotDriver.nama === d.nama ? ' selected' : '';
      opsiDriver += '<option value="' + d.id + '"' + sel + '>' + d.nama + ' - ' + d.kendaraan + '</option>';
    });

    const html =
      '<form onsubmit="Engine.updateDriver(event,\'' + ak.id + '\',\'' + ak.bookingId + '\',\'sewa driver tour\')">' +
        '<label>Driver Tour *</label>' +
        '<select id="fDriverTourId" required>' + opsiDriver + '</select>' +
        '<label>Tanggal *</label>' +
        '<input type="datetime-local" id="fDriverTourTgl" required value="' + (ak.tanggal || '') + '">' +
        '<label>Biaya *</label>' +
        '<input type="number" id="fDriverTourBiaya" min="0" required value="' + (ak.jumlah || 0) + '">' +
        '<label>Status Bayar *</label>' +
        '<select id="fDriverTourStatus" required>' +
          '<option value="Belum Bayar"' + (ak.statusBayar === 'Belum Bayar' ? ' selected' : '') + '>Belum Bayar</option>' +
          '<option value="DP"' + (ak.statusBayar === 'DP' ? ' selected' : '') + '>DP</option>' +
          '<option value="Lunas"' + (ak.statusBayar === 'Lunas' ? ' selected' : '') + '>Lunas</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fDriverTourKet" value="' + (ak.keterangan || '') + '">' +
        '<button type="submit" class="btn-simpan">Update Driver Tour</button>' +
      '</form>';
    this.bukaModal('✏️ Edit Driver Tour', html);
  },

  editFormDriverJeep(ak) {
    const drivers = Core.getMasterDriverByTipe('Driver Jeep');
    let opsiDriver = '<option value="">Pilih driver...</option>';
    drivers.forEach(d => {
      const sel = ak.snapshotDriver && ak.snapshotDriver.nama === d.nama ? ' selected' : '';
      opsiDriver += '<option value="' + d.id + '"' + sel + '>' + d.nama + ' - ' + d.kendaraan + '</option>';
    });

    const html =
      '<form onsubmit="Engine.updateDriver(event,\'' + ak.id + '\',\'' + ak.bookingId + '\',\'sewa driver jeep\')">' +
        '<label>Driver Jeep *</label>' +
        '<select id="fDriverJeepId" required>' + opsiDriver + '</select>' +
        '<label>Tanggal *</label>' +
        '<input type="datetime-local" id="fDriverJeepTgl" required value="' + (ak.tanggal || '') + '">' +
        '<label>Biaya *</label>' +
        '<input type="number" id="fDriverJeepBiaya" min="0" required value="' + (ak.jumlah || 0) + '">' +
        '<label>Status Bayar *</label>' +
        '<select id="fDriverJeepStatus" required>' +
          '<option value="Belum Bayar"' + (ak.statusBayar === 'Belum Bayar' ? ' selected' : '') + '>Belum Bayar</option>' +
          '<option value="DP"' + (ak.statusBayar === 'DP' ? ' selected' : '') + '>DP</option>' +
          '<option value="Lunas"' + (ak.statusBayar === 'Lunas' ? ' selected' : '') + '>Lunas</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fDriverJeepKet" value="' + (ak.keterangan || '') + '">' +
        '<button type="submit" class="btn-simpan">Update Driver Jeep</button>' +
      '</form>';
    this.bukaModal('✏️ Edit Driver Jeep', html);
  },

  updateDriver(event, arusKasId, bookingId, kategori) {
    event.preventDefault();
    const tipe   = kategori === 'sewa driver tour' ? 'Tour' : 'Jeep';
    const drvId  = document.getElementById('fDriver' + tipe + 'Id').value;
    const tgl    = document.getElementById('fDriver' + tipe + 'Tgl').value;
    const biaya  = document.getElementById('fDriver' + tipe + 'Biaya').value;
    const status = document.getElementById('fDriver' + tipe + 'Status').value;
    const ket    = document.getElementById('fDriver' + tipe + 'Ket').value.trim();

    if (!drvId || !tgl || !biaya || !status) {
      alert('Lengkapi semua field bertanda *'); return;
    }

    const driver  = Core.getMasterDriverById(drvId);
    const arusKas = Core.getArusKas();
    const idx = arusKas.findIndex(a => a.id === arusKasId);
    if (idx < 0) { alert('Data tidak ditemukan'); return; }

    arusKas[idx].jumlah      = Number(biaya);
    arusKas[idx].tanggal     = tgl;
    arusKas[idx].keterangan  = ket || kategori;
    arusKas[idx].statusBayar = status;
    arusKas[idx].snapshotDriver = driver ? {
      nama: driver.nama, noHP: driver.noHP, kendaraan: driver.kendaraan
    } : arusKas[idx].snapshotDriver;

    Core.saveArusKas(arusKas);
    this.tutupModal();
    this.showHalaman('booking');
  },

  editFormPiknik(ak) {
    const html =
      '<form onsubmit="Engine.updatePiknik(event,\'' + ak.id + '\',\'' + ak.bookingId + '\')">' +
        '<label>Tanggal *</label>' +
        '<input type="datetime-local" id="fPiknikTgl" required value="' + (ak.tanggal || '') + '">' +
        '<label>Biaya *</label>' +
        '<input type="number" id="fPiknikBiaya" min="0" required value="' + (ak.jumlah || 0) + '">' +
        '<label>Status Bayar *</label>' +
        '<select id="fPiknikStatus" required>' +
          '<option value="Belum Bayar"' + (ak.statusBayar === 'Belum Bayar' ? ' selected' : '') + '>Belum Bayar</option>' +
          '<option value="DP"' + (ak.statusBayar === 'DP' ? ' selected' : '') + '>DP</option>' +
          '<option value="Lunas"' + (ak.statusBayar === 'Lunas' ? ' selected' : '') + '>Lunas</option>' +
        '</select>' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fPiknikKet" value="' + (ak.keterangan || '') + '">' +
        '<button type="submit" class="btn-simpan">Update Piknik</button>' +
      '</form>';
    this.bukaModal('✏️ Edit Piknik Bromo', html);
  },

  updatePiknik(event, arusKasId, bookingId) {
    event.preventDefault();
    const tgl    = document.getElementById('fPiknikTgl').value;
    const biaya  = document.getElementById('fPiknikBiaya').value;
    const status = document.getElementById('fPiknikStatus').value;
    const ket    = document.getElementById('fPiknikKet').value.trim();

    if (!tgl || !biaya || !status) {
      alert('Lengkapi semua field bertanda *'); return;
    }

    const arusKas = Core.getArusKas();
    const idx = arusKas.findIndex(a => a.id === arusKasId);
    if (idx < 0) { alert('Data tidak ditemukan'); return; }

    arusKas[idx].jumlah      = Number(biaya);
    arusKas[idx].tanggal     = tgl;
    arusKas[idx].keterangan  = ket || 'Piknik Bromo';
    arusKas[idx].statusBayar = status;

    Core.saveArusKas(arusKas);
    this.tutupModal();
    this.showHalaman('booking');
  },

  hapusArusKas(arusKasId) {
    if (!confirm('Yakin hapus data ini?')) return;
    const arusKas = Core.getArusKas().filter(a => a.id !== arusKasId);
    Core.saveArusKas(arusKas);
    this.showHalaman('booking');
  },

  // ---------------------------------
  // EDIT & HAPUS BOOKING
  // ---------------------------------
  editBooking(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;

    const pakets = Core.getMasterPaket();
    let opsiPaket = '<option value="">Pilih paket...</option>';
    pakets.forEach(p => {
      const sel = p.id === b.paketId ? ' selected' : '';
      opsiPaket += '<option value="' + p.id + '"' + sel + '>' + p.nama + '</option>';
    });
    opsiPaket += '<option value="__tambahBaru">➕ Tambah Paket Baru</option>';

    const negaraList = ['Indonesia','Malaysia','Singapore','Thailand',
      'Vietnam','Philippines','Japan','South Korea','China','India',
      'Australia','USA','UK','Germany','France','Netherlands'];
    const negaraDiList = negaraList.includes(b.negara);
    let opsiNegara = negaraList.map(n =>
      '<option value="' + n + '"' + (b.negara === n ? ' selected' : '') + '>' + n + '</option>'
    ).join('');
    opsiNegara += '<option value="__lainnya"' + (!negaraDiList ? ' selected' : '') + '>Lainnya (ketik manual)</option>';

    const paket = Core.getMasterPaketById(b.paketId);
    const destNames = paket ? (paket.destinasi || []) : (b.destinasi || []);
    const adaBromo = Core.adaBromo(destNames);

    let infoPaket = '';
    if (paket) {
      infoPaket = '<div class="info-paket">' +
        '📍 Destinasi: ' + destNames.join(', ') + '<br>' +
        '📅 Durasi: ' + paket.durHari + ' hari ' + paket.durMalam + ' malam' +
      '</div>';
    }

    let fasHtml = '<div class="fasilitas-group">' +
      '<label>Fasilitas untuk booking:</label>' +
      '<label class="checkbox"><input type="checkbox" id="fFasHotel" ' +
        (b.fasilitasHotel ? 'checked' : '') + '> Hotel</label>' +
      '<label class="checkbox"><input type="checkbox" id="fFasDriverTour" ' +
        (b.fasilitasDriverTour ? 'checked' : '') + '> Driver Tour</label>';
    if (adaBromo) {
      fasHtml +=
        '<label class="checkbox"><input type="checkbox" id="fFasDriverJeep" ' +
          (b.fasilitasDriverJeep ? 'checked' : '') + '> Driver Jeep (Bromo)</label>' +
        '<label class="checkbox"><input type="checkbox" id="fFasPiknik" ' +
          (b.fasilitasPiknik ? 'checked' : '') + '> Piknik Bromo</label>';
    }
    fasHtml += '</div>';

    const html =
      '<form onsubmit="Engine.updateBooking(event,\'' + bookingId + '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" id="fOrderId" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu *</label>' +
        '<input type="text" id="fOrderNama" required value="' + (b.namaTamu || '') + '">' +
        '<label>No. HP / WA *</label>' +
        '<input type="tel" id="fOrderHP" required value="' + (b.noHP || '') + '">' +
        '<label>Jumlah Pax *</label>' +
        '<input type="number" id="fOrderPax" min="1" required value="' + (b.jumlahPax || '') + '">' +
        '<label>Negara</label>' +
        '<select id="fOrderNegara" onchange="Engine.toggleNegaraManual()">' +
          opsiNegara +
        '</select>' +
        '<input type="text" id="fOrderNegaraManual" style="display:' +
          (!negaraDiList ? 'block' : 'none') + '" value="' +
          (!negaraDiList ? (b.negara || '') : '') + '" placeholder="Ketik nama negara">' +
        '<label>Paket Tour *</label>' +
        '<select id="fOrderPaket" onchange="Engine.onPaketChange()" required>' +
          opsiPaket +
        '</select>' +
        '<div id="fOrderInfoPaket">' + infoPaket + '</div>' +
        '<div id="fOrderFasilitas">' + fasHtml + '</div>' +
        '<label>Harga Paket *</label>' +
        '<input type="number" id="fOrderHarga" min="0" required value="' +
          (b.totalHarga || 0) + '" oninput="Engine.updateSisaBayarOrder()">' +
        '<label>Tanggal Berangkat *</label>' +
        '<input type="date" id="fOrderTglBerangkat" onchange="Engine.onTglBerangkatChange()" required value="' +
          (b.tglBerangkat || '') + '">' +
        '<label>Tanggal Pulang</label>' +
        '<input type="date" id="fOrderTglPulang" value="' + (b.tglPulang || '') + '">' +
        '<div class="section-divider">── Info Penerbangan (opsional) ──</div>' +
        '<label>Info Penerbangan</label>' +
        '<input type="text" id="fOrderFlight" value="' + (b.infoPenerbangan || '') + '">' +
        '<label>Tanggal & Waktu Tiba</label>' +
        '<input type="datetime-local" id="fOrderTiba" value="' + (b.waktuTiba || '') + '">' +
        '<label>Bandara / Tempat Tiba</label>' +
        '<input type="text" id="fOrderBandara" value="' + (b.bandara || '') + '">' +
        '<div class="section-divider">── Pembayaran ──</div>' +
        '<div id="fOrderSisaBayar"></div>' +
        '<div id="fOrderStatusBayar"></div>' +
        '<button type="submit" class="btn-simpan">Update Booking</button>' +
      '</form>';

    this.bukaModal('✏️ Edit Booking', html);

    setTimeout(function() {
      Engine.updateSisaBayarEdit(bookingId);
    }, 100);
  },

  updateSisaBayarEdit(bookingId) {
    const hargaInput = document.getElementById('fOrderHarga');
    const sisaEl     = document.getElementById('fOrderSisaBayar');
    const statusEl   = document.getElementById('fOrderStatusBayar');
    if (!hargaInput || !sisaEl || !statusEl) return;

    const keu   = Core.hitungKeuanganBooking(bookingId);
    const total = Number(hargaInput.value) || 0;
    const bayar = keu.masuk;
    const sisa  = total - bayar;

    let status = 'Belum bayar';
    if (total > 0 && bayar >= total) status = 'Lunas';
    else if (bayar > 0) status = 'DP';

    sisaEl.innerHTML = 'Sudah dibayar: ' + Core.formatRupiah(bayar) + '<br>Sisa Bayar: ' + Core.formatRupiah(sisa);
    statusEl.innerHTML = 'Status Bayar: ' + status;
  },

  updateBooking(event, bookingId) {
    event.preventDefault();
    const nama    = document.getElementById('fOrderNama').value.trim();
    const hp      = document.getElementById('fOrderHP').value.trim();
    const pax     = document.getElementById('fOrderPax').value;
    const paketId = document.getElementById('fOrderPaket').value;
    const harga   = document.getElementById('fOrderHarga').value;
    const tglBrkt = document.getElementById('fOrderTglBerangkat').value;

    if (!nama || !hp || !pax || !paketId || !harga || !tglBrkt) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    const paket = Core.getMasterPaketById(paketId);
    if (!paket) { alert('Paket tidak ditemukan'); return; }

    const negaraSel    = document.getElementById('fOrderNegara').value;
    const negaraManual = document.getElementById('fOrderNegaraManual').value.trim();
    const negara = negaraSel === '__lainnya' ? (negaraManual || 'Indonesia') : negaraSel;

    const adaBromo = Core.adaBromo(paket.destinasi);

    const fasHotel = document.getElementById('fFasHotel');
    const fasDT    = document.getElementById('fFasDriverTour');
    const fasDJ    = document.getElementById('fFasDriverJeep');
    const fasPK    = document.getElementById('fFasPiknik');

    const bookings = Core.getBooking();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx < 0) { alert('Booking tidak ditemukan'); return; }

    bookings[idx].namaTamu        = nama;
    bookings[idx].noHP            = hp;
    bookings[idx].jumlahPax       = Number(pax);
    bookings[idx].negara          = negara;
    bookings[idx].paketId         = paketId;
    bookings[idx].destinasi       = paket.destinasi || [];
    bookings[idx].totalHarga      = Number(harga);
    bookings[idx].tglBerangkat    = tglBrkt;
    bookings[idx].tglPulang       = document.getElementById('fOrderTglPulang').value || '';
    bookings[idx].infoPenerbangan = document.getElementById('fOrderFlight').value || '';
    bookings[idx].waktuTiba       = document.getElementById('fOrderTiba').value || '';
    bookings[idx].bandara         = document.getElementById('fOrderBandara').value || '';
    bookings[idx].fasilitasHotel      = fasHotel ? fasHotel.checked : false;
    bookings[idx].fasilitasDriverTour = fasDT ? fasDT.checked : false;
    bookings[idx].fasilitasDriverJeep = adaBromo && fasDJ ? fasDJ.checked : false;
    bookings[idx].fasilitasPiknik     = adaBromo && fasPK ? fasPK.checked : false;
    bookings[idx].snapshotPaket   = {
      nama      : paket.nama,
      destinasi : paket.destinasi,
      durHari   : paket.durHari,
      durMalam  : paket.durMalam
    };

    Core.saveBooking(bookings);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  hapusBooking(bookingId) {
    if (!confirm('Yakin hapus booking ini beserta semua data terkait (pembayaran, hotel, driver, piknik)?')) return;
    const bookings = Core.getBooking().filter(b => b.id !== bookingId);
    Core.saveBooking(bookings);
    const arusKas = Core.getArusKas().filter(a => a.bookingId !== bookingId);
    Core.saveArusKas(arusKas);
    this.showHalaman('booking');
  },

  // ---------------------------------
  // FORM UBAH STATUS BOOKING
  // ---------------------------------
  bukaFormUbahStatus(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;

    const statusList = ['Baru','Proses','Siap Berangkat','Selesai','Batal'];
    let opsiStatus = statusList.map(s =>
      '<option value="' + s + '"' +
        (b.statusBooking === s ? ' selected' : '') +
      '>' + s + '</option>'
    ).join('');

    const html =
      '<form onsubmit="Engine.simpanUbahStatus(event,\'' + bookingId +
        '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Booking</label>' +
        '<input type="text" value="' + b.id + '" readonly>' +
        '<label>Nama Tamu</label>' +
        '<input type="text" value="' + b.namaTamu + '" readonly>' +
        '<div class="info-status">Status Saat Ini: ' +
          this.getBadgeStatus(b.statusBooking) + '</div>' +
        '<label>Ubah ke Status *</label>' +
        '<select id="fUbahStatus" required>' + opsiStatus + '</select>' +
        '<label>Catatan</label>' +
        '<input type="text" id="fUbahKet" ' +
          'placeholder="contoh: Tamu reschedule">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('📋 Ubah Status', html);
  },

  simpanUbahStatus(event, bookingId) {
    event.preventDefault();
    const status = document.getElementById('fUbahStatus').value;
    const ket    = document.getElementById('fUbahKet').value.trim();

    const bookings = Core.getBooking();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
      bookings[idx].statusBooking = status;
      if (ket) bookings[idx].catatanStatus = ket;
      Core.saveBooking(bookings);
    }

    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('booking');
  },

  // ---------------------------------
  // ITINERARY (tampilkan di modal)
  // ---------------------------------
  // ---------------------------------
  // HALAMAN MASTER PAKET
  // ---------------------------------
  renderMasterPaket(konten) {
    const searchInput = this.state.filterMaster.draftSearchPaket || '';
    const search = (this.state.filterMaster.searchPaket || '').toLowerCase();
    let data = Core.getMasterPaket();

    if (search) data = data.filter(p =>
      p.nama.toLowerCase().includes(search));

    let cardsHtml = '';
    if (data.length === 0) {
      cardsHtml = '<div class="empty-state"><div class="empty-icon">📦</div>' +
        '<p>Belum ada data paket.</p></div>';
    } else {
      cardsHtml = data.map(p => this.renderCardMasterPaket(p)).join('');
    }

    konten.innerHTML =
      '<div class="search-bar">' +
        '<input type="text" placeholder="Cari nama paket..." ' +
        'value="' + searchInput + '" ' +
        'oninput="Engine.setDraftSearchMaster(\'draftSearchPaket\',this.value)">' +
        '<button type="button" onclick="Engine.applySearchMaster(\'draftSearchPaket\',\'searchPaket\')">🔍</button>' +
      '</div>' +
      '<div id="listMaster">' + cardsHtml + '</div>' +
      '<button class="fab" onclick="Engine.bukaFormMasterPaket()">+</button>';
  },

  renderCardMasterPaket(p) {
    const exp = this.state.filterMaster.expandPaket === p.id;
    let html = '<div class="card-master" onclick="Engine.toggleExpandMaster(\'expandPaket\',\'' + p.id + '\')">' +
      '<div class="card-header"><span>' + p.id + '</span></div>' +
      '<div class="card-info">' + p.nama + '<br>' +
        '📅 ' + p.durHari + ' hari ' + p.durMalam + ' malam</div>';

    if (exp) {
      html += '<div class="card-detail" onclick="event.stopPropagation()">' +
        '<div>📍 Destinasi:</div>' +
        (p.destinasi || []).map(d => '<div>• ' + d + '</div>').join('') +
        '<div class="card-actions">' +
          '<button onclick="Engine.bukaFormMasterPaket(\'' + p.id + '\')">✏️ Edit</button>' +
          '<button onclick="Engine.hapusMasterPaket(\'' + p.id + '\')">🗑️ Hapus</button>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  },

  // ---------------------------------
  // HALAMAN MASTER DRIVER
  // ---------------------------------
  renderMasterDriver(konten) {
    const filter = this.state.filterMaster.driver || 'Semua';
    const searchInput = this.state.filterMaster.draftSearchDriver || '';
    const search = (this.state.filterMaster.searchDriver || '').toLowerCase();
    let data = Core.getMasterDriver();

    if (filter === 'Tour') data = data.filter(d => d.tipe === 'Driver Tour');
    else if (filter === 'Jeep') data = data.filter(d => d.tipe === 'Driver Jeep');
    if (search) data = data.filter(d => d.nama.toLowerCase().includes(search));

    const tabs = ['Semua','Tour','Jeep'];
    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (filter === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterMaster(\'driver\',\'' + t + '\')">' + t + '</button>'
    ).join('');

    let cardsHtml = '';
    if (data.length === 0) {
      cardsHtml = '<div class="empty-state"><div class="empty-icon">🚗</div>' +
        '<p>Belum ada data driver.</p></div>';
    } else {
      cardsHtml = data.map(d => this.renderCardMasterDriver(d)).join('');
    }

    konten.innerHTML =
      '<div class="search-bar">' +
        '<input type="text" placeholder="Cari nama driver..." ' +
        'value="' + searchInput + '" ' +
        'oninput="Engine.setDraftSearchMaster(\'draftSearchDriver\',this.value)">' +
        '<button type="button" onclick="Engine.applySearchMaster(\'draftSearchDriver\',\'searchDriver\')">🔍</button>' +
      '</div>' +
      '<div class="tabs">' + tabsHtml + '</div>' +
      '<div id="listMaster">' + cardsHtml + '</div>' +
      '<button class="fab" onclick="Engine.bukaFormMasterDriver()">+</button>';
  },

  renderCardMasterDriver(d) {
    const exp = this.state.filterMaster.expandDriver === d.id;
    let html = '<div class="card-master" onclick="Engine.toggleExpandMaster(\'expandDriver\',\'' + d.id + '\')">' +
      '<div class="card-header"><span>' + d.id + '</span>' +
        '<span class="badge ' + (d.status === 'Aktif' ? 'badge-hijau' : 'badge-abu') + '">' + d.status + '</span></div>' +
      '<div class="card-info">' + d.nama + '<br>' +
        '🚐 ' + d.kendaraan + ' | ' + d.tipe + '<br>' +
        '📱 ' + d.noHP + '</div>';

    if (exp) {
      html += '<div class="card-detail" onclick="event.stopPropagation()">' +
        '<div class="card-row">📱 ' + d.noHP +
          ' <a href="https://wa.me/' + d.noHP.replace(/\D/g,'') +
          '" target="_blank" class="btn-wa">💬 WA</a></div>' +
        '<div class="card-actions">' +
          '<button onclick="Engine.bukaFormMasterDriver(\'' + d.id + '\')">✏️ Edit</button>' +
          '<button onclick="Engine.hapusMasterDriver(\'' + d.id + '\')">🗑️ Hapus</button>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  },

  // ---------------------------------
  // HALAMAN MASTER HOTEL
  // ---------------------------------
  renderMasterHotel(konten) {
    const filter = this.state.filterMaster.hotel || 'Semua';
    const searchInput = this.state.filterMaster.draftSearchHotel || '';
    const search = (this.state.filterMaster.searchHotel || '').toLowerCase();
    let data = Core.getMasterHotel();

    if (filter !== 'Semua') data = data.filter(h => h.status === filter);
    if (search) data = data.filter(h => h.nama.toLowerCase().includes(search));

    const tabs = ['Semua','Aktif','Nonaktif'];
    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (filter === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterMaster(\'hotel\',\'' + t + '\')">' + t + '</button>'
    ).join('');

    let cardsHtml = '';
    if (data.length === 0) {
      cardsHtml = '<div class="empty-state"><div class="empty-icon">🏨</div>' +
        '<p>Belum ada data hotel.</p></div>';
    } else {
      cardsHtml = data.map(h => this.renderCardMasterHotel(h)).join('');
    }

    konten.innerHTML =
      '<div class="search-bar">' +
        '<input type="text" placeholder="Cari nama hotel..." ' +
        'value="' + searchInput + '" ' +
        'oninput="Engine.setDraftSearchMaster(\'draftSearchHotel\',this.value)">' +
        '<button type="button" onclick="Engine.applySearchMaster(\'draftSearchHotel\',\'searchHotel\')">🔍</button>' +
      '</div>' +
      '<div class="tabs">' + tabsHtml + '</div>' +
      '<div id="listMaster">' + cardsHtml + '</div>' +
      '<button class="fab" onclick="Engine.bukaFormMasterHotel()">+</button>';
  },

  renderCardMasterHotel(h) {
    const exp = this.state.filterMaster.expandHotel === h.id;
    let html = '<div class="card-master" onclick="Engine.toggleExpandMaster(\'expandHotel\',\'' + h.id + '\')">' +
      '<div class="card-header"><span>' + h.id + '</span>' +
        '<span class="badge ' + (h.status === 'Aktif' ? 'badge-hijau' : 'badge-abu') + '">' + h.status + '</span></div>' +
      '<div class="card-info">' + h.nama + '<br>' +
        '📍 ' + h.destinasi + '<br>' +
        '💰 ' + Core.formatRupiah(h.harga) + ' / malam</div>';

    if (exp) {
      html += '<div class="card-detail" onclick="event.stopPropagation()">' +
        (h.keterangan ? '<div>📝 ' + h.keterangan + '</div>' : '') +
        '<div class="card-actions">' +
          '<button onclick="Engine.bukaFormMasterHotel(\'' + h.id + '\')">✏️ Edit</button>' +
          '<button onclick="Engine.hapusMasterHotel(\'' + h.id + '\')">🗑️ Hapus</button>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  },

  // ---------------------------------
  // HALAMAN MASTER DESTINASI
  // ---------------------------------
  // ---------------------------------
  // MASTER FILTER & SEARCH HELPERS
  // ---------------------------------
  setFilterMaster(key, val) {
    this.state.filterMaster[key] = val;
    this.showHalaman(this.state.halamanAktif);
  },

  setDraftSearchMaster(key, val) {
    this.state.filterMaster[key] = val;
  },

  applySearchMaster(draftKey, searchKey) {
    this.state.filterMaster[searchKey] = this.state.filterMaster[draftKey] || '';
    this.showHalaman(this.state.halamanAktif);
  },

  toggleExpandMaster(key, id) {
    this.state.filterMaster[key] =
      this.state.filterMaster[key] === id ? null : id;
    this.showHalaman(this.state.halamanAktif);
  },

  // ---------------------------------
  // ANTI-REFRESH & BACK HANDLER
  // ---------------------------------
  initBackUnload() {
    window.addEventListener('beforeunload', function(e) {
      if (Engine.state.dirtyForm) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function() {
      if (Engine.state.isFormOpen) {
        Engine.tutupModal();
        history.pushState(null, '', location.href);
      } else {
        history.pushState(null, '', location.href);
      }
    });
  },

  // ---------------------------------
  // CEK BACKUP REMINDER
  // ---------------------------------
  cekBackupReminder() {
    if (!Core.perluBackup()) return;
    const last = Core.getLastBackup();
    const lastStr = last ? Core.formatTanggalPendek(last) : 'Belum pernah';
    const banner = document.getElementById('bannerBackup');
    if (banner) {
      banner.innerHTML =
        '<div class="backup-banner">' +
          '⚠️ Data belum dicadangkan. Terakhir: ' + lastStr +
          ' <button onclick="DataSync.exportData()">💾 Simpan</button>' +
        '</div>';
      banner.style.display = 'block';
    }
  },

  // ---------------------------------
  // CEK NOTIF TGL PULANG LEWAT
  // ---------------------------------
  cekNotifTglPulang() {
    const bookings = Core.getBooking();
    const now = new Date();
    bookings.forEach(function(b) {
      if (b.statusBooking === 'Siap Berangkat' && b.tglPulang) {
        const pulang = new Date(b.tglPulang);
        if (now > pulang) {
          setTimeout(function() {
            if (confirm('Tour ' + b.id + ' (' + b.namaTamu +
              ') sudah lewat tgl pulang. Tandai sebagai Selesai?')) {
              const all = Core.getBooking();
              const idx = all.findIndex(function(x) { return x.id === b.id; });
              if (idx >= 0) {
                all[idx].statusBooking = 'Selesai';
                Core.saveBooking(all);
                Engine.showHalaman('booking');
              }
            }
          }, 500);
        }
      }
    });
    },


  // ---------------------------------
  // HALAMAN PENGATURAN
  // ---------------------------------
  renderPengaturan(konten) {
    var s = Core.getSettings();
    var warnaList = [
      { kode: '#16a34a', nama: 'Hijau' },
      { kode: '#2563eb', nama: 'Biru' },
      { kode: '#7c3aed', nama: 'Ungu' },
      { kode: '#dc2626', nama: 'Merah' },
      { kode: '#f59e0b', nama: 'Kuning' },
      { kode: '#ea580c', nama: 'Oranye' }
    ];

    var warnaHtml = warnaList.map(function(w) {
      var aktif = (s.warnaTema === w.kode) ? ' aktif' : '';
      return '<div class="warna-dot' + aktif + '" ' +
        'style="background:' + w.kode + '" ' +
        'onclick="Engine.pilihWarna(\'' + w.kode + '\')"></div>';
    }).join('');

    var tempatHtml = (s.tempatJemput || []).map(function(t, i) {
      return '<div class="tempat-jemput-item">' +
        '<span>' + t + '</span>' +
        '<button class="btn-hapus" onclick="Engine.hapusTempatJemput(' + i + ')">🗑️</button>' +
      '</div>';
    }).join('');

    var lastBackup  = Core.getLastBackup();
    var lastRestore = Core.getLastRestore();

    var destListData = Core.getDaftarDestinasi();
    var destHtml = destListData.map(function(d, i) {
      return '<div class="tempat-jemput-item">' +
        '<span>' + d + '</span>' +
        '<span class="checklist-actions">' +
          '<button class="btn-mini" onclick="Engine.editDestinasiPengaturan(' + i + ')">✏️</button>' +
          '<button class="btn-mini btn-hapus" onclick="Engine.hapusDestinasiPengaturan(' + i + ')">🗑️</button>' +
        '</span>' +
      '</div>';
    }).join('');

    konten.innerHTML =
      '<div class="halaman-pengaturan">' +
        '<div class="pengaturan-section">' +
          '<h3>🏢 Profil Aplikasi</h3>' +
          '<label>✏️ Nama App</label>' +
          '<input type="text" id="sNamaApp" value="' + (s.namaApp || '') + '">' +
          '<label>📱 No. WA Agen</label>' +
          '<input type="tel" id="sNoWA" value="' + (s.noWA || '') + '">' +
          '<label>📧 Email Agen</label>' +
          '<input type="email" id="sEmail" value="' + (s.email || '') + '">' +
          '<label>🌐 Website</label>' +
          '<input type="text" id="sWebsite" value="' + (s.website || '') + '">' +
          '<label>🎨 Warna Tema</label>' +
          '<div class="warna-pilihan">' + warnaHtml + '</div>' +
          '<label>🆔 Prefix ID Booking</label>' +
          '<input type="text" id="sPrefix" value="' + (s.prefixBooking || 'PL') + '" maxlength="5">' +
          '<label>📍 Daftar Tempat Jemput</label>' +
          '<div class="tempat-jemput-list">' + tempatHtml + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:8px">' +
            '<input type="text" id="sTempatBaru" placeholder="Tambah tempat jemput">' +
            '<button class="btn-tambah" style="width:auto;margin:0;padding:8px 14px" ' +
              'onclick="Engine.tambahTempatJemput()">+</button>' +
          '</div>' +
          '<button class="btn-simpan" onclick="Engine.simpanPengaturan()">Simpan Profil</button>' +
        '</div>' +
        '<div class="pengaturan-section">' +
          '<h3>📍 Daftar Destinasi</h3>' +
          '<p style="font-size:13px;color:#666">Kelola daftar destinasi untuk hotel dan paket tour.</p>' +
          destHtml +
          '<div style="display:flex;gap:8px;margin-top:8px">' +
            '<input type="text" id="sDestBaru" placeholder="Tambah destinasi baru">' +
            '<button class="btn-tambah" style="width:auto;margin:0;padding:8px 14px" ' +
              'onclick="Engine.tambahDestinasiPengaturan()">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="pengaturan-section">' +
          '<h3>💾 Simpan Data</h3>' +
          '<p style="font-size:13px;color:#666">Cadangkan semua data app ke file JSON.</p>' +
          '<p style="font-size:12px;color:#999">Terakhir disimpan: ' +
            (lastBackup ? Core.formatTanggalWaktu(lastBackup) : 'Belum pernah') + '</p>' +
          '<button class="btn-simpan" onclick="DataSync.exportData()">💾 Simpan</button>' +
        '</div>' +
        '<div class="pengaturan-section">' +
          '<h3>📥 Pulihkan Data</h3>' +
          '<p style="font-size:13px;color:#666">Kembalikan data dari file JSON backup.</p>' +
          '<p style="font-size:12px;color:#999">Terakhir dipulihkan: ' +
            (lastRestore ? Core.formatTanggalWaktu(lastRestore) : 'Belum pernah') + '</p>' +
          '<button class="btn-simpan" onclick="DataSync.importData()">📥 Pulihkan</button>' +
        '</div>' +
      '</div>';
  },

  pilihWarna(kode) {
    document.querySelectorAll('.warna-dot').forEach(function(el) {
      el.classList.remove('aktif');
      if (el.style.background === kode || el.style.backgroundColor === kode) {
        el.classList.add('aktif');
      }
    });
    document.documentElement.style.setProperty('--warna-tema', kode);
  },

  tambahTempatJemput() {
    var input = document.getElementById('sTempatBaru');
    if (!input || !input.value.trim()) return;
    var s = Core.getSettings();
    s.tempatJemput = s.tempatJemput || [];
    s.tempatJemput.push(input.value.trim());
    Core.saveSettings(s);
    this.showHalaman('pengaturan');
  },

  hapusTempatJemput(index) {
    var s = Core.getSettings();
    s.tempatJemput = s.tempatJemput || [];
    s.tempatJemput.splice(index, 1);
    Core.saveSettings(s);
    this.showHalaman('pengaturan');
  },

  tambahDestinasiPengaturan() {
    var input = document.getElementById('sDestBaru');
    if (!input || !input.value.trim()) return;
    var hasil = Core.tambahDestinasi(input.value.trim());
    if (!hasil.ok) {
      alert(hasil.msg);
      return;
    }
    this.showHalaman('pengaturan');
  },

  editDestinasiPengaturan(index) {
    var list = Core.getDaftarDestinasi();
    var namaLama = list[index];
    if (!namaLama) return;
    var namaBaru = prompt('Edit nama destinasi:', namaLama);
    if (namaBaru === null) return;
    if (!namaBaru.trim()) {
      alert('Nama destinasi tidak boleh kosong');
      return;
    }
    var hasil = Core.editDestinasi(namaLama, namaBaru.trim());
    if (!hasil.ok) {
      alert(hasil.msg);
      return;
    }
    this.showHalaman('pengaturan');
  },

  hapusDestinasiPengaturan(index) {
    var list = Core.getDaftarDestinasi();
    var nama = list[index];
    if (!nama) return;
    if (!confirm('Yakin hapus destinasi "' + nama + '"?')) return;
    var hasil = Core.hapusDestinasi(nama);
    if (!hasil.ok) {
      alert(hasil.msg);
      return;
    }
    this.showHalaman('pengaturan');
  },

  simpanPengaturan() {
    var s = Core.getSettings();
    s.namaApp       = document.getElementById('sNamaApp').value.trim() || s.namaApp;
    s.noWA          = document.getElementById('sNoWA').value.trim();
    s.email         = document.getElementById('sEmail').value.trim();
    s.website       = document.getElementById('sWebsite').value.trim();
    s.prefixBooking = document.getElementById('sPrefix').value.trim() || 'PL';

    var aktifWarna = document.querySelector('.warna-dot.aktif');
    if (aktifWarna) {
      s.warnaTema = aktifWarna.style.backgroundColor || aktifWarna.style.background;
    }

    Core.saveSettings(s);
    this.applyTema();
    this.renderHeader();
    this.renderSidebar();
    alert('Profil berhasil disimpan!');
    this.showHalaman('pengaturan');
  },

  // ---------------------------------
  // HALAMAN TENTANG
  // ---------------------------------
  renderTentang(konten) {
    var s = Core.getSettings();
    var namaApp = s.namaApp || 'Panorama Lens Trip';

    konten.innerHTML =
      '<div class="halaman-tentang">' +
        '<div class="tentang-logo" onclick="License.handleLogoClick()">🌿</div>' +
        '<div class="tentang-nama">' + namaApp + '</div>' +
        '<div class="tentang-versi">Versi ' + APP_VERSION + '</div>' +
        '<div class="tentang-desc">' +
          'Aplikasi manajemen agen travel untuk mengelola ' +
          'booking paket tour, hotel, driver, itinerary, dan arus kas.' +
        '</div>' +
        '<div class="tentang-divider"></div>' +
        '<div class="tentang-desc">' +
          '<strong>Pemilik / Pengguna App:</strong><br>' + namaApp +
        '</div>' +
        '<div class="tentang-desc">' +
          '<strong>Dikembangkan oleh:</strong><br>CuedNub<br>' +
          '📧 ed.cued411@gmail.com' +
        '</div>' +
        '<div class="tentang-divider"></div>' +
        '<div class="tentang-fitur">' +
          '<strong>Fitur utama:</strong><br>' +
          '• Booking paket tour<br>' +
          '• Kelola hotel & driver<br>' +
          '• Kelola itinerary<br>' +
          '• Arus kas & laba rugi<br>' +
          '• Backup data<br>' +
          '• Lisensi aplikasi' +
        '</div>' +
        '<div class="tentang-footer">© 2025 ' + namaApp + '</div>' +
      '</div>';
  },

  // ---------------------------------
  // FORM MASTER PAKET
  // ---------------------------------
  bukaFormMasterPaket(editId) {
    var isEdit = !!editId;
    var paket  = isEdit ? Core.getMasterPaketById(editId) : null;
    var id     = isEdit ? paket.id : Core.generatePaketId();
    var destList = Core.getDaftarDestinasi();

    var destOptions = destList.map(function(d) {
      var checked = isEdit && paket.destinasi && paket.destinasi.includes(d)
        ? ' checked' : '';
      return '<label class="checkbox"><input type="checkbox" ' +
        'name="fPaketDest" value="' + d + '"' + checked + '> ' +
        d + '</label>';
    }).join('');

    var html =
      '<form onsubmit="Engine.simpanMasterPaket(event,\'' +
        (isEdit ? editId : '') + '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Paket</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Paket *</label>' +
        '<input type="text" id="fPaketNama" required placeholder="contoh: Bromo + Ijen" ' +
          'value="' + (isEdit ? paket.nama : '') + '">' +
        '<label>Pilih Destinasi *</label>' +
        '<div class="fasilitas-group" id="fPaketDestList">' + destOptions + '</div>' +
        '<button type="button" class="btn-tambah" style="margin-top:4px" ' +
          'onclick="Engine.tambahDestDariPaket()">➕ Tambah Destinasi Baru</button>' +
        '<label>Durasi (hari) *</label>' +
        '<input type="number" id="fPaketHari" min="1" required placeholder="3" ' +
          'value="' + (isEdit ? paket.durHari : '') + '">' +
        '<label>Durasi (malam) *</label>' +
        '<input type="number" id="fPaketMalam" min="0" required placeholder="2" ' +
          'value="' + (isEdit ? paket.durMalam : '') + '">' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('📦 ' + (isEdit ? 'Edit' : 'Tambah') + ' Paket Tour', html);
  },

  tambahDestDariPaket() {
    var nama = prompt('Ketik nama destinasi baru:');
    if (nama === null) return;
    if (!nama.trim()) {
      alert('Nama destinasi tidak boleh kosong');
      return;
    }
    var hasil = Core.tambahDestinasi(nama.trim());
    if (!hasil.ok) {
      alert(hasil.msg);
      return;
    }
    var checkedNow = [];
    document.querySelectorAll('input[name="fPaketDest"]:checked').forEach(function(el) {
      checkedNow.push(el.value);
    });
    checkedNow.push(hasil.nama);
    var destList = Core.getDaftarDestinasi();
    var newHtml = destList.map(function(d) {
      var checked = checkedNow.includes(d) ? ' checked' : '';
      return '<label class="checkbox"><input type="checkbox" ' +
        'name="fPaketDest" value="' + d + '"' + checked + '> ' +
        d + '</label>';
    }).join('');
    var container = document.getElementById('fPaketDestList');
    if (container) container.innerHTML = newHtml;

  },

  simpanMasterPaket(event, editId) {
    event.preventDefault();
    var isEdit = !!editId;
    var nama   = document.getElementById('fPaketNama').value.trim();
    var hari   = document.getElementById('fPaketHari').value;
    var malam  = document.getElementById('fPaketMalam').value;

    var destChecked = document.querySelectorAll('input[name="fPaketDest"]:checked');
    var destinasi = [];
    destChecked.forEach(function(el) { destinasi.push(el.value); });

    if (!nama || !hari || destinasi.length === 0) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    var data = {
      id       : isEdit ? editId : Core.generatePaketId(),
      nama     : nama,
      destinasi: destinasi,
      durHari  : Number(hari),
      durMalam : Number(malam),
      status   : 'Aktif'
    };

    var list = Core.getMasterPaket();
    if (isEdit) {
      var idx = list.findIndex(function(p) { return p.id === editId; });
      if (idx >= 0) list[idx] = data;
    } else {
      list.push(data);
    }
    Core.saveMasterPaket(list);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('masterPaket');
  },

  hapusMasterPaket(id) {
    if (!confirm('Yakin hapus paket ini?')) return;
    var list = Core.getMasterPaket().filter(function(p) { return p.id !== id; });
    Core.saveMasterPaket(list);
    this.showHalaman('masterPaket');
  },

  // ---------------------------------
  // FORM MASTER PAKET DARI BOOKING
  // ---------------------------------
  bukaFormMasterPaketDariBooking() {
    var id = Core.generatePaketId();
    var destList = Core.getDaftarDestinasi();

    var destOptions = destList.map(function(d) {
      return '<label class="checkbox"><input type="checkbox" ' +
        'name="fPaketDest" value="' + d + '"> ' +
        d + '</label>';
    }).join('');

    var html =
      '<form onsubmit="Engine.simpanMasterPaketDariBooking(event)" oninput="Engine.tandaiDirty()">' +
        '<label>ID Paket</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Paket *</label>' +
        '<input type="text" id="fPaketNama" required placeholder="contoh: Bromo + Ijen">' +
        '<label>Pilih Destinasi *</label>' +
        '<div class="fasilitas-group" id="fPaketDestList">' + destOptions + '</div>' +
        '<button type="button" class="btn-tambah" style="margin-top:4px" ' +
          'onclick="Engine.tambahDestDariPaket()">➕ Tambah Destinasi Baru</button>' +
        '<label>Durasi (hari) *</label>' +
        '<input type="number" id="fPaketHari" min="1" required placeholder="3">' +
        '<label>Durasi (malam) *</label>' +
        '<input type="number" id="fPaketMalam" min="0" required placeholder="2">' +
        '<button type="submit" class="btn-simpan">Simpan & Pilih Paket</button>' +
      '</form>';

    this.bukaModal('📦 Tambah Paket Baru', html);
  },

  simpanMasterPaketDariBooking(event) {
    event.preventDefault();
    var nama  = document.getElementById('fPaketNama').value.trim();
    var hari  = document.getElementById('fPaketHari').value;
    var malam = document.getElementById('fPaketMalam').value;

    var destChecked = document.querySelectorAll('input[name="fPaketDest"]:checked');
    var destinasi = [];
    destChecked.forEach(function(el) { destinasi.push(el.value); });

    if (!nama || !hari || destinasi.length === 0) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    var newId = Core.generatePaketId();
    var data = {
      id       : newId,
      nama     : nama,
      destinasi: destinasi,
      durHari  : Number(hari),
      durMalam : Number(malam),
      status   : 'Aktif'
    };

    var list = Core.getMasterPaket();
    list.push(data);
    Core.saveMasterPaket(list);

    this.state.dirtyForm = false;
    this.tutupModal();
    this.bukaFormOrder();

    setTimeout(function() {
      var sel = document.getElementById('fOrderPaket');
      if (sel) {
        sel.value = newId;
        Engine.onPaketChange();
      }
    }, 100);
  },

  // ---------------------------------
  // FORM MASTER DRIVER
  // ---------------------------------
  bukaFormMasterDriver(editId) {
    var isEdit = !!editId;
    var driver = isEdit ? Core.getMasterDriverById(editId) : null;
    var id     = isEdit ? driver.id : Core.generateDriverId();

    var kdrList = Core.getDaftarKendaraan();
    var kendaraanOptions = '<option value="">Pilih kendaraan...</option>';
    kdrList.forEach(function(k) {
      var sel = isEdit && driver.kendaraan === k ? ' selected' : '';
      kendaraanOptions += '<option value="' + k + '"' + sel + '>' + k + '</option>';
    });
    kendaraanOptions += '<option value="__tambahKdr">➕ Tambah Kendaraan Baru</option>';

    var html =
      '<form onsubmit="Engine.simpanMasterDriver(event,\'' +
        (isEdit ? editId : '') + '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Driver</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Driver *</label>' +
        '<input type="text" id="fDriverNama" required placeholder="contoh: Pak Anto" ' +
          'value="' + (isEdit ? driver.nama : '') + '">' +
        '<label>No. HP / WA *</label>' +
        '<input type="tel" id="fDriverHP" required placeholder="08xxxxxxxxxx" ' +
          'value="' + (isEdit ? driver.noHP : '') + '">' +
        '<label>Jenis Kendaraan *</label>' +
        '<select id="fDriverKendaraan" onchange="Engine.onKendaraanChange()" required>' +
          kendaraanOptions +
        '</select>' +
        '<input type="text" id="fDriverKendaraanManual" style="display:none" ' +
          'placeholder="Ketik jenis kendaraan baru">' +
        '<label>Tipe Driver *</label>' +
        '<select id="fDriverTipe" required>' +
          '<option value="Driver Tour"' + (isEdit && driver.tipe === 'Driver Tour' ? ' selected' : '') + '>Driver Tour</option>' +
          '<option value="Driver Jeep"' + (isEdit && driver.tipe === 'Driver Jeep' ? ' selected' : '') + '>Driver Jeep</option>' +
        '</select>' +
        '<label>Status *</label>' +
        '<select id="fDriverStatus" required>' +
          '<option value="Aktif"' + (isEdit && driver.status === 'Aktif' ? ' selected' : '') + '>Aktif</option>' +
          '<option value="Nonaktif"' + (isEdit && driver.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option>' +
        '</select>' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🚗 ' + (isEdit ? 'Edit' : 'Tambah') + ' Driver', html);
  },

  onKendaraanChange() {
    var sel = document.getElementById('fDriverKendaraan');
    var man = document.getElementById('fDriverKendaraanManual');
    if (sel && man) {
      man.style.display = sel.value === '__tambahKdr' ? 'block' : 'none';
      if (sel.value !== '__tambahKdr') man.value = '';
    }
  },

  simpanMasterDriver(event, editId) {
    event.preventDefault();
    var isEdit    = !!editId;
    var nama      = document.getElementById('fDriverNama').value.trim();
    var hp        = document.getElementById('fDriverHP').value.trim();
    var kdrSel    = document.getElementById('fDriverKendaraan').value;
    var kdrManual = document.getElementById('fDriverKendaraanManual').value.trim();
    var tipe      = document.getElementById('fDriverTipe').value;
    var status    = document.getElementById('fDriverStatus').value;

    var kendaraan = kdrSel;
    if (kdrSel === '__tambahKdr') {
      if (!kdrManual) {
        alert('Ketik jenis kendaraan baru');
        return;
      }
      var hasil = Core.tambahKendaraan(kdrManual);
      if (!hasil.ok) {
        alert(hasil.msg);
        return;
      }
      kendaraan = hasil.nama;
    }

    if (!nama || !hp || !kendaraan) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    var data = {
      id       : isEdit ? editId : Core.generateDriverId(),
      nama     : nama,
      noHP     : hp,
      kendaraan: kendaraan,
      tipe     : tipe,
      status   : status
    };

    var list = Core.getMasterDriver();
    if (isEdit) {
      var idx = list.findIndex(function(d) { return d.id === editId; });
      if (idx >= 0) list[idx] = data;
    } else {
      list.push(data);
    }
    Core.saveMasterDriver(list);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('masterDriver');
  },

  hapusMasterDriver(id) {
    if (!confirm('Yakin hapus driver ini?')) return;
    var list = Core.getMasterDriver().filter(function(d) { return d.id !== id; });
    Core.saveMasterDriver(list);
    this.showHalaman('masterDriver');
  },

  // ---------------------------------
  // FORM MASTER HOTEL
  // ---------------------------------
  bukaFormMasterHotel(editId) {
    var isEdit = !!editId;
    var hotel  = isEdit ? Core.getMasterHotelById(editId) : null;
    var id     = isEdit ? hotel.id : Core.generateHotelId();
    var destList = Core.getDaftarDestinasi();

    var destOptions = '<option value="">Pilih destinasi...</option>';
    destList.forEach(function(d) {
      var sel = isEdit && hotel.destinasi === d ? ' selected' : '';
      destOptions += '<option value="' + d + '"' + sel + '>' + d + '</option>';
    });
    destOptions += '<option value="__tambahDest">➕ Tambah Destinasi Baru</option>';

    var html =
      '<form onsubmit="Engine.simpanMasterHotel(event,\'' +
        (isEdit ? editId : '') + '\')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Hotel</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Hotel *</label>' +
        '<input type="text" id="fHotelNamaM" required placeholder="contoh: Hotel Bromo View" ' +
          'value="' + (isEdit ? hotel.nama : '') + '">' +
        '<label>Lokasi / Destinasi *</label>' +
        '<select id="fHotelDestM" onchange="Engine.onDestMasterChange()" required>' + destOptions + '</select>' +
        '<input type="text" id="fHotelDestManual" style="display:none" placeholder="Ketik nama destinasi baru">' +
        '<label>Harga Standar / Malam *</label>' +
        '<input type="number" id="fHotelHargaM" min="0" required placeholder="0" ' +
          'value="' + (isEdit ? hotel.harga : '') + '">' +
        '<label>Keterangan</label>' +
        '<input type="text" id="fHotelKetM" placeholder="contoh: View Bromo, breakfast 2 orang" ' +
          'value="' + (isEdit ? (hotel.keterangan || '') : '') + '">' +
        '<label>Status *</label>' +
        '<select id="fHotelStatusM" required>' +
          '<option value="Aktif"' + (isEdit && hotel.status === 'Aktif' ? ' selected' : '') + '>Aktif</option>' +
          '<option value="Nonaktif"' + (isEdit && hotel.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option>' +
        '</select>' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('🏨 ' + (isEdit ? 'Edit' : 'Tambah') + ' Hotel', html);
  },

  onDestMasterChange() {
    var sel = document.getElementById('fHotelDestM');
    var man = document.getElementById('fHotelDestManual');
    if (sel && man) {
      man.style.display = sel.value === '__tambahDest' ? 'block' : 'none';
      if (sel.value !== '__tambahDest') man.value = '';
    }
  },

  simpanMasterHotel(event, editId) {
    event.preventDefault();
    var isEdit = !!editId;
    var nama   = document.getElementById('fHotelNamaM').value.trim();
    var destSel = document.getElementById('fHotelDestM').value;
    var destManual = document.getElementById('fHotelDestManual').value.trim();
    var harga  = document.getElementById('fHotelHargaM').value;
    var ket    = document.getElementById('fHotelKetM').value.trim();
    var status = document.getElementById('fHotelStatusM').value;

    var dest = destSel;
    if (destSel === '__tambahDest') {
      if (!destManual) {
        alert('Ketik nama destinasi baru');
        return;
      }
      var hasil = Core.tambahDestinasi(destManual);
      if (!hasil.ok) {
        alert(hasil.msg);
        return;
      }
      dest = hasil.nama;
    }

    if (!nama || !dest || !harga) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    var data = {
      id        : isEdit ? editId : Core.generateHotelId(),
      nama      : nama,
      destinasi : dest,
      harga     : Number(harga),
      keterangan: ket,
      status    : status
    };

    var list = Core.getMasterHotel();
    if (isEdit) {
      var idx = list.findIndex(function(h) { return h.id === editId; });
      if (idx >= 0) list[idx] = data;
    } else {
      list.push(data);
    }
    Core.saveMasterHotel(list);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('masterHotel');
  },

  hapusMasterHotel(id) {
    if (!confirm('Yakin hapus hotel ini?')) return;
    var list = Core.getMasterHotel().filter(function(h) { return h.id !== id; });
    Core.saveMasterHotel(list);
    this.showHalaman('masterHotel');
  },

  // ---------------------------------
  // FORM MASTER DESTINASI
  // ---------------------------------



};
// Daftarkan ke window
window.Engine = Engine;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS Engine
// =════════════════════════════════
