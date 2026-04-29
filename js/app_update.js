/*
  FILE    : js/app_update.js
  VERSI   : 1.0.0
  FUNGSI  : Register service worker, cek update, popup update, auto reload
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS AppUpdate
// =════════════════════════════════

const AppUpdate = {

  swRegistration: null,

  // ---------------------------------
  // INIT
  // ---------------------------------
  init() {
    if (!('serviceWorker' in navigator)) return;

    var self = this;

    navigator.serviceWorker.register('sw.js')
      .then(function(reg) {
        self.swRegistration = reg;

        // Cek update saat SW baru ditemukan
        reg.addEventListener('updatefound', function() {
          var newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' &&
                navigator.serviceWorker.controller) {
              // Ada SW baru siap, cek versi
              self.cekVersi();
            }
          });
        });
      })
      .catch(function(err) {
        console.error('SW register gagal:', err);
      });

    // Auto reload setelah SW aktif
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      window.location.reload();
    });

    // Cek versi saat online
    if (navigator.onLine) {
      this.cekVersi();
    }
  },

  // ---------------------------------
  // CEK VERSI DARI version.json
  // ---------------------------------
  cekVersi() {
    var self = this;

    fetch('version.json?t=' + Date.now())
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data || !data.version) return;

        var currentVersion = '1.0.0';
        if (window.Core) {
          currentVersion = APP_VERSION || '1.0.0';
        }

        if (data.version !== currentVersion) {
          var isMajor = data.version.split('.')[0] !==
                        currentVersion.split('.')[0];
          self.showPopup(currentVersion, data.version, isMajor);
        }
      })
      .catch(function() {
        // Gagal cek versi, abaikan
      });
  },

  // ---------------------------------
  // TAMPILKAN POPUP UPDATE
  // ---------------------------------
  showPopup(currentVer, latestVer, forced) {
    var el = document.getElementById('updatePopup');
    if (!el) return;

    var title = forced ? '🔄 Update Penting' : '🔄 Update Tersedia';
    var desc  = forced
      ? 'Update ini wajib untuk melanjutkan penggunaan aplikasi.'
      : '';

    var buttons = '';
    if (forced) {
      buttons =
        '<button class="update-btn-primary" ' +
          'onclick="AppUpdate.doUpdate()">UPDATE</button>';
    } else {
      buttons =
        '<button class="update-btn-primary" ' +
          'onclick="AppUpdate.doUpdate()">UPDATE</button>' +
        '<button class="update-btn-secondary" ' +
          'onclick="AppUpdate.tutupPopup()">Nanti</button>';
    }

    el.innerHTML =
      '<div class="update-popup">' +
        '<h3>' + title + '</h3>' +
        '<p>Versi saat ini: ' + currentVer + '<br>' +
          'Versi terbaru: ' + latestVer + '</p>' +
        (desc ? '<p>' + desc + '</p>' : '') +
        buttons +
      '</div>';
  },

  // ---------------------------------
  // TUTUP POPUP
  // ---------------------------------
  tutupPopup() {
    var el = document.getElementById('updatePopup');
    if (el) el.innerHTML = '';
  },

  // ---------------------------------
  // LAKUKAN UPDATE
  // ---------------------------------
  doUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  }

};

// Daftarkan ke window
window.AppUpdate = AppUpdate;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS AppUpdate
// =════════════════════════════════
