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
export class SeededRNG {
    seed;
    current;
    constructor(seed = 42) {
        this.seed = seed;
        this.current = seed;
    }
    /**
     * Generate next random number between 0 and 1
     */
    random() {
        // Linear Congruential Generator (LCG) - same as used in many standard libraries
        this.current = (this.current * 1664525 + 1013904223) % 0x100000000;
        return this.current / 0x100000000;
    }
    /**
     * Generate random integer between min and max (inclusive)
     */
    randint(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
    /**
     * Generate random number from normal distribution
     */
    gauss(mu = 0, sigma = 1) {
        // Box-Muller transform
        const u1 = this.random();
        const u2 = this.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * sigma + mu;
    }
    /**
     * Choose random element from array
     */
    choice(array) {
        if (array.length === 0) {
            throw new Error("Cannot choose from empty array");
        }
        const index = Math.floor(this.random() * array.length);
        const item = array[index];
        if (item === undefined) {
            throw new Error("Array access returned undefined");
        }
        return item;
    }
    /**
     * Sample k elements from array without replacement
     */
    sample(array, k) {
        if (k > array.length) {
            throw new Error("Sample size cannot be larger than array length");
        }
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            const temp = shuffled[i];
            const swapItem = shuffled[j];
            if (temp !== undefined && swapItem !== undefined) {
                shuffled[i] = swapItem;
                shuffled[j] = temp;
            }
        }
        return shuffled.slice(0, k);
    }
    /**
     * Shuffle array in-place
     */
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            const temp = result[i];
            const swapItem = result[j];
            if (temp !== undefined && swapItem !== undefined) {
                result[i] = swapItem;
                result[j] = temp;
            }
        }
        return result;
    }
    /**
     * Reset RNG to initial seed
     */
    reset() {
        this.current = this.seed;
    }
    /**
     * Get current seed
     */
    getSeed() {
        return this.seed;
    }
    /**
     * Set new seed
     */
    setSeed(seed) {
        this.seed = seed;
        this.current = seed;
    }
}
export default SeededRNG;
