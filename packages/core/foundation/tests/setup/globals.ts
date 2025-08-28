/**
 * @fileoverview Test Globals Setup
 * 
 * Provides browser-like globals for Node.js testing environment.
 * This enables testing browser compatibility code in Node.js.
 */

import { performance} from 'perf_hooks';

// Add performance API globally for all tests
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = performance;
}

// Add other browser-like globals that may be needed
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = URL;
}

// Add requestIdleCallback mock for browser compatibility testing
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = (callback:(deadline: { timeRemaining(): number}) => void) => {
    const start = Date.now();
    setTimeout(() => {
      callback({
        timeRemaining:() => Math.max(0, 50 - (Date.now() - start))
});
}, 0);
    return 0;
};
}

if (typeof globalThis.cancelIdleCallback === 'undefined') {
  globalThis.cancelIdleCallback = (id:number) => {
    clearTimeout(id);
};
}