# Ashen Bond — Development Bible

## Overview
A dark fantasy turn-based RPG running as a single HTML file (`index.html`).
Two players each run a separate instance on their own phone (PWA, fully offline).
No network connection needed at all — players interact by verbally exchanging
short "glyph codes" (4-8 character strings).
Both players explore the same spatial map but in different timelines (past vs present).
Designed for ~3 hours of gameplay on a plane.

## Tech Stack
- **Dev:** Split source in `src/` (JS modules, CSS, HTML template)
- **Build:** `node build.js` bundles into single `dist/index.html`
- **Build watch:** `node build.js --watch` for auto-rebuild on change
- **Output:** Single HTML file with everything inline (CSS, JS, assets as base64)
- PWA with service worker for full offline support
- HTML5 Canvas for rendering (top-down 16-bit pixel art style)
- HMAC-based glyph code system for offline two-player interaction
- No npm dependencies, no frameworks

## Architecture

### The Glyph System
- On first launch: pick character (Hollow Knight or Pale Whisper), one-time seed exchange (one short code each)
- Glyph codes generated via HMAC(shared_seed, event_id) — both games can validate without network
- Types of glyphs:
  - **Discovery glyphs** — found by exploring; shared verbally to unlock content for the other player
  - **Echo choices** — narrative decisions that produce a code the other player enters to see consequences
  - **Sync rituals** — clock-based TOTP codes for time-sensitive cooperative moments
  - **Combined glyphs** — each player holds half; both must be spoken aloud and entered together
- Players exchange codes by speaking them aloud or showing screens

### Game State
- All state in localStorage per device
- No host/guest — both instances are equal, running the same game logic
- Character choice determines timeline:
  - Hollow Knight plays in the **past** (warm, lit, intact)
  - Pale Whisper plays in the **present** (dark, ruined, hollow)
- Same spatial map, different visual themes and content
- State includes: map, entities, inventory, bond level, story flags, combat state, glyph log

### Rendering
- Tile-based canvas renderer, 16x16 or 24x24 tiles
- Two visual palettes driven by character/timeline:
  - **Hollow Knight (past):** warm amber, candlelight, intact architecture, living NPCs
  - **Pale Whisper (present):** cold teal/purple, ruins, fog, hollowed figures
- Fog of war per-character (each player sees from their character's perspective)
- Particle system for magic effects, ambient fog, torchlight flicker
- UI overlays for dialogue, inventory, combat, glyph exchange

### Combat System
- Turn-based, initiative order
- Action points per turn (move, attack, ability, item)
- Two distinct character classes with complementary skills
- Bond abilities unlock at bond thresholds (combo attacks, shared buffs)
- Enemy AI: simple but varied behaviors per enemy type

### The Bond System
- Shared meter (0-100) that grows through cooperative actions (glyph exchanges, echo choices)
- At thresholds (20, 40, 60, 80, 100): narrative vision scenes trigger
- Bond abilities unlock progressively
- Bond level affects available endings and final act content

## Characters
- **The Hollow Knight**: Melee/tank, defensive abilities, shield mechanics — plays in the past timeline
- **The Pale Whisper**: Ranged magic, debuffs, glass cannon, utility spells — plays in the present timeline

## Narrative
- ALL story content, plot details, character backstories, and ending details 
  are in `docs/narrative-SPOILERS-DO-NOT-READ/`
- The developer (Florian) should NOT read those files — they contain spoilers
- When implementing story beats, reference the narrative bible in that folder

## Visual Style
- 16-bit pixel art, dark and atmospheric
- Two timeline palettes (past=warm amber, present=cold teal) from a shared tile map
- Sprites encoded as base64 data URIs inline in the HTML
- Procedural generation for dungeon layouts
- Hand-authored key rooms and narrative locations

## File Structure
```
build.js                                — Build script (node build.js [--watch])
dist/
  index.html                            — Built game (single file, play this)
  manifest.json                         — PWA manifest
  sw.js                                 — Service worker for offline
src/
  index.html                            — HTML template
  css/
    styles.css                          — All styles
  js/
    crypto.js                           — Shared seed, HMAC, glyph generation/validation
    persist.js                          — LocalStorage game state
    wakelock.js                         — Keep screen on during play
    game.js                             — Core game state and logic
    map.js                              — Tile map data and generation
    renderer.js                         — Canvas rendering (dual timeline visuals)
    input.js                            — Touch/click input handling
    ui.js                               — Screen management, glyph exchange UI
    init.js                             — Startup code
CLAUDE.md                               — This file (dev reference)
docs/
  ROADMAP.md                            — Development progress (spoiler-free)
  narrative-SPOILERS-DO-NOT-READ/
    story-bible.md                      — Full plot, characters, arcs, twists
```

## Build
```bash
node build.js           # Single build → dist/index.html
node build.js --watch   # Rebuild on file changes
```

JS files are bundled in dependency order (defined in build.js JS_FILES array).
When adding new JS files, add them to that array in the correct position.

## Development Principles
- Everything in ONE html file — no external resources (except sw.js and manifest.json for PWA)
- Test the glyph exchange flow frequently — it's the core multiplayer mechanic
- Story quality is paramount — this is for a father and 14-year-old son
- Dark fantasy tone: gothic, atmospheric, emotionally complex — not gratuitously grim
- Unconventional narrative — subvert tropes, earn emotional weight
- Turn-based everything — must work on phones with touch input
- Both timelines must feel complete on their own, but richer together
