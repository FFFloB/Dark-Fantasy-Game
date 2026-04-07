// ============================================================
//  MESSAGING & CHAT
// ============================================================

function sendData(data) {
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(JSON.stringify(data));
  }
}

function handleMessage(data) {
  switch (data.type) {
    case 'chat':
      logMessage(`${role === 'host' ? 'Pale Whisper' : 'Hollow Knight'}: ${data.message}`, 'peer');
      break;
    case 'system':
      logMessage(data.message, 'system');
      break;
    case 'game-state':
      break;
    case 'game-action':
      break;
  }
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  logMessage(`${role === 'host' ? 'Hollow Knight' : 'Pale Whisper'} (you): ${msg}`, 'peer');
  sendData({ type: 'chat', message: msg });
  input.value = '';
}

function logMessage(text, type = '') {
  const log = document.getElementById('message-log');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = 'log-entry ' + type;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  entry.textContent = `[${time}] ${text}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}
