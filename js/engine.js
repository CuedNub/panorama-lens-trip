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
    filterBooking   : 'Semua',
    filterArusKas   : 'Semua',
    filterMaster    : {},
    searchBooking   : '',
    searchArusKas   : '',
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
        '<a onclick="Engine.showHalaman(\'masterDestinasi\')">📍 Master Destinasi</a>' +
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
    else if (nama === 'masterDestinasi') this.renderMasterDestinasi(konten);
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
          '<input type="text" placeholder="🔍 Cari nama tamu / ID..." ' +
          'value="' + this.state.searchBooking + '" ' +
          'oninput="Engine.setSearchBooking(this.value)">' +
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
          sudahPesan.push('Hotel ' +
            (h.snapshotHotel ? h.snapshotHotel.nama : '') +
            ' (' + (h.snapshotHotel ? h.snapshotHotel.destinasi : '') + ')');
        });
      } else {
        belumPesan.push('Hotel');
      }
    }

    if (b.fasilitasDriverTour) {
      const dt = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'sewa driver tour');
      if (dt.length > 0) {
        dt.forEach(d => {
          sudahPesan.push(
            (d.snapshotDriver ? d.snapshotDriver.nama : 'Driver Tour') +
            ' - ' + (d.snapshotDriver ? d.snapshotDriver.kendaraan : ''));
        });
      } else {
        belumPesan.push('Driver Tour');
      }
    }

    if (adaBromo && b.fasilitasDriverJeep) {
      const dj = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'sewa driver jeep');
      if (dj.length > 0) {
        dj.forEach(d => {
          sudahPesan.push(
            (d.snapshotDriver ? d.snapshotDriver.nama : 'Driver Jeep') +
            ' (Bromo)');
        });
      } else {
        belumPesan.push('Driver Jeep (Bromo)');
      }
    }

    if (adaBromo && b.fasilitasPiknik) {
      const pk = Core.getArusKasByBookingId(b.id)
        .filter(a => a.kategori === 'piknik bromo');
      if (pk.length > 0) sudahPesan.push('Piknik Bromo');
      else belumPesan.push('Piknik Bromo');
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
              '<div class="checklist-item">• ' + s + '</div>'
            ).join('') +
          '</div>';
      }

      if (belumPesan.length > 0) {
        html +=
          '<div class="checklist-group warning">' +
            '<div class="checklist-title">⚠️ Belum pesan:</div>' +
            belumPesan.map(s =>
              '<div class="checklist-item">• ' + s + '</div>'
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
            '<button onclick="Engine.bukaFormHotel(\'' + b.id +
              '\')">🏨 Hotel</button>' +
            '<button onclick="Engine.bukaFormDriverTour(\'' + b.id +
              '\')">🚗 Driver Tour</button>' +
          '</div>';

      if (adaBromo) {
        html +=
          '<div class="card-actions">' +
            '<button onclick="Engine.bukaFormDriverJeep(\'' + b.id +
              '\')">🚙 Driver Jeep</button>' +
            '<button onclick="Engine.bukaFormPiknik(\'' + b.id +
              '\')">🏕️ Piknik</button>' +
          '</div>';
      }

      html +=
          '<div class="card-actions">' +
            '<button onclick="Engine.bukaItinerary(\'' + b.id +
              '\')">📍 Itinerary</button>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button onclick="Itinerary.exportTamu(\'' + b.id +
              '\')">📸 Itinerary Tamu</button>' +
            '<button onclick="Itinerary.exportDriver(\'' + b.id +
              '\')">📸 Itinerary Driver</button>' +
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

  setSearchBooking(v) {
    this.state.searchBooking = v;
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
          '<input type="text" placeholder="🔍 Cari nama tamu / ID..." ' +
          'value="' + this.state.searchArusKas + '" ' +
          'oninput="Engine.setSearchArusKas(this.value)">' +
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

  setSearchArusKas(v) {
    this.state.searchArusKas = v;
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
      opsiPaket += '<option value="' + p.id + '">' + p.nama +
        ' (' + Core.formatRupiah(p.harga) + ')</option>';
    });

    let opsiTempat = '<option value="">Pilih tempat...</option>';
    tempat.forEach(t => {
      opsiTempat += '<option value="' + t + '">' + t + '</option>';
    });

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
        '<input type="datetime-local" id="fOrderTiba">' +

        '<label>Bandara / Tempat Tiba</label>' +
        '<input type="text" id="fOrderBandara" ' +
          'placeholder="contoh: Bandara Juanda, Surabaya">' +

        '<div class="section-divider">── Info Jemput (opsional) ──</div>' +

        '<label>Tempat Jemput</label>' +
        '<select id="fOrderTempatJemput">' + opsiTempat + '</select>' +

        '<label>Waktu Jemput</label>' +
        '<input type="datetime-local" id="fOrderWaktuJemput">' +

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

  onPaketChange() {
    const sel  = document.getElementById('fOrderPaket');
    const info = document.getElementById('fOrderInfoPaket');
    const fas  = document.getElementById('fOrderFasilitas');
    if (!sel || !info || !fas) return;

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
          paket.durMalam + ' malam<br>' +
        '💰 Total Harga: ' + Core.formatRupiah(paket.harga) +
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
    const paketSel   = document.getElementById('fOrderPaket');
    const bayarInput = document.getElementById('fOrderBayar');
    const sisaEl     = document.getElementById('fOrderSisaBayar');
    const statusEl   = document.getElementById('fOrderStatusBayar');
    if (!paketSel || !bayarInput || !sisaEl || !statusEl) return;

    const paket = Core.getMasterPaketById(paketSel.value);
    if (!paket) return;

    const total = Number(paket.harga) || 0;
    const bayar = Number(bayarInput.value) || 0;
    const sisa  = total - bayar;

    let status = 'Belum bayar';
    if (bayar >= total) status = 'Lunas';
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
    const tglBrkt = document.getElementById('fOrderTglBerangkat').value;
    const bayar   = document.getElementById('fOrderBayar').value;

    if (!nama || !hp || !pax || !paketId || !tglBrkt) {
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
      totalHarga      : Number(paket.harga),
      tglBerangkat    : tglBrkt,
      tglPulang       : document.getElementById('fOrderTglPulang').value || '',
      infoPenerbangan : document.getElementById('fOrderFlight').value || '',
      waktuTiba       : document.getElementById('fOrderTiba').value || '',
      bandara         : document.getElementById('fOrderBandara').value || '',
      tempatJemput    : document.getElementById('fOrderTempatJemput')
                          .value || '',
      waktuJemput     : document.getElementById('fOrderWaktuJemput')
                          .value || '',
      fasilitasHotel      : fasHotel ? fasHotel.checked : false,
      fasilitasDriverTour : fasDT ? fasDT.checked : false,
      fasilitasDriverJeep : adaBromo && fasDJ ? fasDJ.checked : false,
      fasilitasPiknik     : adaBromo && fasPK ? fasPK.checked : false,
      statusBooking   : 'Baru',
      snapshotPaket   : {
        nama      : paket.nama,
        harga     : paket.harga,
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
    let opsiDest = '<option value="">Pilih destinasi...</option>';
    destList.forEach(d => {
      opsiDest += '<option value="' + d + '">' + d + '</option>';
    });

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
      '<label>Hotel *</label>' +
      '<select id="fHotelNama' + nomor + '" ' +
        'onchange="Engine.onHotelNamaChange(' + nomor + ')" required>' +
        '<option value="">Pilih hotel...</option>' +
      '</select>' +
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
    const dest   = document.getElementById('fHotelDest' + nomor).value;
    const selHotel = document.getElementById('fHotelNama' + nomor);
    if (!selHotel) return;

    const hotels = Core.getMasterHotelByDestinasi(dest);
    let opsi = '<option value="">Pilih hotel...</option>';
    hotels.forEach(h => {
      opsi += '<option value="' + h.id + '">' + h.nama +
        ' (' + Core.formatRupiah(h.harga) + '/malam)</option>';
    });
    selHotel.innerHTML = opsi;
  },

  onHotelNamaChange(nomor) {
    const hotelId = document.getElementById('fHotelNama' + nomor).value;
    const biaya   = document.getElementById('fHotelBiaya' + nomor);
    if (!biaya) return;

    const hotel = Core.getMasterHotelById(hotelId);
    if (hotel) biaya.value = hotel.harga || 0;
  },

  simpanHotel(event, bookingId) {
    event.preventDefault();
    const arusKas = Core.getArusKas();

    for (let i = 1; i <= this.state.hotelCount; i++) {
      const field = document.getElementById('hotelField' + i);
      if (!field) continue;

      const dest   = document.getElementById('fHotelDest' + i).value;
      const htlId  = document.getElementById('fHotelNama' + i).value;
      const tgl    = document.getElementById('fHotelTgl' + i).value;
      const biaya  = document.getElementById('fHotelBiaya' + i).value;
      const status = document.getElementById('fHotelStatus' + i).value;
      const ket    = document.getElementById('fHotelKet' + i).value.trim();

      if (!dest || !htlId || !tgl || !status) {
        alert('Lengkapi semua field Hotel ' + i + ' bertanda *');
        return;
      }

      const hotel = Core.getMasterHotelById(htlId);

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
  bukaItinerary(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return;

    const destList = b.destinasi || [];
    const tglMulai = new Date(b.tglBerangkat);

    let isiHtml = '<div class="itinerary-view">' +
      '<div class="itin-header">' +
        b.id + ' — ' + b.namaTamu + '<br>' +
        '📦 ' + (b.snapshotPaket ? b.snapshotPaket.nama : '-') + '<br>' +
        '📅 ' + Core.formatTanggalPendek(b.tglBerangkat) + ' - ' +
          Core.formatTanggalPendek(b.tglPulang) + '<br>' +
        '👥 ' + b.jumlahPax + ' pax' +
      '</div>';

    destList.forEach(function(destNama, idx) {
      const tglHari = new Date(tglMulai);
      tglHari.setDate(tglHari.getDate() + idx);

      const destinasi = Core.getMasterDestinasi().find(
        function(d) { return d.nama === destNama; }
      );
      const aktivitas = destinasi ? (destinasi.aktivitas || []) : [];

      isiHtml +=
        '<div class="itin-hari">' +
          '<div class="itin-hari-title">📅 Hari ' + (idx + 1) + ' — ' +
            Core.formatTanggalPendek(tglHari.toISOString()) + '</div>' +
          '<div class="itin-dest">📍 ' + destNama + '</div>';

      if (aktivitas.length > 0) {
        aktivitas.sort(function(a, c) {
          return (a.waktu || '').localeCompare(c.waktu || '');
        });
        aktivitas.forEach(function(a) {
          isiHtml += '<div class="itin-akt">' + a.waktu + ' ' +
            a.nama + '</div>';
        });
      } else {
        isiHtml += '<div class="itin-akt">Belum ada aktivitas</div>';
      }

      isiHtml += '</div>';
    });

    isiHtml += '</div>';

    this.bukaModal('📍 Itinerary', isiHtml);
  },

  // ---------------------------------
  // HALAMAN MASTER PAKET
  // ---------------------------------
  renderMasterPaket(konten) {
    const filter = this.state.filterMaster.paket || 'Semua';
    const search = (this.state.filterMaster.searchPaket || '').toLowerCase();
    let data = Core.getMasterPaket();

    if (filter !== 'Semua') data = data.filter(p => p.status === filter);
    if (search) data = data.filter(p =>
      p.nama.toLowerCase().includes(search));

    const tabs = ['Semua','Aktif','Nonaktif'];
    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (filter === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterMaster(\'paket\',\'' + t + '\')">' +
        t + '</button>'
    ).join('');

    let cardsHtml = '';
    if (data.length === 0) {
      cardsHtml = '<div class="empty-state"><div class="empty-icon">📦</div>' +
        '<p>Belum ada data paket.</p></div>';
    } else {
      cardsHtml = data.map(p => this.renderCardMasterPaket(p)).join('');
    }

    konten.innerHTML =
      '<div class="search-bar"><input type="text" ' +
        'placeholder="🔍 Cari nama paket..." value="' + search + '" ' +
        'oninput="Engine.setSearchMaster(\'searchPaket\',this.value)"></div>' +
      '<div class="tabs">' + tabsHtml + '</div>' +
      '<div id="listMaster">' + cardsHtml + '</div>' +
      '<button class="fab" onclick="Engine.bukaFormMasterPaket()">+</button>';
  },

  renderCardMasterPaket(p) {
    const exp = this.state.filterMaster.expandPaket === p.id;
    let html = '<div class="card-master" onclick="Engine.toggleExpandMaster(\'expandPaket\',\'' + p.id + '\')">' +
      '<div class="card-header"><span>' + p.id + '</span>' +
        '<span class="badge ' + (p.status === 'Aktif' ? 'badge-hijau' : 'badge-abu') + '">' + p.status + '</span></div>' +
      '<div class="card-info">' + p.nama + '<br>' +
        '📅 ' + p.durHari + ' hari ' + p.durMalam + ' malam<br>' +
        '👥 ' + p.pax + ' pax | 💰 ' + Core.formatRupiah(p.harga) + '</div>';

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
      '<div class="search-bar"><input type="text" ' +
        'placeholder="🔍 Cari nama driver..." value="' + search + '" ' +
        'oninput="Engine.setSearchMaster(\'searchDriver\',this.value)"></div>' +
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
      '<div class="search-bar"><input type="text" ' +
        'placeholder="🔍 Cari nama hotel..." value="' + search + '" ' +
        'oninput="Engine.setSearchMaster(\'searchHotel\',this.value)"></div>' +
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
  renderMasterDestinasi(konten) {
    const filter = this.state.filterMaster.destinasi || 'Semua';
    const search = (this.state.filterMaster.searchDest || '').toLowerCase();
    let data = Core.getMasterDestinasi();

    if (filter !== 'Semua') data = data.filter(d => d.status === filter);
    if (search) data = data.filter(d => d.nama.toLowerCase().includes(search));

    const tabs = ['Semua','Aktif','Nonaktif'];
    let tabsHtml = tabs.map(t =>
      '<button class="tab' + (filter === t ? ' aktif' : '') +
      '" onclick="Engine.setFilterMaster(\'destinasi\',\'' + t + '\')">' + t + '</button>'
    ).join('');

    let cardsHtml = '';
    if (data.length === 0) {
      cardsHtml = '<div class="empty-state"><div class="empty-icon">📍</div>' +
        '<p>Belum ada data destinasi.</p></div>';
    } else {
      cardsHtml = data.map(d => this.renderCardMasterDestinasi(d)).join('');
    }

    konten.innerHTML =
      '<div class="search-bar"><input type="text" ' +
        'placeholder="🔍 Cari nama destinasi..." value="' + search + '" ' +
        'oninput="Engine.setSearchMaster(\'searchDest\',this.value)"></div>' +
      '<div class="tabs">' + tabsHtml + '</div>' +
      '<div id="listMaster">' + cardsHtml + '</div>' +
      '<button class="fab" onclick="Engine.bukaFormMasterDestinasi()">+</button>';
  },

  renderCardMasterDestinasi(d) {
    const exp = this.state.filterMaster.expandDest === d.id;
    const akt = d.aktivitas || [];
    let html = '<div class="card-master" onclick="Engine.toggleExpandMaster(\'expandDest\',\'' + d.id + '\')">' +
      '<div class="card-header"><span>' + d.id + '</span>' +
        '<span class="badge ' + (d.status === 'Aktif' ? 'badge-hijau' : 'badge-abu') + '">' + d.status + '</span></div>' +
      '<div class="card-info">' + d.nama + '<br>' +
        '🕐 ' + akt.length + ' aktivitas</div>';

    if (exp) {
      html += '<div class="card-detail" onclick="event.stopPropagation()">' +
        '<div>🕐 Aktivitas:</div>';
      akt.sort(function(a, c) { return (a.waktu || '').localeCompare(c.waktu || ''); });
      akt.forEach(function(a) { html += '<div>' + a.waktu + ' ' + a.nama + '</div>'; });
      html += '<div class="card-actions">' +
          '<button onclick="Engine.bukaFormMasterDestinasi(\'' + d.id + '\')">✏️ Edit</button>' +
          '<button onclick="Engine.hapusMasterDestinasi(\'' + d.id + '\')">🗑️ Hapus</button>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  },

  // ---------------------------------
  // MASTER FILTER & SEARCH HELPERS
  // ---------------------------------
  setFilterMaster(key, val) {
    this.state.filterMaster[key] = val;
    this.showHalaman(this.state.halamanAktif);
  },

  setSearchMaster(key, val) {
    this.state.filterMaster[key] = val;
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
  }

};

// Daftarkan ke window
window.Engine = Engine;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS Engine
// =════════════════════════════════
