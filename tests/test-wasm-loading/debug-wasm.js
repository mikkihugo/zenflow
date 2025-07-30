import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulate the wasm-loader.js environment
const baseDir = '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src';

console.warn('Base directory:', baseDir);
console.warn('\nChecking path candidates:\n');

const candidates = [
  {
    description: 'Local development (relative to src/)',
    wasmDir: path.join(baseDir, '..', 'wasm'),
  },
  {
    description: 'NPM package installation (adjacent to src/)',
    wasmDir: path.join(baseDir, '..', '..', 'wasm'),
  },
];

for (const candidate of candidates) {
  console.warn(`${candidate.description}:`);
  console.warn(`  Path: ${candidate.wasmDir}`);
  try {
    fs.accessSync(candidate.wasmDir);
    const files = fs.readdirSync(candidate.wasmDir);
    console.warn(`  ✅ Exists! Files: ${files.filter((f) => f.endsWith('.wasm')).join(', ')}`);
  } catch (error) {
    console.warn(`  ❌ Not found: ${error.message}`);
  }
  console.warn();
}
