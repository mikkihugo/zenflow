/**
 * DI token creation utilities.
 * Provides type-safe token creation for dependency injection.
 */
/**
 * @file Token-factory implementation.
 */
/**
 * Creates a typed DI token for service registration.
 *
 * @param name
 * @param type
 * @example
 */
export function createToken(name, type) {
    return {
        symbol: Symbol(name),
        name,
        ...(type !== undefined && { type }),
    };
}
/**
 * Creates a DI token from a class constructor.
 *
 * @param constructor
 * @example
 */
export function createTokenFromClass(constructor) {
    return createToken(constructor.name, constructor);
}
/**
 * Type guard to check if a value is a DI token.
 *
 * @param value
 * @example
 */
export function isDIToken(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.symbol === 'symbol' &&
        typeof value.name === 'string');
}
/**
 * Utility to get token display name for debugging.
 *
 * @param token
 * @example
 */
export function getTokenName(token) {
    return token.name;
}
/**
 * Utility to compare tokens for equality.
 *
 * @param token1
 * @param token2
 * @example
 */
export function tokensEqual(token1, token2) {
    return token1.symbol === token2.symbol;
}
