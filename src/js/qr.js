// ============================================================
//  QR CODE — Thin wrapper around qrcode-generator library
//  The library itself is inlined by the build script
// ============================================================

const QR = (() => {
  // Encode data into a QR code. Accepts string or Uint8Array.
  // Uint8Array is base64-encoded first to avoid binary/string issues.
  function encode(data) {
    let text;
    if (typeof data === 'string') {
      text = data;
    } else {
      // Convert Uint8Array to base64url for safe QR encoding
      let binary = '';
      for (const b of data) binary += String.fromCharCode(b);
      text = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Auto-detect version (typeNumber 0), EC level M
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();

    const size = qr.getModuleCount();
    const matrix = [];
    for (let r = 0; r < size; r++) {
      matrix[r] = [];
      for (let c = 0; c < size; c++) {
        matrix[r][c] = qr.isDark(r, c) ? 1 : -1;
      }
    }

    return { matrix, size };
  }

  // Render QR matrix to a canvas element
  function render(canvas, qrData, scale = 8) {
    const { matrix, size } = qrData;
    const quiet = 4;
    const total = size + quiet * 2;
    canvas.width = total * scale;
    canvas.height = total * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (matrix[r][c] === 1)
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
  }

  return { encode, render };
})();
