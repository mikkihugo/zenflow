/**
 * @fileoverview Foundation Type Guards
 * Runtime type checking utilities for foundation types.
 */
export function isUUID(value) {
    return (typeof value === 'string' &&
        /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value));
}
export function isTimestamp(value) {
    return typeof value === 'number' && value > 0;
}
export function isEmail(value) {
    return typeof value === 'string' && value.includes('@');
}
export function isString(value) {
    return typeof value === 'string';
}
export function isNumber(value) {
    return typeof value === 'number';
}
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isJsonValue(value) {
    if (value === null)
        return true;
    if (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean')
        return true;
    if (Array.isArray(value))
        return value.every(isJsonValue);
    if (isObject(value))
        return Object.values(value).every(isJsonValue);
    return false;
}
export function isJsonObject(value) {
    return isObject(value) && isJsonValue(value);
}
export function isJsonArray(value) {
    return Array.isArray(value) && value.every(isJsonValue);
}
