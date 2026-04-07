// ============================================================
//  WebRTC CONNECTION MANAGER
// ============================================================

let role = null;
let pc = null;
let dataChannel = null;
let connected = false;
let scannerReady = false;

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

function showScreen(id) {
  document.querySelectorAll('#app > div').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function setupPeerConnection() {
  pc = new RTCPeerConnection(rtcConfig);
  pc.oniceconnectionstatechange = () => {
    const s = pc.iceConnectionState;
    if (s === 'connected' || s === 'completed') onConnected();
    if (s === 'disconnected' || s === 'failed') onDisconnected();
  };
  return pc;
}

function setupDataChannel(channel) {
  dataChannel = channel;
  dataChannel.onopen = () => onConnected();
  dataChannel.onclose = () => onDisconnected();
  dataChannel.onmessage = (e) => handleMessage(JSON.parse(e.data));
}

function waitForICE(timeout = 5000) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const timer = setTimeout(resolve, timeout);
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') { clearTimeout(timer); resolve(); }
    };
  });
}

// Pack SDP into a base64url string (used for both QR and text codes)
function packSDPToCode(sdp, type) {
  const packed = SDP.pack(sdp, type);
  return SDP.toBase64(packed);
}

// Unpack a base64url code back to SDP
function unpackCodeToSDP(code) {
  const data = SDP.fromBase64(code);
  return SDP.unpack(data);
}

// Copy text to clipboard with visual feedback
async function copyToClipboard(text, btnEl) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btnEl.textContent;
    btnEl.textContent = 'Copied!';
    setTimeout(() => btnEl.textContent = orig, 1500);
  } catch {
    const input = btnEl.previousElementSibling;
    if (input && input.tagName === 'INPUT') {
      input.select();
      input.setSelectionRange(0, 99999);
    }
  }
}

// --- HOST ---

async function startHost() {
  role = 'host';
  showScreen('screen-host-qr');

  setupPeerConnection();
  const channel = pc.createDataChannel('game', { ordered: true });
  setupDataChannel(channel);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForICE();

  const code = packSDPToCode(pc.localDescription.sdp, 'offer');
  console.log(`Connection code: ${code.length} chars`);

  // QR contains the same base64url string as the text code
  QR.render(document.getElementById('qr-offer'), QR.encode(code), 6);
  document.getElementById('host-offer-text').value = code;

  document.getElementById('host-qr-status').innerHTML =
    `<div class="status-dot connected"></div><span>QR ready! Waiting for other player...</span>`;
}

async function hostStartScan() {
  const videoEl = document.getElementById('host-video');
  document.getElementById('host-scanner').classList.remove('hidden');

  if (!scannerReady) {
    showScanError('host-scanner', 'Camera scanning not available. Use text code below.');
    return;
  }

  const camOK = await Scanner.startCamera(videoEl);
  if (!camOK) {
    showScanError('host-scanner', 'Camera access denied. Use text code below.');
    return;
  }
  Scanner.scan(videoEl, (result) => processAnswerCode(result));
}

