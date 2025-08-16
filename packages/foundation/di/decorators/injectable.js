/**
 * Injectable decorator implementation.
 * Marks classes as injectable and enables automatic dependency resolution.
 */
/**
 * @file Injectable implementation.
 */
import 'reflect-metadata';
// Metadata keys
const INJECTION_TOKENS_KEY = Symbol('injection_tokens');
const INJECTABLE_KEY = Symbol('injectable');
/**
 * Injectable decorator for marking classes as injectable.
 *
 * @param constructor
 * @example
 */
export function injectable(constructor) {
    // Mark as injectable
    Reflect.defineMetadata(INJECTABLE_KEY, true, constructor);
    // Get parameter types from TypeScript metadata
    const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const injectionTokens = getInjectionTokens(constructor) || new Array(paramTypes.length);
    // Store injection metadata
    setInjectionMetadata(constructor, {
        parameterTypes: paramTypes,
        injectionTokens: injectionTokens,
    });
    return constructor;
}
/**
 * Inject decorator for parameter injection.
 *
 * @param token
 * @example
 */
export function inject(token) {
    return (target, _propertyKey, parameterIndex) => {
        const existingTokens = Reflect.getMetadata(INJECTION_TOKENS_KEY, target) || [];
        existingTokens[parameterIndex] = token;
        Reflect.defineMetadata(INJECTION_TOKENS_KEY, existingTokens, target);
    };
}
/**
 * Check if a class is marked as injectable.
 *
 * @param constructor
 * @example
 */
export function isInjectable(constructor) {
    return Reflect.getMetadata(INJECTABLE_KEY, constructor) === true;
}
/**
 * Get injection tokens for a constructor.
 *
 * @param constructor
 * @example
 */
export function getInjectionTokens(constructor) {
    return Reflect.getMetadata(INJECTION_TOKENS_KEY, constructor);
}
/**
 * Set injection tokens for a constructor.
 *
 * @param constructor
 * @param tokens
 * @example
 */
export function setInjectionTokens(constructor, tokens) {
    Reflect.defineMetadata(INJECTION_TOKENS_KEY, tokens, constructor);
}
/**
 * Get injection metadata for a constructor.
 *
 * @param constructor
 * @example
 */
export function getInjectionMetadata(constructor) {
    const parameterTypes = Reflect.getMetadata('design:paramtypes', constructor);
    const injectionTokens = getInjectionTokens(constructor);
    if (!parameterTypes) {
        return undefined;
    }
    return {
        parameterTypes,
        injectionTokens: injectionTokens || new Array(parameterTypes.length),
    };
}
/**
 * Set injection metadata for a constructor.
 *
 * @param constructor
 * @param metadata
 * @example
 */
export function setInjectionMetadata(constructor, metadata) {
    Reflect.defineMetadata('design:paramtypes', metadata?.parameterTypes, constructor);
    setInjectionTokens(constructor, metadata?.injectionTokens);
}
/**
 * Copy metadata from source to target constructor.
 *
 * @param source
 * @param target
 * @example
 */
export function copyMetadata(source, target) {
    const keys = Reflect.getMetadataKeys(source);
    for (const key of keys) {
        const metadata = Reflect.getMetadata(key, source);
        Reflect.defineMetadata(key, metadata, target);
    }
}
//# sourceMappingURL=injectable.js.map