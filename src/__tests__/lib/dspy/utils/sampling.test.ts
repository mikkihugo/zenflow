/**
 * @fileoverview Tests for Sampling Utilities
 * 
 * Comprehensive test suite for softmax, weighted sampling, and related functions.
 * Ensures numerical stability and correct probability distributions.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG } from '../../../../lib/dspy/utils/rng';
import {
  softmax,
  softmaxSample,
  weightedSample,
  softmaxSampleWithoutReplacement,
  logSoftmax,
  topKSample,
  topPSample,
  entropy,
  klDivergence
} from '../../../../lib/dspy/utils/sampling';

describe('Softmax Functions', () => {
  let rng: SeededRNG;

  beforeEach(() => {
    rng = new SeededRNG(12345);
  });

  describe('softmax', () => {
    it('should return empty array for empty input', () => {
      expect(softmax([])).toEqual([]);
    });

    it('should return probabilities that sum to 1', () => {
      const scores = [1, 2, 3, 4, 5];
      const probs = softmax(scores);
      
      const sum = probs.reduce((acc, p) => acc + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });

    it('should return all positive probabilities', () => {
      const scores = [-10, -5, 0, 5, 10];
      const probs = softmax(scores);
      
      probs.forEach(p => {
        expect(p).toBeGreaterThan(0);
      });
    });

    it('should handle large scores without overflow', () => {
      const scores = [1000, 1001, 1002];
      const probs = softmax(scores);
      
      expect(probs).toHaveLength(3);
      probs.forEach(p => {
        expect(Number.isFinite(p)).toBe(true);
        expect(p).toBeGreaterThan(0);
      });
      
      const sum = probs.reduce((acc, p) => acc + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });

    it('should handle negative scores correctly', () => {
      const scores = [-1000, -999, -998];
      const probs = softmax(scores);
      
      expect(probs).toHaveLength(3);
      const sum = probs.reduce((acc, p) => acc + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });

    it('should apply temperature correctly', () => {
      const scores = [1, 2, 3];
      const probsLowTemp = softmax(scores, 0.1); // More peaked
      const probsHighTemp = softmax(scores, 10.0); // More uniform
      
      // Higher temperature should make distribution more uniform
      const entropyLow = entropy(probsLowTemp);
      const entropyHigh = entropy(probsHighTemp);
      
      expect(entropyHigh).toBeGreaterThan(entropyLow);
    });

    it('should throw error for non-positive temperature', () => {
      expect(() => softmax([1, 2, 3], 0)).toThrow('Temperature must be positive');
      expect(() => softmax([1, 2, 3], -1)).toThrow('Temperature must be positive');
    });

    it('should handle all equal scores', () => {
      const scores = [5, 5, 5, 5];
      const probs = softmax(scores);
      
      probs.forEach(p => {
        expect(p).toBeCloseTo(0.25, 10);
      });
    });

    it('should handle extreme score differences', () => {
      const scores = [0, 100]; // Very large difference
      const probs = softmax(scores);
      
      expect(probs[0]).toBeCloseTo(0, 10);
      expect(probs[1]).toBeCloseTo(1, 10);
    });
  });

  describe('logSoftmax', () => {
    it('should return log probabilities', () => {
      const scores = [1, 2, 3];
      const logProbs = logSoftmax(scores);
      const probs = softmax(scores);
      
      logProbs.forEach((logP, i) => {
        expect(logP).toBeCloseTo(Math.log(probs[i]), 10);
      });
    });

    it('should handle large scores numerically stable', () => {
      const scores = [1000, 1001, 1002];
      const logProbs = logSoftmax(scores);
      
      logProbs.forEach(logP => {
        expect(Number.isFinite(logP)).toBe(true);
      });
    });
  });
});

describe('Sampling Functions', () => {
  let rng: SeededRNG;

  beforeEach(() => {
    rng = new SeededRNG(54321);
  });

  describe('weightedSample', () => {
    it('should throw error for empty probabilities', () => {
      expect(() => weightedSample([], rng)).toThrow('Cannot sample from empty probabilities array');
    });

    it('should always return 0 for single element', () => {
      for (let i = 0; i < 10; i++) {
        expect(weightedSample([1.0], rng)).toBe(0);
      }
    });

    it('should respect probability weights', () => {
      const probs = [0.0, 1.0, 0.0]; // Only middle element has probability
      
      for (let i = 0; i < 100; i++) {
        expect(weightedSample(probs, rng)).toBe(1);
      }
    });

    it('should sample according to distribution over many trials', () => {
      const probs = [0.1, 0.2, 0.7]; // Heavily biased toward index 2
      const samples = Array.from({ length: 1000 }, () => weightedSample(probs, rng));
      
      const counts = [0, 0, 0];
      samples.forEach(sample => counts[sample]++);
      
      const frequencies = counts.map(count => count / 1000);
      
      // Should be approximately correct (within reasonable tolerance)
      expect(frequencies[0]).toBeCloseTo(0.1, 1);
      expect(frequencies[1]).toBeCloseTo(0.2, 1);
      expect(frequencies[2]).toBeCloseTo(0.7, 1);
    });

    it('should handle floating point precision issues', () => {
      // Probabilities that don't sum exactly to 1 due to floating point
      const probs = [0.1, 0.2, 0.3, 0.39999999];
      
      for (let i = 0; i < 100; i++) {
        const sample = weightedSample(probs, rng);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThan(probs.length);
      }
    });
  });

  describe('softmaxSample', () => {
    it('should throw error for empty scores', () => {
      expect(() => softmaxSample([], rng)).toThrow('Cannot sample from empty scores array');
    });

    it('should always return 0 for single score', () => {
      for (let i = 0; i < 10; i++) {
        expect(softmaxSample([5.0], rng)).toBe(0);
      }
    });

    it('should sample deterministically with same seed', () => {
      const scores = [1, 2, 3, 4, 5];
      
      const rng1 = new SeededRNG(999);
      const rng2 = new SeededRNG(999);
      
      const sample1 = softmaxSample(scores, rng1);
      const sample2 = softmaxSample(scores, rng2);
      
      expect(sample1).toBe(sample2);
    });

    it('should bias toward higher scores', () => {
      const scores = [1, 1, 1, 1, 10]; // Last element much higher
      const samples = Array.from({ length: 1000 }, () => softmaxSample(scores, rng, 1.0));
      
      const counts = new Array(5).fill(0);
      samples.forEach(sample => counts[sample]++);
      
      // Index 4 (highest score) should be sampled most frequently
      expect(counts[4]).toBeGreaterThan(counts[0]);
      expect(counts[4]).toBeGreaterThan(counts[1]);
      expect(counts[4]).toBeGreaterThan(counts[2]);
      expect(counts[4]).toBeGreaterThan(counts[3]);
    });

    it('should become more uniform with higher temperature', () => {
      const scores = [1, 1, 1, 1, 10];
      
      const samplesLowTemp = Array.from({ length: 1000 }, () => {
        const tempRng = new SeededRNG(Math.random());
        return softmaxSample(scores, tempRng, 0.1);
      });
      
      const samplesHighTemp = Array.from({ length: 1000 }, () => {
        const tempRng = new SeededRNG(Math.random());
        return softmaxSample(scores, tempRng, 10.0);
      });
      
      // Count occurrences of the highest score index (4)
      const countLowTemp = samplesLowTemp.filter(s => s === 4).length;
      const countHighTemp = samplesHighTemp.filter(s => s === 4).length;
      
      // Lower temperature should favor the highest score more
      expect(countLowTemp).toBeGreaterThan(countHighTemp);
    });
  });

  describe('softmaxSampleWithoutReplacement', () => {
    it('should return empty array for k=0', () => {
      expect(softmaxSampleWithoutReplacement([1, 2, 3], 0, rng)).toEqual([]);
    });

    it('should throw error when k > array length', () => {
      expect(() => softmaxSampleWithoutReplacement([1, 2], 3, rng)).toThrow(
        'Cannot sample more items than available'
      );
    });

    it('should return unique indices', () => {
      const scores = [1, 2, 3, 4, 5];
      const sampled = softmaxSampleWithoutReplacement(scores, 3, rng);
      
      expect(sampled).toHaveLength(3);
      expect(new Set(sampled).size).toBe(3); // All unique
      
      sampled.forEach(idx => {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(scores.length);
      });
    });

    it('should sample all indices when k equals array length', () => {
      const scores = [1, 2, 3];
      const sampled = softmaxSampleWithoutReplacement(scores, 3, rng);
      
      expect(sampled.sort()).toEqual([0, 1, 2]);
    });
  });

  describe('topKSample', () => {
    it('should throw error for empty scores', () => {
      expect(() => topKSample([], 1, rng)).toThrow('Cannot sample from empty scores array');
    });

    it('should throw error for non-positive k', () => {
      expect(() => topKSample([1, 2, 3], 0, rng)).toThrow('k must be positive');
    });

    it('should only sample from top k elements', () => {
      const scores = [1, 2, 3, 4, 5]; // Indices 3 and 4 are top 2
      const samples = Array.from({ length: 100 }, () => topKSample(scores, 2, rng));
      
      samples.forEach(sample => {
        expect([3, 4]).toContain(sample); // Only top 2 indices
      });
    });

    it('should fall back to regular softmax when k >= length', () => {
      const scores = [1, 2, 3];
      
      // These should be equivalent
      const regularSample = softmaxSample(scores, new SeededRNG(123));
      const topKSample_ = topKSample(scores, 5, new SeededRNG(123));
      
      expect(regularSample).toBe(topKSample_);
    });
  });

  describe('topPSample', () => {
    it('should throw error for invalid p values', () => {
      const scores = [1, 2, 3];
      expect(() => topPSample(scores, 0, rng)).toThrow('p must be in (0, 1]');
      expect(() => topPSample(scores, 1.5, rng)).toThrow('p must be in (0, 1]');
    });

    it('should sample from nucleus set', () => {
      // Create scores where top 2 elements have >90% of probability mass
      const scores = [1, 1, 10, 10]; // Indices 2 and 3 dominate
      const samples = Array.from({ length: 100 }, () => topPSample(scores, 0.9, rng));
      
      samples.forEach(sample => {
        expect([2, 3]).toContain(sample); // Should only sample from top elements
      });
    });

    it('should include all elements when p=1', () => {
      const scores = [1, 2, 3, 4, 5];
      const samples = Array.from({ length: 100 }, () => topPSample(scores, 1.0, rng));
      
      const uniqueSamples = new Set(samples);
      expect(uniqueSamples.size).toBeGreaterThan(1); // Should sample from multiple elements
    });
  });
});

describe('Information Theory Functions', () => {
  describe('entropy', () => {
    it('should return 0 for deterministic distribution', () => {
      const probs = [0, 1, 0, 0];
      expect(entropy(probs)).toBeCloseTo(0, 10);
    });

    it('should return maximum entropy for uniform distribution', () => {
      const probs = [0.25, 0.25, 0.25, 0.25];
      const maxEntropy = Math.log(4); // log(n) for uniform distribution over n elements
      expect(entropy(probs)).toBeCloseTo(maxEntropy, 10);
    });

    it('should handle zero probabilities correctly', () => {
      const probs = [0.5, 0, 0.5, 0];
      const expectedEntropy = -2 * (0.5 * Math.log(0.5));
      expect(entropy(probs)).toBeCloseTo(expectedEntropy, 10);
    });
  });

  describe('klDivergence', () => {
    it('should return 0 for identical distributions', () => {
      const p = [0.3, 0.3, 0.4];
      const q = [0.3, 0.3, 0.4];
      expect(klDivergence(p, q)).toBeCloseTo(0, 10);
    });

    it('should throw error for different length distributions', () => {
      const p = [0.5, 0.5];
      const q = [0.3, 0.3, 0.4];
      expect(() => klDivergence(p, q)).toThrow('Distributions must have same length');
    });

    it('should return infinity when q has zero where p is positive', () => {
      const p = [0.5, 0.5];
      const q = [0.5, 0.0];
      expect(klDivergence(p, q)).toBe(Infinity);
    });

    it('should be asymmetric', () => {
      const p = [0.8, 0.2];
      const q = [0.2, 0.8];
      
      const kl_pq = klDivergence(p, q);
      const kl_qp = klDivergence(q, p);
      
      expect(kl_pq).not.toBeCloseTo(kl_qp, 5); // Less strict precision
    });

    it('should be non-negative', () => {
      const p = [0.6, 0.4];
      const q = [0.3, 0.7];
      
      expect(klDivergence(p, q)).toBeGreaterThanOrEqual(0);
    });
  });
});