/**
 * @fileoverview Sampling Utilities for DSPy
 * 
 * Sampling functions for stochastic optimization algorithms.
 * Includes softmax, numerical stability, and weighted sampling.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { SeededRNG } from './rng';

/**
 * Compute softmax of an array with numerical stability
 * 
 * Uses the standard trick of subtracting the maximum value to prevent overflow.
 * 
 * @param scores - Array of scores to apply softmax to
 * @param temperature - Temperature parameter (higher = more random)
 * @returns Softmax probabilities
 */
export function softmax(scores: number[], temperature: number = 1.0): number[] {
  if (scores.length === 0) {
    return [];
  }

  if (temperature <= 0) {
    throw new Error('Temperature must be positive');
  }

  // Apply temperature scaling
  const scaledScores = scores.map(score => score / temperature);

  // Numerical stability: subtract max value
  const maxScore = Math.max(...scaledScores);
  const expScores = scaledScores.map(score => Math.exp(score - maxScore));

  // Compute sum for normalization
  const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);

  // Handle edge case where all exponentials are effectively zero
  if (sumExp === 0) {
    // Return uniform distribution
    return scores.map(() => 1 / scores.length);
  }

  // Normalize to get probabilities
  return expScores.map(exp => exp / sumExp);
}

/**
 * Sample an index according to softmax probabilities
 * 
 * @param scores - Array of scores to sample from
 * @param rng - Random number generator to use
 * @param temperature - Temperature parameter for softmax
 * @returns Sampled index
 */
export function softmaxSample(
  scores: number[], 
  rng: SeededRNG, 
  temperature: number = 1.0
): number {
  if (scores.length === 0) {
    throw new Error('Cannot sample from empty scores array');
  }

  if (scores.length === 1) {
    return 0;
  }

  const probabilities = softmax(scores, temperature);
  return weightedSample(probabilities, rng);
}

/**
 * Sample an index according to given probabilities
 * 
 * @param probabilities - Array of probabilities (must sum to 1)
 * @param rng - Random number generator to use
 * @returns Sampled index
 */
export function weightedSample(probabilities: number[], rng: SeededRNG): number {
  if (probabilities.length === 0) {
    throw new Error('Cannot sample from empty probabilities array');
  }

  const r = rng.random();
  let cumSum = 0;

  for (let i = 0; i < probabilities.length; i++) {
    cumSum += probabilities[i];
    if (r < cumSum) {
      return i;
    }
  }

  // Handle floating point precision issues - return last index
  return probabilities.length - 1;
}

/**
 * Sample multiple indices without replacement
 * 
 * @param scores - Array of scores to sample from
 * @param k - Number of samples to draw
 * @param rng - Random number generator to use
 * @param temperature - Temperature parameter for softmax
 * @returns Array of sampled indices
 */
export function softmaxSampleWithoutReplacement(
  scores: number[],
  k: number,
  rng: SeededRNG,
  temperature: number = 1.0
): number[] {
  if (k > scores.length) {
    throw new Error('Cannot sample more items than available');
  }

  if (k <= 0) {
    return [];
  }

  const remainingIndices = Array.from({ length: scores.length }, (_, i) => i);
  const sampledIndices: number[] = [];

  for (let i = 0; i < k; i++) {
    const remainingScores = remainingIndices.map(idx => scores[idx]);
    const sampleIdx = softmaxSample(remainingScores, rng, temperature);
    const actualIdx = remainingIndices[sampleIdx];
    
    sampledIndices.push(actualIdx);
    remainingIndices.splice(sampleIdx, 1);
  }

  return sampledIndices;
}

/**
 * Compute log-softmax for numerical stability in certain contexts
 * 
 * @param scores - Array of scores
 * @param temperature - Temperature parameter
 * @returns Log-softmax values
 */
