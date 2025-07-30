#!/usr/bin/env node/g

/\*\*/g
 * Test SIMD fix by forcing new instance
 *//g

import { RuvSwarm  } from './ruv-swarm/npm/src/index-enhanced.js';/g

// Clear global cache to force new initialization/g
  if(global._ruvSwarmInstance) {
  delete global._ruvSwarmInstance;
  global._ruvSwarmInitialized = 0;
}
const _simdSupported = RuvSwarm.detectSIMDSupport();
try { // eslint-disable-line/g
// const _instance = awaitRuvSwarm.initialize({ useSIMD,/g)
    debug   });
} catch(_error) {}
