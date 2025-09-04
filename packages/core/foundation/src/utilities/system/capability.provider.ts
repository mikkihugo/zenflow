/**
 * @fileoverview Capability Provider
 * Lightweight runtime capability detection for Node and browser-like envs.
 */

import { getLogger } from '../../core/logging/index.js';

export type Capability =
  | 'fs'
  | 'network'
  | 'worker_threads'
  | 'wasm'
  | 'crypto'
  | 'webcrypto'
  | 'sharedarraybuffer'
  | 'performance'
  | 'url'
  | 'fetch';

export interface CapabilityProvider {
  has(cap: Capability): boolean;
  list(): Capability[];
  summary(): Record<string, boolean>;
}

const logger = getLogger('system:capability');

function detect(): Record<Capability, boolean> {
  const result = {
    fs: false,
    network: false,
    worker_threads: false,
    wasm: false,
    crypto: false,
    webcrypto: false,
    sharedarraybuffer: false,
    performance: false,
    url: false,
    fetch: false,
  } as Record<Capability, boolean>;

  // Node fs
  try {
    require('node:fs');
    result.fs = true;
  } catch {
    // fs not available in browser environment
  }

  // Network (http/https or fetch)
  try {
    require('node:http');
    require('node:https');
    result.network = true;
  } catch {
    // browsers: fetch
    result.network = typeof (globalThis as unknown as { fetch?: Function }).fetch === 'function';
  }

  // worker_threads
  try {
    require('node:worker_threads');
    result.worker_threads = true;
  } catch {
    // worker_threads not available in browser environment
  }

  // WebAssembly
  result.wasm = typeof (globalThis as unknown as { WebAssembly?: object }).WebAssembly === 'object';

  // crypto/webcrypto
  try {
    require('node:crypto');
    result.crypto = true;
  } catch {
    // node:crypto not available in browser environment
  }
  result.webcrypto = !!(globalThis as unknown as { crypto?: { subtle?: unknown } }).crypto?.subtle;

  // sharedArrayBuffer
  result.sharedarraybuffer = typeof (globalThis as unknown as { SharedArrayBuffer?: Function }).SharedArrayBuffer === 'function';

  // performance
  result.performance = typeof (globalThis as unknown as { performance?: { now?: Function } }).performance?.now === 'function';

  // URL, fetch
  result.url = typeof (globalThis as unknown as { URL?: Function }).URL === 'function';
  result.fetch = result.fetch || typeof (globalThis as unknown as { fetch?: Function }).fetch === 'function';

  return result;
}

export function createCapabilityProvider(): CapabilityProvider {
  const cache = detect();
  logger.debug?.('Capabilities detected', cache);
  return {
    has: (cap: Capability) => !!cache[cap],
    list: () => Object.keys(cache).filter(k => cache[k as Capability]) as Capability[],
    summary: () => ({ ...cache }),
  };
}

// Export a singleton for convenience
export const capabilities = createCapabilityProvider();

export default capabilities;