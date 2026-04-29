/*
  FILE    : js/data_sync.js
  VERSI   : 1.0.0
  FUNGSI  : Backup (export) & restore (import) data JSON, reminder backup
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS DataSync
// =════════════════════════════════

const DataSync = {

  // ---------------------------------
  // EXPORT DATA (BACKUP)
  // ---------------------------------
  exportData() {
    if (!navigator.onLine) {
      alert('Tidak ada koneksi internet. Hubungkan ke internet untuk menyimpan data.');
      return;
    }

    try {
      var data = {
        versi          : APP_VERSION || '1.0.0',
        tanggalExport  : new Date().toISOString(),
        settings       : Core.get('plt_settings'),
        booking        : Core.get('plt_booking'),
        arusKas        : Core.get('plt_arus_kas'),
        masterPaket    : Core.get('plt_master_paket'),
        masterDriver   : Core.get('plt_master_driver'),
        masterHotel    : Core.get('plt_master_hotel'),
        masterDestinasi: Core.get('plt_master_destinasi')
      };

      var json     = JSON.stringify(data, null, 2);
      var blob     = new Blob([json], { type: 'application/json' });
      var now      = new Date();
      var dd       = String(now.getDate()).padStart(2, '0');
      var mm       = String(now.getMonth() + 1).padStart(2, '0');
      var yyyy     = now.getFullYear();
      var hh       = String(now.getHours()).padStart(2, '0');
      var min      = String(now.getMinutes()).padStart(2, '0');
      var filename = 'PanoramaLensTrip_' + dd + '_' + mm + '_' +
                     yyyy + '_' + hh + '_' + min + '.json';

      var link = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      Core.saveLastBackup();
      this.sembunyikanBanner();

      alert('Data berhasil disimpan!\nFile: ' + filename);

    } catch (e) {
      alert('❌ Gagal menyimpan data. Periksa koneksi internet kamu dan coba lagi.');
    }
  },

  // ---------------------------------
  // IMPORT DATA (RESTORE)
  // ---------------------------------
  importData() {
    var input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';

    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var data = JSON.parse(ev.target.result);

          if (!data.booking && !data.settings) {
            alert('File ini bukan backup Panorama Lens Trip');
            return;
          }

          if (!confirm(
            'Data saat ini akan diganti dengan data dari backup.\n' +
            'Tanggal backup: ' + (data.tanggalExport
              ? Core.formatTanggalWaktu(data.tanggalExport)
              : 'Tidak diketahui') + '\n\n' +
            'Lanjutkan?'
          )) return;

          if (data.settings)        Core.save('plt_settings', data.settings);
          if (data.booking)         Core.save('plt_booking', data.booking);
          if (data.arusKas)         Core.save('plt_arus_kas', data.arusKas);
          if (data.masterPaket)     Core.save('plt_master_paket', data.masterPaket);
          if (data.masterDriver)    Core.save('plt_master_driver', data.masterDriver);
          if (data.masterHotel)     Core.save('plt_master_hotel', data.masterHotel);
          if (data.masterDestinasi) Core.save('plt_master_destinasi', data.masterDestinasi);

          Core.saveLastRestore();

          alert('Data berhasil dipulihkan!');
          window.location.reload();

        } catch (err) {
          alert('❌ Gagal membaca file backup. Pastikan file JSON valid.');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  },

  // ---------------------------------
  // CEK REMINDER BACKUP
  // ---------------------------------
  cekReminder() {
    if (!Core.perluBackup()) return;

    var last    = Core.getLastBackup();
    var lastStr = last ? Core.formatTanggalPendek(last) : 'Belum pernah';
    var banner  = document.getElementById('bannerBackup');
    if (!banner) return;

    var online = navigator.onLine;

    var html =
      '<div class="backup-banner">' +
        '<div>' +
          '⚠️ Data belum dicadangkan.' +
          '<br>Terakhir: ' + lastStr +
        '</div>';

    if (!online) {
      html +=
        '<div style="margin-top:6px;font-size:12px;color:#dc2626">' +
          '❌ Tidak ada koneksi internet. ' +
          'Hubungkan ke internet untuk menyimpan.' +
        '</div>' +
        '<button disabled style="opacity:0.5">💾 Simpan 🚫</button>';
    } else {
      html += '<button onclick="DataSync.exportData()">💾 Simpan</button>';
    }

    html += '</div>';
    banner.innerHTML = html;
    banner.style.display = 'block';
  },

  // ---------------------------------
  // SEMBUNYIKAN BANNER
  // ---------------------------------
  sembunyikanBanner() {
    var banner = document.getElementById('bannerBackup');
    if (banner) {
      banner.style.display = 'none';
      banner.innerHTML = '';
    }
  }

};

// Daftarkan ke window
window.DataSync = DataSync;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS DataSync
// =════════════════════════════════
