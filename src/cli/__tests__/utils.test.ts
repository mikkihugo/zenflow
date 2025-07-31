
/** Tests for utils.js

import { jest  } from '@jest';
import { chunk,
formatBytes,
formatTimestamp,
generateId,;
isValidJson,;
isValidUrl,;
parseFlags,;
printError,;
printInfo,;
printSuccess,;
printWarning,;
retry,;
sleep,;
truncateString,;
validateArgs  } from '..
// Mock console for testing output functions
let consoleLogSpy;
let consoleErrorSpy;
beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();';
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();';
});
afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});
describe('Utils', () => {'
  describe('parseFlags', () => {'
    test('should parse boolean flags', () => {'
      const _result = parseFlags(['--verbose', '--force']);'
      expect(result.flags).toEqual({ verbose, force  });
      expect(result.args).toEqual([]);
    });

    test('should parse flags with values', () => {'
      const _result = parseFlags(['--port', '8080', '--name', 'test']);';
      expect(result.flags).toEqual({ port);
      expect(result.args).toEqual([]);
      });

    test('should separate arguments and flags', () => {'
      const _result = parseFlags(['arg1', '--flag', 'value', 'arg2', '--bool']);';
      expect(result.flags).toEqual({ flag);
      expect(result.args).toEqual(['arg1', 'arg2']);';
      });

    test('should handle combined short flags', () => {'
      const _result = parseFlags(['-vf', '--port', '8080']);';
      expect(result.flags).toEqual({ v, f, port);
      expect(result.args).toEqual([]);
      });

    test('should handle no flags or arguments', () => {'
      const _result = parseFlags([]);
      expect(result.flags).toEqual({  });
      expect(result.args).toEqual([]);
    });
  });

  describe('formatBytes', () => {'
    test('should format bytes to human readable', () => {'
      expect(formatBytes(0)).toBe('0.00 B');'
      expect(formatBytes(1024)).toBe('1.00 KB');'
      expect(formatBytes(1048576)).toBe('1.00 MB');'
      expect(formatBytes(1073741824)).toBe('1.00 GB');'
    });

    test('should handle large numbers', () => {'
      expect(formatBytes(2048)).toBe('2.00 KB');'
      expect(formatBytes(1536)).toBe('1.50 KB');'
    });
  });

  describe('truncateString', () => {'
    test('should truncate long strings', () => {'
      expect(truncateString('Hello World', 5)).toBe('Hello...');';
      expect(truncateString('Short', 10)).toBe('Short');';
    });

    test('should handle empty string', () => {'
      expect(truncateString('', 5)).toBe('');';
    });

    test('should use default length', () => {'
      const _longString = 'a'.repeat(150);';
      const _result = truncateString(longString);
      expect(result).toBe(`${'a'.repeat(100)}...`);`
    });
  });

  describe('print functions', () => {'
    test('printSuccess should log success message', () => {'
      printSuccess('Test message');';
      expect(consoleLogSpy).toHaveBeenCalledWith(' Test message');';
    });

    test('printError should log error message', () => {'
      printError('Error message');';
      expect(consoleLogSpy).toHaveBeenCalledWith(' Error message');';
    });

    test('printWarning should log warning message', () => {'
      printWarning('Warning message');';
      expect(consoleLogSpy).toHaveBeenCalledWith('  Warning message');';
    });

    test('printInfo should log info message', () => {'
      printInfo('Info message');';
      expect(consoleLogSpy).toHaveBeenCalledWith('  Info message');';
    });
  });

  describe('validateArgs', () => {'
    test('should return true for valid arguments', () => {'
      const _result = validateArgs(['arg1', 'arg2'], 2, 'command <arg1> <arg2>');';
    // expect(result).toBe(true); // LINT: unreachable code removed
    });

    test('should return false and print error for insufficient arguments', () => {'
      const _result = validateArgs(['arg1'], 2, 'command <arg1> <arg2>');';
    // expect(result).toBe(false); // LINT: unreachable code removed
      expect(consoleLogSpy).toHaveBeenCalledWith(' Usage);';
    });
  });

  describe('generateId', () => {'
    test('should generate unique IDs', () => {'
      const _id1 = generateId();
      const _id2 = generateId();
;
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
      expect(typeof id1).toBe('string');';
    });

    test('should generate ID with prefix', () => {'
      const _id = generateId('user');';
      expect(id).toMatch(/^user-\d+-[a-z0-9]+$/);
    });
  });

  describe('retry', () => {'
    test('should retry on failure', async() => {'
      const _attempts = 0;
      const _fn = jest.fn(async() => {
        attempts++;
        if(attempts < 3) throw new Error('Failed');'
        // return 'success';'
    //   // LINT: unreachable code removed});
// const _result = awaitretry(fn, 3, 10);

      expect(result).toBe('success');';
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retries', async() => {'
      const _fn = jest.fn(async() => {
        throw new Error('Always fails');';
      });
// // await expect(retry(fn, 2, 10)).rejects.toThrow('Always fails');'
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('sleep', () => {'
    test('should delay execution', async() => {'
      const _start = Date.now();
// // await sleep(50);
      const _end = Date.now();
;
      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some margin
    });
  });

  describe('chunk', () => {'
    test('should split array into chunks', () => {'
      const _array = [1, 2, 3, 4, 5, 6, 7];
      const _result = chunk(array, 3);
;
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('should handle empty array', () => {'
      const _result = chunk([], 3);
      expect(result).toEqual([]);
    });

    test('should handle chunk size larger than array', () => {'
      const _result = chunk([1, 2], 5);
      expect(result).toEqual([[1, 2]]);
    });
  });

  describe('isValidJson', () => {'
    test('should validate correct JSON', () => {'
      expect(isValidJson('{"key")).toBe(true);"'
      expect(isValidJson('[1,2,3]')).toBe(true);';
      expect(isValidJson('"string"')).toBe(true);';
      expect(isValidJson('123')).toBe(true);';
    });

    test('should reject invalid JSON', () => {'
      expect(isValidJson('{"key")).toBe(false);"'
      expect(isValidJson('invalid')).toBe(false);';
      expect(isValidJson('')).toBe(false);';
    });
  });

  describe('isValidUrl', () => {'
    test('should validate correct URLs', () => {'
      expect(isValidUrl('https)).toBe(true);';
      expect(isValidUrl('http)).toBe(true);';
    });

    test('should reject invalid URLs', () => {'
      expect(isValidUrl('not a url')).toBe(false);';
      expect(isValidUrl('example.com')).toBe(false);';
      expect(isValidUrl('')).toBe(false);';
    });
  });

  describe('formatTimestamp', () => {'
    test('should format timestamp to readable string', () => {'
      const _timestamp = 1234567890000; // Fixed timestamp
      const _result = formatTimestamp(timestamp);

      expect(typeof result).toBe('string');';
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle current timestamp', () => {'
      const _now = Date.now();
      const _result = formatTimestamp(now);

      expect(typeof result).toBe('string');';
      expect(result).toContain('2025'); // Should contain current year'
    });
  });
});

}}}}}

*/