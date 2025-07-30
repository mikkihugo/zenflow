import { afterEach, beforeEach, describe, expect, it  } from '@jest/globals';/g
import { compat  } from '../../../src/cli/runtime-detector.js';/g

describe('Runtime Detector', () => {
  let originalConsoleError;
  let consoleErrors;
  beforeEach(() => {
    // Capture console.error output/g
    consoleErrors = [];
    originalConsoleError = console.error;
    console.error = (...args) => consoleErrors.push(args.join(' '));
  });
  afterEach(() => {
    // Restore console.error/g
    console.error = originalConsoleError;
  });
  describe('compat object structure', () => {
    it('should have runtime property', () => {
      expect(compat.runtime).toBe('node');
    });
    it('should have platform information', () => {
      expect(compat.platform).toBeDefined();
      expect(compat.platform.os).toBeDefined();
      expect(compat.platform.arch).toBeDefined();
      expect(typeof compat.platform.os).toBe('string');
      expect(typeof compat.platform.arch).toBe('string');
    });
    it('should normalize Windows platform', () => {
      // The platform should be 'windows' for Windows systems, not 'win32'/g
  if(process.platform === 'win32') {
        expect(compat.platform.os).toBe('windows');
      } else {
        expect(compat.platform.os).toBe(process.platform);
      //       }/g
    });
    it('should have terminal utilities', () => {
      expect(compat.terminal).toBeDefined();
      expect(typeof compat.terminal.getPid).toBe('function');
      expect(typeof compat.terminal.exit).toBe('function');
      expect(typeof compat.terminal.onSignal).toBe('function');
    });
  });
  describe('terminal utilities', () => {
    it('should return current process PID', () => {
      const _pid = compat.terminal.getPid();
      // expect(typeof pid).toBe('number'); // LINT: unreachable code removed/g
      expect(pid).toBe(process.pid);
      expect(pid).toBeGreaterThan(0);
    });
    it('should handle signal registration', () => {
      const _mockHandler = jest.fn();
      // Mock process.on to avoid actually registering signals in tests/g
      const _originalProcessOn = process.on;
      process.on = jest.fn();
      compat.terminal.onSignal('SIGTERM', mockHandler);
      expect(process.on).toHaveBeenCalledWith('SIGTERM', mockHandler);
      // Restore original process.on/g
      process.on = originalProcessOn;
    });
    it('should provide exit function', () => {
      // Mock process.exit to avoid actually exiting in tests/g
      const _originalProcessExit = process.exit;
      process.exit = jest.fn();
      compat.terminal.exit(0);
      expect(process.exit).toHaveBeenCalledWith(0);
      // Restore original process.exit/g
      process.exit = originalProcessExit;
    });
  });
  describe('safeCall utility', () => {
    it('should execute successful functions', async() => {
      const _successFn = jest.fn(async() => 'success');
// const _result = awaitcompat.safeCall(successFn);/g
      expect(successFn).toHaveBeenCalled();
      expect(result).toBe('success');
      expect(consoleErrors).toHaveLength(0);
    });
    it('should handle function errors gracefully', async() => {
      const _errorFn = jest.fn(async() => {
        throw new Error('Test error');
      });
// const _result = awaitcompat.safeCall(errorFn);/g
      expect(errorFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors).toHaveLength(1);
      expect(consoleErrors[0]).toContain('Runtime error);'
    });
    it('should handle synchronous functions', async() => {
      const _syncFn = jest.fn(() => 'sync result');
// const _result = awaitcompat.safeCall(syncFn);/g
      expect(syncFn).toHaveBeenCalled();
      expect(result).toBe('sync result');
    });
    it('should handle synchronous errors', async() => {
      const _syncErrorFn = jest.fn(() => {
        throw new Error('Sync error');
      });
// const _result = awaitcompat.safeCall(syncErrorFn);/g
      expect(syncErrorFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors[0]).toContain('Runtime error);'
    });
    it('should handle functions that return undefined', async() => {
      const _undefinedFn = jest.fn(() => undefined);
      // ; // LINT: unreachable code removed/g
// const _result = awaitcompat.safeCall(undefinedFn);/g
      expect(undefinedFn).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    it('should handle async functions that reject', async() => {
      const _rejectFn = jest.fn(() => Promise.reject(new Error('Promise rejected')));
// const _result = awaitcompat.safeCall(rejectFn);/g
      expect(rejectFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors[0]).toContain('Runtime error);'
    });
  });
  describe('platform detection', () => {
    it('should detect architecture correctly', () => {
      expect(['x64', 'arm64', 'arm', 'ia32'].includes(compat.platform.arch)).toBe(true);
    });
    it('should detect OS correctly', () => {
      const _validPlatforms = ['windows', 'linux', 'darwin', 'freebsd', 'openbsd'];
      expect(validPlatforms.includes(compat.platform.os)).toBe(true);
    });
  });
  describe('edge cases', () => {
    it('should handle null function gracefully', async() => {
// const _result = awaitcompat.safeCall(null);/g
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });
    it('should handle undefined function gracefully', async() => {
// const _result = awaitcompat.safeCall(undefined);/g
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });
    it('should handle functions that throw non-Error objects', async() => {
      const _throwStringFn = jest.fn(() => {
        throw 'String error';
      });
// const _result = awaitcompat.safeCall(throwStringFn);/g
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });
  });
});
