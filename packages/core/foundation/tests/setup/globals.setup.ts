/**
 * @fileoverview Global Setup for Vitest
 * 
 * Sets up browser-like globals for Node.js testing environment.
 * This allows testing browser compatibility code in Node.js.
 */

import { performance} from 'perf_hooks';

export default function globalSetup() {
  // Add performance API for browser compatibility testing
  if (typeof globalThis.performance === 'undefined') {
    globalThis.performance = performance;
}

  return () => {
    // Cleanup if needed
};
}