function showScanError(containerId, msg) {
  const el = document.getElementById(containerId);
  const existing = el.querySelector('.scan-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'scan-error';
  div.style.cssText = 'color: var(--ember); font-size: 0.85em; padding: 10px; text-align: center;';
  div.textContent = msg;
  el.appendChild(div);
}

async function processAnswerCode(code) {
  try {
    const { sdp } = unpackCodeToSDP(code);
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
  } catch (e) {
    console.error('Invalid answer:', e);
    alert('Invalid response code. Check the code and try again.');
  }
}

function acceptAnswerText() {
  const input = document.getElementById('input-answer').value.trim();
  if (input) processAnswerCode(input);
}

function copyHostCode() {
  const input = document.getElementById('host-offer-text');
  const btn = document.getElementById('btn-copy-host');
  copyToClipboard(input.value, btn);
}

// --- GUEST ---

async function startJoinScan() {
  role = 'guest';
  showScreen('screen-guest-scan');

  if (!scannerReady) {
    document.getElementById('guest-scan-status').innerHTML =
      `<div class="status-dot error"></div><span>Camera scanning not available — paste the host's code below</span>`;
    return;
  }

  const videoEl = document.getElementById('guest-video');
  const camOK = await Scanner.startCamera(videoEl);
  if (!camOK) {
    document.getElementById('guest-scan-status').innerHTML =
      `<div class="status-dot error"></div><span>Camera access denied — paste the host's code below</span>`;
    return;
  }
  Scanner.scan(videoEl, (result) => processOfferCode(result));
}

async function processOfferCode(code) {
  try {
    const { sdp } = unpackCodeToSDP(code);

    setupPeerConnection();
    pc.ondatachannel = (e) => setupDataChannel(e.channel);

    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForICE();

    const answerCode = packSDPToCode(pc.localDescription.sdp, 'answer');

    showScreen('screen-guest-qr');
    QR.render(document.getElementById('qr-answer'), QR.encode(answerCode), 6);
    document.getElementById('guest-answer-text').value = answerCode;
  } catch (e) {
    console.error('Invalid offer:', e);
    document.getElementById('guest-scan-status').innerHTML =
      `<div class="status-dot error"></div><span>Invalid code — check and try again</span>`;
  }
}

function joinWithText() {
  const input = document.getElementById('input-offer').value.trim();
  if (input) processOfferCode(input);
}

function copyGuestCode() {
  const input = document.getElementById('guest-answer-text');
  const btn = document.getElementById('btn-copy-guest');
  copyToClipboard(input.value, btn);
}

// --- EVENTS ---

function onConnected() {
  if (connected) return;
  connected = true;

  Scanner.stopCamera(document.getElementById('host-video'));
  Scanner.stopCamera(document.getElementById('guest-video'));

  // Keep screen awake during gameplay
  WakeLock.request();

  // Remember role for reconnect
  Persist.saveSession({ role });

  showScreen('screen-connected');
  document.getElementById('role-label').textContent =
    role === 'host' ? 'The Hollow Knight' : 'The Pale Whisper';

  logMessage('Connection established.', 'success');
  logMessage(`You are: ${role === 'host' ? 'The Hollow Knight' : 'The Pale Whisper'}`, 'system');
  logMessage('The bond between two souls is forged...', 'system');

  drawTestScene();

  sendData({
    type: 'system',
    message: `${role === 'host' ? 'The Hollow Knight' : 'The Pale Whisper'} has arrived.`
  });
}

function onDisconnected() {
  connected = false;
  WakeLock.release();
  const dot = document.getElementById('conn-dot');
  const status = document.getElementById('conn-status');
  if (dot) dot.className = 'status-dot error';
  if (status) status.textContent = 'Disconnected — refresh to reconnect';
  logMessage('Connection lost.', 'error');
}

// Check for previous session on page load — show reconnect option
function checkPreviousSession() {
  const session = Persist.loadSession();
  if (session && session.role) {
    const panel = document.querySelector('#screen-title .panel');
    const reconnBtn = document.createElement('button');
    reconnBtn.textContent = `Reconnect as ${session.role === 'host' ? 'Host (Hollow Knight)' : 'Guest (Pale Whisper)'}`;
    reconnBtn.className = 'primary';
    reconnBtn.style.marginBottom = '8px';
    reconnBtn.onclick = () => {
      if (session.role === 'host') startHost();
      else startJoinScan();
    };
    panel.insertBefore(reconnBtn, panel.firstChild);

    const newBtn = document.createElement('button');
    newBtn.textContent = 'New Game';
    newBtn.className = 'small';
    newBtn.style.marginTop = '4px';
    newBtn.onclick = () => { Persist.clearSession(); location.reload(); };
    panel.appendChild(newBtn);
  }
}
