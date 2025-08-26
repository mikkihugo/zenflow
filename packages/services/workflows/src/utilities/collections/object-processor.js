"use strict";
/**
 * @fileoverview Object Processing Utilities
 *
 * Professional object manipulation using lodash-es.
 * Focused on object operations and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectProcessor = void 0;
var lodash_es_1 = require("lodash-es");
/**
 * Professional object processing utilities
 */
var ObjectProcessor = /** @class */ (function () {
    function ObjectProcessor() {
    }
    /**
     * Group items by key function
     */
    ObjectProcessor.groupBy = function (items, keyFn) {
        return (0, lodash_es_1.groupBy)(items, keyFn);
    };
    /**
     * Create object map keyed by function result
     */
    ObjectProcessor.keyBy = function (items, keyFn) {
        return (0, lodash_es_1.keyBy)(items, keyFn);
    };
    /**
     * Transform object values while preserving keys
     */
    ObjectProcessor.mapValues = function (obj, valueFn) {
        return (0, lodash_es_1.mapValues)(obj, valueFn);
    };
    /**
     * Pick specific properties from object
     */
    ObjectProcessor.pick = function (obj, keys) {
        return (0, lodash_es_1.pick)(obj, keys);
    };
    /**
     * Omit specific properties from object
     */
    ObjectProcessor.omit = function (obj, keys) {
        return (0, lodash_es_1.omit)(obj, keys);
    };
    /**
     * Deep clone object safely
     */
    ObjectProcessor.cloneDeep = function (obj) {
        return (0, lodash_es_1.cloneDeep)(obj);
    };
    /**
     * Merge objects deeply
     */
    ObjectProcessor.merge = function () {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i] = arguments[_i];
        }
        return lodash_es_1.merge.apply(void 0, __spreadArray([{}], objects, false));
    };
    /**
     * Check if object is empty
     */
    ObjectProcessor.isEmpty = function (value) {
        return (0, lodash_es_1.isEmpty)(value);
    };
    /**
     * Deep equality check
     */
    ObjectProcessor.isEqual = function (a, b) {
        return (0, lodash_es_1.isEqual)(a, b);
    };
    return ObjectProcessor;
}());
exports.ObjectProcessor = ObjectProcessor;
