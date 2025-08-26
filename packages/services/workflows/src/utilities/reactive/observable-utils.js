"use strict";
/**
 * @fileoverview Observable Utilities
 *
 * Professional reactive programming using RxJS library.
 * Focused on Observable creation and manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableUtils = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
/**
 * Professional Observable utilities
 */
var ObservableUtils = /** @class */ (function () {
    function ObservableUtils() {
    }
    /**
     * Create delay observable
     */
    ObservableUtils.delay = function (milliseconds) {
        return (0, rxjs_1.timer)(milliseconds);
    };
    /**
     * Create subject for event streaming
     */
    ObservableUtils.createSubject = function () {
        return new rxjs_1.Subject();
    };
    /**
     * Create behavior subject with initial value
     */
    ObservableUtils.createBehaviorSubject = function (initialValue) {
        return new rxjs_1.BehaviorSubject(initialValue);
    };
    /**
     * Create throttled stream
     */
    ObservableUtils.throttleStream = function (source, milliseconds) {
        return source.pipe((0, operators_1.throttleTime)(milliseconds));
    };
    /**
     * Create debounced stream
     */
    ObservableUtils.debounceStream = function (source, milliseconds) {
        return source.pipe((0, operators_1.debounceTime)(milliseconds));
    };
    /**
     * Filter distinct values in stream
     */
    ObservableUtils.distinctStream = function (source) {
        return source.pipe((0, operators_1.distinctUntilChanged)())();
    };
    /**
     * Create interval timer
     */
    ObservableUtils.createInterval = function (milliseconds) {
        return (0, rxjs_1.interval)(milliseconds);
    };
    /**
     * Combine multiple observables
     */
    ObservableUtils.combineStreams = function (sources) {
        return (0, rxjs_1.combineLatest)(sources);
    };
    return ObservableUtils;
}());
exports.ObservableUtils = ObservableUtils;
