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
        'onclick="Engine.pilihWarna('' + w.kode + '')"></div>';
    }).join('');

    var tempatHtml = (s.tempatJemput || []).map(function(t, i) {
      return '<div class="tempat-jemput-item">' +
        '<span>' + t + '</span>' +
        '<button class="btn-hapus" onclick="Engine.hapusTempatJemput(' + i + ')">🗑️</button>' +
      '</div>';
    }).join('');

    var lastBackup  = Core.getLastBackup();
    var lastRestore = Core.getLastRestore();

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
    var destAktif = Core.getMasterDestinasiAktif();

    var destOptions = destAktif.map(function(d) {
      var checked = isEdit && paket.destinasi && paket.destinasi.includes(d.nama)
        ? ' checked' : '';
      return '<label class="checkbox"><input type="checkbox" ' +
        'name="fPaketDest" value="' + d.nama + '"' + checked + '> ' +
        d.nama + '</label>';
    }).join('');

    var html =
      '<form onsubmit="Engine.simpanMasterPaket(event,'' +
        (isEdit ? editId : '') + '')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Paket</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Paket *</label>' +
        '<input type="text" id="fPaketNama" required placeholder="contoh: Bromo + Ijen" ' +
          'value="' + (isEdit ? paket.nama : '') + '">' +
        '<label>Pilih Destinasi *</label>' +
        '<div class="fasilitas-group">' + destOptions + '</div>' +
        '<label>Durasi (hari) *</label>' +
        '<input type="number" id="fPaketHari" min="1" required placeholder="3" ' +
          'value="' + (isEdit ? paket.durHari : '') + '">' +
        '<label>Durasi (malam) *</label>' +
        '<input type="number" id="fPaketMalam" min="0" required placeholder="2" ' +
          'value="' + (isEdit ? paket.durMalam : '') + '">' +
        '<label>Jumlah Pax *</label>' +
        '<input type="number" id="fPaketPax" min="1" required placeholder="4" ' +
          'value="' + (isEdit ? paket.pax : '') + '">' +
        '<label>Harga Paket *</label>' +
        '<input type="number" id="fPaketHarga" min="0" required placeholder="0" ' +
          'value="' + (isEdit ? paket.harga : '') + '">' +
        '<label>Status Paket *</label>' +
        '<select id="fPaketStatus" required>' +
          '<option value="Aktif"' + (isEdit && paket.status === 'Aktif' ? ' selected' : '') + '>Aktif</option>' +
          '<option value="Nonaktif"' + (isEdit && paket.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option>' +
        '</select>' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('📦 ' + (isEdit ? 'Edit' : 'Tambah') + ' Paket Tour', html);
  },

  simpanMasterPaket(event, editId) {
    event.preventDefault();
    var isEdit = !!editId;
    var nama   = document.getElementById('fPaketNama').value.trim();
    var hari   = document.getElementById('fPaketHari').value;
    var malam  = document.getElementById('fPaketMalam').value;
    var pax    = document.getElementById('fPaketPax').value;
    var harga  = document.getElementById('fPaketHarga').value;
    var status = document.getElementById('fPaketStatus').value;

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
      pax      : Number(pax),
      harga    : Number(harga),
      status   : status
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
  // FORM MASTER DRIVER
  // ---------------------------------
  bukaFormMasterDriver(editId) {
    var isEdit = !!editId;
    var driver = isEdit ? Core.getMasterDriverById(editId) : null;
    var id     = isEdit ? driver.id : Core.generateDriverId();

    var html =
      '<form onsubmit="Engine.simpanMasterDriver(event,'' +
        (isEdit ? editId : '') + '')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Driver</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Driver *</label>' +
        '<input type="text" id="fDriverNama" required placeholder="contoh: Pak Anto" ' +
          'value="' + (isEdit ? driver.nama : '') + '">' +
        '<label>No. HP / WA *</label>' +
        '<input type="tel" id="fDriverHP" required placeholder="08xxxxxxxxxx" ' +
          'value="' + (isEdit ? driver.noHP : '') + '">' +
        '<label>Jenis Kendaraan *</label>' +
        '<input type="text" id="fDriverKendaraan" required placeholder="contoh: Hiace" ' +
          'value="' + (isEdit ? driver.kendaraan : '') + '">' +
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

  simpanMasterDriver(event, editId) {
    event.preventDefault();
    var isEdit    = !!editId;
    var nama      = document.getElementById('fDriverNama').value.trim();
    var hp        = document.getElementById('fDriverHP').value.trim();
    var kendaraan = document.getElementById('fDriverKendaraan').value.trim();
    var tipe      = document.getElementById('fDriverTipe').value;
    var status    = document.getElementById('fDriverStatus').value;

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
    var destAktif = Core.getMasterDestinasiAktif();

    var destOptions = '<option value="">Pilih destinasi...</option>';
    destAktif.forEach(function(d) {
      var sel = isEdit && hotel.destinasi === d.nama ? ' selected' : '';
      destOptions += '<option value="' + d.nama + '"' + sel + '>' + d.nama + '</option>';
    });

    var html =
      '<form onsubmit="Engine.simpanMasterHotel(event,'' +
        (isEdit ? editId : '') + '')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Hotel</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Hotel *</label>' +
        '<input type="text" id="fHotelNamaM" required placeholder="contoh: Hotel Bromo View" ' +
          'value="' + (isEdit ? hotel.nama : '') + '">' +
        '<label>Lokasi / Destinasi *</label>' +
        '<select id="fHotelDestM" required>' + destOptions + '</select>' +
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

  simpanMasterHotel(event, editId) {
    event.preventDefault();
    var isEdit = !!editId;
    var nama   = document.getElementById('fHotelNamaM').value.trim();
    var dest   = document.getElementById('fHotelDestM').value;
    var harga  = document.getElementById('fHotelHargaM').value;
    var ket    = document.getElementById('fHotelKetM').value.trim();
    var status = document.getElementById('fHotelStatusM').value;

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
  bukaFormMasterDestinasi(editId) {
    var isEdit  = !!editId;
    var dest    = isEdit ? Core.getMasterDestinasiById(editId) : null;
    var id      = isEdit ? dest.id : Core.generateDestinasiId();
    var aktList = isEdit ? (dest.aktivitas || []) : [];

    aktList.sort(function(a, b) { return (a.waktu || '').localeCompare(b.waktu || ''); });

    var aktHtml = '';
    if (aktList.length > 0) {
      aktHtml = '<div id="daftarAktivitas">';
      aktList.forEach(function(a, i) {
        aktHtml +=
          '<div class="tempat-jemput-item">' +
            '<span>' + a.waktu + ' ' + a.nama + '</span>' +
            '<button class="btn-hapus" type="button" ' +
              'onclick="Engine.hapusAktivitas(' + i + ')">🗑️</button>' +
          '</div>';
      });
      aktHtml += '</div>';
    } else {
      aktHtml = '<div id="daftarAktivitas"><p style="font-size:13px;color:#999">Belum ada aktivitas</p></div>';
    }

    var html =
      '<form onsubmit="Engine.simpanMasterDestinasi(event,'' +
        (isEdit ? editId : '') + '')" oninput="Engine.tandaiDirty()">' +
        '<label>ID Destinasi</label>' +
        '<input type="text" value="' + id + '" readonly>' +
        '<label>Nama Destinasi *</label>' +
        '<input type="text" id="fDestNama" required placeholder="contoh: Bromo" ' +
          'value="' + (isEdit ? dest.nama : '') + '">' +
        '<label>🕐 Aktivitas:</label>' +
        aktHtml +
        '<div class="section-divider">── Tambah Aktivitas ──</div>' +
        '<label>Waktu *</label>' +
        '<input type="time" id="fDestAktWaktu">' +
        '<label>Nama Aktivitas *</label>' +
        '<input type="text" id="fDestAktNama" placeholder="contoh: Sunrise">' +
        '<button type="button" class="btn-tambah" ' +
          'onclick="Engine.tambahAktivitas()">+ Tambah Aktivitas</button>' +
        '<input type="hidden" id="fDestAktData" value='' +
          JSON.stringify(aktList).replace(/'/g, '&#39;') + ''>' +
        '<label>Status *</label>' +
        '<select id="fDestStatus" required>' +
          '<option value="Aktif"' + (isEdit && dest.status === 'Aktif' ? ' selected' : '') + '>Aktif</option>' +
          '<option value="Nonaktif"' + (isEdit && dest.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option>' +
        '</select>' +
        '<button type="submit" class="btn-simpan">Simpan</button>' +
      '</form>';

    this.bukaModal('📍 ' + (isEdit ? 'Edit' : 'Tambah') + ' Destinasi', html);
  },

  tambahAktivitas() {
    var waktu = document.getElementById('fDestAktWaktu').value;
    var nama  = document.getElementById('fDestAktNama').value.trim();
    if (!waktu || !nama) {
      alert('Isi waktu dan nama aktivitas');
      return;
    }

    var dataEl = document.getElementById('fDestAktData');
    var list = JSON.parse(dataEl.value || '[]');
    list.push({ waktu: waktu, nama: nama });
    list.sort(function(a, b) { return (a.waktu || '').localeCompare(b.waktu || ''); });
    dataEl.value = JSON.stringify(list);

    var container = document.getElementById('daftarAktivitas');
    container.innerHTML = '';
    list.forEach(function(a, i) {
      container.innerHTML +=
        '<div class="tempat-jemput-item">' +
          '<span>' + a.waktu + ' ' + a.nama + '</span>' +
          '<button class="btn-hapus" type="button" ' +
            'onclick="Engine.hapusAktivitas(' + i + ')">🗑️</button>' +
        '</div>';
    });

    document.getElementById('fDestAktWaktu').value = '';
    document.getElementById('fDestAktNama').value  = '';
  },

  hapusAktivitas(index) {
    var dataEl = document.getElementById('fDestAktData');
    var list = JSON.parse(dataEl.value || '[]');
    list.splice(index, 1);
    dataEl.value = JSON.stringify(list);

    var container = document.getElementById('daftarAktivitas');
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:#999">Belum ada aktivitas</p>';
      return;
    }
    list.forEach(function(a, i) {
      container.innerHTML +=
        '<div class="tempat-jemput-item">' +
          '<span>' + a.waktu + ' ' + a.nama + '</span>' +
          '<button class="btn-hapus" type="button" ' +
            'onclick="Engine.hapusAktivitas(' + i + ')">🗑️</button>' +
        '</div>';
    });
  },

  simpanMasterDestinasi(event, editId) {
    event.preventDefault();
    var isEdit = !!editId;
    var nama   = document.getElementById('fDestNama').value.trim();
    var status = document.getElementById('fDestStatus').value;
    var aktData = document.getElementById('fDestAktData');
    var aktivitas = JSON.parse(aktData.value || '[]');

    if (!nama) {
      alert('Lengkapi semua field bertanda *');
      return;
    }

    var data = {
      id        : isEdit ? editId : Core.generateDestinasiId(),
      nama      : nama,
      aktivitas : aktivitas,
      status    : status
    };

    var list = Core.getMasterDestinasi();
    if (isEdit) {
      var idx = list.findIndex(function(d) { return d.id === editId; });
      if (idx >= 0) list[idx] = data;
    } else {
      list.push(data);
    }
    Core.saveMasterDestinasi(list);
    this.state.dirtyForm = false;
    this.tutupModal();
    this.showHalaman('masterDestinasi');
  },

  hapusMasterDestinasi(id) {
    if (!confirm('Yakin hapus destinasi ini?')) return;
    var list = Core.getMasterDestinasi().filter(function(d) { return d.id !== id; });
    Core.saveMasterDestinasi(list);
    this.showHalaman('masterDestinasi');
  },

// Daftarkan ke window
window.Engine = Engine;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS Engine
// =════════════════════════════════
