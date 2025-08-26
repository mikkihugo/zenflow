"use strict";
/**
 * @fileoverview Date Calculation Utilities
 *
 * Professional date arithmetic using date-fns library.
 * Focused on duration and time manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateCalculator = void 0;
var date_fns_1 = require("date-fns");
/**
 * Professional date calculation utilities
 */
var DateCalculator = /** @class */ (function () {
    function DateCalculator() {
    }
    /**
     * Calculate duration in milliseconds
     */
    DateCalculator.getDurationMs = function (startDate, endDate) {
        if (endDate === void 0) { endDate = new Date(); }
        return (0, date_fns_1.differenceInMilliseconds)(endDate, startDate);
    };
    /**
     * Add minutes to date
     */
    DateCalculator.addMinutes = function (date, minutes) {
        return (0, date_fns_1.addMinutes)(date, minutes);
    };
    /**
     * Subtract minutes from date
     */
    DateCalculator.subMinutes = function (date, minutes) {
        return (0, date_fns_1.subMinutes)(date, minutes);
    };
    /**
     * Format duration in human-readable format
     */
    DateCalculator.formatDuration = function (startDate, endDate) {
        if (endDate === void 0) { endDate = new Date(); }
        var duration = (0, date_fns_1.intervalToDuration)({ start: startDate, end: endDate });
        return (0, date_fns_1.formatDuration)(duration);
    };
    /**
     * Check if date is within range
     */
    DateCalculator.isWithinRange = function (date, startRange, endRange) {
        return date >= startRange && date <= endRange;
    };
    return DateCalculator;
}());
exports.DateCalculator = DateCalculator;
