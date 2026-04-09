// ============================================================
//  STATS — Character stats, inventory, leveling
// ============================================================

const Stats = (() => {
  const CLASS_BASE = {
    knight: { hp: 35, mp: 8, hpPerLevel: 8, mpPerLevel: 2 },
    whisper: { hp: 20, mp: 20, hpPerLevel: 4, mpPerLevel: 5 },
  };

  function init(character) {
    const base = CLASS_BASE[character] || CLASS_BASE.knight;
    return {
      hp: base.hp, maxHp: base.hp,
      mp: base.mp, maxMp: base.mp,
      level: 1, xp: 0, xpNext: 20,
      items: [],
    };
  }

  function takeDamage(stats, amount) {
    stats.hp = Math.max(0, stats.hp - amount);
    return stats.hp <= 0;
  }

  function heal(stats, amount) {
    stats.hp = Math.min(stats.maxHp, stats.hp + amount);
  }

  function useMp(stats, amount) {
    if (stats.mp < amount) return false;
    stats.mp -= amount;
    return true;
  }

  function restoreMp(stats, amount) {
    stats.mp = Math.min(stats.maxMp, stats.mp + amount);
  }

  function addItem(stats, item) {
    if (stats.items.length >= 8) return false;
    stats.items.push({ ...item });
    return true;
  }

  function removeItem(stats, itemId) {
    const idx = stats.items.findIndex(i => i.id === itemId);
    if (idx >= 0) { stats.items.splice(idx, 1); return true; }
    return false;
  }

  function hasItem(stats, itemId) {
    return stats.items.some(i => i.id === itemId);
  }

  function useItem(stats, itemId) {
    const item = stats.items.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return null;
    if (item.effect) {
      if (item.effect.hp) heal(stats, item.effect.hp);
      if (item.effect.mp) restoreMp(stats, item.effect.mp);
    }
    removeItem(stats, itemId);
    return item;
  }

  function gainXp(stats, amount, character) {
    stats.xp += amount;
    let leveled = false;
    while (stats.xp >= stats.xpNext && stats.level < 5) {
      stats.xp -= stats.xpNext;
      stats.level++;
      const base = CLASS_BASE[character] || CLASS_BASE.knight;
      stats.maxHp += base.hpPerLevel;
      stats.hp += base.hpPerLevel;
      stats.maxMp += base.mpPerLevel;
      stats.mp += base.mpPerLevel;
      stats.xpNext = Math.floor(stats.xpNext * 1.6);
      leveled = true;
    }
    return leveled;
  }

  return { init, takeDamage, heal, useMp, restoreMp, addItem, removeItem, hasItem, useItem, gainXp };
})();
