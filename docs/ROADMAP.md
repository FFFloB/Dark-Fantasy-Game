# Ashen Bond — Development Roadmap

## Phase 1: Foundation
- [x] Project setup and documentation
- [x] Multi-file build system (src/ → dist/index.html)
- [x] PWA support (service worker, manifest, offline play)
- [x] ~~WebRTC multiplayer~~ → Replaced with glyph code system
- [x] **Glyph code system** (HMAC-based offline multiplayer)
  - [x] Crypto module (seed generation, HMAC, glyph codes)
  - [x] Character selection (Hollow Knight / Pale Whisper)
  - [x] Seed exchange flow (one-time verbal code swap)
  - [x] Glyph input/display UI
  - [x] Session persistence (localStorage)
  - [x] Wake lock (screen stays on)
- [x] Dual-timeline rendering (past=warm, present=cold)
- [ ] Basic canvas renderer ← NEXT
  - [ ] Tile map rendering with camera/viewport
  - [ ] Touch input for movement
  - [ ] Character movement and collision

## Phase 2: Core Engine
- [ ] Tile map system
  - [ ] Map data structure
  - [ ] Procedural dungeon generation
  - [ ] Fog of war (per-character sight)
  - [ ] Dual-timeline visual differences (same layout, different palette/details)
- [ ] Character system
  - [ ] Stats, health, abilities
  - [ ] Basic inventory
- [ ] Glyph event system
  - [ ] Discovery glyphs (find → generate code → other player enters)
  - [ ] Echo choices (decision → code → consequences in other timeline)
  - [ ] Combined glyphs (each player has half)
  - [ ] Sync rituals (clock-based TOTP codes)

## Phase 3: Combat
- [ ] Turn-based combat system
  - [ ] Initiative and turn order
  - [ ] Action point economy
  - [ ] Melee and ranged attacks
  - [ ] Ability system (per-character skill trees)
  - [ ] Enemy AI behaviors
- [ ] Combat UI
  - [ ] Health/mana bars
  - [ ] Action menu
  - [ ] Damage numbers and effects

## Phase 4: Narrative & Bond System
- [ ] Dialogue system
  - [ ] Branching dialogue trees
  - [ ] Player-specific text (timeline-dependent)
  - [ ] Choice consequences tracking
- [ ] Bond mechanic
  - [ ] Bond meter tracking through glyph exchanges
  - [ ] Vision scenes at bond thresholds
  - [ ] Bond abilities unlock
- [ ] Story implementation
  - [ ] Act 1 content
  - [ ] Act 2 content
  - [ ] Act 3 content
  - [ ] Act 4 content and endings

## Phase 5: Content & Polish
- [ ] Pixel art sprites (inline base64)
- [ ] Particle effects (fog, fire, magic)
- [ ] Sound effects (Web Audio API, inline)
- [ ] Touch controls optimization
- [ ] Mobile viewport and scaling
- [ ] Difficulty balancing
- [ ] Playtesting and bug fixes

---
*Last updated: 2026-04-08*
