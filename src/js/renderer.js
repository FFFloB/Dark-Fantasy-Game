// ============================================================
//  TEST SCENE RENDERER (placeholder — will become full game renderer)
// ============================================================

function drawTestScene() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  const TILE = 24;
  const COLS = Math.floor(W / TILE), ROWS = Math.floor(H / TILE);
  const room = generateTestRoom(COLS, ROWS);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * TILE, py = y * TILE;
      if (room[y][x] === 1) {
        ctx.fillStyle = '#1a1826';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = '#2a2640';
        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      } else {
        ctx.fillStyle = '#12111a';
        ctx.fillRect(px, py, TILE, TILE);
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = 'rgba(42, 38, 64, 0.3)';
          ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        }
      }
    }
  }

  const kp = { x: 8, y: 10 }, wp = { x: 11, y: 10 };
  drawCharacter(ctx, kp.x * TILE, kp.y * TILE, TILE, '#b8860b', '#d4a024');
  drawCharacter(ctx, wp.x * TILE, wp.y * TILE, TILE, '#2a7a7a', '#4ac0c0');

  // Fog of war
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const d1 = Math.hypot(x - kp.x, y - kp.y);
      const d2 = Math.hypot(x - wp.x, y - wp.y);
      const dist = Math.min(d1, d2);
      if (dist > 3) {
        ctx.fillStyle = `rgba(10,10,15,${Math.min(0.85, (dist - 3) * 0.15)})`;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  ctx.fillStyle = 'rgba(10,10,15,0.7)';
  ctx.fillRect(0, H / 2 - 40, W, 80);
  ctx.fillStyle = '#b8860b';
  ctx.font = '20px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('\u2014 CONNECTION ESTABLISHED \u2014', W / 2, H / 2 - 8);
  ctx.fillStyle = '#6b6480';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('The Athenaeum awaits...', W / 2, H / 2 + 18);
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
