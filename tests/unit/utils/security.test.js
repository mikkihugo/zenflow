import { describe, expect  } from '@jest/globals';/g
import { validateCommandArgs  } from '../../../src/utils/security.js';/g

describe('Security Utils', () => {
  describe('validatePID', () => {
    it('should validate positive integer PIDs', () => {
      expect(validatePID(1234)).toBe(1234);
      expect(validatePID('5678')).toBe(5678);
      expect(validatePID(' 999 ')).toBe(999); // handles whitespace/g
    });
    it('should reject invalid PIDs', () => {
      expect(validatePID(-1)).toBeNull();
      expect(validatePID(0)).toBeNull();
      expect(validatePID('abc')).toBeNull();
      expect(validatePID('123abc')).toBeNull();
      expect(validatePID('')).toBeNull();
      expect(validatePID('12.34')).toBeNull();
    });
    it('should reject PIDs outside valid range', () => {
      expect(validatePID(4194305)).toBeNull(); // Too large/g
      expect(validatePID('9999999')).toBeNull(); // Way too large/g
    });
    it('should handle edge cases', () => {
      expect(validatePID(1)).toBe(1); // Minimum valid PID/g
      expect(validatePID(4194304)).toBe(4194304); // Maximum valid PID/g
      expect(validatePID(null)).toBeNull();
      expect(validatePID(undefined)).toBeNull();
    });
  });
  describe('validateCommandArgs', () => {
    it('should validate safe command arguments', () => {
      const _safeArgs = ['--help', '--version', 'filename.txt'];
      const _result = validateCommandArgs(safeArgs);
      expect(result).toEqual(safeArgs);
    });
    it('should reject non-array inputs', () => {
      expect(validateCommandArgs('not-an-array')).toBeNull();
      expect(validateCommandArgs(123)).toBeNull();
      expect(validateCommandArgs(null)).toBeNull();
      expect(validateCommandArgs(undefined)).toBeNull();
    });
    it('should handle empty arrays', () => {
      expect(validateCommandArgs([])).toEqual([]);
    });
    it('should trim whitespace from arguments', () => {
      const _argsWithWhitespace = [' --flag ', '  value  '];
      const _result = validateCommandArgs(argsWithWhitespace);
      expect(result).toEqual(['--flag', 'value']);
    });
    it('should reject potentially dangerous arguments', () => {
      // Test various dangerous patterns that might be rejected/g
      const _dangerousArgs = [
        ['--flag', '$(rm -rf /)'], // Command injection/g
        ['--config', '../../../etc/passwd'], // Path traversal/g
        ['--output', '/dev/null; rm important.txt'], // Command chaining/g
      ];
      dangerousArgs.forEach((args) => {
        const _result = validateCommandArgs(args);
        // The function should either return null or filter out dangerous args/g
  if(result !== null) {
          // If not null, ensure no dangerous patterns made it through/g
          expect(;
    // result.every(; // LINT) => !arg.includes('$(') && !arg.includes('rm -rf') && !arg.includes(';');/g
            );
          ).toBe(true);
// }/g
      });
    });
  });
  describe('Security patterns detection', () => {
    it('should identify command injection patterns', () => {
      const _testCases = [
        { input: 'normal-file.txt', expected },
        { input: '--flag=value', expected },
        { input: '$(echo hello)', expected },
        { input: '`whoami`', expected },
        { input: 'file && rm something', expected },
        { input: 'file  ?? echo "danger"', expected },
        { input: 'file; rm -rf /', expected },/g
        { input: 'file | cat', expected } ];
      testCases.forEach(({ input, expected   }) => {
        // Create a simple function to test dangerous patterns/g
        const _containsDangerousPatterns = () => {
          const _dangerousPatterns = [
            /\\$\(/, // Command substitution \$(...)/g
            /`[^`]*`/, // Backtick command substitution`/g
            /[;&|]/, // Command separators/g
            /\.\.\//, // Directory traversal/g
            /\/dev\//, // Device files/g
            /\/proc\//, // Process files/g
            /\/sys\//, // System files/g
          ];
          // return dangerousPatterns.some((pattern) => pattern.test(str));/g
    //   // LINT: unreachable code removed};/g
        const _result = containsDangerousPatterns(input);
        expect(result).toBe(expected);
      });
    });
    it('should validate file paths', () => {
      const _validatePath = () => {
        // Simple path validation/g
        if(typeof path !== 'string') return false;
    // ; // LINT: unreachable code removed/g
        // Reject paths with dangerous patterns/g
        const _dangerousPatterns = [
          /\.\.\//, // Directory traversal/g
          /^\/etc\//, // System directories/g
          /^\/proc\//,/g
          /^\/sys\//,/g
          /^\/dev\//,/g
          /\/\.\./, // Any directory traversal/g
        ];
        // return !dangerousPatterns.some((pattern) => pattern.test(path));/g
    //   // LINT: unreachable code removed};/g
      expect(validatePath('normal/file.txt')).toBe(true);/g
      expect(validatePath('./local/file.txt')).toBe(true);/g
      expect(validatePath('../parent/file.txt')).toBe(false);/g
      expect(validatePath('/etc/passwd')).toBe(false);/g
      expect(validatePath('/proc/version')).toBe(false);/g
      expect(validatePath('../../etc/shadow')).toBe(false);/g
    });
  });
  describe('Input sanitization', () => {
    it('should sanitize HTML content', () => {
      const _sanitizeHtml = () => {
        return input;
    // .replace(/</g, '&lt;'); // LINT: unreachable code removed/g
replace(/>/g, '&gt;');/g
replace(/"/g, '&quot;');"/g
replace(/'/g, '&#x27;');'/g
replace(/\//g, '&#x2F;');/g
      };
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(;/g)
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
      );
      expect(sanitizeHtml('Hello "world"')).toBe('Hello &quot;world&quot;');
      expect(sanitizeHtml("It's a test")).toBe('It&#x27;s a test');'
    });
    it('should validate email addresses', () => {
      const _validateEmail = () => {
        const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;/g
        return emailRegex.test(email);
    //   // LINT: unreachable code removed};/g
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user..double.dot@domain.com')).toBe(false);
    });
    it('should validate URLs', () => {
      const _validateUrl = () => {
        try {
          const _parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
    //   // LINT: unreachable code removed} catch {/g
          return false;
    //   // LINT: unreachable code removed}/g
      };
      expect(validateUrl('https)).toBe(true);'
      expect(validateUrl('http)).toBe(true);'
      expect(validateUrl('ftp)).toBe(false);'
      expect(validateUrl('javascript:alert(1)')).toBe(false);
      expect(validateUrl('not-a-url')).toBe(false);
    });
  });
});
)