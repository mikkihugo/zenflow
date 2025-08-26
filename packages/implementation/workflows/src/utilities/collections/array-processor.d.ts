/**
 * @fileoverview Array Processing Utilities
 *
 * Professional array manipulation using lodash-es.
 * Focused on array operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
/**
 * Professional array processing utilities
 */
export declare class ArrayProcessor {
	/**
	 * Map array with type safety
	 */
	static map<T, U>(items: T[], iteratee: (item: T) => U): U[];
	/**
	 * Filter array with type safety
	 */
	static filter<T>(items: T[], predicate: (item: T) => boolean): T[];
	/**
	 * Sort array by key function
	 */
	static sortBy<T>(items: T[], keyFn: (item: T) => any): T[];
	/**
	 * Get unique values from array
	 */
	static unique<T>(items: T[]): T[];
	/**
	 * Flatten nested arrays
	 */
	static flatten<T>(items: T[][]): T[];
	/**
	 * Split array into chunks
	 */
	static chunk<T>(items: T[], size: number): T[][];
	/**
	 * Check if array is empty
	 */
	static isEmpty<T>(items: T[]): boolean;
}
//# sourceMappingURL=array-processor.d.ts.map
