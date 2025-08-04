/**
 * List all WASM imports
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listAllImports() {
  const wasmPath = path.join(__dirname, '..', 'wasm', 'ruv_swarm_wasm_bg.wasm');
  const wasmBuffer = await fs.readFile(wasmPath);
  const module = await WebAssembly.compile(wasmBuffer);
  const imports = WebAssembly.Module.imports(module);
  imports.forEach((_imp, _i) => {});
}

listAllImports();
