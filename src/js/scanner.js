// ============================================================
//  QR SCANNER — BarcodeDetector API with camera
// ============================================================

const Scanner = (() => {
  let stream = null;
  let detector = null;
  let scanning = false;
  let animFrame = null;

  async function init() {
    if ('BarcodeDetector' in window) {
      const formats = await BarcodeDetector.getSupportedFormats();
      if (formats.includes('qr_code')) {
        detector = new BarcodeDetector({ formats: ['qr_code'] });
        return true;
      }
    }
    return false;
  }

  async function startCamera(videoEl) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      videoEl.srcObject = stream;
      await videoEl.play();
      return true;
    } catch (e) {
      console.error('Camera access denied:', e);
      return false;
    }
  }

  function stopCamera(videoEl) {
    scanning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    if (videoEl) videoEl.srcObject = null;
  }

  async function scan(videoEl, onResult) {
    if (!detector) return;
    scanning = true;

    const tick = async () => {
      if (!scanning) return;
      if (videoEl.readyState >= 2) {
        try {
          const results = await detector.detect(videoEl);
          if (results.length > 0) {
            scanning = false;
            stopCamera(videoEl);
            onResult(results[0].rawValue);
            return;
          }
        } catch (e) { /* ignore detection errors */ }
      }
      animFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  return { init, startCamera, stopCamera, scan };
})();
