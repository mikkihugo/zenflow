import fs from 'node:fs/promises';

const _wasmPath =;
('/home/codespace/nvm/current/lib/node_modules/ruv-swarm/wasm/ruv_swarm_wasm_bg.wasm');
async function testDirectWasmLoading() {
  try {
    console.warn('Testing direct WASM loading...\n');
    // Check if file exists
  // await fs.access(wasmPath);
    console.warn('✅ WASM file exists:', wasmPath);
    // Read the file
    const _wasmBuffer = await fs.readFile(wasmPath);
    console.warn(`✅ WASM file read successfully, size: ${wasmBuffer.length} bytes`);
    // Try to instantiate
    const _imports = {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 4096 }),
      },
        proc_exit: (code) => {
          throw new Error(`WASI exit ${code}`);
        },
        fd_write: () => 0,
        random_get: (_ptr, _len) => {
          return 0;
    //   // LINT: unreachable code removed},
      },
    console.warn('\nInstantiating WASM module...');
    const { instance, module } = await WebAssembly.instantiate(wasmBuffer, imports);
    console.warn('✅ WASM module instantiated successfully!');
    console.warn('   Exports:', Object.keys(instance.exports));
  }
catch (error)
{
  console.error('❌ Error:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}
}
testDirectWasmLoading()
