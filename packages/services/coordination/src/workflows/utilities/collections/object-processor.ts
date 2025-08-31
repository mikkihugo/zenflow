/**
 * @fileoverview Object Processing Utilities
 *
 * Professional object manipulation using lodash-es.
 * Focused on object operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import {
  cloneDeep,
  groupBy,
  isEmpty,
  isEqual,
  keyBy,
  mapValues,
  merge,
  omit,
  pick,
} from 'lodash-es';
/**
 * Professional object processing utilities
 */
export class ObjectProcessor {
  /**
   * Group items by key function
   */
  static groupBy<T>(
    items: T[],
    keyFn: (item: T) => string
  ): Record<string, T[]> {
    return groupBy(items, keyFn);
  }
  /**
   * Create object map keyed by function result
   */
  static keyBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T> {
    return keyBy(items, keyFn);
  }
  /**
   * Transform object values while preserving keys
   */
  static mapValues<T, U>(
    obj: Record<string, T>,
    valueFn: (value: T) => U
  ): Record<string, U> {
    return mapValues(obj, valueFn);
  }
  /**
   * Pick specific properties from object
   */
  static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return pick(obj, keys as string[]) as Pick<T, K>;
  }
  /**
   * Omit specific properties from object
   */
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return omit(obj as Record<string, unknown>, keys as string[]) as Omit<T, K>;
  }
  /**
   * Deep clone object safely
   */
  static cloneDeep<T>(obj: T): T {
    return cloneDeep(obj);
  }
  /**
   * Merge objects deeply
   */
  static merge<T>(...objects: Partial<T>[]): T {
    return merge({}, ...objects);
  }
  /**
   * Check if object is empty
   */
  static isEmpty(value: unknown): boolean {
    return isEmpty(value);
  }
  /**
   * Deep equality check
   */
  static isEqual(a: unknown, b: unknown): boolean {
    return isEqual(a, b);
  }
}
