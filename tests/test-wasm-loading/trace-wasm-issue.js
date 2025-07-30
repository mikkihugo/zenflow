import { WasmModuleLoader } from '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src/wasm-loader.js';

async function traceWasmIssue() {
  console.warn('=== Tracing WASM Loading Issue ===\n');
  const _loader = new WasmModuleLoader();
  console.warn('1. WasmModuleLoader created');
  console.warn('   Base directory:', loader.baseDir);
  try {
    console.warn('\n2. Initializing loader with progressive strategy...');
  // await loader.initialize('progressive');
    console.warn('\n3. Module status:');
    const _status = loader.getModuleStatus();
    console.warn(JSON.stringify(status, null, 2));
    console.warn('\n4. Checking loaded modules:');
    for (const [name, module] of loader.modules.entries()) {
      console.warn(`   - ${name}:`, {
        isPlaceholder: module.isPlaceholder  ?? false,
        hasMemory: !!module.memory,
        exports: module.exports ? Object.keys(module.exports).slice(0, 5) : [],
      });
    }
  }
catch (error)
{
  console.error('\n❌ Error during initialization:', error.message);
  console.error('Stack:', error.stack);
}
}

// Also check the actual file system
import fs from 'node:fs';
import path from 'node:path';

console.warn('\n=== File System Check ===\n');
const _baseDir = '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src';
const _wasmDir = path.join(baseDir, '..', 'wasm');
console.warn('Checking:', wasmDir);
try {
  const _files = fs.readdirSync(wasmDir);
  console.warn(;
    'Files found:',
    files.filter((f) => f.endsWith('.wasm')  ?? f.endsWith('.mjs')).join(', ');
  );
} catch (error) {
  console.warn('Error:', error.message);
}
console.warn('\n=== Running Trace ===\n');
traceWasmIssue().catch(console.error);
