/**
 * Unit tests for string utility functions
 */

import {
  capitalize,
  reverse,
  isPalindrome,
  truncate,
  countWords,
  toSlug,
  extractEmails,
  extractUrls,
  camelCase,
  snakeCase
} from '../../src/utils/string';

describe('String Utilities - Unit Tests', () => {
  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('Z')).toBe('Z');
    });

    it('should handle strings with numbers', () => {
      expect(capitalize('123abc')).toBe('123abc');
    });
  });

  describe('reverse()', () => {
    it('should reverse strings correctly', () => {
      expect(reverse('hello')).toBe('olleh');
      expect(reverse('12345')).toBe('54321');
    });

    it('should handle empty string', () => {
      expect(reverse('')).toBe('');
    });

    it('should handle palindromes', () => {
      expect(reverse('radar')).toBe('radar');
    });
  });

  describe('isPalindrome()', () => {
    it('should identify palindromes', () => {
      expect(isPalindrome('radar')).toBe(true);
      expect(isPalindrome('level')).toBe(true);
      expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
    });

    it('should identify non-palindromes', () => {
      expect(isPalindrome('hello')).toBe(false);
      expect(isPalindrome('world')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isPalindrome('RaceCar')).toBe(true);
    });

    it('should ignore special characters', () => {
      expect(isPalindrome('A man, a plan, a canal: Panama!')).toBe(true);
    });
  });

  describe('truncate()', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('This is a long string', 10)).toBe('This is...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle custom suffix', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
    });

    it('should throw error for negative length', () => {
      expect(() => truncate('Hello', -1)).toThrow('Max length must be non-negative');
    });
  });

  describe('countWords()', () => {
    it('should count words correctly', () => {
      expect(countWords('Hello World')).toBe(2);
      expect(countWords('The quick brown fox')).toBe(4);
    });

    it('should handle multiple spaces', () => {
      expect(countWords('Hello   World')).toBe(2);
      expect(countWords('  Hello  World  ')).toBe(2);
    });

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('toSlug()', () => {
    it('should convert to slug format', () => {
      expect(toSlug('Hello World')).toBe('hello-world');
      expect(toSlug('This is a TEST')).toBe('this-is-a-test');
    });

    it('should handle special characters', () => {
      expect(toSlug('Hello@World!')).toBe('helloworld');
      expect(toSlug('Test & Example')).toBe('test-example');
    });

    it('should handle multiple spaces and dashes', () => {
      expect(toSlug('Hello   World')).toBe('hello-world');
      expect(toSlug('--Hello--World--')).toBe('hello-world');
    });
  });

  describe('extractEmails()', () => {
    it('should extract valid emails', () => {
      const text = 'Contact us at john@example.com or jane@test.org';
      expect(extractEmails(text)).toEqual(['john@example.com', 'jane@test.org']);
    });

    it('should handle no emails', () => {
      expect(extractEmails('No emails here')).toEqual([]);
    });

    it('should handle multiple emails in complex text', () => {
      const text = 'Email: admin@site.com, support@help.desk.com';
      expect(extractEmails(text)).toEqual(['admin@site.com', 'support@help.desk.com']);
    });
  });

  describe('extractUrls()', () => {
    it('should extract valid URLs', () => {
      const text = 'Visit https://example.com or http://test.org';
      expect(extractUrls(text)).toEqual(['https://example.com', 'http://test.org']);
    });

    it('should handle no URLs', () => {
      expect(extractUrls('No URLs here')).toEqual([]);
    });

    it('should handle URLs with paths', () => {
      const text = 'Check https://example.com/path/to/page';
      expect(extractUrls(text)).toEqual(['https://example.com/path/to/page']);
    });
  });

  describe('camelCase()', () => {
    it('should convert to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld');
      expect(camelCase('Hello World')).toBe('helloWorld');
    });

    it('should handle multiple words', () => {
      expect(camelCase('the quick brown fox')).toBe('theQuickBrownFox');
    });

    it('should handle special characters', () => {
      expect(camelCase('hello-world')).toBe('helloWorld');
    });
  });

  describe('snakeCase()', () => {
    it('should convert to snake_case', () => {
      expect(snakeCase('hello world')).toBe('hello_world');
      expect(snakeCase('HelloWorld')).toBe('hello_world');
    });

    it('should handle camelCase', () => {
      expect(snakeCase('theQuickBrownFox')).toBe('the_quick_brown_fox');
    });

    it('should handle special characters', () => {
      expect(snakeCase('hello-world!')).toBe('hello_world');
    });
  });
});