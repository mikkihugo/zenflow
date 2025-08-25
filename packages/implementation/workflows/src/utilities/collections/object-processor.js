/**
 * @fileoverview Object Processing Utilities
 *
 * Professional object manipulation using lodash-es.
 * Focused on object operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { groupBy, keyBy, mapValues, pick, omit, cloneDeep, merge, isEmpty, isEqual } from 'lodash-es';
/**
 * Professional object processing utilities
 */
export class ObjectProcessor {
    /**
     * Group items by key function
     */
    static groupBy(items, keyFn) {
        return groupBy(items, keyFn);
    }
    /**
     * Create object map keyed by function result
     */
    static keyBy(items, keyFn) {
        return keyBy(items, keyFn);
    }
    /**
     * Transform object values while preserving keys
     */
    static mapValues(obj, valueFn) {
        return mapValues(obj, valueFn);
    }
    /**
     * Pick specific properties from object
     */
    static pick(obj, keys) {
        return pick(obj, keys);
    }
    /**
     * Omit specific properties from object
     */
    static omit(obj, keys) {
        return omit(obj, keys);
    }
    /**
     * Deep clone object safely
     */
    static cloneDeep(obj) {
        return cloneDeep(obj);
    }
    /**
     * Merge objects deeply
     */
    static merge(...objects) {
        return merge({}, ...objects);
    }
    /**
     * Check if object is empty
     */
    static isEmpty(value) {
        return isEmpty(value);
    }
    /**
     * Deep equality check
     */
    static isEqual(a, b) {
        return isEqual(a, b);
    }
}
//# sourceMappingURL=object-processor.js.map