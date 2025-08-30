/**
 * @fileoverview Foundation Primitives
 * Basic types that everything else builds on.
 */
// Enums
export var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["CRITICAL"] = "critical";
})(Priority || (Priority = {}));
export var Status;
(function (Status) {
    Status["PENDING"] = "pending";
    Status["IN_PROGRESS"] = "in_progress";
    Status["COMPLETED"] = "completed";
    Status["FAILED"] = "failed";
})(Status || (Status = {}));
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
export var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["PRODUCTION"] = "production";
    Environment["TEST"] = "test";
})(Environment || (Environment = {}));
// Type guards
export function isUUID(value) {
    return (typeof value === 'string' &&
        /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value));
}
export function isTimestamp(value) {
    return typeof value === 'number' && value > 0;
}
export function isISODateString(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
export function isEmail(value) {
    return typeof value === 'string' && value.includes('@');
}
export function isPrimitive(value) {
    return (value === null ||
        ['string', 'number', 'boolean', 'undefined'].includes(typeof value));
}
export function isNonEmptyArray(arr) {
    return Array.isArray(arr) && arr.length > 0;
}
// Utility functions
export function generateUUID() {
    if (typeof globalThis.crypto !== 'undefined' &&
        globalThis.crypto.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    // Fallback UUID v4 generation for Node.js environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function now() {
    return Date.now();
}
export function timestampFromDate(date) {
    return date.getTime();
}
export function dateFromTimestamp(timestamp) {
    return new Date(timestamp);
}
export function isoStringFromTimestamp(timestamp) {
    return new Date(timestamp).toISOString();
}
