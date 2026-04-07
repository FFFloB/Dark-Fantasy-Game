// ============================================================
//  PERSISTENCE — Save/restore game state across reconnects
// ============================================================

const Persist = (() => {
  const KEY = 'ashen-bond-session';

  function saveSession(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function clearSession() {
    localStorage.removeItem(KEY);
  }

  return { saveSession, loadSession, clearSession };
})();
