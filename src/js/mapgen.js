// ============================================================
//  MAPGEN — Procedural map generation + area definitions
// ============================================================

const MapGen = (() => {
  const FLOOR = 0, WALL = 1, DOOR = 2;

  // Deterministic RNG seeded from string
  function makeRng(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
      h = (h ^ (h >>> 16)) >>> 0;
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h = (h ^ (h >>> 16)) >>> 0;
      return h / 4294967296;
    };
  }

  function carveRect(tiles, w, x1, y1, x2, y2) {
    for (let y = y1; y <= y2; y++)
      for (let x = x1; x <= x2; x++)
        if (x >= 0 && x < w && y >= 0 && y < Math.floor(tiles.length / w))
          tiles[y * w + x] = FLOOR;
  }

  function carveCorridor(tiles, w, h, x1, y1, x2, y2) {
    // L-shaped corridor
    const mx = x2, my = y1;
    for (let x = Math.min(x1, mx); x <= Math.max(x1, mx); x++)
      if (x >= 0 && x < w && y1 >= 0 && y1 < h) tiles[y1 * w + x] = FLOOR;
    for (let y = Math.min(my, y2); y <= Math.max(my, y2); y++)
      if (mx >= 0 && mx < w && y >= 0 && y < h) tiles[y * w + mx] = FLOOR;
  }

  // Check if all floor tiles are connected via BFS
  function isConnected(tiles, w, h) {
    let startIdx = -1;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === FLOOR) { startIdx = i; break; }
    }
    if (startIdx === -1) return false;

    const visited = new Uint8Array(tiles.length);
    const queue = [startIdx];
    visited[startIdx] = 1;
    let count = 0;

    while (queue.length > 0) {
      const idx = queue.shift();
      count++;
      const x = idx % w, y = Math.floor(idx / w);
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const ni = ny * w + nx;
          if (!visited[ni] && tiles[ni] !== WALL) {
            visited[ni] = 1;
            queue.push(ni);
          }
        }
      }
    }

    let totalFloor = 0;
    for (let i = 0; i < tiles.length; i++) if (tiles[i] !== WALL) totalFloor++;
    return count >= totalFloor * 0.9; // 90% connected is fine
  }

  // --- DEMO MAP (reproduces Phase 1 layout) ---

  function generateDemo() {
    const w = 40, h = 40;
    const tiles = new Uint8Array(w * h);
    tiles.fill(WALL);

    carveRect(tiles, w, 13, 13, 26, 26); // central hall
    const pillars = [[16, 16], [23, 16], [16, 23], [23, 23]];
    for (const [px, py] of pillars) tiles[py * w + px] = WALL;

    carveRect(tiles, w, 19, 3, 20, 12);  // N corridor
    carveRect(tiles, w, 15, 1, 24, 5);   // N chamber
    carveRect(tiles, w, 19, 27, 20, 36); // S corridor
    carveRect(tiles, w, 15, 34, 24, 38); // S chamber
    carveRect(tiles, w, 3, 19, 12, 20);  // W corridor
    carveRect(tiles, w, 1, 15, 5, 24);   // W chamber
    carveRect(tiles, w, 27, 19, 36, 20); // E corridor
    carveRect(tiles, w, 34, 15, 38, 24); // E chamber
    carveRect(tiles, w, 13, 17, 13, 22); // W alcove
    carveRect(tiles, w, 26, 17, 26, 22); // E alcove

    // Sealed gate (N chamber entrance)
    tiles[6 * w + 19] = DOOR;
    tiles[6 * w + 20] = DOOR;

    const objects = [
      { id: 'demo_altar', x: 20, y: 20, type: 'discovery', eventId: 'demo_altar_found', forTimeline: 'present',
        label: { past: 'An ancient altar, flames dancing', present: 'A cracked altar, long cold' } },
      { id: 'demo_pillar', x: 3, y: 20, type: 'discovery', eventId: 'demo_pillar_found', forTimeline: 'past',
        label: { past: 'A pillar inscribed with living runes', present: 'A shattered pillar, runes faded' } },
      { id: 'demo_chest', x: 36, y: 20, type: 'chest', eventId: 'demo_chest_unlock', forTimeline: null,
        label: { past: 'A sealed chest, warm to the touch', present: 'A rusted chest, sealed shut' }, unlockedBy: 'demo_altar_found' },
      { id: 'demo_gate', x: 19, y: 6, type: 'gate', eventId: 'demo_gate_open', forTimeline: null,
        label: { past: 'A heavy gate, sealed by old magic', present: 'A gate of black iron, frozen shut' },
        unlockedBy: 'demo_pillar_found', gateTiles: [[19, 6], [20, 6]] },
      { id: 'demo_mirror', x: 20, y: 3, type: 'combined', eventId: 'demo_mirror_half', forTimeline: null,
        label: { past: 'A mirror reflecting a face not your own', present: 'A cracked mirror, showing fragments' } },
      { id: 'demo_brazier', x: 19, y: 36, type: 'examine', eventId: null, forTimeline: null,
        label: { past: 'A roaring brazier, warmth pours from it', present: 'Cold iron, filled with old ash' } },
    ];

    return { tiles, objects, w, h, spawn: { x: 20, y: 19 }, exits: [] };
  }

  // --- PROCEDURAL GENERATION ---

  function generateProcedural(areaId, seed, areaDef) {
    const w = areaDef.w || 50, h = areaDef.h || 50;
    const rng = makeRng(seed + ':' + areaId);
    let tiles, attempts = 0;

    do {
      tiles = new Uint8Array(w * h);
      tiles.fill(WALL);

      const rooms = [];

      // Place required hand-authored rooms first
      for (const room of (areaDef.rooms || [])) {
        if (room.template) {
          placeTemplate(tiles, w, room.x, room.y, room.template);
        } else {
          carveRect(tiles, w, room.x, room.y, room.x + (room.w || 8) - 1, room.y + (room.h || 8) - 1);
        }
        rooms.push({ cx: room.x + (room.w || 8) / 2, cy: room.y + (room.h || 8) / 2 });
      }

      // Place random filler rooms
      for (let i = 0; i < 12; i++) {
        const rw = 4 + Math.floor(rng() * 6);
        const rh = 4 + Math.floor(rng() * 5);
        const rx = 2 + Math.floor(rng() * (w - rw - 4));
        const ry = 2 + Math.floor(rng() * (h - rh - 4));

        // Check no overlap with existing rooms (simple AABB)
        let overlap = false;
        for (const r of rooms) {
          if (Math.abs(rx + rw / 2 - r.cx) < rw && Math.abs(ry + rh / 2 - r.cy) < rh) {
            overlap = true; break;
          }
        }
        if (overlap) continue;

        carveRect(tiles, w, rx, ry, rx + rw - 1, ry + rh - 1);
        rooms.push({ cx: rx + rw / 2, cy: ry + rh / 2 });
      }

      // Connect rooms with corridors (minimum spanning tree approach)
      for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i];
        // Connect to nearest previous room
        let best = 0, bestDist = Infinity;
        for (let j = 0; j < i; j++) {
          const d = Math.abs(a.cx - rooms[j].cx) + Math.abs(a.cy - rooms[j].cy);
          if (d < bestDist) { bestDist = d; best = j; }
        }
        const b = rooms[best];
        carveCorridor(tiles, w, h,
          Math.round(a.cx), Math.round(a.cy),
          Math.round(b.cx), Math.round(b.cy));
      }

      attempts++;
    } while (!isConnected(tiles, w, h) && attempts < 5);

    // Place door tiles at area exits
    for (const exit of (areaDef.exits || [])) {
      if (exit.x >= 0 && exit.x < w && exit.y >= 0 && exit.y < h) {
        tiles[exit.y * w + exit.x] = FLOOR;
      }
    }

    return {
      tiles, w, h,
      objects: areaDef.objects || [],
      spawn: areaDef.spawn || { x: Math.round(w / 2), y: Math.round(h / 2) },
      exits: areaDef.exits || [],
    };
  }

  function placeTemplate(tiles, mapW, ox, oy, template) {
    const h = template.length, w = template[0].length;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const tx = ox + x, ty = oy + y;
        if (tx >= 0 && tx < mapW && ty >= 0 && ty < Math.floor(tiles.length / mapW)) {
          tiles[ty * mapW + tx] = template[y][x];
        }
      }
  }

  // --- PUBLIC ---

  function generate(areaId, seed, areaDef) {
    if (areaId === 'demo') return generateDemo();
    if (areaDef) return generateProcedural(areaId, seed, areaDef);
    return generateDemo(); // fallback
  }

  return { generate, FLOOR, WALL, DOOR };
})();
