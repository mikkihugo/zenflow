// runtime-detector.js - Simple runtime detection for CLI compatibility
import os from 'os';
import process from 'process';

export const compat = {
  runtime: 'node',
  platform: {
    os: os.platform() === 'win32' ? 'windows' : os.platform(),
    arch: os.arch()
  },
  terminal: {
    getPid: () => process.pid,
    exit: (code) => process.exit(code),
    onSignal: (signal, handler) => process.on(signal, handler)
  },
  safeCall: async (fn) => {
    try {
      return await fn();
    } catch (error) {
      console.error('Runtime error:', error.message);
      return null;
    }
  }
};