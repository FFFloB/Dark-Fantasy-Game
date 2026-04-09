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
    city_key: { id: 'city_key', name: 'Synod Hall Key', type: 'key',
      desc: { past: 'A heavy iron key, warm with residual ward-magic.', present: 'Cold iron, the wards long since faded to nothing.' } },
    thren_badge: { id: 'thren_badge', name: 'Captain\'s Badge', type: 'quest',
      desc: { past: 'Thren\'s badge of office. A sentinel\'s oath cast in silver.', present: 'Tarnished silver. The oath it carried has gone silent.' } },
    orphanage_drawing: { id: 'orphanage_drawing', name: 'Child\'s Drawing', type: 'quest',
      desc: { past: 'A child\'s drawing: a tall building with candles, a stick figure reading to smaller ones.', present: 'Faded crayon on brittle paper. Two figures, one tall, one small. Both smiling.' } },
    tomb_key: { id: 'tomb_key', name: 'Deep Chamber Key', type: 'key',
      desc: { past: 'A key of black iron, inscribed with Synod script that writhes when touched.', present: 'The inscriptions have burned into the metal, frozen mid-writhe.' } },
    ritual_text: { id: 'ritual_text', name: 'Ritual Fragment', type: 'quest',
      desc: { past: 'A page of the binding ritual. The ink moves like something alive.', present: 'Scorched parchment. The words are burned in, permanent and screaming.' } },
    greater_mending: { id: 'greater_mending', name: 'Greater Mending Draught', type: 'consumable', effect: { hp: 20 },
      desc: { past: 'A deep amber flask, the liquid inside warm as hearthlight.', present: 'A sealed flask. The warmth inside defies the cold of seven years.' } },
    clarity_draught: { id: 'clarity_draught', name: 'Clarity Draught', type: 'consumable', effect: { mp: 15 },
      desc: { past: 'Distilled silence, bottled before silence became a weapon.', present: 'Liquid clarity. Drinking it feels like remembering a word on the tip of your tongue.' } },
    memory_shard: { id: 'memory_shard', name: 'Memory Shard', type: 'quest',
      desc: { past: 'A crystallized fragment of someone\'s happiest moment. It hums with warmth.', present: 'A cold crystal. Press it to your ear and you hear laughter you don\'t recognize.' } },
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
    // --- Act 2 Rooms ---
    city_market_square: [
      [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,0,0,0,1,1,1,1,1],
    ],
    city_garden_of_names: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,1,0,0,1],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [1,0,0,1,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    city_orphanage: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [2,0,0,0,0,0,0,1],
      [2,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ],
    city_synod_hall: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,0,0,0,1,1,1,1,1],
    ],
    // --- Act 3 Rooms ---
    tomb_entrance_hall: [
      [1,1,1,1,1,0,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,0,1,1,1,1,1],
    ],
    tomb_record_chamber: [
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
    tomb_confession_hall: [
      [1,1,1,2,2,1,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ],
    tomb_ritual_chamber: [
      [1,1,1,1,1,0,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    tomb_deep_stacks: [
      [1,1,1,1,0,0,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    // --- Act 4 Rooms ---
    throne_memory_corridor: [
      [1,1,1,0,0,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,0,0,1,1,1],
    ],
    throne_guilt_chamber: [
      [1,1,1,2,2,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ],
    throne_power_chamber: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,2,2,1,1,1],
    ],
    throne_room: [
      [1,1,1,1,0,0,0,0,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,0,0,0,0,1,1,1,1],
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

  // --- ENEMIES ---

  const enemies = {
    synod_ward: {
      id: 'synod_ward', name: 'Warding Construct', timeline: 'past',
      hp: 18, attack: 5, defense: 2, xp: 8,
      drops: [{ item: items.health_potion, chance: 0.3 }],
      dialogue: {
        encounter: ['A construct of light and law bars your path.', 'Its eyes glow with borrowed authority.'],
        defeat: ['The construct crumbles. It was only following orders.'],
        mercy: ['You lower your blade. The construct dims, confused.', 'It steps aside, still humming its purpose.'],
      },
      mercyFlag: 'mercy_ward', glyphEvent: 'combat_ward',
    },
    synod_enforcer: {
      id: 'synod_enforcer', name: 'Synod Enforcer', timeline: 'past',
      hp: 24, attack: 7, defense: 3, xp: 12,
      drops: [{ item: items.mana_potion, chance: 0.25 }],
      dialogue: {
        encounter: ['"You are not authorized. Stand down."'],
        defeat: ['The enforcer falls. They believed in something. It wasn\'t enough.'],
        mercy: ['"I... do not understand. Why would you spare me?"', 'The enforcer retreats, uncertain.'],
      },
      mercyFlag: 'mercy_enforcer', glyphEvent: 'combat_enforcer',
    },
    hollowed_scholar: {
      id: 'hollowed_scholar', name: 'Hollowed Scholar', timeline: 'present',
      hp: 14, attack: 4, defense: 1, xp: 7,
      drops: [{ item: items.health_potion, chance: 0.3 }],
      dialogue: {
        encounter: ['A figure shuffles forward, hands still searching for books.', 'Its mouth moves. No sound comes out.'],
        defeat: ['The hollow collapses. The hands stop moving.'],
        mercy: ['You reach out gently. The hollow flinches, then stills.', 'Something like recognition crosses its face. It wanders away.'],
      },
      mercyFlag: 'mercy_scholar', glyphEvent: 'combat_scholar',
    },
    memory_wraith: {
      id: 'memory_wraith', name: 'Memory Wraith', timeline: 'present',
      hp: 20, attack: 6, defense: 2, xp: 10,
      drops: [{ item: items.mana_potion, chance: 0.25 }],
      dialogue: {
        encounter: ['A shape coalesces from grief and dust.', 'It wears a face you almost recognize.'],
        defeat: ['The wraith dissolves. The memory is lost forever.'],
        mercy: ['You whisper something kind. The wraith pauses.', 'It reaches toward you, then dissipates gently.'],
      },
      mercyFlag: 'mercy_wraith', glyphEvent: 'combat_wraith',
    },
    curator_past: {
      id: 'curator_past', name: 'The Curator', timeline: 'past',
      hp: 50, attack: 8, defense: 4, xp: 30, boss: true,
      drops: [{ item: items.scholars_key, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 8, pattern: ['attack', 'attack', 'catalog'] },
        { hpThreshold: 0.5, attack: 10, pattern: ['attack', 'catalog', 'silence'] },
      ],
      abilities: {
        catalog: { name: 'Catalog', damage: 0, effect: 'defense_up', desc: 'The Curator reorganizes. Defense hardens.' },
        silence: { name: 'Silence', damage: 4, effect: 'mp_drain', mpDrain: 3, desc: 'A forbidden word. Your thoughts scatter.' },
      },
      dialogue: {
        encounter: ['"I cannot let you into the restricted section."', '"The knowledge there is too dangerous. I am trying to protect everyone."'],
        phase2: ['"Why won\'t you listen? I have seen what those texts do to people!"'],
        defeat: ['"Perhaps... perhaps you need to see for yourself."', 'The Curator steps aside, hands trembling.'],
        mercy: ['"You would spare me? After all this?"', '"Then go. See what they\'ve done. And come back alive."'],
      },
      mercyFlag: 'mercy_curator', glyphEvent: 'combat_curator',
    },
    curator_present: {
      id: 'curator_present', name: 'The Hollowed Curator', timeline: 'present',
      hp: 45, attack: 7, defense: 3, xp: 30, boss: true,
      drops: [{ item: items.scholars_key, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 7, pattern: ['attack', 'memory_bolt', 'attack'] },
        { hpThreshold: 0.5, attack: 9, pattern: ['memory_bolt', 'attack', 'grief_wave'] },
      ],
      abilities: {
        memory_bolt: { name: 'Memory Bolt', damage: 6, desc: 'A shard of lost memory strikes you. You see a flash of a life not your own.' },
        grief_wave: { name: 'Grief Wave', damage: 3, desc: '"The... children. Where are the children?"' },
      },
      dialogue: {
        encounter: ['Something vast hunches in the shadows of the reading hall.', 'It turns. Its eyes hold no recognition — only duty.'],
        phase2: ['The Curator shudders. For a moment, its hands stop sorting.', '"The... the children. Where are the children?"'],
        defeat: ['The Hollowed Curator collapses.', 'Its last act is to gently shelve one final invisible book.'],
        mercy: ['You reach out. The Hollowed flinches.', 'Then, slowly, it takes your hand.', '"Sable..."', 'It remembers. Just for a moment. Then it is at peace.'],
      },
      mercyFlag: 'mercy_curator', glyphEvent: 'combat_curator',
    },

    // --- ACT 2 ENEMIES ---

    hollowed_citizen: {
      id: 'hollowed_citizen', name: 'Hollowed Citizen', timeline: 'present',
      hp: 12, attack: 3, defense: 1, xp: 5,
      drops: [{ item: items.health_potion, chance: 0.2 }],
      dialogue: {
        encounter: ['A figure repeats the motions of a life it cannot remember.', 'Its hands knead invisible dough. Its mouth shapes words that have no sound.'],
        defeat: ['The citizen crumples. The hands finally stop.', 'Whatever routine held it together has ended.'],
        mercy: ['You still your blade. The citizen pauses, confused by the absence of pain.', 'It looks at its hands as if seeing them for the first time, then shuffles away.'],
      },
      mercyFlag: 'mercy_citizen', glyphEvent: 'combat_citizen',
    },
    echo_beast: {
      id: 'echo_beast', name: 'Echo Beast', timeline: 'present',
      hp: 22, attack: 6, defense: 2, xp: 11,
      drops: [{ item: items.greater_mending, chance: 0.2 }],
      dialogue: {
        encounter: ['A shape of compressed grief lurches forward, roaring in a dozen stolen voices.', 'It is not one thing. It is many, fused by shared anguish into something bestial.'],
        defeat: ['The beast unravels into wisps of fading memory.', 'For a moment you hear individual voices, then silence.'],
        mercy: ['You reach into the cluster with careful, precise magic.', 'The voices separate. Individual Hollowed stagger apart, diminished but distinct.', 'They wander away, each carrying their own small grief again.'],
      },
      mercyFlag: 'mercy_echo_beast', glyphEvent: 'combat_echo_beast',
    },
    grief_manifestation: {
      id: 'grief_manifestation', name: 'Grief Manifestation', timeline: 'present',
      hp: 25, attack: 7, defense: 2, xp: 13,
      drops: [{ item: items.memory_shard, chance: 0.3 }],
      dialogue: {
        encounter: ['"Tell my daughter\u2014" The words choke off. Something else surfaces: "I never meant to\u2014"', 'Raw emotional residue given form. It speaks in last words and final thoughts.'],
        defeat: ['The manifestation dissipates. The unfinished sentences hang in the air, then fade.', 'You will never know what it needed to say.'],
        mercy: ['You lower your weapon and listen. The grief speaks its piece.', '"I was just\u2014 I only wanted\u2014 please tell them I\u2014"', 'It finishes. The shape dissolves peacefully, leaving a faint warmth behind.'],
      },
      mercyFlag: 'mercy_grief', glyphEvent: 'combat_grief',
    },
    captain_thren: {
      id: 'captain_thren', name: 'Captain Thren', timeline: 'past',
      hp: 60, attack: 9, defense: 4, xp: 35, boss: true,
      drops: [{ item: items.thren_badge, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 9, pattern: ['attack', 'attack', 'rally'] },
        { hpThreshold: 0.5, attack: 11, pattern: ['attack', 'challenge', 'disarm'] },
      ],
      abilities: {
        rally: { name: 'Rally', damage: 0, effect: 'defense_up', desc: 'Thren sets his stance. The discipline of a lifetime hardens his guard.' },
        challenge: { name: 'Challenge', damage: 6, desc: '"Face me properly, stranger. I deserve that much."' },
        disarm: { name: 'Disarm', damage: 3, effect: 'mp_drain', mpDrain: 4, desc: 'A precise strike sends your focus scattering like dropped papers.' },
      },
      dialogue: {
        encounter: ['"You are trespassing in the Synod\'s chambers. I don\'t want to do this."', '"But duty is duty, and I swore an oath."'],
        phase2: ['"If what you say is true\u2014 if the Synod really\u2014"', '"No. I can\'t think about that and fight you at the same time."'],
        defeat: ['"At least tell me it matters. What you\'re doing. Tell me it matters."', 'Thren falls. His sword clatters on stone that will outlast his oath.'],
        mercy: ['"I\'ve seen the blank ones in the outer districts. I told myself it was illness."', '"Show me what you found. Show me everything."', 'Thren sheathes his blade. His hands are steady. His voice is not.'],
      },
      mercyFlag: 'mercy_thren', glyphEvent: 'combat_thren',
    },
    twin_sentinels: {
      id: 'twin_sentinels', name: 'The Twin Sentinels', timeline: 'present',
      hp: 55, attack: 8, defense: 5, xp: 35, boss: true,
      drops: [{ item: items.city_key, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 8, pattern: ['sync_strike', 'sync_strike', 'shield_wall'] },
        { hpThreshold: 0.5, attack: 10, pattern: ['attack', 'guard', 'attack'] },
      ],
      abilities: {
        sync_strike: { name: 'Synchronized Strike', damage: 8, desc: 'They move as one. Mirror images of duty without memory.' },
        shield_wall: { name: 'Shield Wall', damage: 0, effect: 'defense_up', desc: 'Two shields lock together. Even hollowed, the training holds.' },
        guard: { name: 'Guard', damage: 0, effect: 'defense_up', desc: 'The remaining sentinel braces. It will not leave its partner.' },
      },
      dialogue: {
        encounter: ['Two figures block the corridor, moving in perfect unison.', 'They were partners in life. The Hollowing took everything but this.'],
        phase2: ['One stumbles. The synchronization breaks.', 'The other turns, reaching for its partner with something like recognition.'],
        defeat: ['The second sentinel collapses beside the first.', 'Even in the end, they are close enough to touch.'],
        mercy: ['You step back. The surviving sentinel kneels beside its fallen partner.', 'It places a hand on the other\'s chest. A flicker \u2014 not memory, but the shape memory left.', 'They stay like that. You suspect they will stay like that forever.'],
      },
      mercyFlag: 'mercy_sentinels', glyphEvent: 'combat_sentinels',
    },

    // --- ACT 3 ENEMIES ---

    corrupted_scholar: {
      id: 'corrupted_scholar', name: 'Corrupted Scholar', timeline: 'both',
      hp: 20, attack: 5, defense: 2, xp: 9,
      drops: [{ item: items.clarity_draught, chance: 0.25 }],
      dialogue: {
        encounter: ['"The\u2014 the text, it said\u2014 no, that\'s not\u2014 the WORDS, they\u2014"', 'A scholar who read too deeply. The forbidden knowledge ate them from the inside.'],
        defeat: ['The scholar collapses mid-sentence. The fragment of stolen knowledge dissipates.', 'They were still trying to understand. Even at the end.'],
        mercy: ['You speak a counter-text \u2014 the words come from instinct, not memory.', 'The scholar\'s eyes clear for a single, terrible moment of comprehension.', '"Oh. Oh, I see now. I wish I hadn\'t." They sit down, calm, and weep quietly.'],
      },
      mercyFlag: 'mercy_corrupted', glyphEvent: 'combat_corrupted',
    },
    synod_inquisitor: {
      id: 'synod_inquisitor', name: 'The Inquisitor', timeline: 'past',
      hp: 55, attack: 8, defense: 3, xp: 40, boss: true,
      drops: [{ item: items.tomb_key, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 8, pattern: ['ritual_bolt', 'ritual_bolt', 'barrier'] },
        { hpThreshold: 0.5, attack: 10, pattern: ['confession', 'ritual_bolt', 'confession'] },
      ],
      abilities: {
        ritual_bolt: { name: 'Ritual Bolt', damage: 7, desc: 'Academic precision given killing force. She fights by the book because the book is all she trusts.' },
        barrier: { name: 'Barrier', damage: 0, effect: 'defense_up', desc: 'Wards snap into place. Textbook formation. She learned this yesterday.' },
        confession: { name: 'Confession', damage: 5, effect: 'reveal', desc: '"I joined them because I believed! I believed knowledge could\u2014 I didn\'t know what they\u2014"' },
      },
      dialogue: {
        encounter: ['"I can\'t let you pass. If I let you pass, then everything I\'ve done\u2014"', '"I need this to have meant something. Please. Just turn back."'],
        phase2: ['"If you stop them, what happens to me? I\'m part of it now \u2014 I\'ve DONE things\u2014"', 'She\'s crying. The ritual bolts come faster, less controlled.'],
        defeat: ['She falls quoting Synod scripture. It sounds like a prayer.', 'It sounds like she\'s asking for forgiveness from someone who isn\'t there.'],
        mercy: ['"You have evidence? Real evidence? Show me. Show me everything."', 'She reads. Goes still. Then, very quietly:', '"I\'ll slow them. I can\'t stop it, but I can slow it. Find the binding. The preservation ward."'],
      },
      mercyFlag: 'mercy_inquisitor', glyphEvent: 'combat_inquisitor',
    },
    synod_remnant: {
      id: 'synod_remnant', name: 'The Synod Remnant', timeline: 'present',
      hp: 80, attack: 10, defense: 4, xp: 50, boss: true,
      drops: [{ item: items.ritual_text, chance: 1.0 }],
      phases: [
        { hpThreshold: 1.0, attack: 10, pattern: ['memory_storm', 'identity_blast', 'memory_storm'] },
        { hpThreshold: 0.4, attack: 6, pattern: ['plea', 'defend', 'plea'] },
      ],
      abilities: {
        memory_storm: { name: 'Memory Storm', damage: 9, desc: 'Ten thousand lives crash through you at once. You taste cake. You feel rain. You die in a bed surrounded by family.' },
        identity_blast: { name: 'Identity Blast', damage: 12, desc: 'A concentrated bolt of stolen selfhood. For a moment you forget your own name.' },
        plea: { name: 'Plea', damage: 0, desc: '"Kill us. Please. We remember everything. Every name we took. Every face we emptied. Kill us."' },
        defend: { name: 'Defend', damage: 0, effect: 'defense_up', desc: 'The Remnant curls inward, five minds shielding themselves from their own memories.' },
      },
      dialogue: {
        encounter: ['Five scholars fused into one agonized form. They achieved immortality. They are begging for death.', '"We remember. We remember ALL of them. Do you understand what that means?"'],
        phase2: ['The Remnant stops attacking. Five voices, overlapping, pleading:', '"We are conscious. We have been conscious for seven years. Every stolen name screams inside us."', '"Grant us silence. The silence we inflicted. Please. We have earned it."'],
        defeat: ['The Remnant shatters. Five consciousnesses scatter into the ambient silence.', 'They will never rest. They will never be whole. They will be noise in the quiet, forever.'],
        mercy: ['You pull them apart with careful, agonizing precision.', 'Each separation costs you. Their memories flood through you \u2014 lives, loves, regrets.', 'One by one, five scholars who sold their souls for forever finally get to stop.', '"Thank you. Thank you. Thank\u2014" Silence. Real silence. Earned silence.'],
      },
      mercyFlag: 'mercy_remnant', glyphEvent: 'combat_remnant',
    },
  };

  // Add enemy objects to Act 1
  act1_athenaeum.objects.push(
    { id: 'ath_enemy_ward', x: 10, y: 30, type: 'enemy', enemyId: 'synod_ward',
      label: { past: 'A construct of light stands guard.', present: null } },
    { id: 'ath_enemy_enforcer', x: 37, y: 19, type: 'enemy', enemyId: 'synod_enforcer',
      label: { past: 'A Synod enforcer, hand on blade.', present: null } },
    { id: 'ath_enemy_scholar', x: 10, y: 30, type: 'enemy', enemyId: 'hollowed_scholar',
      label: { past: null, present: 'A shambling figure reaches toward you.' } },
    { id: 'ath_enemy_wraith', x: 37, y: 19, type: 'enemy', enemyId: 'memory_wraith',
      label: { past: null, present: 'A shape of grief and dust drifts forward.' } },
    { id: 'ath_curator_boss', x: 25, y: 16, type: 'enemy', enemyId: 'curator_past',
      label: { past: 'The Curator blocks the way, resolute.', present: null } },
    { id: 'ath_curator_boss_present', x: 25, y: 16, type: 'enemy', enemyId: 'curator_present',
      label: { past: null, present: 'The Hollowed Curator turns toward you.' } },
  );

  // --- ACT 2: THE HOLLOWED CITY ---

  const act2_city = {
    id: 'act2_city',
    name: 'The Hollowed City',
    w: 50, h: 50,
    spawn: { x: 25, y: 48 },
    rooms: [
      { id: 'market_square', x: 19, y: 22, template: ROOMS.city_market_square },
      { id: 'garden_of_names', x: 35, y: 20, template: ROOMS.city_garden_of_names },
      { id: 'orphanage', x: 7, y: 22, template: ROOMS.city_orphanage },
      { id: 'synod_hall', x: 18, y: 5, template: ROOMS.city_synod_hall },
    ],
    exits: [
      { x: 25, y: 1, targetArea: 'act3_tomb', targetSpawn: { x: 25, y: 48 }, type: 'exit',
        label: { past: 'Steps descend beneath the Synod Hall into darkness.', present: 'A gaping hole where the Synod Hall floor collapsed.' } },
    ],
    objects: [
      // --- MARKET SQUARE ---
      { id: 'city_merchant_npc', x: 22, y: 25, type: 'npc', eventId: null,
        label: { past: 'A merchant calls her wares in elaborate rhyming couplets.', present: 'A hollow figure, hands weighing invisible goods.' },
        dialogue: {
          past: [
            '"Fine silks and finer words! Step close, friend, step close!"',
            '"Business is good, though the Synod\'s new taxes pinch."',
            '"Have you heard? People going blank in the outer districts. Illness, they say."',
            '"I don\'t believe it\'s illness. But what do I know? I\'m just a merchant."',
          ],
          present: [
            '"Fine\u2014 fine wares\u2014 finest\u2014 what was I\u2014"',
            '"Fine wares, fine\u2014"',
            'The loop resets. The hands keep weighing nothing.',
          ],
        } },
      { id: 'city_market_echo', x: 26, y: 28, type: 'echo_choice', eventId: 'city_market_warning',
        label: {
          past: 'The merchants here trust you enough to listen. You could warn them.',
          present: 'The Market of Echoes plays its ghostly loops. Something could change them.',
        },
        choices: [
          { label: 'Warn the merchants', eventId: 'city_merchants_warned',
            message: 'You tell them what you know. Some pack to flee. Some stare. One thanks you with tears in her eyes.' },
          { label: 'Stay silent', eventId: 'city_merchants_silent',
            message: 'You say nothing. What would they do with the truth? Where would they go?' },
        ] },
      { id: 'city_market_chest', x: 20, y: 24, type: 'chest', eventId: null,
        item: items.greater_mending,
        label: {
          past: 'A supply crate behind a merchant\'s stall.',
          present: 'A crate, mostly looted. One flask remains, warm to the touch.',
        } },
      { id: 'city_lampposts', x: 24, y: 30, type: 'examine', eventId: null,
        label: { past: 'Lamplit streets of pale stone. The city glows even at dusk.', present: 'The lamps still burn. Seven years of light with no one to tend them.' } },

      // --- GARDEN OF NAMES ---
      { id: 'city_garden_carving', x: 38, y: 23, type: 'combined', eventId: 'city_garden_bond',
        label: {
          past: 'The Garden of Names: a wall of civic pride. Citizens carve their names here as acts of belonging.',
          present: 'The Garden of Names. The carved letters glow faintly \u2014 the last embers of identity, refusing to die.',
        } },
      { id: 'city_garden_examine', x: 40, y: 25, type: 'examine', eventId: null,
        label: {
          past: 'Fresh carvings alongside ancient ones. A living tradition, stretching back centuries.',
          present: 'The newest carvings are seven years old. Some glow brighter than others.',
        } },
      { id: 'city_garden_npc', x: 37, y: 21, type: 'npc', eventId: null,
        label: { past: 'An old stonemason, carefully carving a new name.', present: 'A hollow, tracing letters it can no longer read.' },
        dialogue: {
          past: [
            '"Every name matters, friend. That\'s what the garden teaches."',
            '"I\'ve carved three thousand names in my lifetime. Each one a promise."',
            '"A promise that says: you were here. You mattered."',
          ],
          present: [
            'The hollow\'s finger traces a name. Over and over.',
            'The same letters. The same path. It remembers the shape, if not the meaning.',
          ],
        } },

      // --- ORPHANAGE ---
      { id: 'city_orphanage_keeper', x: 10, y: 24, type: 'npc', eventId: null,
        label: { past: 'The orphanage keeper, a kind-faced woman sorting children\'s clothes.', present: null },
        dialogue: {
          past: [
            '"The children are well, ser. Busy with lessons, as they should be."',
            '"We had a girl here once \u2014 quiet thing, always reading. The Archivist took a shine to her."',
            '"Gave her a name, even. Sable, after the ink. Said she was the color that carries every word."',
            '"She\'s at the Athenaeum now. Happier than she ever was here, I think."',
          ],
          present: null,
        } },
      { id: 'city_orphanage_drawings', x: 12, y: 26, type: 'discovery', eventId: 'city_drawings_found',
        forTimeline: 'present',
        label: {
          past: 'Children\'s drawings pinned to the wall. Bright colors, clumsy hands, enormous hearts.',
          present: 'Faded drawings on brittle paper. A tall building with candles. A stick figure with glasses reading to smaller figures.',
        } },
      { id: 'city_orphanage_chest', x: 9, y: 27, type: 'chest', eventId: null,
        item: items.orphanage_drawing,
        label: {
          past: 'A chest of children\'s keepsakes. Small treasures, fiercely guarded.',
          present: 'A chest, half-open. Inside: a child\'s drawing of two figures, one tall, one small. Both smiling.',
        } },
      { id: 'city_hollowed_child', x: 11, y: 25, type: 'npc', eventId: null,
        label: { past: null, present: 'A small hollowed figure. It reaches for your hand.' },
        dialogue: {
          past: null,
          present: [
            'The child reaches for your hand. Its eyes are blank but not quite blank.',
            'It walks beside you for a time, occasionally looking up.',
            'Your magic flickers when it\'s near. It leans toward the warmth like a flower toward light.',
            'It does not speak. But its hand tightens around yours.',
          ],
        } },
      { id: 'city_orphanage_girl', x: 10, y: 23, type: 'npc', eventId: null,
        label: { past: 'A young girl reads alone in the corner, dark-haired, silent.', present: null },
        dialogue: {
          past: [
            'She looks up with sharp, curious eyes.',
            '"You\'re not a real knight, are you?"',
            '"I can tell. Real knights don\'t look at bookshelves like that."',
            '"Like they\'re remembering something they forgot they knew."',
          ],
          present: null,
        } },

      // --- SYNOD HALL ---
      { id: 'city_synod_gate', x: 25, y: 14, type: 'gate', eventId: 'city_synod_open',
        unlockedBy: 'city_drawings_found',
        gateTiles: [[25, 14]],
        label: {
          past: 'The Synod Hall\'s inner chambers. Guarded, but you know the layout \u2014 somehow.',
          present: 'Collapsed corridors. But a path remains, as though someone mapped it years ago.',
        } },
      { id: 'city_synod_evidence', x: 24, y: 8, type: 'discovery', eventId: 'city_synod_evidence_found',
        forTimeline: 'past',
        label: {
          past: 'Synod preparation chambers. Wards inscribed. Rooms cleared. A list of volunteers for the next test.',
          present: 'Scorched walls where wards detonated. The ritual preparations are burned into the stone.',
        } },
      { id: 'city_synod_layout', x: 26, y: 10, type: 'discovery', eventId: 'city_synod_layout_found',
        forTimeline: 'past',
        label: {
          past: 'You map the Synod Hall\'s layout instinctively. Corridors, guard rotations, hidden passages. How do you know this?',
          present: 'Path markers glow faintly on the walls \u2014 knowledge from the past, echoing forward as a guide.',
        } },
      { id: 'city_synod_potion', x: 22, y: 7, type: 'chest', eventId: null,
        item: items.clarity_draught,
        label: {
          past: 'A locked cabinet of Synod supplies.',
          present: 'A shattered cabinet. One draught survived, sealed in crystal.',
        } },

      // --- BOSS POSITIONS ---
      { id: 'city_thren_boss', x: 25, y: 9, type: 'enemy', enemyId: 'captain_thren',
        label: { past: 'Captain Thren stands at the inner door, hand on sword, face conflicted.', present: null } },
      { id: 'city_sentinels_boss', x: 25, y: 9, type: 'enemy', enemyId: 'twin_sentinels',
        label: { past: null, present: 'Two hollowed guards block the corridor, moving in perfect unison.' } },

      // --- ENEMIES ---
      { id: 'city_enemy_citizen1', x: 30, y: 35, type: 'enemy', enemyId: 'hollowed_citizen',
        label: { past: null, present: 'A hollowed citizen kneads invisible dough, fists clenching and unclenching.' } },
      { id: 'city_enemy_citizen2', x: 15, y: 40, type: 'enemy', enemyId: 'hollowed_citizen',
        label: { past: null, present: 'A hollowed figure sweeps a spotless floor, over and over.' } },
      { id: 'city_enemy_echo_beast', x: 35, y: 38, type: 'enemy', enemyId: 'echo_beast',
        label: { past: null, present: 'A mass of compressed grief lurches between the market stalls.' } },
      { id: 'city_enemy_enforcer1', x: 30, y: 12, type: 'enemy', enemyId: 'synod_enforcer',
        label: { past: 'A Synod enforcer patrols the hall approach.', present: null } },
      { id: 'city_enemy_enforcer2', x: 20, y: 15, type: 'enemy', enemyId: 'synod_enforcer',
        label: { past: 'An enforcer guards the inner corridor.', present: null } },
      { id: 'city_enemy_grief', x: 12, y: 30, type: 'enemy', enemyId: 'grief_manifestation',
        label: { past: null, present: 'Raw emotional residue pools near the orphanage. It speaks in unfinished sentences.' } },

      // --- EXIT ---
      { id: 'city_exit', x: 25, y: 1, type: 'exit', eventId: null,
        targetArea: 'act3_tomb', targetSpawn: { x: 25, y: 48 },
        label: {
          past: 'Steps descend into the Synod\'s underground chambers.',
          present: 'A jagged hole where the floor gave way. Darkness below.',
        } },

      // --- SYNC RITUAL POINT ---
      { id: 'city_ritual_point', x: 25, y: 32, type: 'sync_ritual', eventId: 'city_ritual',
        label: {
          past: 'A fountain in the market square. The water reflects a sky that doesn\'t match.',
          present: 'A dry fountain. The basin still holds warmth, impossibly, as though something flows beneath.',
        } },
    ],
  };

  // --- ACT 3: THE SYNOD'S TOMB ---

  const act3_tomb = {
    id: 'act3_tomb',
    name: 'The Synod\'s Tomb',
    w: 50, h: 50,
    spawn: { x: 25, y: 48 },
    rooms: [
      { id: 'entrance_hall', x: 19, y: 38, template: ROOMS.tomb_entrance_hall },
      { id: 'record_chamber', x: 20, y: 28, template: ROOMS.tomb_record_chamber },
      { id: 'confession_hall_1', x: 8, y: 22, template: ROOMS.tomb_confession_hall },
      { id: 'confession_hall_2', x: 36, y: 22, template: ROOMS.tomb_confession_hall },
      { id: 'ritual_chamber', x: 19, y: 10, template: ROOMS.tomb_ritual_chamber },
      { id: 'deep_stacks', x: 20, y: 2, template: ROOMS.tomb_deep_stacks },
    ],
    exits: [
      { x: 25, y: 1, targetArea: 'act4_throne', targetSpawn: { x: 20, y: 38 }, type: 'exit',
        label: { past: 'Beyond the ritual chamber, reality thins. The walls breathe.', present: 'The boundary of the metaphysical space. Past and present dissolve here.' } },
    ],
    objects: [
      // --- ENTRANCE HALL ---
      { id: 'tomb_entrance_text', x: 22, y: 42, type: 'examine', eventId: null,
        label: {
          past: 'The walls are covered in text \u2014 not carved but written in ink that moves when observed indirectly.',
          present: 'The text on the walls writhes, more agitated now, like something alive and in pain.',
        } },
      { id: 'tomb_entrance_chest', x: 20, y: 40, type: 'chest', eventId: null,
        item: items.greater_mending,
        label: {
          past: 'A supply cache, tucked into an alcove.',
          present: 'A cache, undisturbed for seven years. The supplies inside still hold warmth.',
        } },

      // --- RECORD CHAMBER ---
      { id: 'tomb_records', x: 25, y: 31, type: 'discovery', eventId: 'tomb_records_found',
        forTimeline: 'past',
        label: {
          past: 'The Chamber of Records. Readable texts detailing the history of the ritual, the theory of identity consumption, and \u2014 critically \u2014 the binding technique.',
          present: 'Fragmented records, scrambled beyond reading. But if someone in the past could map them...',
        } },
      { id: 'tomb_records_examine', x: 23, y: 30, type: 'examine', eventId: null,
        label: {
          past: 'Research notes in several hands. The progression is clear: curiosity, excitement, justification, madness.',
          present: 'Scorched pages. One phrase repeats across dozens of fragments: "The cost is acceptable."',
        } },
      { id: 'tomb_records_chest', x: 27, y: 33, type: 'chest', eventId: null,
        item: items.ritual_text,
        label: {
          past: 'A sealed case containing a fragment of the binding ritual.',
          present: 'A case, cracked open by the ritual\'s detonation. The fragment inside glows faintly.',
        } },

      // --- CONFESSION HALLS ---
      { id: 'tomb_confession_1', x: 11, y: 24, type: 'confession', eventId: 'tomb_confession_cael',
        label: {
          past: 'A room with acoustic properties that force honesty. The walls ask: "What do you fear most?"',
          present: 'The room remembers. Whispers of past confessions echo from the stone \u2014 fears, justifications, the slow slide from preservation to consumption.',
        } },
      { id: 'tomb_confession_2', x: 39, y: 24, type: 'confession', eventId: 'tomb_confession_sable',
        label: {
          past: 'A second confession hall. The walls ask: "Whom have you failed?"',
          present: 'This room echoes with older confessions. Synod members\' voices, layered over years of deliberation. One voice is younger than the rest, uncertain.',
        } },

      // --- INQUISITOR NPC (before boss trigger) ---
      { id: 'tomb_inquisitor_npc', x: 25, y: 18, type: 'npc', eventId: null,
        label: { past: 'A young woman in Synod robes, barely older than a student. She blocks the stairway, trembling.', present: null },
        dialogue: {
          past: [
            '"You shouldn\'t be here. No one should be here."',
            '"I joined the Synod because I believed in preservation. In knowledge."',
            '"They told me the tests were necessary. That the volunteers understood."',
            '"I don\'t sleep anymore. I hear the volunteers in my dreams. They don\'t have words, but they scream."',
          ],
          present: null,
        } },

      // --- ENEMIES ---
      { id: 'tomb_enemy_scholar1', x: 22, y: 35, type: 'enemy', enemyId: 'corrupted_scholar',
        label: { past: 'A scholar who read too deeply, muttering fragments of forbidden text.', present: 'A hollowed scholar, still reciting words that burn the air around them.' } },
      { id: 'tomb_enemy_scholar2', x: 28, y: 25, type: 'enemy', enemyId: 'corrupted_scholar',
        label: { past: 'Another corrupted researcher, hands clawing at invisible pages.', present: 'A figure wreathed in stolen script, the text writhing across its skin.' } },
      { id: 'tomb_enemy_scholar3', x: 15, y: 15, type: 'enemy', enemyId: 'corrupted_scholar',
        label: { past: 'A scholar backed into a corner, speaking in tongues.', present: 'Corrupted knowledge given form, pacing the corridor in agitation.' } },

      // --- BOSS POSITIONS ---
      { id: 'tomb_inquisitor_boss', x: 25, y: 16, type: 'enemy', enemyId: 'synod_inquisitor',
        label: { past: 'The Inquisitor raises her hands. Ritual energy crackles between her fingers.', present: null } },
      { id: 'tomb_remnant_boss', x: 25, y: 14, type: 'enemy', enemyId: 'synod_remnant',
        label: { past: null, present: 'Five minds in one agonized form. The Synod Remnant radiates stolen memories like heat from a furnace.' } },

      // --- ECHO CHOICE ---
      { id: 'tomb_inquisitor_choice', x: 25, y: 17, type: 'echo_choice', eventId: 'tomb_inquisitor_echo',
        label: {
          past: 'The Inquisitor wavers. You could show her the evidence, or press past her by force.',
          present: 'Echoes of a confrontation linger here. Someone faced a terrible choice.',
        },
        choices: [
          { label: 'Show her the evidence', eventId: 'tomb_inquisitor_mercy',
            message: 'You offer everything you\'ve gathered. She reads. Goes pale. Goes still. Then nods.' },
          { label: 'Force your way through', eventId: 'tomb_inquisitor_force',
            message: 'There is no time for persuasion. You push forward. She raises her hands.' },
        ] },

      // --- DISCOVERIES ---
      { id: 'tomb_binding_text', x: 25, y: 5, type: 'discovery', eventId: 'tomb_binding_found',
        forTimeline: 'past',
        label: {
          past: 'The Archivist\'s private collection. And there \u2014 the preservation ward. A binding technique for protecting texts from erasure. Never meant for people.',
          present: 'Empty shelves. Whatever was here was taken on the last night. Used. Spent.',
        } },

      // --- EXIT ---
      { id: 'tomb_exit', x: 25, y: 1, type: 'exit', eventId: null,
        targetArea: 'act4_throne', targetSpawn: { x: 20, y: 38 },
        label: {
          past: 'Beyond this point, the architecture stops making sense. The walls are made of text.',
          present: 'The boundary dissolves. You step through and the timelines blur.',
        } },

      // --- SYNC RITUAL POINT ---
      { id: 'tomb_ritual_point', x: 25, y: 20, type: 'sync_ritual', eventId: 'tomb_ritual',
        label: {
          past: 'A circle of concentric script on the floor. It pulses with the rhythm of a heartbeat.',
          present: 'The circle is burned into the stone. But the heartbeat persists, faint and stubborn.',
        } },
    ],
  };

  // --- ACT 4: THE ASHEN THRONE ---

  const act4_throne = {
    id: 'act4_throne',
    name: 'The Ashen Throne',
    w: 40, h: 40,
    spawn: { x: 20, y: 38 },
    rooms: [
      { id: 'memory_corridor', x: 16, y: 28, template: ROOMS.throne_memory_corridor },
      { id: 'guilt_chamber', x: 6, y: 18, template: ROOMS.throne_guilt_chamber },
      { id: 'power_chamber', x: 26, y: 18, template: ROOMS.throne_power_chamber },
      { id: 'throne_room', x: 14, y: 8, template: ROOMS.throne_room },
    ],
    exits: [],
    objects: [
      // --- MEMORY CORRIDOR ---
      { id: 'throne_corridor_examine', x: 20, y: 33, type: 'examine', eventId: null,
        label: {
          past: 'A vast library with infinite shelves, every book open, every page turning. The stolen memories are here, preserved as text.',
          present: 'A vast silence with shapes in it \u2014 the negative space of every word, the outlines of memories viewed from the inside.',
        } },
      { id: 'throne_memory_fragment1', x: 18, y: 31, type: 'examine', eventId: null,
        label: {
          past: 'A book lies open. You read a page and live a merchant\'s wedding day. The joy is borrowed but it aches.',
          present: 'A shape in the silence. Press close and you feel the outline of a celebration you never attended.',
        } },
      { id: 'throne_memory_fragment2', x: 22, y: 35, type: 'examine', eventId: null,
        label: {
          past: 'Another book. A child\'s first word. A mother\'s face. The weight of ten thousand such moments threatens to drown you.',
          present: 'Another absence. The shape of a voice saying a name for the first time. The silence where love was.',
        } },

      // --- GUILT CHAMBER (Cael's Trial, past timeline) ---
      { id: 'throne_guilt_memory', x: 9, y: 21, type: 'trial', eventId: 'throne_guilt_trial',
        label: {
          past: 'The Unvoicing replays around you. Your perspective first \u2014 running, carrying a book and a terrified girl. Then from others. A merchant. A child. A guard. You feel what it is to lose yourself.',
          present: null,
        } },
      { id: 'throne_guilt_examine', x: 11, y: 20, type: 'examine', eventId: null,
        label: {
          past: 'You see yourself clearly for the first time. A thin, frightened scholar in borrowed steel. The armor was never yours. The sword was never yours. Only the guilt.',
          present: null,
        } },

      // --- POWER CHAMBER (Sable's Trial, present timeline) ---
      { id: 'throne_power_temptation', x: 29, y: 21, type: 'trial', eventId: 'throne_power_trial',
        label: {
          past: null,
          present: '"You are us," the silence says. "Every spell you cast, every ability you used \u2014 that was us. We are your power. Why would you give that up?"',
        } },
      { id: 'throne_power_examine', x: 31, y: 22, type: 'examine', eventId: null,
        label: {
          past: null,
          present: 'The Unvoicing offers itself like a gift. Total power. Every stolen identity as fuel. You could be a god of borrowed memories. The temptation is a warmth that feels like home.',
        } },

      // --- THRONE ROOM ---
      { id: 'throne_ashen_throne', x: 20, y: 12, type: 'throne_choice', eventId: 'throne_final_choice',
        label: {
          past: 'The Ashen Throne. A simple stone chair in a room made of every word ever spoken in Vaelthorne. It is warm here. It is beautiful. It is an ocean that wants you to drown.',
          present: 'The Ashen Throne. It radiates the power you have carried since the silence. It feels like coming home to a home you didn\'t know you had. It is cold. It is terrifying. It is yours.',
        } },

      // --- SYNC RITUAL POINT (final) ---
      { id: 'throne_ritual_point', x: 20, y: 14, type: 'sync_ritual', eventId: 'throne_final_ritual',
        label: {
          past: 'The final circle. Both timelines converge here. You feel the other presence \u2014 closer than ever, separated by seven years and a single choice.',
          present: 'The final circle. The timelines thin to nothing. Someone is here with you, on the other side of silence, waiting.',
        } },
    ],
  };

  // --- AREA REGISTRY ---

  const areas = {
    act1_athenaeum,
    act2_city,
    act3_tomb,
    act4_throne,
  };

  return { items, enemies, areas, ROOMS };
})();
