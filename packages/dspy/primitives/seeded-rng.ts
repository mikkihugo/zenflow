/**
 * @fileoverview Seeded Random Number Generator
 * 
 * Provides deterministic random number generation with seeding support
 * for reproducible results in DSPy teleprompter operations.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

/**
 * Seeded random number generator for reproducible randomness
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number = 0) {
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  random(): number {
    // Linear congruential generator (LCG)
    this.state = (this.state * 1664525 + 1013904223) % 0x100000000;
    return this.state / 0x100000000;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  randint(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Choose random element from array
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const index = Math.floor(this.random() * array.length);
    return array[index];
  }

  /**
   * Shuffle array in place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Generate array of random numbers
   */
  randoms(count: number): number[] {
    return Array.from({ length: count }, () => this.random());
  }

  /**
   * Reset generator with new seed
   */
  seed(newSeed: number): void {
    this.state = newSeed;
  }

  /**
   * Get current state for saving/restoring
   */
  getState(): number {
    return this.state;
  }

  /**
   * Restore from saved state
   */
  setState(state: number): void {
    this.state = state;
  }
}