#!/usr/bin/env node

/**
 * Test SIMD fix by forcing new instance
 */

import { RuvSwarm  } from './ruv-swarm/npm/src/index-enhanced.js';

// Clear global cache to force new initialization
if(global._ruvSwarmInstance) {
  delete global._ruvSwarmInstance;
  global._ruvSwarmInitialized = 0;
}
const _simdSupported = RuvSwarm.detectSIMDSupport();
try { // eslint-disable-line
// const _instance = awaitRuvSwarm.initialize({ useSIMD,
    debug  });
} catch(_error) {}
