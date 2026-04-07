#!/usr/bin/env node

// ============================================================
//  BUILD SCRIPT — Bundles src/ into a single dist/index.html
//  Usage: node build.js [--watch]
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');
const NODE_MODULES = path.join(__dirname, 'node_modules');

// Vendor libraries to inline before our code
const VENDOR_FILES = [
  path.join(NODE_MODULES, 'qrcode-generator', 'dist', 'qrcode.js'),
];

// JS files in load order (dependencies first)
const JS_FILES = [
  'js/qr.js',
  'js/sdp.js',
  'js/scanner.js',
  'js/renderer.js',
  'js/messaging.js',
  'js/connection.js',
  'js/init.js',
];

const CSS_FILES = [
  'css/styles.css',
];

function build() {
  const start = Date.now();

  // Read HTML template
  let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');

  // Bundle CSS
  const css = CSS_FILES
    .map(f => fs.readFileSync(path.join(SRC, f), 'utf8'))
    .join('\n');

  // Bundle JS — vendor libs first, then our code
  // Escape </script> in vendor code to prevent premature tag closure
  const vendorJS = VENDOR_FILES
    .map(f => {
      const content = fs.readFileSync(f, 'utf8').replace(/<\/script>/gi, '<\\/script>');
      return `// --- vendor: ${path.basename(f)} ---\n${content}`;
    })
    .join('\n\n');

  const appJS = JS_FILES
    .map(f => {
      const content = fs.readFileSync(path.join(SRC, f), 'utf8');
      return `// --- ${f} ---\n${content}`;
    })
    .join('\n\n');

  const js = vendorJS + '\n\n' + appJS;

  // Version string: short git hash + build timestamp
  let gitHash = 'dev';
  try { gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch {}
  const buildTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16);
  const version = `v${gitHash} @ ${buildTime}`;

  // Inject into template (use split/join to avoid $ replacement issues in .replace())
  html = html.split('/* __CSS__ */').join(css);
  html = html.split('/* __JS__ */').join(js);
  html = html.split('/* __VERSION__ */').join(version);

  // Ensure dist/ exists
  fs.mkdirSync(DIST, { recursive: true });

  // Write output
  const outPath = path.join(DIST, 'index.html');
  fs.writeFileSync(outPath, html);

  // Copy PWA assets
  for (const asset of ['manifest.json', 'sw.js']) {
    fs.copyFileSync(path.join(SRC, asset), path.join(DIST, asset));
  }

  const size = Buffer.byteLength(html, 'utf8');
  const elapsed = Date.now() - start;
  console.log(`Built dist/index.html (${(size / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

// Initial build
build();

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('Watching for changes...');

  const watchDirs = [
    path.join(SRC, 'js'),
    path.join(SRC, 'css'),
    SRC,
  ];

  let debounce = null;
  for (const dir of watchDirs) {
    fs.watch(dir, { recursive: false }, () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        try { build(); } catch (e) { console.error('Build error:', e.message); }
      }, 100);
    });
  }
}
