// ============================================================
//  DATA — Game content definitions (areas, items, NPCs, rooms)
//  NOTE: This file contains narrative content. Spoiler-sensitive.
// ============================================================

const Data = (() => {

  // --- ITEMS ---

  const items = {
    health_potion: { id: 'health_potion', name: 'Mending Draught', type: 'consumable', effect: { hp: 12 },
      desc: { past: 'A warm vial, amber liquid swirling.', present: 'A cold flask, the liquid still faintly glows.' } },
    mana_potion: { id: 'mana_potion', name: 'Whisper Essence', type: 'consumable', effect: { mp: 8 },
      desc: { past: 'Captured breath of the deep archives.', present: 'Bottled silence, dense as grief.' } },
    scholars_key: { id: 'scholars_key', name: 'Scholar\'s Key', type: 'key',
      desc: { past: 'A brass key, still warm from its owner.', present: 'Tarnished brass, the teeth worn smooth.' } },
    torn_journal: { id: 'torn_journal', name: 'Torn Journal', type: 'quest',
      desc: { past: 'Pages filled with urgent, cramped writing.', present: 'Fragments. Someone wrote this in fear.' } },
    childs_doll: { id: 'childs_doll', name: 'Cloth Doll', type: 'quest',
      desc: { past: 'A hand-sewn doll, well-loved, missing an eye.', present: 'Faded fabric, one glass eye staring.' } },
  };

  // --- HAND-AUTHORED ROOM TEMPLATES ---
  // 0=floor, 1=wall, 2=door
  // Each is a small 2D array placed at a fixed position in the area

  const ROOMS = {
    athenaeum_entrance: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,0,1,1,1,1,1],
    ],
    athenaeum_main_hall: [
      [1,1,1,1,1,0,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,0,0,0,0,1,1,1,1],
    ],
    athenaeum_children: [
      [1,1,1,2,2,1,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ],
    athenaeum_archive: [
      [1,1,1,1,0,0,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    athenaeum_reading_hall: [
      [1,1,1,1,0,0,0,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
  };

  // --- ACT 1: THE ATHENAEUM ---

  const act1_athenaeum = {
    id: 'act1_athenaeum',
    name: 'The Athenaeum',
    w: 50, h: 50,
    spawn: { x: 25, y: 43 },
    rooms: [
      { id: 'entrance', x: 19, y: 38, template: ROOMS.athenaeum_entrance },
      { id: 'main_hall', x: 19, y: 26, template: ROOMS.athenaeum_main_hall },
      { id: 'archive_west', x: 5, y: 28, template: ROOMS.athenaeum_archive },
      { id: 'archive_east', x: 35, y: 28, template: ROOMS.athenaeum_archive },
      { id: 'children', x: 7, y: 20, template: ROOMS.athenaeum_children },
      { id: 'reading_hall', x: 18, y: 12, template: ROOMS.athenaeum_reading_hall },
    ],
    exits: [
      { x: 25, y: 1, targetArea: 'act2_city', targetSpawn: { x: 25, y: 48 }, type: 'exit',
        label: { past: 'The doors to the city beyond.', present: 'A shattered archway, leading out.' } },
    ],
    objects: [
      // --- ENTRANCE ---
      { id: 'ath_candles', x: 22, y: 42, type: 'examine', eventId: null,
        label: { past: 'Candles burn steadily on the reading desk.', present: 'Candles still burning. After seven years. How?' } },
      { id: 'ath_scholar_npc', x: 24, y: 40, type: 'npc', eventId: null,
        label: { past: 'A scholar, sorting manuscripts.', present: 'A hollow figure, hands shuffling empty air.' },
        dialogue: {
          past: [
            '"The western archives need re-cataloguing again."',
            '"If you\'re looking for the restricted texts, speak to the Curator."',
            '"Careful with the older volumes. Some of them... resist being read."',
          ],
          present: [
            '"Al... alpha... the system. What was the system?"',
            '"Chron... no. No. The order. The..."',
            'The figure trails off, hands still moving.',
          ],
        } },

      // --- MAIN HALL ---
      { id: 'ath_mural', x: 25, y: 27, type: 'echo_choice', eventId: 'ath_mural_choice',
        label: {
          past: 'A grand mural depicts the Synod — five robed figures, serene and powerful.',
          present: 'The mural looms. Your head splits with pain just looking at it.',
        },
        choices: [
          { label: 'Cover the mural', eventId: 'ath_mural_covered',
            message: 'You drape cloth over the painted faces. Something in you says: she shouldn\'t see this.' },
          { label: 'Leave it exposed', eventId: 'ath_mural_exposed',
            message: 'You leave the truth visible. Whatever this means, hiding it helps no one.' },
        ] },
      { id: 'ath_research_notes', x: 21, y: 28, type: 'discovery', eventId: 'ath_research_found',
        forTimeline: 'present',
        label: {
          past: 'Research notes, hidden beneath a false shelf bottom. The handwriting is frantic.',
          present: 'Scorched fragments of paper, scattered like leaves. Some words still glow faintly.',
        } },
      { id: 'ath_hall_chest', x: 29, y: 30, type: 'chest', eventId: 'ath_hall_chest_open',
        unlockedBy: 'ath_research_found',
        item: items.torn_journal,
        label: {
          past: 'A locked chest behind the main desk.',
          present: 'A rusted chest. The lock is fused shut.',
        } },

      // --- ARCHIVES ---
      { id: 'ath_sealed_door', x: 14, y: 30, type: 'gate', eventId: 'ath_sealed_open',
        unlockedBy: 'ath_children_name',
        gateTiles: [[14, 30]],
        label: {
          past: 'A sealed archive section. The lock hums faintly.',
          present: 'A sealed door. Something prevents it from opening.',
        } },
      { id: 'ath_east_potion', x: 40, y: 32, type: 'chest', eventId: null,
        item: items.health_potion,
        label: {
          past: 'A supply cabinet, neatly organized.',
          present: 'A cabinet, mostly empty. One vial remains.',
        } },
      { id: 'ath_archive_scholar', x: 8, y: 31, type: 'npc', eventId: null,
        label: { past: 'An elderly scholar, deep in thought.', present: 'A hollow, rocking gently.' },
        dialogue: {
          past: [
            '"The Synod\'s latest acquisitions are... troubling."',
            '"Old texts. Forbidden ones. They shouldn\'t be reading those."',
            '"I reported my concerns. Nothing happened. Nothing ever does."',
          ],
          present: [
            '"Trou... bling..."',
            'A single tear runs down the hollow face.',
            'Then nothing.',
          ],
        } },

      // --- CHILDREN'S CORNER ---
      { id: 'ath_children_cot', x: 10, y: 22, type: 'discovery', eventId: 'ath_children_name',
        forTimeline: 'past',
        label: {
          past: 'A child\'s cot, neatly made. Small books stacked beside it.',
          present: 'A cot with a name scratched into the frame. Five letters, half-faded: S-A-B-L-E.',
        } },
      { id: 'ath_children_doll', x: 9, y: 23, type: 'chest', eventId: null,
        item: items.childs_doll,
        label: {
          past: 'A small toy chest. Someone loved these things.',
          present: 'Scattered toys. One cloth doll, missing an eye.',
        } },

      // --- READING HALL (Boss Area) ---
      { id: 'ath_curator_npc', x: 25, y: 17, type: 'npc', eventId: null,
        label: {
          past: 'The Curator sits at the great desk, surrounded by towers of books.',
          present: 'Something vast hunches in the shadows of the reading hall.',
        },
        dialogue: {
          past: [
            '"Welcome to the Athenaeum. All knowledge lives here."',
            '"The restricted section? Only Synod members may access it."',
            '"Hmm? The Synod\'s research? That\'s above my authority, I\'m afraid."',
            '"But between us... I don\'t like what they\'ve been requesting."',
          ],
          present: [
            '"The... collection... must be... organized."',
            'It doesn\'t see you. It sees books that aren\'t there.',
            'Its hands sort phantom pages, vast fingers gentle as grief.',
            'This was a person. This was someone who loved their work.',
          ],
        } },
      { id: 'ath_reading_potion', x: 23, y: 19, type: 'chest', eventId: null,
        item: items.mana_potion,
        label: {
          past: 'A case of scholarly supplies.',
          present: 'Broken glass and dust. One vial survived.',
        } },
      { id: 'ath_combined_mirror', x: 25, y: 14, type: 'combined', eventId: 'ath_mirror_bond',
        label: {
          past: 'A tall mirror in an ornate frame. Your reflection looks... older. Sadder.',
          present: 'A cracked mirror. In the fractures, you see a face that is not yours.',
        } },

      // --- EXIT ---
      { id: 'ath_exit', x: 25, y: 1, type: 'exit', eventId: null,
        targetArea: 'act2_city', targetSpawn: { x: 25, y: 48 },
        label: {
          past: 'The great doors. The city lies beyond.',
          present: 'A shattered archway. Cold air rushes in.',
        } },

      // --- SYNC RITUAL POINT ---
      { id: 'ath_ritual_point', x: 25, y: 32, type: 'sync_ritual', eventId: 'ath_first_ritual',
        label: {
          past: 'A circle of inlaid stone in the floor. It hums beneath your feet.',
          present: 'A circle of cracked stone. Faint warmth rises from it, impossibly.',
        } },
    ],
  };

  // --- AREA REGISTRY ---

  const areas = {
    act1_athenaeum,
    // act2_city: defined later
  };

  return { items, areas, ROOMS };
})();
