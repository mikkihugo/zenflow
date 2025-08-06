/**
 * DI token creation utilities
 * Provides type-safe token creation for dependency injection
 */

import type { Constructor, DIToken } from '../types/di-types';

/**
 * Creates a typed DI token for service registration
 *
 * @param name
 * @param type
 */
export function createToken<T>(name: string, type?: Constructor<T>): DIToken<T> {
  return {
    symbol: Symbol(name),
    name,
    type,
  };
}

/**
 * Creates a DI token from a class constructor
 *
 * @param constructor
 */
export function createTokenFromClass<T>(constructor: Constructor<T>): DIToken<T> {
  return createToken(constructor.name, constructor);
}

/**
 * Type guard to check if a value is a DI token
 *
 * @param value
 */
export function isDIToken<T>(value: any): value is DIToken<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.symbol === 'symbol' &&
    typeof value.name === 'string'
  );
}

/**
 * Utility to get token display name for debugging
 *
 * @param token
 */
export function getTokenName<T>(token: DIToken<T>): string {
  return token.name;
}

/**
 * Utility to compare tokens for equality
 *
 * @param token1
 * @param token2
 */
export function tokensEqual<T>(token1: DIToken<T>, token2: DIToken<T>): boolean {
  return token1.symbol === token2.symbol;
}
