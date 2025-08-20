/**
 * @fileoverview Seeded Random Number Generator - Production Grade
 *
 * Provides reproducible random number generation for DSPy teleprompters.
 * Essential for maintaining consistency in ML experiments and teleprompter optimization.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Seeded Random Number Generator using Linear Congruential Generator (LCG)
 * Provides reproducible random number generation for teleprompter experiments
 */
export declare class SeededRNG {
    private seed;
    private current;
    constructor(seed?: number);
    /**
     * Generate next random number between 0 and 1
     */
    random(): number;
    /**
     * Generate random integer between min and max (inclusive)
     */
    randint(min: number, max: number): number;
    /**
     * Generate random number from normal distribution
     */
    gauss(mu?: number, sigma?: number): number;
    /**
     * Choose random element from array
     */
    choice<T>(array: T[]): T;
    /**
     * Sample k elements from array without replacement
     */
    sample<T>(array: T[], k: number): T[];
    /**
     * Shuffle array in-place
     */
    shuffle<T>(array: T[]): T[];
    /**
     * Reset RNG to initial seed
     */
    reset(): void;
    /**
     * Get current seed
     */
    getSeed(): number;
    /**
     * Set new seed
     */
    setSeed(seed: number): void;
}
export default SeededRNG;
//# sourceMappingURL=seeded-rng.d.ts.map