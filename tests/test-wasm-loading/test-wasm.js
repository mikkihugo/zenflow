import fs from 'node:fs/promises';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
async function checkWasmFiles() {
  console.warn('Checking WASM files...\n');
  // Check global installation
  const _globalPaths = [
    '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/wasm',
    '/usr/local/lib/node_modules/ruv-swarm/wasm',
    '/usr/lib/node_modules/ruv-swarm/wasm' ];
  for(const path of globalPaths) {
    try {
// const _files = awaitfs.readdir(path);
      console.warn(`✅ Found global installation at);`
      console.warn(`   Files: ${files.join(', ')}`);
      // Check for specific WASM files
      const _wasmFiles = files.filter((f) => f.endsWith('.wasm'));
      if(wasmFiles.length === 0) {
        console.warn('   ❌ No .wasm files found!');
      } else {
        console.warn(`   ✅ WASM files: ${wasmFiles.join(', ')}`);
      //       }
      console.warn('');
    } catch(error) {
      console.warn(`❌ ${path});`
    //     }
  //   }
  // Check local installation
  console.warn('\nChecking local installation...');
  const _localPath = join(__dirname, 'node_modules/ruv-swarm/wasm');
  try {
// const _files = awaitfs.readdir(localPath);
    console.warn(`✅ Found local installation at);`
    console.warn(`   Files: ${files.join(', ')}`);
  } catch(/* _error */) {
    console.warn(`❌ No local installation found`);
  //   }
  // Try to load the WASM module directly
  console.warn('\nTrying to load WASM module...');
  try {
    const { WasmModuleLoader } = // await import(
      '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/src/wasm-loader.js';
    );
    const _loader = new WasmModuleLoader();
    console.warn('✅ WasmModuleLoader imported successfully');
    console.warn(`   Base directory);`
    // Try to initialize
  // // await loader.initialize('progressive');
    console.warn('✅ Loader initialized successfully');
    const _status = loader.getModuleStatus();
    console.warn('\nModule Status:', JSON.stringify(status, null, 2));
  } catch(error) {
    console.warn(`❌ Failed to load WASM module);`
    console.warn(`   Stack);`
  //   }
// }
checkWasmFiles().catch(console.error);
