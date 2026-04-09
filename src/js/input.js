// ============================================================
//  INPUT — Touch-first input with BFS pathfinding
// ============================================================

const Input = (() => {
  let canvas = null;
  let camera = { x: 0, y: 0 };
  const TILE = 24;
  const VIEW = 20;
  let walkPath = null;  // queued path tiles [{x,y}, ...]
  let walkTimer = null;

  function init(canvasEl) {
    canvas = canvasEl;
    canvas.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey); // dev convenience, hidden from UI
    updateCamera();
  }

  function updateCamera() {
    const state = Game.getState();
    if (!state) return;
    camera.x = Math.max(0, Math.min(state.player.x - Math.floor(VIEW / 2), Map.W - VIEW));
    camera.y = Math.max(0, Math.min(state.player.y - Math.floor(VIEW / 2), Map.H - VIEW));
  }

  function getCamera() { return camera; }

  // --- BFS pathfinding ---
  function findPath(fromX, fromY, toX, toY) {
    const state = Game.getState();
    // Allow walking TO an object tile even if it's not normally walkable (for interaction)
    const targetObj = Map.getObjectAt(toX, toY);
    const queue = [{ x: fromX, y: fromY, path: [] }];
    const visited = new Set();
    visited.add(fromY * Map.W + fromX);

    while (queue.length > 0) {
      const { x, y, path } = queue.shift();

      for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nx = x + dx, ny = y + dy;
        const key = ny * Map.W + nx;
        if (visited.has(key)) continue;
        visited.add(key);

        const newPath = [...path, { x: nx, y: ny }];

        if (nx === toX && ny === toY) return newPath;

        if (Map.isWalkable(nx, ny, state)) {
          queue.push({ x: nx, y: ny, path: newPath });
        }
      }

      // Limit search depth
      if (queue.length > 800) return null;
    }
    return null;
  }

  // --- Walk along path with animation ---
  function startWalking(path, interactAtEnd) {
    cancelWalk();
    walkPath = path;
    walkStep(interactAtEnd);
  }

  function walkStep(interactAtEnd) {
    if (!walkPath || walkPath.length === 0) {
      walkPath = null;
      if (interactAtEnd) doInteract();
      return;
    }

    const next = walkPath.shift();
    const state = Game.getState();
    const dx = next.x - state.player.x;
    const dy = next.y - state.player.y;

    if (Game.movePlayer(dx, dy)) {
      updateCamera();
      render();
      // Next step after a short delay (animated walk feel)
      walkTimer = setTimeout(() => walkStep(interactAtEnd), 120);
    } else {
      // Path blocked (door closed, etc.) — stop
      walkPath = null;
    }
  }

  function cancelWalk() {
    walkPath = null;
    if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; }
  }

  // --- Pointer (touch/mouse) ---
  function onPointer(e) {
    const state = Game.getState();
    if (!state) return;
    if (typeof Dialogue !== 'undefined' && Dialogue.isActive()) return;

    cancelWalk();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const tileX = Math.floor((e.clientX - rect.left) * scaleX / TILE) + camera.x;
    const tileY = Math.floor((e.clientY - rect.top) * scaleY / TILE) + camera.y;

    // Out of bounds
    if (tileX < 0 || tileX >= Map.W || tileY < 0 || tileY >= Map.H) return;

    // Not explored — can't tap there
    if (!Game.isExplored(tileX, tileY)) return;

    const dx = tileX - state.player.x;
    const dy = tileY - state.player.y;

    // Tap on self = interact with object here
    if (dx === 0 && dy === 0) {
      doInteract();
      return;
    }

    // Check if tapped tile has an object
    const tappedObj = Map.getObjectAt(tileX, tileY);

    if (tappedObj) {
      // Walk to an adjacent tile and interact
      const adjTiles = [
        { x: tileX, y: tileY - 1 }, { x: tileX, y: tileY + 1 },
        { x: tileX - 1, y: tileY }, { x: tileX + 1, y: tileY },
      ].filter(t => Map.isWalkable(t.x, t.y, state));

      // Find shortest path to any adjacent tile
      let bestPath = null;
      for (const adj of adjTiles) {
        // Already adjacent?
        if (adj.x === state.player.x && adj.y === state.player.y) {
          // Set facing direction toward object
          Game.getState().lastDir = { x: tileX - state.player.x, y: tileY - state.player.y };
          doInteract();
          render();
          return;
        }
        const path = findPath(state.player.x, state.player.y, adj.x, adj.y);
        if (path && (!bestPath || path.length < bestPath.length)) bestPath = path;
      }
      if (bestPath) {
        // Face the object at the end
        const lastStep = bestPath[bestPath.length - 1];
        startWalking(bestPath, true);
        // Set facing toward object after walk
        Game.getState().lastDir = { x: tileX - lastStep.x, y: tileY - lastStep.y };
      }
      return;
    }

    // Tap walkable tile — pathfind there
    if (Map.isWalkable(tileX, tileY, state)) {
      const path = findPath(state.player.x, state.player.y, tileX, tileY);
      if (path) startWalking(path, false);
    }
  }

  // --- Keyboard (dev convenience) ---
  function onKey(e) {
    const state = Game.getState();
    if (!state) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (typeof Dialogue !== 'undefined' && Dialogue.isActive()) return;

    cancelWalk();

    let dx = 0, dy = 0;
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': dy = -1; break;
      case 'ArrowDown':  case 's': case 'S': dy = 1;  break;
      case 'ArrowLeft':  case 'a': case 'A': dx = -1; break;
      case 'ArrowRight': case 'd': case 'D': dx = 1;  break;
      case 'e': case 'E':
        doInteract(); e.preventDefault(); return;
      default: return;
    }

    e.preventDefault();
    if (Game.movePlayer(dx, dy)) { updateCamera(); render(); }
  }

  // --- Interact ---
  function doInteract() {
    const result = Game.interact();
    if (!result) return;

    switch (result.type) {
      case 'glyph':
        showGeneratedGlyph(result.glyph, result.message);
        break;
      case 'half-glyph':
        showGeneratedGlyph(result.glyph, result.message + ' (your half — ask your partner for theirs)');
        break;
      case 'opened':
      case 'locked':
      case 'examine':
      case 'already':
        document.getElementById('glyph-panel').classList.remove('hidden');
        addGlyphLogEntry(result.message, 'system');
        break;
      case 'none':
        break;
    }
    render();
  }

  function render() {
    const state = Game.getState();
    if (state) Renderer.draw(state, state.timeline);
  }

  return { init, getCamera, updateCamera };
})();
