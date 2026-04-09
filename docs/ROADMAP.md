# Ashen Bond — Development Roadmap

## Phase 1: Foundation ✓
- [x] Project setup, build system, PWA, GitHub Pages
- [x] Glyph code system (HMAC crypto, seed exchange, all glyph types)
- [x] Dual-timeline rendering (past=amber, present=teal)
- [x] Touch-first movement with BFS pathfinding + smooth camera
- [x] Interactive objects, fog of war, demo mode

## Phase 2: Core Engine ✓
- [x] Loadable map system (MapGen + Map.load)
- [x] Stats, inventory, leveling, bond meter, dialogue, HUD
- [x] NPC interaction, echo choices, sync rituals
- [x] Procedural dungeon generation + Act 1 Athenaeum content
- [x] Area transitions, story bible rewrite (glyph-first narrative)

## Phase 3: Combat ✓
- [x] Full-screen combat mode (canvas-rendered)
- [x] Turn-based: Attack / Defend / Item / Mercy
- [x] Enemy definitions (past: Constructs, Enforcers / present: Hollowed, Wraiths)
- [x] Visible enemies on map (timeline-filtered, red/purple glow)
- [x] Boss: The Curator (past=alive with Silence, present=Hollowed with Memory Bolt)
- [x] Boss phases (pattern changes at 50% HP)
- [x] Cross-timeline glyph effects (mercy weakens enemy in other timeline)
- [x] Mercy system (Bond≥60 unlocks, boss requires HP<25%)
- [x] Combat rewards (XP, drops, glyph generation)
- [x] Story flag tracking (mercy vs kill for ending calculation)
- [x] Visual effects (damage numbers, screen shake, flash)
- [x] Defeat = HP restored to 1, retry

## Phase 4: Narrative & Endings ← NEXT
- [ ] Act 2: The Hollowed City (map, NPCs, enemies, boss)
- [ ] Act 3: The Synod's Tomb (map, NPCs, enemies, boss)
- [ ] Act 4: The Ashen Throne (metaphysical map, inner challenges)
- [ ] Full vision scene chain (all bond thresholds)
- [ ] Final choice system (sync ritual at Throne)
- [ ] Multiple endings based on bond + choices + mercy history
- [ ] Confession Halls mechanic (private answers → cross-timeline echoes)

## Phase 5: Polish
- [ ] Pixel art sprites
- [ ] Particle effects (torchlight, fog, magic)
- [ ] Sound effects (Web Audio API)
- [ ] Touch optimization
- [ ] Difficulty balancing
- [ ] Playtesting

---
*Last updated: 2026-04-09*
