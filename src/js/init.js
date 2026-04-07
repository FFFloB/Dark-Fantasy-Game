// ============================================================
//  INITIALIZATION
// ============================================================

// Ember particles
(function () {
  const c = document.getElementById('embers');
  for (let i = 0; i < 15; i++) {
    const e = document.createElement('div');
    e.className = 'ember-particle';
    e.style.left = Math.random() * 100 + '%';
    e.style.bottom = '-10px';
    e.style.animationDelay = Math.random() * 4 + 's';
    e.style.animationDuration = (3 + Math.random() * 3) + 's';
    c.appendChild(e);
  }
})();

// Register service worker for PWA / offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    console.log('Service worker registered');
  }).catch(err => {
    console.log('Service worker not available (file:// mode?):', err.message);
  });
}

// Init QR scanner
Scanner.init().then(ok => {
  scannerReady = ok;
  if (!ok) console.log('BarcodeDetector not available — text fallback only');
});
