// ============================================================
//  CRYPTO — Shared seed, HMAC-based glyph generation/validation
//  No network needed. Codes are verified via shared secret.
// ============================================================

const Crypto = (() => {
  // Dark-fantasy word fragments for readable glyph codes
  const WORDS = [
    'ASH','VEIL','DUST','EMBER','HOLLOW','PALE','BONE','SHADE',
    'THORN','RUST','VOID','GRIM','DUSK','WANE','PYRE','BLIGHT',
    'CAIRN','DREAD','FRAY','GLOOM','HUSK','IRE','KNELL','LORN',
    'MURK','NULL','ORE','PLUME','QUELL','RIME','SEAR','TOLL',
    'URN','WRATH','BANE','CRYPT','DIRGE','FORGE','GHAST','HEX',
    'JEST','KEEN','LOOM','MIRE','NETHER','OAK','REND','SIGIL',
    'WEFT','ZINC','CHAR','DROSS','FELL','GORGE','HAVEN','JADE',
    'LATCH','MOAT','NEXUS','OPAL','PITCH','QUARTZ','SABLE','TIDE'
  ];

  // Simple but effective hash: cyrb53
  function hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  // HMAC-like: hash(seed + message) with double hashing for security
  function hmac(sharedSeed, message) {
    const inner = hash(sharedSeed + ':' + message, 0x5a5a);
    const outer = hash(sharedSeed + ':' + inner.toString(36), 0xa5a5);
    return outer;
  }

  // Generate a 6-char random seed for initial exchange
  function generateSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
    let seed = '';
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    for (const b of arr) seed += chars[b % chars.length];
    return seed;
  }

  // Combine two player seeds into a shared secret
  function combineSeeds(mySeed, theirSeed) {
    const sorted = [mySeed, theirSeed].sort();
    return hash(sorted[0] + ':' + sorted[1]).toString(36);
  }

  // Generate a glyph code for an event
  function generateGlyph(sharedSeed, eventId) {
    const h = hmac(sharedSeed, eventId);
    const w1 = WORDS[Math.abs(h) % WORDS.length];
    const w2 = WORDS[Math.abs(h >> 8) % WORDS.length];
    // Avoid same word twice
    if (w1 === w2) {
      const w2alt = WORDS[(Math.abs(h >> 8) + 1) % WORDS.length];
      return w1 + '-' + w2alt;
    }
    return w1 + '-' + w2;
  }

  // Validate a received glyph: try all possible event IDs
  // Returns the matching event ID, or null if invalid
  function validateGlyph(sharedSeed, code, possibleEventIds) {
    const normalized = code.toUpperCase().trim();
    for (const eventId of possibleEventIds) {
      if (generateGlyph(sharedSeed, eventId) === normalized) {
        return eventId;
      }
    }
    return null;
  }

  // Sync ritual: time-based code (valid for ~30 second windows)
  function generateSyncCode(sharedSeed, ritualId) {
    const window = Math.floor(Date.now() / 30000); // 30-second windows
    return generateGlyph(sharedSeed, ritualId + ':' + window);
  }

  // Validate a sync code (check current window ± 1 for clock drift)
  function validateSyncCode(sharedSeed, code, ritualId) {
    const window = Math.floor(Date.now() / 30000);
    for (let offset = -1; offset <= 1; offset++) {
      const expected = generateGlyph(sharedSeed, ritualId + ':' + (window + offset));
      if (code.toUpperCase().trim() === expected) return true;
    }
    return false;
  }

  // Generate a half-glyph (for combined glyphs where each player has half)
  function generateHalfGlyph(sharedSeed, eventId, isFirstHalf) {
    const h = hmac(sharedSeed, eventId + (isFirstHalf ? ':A' : ':B'));
    return WORDS[Math.abs(h) % WORDS.length];
  }

  return {
    generateSeed,
    combineSeeds,
    generateGlyph,
    validateGlyph,
    generateSyncCode,
    validateSyncCode,
    generateHalfGlyph,
    WORDS,
  };
})();
