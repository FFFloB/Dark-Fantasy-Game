// ============================================================
//  MAP — Loadable tile map with spatial queries
// ============================================================

const GameMap = (() => {
  let W = 0, H = 0;
  let tiles = null;
  let objects = [];
  let exits = [];
  const FLOOR = 0, WALL = 1, DOOR = 2;

  function load(areaData) {
    W = areaData.w;
    H = areaData.h;
    tiles = areaData.tiles;
    objects = areaData.objects || [];
    exits = areaData.exits || [];
  }

  function get(x, y) {
    if (!tiles || x < 0 || x >= W || y < 0 || y >= H) return WALL;
    return tiles[y * W + x];
  }

  function isWalkable(x, y, state) {
    const t = get(x, y);
    if (t === FLOOR) return true;
    if (t === DOOR) {
      const obj = getObjectAt(x, y);
      if (obj && obj.type === 'gate') {
        return state.appliedGlyphs && state.appliedGlyphs.includes(obj.unlockedBy);
      }
      return true;
    }
    return false;
  }

  function getObjects() { return objects; }
  function getExits() { return exits; }

  function getObjectAt(x, y) {
    return objects.find(o => o.x === x && o.y === y) || null;
  }

  function getObjectsNear(x, y) {
    return objects.filter(o => Math.abs(o.x - x) <= 1 && Math.abs(o.y - y) <= 1);
  }

  function getWidth() { return W; }
  function getHeight() { return H; }

  return {
    load, get, isWalkable, getObjects, getExits, getObjectAt, getObjectsNear,
    getWidth, getHeight,
    get W() { return W; }, get H() { return H; },
    FLOOR, WALL, DOOR,
  };
})();
