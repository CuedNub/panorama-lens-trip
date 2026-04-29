/*
  FILE    : js/license.js
  VERSI   : 1.0.0
  FUNGSI  : Sistem lisensi, aktivasi, lockscreen, anti-manipulasi, revoke
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS License
// =════════════════════════════════

const License = {

  // ---------------------------------
  // KONSTANTA
  // ---------------------------------
  SECRET_KEY  : 'CUEDNUB_SK_2025',
  ADMIN_PASS  : 'cued-nub',
  PREFIX      : 'CM',
  REVOKE_KEY  : 'v1',
  APP_KEY     : 'plt',
  DAYS_MAP    : { 'A': 30, 'B': 60, 'C': 90, 'D': 180, 'E': 365 },
  DAYS_CODE   : { 30: 'A', 60: 'B', 90: 'C', 180: 'D', 365: 'E' },

  // Logo click counter
  logoClickCount : 0,
  logoClickTimer : null,

  // ---------------------------------
  // STORAGE KEYS
  // ---------------------------------
  key(name) {
    return 'cued_' + this.APP_KEY + '_' + name;
  },

  // ---------------------------------
  // INIT LISENSI
  // ---------------------------------
  init() {
    this.cekRevoke();
    const data = this.getData();

    if (!data) {
      this.showLockscreen('belum');
      return false;
    }

    const sisa = this.getSisaHari();
    if (sisa <= 0) {
      this.showLockscreen('habis');
      return false;
    }

    if (sisa <= 7) {
      this.showWarning(sisa);
    }

    this.logTodayUsage();
    return true;
  },

  // ---------------------------------
  // GET & SAVE DATA LISENSI
  // ---------------------------------
  getData() {
    try {
      const raw = localStorage.getItem(this.key('license'));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  saveData(data) {
    localStorage.setItem(this.key('license'), JSON.stringify(data));
  },

  clearData() {
    localStorage.removeItem(this.key('license'));
    localStorage.removeItem(this.key('usage_log'));
    localStorage.removeItem(this.key('last_open'));
    localStorage.removeItem(this.key('last_server_time'));
    localStorage.removeItem(this.key('last_server_check'));
  },

  // ---------------------------------
  // USED CODES
  // ---------------------------------
  getUsedCodes() {
    try {
      const raw = localStorage.getItem(this.key('used_codes'));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveUsedCode(code) {
    const codes = this.getUsedCodes();
    if (!codes.includes(code)) {
      codes.push(code);
      localStorage.setItem(this.key('used_codes'), JSON.stringify(codes));
    }
  },

  // ---------------------------------
  // USAGE LOG (hari pakai)
  // ---------------------------------
  getUsageLog() {
    try {
      const raw = localStorage.getItem(this.key('usage_log'));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveUsageLog(log) {
    localStorage.setItem(this.key('usage_log'), JSON.stringify(log));
  },

  logTodayUsage() {
    var today = new Date().toISOString().substring(0, 10);
    var lastOpen = localStorage.getItem(this.key('last_open'));

    if (lastOpen) {
      var lastDate = new Date(lastOpen);
      var now = new Date();
      if (now < lastDate) {
        today = lastOpen;
      }
    }

    var log = this.getUsageLog();
    if (!log.includes(today)) {
      log.push(today);
      this.saveUsageLog(log);
    }

    localStorage.setItem(this.key('last_open'), today);
  },

  getUsedDays() {
    return this.getUsageLog().length;
  },

  // ---------------------------------
  // SISA HARI
  // ---------------------------------
  getSisaHari() {
    var data = this.getData();
    if (!data) return null;
    var totalDays = data.totalDays || 0;
    var usedDays  = this.getUsedDays();
    return totalDays - usedDays;
  },

  // ---------------------------------
  // ANTI-MANIPULASI: AMBIL WAKTU SERVER
  // ---------------------------------
  fetchServerTime() {
    return new Promise(function(resolve) {
      var timeout = setTimeout(function() {
        resolve(null);
      }, 5000);

      fetch('https://worldtimeapi.org/api/ip')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          clearTimeout(timeout);
          if (data && data.datetime) {
            resolve(new Date(data.datetime));
          } else {
            resolve(null);
          }
        })
        .catch(function() {
          clearTimeout(timeout);
          resolve(null);
        });
    });
  },

  getTrustedTime() {
    return this.fetchServerTime().then(function(serverTime) {
      if (serverTime) {
        localStorage.setItem(
          License.key('last_server_time'),
          serverTime.toISOString()
        );
        localStorage.setItem(
          License.key('last_server_check'),
          new Date().toISOString()
        );
        return serverTime;
      }
      return new Date();
    });
  },

  // ---------------------------------
  // CHECKSUM
  // ---------------------------------
  checksum(str) {
    var sum = 0;
    for (var i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return String((sum % 9000) + 1000);
  },

  // ---------------------------------
  // HASH (bitwise)
  // ---------------------------------
  hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  },

  // ---------------------------------
  // GENERATE KODE LISENSI
  // ---------------------------------
  generateCode(days) {
    var daysCode  = this.DAYS_CODE[days];
    if (!daysCode) return null;

    var timestamp = Date.now();
    var raw       = days + '-' + timestamp + '-' + this.SECRET_KEY;
    var hashVal   = this.hash(raw);
    var hashStr   = hashVal.toString(36).toLowerCase().substring(0, 3);
    var timeStr   = timestamp.toString(36).toLowerCase().substring(0, 4);

    var checksumInput = daysCode + hashStr + timeStr;
    var part4 = this.checksum(checksumInput);

    var part2 = daysCode + hashStr.toUpperCase();
    var part3 = timeStr.toUpperCase();

    return this.PREFIX + '-' + part2 + '-' + part3 + '-' + part4;
  },

  // ---------------------------------
  // DECODE KODE LISENSI
  // ---------------------------------
  decodeCode(code) {
    if (!code) return null;
    var parts = code.trim().toUpperCase().split('-');

    if (parts.length !== 4) return null;
    if (parts[0] !== this.PREFIX) return null;

    var daysCode = parts[1].charAt(0);
    var days     = this.DAYS_MAP[daysCode];
    if (!days) return null;

    var part2rest = parts[1].substring(1).toLowerCase();
    var part3lower = parts[2].toLowerCase();

    var checksumInput    = daysCode + part2rest + part3lower;
    var expectedChecksum = this.checksum(checksumInput);

    if (parts[3] !== expectedChecksum) return null;

    return days;
  },

  // ---------------------------------
  // SUBMIT LISENSI (AKTIVASI)
  // ---------------------------------
  submitLicense() {
    var self  = this;
    var input = document.getElementById('fLicenseCode');
    if (!input) return;

    var code = input.value.trim();
    if (!code) {
      alert('Masukkan kode lisensi');
      return;
    }

    var days = this.decodeCode(code);
    if (!days) {
      alert('Kode lisensi tidak valid');
      return;
    }

    var usedCodes = this.getUsedCodes();
    if (usedCodes.includes(code.toUpperCase())) {
      alert('Kode ini sudah pernah digunakan di device ini');
      return;
    }

    if (!navigator.onLine) {
      alert('Pastikan internet aktif untuk aktivasi');
      return;
    }

    this.getTrustedTime().then(function(trustedTime) {
      var existing  = self.getData();
      var sisaLama  = 0;

      if (existing) {
        var totalLama = existing.totalDays || 0;
        var usedDays  = self.getUsedDays();
        sisaLama = Math.max(0, totalLama - usedDays);
      }

      var newTotalDays = sisaLama + days;

      var data = {
        code       : code.toUpperCase(),
        days       : days,
        totalDays  : newTotalDays,
        activatedAt: trustedTime.toISOString()
      };

      self.saveData(data);
      self.saveUsedCode(code.toUpperCase());
      self.logTodayUsage();

      alert('Lisensi berhasil diaktifkan! (' + days + ' hari)');
      
      // Reload page agar init fresh
      window.location.reload();
    });
  },

  // ---------------------------------
  // LOCKSCREEN
  // ---------------------------------
  showLockscreen(tipe) {
    var el    = document.getElementById('licenseLockscreen');
    var title = document.getElementById('lockTitle');
    var msg   = document.getElementById('lockMsg');
    if (!el) return;

    var settings = Core ? Core.getSettings() : {};
    var namaApp  = settings.namaApp || 'Panorama Lens Trip';
    if (title) title.textContent = namaApp;

    if (tipe === 'belum') {
      if (msg) msg.innerHTML =
        '🔒 Lisensi Tidak Aktif<br><br>' +
        'Masukkan kode lisensi untuk menggunakan aplikasi ini.';
    } else if (tipe === 'habis') {
      if (msg) msg.innerHTML =
        '🔒 Lisensi Habis<br><br>' +
        'Masa aktif lisensi kamu sudah habis. ' +
        'Hubungi admin untuk mendapatkan kode lisensi baru.';
    } else if (tipe === 'revoke') {
      if (msg) msg.innerHTML =
        '🔒 Lisensi Perlu Diaktifkan Ulang<br><br>' +
        'Lisensi kamu perlu diaktifkan ulang. ' +
        'Hubungi admin untuk mendapatkan kode baru.<br>' +
        'Data aplikasi kamu tetap aman.';
    }

    el.classList.add('aktif');

    // Sembunyikan konten utama
    var konten    = document.getElementById('konten');
    var bottomNav = document.getElementById('bottomNav');
    var fab       = document.querySelector('.fab');
    if (konten)    konten.style.display    = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
    if (fab)       fab.style.display       = 'none';
  },

  hideLockscreen() {
    var el = document.getElementById('licenseLockscreen');
    if (el) el.classList.remove('aktif');

    // Tampilkan kembali konten utama
    var konten    = document.getElementById('konten');
    var bottomNav = document.getElementById('bottomNav');
    if (konten)    konten.style.display    = '';
    if (bottomNav) bottomNav.style.display = '';
  },

  // ---------------------------------
  // FORM INPUT LISENSI
  // ---------------------------------
  bukaFormInput() {
    var existing = document.getElementById('licenseModal');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.id = 'licenseModal';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(0,0,0,0.5);z-index:600;display:flex;' +
      'align-items:center;justify-content:center;padding:20px';

    div.innerHTML =
      '<div style="background:#fff;border-radius:16px;width:100%;' +
        'max-width:400px;overflow:hidden" onclick="event.stopPropagation()">' +
        '<div style="display:flex;justify-content:space-between;' +
          'align-items:center;padding:16px;border-bottom:1px solid #e0e0e0;' +
          'font-weight:700;font-size:16px">' +
          '<span>🔑 Aktivasi Lisensi</span>' +
          '<button onclick="License.tutupFormInput()" style="background:none;' +
            'border:none;font-size:20px;cursor:pointer">✕</button>' +
        '</div>' +
        '<div style="padding:16px">' +
          '<label style="display:block;font-size:13px;font-weight:600;' +
            'margin-bottom:4px">Masukkan kode lisensi:</label>' +
          '<input type="text" id="fLicenseCode" ' +
            'placeholder="CM-XXXX-XXXX-XXXX" ' +
            'style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;' +
            'border-radius:8px;font-size:14px;text-transform:uppercase">' +
          '<div style="background:#dcfce7;padding:10px 12px;' +
            'border-radius:8px;font-size:13px;margin-top:10px">' +
            '⚠️ Pastikan internet aktif saat aktivasi.</div>' +
          '<button onclick="License.submitLicense()" style="width:100%;' +
            'padding:12px;margin-top:16px;background:#16a34a;color:#fff;' +
            'border:none;border-radius:8px;font-size:15px;font-weight:700;' +
            'cursor:pointer">Aktivasi</button>' +
        '</div>' +
      '</div>';

    div.addEventListener('click', function(e) {
      if (e.target === div) License.tutupFormInput();
    });

    document.body.appendChild(div);
  },

  tutupFormInput() {
    var el = document.getElementById('licenseModal');
    if (el) el.remove();
  },

  // ---------------------------------
  // PERINGATAN SISA 7 HARI
  // ---------------------------------
  showWarning(sisa) {
    var konten = document.getElementById('konten');
    if (!konten) return;

    var warningEl = document.createElement('div');
    warningEl.className = 'lisensi-warning';
    warningEl.innerHTML =
      '⚠️ Lisensi tersisa ' + sisa + ' hari. ' +
      'Hubungi admin untuk perpanjang lisensi.';

    konten.insertBefore(warningEl, konten.firstChild);
  },

  // ---------------------------------
  // CEK REVOKE
  // ---------------------------------
  cekRevoke() {
    var savedRevoke = localStorage.getItem(this.key('revoke_key'));

    if (savedRevoke && savedRevoke !== this.REVOKE_KEY) {
      this.clearData();
      localStorage.setItem(this.key('revoke_key'), this.REVOKE_KEY);
      this.showLockscreen('revoke');
      return;
    }

    if (!savedRevoke) {
      localStorage.setItem(this.key('revoke_key'), this.REVOKE_KEY);
    }
  },

  // ---------------------------------
  // EASTER EGG: ADMIN PANEL
  // ---------------------------------
  handleLogoClick() {
    var self = this;

    this.logoClickCount++;

    if (this.logoClickTimer) clearTimeout(this.logoClickTimer);

    this.logoClickTimer = setTimeout(function() {
      self.logoClickCount = 0;
    }, 3000);

    if (this.logoClickCount >= 5) {
      this.logoClickCount = 0;
      clearTimeout(this.logoClickTimer);
      this.bukaAdminLogin();
    }
  },

  bukaAdminLogin() {
    var pass = prompt('Masukkan password admin:');
    if (pass === this.ADMIN_PASS) {
      this.openGenerateForm();
    } else if (pass !== null) {
      alert('Password salah');
    }
  },

  // ---------------------------------
  // ADMIN: GENERATE LISENSI
  // ---------------------------------
  openGenerateForm() {
    var data     = this.getData();
    var sisaHari = this.getSisaHari();
    var usedDays = this.getUsedDays();
    var total    = data ? data.totalDays : 0;
    var usedCodes = this.getUsedCodes();

    var infoHtml =
      '<div class="info-paket">' +
        '<strong>Info Lisensi Saat Ini:</strong><br>' +
        'Total Hari: ' + total + '<br>' +
        'Hari Terpakai: ' + usedDays + '<br>' +
        'Sisa Hari: ' + (sisaHari !== null ? sisaHari : '-') +
      '</div>';

    var riwayatHtml = '';
    if (usedCodes.length > 0) {
      riwayatHtml =
        '<div style="margin-top:12px">' +
          '<strong>Riwayat Kode Terpakai:</strong>';
      usedCodes.forEach(function(c) {
        riwayatHtml += '<div style="font-size:12px;color:#666">' +
          c + '</div>';
      });
      riwayatHtml += '</div>';
    }

    var html =
      infoHtml + riwayatHtml +
      '<div class="section-divider">── Generate Kode Baru ──</div>' +
      '<label>Pilih Durasi *</label>' +
      '<select id="fGenDurasi">' +
        '<option value="30">30 hari</option>' +
        '<option value="60">60 hari</option>' +
        '<option value="90">90 hari</option>' +
        '<option value="180">180 hari</option>' +
        '<option value="365">365 hari</option>' +
      '</select>' +
      '<button class="btn-simpan" onclick="License.doGenerate()" ' +
        'style="margin-top:12px">Generate</button>' +
      '<div id="hasilGenerate" style="margin-top:12px"></div>';

    var existing = document.getElementById('adminModal');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.id = 'adminModal';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(0,0,0,0.5);z-index:600;display:flex;' +
      'align-items:center;justify-content:center;padding:20px';

    div.innerHTML =
      '<div style="background:#fff;border-radius:16px;width:100%;' +
        'max-width:400px;max-height:80vh;overflow-y:auto" ' +
        'onclick="event.stopPropagation()">' +
        '<div style="display:flex;justify-content:space-between;' +
          'align-items:center;padding:16px;border-bottom:1px solid #e0e0e0;' +
          'font-weight:700;font-size:16px;position:sticky;top:0;' +
          'background:#fff;z-index:1">' +
          '<span>🔑 Admin Panel</span>' +
          '<button onclick="License.tutupAdmin()" style="background:none;' +
            'border:none;font-size:20px;cursor:pointer">✕</button>' +
        '</div>' +
        '<div style="padding:16px">' + html + '</div>' +
      '</div>';

    div.addEventListener('click', function(e) {
      if (e.target === div) License.tutupAdmin();
    });

    document.body.appendChild(div);
  },

  doGenerate() {
    var durasi = Number(document.getElementById('fGenDurasi').value);
    var kode   = this.generateCode(durasi);
    var hasil  = document.getElementById('hasilGenerate');
    if (!hasil) return;

    if (!kode) {
      hasil.innerHTML = '<div style="color:red">Gagal generate kode</div>';
      return;
    }

    var settings = Core ? Core.getSettings() : {};
    var namaApp  = settings.namaApp || 'Panorama Lens Trip';
    var tanggal  = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    var waText =
      '*KODE LISENSI ' + namaApp.toUpperCase() + '*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Kode: ' + kode + '\n' +
      'Durasi: ' + durasi + ' hari\n' +
      'Dibuat: ' + tanggal + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Cara pakai:\n' +
      '1. Buka app ' + namaApp + '\n' +
      '2. Klik "Input Lisensi"\n' +
      '3. Masukkan kode di atas\n' +
      '4. Pastikan internet aktif\n' +
      '5. Klik "Aktivasi"\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '_' + namaApp + ' Digital_';

    hasil.innerHTML =
      '<div class="info-paket">' +
        '<strong>Kode Lisensi:</strong><br>' +
        '<div style="font-size:18px;font-weight:700;margin:8px 0;' +
          'letter-spacing:2px">' + kode + '</div>' +
        'Durasi: ' + durasi + ' hari<br>' +
        'Dibuat: ' + tanggal +
      '</div>' +
      '<button class="btn-tambah" onclick="License.salinKode(\'' +
        kode + '\')">📋 Salin Kode</button>' +
      '<button class="btn-tambah" onclick="License.salinWA()" ' +
        'style="margin-top:6px">📱 Salin Format WhatsApp</button>' +
      '<textarea id="waTextArea" style="display:none">' +
        waText + '</textarea>';
  },

  salinKode(kode) {
    try {
      navigator.clipboard.writeText(kode).then(function() {
        alert('Kode berhasil disalin!');
      });
    } catch (e) {
      var ta = document.createElement('textarea');
      ta.value = kode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Kode berhasil disalin!');
    }
  },

  salinWA() {
    var ta = document.getElementById('waTextArea');
    if (!ta) return;
    try {
      navigator.clipboard.writeText(ta.value).then(function() {
        alert('Format WhatsApp berhasil disalin!');
      });
    } catch (e) {
      ta.style.display = 'block';
      ta.select();
      document.execCommand('copy');
      ta.style.display = 'none';
      alert('Format WhatsApp berhasil disalin!');
    }
  }

};

// Daftarkan ke window
window.License = License;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS License
// =════════════════════════════════
