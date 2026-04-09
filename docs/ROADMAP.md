# Ashen Bond — Development Roadmap

## Phase 1: Foundation ✓
- [x] Project setup, build system, PWA, GitHub Pages
- [x] Glyph code system (HMAC crypto, seed exchange, all glyph types)
- [x] Dual-timeline rendering (past=amber, present=teal)
- [x] Touch-first movement with BFS pathfinding
- [x] Interactive objects, fog of war, demo mode

## Phase 2: Core Engine ✓
- [x] Refactor Map to loadable (MapGen generates, Map.load consumes)
- [x] Character stats system (HP, MP, class-based: Knight=tanky, Whisper=magic)
- [x] Inventory system (8 slots, consumable items, UI drawer)
- [x] Dialogue system (modal text panel, tap to advance, choice buttons)
- [x] Bond meter (0-100, vision scenes at thresholds with real narrative)
- [x] HUD rendering (HP/MP bars, bond bar, level on canvas)
- [x] NPC interaction with timeline-specific dialogue
- [x] Echo choices (choice → glyph → partner consequences)
- [x] Sync rituals (TOTP-based, wired to bond system)
- [x] Level progression (XP, auto level-up, class bonuses)
- [x] Procedural dungeon generation (room placement, corridor connection, BFS connectivity)
- [x] Game data module (items, area defs, room templates, NPC dialogue)
- [x] Act 1: The Athenaeum
  - [x] Hand-authored rooms (entrance, main hall, archives, children's corner, reading hall)
  - [x] NPCs with timeline-specific dialogue (scholar, archive keeper, Curator)
  - [x] Discovery glyphs (research notes, child's name)
  - [x] Echo choice (Synod mural: cover or expose)
  - [x] Combined glyph (mirror in reading hall)
  - [x] Sync ritual point (stone circle)
  - [x] Chests with items (journal, potions, doll)
  - [x] Sealed gate (unlocked by partner glyph)
  - [x] Exit to Act 2
- [x] Area transition system (save/restore explored state per area)

## Phase 3: Combat ← NEXT
- [ ] Turn-based combat system
- [ ] Enemy entities and AI
- [ ] Combat UI (actions, damage, effects)
- [ ] Mercy system (spare vs defeat)
- [ ] Boss: The Curator (memory projectiles)

## Phase 4: Narrative & Endings
- [ ] Act 2: The Hollowed City
- [ ] Act 3: The Synod's Tomb  
- [ ] Act 4: The Ashen Throne
- [ ] All vision scenes
- [ ] Final choice system
- [ ] Multiple endings based on bond + choices

## Phase 5: Polish
- [ ] Pixel art sprites
- [ ] Particle effects
- [ ] Sound effects
- [ ] Touch optimization
- [ ] Playtesting

---
*Last updated: 2026-04-09*
