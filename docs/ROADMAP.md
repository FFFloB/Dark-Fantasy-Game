# Ashen Bond — Development Roadmap

## Phase 1: Foundation
- [x] Project setup and documentation
- [x] Multi-file build system (src/ → dist/index.html)
- [~] **WebRTC multiplayer framework** ← CURRENT
  - [x] Host/join flow with code exchange
  - [x] Peer-to-peer data channel
  - [x] Connection status UI
  - [x] SDP binary compression (~70 bytes)
  - [x] QR code generator (inline, no dependencies)
  - [x] QR camera scanner (BarcodeDetector API)
  - [x] Text code fallback for desktop testing
  - [x] Chat messaging over data channel
  - [x] Game state/action message protocol
  - [ ] Reconnection handling
  - [ ] Local testing verification ← NEXT
- [ ] Basic canvas renderer
  - [ ] Tile rendering system
  - [ ] Camera and viewport
  - [ ] Dark fantasy color palette

## Phase 2: Core Engine
- [ ] Tile map system
  - [ ] Map data structure
  - [ ] Procedural dungeon generation
  - [ ] Fog of war
- [ ] Character system
  - [ ] Two playable characters with distinct stats
  - [ ] Movement and collision
  - [ ] Basic inventory
- [ ] Game state sync
  - [ ] Host-authoritative state model
  - [ ] State diff sync over WebRTC
  - [ ] Turn management (whose turn is it)

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
  - [ ] Player-specific text (private visions)
  - [ ] Choice consequences tracking
- [ ] Bond mechanic
  - [ ] Bond meter and cooperative triggers
  - [ ] Vision scenes at thresholds
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
*Last updated: 2026-04-07*
