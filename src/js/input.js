// ============================================================
//  INPUT — Touch-first input with smooth movement
// ============================================================

const Input = (() => {
  let canvas = null;
  let camera = { x: 0, y: 0 };
  let cameraTarget = { x: 0, y: 0 };
  let playerDisplay = { x: 0, y: 0 };
  const TILE = 24;
  const VIEW = 20;

  // Walk queue
  let walkPath = null;
  let walkInteractAtEnd = false;

  // Animation
  let animFrame = null;
  let animating = false;
  let lastFrameTime = 0;

  function init(canvasEl) {
    canvas = canvasEl;
    canvas.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    snapCamera();
  }

  function snapCamera() {
    const state = Game.getState();
    if (!state) return;
    cameraTarget.x = Math.max(0, Math.min(state.player.x - Math.floor(VIEW / 2), GameMap.W - VIEW));
    cameraTarget.y = Math.max(0, Math.min(state.player.y - Math.floor(VIEW / 2), GameMap.H - VIEW));
    camera.x = cameraTarget.x;
    camera.y = cameraTarget.y;
    playerDisplay.x = state.player.x;
    playerDisplay.y = state.player.y;
  }

  function updateCameraTarget() {
    const state = Game.getState();
    if (!state) return;
    cameraTarget.x = Math.max(0, Math.min(state.player.x - Math.floor(VIEW / 2), GameMap.W - VIEW));
    cameraTarget.y = Math.max(0, Math.min(state.player.y - Math.floor(VIEW / 2), GameMap.H - VIEW));
  }

  function getCamera() { return camera; }
  function getPlayerDisplay() { return playerDisplay; }

  // --- ANIMATION LOOP ---

  function ensureAnimating() {
    if (animating) return;
    animating = true;
    lastFrameTime = performance.now();
    console.log('[SMOOTH] Animation loop STARTED');
    animFrame = requestAnimationFrame(animLoop);
  }

  function animLoop(now) {
    const dt = Math.min(now - lastFrameTime, 50) / 1000;
    lastFrameTime = now;

    const state = Game.getState();
    if (!state) { animating = false; return; }

    // Move player display toward actual position at fixed speed (tiles per second)
    const MOVE_SPEED = 4; // tiles per second
    const pdx = state.player.x - playerDisplay.x;
    const pdy = state.player.y - playerDisplay.y;
    const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
    if (pDist > 0.01) {
      const step = Math.min(MOVE_SPEED * dt, pDist);
      playerDisplay.x += (pdx / pDist) * step;
      playerDisplay.y += (pdy / pDist) * step;
    }

    // Camera follows player display smoothly
    const camTargetX = Math.max(0, Math.min(playerDisplay.x - Math.floor(VIEW / 2), GameMap.W - VIEW));
    const camTargetY = Math.max(0, Math.min(playerDisplay.y - Math.floor(VIEW / 2), GameMap.H - VIEW));
    const cdx = camTargetX - camera.x;
    const cdy = camTargetY - camera.y;
    camera.x += cdx * 0.15;
    camera.y += cdy * 0.15;

    // Take next walk step when player display is close to current tile
    const playerSettled = pDist < 0.2;
    if (playerSettled && walkPath && walkPath.length > 0) {
      advanceWalkStep();
    }

    // Render
    Renderer.draw(state, state.timeline);

    // Check if everything has settled
    const camSettled = Math.abs(cdx) < 0.01 && Math.abs(cdy) < 0.01;
    const playerDone = pDist < 0.01;
    const walkDone = !walkPath || walkPath.length === 0;

    if (camSettled && playerDone && walkDone) {
      camera.x = cameraTarget.x;
      camera.y = cameraTarget.y;
      playerDisplay.x = state.player.x;
      playerDisplay.y = state.player.y;
      animating = false;
      console.log('[SMOOTH] Animation loop SETTLED');
      Renderer.draw(state, state.timeline);
      // Handle end-of-walk interaction
      if (walkInteractAtEnd && walkDone) {
        walkInteractAtEnd = false;
        doInteract();
        Renderer.draw(Game.getState(), Game.getState().timeline);
      }
      return;
    }

    animFrame = requestAnimationFrame(animLoop);
  }

  // --- WALK PATH ---

  function advanceWalkStep() {
    if (!walkPath || walkPath.length === 0) return;

    const next = walkPath.shift();
    const state = Game.getState();
    const dx = next.x - state.player.x;
    const dy = next.y - state.player.y;

    if (Game.movePlayer(dx, dy)) {
      updateCameraTarget();
    } else {
      // Blocked — cancel remaining path
      walkPath = null;
    }
  }

  function startWalking(path, interactAtEnd) {
    cancelWalk();
    if (!path || path.length === 0) return;
    walkPath = path;
    walkInteractAtEnd = interactAtEnd;
    console.log('[SMOOTH] Walking path of', path.length, 'steps, interactAtEnd:', interactAtEnd);

    // Take the first step immediately
    advanceWalkStep();
    ensureAnimating();
  }

  function cancelWalk() {
    walkPath = null;
    walkInteractAtEnd = false;
  }

  // --- BFS PATHFINDING ---

  function findPath(fromX, fromY, toX, toY) {
    const state = Game.getState();
    const queue = [{ x: fromX, y: fromY, path: [] }];
    const visited = new Set();
    visited.add(fromY * GameMap.W + fromX);

    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      for (const [ddx, ddy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = x + ddx, ny = y + ddy;
        const key = ny * GameMap.W + nx;
        if (visited.has(key)) continue;
        visited.add(key);
        const newPath = [...path, { x: nx, y: ny }];
        if (nx === toX && ny === toY) return newPath;
        if (GameMap.isWalkable(nx, ny, state)) {
          queue.push({ x: nx, y: ny, path: newPath });
        }
      }
      if (queue.length > 800) return null;
    }
    return null;
  }

  // --- POINTER (TOUCH/MOUSE) ---

  function onPointer(e) {
    const state = Game.getState();
    if (!state) return;
    if (typeof Dialogue !== 'undefined' && Dialogue.isActive()) return;
    if (typeof Combat !== 'undefined' && Combat.isActive()) {
      Combat.handleTap(e, canvas);
      return;
    }

    cancelWalk();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const tileX = Math.floor(((e.clientX - rect.left) * scaleX / TILE) + camera.x);
    const tileY = Math.floor(((e.clientY - rect.top) * scaleY / TILE) + camera.y);

    if (tileX < 0 || tileX >= GameMap.W || tileY < 0 || tileY >= GameMap.H) return;
    if (!Game.isExplored(tileX, tileY)) return;

    const dx = tileX - state.player.x;
    const dy = tileY - state.player.y;

    // Tap on self = interact
    if (dx === 0 && dy === 0) {
      doInteract();
      Renderer.draw(state, state.timeline);
      return;
    }

    // Tap on object = walk to adjacent + interact
    const tappedObj = GameMap.getObjectAt(tileX, tileY);
    if (tappedObj) {
      const adjTiles = [
        { x: tileX, y: tileY - 1 }, { x: tileX, y: tileY + 1 },
        { x: tileX - 1, y: tileY }, { x: tileX + 1, y: tileY },
      ].filter(t => GameMap.isWalkable(t.x, t.y, state));

      // Already adjacent?
      for (const adj of adjTiles) {
        if (adj.x === state.player.x && adj.y === state.player.y) {
          state.lastDir = { x: tileX - state.player.x, y: tileY - state.player.y };
          doInteract();
          Renderer.draw(state, state.timeline);
          return;
        }
      }

      // Find path to nearest adjacent tile
      let bestPath = null;
      for (const adj of adjTiles) {
        const path = findPath(state.player.x, state.player.y, adj.x, adj.y);
        if (path && (!bestPath || path.length < bestPath.length)) bestPath = path;
      }
      if (bestPath) {
        const lastStep = bestPath[bestPath.length - 1];
        state.lastDir = { x: tileX - lastStep.x, y: tileY - lastStep.y };
        startWalking(bestPath, true);
      }
      return;
    }

    // Tap walkable tile = walk there
    if (GameMap.isWalkable(tileX, tileY, state)) {
      const path = findPath(state.player.x, state.player.y, tileX, tileY);
      if (path) startWalking(path, false);
    }
  }

  // --- KEYBOARD (DEV) ---

  function onKey(e) {
    const state = Game.getState();
    if (!state) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (typeof Dialogue !== 'undefined' && Dialogue.isActive()) return;
    if (typeof Combat !== 'undefined' && Combat.isActive()) return;

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
    if (Game.movePlayer(dx, dy)) {
      updateCameraTarget();
      ensureAnimating();
    }
  }

  // --- INTERACT ---

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
      case 'npc':
      case 'echo_choice':
      case 'sync_ritual':
      case 'exit':
        break;
      case 'none':
        break;
    }
  }

  return { init, getCamera, getPlayerDisplay, updateCamera: updateCameraTarget, snapCamera };
})();
