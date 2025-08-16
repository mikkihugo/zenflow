/**
 * DI token creation utilities.
 * Provides type-safe token creation for dependency injection.
 */
/**
 * @file Token-factory implementation.
 */
import type { Constructor, DIToken } from '../types/di-types';
/**
 * Creates a typed DI token for service registration.
 *
 * @param name
 * @param type
 * @example
 */
export declare function createToken<T>(name: string, type?: Constructor<T>): DIToken<T>;
/**
 * Creates a DI token from a class constructor.
 *
 * @param constructor
 * @example
 */
export declare function createTokenFromClass<T>(constructor: Constructor<T>): DIToken<T>;
/**
 * Type guard to check if a value is a DI token.
 *
 * @param value
 * @example
 */
export declare function isDIToken<T>(value: unknown): value is DIToken<T>;
/**
 * Utility to get token display name for debugging.
 *
 * @param token
 * @example
 */
export declare function getTokenName<T>(token: DIToken<T>): string;
/**
 * Utility to compare tokens for equality.
 *
 * @param token1
 * @param token2
 * @example
 */
export declare function tokensEqual<T>(token1: DIToken<T>, token2: DIToken<T>): boolean;
//# sourceMappingURL=token-factory.d.ts.map