// ============================================================
//  RENDERER — Dual-timeline canvas rendering
// ============================================================

const Palette = {
  past: {
    bg: '#1a1510',
    floor: '#1e1a12',
    floorAlt: 'rgba(80, 65, 30, 0.3)',
    wall: '#2a2218',
    wallStroke: '#3d3428',
    player: '#b8860b',
    playerLight: '#d4a024',
    glow: 'rgba(184, 134, 11, 0.06)',
    fog: '#1a1510',
    textColor: '#b8860b',
    textDim: '#6b5a30',
    label: 'The world that was...',
  },
  present: {
    bg: '#0a0a14',
    floor: '#0e0e18',
    floorAlt: 'rgba(30, 40, 64, 0.3)',
    wall: '#141428',
    wallStroke: '#222240',
    player: '#2a7a7a',
    playerLight: '#4ac0c0',
    glow: 'rgba(42, 122, 122, 0.06)',
    fog: '#0a0a14',
    textColor: '#2a7a7a',
    textDim: '#30506b',
    label: 'The world that remains...',
  }
};

function drawTestScene(character) {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pal = character === 'knight' ? Palette.past : Palette.present;

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);

  const TILE = 24;
  const COLS = Math.floor(W / TILE), ROWS = Math.floor(H / TILE);
  const room = generateTestRoom(COLS, ROWS);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * TILE, py = y * TILE;
      if (room[y][x] === 1) {
        ctx.fillStyle = pal.wall;
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = pal.wallStroke;
        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      } else {
        ctx.fillStyle = pal.floor;
        ctx.fillRect(px, py, TILE, TILE);
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = pal.floorAlt;
          ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        }
      }
    }
  }

  // Draw player character
  const pos = { x: 10, y: 10 };
  drawCharacter(ctx, pos.x * TILE, pos.y * TILE, TILE, pal.player, pal.playerLight);

  // Fog of war
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist > 3) {
        ctx.fillStyle = pal.fog;
        ctx.globalAlpha = Math.min(0.85, (dist - 3) * 0.15);
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Atmosphere label
  ctx.fillStyle = pal.fog;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, H - 40, W, 40);
  ctx.globalAlpha = 1;
  ctx.fillStyle = pal.textDim;
  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(pal.label, W / 2, H - 16);
}

function drawCharacter(ctx, x, y, size, dark, light) {
  const cx = x + size / 2, cy = y + size / 2, r = size * 0.35;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2);
  grad.addColorStop(0, dark + '40');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(x - size, y - size, size * 3, size * 3);
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.4, 0, Math.PI * 2); ctx.fill();
}

function generateTestRoom(cols, rows) {
  const room = [];
  for (let y = 0; y < rows; y++) {
    room[y] = [];
    for (let x = 0; x < cols; x++) {
      if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) { room[y][x] = 1; }
      else if (x >= 4 && x <= 15 && y >= 4 && y <= 15) {
        if (x === 4 || x === 15 || y === 4 || y === 15) {
          room[y][x] = ((x === 10 && (y === 4 || y === 15)) || ((x === 4 || x === 15) && y === 10)) ? 0 : 1;
        } else { room[y][x] = 0; }
        if ((x === 7 || x === 12) && (y === 7 || y === 12)) room[y][x] = 1;
      }
      else {
        if ((x === 10 && y < 4) || (x === 10 && y > 15)) room[y][x] = 0;
        else if ((y === 10 && x < 4) || (y === 10 && x > 15)) room[y][x] = 0;
        else if (x >= 2 && x <= 3 && y >= 9 && y <= 11) room[y][x] = 0;
        else if (x >= 16 && x <= 17 && y >= 9 && y <= 11) room[y][x] = 0;
        else if (y >= 2 && y <= 3 && x >= 9 && x <= 11) room[y][x] = 0;
        else if (y >= 16 && y <= 17 && x >= 9 && x <= 11) room[y][x] = 0;
        else room[y][x] = 1;
      }
    }
  }
  return room;
}
