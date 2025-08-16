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
export function createToken<T>(
  name: string,
  type?: Constructor<T>
): DIToken<T> {
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
export function createTokenFromClass<T>(
  constructor: Constructor<T>
): DIToken<T> {
  return createToken(constructor.name, constructor);
}

/**
 * Type guard to check if a value is a DI token.
 *
 * @param value
 * @example
 */
export function isDIToken<T>(value: unknown): value is DIToken<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).symbol === 'symbol' &&
    typeof (value as any).name === 'string'
  );
}

/**
 * Utility to get token display name for debugging.
 *
 * @param token
 * @example
 */
export function getTokenName<T>(token: DIToken<T>): string {
  return token.name;
}

/**
 * Utility to compare tokens for equality.
 *
 * @param token1
 * @param token2
 * @example
 */
export function tokensEqual<T>(
  token1: DIToken<T>,
  token2: DIToken<T>
): boolean {
  return token1.symbol === token2.symbol;
}
