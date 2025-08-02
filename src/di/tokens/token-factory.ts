/**
 * DI token creation utilities
 * Provides type-safe token creation for dependency injection
 */

import type { Constructor, DIToken } from '../types/di-types.js';

/**
 * Creates a typed DI token for service registration
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
 */
export function createTokenFromClass<T>(constructor: Constructor<T>): DIToken<T> {
  return createToken(constructor.name, constructor);
}

/**
 * Type guard to check if a value is a DI token
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
 */
export function getTokenName<T>(token: DIToken<T>): string {
  return token.name;
}

/**
 * Utility to compare tokens for equality
 */
export function tokensEqual<T>(token1: DIToken<T>, token2: DIToken<T>): boolean {
  return token1.symbol === token2.symbol;
}
