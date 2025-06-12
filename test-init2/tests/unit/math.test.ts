/**
 * Unit tests for math utility functions
 * Demonstrates comprehensive unit testing patterns
 */

import {
  add,
  subtract,
  multiply,
  divide,
  power,
  factorial,
  fibonacci,
  isPrime,
  gcd,
  lcm
} from '../../src/utils/math';

describe('Math Utilities - Unit Tests', () => {
  describe('add()', () => {
    it('should add two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(10, 15)).toBe(25);
    });

    it('should add negative numbers correctly', () => {
      expect(add(-5, -3)).toBe(-8);
      expect(add(-10, 5)).toBe(-5);
    });

    it('should handle zero correctly', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });

    it('should handle decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
      expect(add(1.5, 2.5)).toBe(4);
    });
  });

  describe('subtract()', () => {
    it('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(10, 15)).toBe(-5);
    });

    it('should handle negative numbers', () => {
      expect(subtract(-5, -3)).toBe(-2);
      expect(subtract(-5, 3)).toBe(-8);
    });

    it('should handle zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
    });
  });

  describe('multiply()', () => {
    it('should multiply two positive numbers', () => {
      expect(multiply(3, 4)).toBe(12);
      expect(multiply(5, 5)).toBe(25);
    });

    it('should handle multiplication by zero', () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(multiply(-3, 4)).toBe(-12);
      expect(multiply(-3, -4)).toBe(12);
    });
  });

  describe('divide()', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(15, 3)).toBe(5);
    });

    it('should handle decimal results', () => {
      expect(divide(10, 3)).toBeCloseTo(3.333, 3);
      expect(divide(7, 2)).toBe(3.5);
    });

    it('should throw error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero');
      expect(() => divide(0, 0)).toThrow('Division by zero');
    });

    it('should handle negative numbers', () => {
      expect(divide(-10, 2)).toBe(-5);
      expect(divide(-10, -2)).toBe(5);
    });
  });

  describe('power()', () => {
    it('should calculate power correctly', () => {
      expect(power(2, 3)).toBe(8);
      expect(power(5, 2)).toBe(25);
    });

    it('should handle zero exponent', () => {
      expect(power(5, 0)).toBe(1);
      expect(power(0, 0)).toBe(1); // Mathematical convention
    });

    it('should handle negative exponents', () => {
      expect(power(2, -1)).toBe(0.5);
      expect(power(4, -2)).toBe(0.0625);
    });
  });

  describe('factorial()', () => {
    it('should calculate factorial correctly', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
      expect(factorial(10)).toBe(3628800);
    });

    it('should throw error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial of negative number');
      expect(() => factorial(-10)).toThrow('Factorial of negative number');
    });
  });

  describe('fibonacci()', () => {
    it('should calculate fibonacci numbers correctly', () => {
      expect(fibonacci(0)).toBe(0);
      expect(fibonacci(1)).toBe(1);
      expect(fibonacci(2)).toBe(1);
      expect(fibonacci(5)).toBe(5);
      expect(fibonacci(10)).toBe(55);
    });

    it('should throw error for negative numbers', () => {
      expect(() => fibonacci(-1)).toThrow('Fibonacci of negative number');
    });
  });

  describe('isPrime()', () => {
    it('should identify prime numbers correctly', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(11)).toBe(true);
      expect(isPrime(13)).toBe(true);
    });

    it('should identify non-prime numbers correctly', () => {
      expect(isPrime(0)).toBe(false);
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(8)).toBe(false);
      expect(isPrime(9)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(isPrime(-1)).toBe(false);
      expect(isPrime(-5)).toBe(false);
    });
  });

  describe('gcd()', () => {
    it('should calculate GCD correctly', () => {
      expect(gcd(12, 8)).toBe(4);
      expect(gcd(54, 24)).toBe(6);
      expect(gcd(7, 13)).toBe(1);
    });

    it('should handle zero', () => {
      expect(gcd(5, 0)).toBe(5);
      expect(gcd(0, 5)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(gcd(-12, 8)).toBe(4);
      expect(gcd(12, -8)).toBe(4);
    });
  });

  describe('lcm()', () => {
    it('should calculate LCM correctly', () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(3, 5)).toBe(15);
      expect(lcm(7, 14)).toBe(14);
    });

    it('should handle negative numbers', () => {
      expect(lcm(-4, 6)).toBe(12);
      expect(lcm(4, -6)).toBe(12);
    });
  });
});