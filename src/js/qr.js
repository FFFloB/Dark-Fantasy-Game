// ============================================================
//  QR CODE GENERATOR — Minimal, self-contained, byte mode
//  Supports versions 1-15, EC level M
// ============================================================

const QR = (() => {
  // GF(256) tables — primitive polynomial 0x11d
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x = ((x << 1) ^ (x & 128 ? 0x11d : 0)) & 0xff; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

  function gfMul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }

  // Reed-Solomon: generate EC codewords
  function rsEncode(data, ecLen) {
    let gen = [1];
    for (let i = 0; i < ecLen; i++) {
      const ng = new Array(gen.length + 1).fill(0);
      for (let j = 0; j < gen.length; j++) {
        ng[j] ^= gen[j];
        ng[j + 1] ^= gfMul(gen[j], EXP[i]);
      }
      gen = ng;
    }
    const rem = new Uint8Array(ecLen);
    for (let i = 0; i < data.length; i++) {
      const c = data[i] ^ rem[0];
      rem.copyWithin(0, 1); rem[ecLen - 1] = 0;
      if (c) for (let j = 0; j < ecLen; j++) rem[j] ^= gfMul(gen[j + 1], c);
    }
    return rem;
  }

  // EC table for M level: [ecPerBlock, numBlocks1, dataPerBlock1, numBlocks2, dataPerBlock2]
  const EC_M = [
    [10, 1, 16, 0, 0], // V1
    [16, 1, 28, 0, 0], // V2
    [26, 1, 44, 0, 0], // V3
    [18, 2, 32, 0, 0], // V4
    [24, 2, 43, 0, 0], // V5
    [16, 4, 27, 0, 0], // V6
    [18, 4, 31, 0, 0], // V7
    [22, 2, 38, 2, 39], // V8
    [22, 3, 36, 2, 37], // V9
    [26, 4, 43, 1, 44], // V10
    [30, 1, 50, 4, 51], // V11
    [22, 6, 36, 2, 37], // V12
    [22, 8, 37, 1, 38], // V13
    [24, 4, 40, 5, 41], // V14
    [24, 5, 41, 5, 42], // V15
  ];

  // Alignment pattern positions per version
  const ALIGN = [
    [], [6,18], [6,22], [6,26], [6,30], [6,34],
    [6,22,38], [6,24,42], [6,26,46], [6,28,50], [6,30,54],
    [6,32,58], [6,34,62], [6,26,46,66], [6,26,48,70]
  ];

  // Data capacity in bytes for byte mode, M level
  function dataCapacity(ver) {
    const ec = EC_M[ver - 1];
    const totalDataCW = ec[1] * ec[2] + ec[3] * ec[4];
    const ccBits = ver <= 9 ? 8 : 16;
    return Math.floor((totalDataCW * 8 - 4 - ccBits) / 8);
  }

  function chooseVersion(dataLen) {
    for (let v = 1; v <= 15; v++) {
      if (dataCapacity(v) >= dataLen) return v;
    }
    throw new Error('Data too large for QR (max ~412 bytes)');
  }

  function encodeData(bytes, ver) {
    const ec = EC_M[ver - 1];
    const totalDataCW = ec[1] * ec[2] + ec[3] * ec[4];
    const ccBits = ver <= 9 ? 8 : 16;

    const bits = [];
    function pushBits(val, len) { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); }

    pushBits(0b0100, 4); // Byte mode
    pushBits(bytes.length, ccBits);
    for (const b of bytes) pushBits(b, 8);

    const maxBits = totalDataCW * 8;
    for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);

    let padIdx = 0;
    while (bits.length < maxBits) { pushBits(padIdx % 2 === 0 ? 0xEC : 0x11, 8); padIdx++; }

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
    }

    // Split into blocks and add EC
    const blocks = [], ecBlocks = [];
    let offset = 0;
    for (let g = 0; g < 2; g++) {
      const count = g === 0 ? ec[1] : ec[3];
      const size = g === 0 ? ec[2] : ec[4];
      if (!count) continue;
      for (let b = 0; b < count; b++) {
        const blockData = codewords.slice(offset, offset + size);
        blocks.push(blockData);
        ecBlocks.push(Array.from(rsEncode(new Uint8Array(blockData), ec[0])));
        offset += size;
      }
    }

    // Interleave
    const result = [];
    const maxBlockLen = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < maxBlockLen; i++)
      for (const block of blocks) if (i < block.length) result.push(block[i]);
    for (let i = 0; i < ec[0]; i++)
      for (const ecBlock of ecBlocks) result.push(ecBlock[i]);

    return result;
  }

  function createMatrix(ver) {
    const size = ver * 4 + 17;
    const matrix = Array.from({ length: size }, () => new Int8Array(size));
    const reserved = Array.from({ length: size }, () => new Uint8Array(size));

    function setModule(r, c, black) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        matrix[r][c] = black ? 1 : -1;
        reserved[r][c] = 1;
      }
    }

    function finderPattern(row, col) {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = row + dr, c = col + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          setModule(r, c, inInner || (inOuter && onBorder));
        }
      }
    }

    finderPattern(0, 0);
    finderPattern(0, size - 7);
    finderPattern(size - 7, 0);

    if (ver >= 2) {
      const pos = ALIGN[ver - 1];
      for (const r of pos) {
        for (const c of pos) {
          if (r <= 8 && c <= 8) continue;
          if (r <= 8 && c >= size - 8) continue;
          if (r >= size - 8 && c <= 8) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              setModule(r + dr, c + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
            }
          }
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
      if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
    }

    // Dark module
    setModule(size - 8, 8, true);

    // Reserve format info areas
    for (let i = 0; i < 8; i++) {
      if (!reserved[8][i]) reserved[8][i] = 1;
      if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = 1;
      if (!reserved[i][8]) reserved[i][8] = 1;
      if (!reserved[size - 1 - i][8]) reserved[size - 1 - i][8] = 1;
    }
    reserved[8][8] = 1;

    if (ver >= 7) {
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 3; j++) {
          reserved[i][size - 11 + j] = 1;
          reserved[size - 11 + j][i] = 1;
        }
    }

    return { matrix, reserved, size };
  }

  function placeData(m, reserved, size, data) {
    const bits = [];
    for (const cw of data) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);

    let bitIdx = 0, upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      const rows = upward ? [...Array(size).keys()].reverse() : [...Array(size).keys()];
      for (const row of rows) {
        for (const col of [right, right - 1]) {
          if (col < 0 || col >= size || reserved[row][col]) continue;
          m[row][col] = (bitIdx < bits.length && bits[bitIdx]) ? 1 : -1;
          bitIdx++;
        }
      }
      upward = !upward;
    }
  }

  const MASKS = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
  ];

  function applyMask(matrix, reserved, size, maskIdx) {
    const m = matrix.map(row => Int8Array.from(row));
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!reserved[r][c] && MASKS[maskIdx](r, c))
          m[r][c] = m[r][c] === 1 ? -1 : 1;
    return m;
  }

  function penaltyScore(m, size) {
    let score = 0;
    for (let r = 0; r < size; r++) {
      let count = 1;
      for (let c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) count++; else { if (count >= 5) score += count - 2; count = 1; }
      }
      if (count >= 5) score += count - 2;
    }
    for (let c = 0; c < size; c++) {
      let count = 1;
      for (let r = 1; r < size; r++) {
        if (m[r][c] === m[r - 1][c]) count++; else { if (count >= 5) score += count - 2; count = 1; }
      }
      if (count >= 5) score += count - 2;
    }
    for (let r = 0; r < size - 1; r++)
      for (let c = 0; c < size - 1; c++) {
        const v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
    return score;
  }

  // Format info bits for M level (mask 0-7)
  const FORMAT_BITS = [0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4F97, 0x4AA0];

  const VERSION_BITS = [0,0,0,0,0,0, 0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928];

  function addFormatInfo(m, size, maskIdx) {
    const bits = FORMAT_BITS[maskIdx];
    const p1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    const p2 = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
    for (let i = 0; i < 15; i++) {
      const bit = (bits >> i) & 1;
      m[p1[i][0]][p1[i][1]] = bit ? 1 : -1;
      m[p2[i][0]][p2[i][1]] = bit ? 1 : -1;
    }
  }

  function addVersionInfo(m, size, ver) {
    if (ver < 7) return;
    const bits = VERSION_BITS[ver - 1];
    for (let i = 0; i < 18; i++) {
      const bit = (bits >> i) & 1;
      const r = Math.floor(i / 3), c = size - 11 + (i % 3);
      m[r][c] = bit ? 1 : -1;
      m[c][r] = bit ? 1 : -1;
    }
  }

  function encode(data) {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const ver = chooseVersion(bytes.length);
    const codewords = encodeData(bytes, ver);
    const { matrix, reserved, size } = createMatrix(ver);
    placeData(matrix, reserved, size, codewords);

    let bestMask = 0, bestScore = Infinity, bestMatrix = null;
    for (let mask = 0; mask < 8; mask++) {
      const masked = applyMask(matrix, reserved, size, mask);
      addFormatInfo(masked, size, mask);
      addVersionInfo(masked, size, ver);
      const score = penaltyScore(masked, size);
      if (score < bestScore) { bestScore = score; bestMask = mask; bestMatrix = masked; }
    }
    return { matrix: bestMatrix, size, version: ver };
  }

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

  return { encode, render, dataCapacity, chooseVersion };
})();
