// ============================================================
//  SDP COMPRESSION — Pack/unpack WebRTC SDP into minimal binary
// ============================================================

const SDP = (() => {
  function extractField(sdp, field) {
    const re = new RegExp('a=' + field + ':(.+?)[\r\n]');
    const m = sdp.match(re);
    return m ? m[1].trim() : '';
  }

  function extractCandidates(sdp) {
    const candidates = [];
    const re = /a=candidate:(\S+)\s+(\d+)\s+(\w+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+typ\s+(\w+)/g;
    let m;
    while ((m = re.exec(sdp)) !== null) {
      if (m[5].includes(':')) continue; // skip IPv6
      candidates.push({
        foundation: m[1],
        component: parseInt(m[2]),
        transport: m[3],
        priority: parseInt(m[4]),
        ip: m[5],
        port: parseInt(m[6]),
        type: m[7]
      });
    }
    return candidates;
  }

  function pack(sdp, type) {
    const ufrag = extractField(sdp, 'ice-ufrag');
    const pwd = extractField(sdp, 'ice-pwd');
    const fpLine = extractField(sdp, 'fingerprint');
    const setup = extractField(sdp, 'setup');
    const candidates = extractCandidates(sdp);

    const fpHex = fpLine.split(' ')[1] || '';
    const fpBytes = fpHex.split(':').map(h => parseInt(h, 16));
    const setupVal = { actpass: 0, active: 1, passive: 2 }[setup] || 0;

    const parts = [];
    // Byte 0: flags
    parts.push((type === 'offer' ? 0 : 1) | (setupVal << 1) | (Math.min(candidates.length, 31) << 3));

    // ufrag
    const ufragBytes = new TextEncoder().encode(ufrag);
    parts.push(ufragBytes.length);
    for (const b of ufragBytes) parts.push(b);

    // pwd
    const pwdBytes = new TextEncoder().encode(pwd);
    parts.push(pwdBytes.length);
    for (const b of pwdBytes) parts.push(b);

    // fingerprint (32 bytes)
    for (let i = 0; i < 32; i++) parts.push(fpBytes[i] || 0);

    // candidates
    for (const c of candidates) {
      const ipParts = c.ip.split('.').map(Number);
      for (const p of ipParts) parts.push(p);
      parts.push((c.port >> 8) & 0xff);
      parts.push(c.port & 0xff);
      parts.push((c.priority >> 24) & 0xff);
      parts.push((c.priority >> 16) & 0xff);
      parts.push((c.priority >> 8) & 0xff);
      parts.push(c.priority & 0xff);
      parts.push({ host: 0, srflx: 1, relay: 2 }[c.type] || 0);
    }

    return new Uint8Array(parts);
  }

  function unpack(data) {
    let i = 0;
    const flags = data[i++];
    const type = (flags & 1) ? 'answer' : 'offer';
    const setupVal = (flags >> 1) & 3;
    const numCandidates = (flags >> 3) & 31;
    const setup = ['actpass', 'active', 'passive'][setupVal];

    const ufragLen = data[i++];
    const ufrag = new TextDecoder().decode(data.slice(i, i + ufragLen)); i += ufragLen;
    const pwdLen = data[i++];
    const pwd = new TextDecoder().decode(data.slice(i, i + pwdLen)); i += pwdLen;

    const fpBytes = data.slice(i, i + 32); i += 32;
    const fp = 'sha-256 ' + Array.from(fpBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

    const candidates = [];
    for (let c = 0; c < numCandidates; c++) {
      const ip = `${data[i]}.${data[i+1]}.${data[i+2]}.${data[i+3]}`; i += 4;
      const port = (data[i] << 8) | data[i+1]; i += 2;
      const priority = (data[i] << 24) | (data[i+1] << 16) | (data[i+2] << 8) | data[i+3]; i += 4;
      const cType = ['host', 'srflx', 'relay'][data[i++]] || 'host';
      candidates.push({ ip, port, priority: priority >>> 0, type: cType });
    }

    let sdp = 'v=0\r\n';
    sdp += 'o=- 1 1 IN IP4 0.0.0.0\r\n';
    sdp += 's=-\r\n';
    sdp += 't=0 0\r\n';
    sdp += 'a=group:BUNDLE 0\r\n';
    sdp += 'a=msid-semantic: WMS\r\n';
    sdp += 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n';
    sdp += 'c=IN IP4 0.0.0.0\r\n';
    sdp += `a=ice-ufrag:${ufrag}\r\n`;
    sdp += `a=ice-pwd:${pwd}\r\n`;
    sdp += 'a=ice-options:trickle\r\n';
    sdp += `a=fingerprint:${fp}\r\n`;
    sdp += `a=setup:${setup}\r\n`;
    sdp += 'a=mid:0\r\n';
    sdp += 'a=sctp-port:5000\r\n';
    sdp += 'a=max-message-size:262144\r\n';

    for (let c = 0; c < candidates.length; c++) {
      const cand = candidates[c];
      sdp += `a=candidate:${c + 1} 1 udp ${cand.priority} ${cand.ip} ${cand.port} typ ${cand.type}\r\n`;
    }

    return { sdp, type };
  }

  function toBase64(data) {
    let binary = '';
    for (const b of data) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
    const binary = atob(padded);
    const data = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
    return data;
  }

  return { pack, unpack, toBase64, fromBase64 };
})();
