// ============================================================
//  ENDINGS — Calculate and display game endings
// ============================================================

const Endings = (() => {
  // Count mercy choices across all storyFlags
  function countMercy(storyFlags) {
    let mercy = 0, total = 0;
    for (const [key, val] of Object.entries(storyFlags)) {
      if (key.startsWith('mercy_')) {
        total++;
        if (val === 'mercy') mercy++;
      }
    }
    return { mercy, total, allMercy: total > 0 && mercy === total };
  }

  function calculate(state) {
    const myChoice = state.storyFlags.throne_choice; // 'sacrifice' or 'refuse'
    const partnerChoice = state.storyFlags.partner_throne_choice; // from glyph
    const bond = state.bond ? state.bond.level : 0;
    const { mercy, allMercy } = countMercy(state.storyFlags);

    // Ending 6: The Paradox (hidden, hardest)
    if (bond >= 100 && allMercy && myChoice === 'sacrifice' && partnerChoice === 'sacrifice') {
      return 'paradox';
    }
    // Ending 5: Strangers (low bond)
    if (bond < 40) return 'strangers';

    // Ending 3: Unbroken Binding (both sacrifice, high bond)
    if (myChoice === 'sacrifice' && partnerChoice === 'sacrifice' && bond >= 90) {
      return 'unbroken';
    }
    // Ending 4: Long Silence (neither sacrifices)
    if (myChoice === 'refuse' && partnerChoice === 'refuse') {
      return 'silence';
    }
    // Ending 1: Archivist's Last Act (knight sacrifices)
    if (myChoice === 'sacrifice' && state.character === 'knight' && bond >= 60) {
      return 'archivist';
    }
    if (partnerChoice === 'sacrifice' && state.character === 'whisper' && bond >= 60) {
      return 'archivist';
    }
    // Ending 2: Whisper Becomes Word (whisper sacrifices)
    if (myChoice === 'sacrifice' && state.character === 'whisper' && bond >= 60) {
      return 'whisper_word';
    }
    if (partnerChoice === 'sacrifice' && state.character === 'knight' && bond >= 60) {
      return 'whisper_word';
    }
    // Fallback
    return 'silence';
  }

  // Ending text per character perspective
  const ENDINGS = {
    archivist: {
      title: 'The Archivist\'s Last Act',
      knight: [
        'You sit upon the Ashen Throne.',
        'The armor dissolves. It was never yours.',
        'Beneath it: a scholar\'s robe, ink-stained and worn.',
        'Ten thousand lives pour into you — every joy, every grief, every name.',
        'You were always the keeper of knowledge.',
        'This is what you were meant to do. Not fight. Not fail.',
        'Hold.',
        'The kingdom stirs. Light returns to hollow eyes.',
        'You cannot see it. But you can feel them remembering.',
        'On a shelf in the restored Athenaeum, a book appears in your handwriting:',
        '"For Sable — everything I remember about you, so you\'ll know you were loved."',
      ],
      whisper: [
        'He sits on the Throne. The armor falls away.',
        'Underneath is not a warrior. It never was.',
        'A scholar. Tired. Kind. His eyes fill with stolen lives.',
        'The Hollowed shudder. Color seeps back into their faces.',
        'A baker remembers flour. A mother remembers a name.',
        'Your magic fades. The Unvoicing leaves you like a held breath released.',
        'The world is quieter now. But it is a warm quiet.',
        'In the Athenaeum, on the shelf where you once slept as a child,',
        'you find a book. His handwriting. Your name on the cover.',
        'You open it, and you remember everything.',
      ],
    },
    whisper_word: {
      title: 'The Whisper Becomes the Word',
      knight: [
        'She takes the Throne.',
        'The darkness doesn\'t consume her. She was always carrying it.',
        'The Unvoicing was inside her — a weapon, a wound, a voice waiting to speak.',
        'Now it speaks. Her voice, reading.',
        'Patient and gentle, like someone once read to her.',
        'The kingdom wakes to the sound of a young woman\'s voice.',
        'You stand in the restored Athenaeum, a scholar\'s robe on the desk.',
        'You put it on. It fits. It always did.',
        'From the shelves, her voice reads to you.',
        'You listen, and you remember everything.',
      ],
      whisper: [
        'You sit upon the Ashen Throne.',
        'The darkness rises to meet you. It has always been yours.',
        'Not a curse. Not a weapon. A voice.',
        'Ten thousand stolen words pour through you — and you give them back.',
        'Each name. Each memory. Each small, precious thing.',
        'You read them aloud, one by one, gentle and patient,',
        'the way someone once read to you.',
        'The kingdom wakes hearing your voice.',
        'You cannot see them. But you can feel them remembering.',
        'Somewhere, a man in a scholar\'s robe listens, and smiles.',
      ],
    },
    unbroken: {
      title: 'The Unbroken Binding',
      knight: [
        'You both sit the Throne.',
        'The split you created seven years ago — the desperate, loving wound —',
        'begins to close. Not into one person. Into something new.',
        'The Athenaeum glows. Warm light for the first time in seven years.',
        'Every shelf fills. Every page recovers its words.',
        'The building breathes.',
        'You are the library now. Both of you. A living place',
        'where every lost memory is kept safe.',
        'The Hollowed come. They sit. They read.',
        'They find themselves again, one page at a time.',
        'In the children\'s corner, a girl opens a book.',
        'From the shelves, a voice asks: "Would you like help with that one?"',
      ],
      whisper: [
        'You both sit the Throne.',
        'The binding that saved your life — that split a man in half for love —',
        'finally, gently, heals.',
        'Not into who you were. Into what you both became.',
        'The Athenaeum fills with light. Books open themselves.',
        'The silence breaks — not with a scream, but with a whisper.',
        'Your whisper. His whisper. The same voice, finally.',
        'The Hollowed wander in. Sit down. Pick up a book.',
        'And remember.',
        'In the children\'s corner, you see a girl who looks like you once did.',
        'She opens a book. From somewhere in the shelves:',
        '"Would you like help with that one?"',
      ],
    },
    silence: {
      title: 'The Long Silence',
      knight: [
        'You look at the Throne. At the weight of ten thousand lives.',
        'And you turn away.',
        '"I already lost her once," you think.',
        '"I won\'t choose duty over her again."',
        'You walk out of the Ashen Throne room.',
        'The kingdom stays silent. The Hollowed keep wandering.',
        'But beside you walks someone who sees you clearly.',
        'And you see her.',
        'The Athenaeum\'s windows are dark behind you.',
        'The silence is heavier now. But it is shared.',
      ],
      whisper: [
        'The Throne waits. The power calls.',
        'You could take it. Become the voice.',
        'But you are tired of carrying what others broke.',
        'You turn away.',
        'He walks beside you. You don\'t know why that feels right.',
        'The city is behind you. The silence follows.',
        'But for once, the silence isn\'t empty.',
        'Someone is walking next to you.',
        'And that is enough. It has to be enough.',
      ],
    },
    strangers: {
      title: 'Strangers',
      knight: [
        'You reach for the Throne — or turn away. It doesn\'t matter.',
        'The binding was never completed. Half a soul cannot mend a world.',
        'You stumble out of the Throne room, confused.',
        'The armor feels heavier than ever.',
        'You can\'t remember why you came here.',
        'There was someone... a companion...',
        'But the name won\'t come.',
        'The silence feels heavier today.',
        'Like it\'s waiting for something you were supposed to say.',
      ],
      whisper: [
        'The Throne pulses. Your magic surges.',
        'But the power has no anchor. No second half.',
        'The ritual fails. The memories stay stolen.',
        'You walk out alone. The magic crackles in your hands,',
        'destructive and purposeless.',
        'There was a man in armor. You think.',
        'He seemed familiar. But you can\'t place him.',
        'The world remains silent.',
        'You remain powerful, and incomplete.',
      ],
    },
    paradox: {
      title: 'The Paradox',
      knight: [
        'You both sit the Throne.',
        'But something is different this time.',
        'Every enemy you faced — you showed mercy.',
        'Every life you could have ended — you let stand.',
        'Every fragment of compassion you exchanged across time —',
        'it wasn\'t just kind. It was structural.',
        'The Throne cracks.',
        'Light pours from the fractures — not stolen light. Returned light.',
        'The memories don\'t need a keeper. They never did.',
        'They needed permission to go home.',
        'The Throne shatters. The memories rise like pages caught in wind.',
        'Each one finds its owner. Each name returns to its face.',
        'You stand in the ruins of the Throne room. Whole. Separate. Free.',
        'Scholar\'s robes. Ink-stained hands. Your own face in the mirror.',
        'In the Athenaeum, a girl sits reading in the children\'s corner.',
        'You walk over.',
        '"Would you like help with that one?"',
        'She looks up. She smiles.',
        'She knows your name.',
      ],
      whisper: [
        'You both sit the Throne.',
        'But the pattern is different. Every thread of mercy,',
        'every glyph exchanged, every moment of trust —',
        'they weren\'t just choices. They were architecture.',
        'The Throne cracks.',
        'Your magic — the Unvoicing — flows outward. But gently.',
        'Not as a weapon. As a return.',
        'Every stolen voice flows back to its throat.',
        'Every lost name settles into its bones.',
        'The Throne shatters. You don\'t need to carry this.',
        'Nobody needs to carry this.',
        'You stand in the ruins. Free. Whole. Yourself.',
        'The Athenaeum glows around you. Books open. Candles light.',
        'You walk to the children\'s corner. Your corner.',
        'You sit down. Pick up a book.',
        'A voice from behind you — patient, gentle, stumbling over the dramatic parts:',
        '"Would you like help with that one?"',
        'You look up.',
        'You know his name.',
      ],
    },
  };

  function show(endingId, state) {
    const ending = ENDINGS[endingId];
    if (!ending) return;

    const charKey = state.character === 'knight' ? 'knight' : 'whisper';
    const lines = [
      '— ' + ending.title + ' —',
      '',
      ...(ending[charKey] || ending.knight),
      '',
      '— The End —',
    ];

    Dialogue.show(lines, () => {
      // After ending, show credits/reset option
      addGlyphLogEntry('The story is complete.', 'system');
      addGlyphLogEntry('Ending: ' + ending.title, 'generated');
    });
  }

  return { calculate, show, countMercy };
})();
