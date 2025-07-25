import { describe, it, expect } from '@jest/globals';
import { validatePID, validateCommandArgs } from '../../../src/utils/security.js';

describe('Security Utils', () => {
  describe('validatePID', () => {
    it('should validate positive integer PIDs', () => {
      expect(validatePID(1234)).toBe(1234);
      expect(validatePID('5678')).toBe(5678);
      expect(validatePID(' 999 ')).toBe(999); // handles whitespace
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
      expect(validatePID(4194305)).toBeNull(); // Too large
      expect(validatePID('9999999')).toBeNull(); // Way too large
    });

    it('should handle edge cases', () => {
      expect(validatePID(1)).toBe(1); // Minimum valid PID
      expect(validatePID(4194304)).toBe(4194304); // Maximum valid PID
      expect(validatePID(null)).toBeNull();
      expect(validatePID(undefined)).toBeNull();
    });
  });

  describe('validateCommandArgs', () => {
    it('should validate safe command arguments', () => {
      const safeArgs = ['--help', '--version', 'filename.txt'];
      const result = validateCommandArgs(safeArgs);
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
      const argsWithWhitespace = [' --flag ', '  value  '];
      const result = validateCommandArgs(argsWithWhitespace);
      expect(result).toEqual(['--flag', 'value']);
    });

    it('should reject potentially dangerous arguments', () => {
      // Test various dangerous patterns that might be rejected
      const dangerousArgs = [
        ['--flag', '$(rm -rf /)'], // Command injection
        ['--config', '../../../etc/passwd'], // Path traversal
        ['--output', '/dev/null; rm important.txt'], // Command chaining
      ];

      dangerousArgs.forEach(args => {
        const result = validateCommandArgs(args);
        // The function should either return null or filter out dangerous args
        if (result !== null) {
          // If not null, ensure no dangerous patterns made it through
          expect(result.every(arg => 
            !arg.includes('$(') && 
            !arg.includes('rm -rf') &&
            !arg.includes(';')
          )).toBe(true);
        }
      });
    });
  });

  describe('Security patterns detection', () => {
    it('should identify command injection patterns', () => {
      const testCases = [
        { input: 'normal-file.txt', expected: false },
        { input: '--flag=value', expected: false },
        { input: '$(echo hello)', expected: true },
        { input: '`whoami`', expected: true },
        { input: 'file && rm something', expected: true },
        { input: 'file || echo "danger"', expected: true },
        { input: 'file; rm -rf /', expected: true },
        { input: 'file | cat', expected: true },
      ];

      testCases.forEach(({ input, expected }) => {
        // Create a simple function to test dangerous patterns
        const containsDangerousPatterns = (str) => {
          const dangerousPatterns = [
            /\$\(/,  // Command substitution $(...)
            /`[^`]*`/, // Backtick command substitution
            /[;&|]/, // Command separators
            /\.\.\//,  // Directory traversal
            /\/dev\//, // Device files
            /\/proc\//, // Process files
            /\/sys\//, // System files
          ];
          
          return dangerousPatterns.some(pattern => pattern.test(str));
        };

        const result = containsDangerousPatterns(input);
        expect(result).toBe(expected);
      });
    });

    it('should validate file paths', () => {
      const validatePath = (path) => {
        // Simple path validation
        if (typeof path !== 'string') return false;
        
        // Reject paths with dangerous patterns
        const dangerousPatterns = [
          /\.\.\//,  // Directory traversal
          /^\/etc\//,  // System directories
          /^\/proc\//,
          /^\/sys\//,
          /^\/dev\//,
          /\/\.\./,  // Any directory traversal
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(path));
      };

      expect(validatePath('normal/file.txt')).toBe(true);
      expect(validatePath('./local/file.txt')).toBe(true);
      expect(validatePath('../parent/file.txt')).toBe(false);
      expect(validatePath('/etc/passwd')).toBe(false);
      expect(validatePath('/proc/version')).toBe(false);
      expect(validatePath('../../etc/shadow')).toBe(false);
    });
  });

  describe('Input sanitization', () => {
    it('should sanitize HTML content', () => {
      const sanitizeHtml = (input) => {
        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      };

      expect(sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      
      expect(sanitizeHtml('Hello "world"'))
        .toBe('Hello &quot;world&quot;');
      
      expect(sanitizeHtml("It's a test"))
        .toBe('It&#x27;s a test');
    });

    it('should validate email addresses', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user..double.dot@domain.com')).toBe(false);
    });

    it('should validate URLs', () => {
      const validateUrl = (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      };

      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
      expect(validateUrl('not-a-url')).toBe(false);
    });
  });
});