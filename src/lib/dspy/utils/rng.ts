/**
 * @fileoverview Seedable Random Number Generator
 * 
 * Deterministic RNG implementation for reproducible DSPy experiments.
 * Essential for test reproducibility and experiment consistency.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import seedrandom from 'seedrandom';

/**
 * Seedable Random Number Generator
 * 
 * Provides deterministic random numbers for reproducible experiments.
 * Compatible with Stanford DSPy random patterns.
 */
export class SeededRNG {
  private rng: ReturnType<typeof seedrandom>;
  private seed: string | number;

  /**
   * Create a new SeededRNG instance
   * 
   * @param seed - Seed value for reproducible randomness
   */
  constructor(seed: string | number = 0) {
    this.seed = seed;
    this.rng = seedrandom(String(seed));
  }

  /**
   * Get a random float between 0 and 1
   * 
   * @returns Random float in [0, 1)
   */
  random(): number {
    return this.rng();
  }

  /**
   * Get a random integer between min and max (exclusive)
   * 
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer in [min, max)
   */
  randint(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Get a random integer between 0 and max (exclusive)
   * 
   * @param max - Maximum value (exclusive)
   * @returns Random integer in [0, max)
   */
  randrange(max: number): number {
    return this.randint(0, max);
  }

  /**
   * Choose a random element from an array
   * 
   * @param array - Array to choose from
   * @returns Random element from the array
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    return array[this.randrange(array.length)];
  }

  /**
   * Choose multiple random elements from an array with replacement
   * 
   * @param array - Array to choose from
   * @param weights - Optional weights for each element
   * @param k - Number of elements to choose
   * @returns Array of randomly chosen elements
   */
  choices<T>(array: T[], weights?: number[], k: number = 1): T[] {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }

    const result: T[] = [];
    
    if (weights) {
      if (weights.length !== array.length) {
        throw new Error('Weights array must have same length as choices array');
      }
      
      // Cumulative sum for weighted selection
      const cumSum = weights.reduce((acc, weight, i) => {
        acc.push((acc[i - 1] || 0) + weight);
        return acc;
      }, [] as number[]);
      
      const totalWeight = cumSum[cumSum.length - 1];
      
      for (let i = 0; i < k; i++) {
        const r = this.random() * totalWeight;
        const index = cumSum.findIndex(sum => r < sum);
        result.push(array[index]);
      }
    } else {
      // Uniform selection
      for (let i = 0; i < k; i++) {
        result.push(this.choice(array));
      }
    }
    
    return result;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm
   * 
   * @param array - Array to shuffle
   */
  shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randrange(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Create a shuffled copy of an array
   * 
   * @param array - Array to shuffle
   * @returns New shuffled array
   */
  shuffled<T>(array: T[]): T[] {
    const copy = [...array];
    this.shuffle(copy);
    return copy;
  }

  /**
   * Sample without replacement from an array
   * 
   * @param array - Array to sample from
   * @param k - Number of elements to sample
   * @returns Array of sampled elements
   */
  sample<T>(array: T[], k: number): T[] {
    if (k > array.length) {
      throw new Error('Sample size cannot be larger than population size');
    }
    
    const shuffled = this.shuffled(array);
    return shuffled.slice(0, k);
  }

  /**
   * Generate a random number from normal distribution (Box-Muller transform)
   * 
   * @param mean - Mean of the distribution
   * @param stddev - Standard deviation of the distribution
   * @returns Random number from normal distribution
   */
  normal(mean: number = 0, stddev: number = 1): number {
    // Box-Muller transform
    const u1 = this.random();
    const u2 = this.random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stddev + mean;
  }

  /**
   * Generate a random number from Poisson distribution
   * 
   * @param lambda - Rate parameter
   * @returns Random number from Poisson distribution
   */
  poisson(lambda: number): number {
    // Knuth's algorithm for small lambda
    if (lambda < 30) {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      
      do {
        k++;
        p *= this.random();
      } while (p > L);
      
      return k - 1;
    } else {
      // Normal approximation for large lambda
      return Math.max(0, Math.round(this.normal(lambda, Math.sqrt(lambda))));
    }
  }

  /**
   * Reset the RNG with a new seed
   * 
   * @param seed - New seed value
   */
  reseed(seed: string | number): void {
    this.seed = seed;
    this.rng = seedrandom(String(seed));
  }

  /**
   * Get the current seed
   */
  getSeed(): string | number {
    return this.seed;
  }
}

/**
 * Global seeded RNG instance for convenience
 */
let globalRNG = new SeededRNG(0);

/**
 * Set the global RNG seed
 * 
 * @param seed - Seed value
 */
export function setSeed(seed: string | number): void {
  globalRNG.reseed(seed);
}

/**
 * Get a random float between 0 and 1 from global RNG
 */
export function random(): number {
  return globalRNG.random();
}

/**
 * Get a random integer from global RNG
 */
export function randint(min: number, max: number): number {
  return globalRNG.randint(min, max);
}

/**
 * Choose a random element from global RNG
 */
export function choice<T>(array: T[]): T {
  return globalRNG.choice(array);
}

/**
 * Choose multiple elements with weights from global RNG
 */
export function choices<T>(array: T[], weights?: number[], k: number = 1): T[] {
  return globalRNG.choices(array, weights, k);
}

/**
 * Sample without replacement from global RNG
 */
export function sample<T>(array: T[], k: number): T[] {
  return globalRNG.sample(array, k);
}

/**
 * Shuffle array in-place with global RNG
 */
export function shuffle<T>(array: T[]): void {
  globalRNG.shuffle(array);
}

/**
 * Get the global RNG instance
 */
export function getGlobalRNG(): SeededRNG {
  return globalRNG;
}