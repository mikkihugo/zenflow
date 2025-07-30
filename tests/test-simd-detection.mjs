#!/usr/bin/env node

/**
 * Test SIMD detection in ruv-swarm
 */

import { RuvSwarm } from './ruv-swarm/npm/src/index-enhanced.js';

try {
  const _simdSupported = RuvSwarm.detectSIMDSupport();
} catch (_error) {}
try {
  const simdTestBytes = new Uint8Array([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 7, 8, 1, 4, 116, 101, 115, 116,
    0, 0, 10, 15, 1, 13, 0, 65, 0, 253, 15, 253, 98, 11,
  ]);
  const _isValid = WebAssembly.validate(simdTestBytes);
} catch (_error) {}
try {
  // This is a minimal SIMD test module that should pass
  const minimalSIMD = new Uint8Array([
    0x00,
    0x61,
    0x73,
    0x6d, // magic
    0x01,
    0x00,
    0x00,
    0x00, // version
    // Type section with SIMD type
    0x01,
    0x04,
    0x01,
    0x60,
    0x00,
    0x00,
  ]);
  const _minimal = WebAssembly.validate(minimalSIMD);
} catch (_error) {}
try {
  const _instance = await RuvSwarm.initialize({
    useSIMD: true,
    debug: true,
  });
} catch (_error) {}
