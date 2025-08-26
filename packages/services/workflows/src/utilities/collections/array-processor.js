"use strict";
/**
 * @fileoverview Array Processing Utilities
 *
 * Professional array manipulation using lodash-es.
 * Focused on array operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayProcessor = void 0;
var lodash_es_1 = require("lodash-es");
/**
 * Professional array processing utilities
 */
var ArrayProcessor = /** @class */ (function () {
    function ArrayProcessor() {
    }
    /**
     * Map array with type safety
     */
    ArrayProcessor.map = function (items, iteratee) {
        return (0, lodash_es_1.map)(items, iteratee);
    };
    /**
     * Filter array with type safety
     */
    ArrayProcessor.filter = function (items, predicate) {
        return (0, lodash_es_1.filter)(items, predicate);
    };
    /**
     * Sort array by key function
     */
    ArrayProcessor.sortBy = function (items, keyFn) {
        return (0, lodash_es_1.sortBy)(items, keyFn);
    };
    /**
     * Get unique values from array
     */
    ArrayProcessor.unique = function (items) {
        return (0, lodash_es_1.uniq)(items);
    };
    /**
     * Flatten nested arrays
     */
    ArrayProcessor.flatten = function (items) {
        return (0, lodash_es_1.flatten)(items);
    };
    /**
     * Split array into chunks
     */
    ArrayProcessor.chunk = function (items, size) {
        return (0, lodash_es_1.chunk)(items, size);
    };
    /**
     * Check if array is empty
     */
    ArrayProcessor.isEmpty = function (items) {
        return items.length === 0;
    };
    return ArrayProcessor;
}());
exports.ArrayProcessor = ArrayProcessor;
