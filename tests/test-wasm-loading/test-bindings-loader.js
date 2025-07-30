import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function testBindingsLoader() {
  console.warn('Testing wasm-bindings-loader.mjs...\n');

  const loaderPath =
    '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/wasm/wasm-bindings-loader.mjs';

  try {
    // Check if file exists
    await fs.access(loaderPath);
    console.warn('✅ Loader file exists:', loaderPath);

    // Try to import it
    const loaderURL = pathToFileURL(loaderPath).href;
    console.warn('   URL:', loaderURL);

    const loaderModule = await import(loaderURL);
    console.warn('✅ Loader module imported successfully');
    console.warn('   Module keys:', Object.keys(loaderModule));

    if (loaderModule.default) {
      const bindingsLoader = loaderModule.default;
      console.warn('\n✅ Found default export');
      console.warn('   Type:', typeof bindingsLoader);

      if (typeof bindingsLoader.initialize === 'function') {
        console.warn('\n   Initializing bindings loader...');
        await bindingsLoader.initialize();
        console.warn('✅ Bindings loader initialized!');

        // Check what functions are available
        console.warn('\n   Available functions:');
        for (const key in bindingsLoader) {
          if (typeof bindingsLoader[key] === 'function' && !key.startsWith('_')) {
            console.warn(`     - ${key}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}

testBindingsLoader().catch(console.error);
