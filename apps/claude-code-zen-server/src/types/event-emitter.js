/**
 * @file Event Emitter Types
 *
 * Type definitions for event emitters and error objects with proper typing
 * for properties like 'on', 'code', and other event-related functionality.
 */
/**
 * Type guard to check if an error has a code property
 */
export function hasErrorCode(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (typeof error.code === 'string' ||
            typeof error.code === 'number'));
}
/**
 * Type guard to check if error is a system error
 */
export function isSystemError(error) {
    return (hasErrorCode(error) &&
        typeof error.errno === 'number' &&
        typeof error.syscall === 'string');
}
/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error) {
    return hasErrorCode(error) && typeof error.code === 'string';
}
/**
 * Type guard to check if object has event emitter capabilities
 */
export function isEventEmitter(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'on' in obj &&
        typeof obj.on === 'function' &&
        'emit' in obj &&
        typeof obj.emit === 'function');
}
/**
 * Type guard for server instance
 */
export function isServerInstance(obj) {
    return (isEventEmitter(obj) &&
        'close' in obj &&
        typeof obj.close === 'function' &&
        'listen' in obj &&
        typeof obj.listen === 'function');
}
//# sourceMappingURL=event-emitter.js.map