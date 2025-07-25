import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('CLI Utils', () => {
  let originalConsoleLog;
  let consoleOutput;
  let utils;

  beforeEach(async () => {
    // Capture console.log output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => consoleOutput.push(args.join(' '));

    // Import the utils module
    utils = await import('../../../src/cli/utils.js');
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('color formatting functions', () => {
    it('should print success messages with checkmark', () => {
      utils.printSuccess('Test success message');
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('✅ Test success message');
    });

    it('should print error messages with X mark', () => {
      utils.printError('Test error message');
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('❌ Test error message');
    });

    it('should print warning messages with warning symbol', () => {
      utils.printWarning('Test warning message');
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('⚠️  Test warning message');
    });

    it('should print info messages with info symbol', () => {
      utils.printInfo('Test info message');
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('ℹ️  Test info message');
    });

    it('should handle empty messages', () => {
      utils.printSuccess('');
      utils.printError('');
      utils.printWarning('');
      utils.printInfo('');
      
      expect(consoleOutput).toHaveLength(4);
      expect(consoleOutput[0]).toBe('✅ ');
      expect(consoleOutput[1]).toBe('❌ ');
      expect(consoleOutput[2]).toBe('⚠️  ');
      expect(consoleOutput[3]).toBe('ℹ️  ');
    });

    it('should handle multi-line messages', () => {
      const multiLineMessage = 'Line 1\nLine 2\nLine 3';
      utils.printSuccess(multiLineMessage);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('✅ Line 1\nLine 2\nLine 3');
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Test with "quotes" and symbols: @#$%^&*()';
      utils.printError(specialMessage);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('❌ Test with "quotes" and symbols: @#$%^&*()');
    });
  });

  describe('validateArgs function', () => {
    it('should validate minimum argument length', () => {
      const args = ['arg1', 'arg2', 'arg3'];
      const result = utils.validateArgs(args, 2, 'command <arg1> <arg2>');
      
      expect(result).toBe(true);
      expect(consoleOutput).toHaveLength(0); // No error message
    });

    it('should reject insufficient arguments', () => {
      const args = ['arg1'];
      const result = utils.validateArgs(args, 3, 'command <arg1> <arg2> <arg3>');
      
      expect(result).toBe(false);
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('❌ Usage: command <arg1> <arg2> <arg3>');
    });

    it('should handle empty arguments array', () => {
      const args = [];
      const result = utils.validateArgs(args, 1, 'command <required>');
      
      expect(result).toBe(false);
      expect(consoleOutput[0]).toBe('❌ Usage: command <required>');
    });

    it('should handle zero minimum length', () => {
      const args = [];
      const result = utils.validateArgs(args, 0, 'command');
      
      expect(result).toBe(true);
      expect(consoleOutput).toHaveLength(0);
    });

    it('should accept exact minimum number of arguments', () => {
      const args = ['arg1', 'arg2'];
      const result = utils.validateArgs(args, 2, 'command <arg1> <arg2>');
      
      expect(result).toBe(true);
      expect(consoleOutput).toHaveLength(0);
    });

    it('should accept more than minimum arguments', () => {
      const args = ['arg1', 'arg2', 'arg3', 'arg4'];
      const result = utils.validateArgs(args, 2, 'command <arg1> <arg2> [optional...]');
      
      expect(result).toBe(true);
      expect(consoleOutput).toHaveLength(0);
    });
  });

  describe('file system helpers', () => {
    describe('ensureDirectory', () => {
      let mockProcess;

      beforeEach(() => {
        // Mock process.mkdir
        mockProcess = {
          mkdir: jest.fn()
        };
        
        // Replace process global for testing
        global.process = { ...global.process, mkdir: mockProcess.mkdir };
      });

      it('should create directory successfully', async () => {
        mockProcess.mkdir.mockResolvedValue(undefined);
        
        const result = await utils.ensureDirectory('/test/path');
        
        expect(result).toBe(true);
        expect(mockProcess.mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
      });

      it('should handle existing directory', async () => {
        const existsError = new Error('Directory exists');
        existsError.code = 'EEXIST';
        mockProcess.mkdir.mockRejectedValue(existsError);
        
        const result = await utils.ensureDirectory('/existing/path');
        
        expect(result).toBe(true);
      });

      it('should rethrow non-EEXIST errors', async () => {
        const permissionError = new Error('Permission denied');
        permissionError.code = 'EACCES';
        mockProcess.mkdir.mockRejectedValue(permissionError);
        
        await expect(utils.ensureDirectory('/forbidden/path')).rejects.toThrow('Permission denied');
      });
    });

    describe('fileExists', () => {
      let mockProcess;

      beforeEach(() => {
        // Mock process.stat
        mockProcess = {
          stat: jest.fn()
        };
        
        global.process = { ...global.process, stat: mockProcess.stat };
      });

      it('should return true for existing files', async () => {
        mockProcess.stat.mockResolvedValue({ isFile: () => true });
        
        const result = await utils.fileExists('/existing/file.txt');
        
        expect(result).toBe(true);
        expect(mockProcess.stat).toHaveBeenCalledWith('/existing/file.txt');
      });

      it('should return false for non-existing files', async () => {
        const notFoundError = new Error('File not found');
        notFoundError.code = 'ENOENT';
        mockProcess.stat.mockRejectedValue(notFoundError);
        
        const result = await utils.fileExists('/nonexistent/file.txt');
        
        expect(result).toBe(false);
      });

      it('should return false for any stat error', async () => {
        const permissionError = new Error('Permission denied');
        mockProcess.stat.mockRejectedValue(permissionError);
        
        const result = await utils.fileExists('/forbidden/file.txt');
        
        expect(result).toBe(false);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should combine validation and error printing', () => {
      const invalidArgs = [];
      const result = utils.validateArgs(invalidArgs, 2, 'deploy <target> <env>');
      
      expect(result).toBe(false);
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toContain('❌');
      expect(consoleOutput[0]).toContain('deploy <target> <env>');
    });

    it('should handle multiple function calls', () => {
      utils.printInfo('Starting operation...');
      utils.printSuccess('Operation completed');
      utils.printWarning('Minor issues detected');
      
      expect(consoleOutput).toHaveLength(3);
      expect(consoleOutput[0]).toContain('ℹ️');
      expect(consoleOutput[1]).toContain('✅');
      expect(consoleOutput[2]).toContain('⚠️');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined messages', () => {
      utils.printSuccess(undefined);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('✅ undefined');
    });

    it('should handle null messages', () => {
      utils.printError(null);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('❌ null');
    });

    it('should handle numeric messages', () => {
      utils.printInfo(12345);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('ℹ️  12345');
    });

    it('should handle object messages', () => {
      const obj = { key: 'value' };
      utils.printWarning(obj);
      
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe('⚠️  [object Object]');
    });
  });
});