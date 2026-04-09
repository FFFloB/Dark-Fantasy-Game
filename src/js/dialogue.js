// ============================================================
//  DIALOGUE — Modal text display and choice selection
// ============================================================

const Dialogue = (() => {
  let active = false;
  let lines = [];
  let lineIndex = 0;
  let onComplete = null;
  let choiceCallback = null;

  function show(textLines, callback) {
    if (!textLines || textLines.length === 0) return;
    lines = textLines;
    lineIndex = 0;
    onComplete = callback || null;
    choiceCallback = null;
    active = true;
    renderLine();
    showOverlay();
  }

  function showChoice(prompt, options, onSelect) {
    active = true;
    choiceCallback = onSelect;
    const overlay = getOverlay();
    overlay.classList.remove('hidden');
    overlay.innerHTML = '';

    const promptEl = document.createElement('div');
    promptEl.className = 'dialogue-text';
    promptEl.textContent = prompt;
    overlay.appendChild(promptEl);

    const choicesEl = document.createElement('div');
    choicesEl.className = 'dialogue-choices';
    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-choice-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        close();
        if (choiceCallback) choiceCallback(idx);
      };
      choicesEl.appendChild(btn);
    });
    overlay.appendChild(choicesEl);
  }

  function advance() {
    if (!active || choiceCallback) return; // choices handled by buttons
    lineIndex++;
    if (lineIndex >= lines.length) {
      close();
      if (onComplete) onComplete();
    } else {
      renderLine();
    }
  }

  function renderLine() {
    const overlay = getOverlay();
    overlay.innerHTML = '';

    const textEl = document.createElement('div');
    textEl.className = 'dialogue-text';
    textEl.textContent = lines[lineIndex];
    overlay.appendChild(textEl);

    const hint = document.createElement('div');
    hint.className = 'dialogue-hint';
    hint.textContent = lineIndex < lines.length - 1 ? 'tap to continue...' : 'tap to close';
    overlay.appendChild(hint);
  }

  function showOverlay() {
    getOverlay().classList.remove('hidden');
  }

  function close() {
    active = false;
    lines = [];
    lineIndex = 0;
    choiceCallback = null;
    getOverlay().classList.add('hidden');
  }

  function getOverlay() {
    let el = document.getElementById('dialogue-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dialogue-overlay';
      el.className = 'dialogue-overlay hidden';
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        advance();
      });
      document.getElementById('app').appendChild(el);
    }
    return el;
  }

  function isActive() { return active; }

  return { show, showChoice, advance, close, isActive };
})();