export function logSoftmax(scores: number[], temperature: number = 1.0): number[] {
  if (scores.length === 0) {
    return [];
  }

  if (temperature <= 0) {
    throw new Error('Temperature must be positive');
  }

  const scaledScores = scores.map(score => score / temperature);
  const maxScore = Math.max(...scaledScores);
  
  // log-sum-exp trick
  const logSumExp = Math.log(
    scaledScores.reduce((sum, score) => sum + Math.exp(score - maxScore), 0)
  ) + maxScore;

  return scaledScores.map(score => score - logSumExp);
}

/**
 * Top-k sampling: sample from the k highest scores
 * 
 * @param scores - Array of scores
 * @param k - Number of top elements to consider
 * @param rng - Random number generator
 * @param temperature - Temperature parameter
 * @returns Sampled index from original array
 */
export function topKSample(
  scores: number[],
  k: number,
  rng: SeededRNG,
  temperature: number = 1.0
): number {
  if (scores.length === 0) {
    throw new Error('Cannot sample from empty scores array');
  }

  if (k <= 0) {
    throw new Error('k must be positive');
  }

  if (k >= scores.length) {
    return softmaxSample(scores, rng, temperature);
  }

  // Get indices sorted by score in descending order
  const sortedIndices = Array.from({ length: scores.length }, (_, i) => i)
    .sort((a, b) => scores[b] - scores[a]);

  // Take top k
  const topKIndices = sortedIndices.slice(0, k);
  const topKScores = topKIndices.map(idx => scores[idx]);

  // Sample from top k
  const sampledIdx = softmaxSample(topKScores, rng, temperature);
  return topKIndices[sampledIdx];
}

/**
 * Top-p (nucleus) sampling: sample from the smallest set of indices whose cumulative probability exceeds p
 * 
 * @param scores - Array of scores
 * @param p - Cumulative probability threshold (0 < p <= 1)
 * @param rng - Random number generator
 * @param temperature - Temperature parameter
 * @returns Sampled index from original array
 */
export function topPSample(
  scores: number[],
  p: number,
  rng: SeededRNG,
  temperature: number = 1.0
): number {
  if (scores.length === 0) {
    throw new Error('Cannot sample from empty scores array');
  }

  if (p <= 0 || p > 1) {
    throw new Error('p must be in (0, 1]');
  }

  const probabilities = softmax(scores, temperature);
  
  // Get indices sorted by probability in descending order
  const sortedIndices = Array.from({ length: scores.length }, (_, i) => i)
    .sort((a, b) => probabilities[b] - probabilities[a]);

  // Find the nucleus (smallest set with cumulative prob >= p)
  let cumProb = 0;
  const nucleusIndices: number[] = [];
  
  for (const idx of sortedIndices) {
    cumProb += probabilities[idx];
    nucleusIndices.push(idx);
    
    if (cumProb >= p) {
      break;
    }
  }

  // Sample from the nucleus
  const nucleusProbs = nucleusIndices.map(idx => probabilities[idx]);
  const nucleusSum = nucleusProbs.reduce((sum, prob) => sum + prob, 0);
  const normalizedProbs = nucleusProbs.map(prob => prob / nucleusSum);
  
  const sampledIdx = weightedSample(normalizedProbs, rng);
  return nucleusIndices[sampledIdx];
}

/**
 * Calculate entropy of a probability distribution
 * 
 * @param probabilities - Array of probabilities
 * @returns Entropy in nats
 */
export function entropy(probabilities: number[]): number {
  return -probabilities.reduce((sum, p) => {
    return p > 0 ? sum + p * Math.log(p) : sum;
  }, 0);
}

/**
 * Calculate KL divergence between two probability distributions
 * 
 * @param p - First distribution
 * @param q - Second distribution
 * @returns KL divergence ID(P||Q)
 */
export function klDivergence(p: number[], q: number[]): number {
  if (p.length !== q.length) {
    throw new Error('Distributions must have same length');
  }

  return p.reduce((sum, pi, i) => {
    const qi = q[i];
    if (pi > 0 && qi > 0) {
      return sum + pi * Math.log(pi / qi);
    } else if (pi > 0 && qi === 0) {
      return Infinity; // Undefined KL divergence
    }
    return sum;
  }, 0);
}