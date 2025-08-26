"use strict";
/**
 * @fileoverview Date Formatting Utilities
 *
 * Professional date formatting using date-fns library.
 * Focused on timestamp generation and format conversion.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormatter = void 0;
var foundation_1 = require("@claude-zen/foundation");
var format = foundation_1.dateFns.format, parseISO = foundation_1.dateFns.parseISO, isValid = foundation_1.dateFns.isValid;
/**
 * Professional date formatting utilities
 */
var DateFormatter = /** @class */ (function () {
    function DateFormatter() {
    }
    /**
     * Format date as ISO string with proper timezone
     */
    DateFormatter.formatISOString = function (date) {
        if (date === void 0) { date = new Date(); }
        return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
        ';
    };
    /**
     * Create standardized workflow timestamp
     */
    DateFormatter.createTimestamp = function () {
        return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        ';
    };
    /**
     * Parse ISO string with validation
     */
    DateFormatter.parseISO = function (dateString) {
        try {
            var parsed = parseISO(dateString);
            return isValid(parsed) ? parsed : null;
        }
        catch (_a) {
            return null;
        }
    };
    /**
     * Format relative time display
     */
    DateFormatter.formatRelative = function (date) {
        var now = new Date();
        var diffMs = now.getTime() - date.getTime();
        var minutes = Math.floor(diffMs / 60000);
        if (minutes < 1)
            return 'just now;;
        if (minutes < 60)
            return "".concat(minutes, "m ago");
        "\n\n    const hours = Math.floor(minutes / 60);\n    if (hours < 24) return ";
        $hoursh;
        ago(templateObject_1 || (templateObject_1 = __makeTemplateObject([";"], [";"])));
        var days = Math.floor(hours / 24);
        return "".concat(days, "d ago");
        "\n  }\n}\n";
    };
    return DateFormatter;
}());
exports.DateFormatter = DateFormatter;
var templateObject_1;
