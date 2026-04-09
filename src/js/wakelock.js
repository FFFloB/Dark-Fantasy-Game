// ============================================================
//  WAKE LOCK — Prevent screen from turning off during gameplay
// ============================================================

const WakeLock = (() => {
  let lock = null;

  async function request() {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported');
      return false;
    }
    try {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => {
        console.log('Wake lock released');
        lock = null;
      });
      console.log('Wake lock acquired — screen will stay on');
      return true;
    } catch (e) {
      console.log('Wake lock failed:', e.message);
      return false;
    }
  }

  function release() {
    if (lock) {
      lock.release();
      lock = null;
    }
  }

  // Re-acquire wake lock when page becomes visible again
  // (lock is automatically released when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !lock) {
      request();
    }
  });

  return { request, release };
})();
