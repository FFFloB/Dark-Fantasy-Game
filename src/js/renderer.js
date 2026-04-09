// ============================================================
//  RENDERER — Camera-based tile map with dual-timeline visuals
// ============================================================

const Palette = {
  past: {
    bg: '#1a1510', floor: '#1e1a12', floorAlt: '#242014',
    wall: '#2a2218', wallStroke: '#3d3428', wallDetail: '#4a3c2e',
    player: '#b8860b', playerLight: '#d4a024',
    fog: '#1a1510', fogExplored: 'rgba(26,21,16,0.5)',
    objDiscovery: '#d4a024', objGate: '#8a6a2a', objChest: '#c49030', objExamine: '#6b5a30',
    textColor: '#b8860b', textDim: '#6b5a30', textBg: 'rgba(26,21,16,0.85)',
    label: 'The world that was...',
    detailColor: '#3d3428',
  },
  present: {
    bg: '#0a0a14', floor: '#0e0e18', floorAlt: '#111120',
    wall: '#141428', wallStroke: '#222240', wallDetail: '#2a2850',
    player: '#2a7a7a', playerLight: '#4ac0c0',
    fog: '#0a0a14', fogExplored: 'rgba(10,10,20,0.5)',
    objDiscovery: '#4ac0c0', objGate: '#2a5a6a', objChest: '#3a8a8a', objExamine: '#30506b',
    textColor: '#2a7a7a', textDim: '#30506b', textBg: 'rgba(10,10,20,0.85)',
    label: 'The world that remains...',
    detailColor: '#222240',
  }
};

