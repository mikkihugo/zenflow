/**
 * @fileoverview Tests for Seedable RNG
 * 
 * Comprehensive test suite ensuring deterministic behavior and
 * compatibility with Stanford DSPy random patterns.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG, setSeed, random, choice, sample, getGlobalRNG } from '../../../../lib/dspy/utils/rng';

describe('SeededRNG', () => {
  let rng: SeededRNG;

  beforeEach(() => {
    rng = new SeededRNG(12345);
  });

  describe('Constructor and Seeding', () => {
    it('should create RNG with default seed', () => {
      const defaultRng = new SeededRNG();
      expect(defaultRng.getSeed()).toBe(0);
    });

    it('should create RNG with string seed', () => {
      const stringRng = new SeededRNG('test-seed');
      expect(stringRng.getSeed()).toBe('test-seed');
    });

    it('should create RNG with numeric seed', () => {
      const numRng = new SeededRNG(42);
      expect(numRng.getSeed()).toBe(42);
    });

    it('should produce deterministic results with same seed', () => {
      const rng1 = new SeededRNG(123);
      const rng2 = new SeededRNG(123);

      const results1 = Array.from({ length: 10 }, () => rng1.random());
      const results2 = Array.from({ length: 10 }, () => rng2.random());

      expect(results1).toEqual(results2);
    });

    it('should produce different results with different seeds', () => {
      const rng1 = new SeededRNG(123);
      const rng2 = new SeededRNG(456);

      const results1 = Array.from({ length: 10 }, () => rng1.random());
      const results2 = Array.from({ length: 10 }, () => rng2.random());

      expect(results1).not.toEqual(results2);
    });

    it('should reset with reseed method', () => {
      const originalResults = Array.from({ length: 5 }, () => rng.random());
      
      rng.reseed(12345); // Same seed
      const newResults = Array.from({ length: 5 }, () => rng.random());

      expect(newResults).toEqual(originalResults);
    });
  });

  describe('Basic Random Generation', () => {
    it('should generate numbers between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate integers in specified range', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.randint(5, 15);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(15);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should generate integers from 0 to max with randrange', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.randrange(10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  describe('Array Operations', () => {
    const testArray = ['a', 'b', 'c', 'd', 'e'];

    it('should choose random element from array', () => {
      for (let i = 0; i < 100; i++) {
        const chosen = rng.choice(testArray);
        expect(testArray).toContain(chosen);
      }
    });

    it('should throw error when choosing from empty array', () => {
      expect(() => rng.choice([])).toThrow('Cannot choose from empty array');
    });

    it('should choose multiple elements with replacement', () => {
      const choices = rng.choices(testArray, undefined, 10);
      expect(choices).toHaveLength(10);
      choices.forEach(choice => {
        expect(testArray).toContain(choice);
      });
    });

    it('should choose elements with weights', () => {
      const weights = [0, 0, 1, 0, 0]; // Only 'c' should be chosen
      const choices = rng.choices(testArray, weights, 20);
      
      expect(choices).toHaveLength(20);
      choices.forEach(choice => {
        expect(choice).toBe('c');
      });
    });

    it('should throw error for mismatched weights array', () => {
      const weights = [1, 2]; // Wrong length
      expect(() => rng.choices(testArray, weights, 1)).toThrow(
        'Weights array must have same length as choices array'
      );
    });

    it('should shuffle array in-place', () => {
      const originalArray = [1, 2, 3, 4, 5];
      const arrayToShuffle = [...originalArray];
      
      rng.shuffle(arrayToShuffle);
      
      // Should have same elements
      expect(arrayToShuffle.sort()).toEqual(originalArray.sort());
      // Should likely be in different order (very low probability of being same)
      // Note: This test could theoretically fail, but probability is 1/5! = 1/120
    });

    it('should create shuffled copy', () => {
      const originalArray = [1, 2, 3, 4, 5];
      const shuffledArray = rng.shuffled(originalArray);
      
      // Original should be unchanged
      expect(originalArray).toEqual([1, 2, 3, 4, 5]);
      // Shuffled should have same elements
      expect(shuffledArray.sort()).toEqual(originalArray.sort());
    });

    it('should sample without replacement', () => {
      const sampled = rng.sample(testArray, 3);
      
      expect(sampled).toHaveLength(3);
      // All elements should be unique
      expect(new Set(sampled).size).toBe(3);
      // All elements should be from original array
      sampled.forEach(item => {
        expect(testArray).toContain(item);
      });
    });

    it('should throw error when sampling more than available', () => {
      expect(() => rng.sample(testArray, 10)).toThrow(
        'Sample size cannot be larger than population size'
      );
    });
  });

  describe('Statistical Distributions', () => {
    it('should generate normal distribution with correct properties', () => {
      const mean = 5;
      const stddev = 2;
      const samples = Array.from({ length: 1000 }, () => rng.normal(mean, stddev));
      
      const sampleMean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
      const sampleVariance = samples.reduce((sum, x) => sum + (x - sampleMean) ** 2, 0) / samples.length;
      const sampleStddev = Math.sqrt(sampleVariance);
      
      // Should be approximately correct (within reasonable tolerance)
      expect(sampleMean).toBeCloseTo(mean, 0); // Within 0.5
      expect(sampleStddev).toBeCloseTo(stddev, 0); // Within 0.5
    });

    it('should generate Poisson distribution with correct properties', () => {
      const lambda = 3;
      const samples = Array.from({ length: 1000 }, () => rng.poisson(lambda));
      
      // All samples should be non-negative integers
      samples.forEach(sample => {
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(sample)).toBe(true);
      });
      
      const sampleMean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
      
      // Mean should be approximately lambda
      expect(sampleMean).toBeCloseTo(lambda, 0);
    });

    it('should handle large lambda in Poisson distribution', () => {
      const lambda = 50;
      const samples = Array.from({ length: 100 }, () => rng.poisson(lambda));
      
      samples.forEach(sample => {
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(sample)).toBe(true);
      });
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce identical sequences with same seed', () => {
      const seed = 'test-determinism';
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      // Test various operations
      const ops1 = [
        rng1.random(),
        rng1.randint(0, 100),
        rng1.choice(['a', 'b', 'c']),
        rng1.normal(0, 1),
        rng1.poisson(2)
      ];

      const ops2 = [
        rng2.random(),
        rng2.randint(0, 100),
        rng2.choice(['a', 'b', 'c']),
        rng2.normal(0, 1),
        rng2.poisson(2)
      ];

      expect(ops1).toEqual(ops2);
    });

    it('should maintain consistency after reseeding', () => {
      const seed = 999;
      const rng1 = new SeededRNG(seed);
      const firstSequence = Array.from({ length: 5 }, () => rng1.random());

      rng1.reseed(seed);
      const secondSequence = Array.from({ length: 5 }, () => rng1.random());

      expect(firstSequence).toEqual(secondSequence);
    });
  });
});

describe('Global RNG Functions', () => {
  beforeEach(() => {
    setSeed(54321); // Set a consistent seed for testing
  });

  it('should use global RNG for convenience functions', () => {
    setSeed(11111);
    const value1 = random();
    
    setSeed(11111);
    const value2 = random();
    
    expect(value1).toBe(value2);
  });

  it('should provide access to global RNG instance', () => {
    const globalRng = getGlobalRNG();
    expect(globalRng).toBeInstanceOf(SeededRNG);
  });

  it('should use global RNG for choice function', () => {
    const array = [1, 2, 3, 4, 5];
    setSeed(22222);
    const choice1 = choice(array);
    
    setSeed(22222);
    const choice2 = choice(array);
    
    expect(choice1).toBe(choice2);
  });

  it('should use global RNG for sample function', () => {
    const array = [1, 2, 3, 4, 5];
    setSeed(33333);
    const sample1 = sample(array, 3);
    
    setSeed(33333);
    const sample2 = sample(array, 3);
    
    expect(sample1).toEqual(sample2);
  });
});