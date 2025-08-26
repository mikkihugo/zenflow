"use strict";
/**
 * @fileoverview Async Utilities
 *
 * Professional async utilities using lodash-es.
 * Focused on function wrapping and async coordination.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncUtils = void 0;
var lodash_es_1 = require("lodash-es");
/**
 * Professional async utilities
 */
var AsyncUtils = /** @class */ (function () {
    function AsyncUtils() {
    }
    /**
     * Create debounced function
     */
    AsyncUtils.debounce = function (func, wait) {
        return (0, lodash_es_1.debounce)(func, wait);
    };
    /**
     * Create throttled function
     */
    AsyncUtils.throttle = function (func, wait) {
        return (0, lodash_es_1.throttle)(func, wait);
    };
    /**
     * Create promise-based delay
     */
    AsyncUtils.createDelay = function (milliseconds) {
        return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
    };
    /**
     * Create timeout promise
     */
    AsyncUtils.createTimeout = function (promise, milliseconds) {
        return Promise.race([
            promise,
            new Promise(function (_resolve, reject) {
                return setTimeout(function () { return reject(new Error('Operation timed out')); }, milliseconds);
            }, '),
        ]);
    };
    return AsyncUtils;
}());
exports.AsyncUtils = AsyncUtils;
