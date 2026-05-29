// Minimal pre-sync step. The bundled www/ is a small offline fallback shell —
// the live app loads https://egocore.ai/ via capacitor.config.ts -> server.url.
// Add any web bundling here later (e.g. esbuild for the shell), then run `cap sync`.
const fs = require('node:fs');
const path = require('node:path');

const wwwIndex = path.join(__dirname, '..', 'www', 'index.html');
if (!fs.existsSync(wwwIndex)) {
  console.error('Missing www/index.html — the offline fallback shell.');
  process.exit(1);
}
console.log('www/ is ready.');
