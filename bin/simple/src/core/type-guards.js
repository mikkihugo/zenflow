export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
export function isString(value) {
    return typeof value === 'string';
}
export function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isNullOrUndefined(value) {
    return value === null || value === undefined;
}
export function isDefined(value) {
    return value !== null && value !== undefined;
}
export function assertDefined(value, message) {
    if (!isDefined(value)) {
        throw new Error(message || 'Value is null or undefined');
    }
}
export function hasProperty(obj, prop) {
    return isObject(obj) && prop in obj;
}
export function safeJsonParse(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
export function safeJsonStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
}
//# sourceMappingURL=type-guards.js.map