const Renderer = (() => {
  const TILE = 24;
  const VIEW = 20;

  // Simple hash for procedural tile details
  function tileHash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) >>> 0;
  }

  function draw(state, timeline) {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pal = timeline === 'past' ? Palette.past : Palette.present;

    // Combat mode: full-screen combat renderer
    if (typeof Combat !== 'undefined' && Combat.isActive()) {
      Combat.draw(ctx, W, H, pal, state);
      return;
    }

    const cam = Input.getCamera();

    // Fractional camera offset for smooth scrolling
    const camIX = Math.floor(cam.x);
    const camIY = Math.floor(cam.y);
    const offX = (cam.x - camIX) * TILE;
    const offY = (cam.y - camIY) * TILE;

    // Clear
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);

    const px = state.player.x, py = state.player.y;

    // Draw tiles (+1 extra row/col to cover fractional edges)
    for (let vy = -1; vy <= VIEW; vy++) {
      for (let vx = -1; vx <= VIEW; vx++) {
        const tx = camIX + vx, ty = camIY + vy;
        const sx = vx * TILE - offX, sy = vy * TILE - offY;
        if (sx + TILE < 0 || sx > W || sy + TILE < 0 || sy > H) continue;
        const tile = Map.get(tx, ty);

        if (!Game.isExplored(tx, ty)) {
          ctx.fillStyle = pal.fog;
          ctx.fillRect(sx, sy, TILE, TILE);
          continue;
        }

        // Floor
        if (tile === Map.FLOOR || tile === Map.DOOR) {
          ctx.fillStyle = (tileHash(tx, ty) % 5 === 0) ? pal.floorAlt : pal.floor;
          ctx.fillRect(sx, sy, TILE, TILE);

          // Floor details
          if (timeline === 'past') {
            // Subtle warm floor pattern
            if (tileHash(tx, ty) % 7 === 0) {
              ctx.fillStyle = pal.detailColor;
              ctx.globalAlpha = 0.3;
              ctx.fillRect(sx + 4, sy + 10, TILE - 8, 1);
              ctx.globalAlpha = 1;
            }
          } else {
            // Debris/cracks on floor
            if (tileHash(tx, ty) % 4 === 0) {
              ctx.fillStyle = pal.detailColor;
              ctx.globalAlpha = 0.4;
              const cx = sx + (tileHash(tx, ty + 1) % 16) + 2;
              const cy = sy + (tileHash(tx + 1, ty) % 16) + 2;
              ctx.fillRect(cx, cy, 2, 2);
              ctx.globalAlpha = 1;
            }
          }
        }

        // Wall
        if (tile === Map.WALL) {
          ctx.fillStyle = pal.wall;
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.strokeStyle = pal.wallStroke;
          ctx.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1);

          // Wall details
          if (timeline === 'past') {
            // Intact stonework lines
            ctx.fillStyle = pal.wallDetail;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(sx, sy + 8, TILE, 1);
            ctx.fillRect(sx + ((tileHash(tx, ty) % 2) ? 8 : 16), sy, 1, 8);
            ctx.globalAlpha = 1;
          } else {
            // Cracks
            if (tileHash(tx, ty) % 3 === 0) {
              ctx.strokeStyle = pal.wallDetail;
              ctx.globalAlpha = 0.5;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(sx + 4, sy + 4);
              ctx.lineTo(sx + 12 + (tileHash(tx, ty) % 8), sy + 18);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }

        // Door tile
        if (tile === Map.DOOR) {
          const obj = Map.getObjectAt(tx, ty);
          const isOpen = obj && obj.unlockedBy && state.appliedGlyphs.includes(obj.unlockedBy);
          if (!isOpen) {
            ctx.fillStyle = pal.objGate;
            ctx.fillRect(sx + 2, sy + TILE / 2 - 2, TILE - 4, 4);
            ctx.fillStyle = pal.wallStroke;
            ctx.fillRect(sx + 4, sy + TILE / 2 - 1, TILE - 8, 2);
          }
        }
      }
    }

    // Draw objects
    for (const obj of Map.getObjects()) {
      const screenX = (obj.x - cam.x) * TILE;
      const screenY = (obj.y - cam.y) * TILE;
      if (screenX + TILE < 0 || screenX > W || screenY + TILE < 0 || screenY > H) continue;
      if (!Game.isExplored(obj.x, obj.y)) continue;
      if (obj.type === 'gate') continue;

      const sx = screenX + TILE / 2, sy = screenY + TILE / 2;
      const used = state.interactedObjects.includes(obj.id);

      ctx.globalAlpha = used ? 0.4 : 1;

      switch (obj.type) {
        case 'discovery':
          // Diamond
          ctx.fillStyle = pal.objDiscovery;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 6); ctx.lineTo(sx + 5, sy);
          ctx.lineTo(sx, sy + 6); ctx.lineTo(sx - 5, sy);
          ctx.closePath(); ctx.fill();
          break;

        case 'chest':
          // Rectangle
          ctx.fillStyle = pal.objChest;
          ctx.fillRect(sx - 5, sy - 3, 10, 7);
          ctx.fillStyle = pal.textColor;
          ctx.fillRect(sx - 4, sy - 3, 8, 2);
          break;

        case 'combined':
          // Two half diamonds
          ctx.fillStyle = pal.objDiscovery;
          ctx.beginPath();
          ctx.moveTo(sx - 2, sy - 5); ctx.lineTo(sx + 3, sy);
          ctx.lineTo(sx - 2, sy + 5); ctx.closePath(); ctx.fill();
          ctx.globalAlpha *= 0.5;
          ctx.beginPath();
          ctx.moveTo(sx + 2, sy - 5); ctx.lineTo(sx - 3, sy);
          ctx.lineTo(sx + 2, sy + 5); ctx.closePath(); ctx.fill();
          break;

        case 'npc':
          // Small colored figure
          ctx.fillStyle = pal.textColor;
          ctx.beginPath(); ctx.arc(sx, sy - 2, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(sx - 2, sy + 2, 4, 5);
          break;

        case 'echo_choice':
          // Dual diamond (choice marker)
          ctx.fillStyle = pal.objDiscovery;
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy); ctx.lineTo(sx, sy - 6); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx, sy + 6);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = pal.textBg;
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
          break;

        case 'sync_ritual':
          // Pulsing circle
          ctx.strokeStyle = pal.objDiscovery;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 400);
          ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1; ctx.lineWidth = 1;
          break;

        case 'enemy':
          // Menacing figure with pulsing glow
          ctx.fillStyle = timeline === 'past' ? '#8a2a2a' : '#6a2a6a';
          ctx.globalAlpha = 0.4 + 0.2 * Math.sin(Date.now() / 300);
          ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = used ? 0.3 : 1;
          ctx.beginPath(); ctx.arc(sx, sy - 2, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(sx - 3, sy + 2, 6, 6);
          ctx.fillStyle = timeline === 'past' ? '#cc6644' : '#aa44cc';
          ctx.fillRect(sx - 3, sy - 3, 2, 2);
          ctx.fillRect(sx + 1, sy - 3, 2, 2);
          break;

        case 'exit':
          // Subtle directional arrow
          ctx.fillStyle = pal.textColor;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 6); ctx.lineTo(sx + 5, sy + 2); ctx.lineTo(sx - 5, sy + 2);
          ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;

        case 'confession':
          // Glowing speech marks
          ctx.fillStyle = pal.objDiscovery;
          ctx.font = '14px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('"', sx, sy);
          ctx.textAlign = 'start';
          break;

        case 'trial':
          // Warning pulse
          ctx.fillStyle = timeline === 'past' ? '#aa6622' : '#6622aa';
          ctx.globalAlpha = 0.4 + 0.3 * Math.sin(Date.now() / 500);
          ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          break;

        case 'throne_choice':
          // Grand pulsing throne marker
          ctx.fillStyle = pal.textColor;
          ctx.globalAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 600);
          ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = pal.playerLight;
          ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          break;

        case 'examine':
        default:
          // Sparkle dots
          ctx.fillStyle = pal.objExamine;
          const t = (Date.now() / 500) | 0;
          ctx.fillRect(sx - 2 + (t % 2), sy - 2, 2, 2);
          ctx.fillRect(sx + 1 - (t % 2), sy + 1, 2, 2);
          break;
      }
      ctx.globalAlpha = 1;
    }

    // Draw player (using smooth display position)
    const pd = Input.getPlayerDisplay();
    drawCharacter(ctx, (pd.x - cam.x) * TILE, (pd.y - cam.y) * TILE, TILE, pal.player, pal.playerLight);
    ctx.globalAlpha = 1;

    // Fog of war overlay (explored but not visible = dimmed)
    for (let vy = -1; vy <= VIEW; vy++) {
      for (let vx = -1; vx <= VIEW; vx++) {
        const tx = camIX + vx, ty = camIY + vy;
        if (!Game.isExplored(tx, ty)) continue;

        if (!Game.isVisible(tx, ty)) {
          ctx.fillStyle = pal.fogExplored;
          ctx.fillRect(vx * TILE - offX, vy * TILE - offY, TILE, TILE);
        }
      }
    }

    // Interaction prompt
    const adjObj = Game.getAdjacentObject();
    if (adjObj) {
      const osx = (adjObj.x - cam.x) * TILE;
      const osy = (adjObj.y - cam.y) * TILE;
      if (osx + TILE > 0 && osx < W && osy + TILE > 0 && osy < H) {
        const promptLabels = { examine: 'Examine', gate: 'Inspect', npc: 'Talk', chest: 'Open', discovery: 'Investigate', echo_choice: 'Decide', combined: 'Touch', sync_ritual: 'Begin Ritual', exit: 'Leave', enemy: 'Fight', confession: 'Confess', trial: 'Approach', throne_choice: 'Choose' };
        const promptText = promptLabels[adjObj.type] || 'Interact';
        ctx.font = '10px "Courier New", monospace';
        const tw = ctx.measureText(promptText).width + 12;
        const ptx = osx + TILE / 2 - tw / 2;
        const pty = osy - 8;
        ctx.fillStyle = pal.textBg;
        ctx.fillRect(ptx, pty - 10, tw, 16);
        ctx.fillStyle = pal.textColor;
        ctx.textAlign = 'center';
        ctx.fillText(promptText, osx + TILE / 2, pty);
        ctx.textAlign = 'start';
      }
    }

    // --- PARTICLE EFFECTS ---
    const time = Date.now();
    for (let vy = -1; vy <= VIEW; vy++) {
      for (let vx = -1; vx <= VIEW; vx++) {
        const tx = camIX + vx, ty = camIY + vy;
        if (!Game.isExplored(tx, ty) || !Game.isVisible(tx, ty)) continue;
        const sx = vx * TILE - offX, sy = vy * TILE - offY;
        const h = tileHash(tx, ty);
        if (Map.get(tx, ty) !== Map.FLOOR) continue;

        if (timeline === 'past' && h % 19 === 0) {
          // Torchlight flicker — warm glow on specific floor tiles
          const flicker = 0.03 + 0.02 * Math.sin(time / 400 + h);
          ctx.fillStyle = 'rgba(184,134,11,' + flicker + ')';
          ctx.beginPath();
          ctx.arc(sx + TILE / 2, sy + TILE / 2, TILE * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        if (timeline === 'present' && h % 23 === 0) {
          // Fog wisp — cold drifting shapes
          const drift = Math.sin(time / 1200 + h) * 6;
          ctx.fillStyle = 'rgba(42,42,80,0.06)';
          ctx.beginPath();
          ctx.arc(sx + TILE / 2 + drift, sy + TILE / 2, TILE * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- HUD ---

    // HP/MP bars at top
    if (state.stats) {
      const barW = 100, barH = 4, barY = 6, barGap = 3;
      // HP bar
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(6, barY, barW + 2, barH + 2);
      ctx.fillStyle = '#8a2a2a';
      ctx.fillRect(7, barY + 1, barW * (state.stats.hp / state.stats.maxHp), barH);
      ctx.fillStyle = '#cc4444';
      ctx.fillRect(7, barY + 1, barW * (state.stats.hp / state.stats.maxHp), 1);
      // MP bar
      const mpY = barY + barH + barGap;
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(6, mpY, barW + 2, barH + 2);
      ctx.fillStyle = '#2a3a8a';
      ctx.fillRect(7, mpY + 1, barW * (state.stats.mp / state.stats.maxMp), barH);
      ctx.fillStyle = '#4466cc';
      ctx.fillRect(7, mpY + 1, barW * (state.stats.mp / state.stats.maxMp), 1);
      // Level label
      ctx.fillStyle = pal.textDim;
      ctx.font = '9px "Courier New", monospace';
      ctx.fillText('Lv' + state.stats.level, barW + 12, barY + barH);
    }

    // Bond bar (right side)
    if (state.bond) {
      const bx = W - 108, by = 6, bw = 100, bh = 4;
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(bx, by, bw + 2, bh + 2);
      ctx.fillStyle = pal.player;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(bx + 1, by + 1, bw * (state.bond.level / 100), bh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.textDim;
      ctx.font = '9px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Bond.getLabel(state.bond), bx - 2, by + bh);
      ctx.textAlign = 'start';
    }

    // Atmosphere label
    ctx.fillStyle = pal.textBg;
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = pal.textDim;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pal.label, W / 2, H - 10);
    ctx.textAlign = 'start';
  }

  function drawCharacter(ctx, x, y, size, dark, light) {
    const cx = x + size / 2, cy = y + size / 2, r = size * 0.35;
    // Glow
    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 3);
    grad.addColorStop(0, dark + '30');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(x - size, y - size, size * 3, size * 3);
    // Body
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.35, 0, Math.PI * 2); ctx.fill();
  }

  return { draw };
})();
