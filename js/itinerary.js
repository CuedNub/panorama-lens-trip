/*
  FILE    : js/itinerary.js
  VERSI   : 1.0.0
  FUNGSI  : Export itinerary sebagai gambar (canvas) untuk tamu & driver
*/

// =════════════════════════════════
// AWAL CUSTOM FUNCTIONS Itinerary
// =════════════════════════════════

const Itinerary = {

  // ---------------------------------
  // AMBIL DATA ITINERARY
  // ---------------------------------
  getData(bookingId) {
    const b = Core.getBookingById(bookingId);
    if (!b) return null;

    const settings  = Core.getSettings();
    const destList  = b.destinasi || [];
    const tglMulai  = new Date(b.tglBerangkat);

    const hariList = destList.map(function(destNama, idx) {
      const tglHari = new Date(tglMulai);
      tglHari.setDate(tglHari.getDate() + idx);

      const destinasi = Core.getMasterDestinasi().find(
        function(d) { return d.nama === destNama; }
      );
      const aktivitas = destinasi ? (destinasi.aktivitas || []) : [];
      aktivitas.sort(function(a, c) {
        return (a.waktu || '').localeCompare(c.waktu || '');
      });

      return {
        hari     : idx + 1,
        tanggal  : Core.formatTanggalPendek(tglHari.toISOString()),
        destinasi: destNama,
        aktivitas: aktivitas
      };
    });

    return {
      booking  : b,
      settings : settings,
      hariList : hariList
    };
  },

  // ---------------------------------
  // EXPORT ITINERARY TAMU
  // ---------------------------------
  exportTamu(bookingId) {
    const data = this.getData(bookingId);
    if (!data) { alert('Data booking tidak ditemukan'); return; }

    const b = data.booking;
    const s = data.settings;

    const lines = [];
    lines.push({ type: 'title', text: s.namaApp || 'Panorama Lens Trip' });
    lines.push({ type: 'subtitle', text: 'ITINERARY' });
    lines.push({ type: 'spacer' });
    lines.push({ type: 'info', text: 'Nama  : ' + b.namaTamu });
    lines.push({ type: 'info', text: 'Paket : ' + (b.snapshotPaket ? b.snapshotPaket.nama : '-') });
    lines.push({ type: 'info', text: 'Pax   : ' + b.jumlahPax + ' orang' });
    lines.push({ type: 'info', text: 'Tanggal: ' + Core.formatTanggalPendek(b.tglBerangkat) +
      ' - ' + Core.formatTanggalPendek(b.tglPulang) });
    lines.push({ type: 'divider' });

    data.hariList.forEach(function(h) {
      lines.push({ type: 'hari', text: 'Hari ' + h.hari + ' — ' + h.tanggal });
      lines.push({ type: 'dest', text: h.destinasi });

      if (h.aktivitas.length > 0) {
        h.aktivitas.forEach(function(a) {
          lines.push({ type: 'akt', text: a.waktu + '  ' + a.nama });
        });
      } else {
        lines.push({ type: 'akt', text: 'Belum ada aktivitas' });
      }
      lines.push({ type: 'spacer' });
    });

    lines.push({ type: 'divider' });
    if (s.noWA)    lines.push({ type: 'footer', text: '📱 ' + s.noWA });
    if (s.email)   lines.push({ type: 'footer', text: '📧 ' + s.email });
    if (s.website) lines.push({ type: 'footer', text: '🌐 ' + s.website });
    lines.push({ type: 'footer', text: '🌿 ' + (s.namaApp || 'Panorama Lens Trip') });

    this.renderCanvas(lines, 'itinerary_tamu_' + b.id);
  },

  // ---------------------------------
  // EXPORT ITINERARY DRIVER
  // ---------------------------------
  exportDriver(bookingId) {
    const data = this.getData(bookingId);
    if (!data) { alert('Data booking tidak ditemukan'); return; }

    const b = data.booking;
    const s = data.settings;

    const lines = [];
    lines.push({ type: 'title', text: s.namaApp || 'Panorama Lens Trip' });
    lines.push({ type: 'subtitle', text: 'ITINERARY DRIVER' });
    lines.push({ type: 'spacer' });
    lines.push({ type: 'info', text: 'Nama Tamu : ' + b.namaTamu });
    lines.push({ type: 'info', text: 'Pax       : ' + b.jumlahPax + ' orang' });
    lines.push({ type: 'info', text: 'Paket     : ' + (b.snapshotPaket ? b.snapshotPaket.nama : '-') });
    lines.push({ type: 'info', text: 'Tanggal   : ' + Core.formatTanggalPendek(b.tglBerangkat) +
      ' - ' + Core.formatTanggalPendek(b.tglPulang) });

    if (b.infoPenerbangan || b.waktuTiba || b.bandara) {
      lines.push({ type: 'divider' });
      lines.push({ type: 'section', text: '── Info Penerbangan ──' });
      if (b.infoPenerbangan)
        lines.push({ type: 'info', text: '✈️ ' + b.infoPenerbangan });
      if (b.waktuTiba)
        lines.push({ type: 'info', text: 'Tiba: ' + Core.formatTanggalWaktu(b.waktuTiba) });
      if (b.bandara)
        lines.push({ type: 'info', text: b.bandara });
    }

    if (b.tempatJemput || b.waktuJemput) {
      lines.push({ type: 'divider' });
      lines.push({ type: 'section', text: '── Info Jemput ──' });
      if (b.tempatJemput)
        lines.push({ type: 'info', text: '📍 ' + b.tempatJemput });
      if (b.waktuJemput)
        lines.push({ type: 'info', text: '🕐 ' + Core.formatTanggalWaktu(b.waktuJemput) });
    }

    lines.push({ type: 'divider' });

    data.hariList.forEach(function(h) {
      lines.push({ type: 'hari', text: 'Hari ' + h.hari + ' — ' + h.tanggal });
      lines.push({ type: 'dest', text: h.destinasi });

      if (h.aktivitas.length > 0) {
        h.aktivitas.forEach(function(a) {
          lines.push({ type: 'akt', text: a.waktu + '  ' + a.nama });
        });
      } else {
        lines.push({ type: 'akt', text: 'Belum ada aktivitas' });
      }
      lines.push({ type: 'spacer' });
    });

    lines.push({ type: 'divider' });
    lines.push({ type: 'footer', text: '🌿 ' + (s.namaApp || 'Panorama Lens Trip') });

    this.renderCanvas(lines, 'itinerary_driver_' + b.id);
  },

  // ---------------------------------
  // RENDER CANVAS & DOWNLOAD
  // ---------------------------------
  renderCanvas(lines, filename) {
    var canvasWidth = 600;
    var padding     = 30;
    var lineHeight  = 28;
    var y           = padding;

    // Hitung tinggi
    var totalHeight = padding * 2;
    lines.forEach(function(line) {
      if (line.type === 'spacer')  totalHeight += 15;
      else if (line.type === 'divider') totalHeight += 20;
      else totalHeight += lineHeight;
    });

    var canvas = document.createElement('canvas');
    canvas.width  = canvasWidth;
    canvas.height = totalHeight;
    var ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, totalHeight);

    var warnaTema = Core.getSettings().warnaTema || '#16a34a';

    lines.forEach(function(line) {
      if (line.type === 'spacer') {
        y += 15;
        return;
      }

      if (line.type === 'divider') {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y + 10);
        ctx.lineTo(canvasWidth - padding, y + 10);
        ctx.stroke();
        y += 20;
        return;
      }

      var fontSize = 14;
      var fontWeight = 'normal';
      var color = '#333333';
      var align = 'left';

      if (line.type === 'title') {
        fontSize   = 22;
        fontWeight = 'bold';
        color      = warnaTema;
        align      = 'center';
      } else if (line.type === 'subtitle') {
        fontSize   = 16;
        fontWeight = 'bold';
        color      = '#555555';
        align      = 'center';
      } else if (line.type === 'hari') {
        fontSize   = 15;
        fontWeight = 'bold';
        color      = warnaTema;
      } else if (line.type === 'dest') {
        fontSize   = 14;
        fontWeight = 'bold';
        color      = '#444444';
      } else if (line.type === 'section') {
        fontSize   = 13;
        fontWeight = 'bold';
        color      = '#666666';
        align      = 'center';
      } else if (line.type === 'footer') {
        fontSize = 12;
        color    = '#888888';
        align    = 'center';
      } else if (line.type === 'akt') {
        fontSize = 13;
        color    = '#555555';
      }

      ctx.font      = fontWeight + ' ' + fontSize + 'px Arial, sans-serif';
      ctx.fillStyle = color;

      var x = padding;
      if (align === 'center') x = canvasWidth / 2;

      ctx.textAlign = align;
      ctx.fillText(line.text, x, y + lineHeight * 0.7);
      y += lineHeight;
    });

    // Download
    try {
      var link = document.createElement('a');
      link.download = filename + '.png';
      link.href     = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Gagal download gambar. Coba lagi.');
    }
  }

};

// Daftarkan ke window
window.Itinerary = Itinerary;

// =════════════════════════════════
// AKHIR CUSTOM FUNCTIONS Itinerary
// =════════════════════════════════
