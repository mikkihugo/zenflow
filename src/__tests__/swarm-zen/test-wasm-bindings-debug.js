/**
 * Debug test for WASM bindings
 * Checks for WebAssembly.instantiate errors
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testWasmDirectly() {
  try {
    // Path to WASM file
    const wasmPath = path.join(__dirname, '..', 'wasm', 'ruv_swarm_wasm_bg.wasm');

    // Check if file exists
    try {
      await fs.access(wasmPath);
    } catch (_e) {
      console.error('❌ WASM file not found:', wasmPath);
      return;
    }

    // Read WASM file
    const wasmBuffer = await fs.readFile(wasmPath);

    // Create minimal imports to see what's missing
    const imports = {
      wbg: {},
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 4096 }),
      },
    };

    try {
      const { instance, module } = await WebAssembly.instantiate(wasmBuffer, imports);
    } catch (instantiateError) {
      console.error('❌ WebAssembly.instantiate failed:', instantiateError.message);

      // Parse the error to find missing imports
      if (instantiateError.message.includes('Import #')) {
        const importMatch = instantiateError.message.match(
          /Import #(\d+) module="([^"]+)" function="([^"]+)"/
        );
        if (importMatch) {
        }
      }
      const module = await WebAssembly.compile(wasmBuffer);
      const importsList = WebAssembly.Module.imports(module);

      const importsByModule = {};
      importsList.forEach((imp) => {
        if (!importsByModule[imp.module]) {
          importsByModule[imp.module] = [];
        }
        importsByModule[imp.module].push({
          name: imp.name,
          kind: imp.kind,
        });
      });

      for (const [_moduleName, moduleImports] of Object.entries(importsByModule)) {
        moduleImports.slice(0, 10).forEach((_imp) => {});
        if (moduleImports.length > 10) {
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWasmDirectly();
