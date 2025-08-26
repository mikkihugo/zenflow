/**
 * @fileoverview Array Processing Utilities
 *
 * Professional array manipulation using lodash-es.
 * Focused on array operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { chunk, filter, flatten, map, sortBy, uniq } from 'lodash-es';

/**
 * Professional array processing utilities
 */
export class ArrayProcessor {
  /**
   * Map array with type safety
   */
  static map<T, U>(items: T[], iteratee: (item: T) => U): U[] {
    return map(items, iteratee);
  }

  /**
   * Filter array with type safety
   */
  static filter<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return filter(items, predicate);
  }

  /**
   * Sort array by key function
   */
  static sortBy<T>(items: T[], keyFn: (item: T) => any): T[] {
    return sortBy(items, keyFn);
  }

  /**
   * Get unique values from array
   */
  static unique<T>(items: T[]): T[] {
    return uniq(items);
  }

  /**
   * Flatten nested arrays
   */
  static flatten<T>(items: T[][]): T[] {
    return flatten(items);
  }

  /**
   * Split array into chunks
   */
  static chunk<T>(items: T[], size: number): T[][] {
    return chunk(items, size);
  }

  /**
   * Check if array is empty
   */
  static isEmpty<T>(items: T[]): boolean {
    return items.length === 0;
  }
}
