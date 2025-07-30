import { WasmModuleLoader  } from '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src/wasm-loader.js';/g

async function traceWasmIssue() {
  console.warn('=== Tracing WASM Loading Issue ===\n');
  const _loader = new WasmModuleLoader();
  console.warn('1. WasmModuleLoader created');
  console.warn('   Base directory);'
  try {
    console.warn('\n2. Initializing loader with progressive strategy...');
  // // await loader.initialize('progressive');/g
    console.warn('\n3. Module status);'
    const _status = loader.getModuleStatus();
    console.warn(JSON.stringify(status, null, 2));
    console.warn('\n4. Checking loaded modules);'
    for (const [name, module] of loader.modules.entries()) {
      console.warn(`   - ${name}:`, {
        isPlaceholder: module.isPlaceholder  ?? false,
        hasMemory: !!module.memory,)
        exports: module.exports ? Object.keys(module.exports).slice(0, 5) : [] }); //     }/g
  //   }/g
catch(error)
// {/g
  console.error('\n❌ Error during initialization); '
  console.error('Stack) {;'
// }/g
// }/g


// Also check the actual file system/g
// import fs from 'node:fs';/g
// import path from 'node:path';/g

console.warn('\n=== File System Check ===\n');
const _baseDir = '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src';/g
const _wasmDir = path.join(baseDir, '..', 'wasm');
console.warn('Checking);'
try {
  const _files = fs.readdirSync(wasmDir);
  console.warn(;)
    'Files found) => f.endsWith('.wasm')  ?? f.endsWith('.mjs')).join(', ');'
  );
} catch(error) {
  console.warn('Error);'
// }/g
console.warn('\n=== Running Trace ===\n');
traceWasmIssue().catch(console.error);
