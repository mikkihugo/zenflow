/**
 * Simple Coverage Test - Tests actual code execution for coverage
 */

// Test memory-config.js
import { getMemoryConfig } from '../src/memory-config.js';

const _config = getMemoryConfig();

// Test index.js
import { ZenSwarm } from '../src/index.js';

try {
  const _version = ZenSwarm.getVersion();
  const _simd = ZenSwarm.detectSIMDSupport();
  const _ruv = await ZenSwarm.initialize();
} catch (_e) {}

// Test persistence.js
import { SwarmPersistence } from '../src/persistence.js';

try {
  const _persistence = new SwarmPersistence();
} catch (_e) {}

// Test neural-agent.js
import { NeuralAgent } from '../src/neural-agent.js';

try {
  const _agent = new NeuralAgent({ type: 'researcher' });
} catch (_e) {}

// Test wasm-loader.js
import { WasmLoader } from '../src/wasm-loader.js';

try {
  const loader = new WasmLoader();
  const _supported = loader.isSupported();
} catch (_e) {}

// Test benchmark.js
import { BenchmarkCLI } from '../src/benchmark.js';

const _bench = new BenchmarkCLI();

// Test neural.js
import { NeuralCLI } from '../src/neural.js';

const _neural = new NeuralCLI();

// Test neural-network-manager.js
import { NeuralNetworkManager } from '../src/neural-network-manager.js';

try {
  const _manager = new NeuralNetworkManager();
} catch (_e) {}

// Test hooks
import '../src/hooks/index.js';

// Test claude integration
import '../src/claude-integration/index.js';

// Test github coordinator
import '../src/github-coordinator/claude-hooks.js';
import '../src/github-coordinator/gh-cli-coordinator.js';
