import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { compat } from '../../../src/cli/runtime-detector.js';

describe('Runtime Detector', () => {
  let originalConsoleError;
  let consoleErrors;

  beforeEach(() => {
    // Capture console.error output
    consoleErrors = [];
    originalConsoleError = console.error;
    console.error = (...args) => consoleErrors.push(args.join(' '));
  });

  afterEach(() => {
    // Restore console.error
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
      // The platform should be 'windows' for Windows systems, not 'win32'
      if (process.platform === 'win32') {
        expect(compat.platform.os).toBe('windows');
      } else {
        expect(compat.platform.os).toBe(process.platform);
      }
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
      const pid = compat.terminal.getPid();
      expect(typeof pid).toBe('number');
      expect(pid).toBe(process.pid);
      expect(pid).toBeGreaterThan(0);
    });

    it('should handle signal registration', () => {
      const mockHandler = jest.fn();
      
      // Mock process.on to avoid actually registering signals in tests
      const originalProcessOn = process.on;
      process.on = jest.fn();

      compat.terminal.onSignal('SIGTERM', mockHandler);
      
      expect(process.on).toHaveBeenCalledWith('SIGTERM', mockHandler);
      
      // Restore original process.on
      process.on = originalProcessOn;
    });

    it('should provide exit function', () => {
      // Mock process.exit to avoid actually exiting in tests
      const originalProcessExit = process.exit;
      process.exit = jest.fn();

      compat.terminal.exit(0);
      
      expect(process.exit).toHaveBeenCalledWith(0);
      
      // Restore original process.exit
      process.exit = originalProcessExit;
    });
  });

  describe('safeCall utility', () => {
    it('should execute successful functions', async () => {
      const successFn = jest.fn(async () => 'success');
      
      const result = await compat.safeCall(successFn);
      
      expect(successFn).toHaveBeenCalled();
      expect(result).toBe('success');
      expect(consoleErrors).toHaveLength(0);
    });

    it('should handle function errors gracefully', async () => {
      const errorFn = jest.fn(async () => {
        throw new Error('Test error');
      });
      
      const result = await compat.safeCall(errorFn);
      
      expect(errorFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors).toHaveLength(1);
      expect(consoleErrors[0]).toContain('Runtime error: Test error');
    });

    it('should handle synchronous functions', async () => {
      const syncFn = jest.fn(() => 'sync result');
      
      const result = await compat.safeCall(syncFn);
      
      expect(syncFn).toHaveBeenCalled();
      expect(result).toBe('sync result');
    });

    it('should handle synchronous errors', async () => {
      const syncErrorFn = jest.fn(() => {
        throw new Error('Sync error');
      });
      
      const result = await compat.safeCall(syncErrorFn);
      
      expect(syncErrorFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors[0]).toContain('Runtime error: Sync error');
    });

    it('should handle functions that return undefined', async () => {
      const undefinedFn = jest.fn(() => undefined);
      
      const result = await compat.safeCall(undefinedFn);
      
      expect(undefinedFn).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle async functions that reject', async () => {
      const rejectFn = jest.fn(() => Promise.reject(new Error('Promise rejected')));
      
      const result = await compat.safeCall(rejectFn);
      
      expect(rejectFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleErrors[0]).toContain('Runtime error: Promise rejected');
    });
  });

  describe('platform detection', () => {
    it('should detect architecture correctly', () => {
      expect(['x64', 'arm64', 'arm', 'ia32'].includes(compat.platform.arch)).toBe(true);
    });

    it('should detect OS correctly', () => {
      const validPlatforms = ['windows', 'linux', 'darwin', 'freebsd', 'openbsd'];
      expect(validPlatforms.includes(compat.platform.os)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null function gracefully', async () => {
      const result = await compat.safeCall(null);
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });

    it('should handle undefined function gracefully', async () => {
      const result = await compat.safeCall(undefined);
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });

    it('should handle functions that throw non-Error objects', async () => {
      const throwStringFn = jest.fn(() => {
        throw 'String error';
      });
      
      const result = await compat.safeCall(throwStringFn);
      
      expect(result).toBeNull();
      expect(consoleErrors.length).toBeGreaterThan(0);
    });
  });
});