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
  static map(items, iteratee) {
    return map(items, iteratee);
  }
  /**
   * Filter array with type safety
   */
  static filter(items, predicate) {
    return filter(items, predicate);
  }
  /**
   * Sort array by key function
   */
  static sortBy(items, keyFn) {
    return sortBy(items, keyFn);
  }
  /**
   * Get unique values from array
   */
  static unique(items) {
    return uniq(items);
  }
  /**
   * Flatten nested arrays
   */
  static flatten(items) {
    return flatten(items);
  }
  /**
   * Split array into chunks
   */
  static chunk(items, size) {
    return chunk(items, size);
  }
  /**
   * Check if array is empty
   */
  static isEmpty(items) {
    return items.length === 0;
  }
}
//# sourceMappingURL=array-processor.js.map
