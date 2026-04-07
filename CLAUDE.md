# Ashen Bond — Development Bible

## Overview
A dark fantasy turn-based RPG running as a single HTML file (`index.html`).
Two players connect via WebRTC (phone hotspot, no internet required) and play cooperatively.
Designed for ~3 hours of gameplay on a plane.

## Tech Stack
- **Dev:** Split source in `src/` (JS modules, CSS, HTML template)
- **Build:** `node build.js` bundles into single `dist/index.html`
- **Build watch:** `node build.js --watch` for auto-rebuild on change
- **Output:** Single HTML file with everything inline (CSS, JS, assets as base64)
- HTML5 Canvas for rendering (top-down 16-bit pixel art style)
- WebRTC DataChannel for peer-to-peer multiplayer
- QR code exchange for connection setup (no typing needed)
- No npm dependencies, no frameworks

## Architecture

### Multiplayer
- Host creates game → generates WebRTC offer → compressed to short alphanumeric code
- Guest enters code → generates answer → connection established
- Host is authoritative for game state; syncs to guest via DataChannel
- Turn-based = very low bandwidth, tolerant of latency
- Auto-pause on disconnect, reconnect via new code exchange

### Game State
- Centralized state object on host, serializable to JSON
- State includes: map, entities, inventories, bond level, story flags, combat state
- Guest receives state diffs each turn
- Both clients render independently from state

### Rendering
- Tile-based canvas renderer, 16x16 or 24x24 tiles
- Dark palette: blacks, deep purples, ember oranges, muted teals
- Fog of war per-character (each player sees from their character's perspective)
- Particle system for magic effects, ambient fog, torchlight flicker
- UI overlays for dialogue, inventory, combat

### Combat System
- Turn-based, initiative order
- Action points per turn (move, attack, ability, item)
- Two distinct character classes with complementary skills
- Bond abilities unlock at bond thresholds (combo attacks, shared buffs)
- Enemy AI: simple but varied behaviors per enemy type

### The Bond System
- Shared meter (0-100) that grows through cooperative actions
- At thresholds (20, 40, 60, 80, 100): narrative vision scenes trigger
- Bond abilities unlock progressively
- Bond level affects available endings and final act content

## Characters
- **The Hollow Knight**: Melee/tank, defensive abilities, shield mechanics
- **The Pale Whisper**: Ranged magic, debuffs, glass cannon, utility spells

## Narrative
- ALL story content, plot details, character backstories, and ending details 
  are in `docs/narrative-SPOILERS-DO-NOT-READ/`
- The developer (Florian) should NOT read those files — they contain spoilers
- When implementing story beats, reference the narrative bible in that folder

## Visual Style
- 16-bit pixel art, dark and atmospheric
- Sprites encoded as base64 data URIs inline in the HTML
- Procedural generation for dungeon layouts
- Hand-authored key rooms and narrative locations

## File Structure
```
build.js                                — Build script (node build.js [--watch])
dist/
  index.html                            — Built game (single file, play this)
src/
  index.html                            — HTML template
  css/
    styles.css                          — All styles
  js/
    qr.js                              — QR code generator
    sdp.js                             — SDP binary pack/unpack
    scanner.js                         — QR camera scanner
    renderer.js                        — Canvas rendering
    messaging.js                       — Chat & data messaging
    connection.js                      — WebRTC connection manager
    init.js                            — Startup code
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
- Everything in ONE html file — no external resources
- Test multiplayer frequently — it's the core feature
- Story quality is paramount — this is for a father and 14-year-old son
- Dark fantasy tone: gothic, atmospheric, emotionally complex — not gratuitously grim
- Unconventional narrative — subvert tropes, earn emotional weight
- Turn-based everything — must work on phones with touch input
