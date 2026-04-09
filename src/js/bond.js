// ============================================================
//  BOND — Bond meter and vision scene triggers
// ============================================================

const Bond = (() => {
  const LABELS = [
    [0, 'Strangers'],
    [20, 'Allies'],
    [40, 'Recognized'],
    [60, 'Unraveling'],
    [80, 'Whole'],
  ];

  // Vision scenes at bond thresholds
  // character: null = both see it, 'knight' or 'whisper' = only that character
  const VISIONS = [
    { threshold: 20, character: null, title: 'A Shared Memory',
      lines: [
        'A flash of warmth—',
        'You see a vast library, shelves reaching to cathedral ceilings.',
        'Lamplight pools on ancient wood. The smell of old paper and candle wax.',
        'It feels like home. You don\'t know why.',
        'The vision fades.'] },
    { threshold: 40, character: 'knight', title: 'The Girl',
      lines: [
        'A vision surfaces, unbidden—',
        'A young girl, reading by candlelight.',
        'Her lips move silently, tracing the words.',
        'You feel a tenderness so fierce it hurts.',
        'You don\'t know who she is. But you would do anything for her.',
        'The vision fades, leaving warmth behind.'] },
    { threshold: 40, character: 'whisper', title: 'The Voice',
      lines: [
        'A sound reaches you from nowhere—',
        'A voice, reading aloud. Patient. Gentle.',
        'It stumbles over the dramatic parts, and someone laughs.',
        'The laugh is yours. You are sure of it.',
        'But you can\'t see the reader\'s face.',
        'The sound fades, leaving silence heavier than before.'] },
    { threshold: 60, character: null, title: 'The Night',
      lines: [
        'The world goes white—',
        'You see a ritual circle, blazing with stolen light.',
        'Figures in robes, chanting. The air screams.',
        'Someone is running toward the light.',
        'Someone else is being wrapped in something warm, even as the world ends.',
        'Then silence. The silence that ate everything.',
        'You return to yourself, shaking.'] },
    { threshold: 70, character: null, title: 'The Unraveling',
      lines: [
        'The vision is different this time. Sharper. Closer.',
        'You see the ritual from INSIDE the circle.',
        'Five robed figures, hands raised, mouths forming words that eat meaning.',
        'A man runs toward them. He is not armed. He carries a book.',
        'He reaches for one of the figures — the youngest — and screams something.',
        'The youngest hesitates. The ritual stutters.',
        'But it does not stop.',
        'The man turns. He sees a girl, frozen at the edge of the light.',
        'He runs to her. He wraps something around her — not cloth. Not light.',
        'Himself. He wraps himself around her.',
        'The world goes silent.',
        'You understand now. The enemies. The hollow faces.',
        'They were people. All of them. Every one you fought.',
        'You return to yourself. The knowledge sits heavy as stone.'] },
    { threshold: 80, character: 'knight', title: 'The Truth',
      lines: [
        'Memory crashes over you like a wave—',
        'You remember. All of it.',
        'You were not a knight. You were never a knight.',
        'You were a scholar. A keeper of books. This armor isn\'t yours.',
        'You remember finding the forbidden texts. Confronting them. Failing.',
        'You remember the girl. Your apprentice. The closest thing to—',
        'You split yourself to save her. Tore your own mind in half.',
        'The guilt is staggering. The love is worse.',
        'You remember everything, and you wish you didn\'t.'] },
    { threshold: 90, character: 'whisper', title: 'The Name',
      lines: [
        'A name surfaces from the deep—',
        'You remember him. Not the armored figure walking beside you.',
        'A kind, bookish man who taught you to read.',
        'Who gave you a home when you had none.',
        'Who stumbled over the dramatic parts of stories, and made you laugh.',
        'He sacrificed half of himself so you would survive.',
        'The power you carry — your magic — it\'s not a gift.',
        'It\'s the scar of what he couldn\'t prevent.',
        'You know his name now. And it changes everything.'] },
  ];

  function init(level) {
    return {
      level: level || 0,
      exchanges: 0,
      visionsSeen: [],
    };
  }

  function increase(bondState, amount, character) {
    bondState.level = Math.min(100, bondState.level + amount);
    bondState.exchanges++;

    // Check for vision triggers
    for (const v of VISIONS) {
      if (bondState.level >= v.threshold && !bondState.visionsSeen.includes(v.threshold + ':' + (v.character || 'all'))) {
        if (v.character === null || v.character === character) {
          bondState.visionsSeen.push(v.threshold + ':' + (v.character || 'all'));
          return { title: v.title, lines: v.lines, threshold: v.threshold };
        }
      }
    }
    return null;
  }

  function getLabel(bondState) {
    if (!bondState) return 'Strangers';
    let label = 'Strangers';
    for (const [threshold, name] of LABELS) {
      if (bondState.level >= threshold) label = name;
    }
    return label;
  }

  return { init, increase, getLabel, LABELS };
})();
