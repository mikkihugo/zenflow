/**
 * Inject decorator implementation.
 * Enables parameter-level dependency injection.
 */
/**
 * @file Inject implementation.
 */
import 'reflect-metadata';
import { getInjectionTokens, setInjectionTokens } from './injectable';
/**
 * Inject decorator for marking constructor parameters for injection.
 *
 * @param token
 * @example
 */
export function inject(token) {
    return (target, propertyKey, parameterIndex) => {
        // Get existing injection tokens
        const existingTokens = getInjectionTokens(target) || [];
        // Ensure array is large enough
        while (existingTokens.length <= parameterIndex) {
            existingTokens.push(undefined);
        }
        // Set the token for this parameter
        existingTokens[parameterIndex] = token;
        // Update metadata
        setInjectionTokens(target, existingTokens);
    };
}
/**
 * Get the injection token for a specific parameter.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export function getInjectionToken(constructor, parameterIndex) {
    const tokens = getInjectionTokens(constructor);
    return tokens?.[parameterIndex];
}
/**
 * Check if a parameter has an injection token.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export function hasInjectionToken(constructor, parameterIndex) {
    return getInjectionToken(constructor, parameterIndex) !== undefined;
}
//# sourceMappingURL=inject.js.map