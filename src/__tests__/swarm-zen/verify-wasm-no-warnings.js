/**
 * Verify WASM loads without warnings
 */

import { ZenSwarm } from '../src/index-enhanced.js';

async function verifyNoWarnings() {
  // Capture console warnings
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };

  try {
    // Initialize ZenSwarm
    const swarm = await ZenSwarm.initialize({
      loadingStrategy: 'progressive',
      enableNeuralNetworks: true,
      enableForecasting: true,
      useSIMD: true,
      debug: false, // Disable debug to see only warnings
    });

    // Create a swarm and spawn agents
    const testSwarm = await swarm.createSwarm({
      name: 'test-swarm',
      topology: 'mesh',
      maxAgents: 5,
    });

    // Spawn different agent types
    await testSwarm.spawn({ type: 'researcher' });
    await testSwarm.spawn({ type: 'coder' });
    await testSwarm.spawn({ type: 'analyst' });

    // Check features
    const _features = swarm.features;

    // Restore console.warn
    console.warn = originalWarn;

    if (warnings.length === 0) {
    } else {
      warnings.forEach((_w, _i) => {});
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

verifyNoWarnings();
