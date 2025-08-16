/**
 * Inject decorator implementation.
 * Enables parameter-level dependency injection.
 */
/**
 * @file Inject implementation.
 */

import 'reflect-metadata';
import type { DIToken } from '../types/di-types';
import { getInjectionTokens, setInjectionTokens } from './injectable';

/**
 * Inject decorator for marking constructor parameters for injection.
 *
 * @param token
 * @example
 */
export function inject<T>(token: DIToken<T>): ParameterDecorator {
  return (
    target: unknown,
    _propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    // Get existing injection tokens
    const existingTokens = getInjectionTokens(target as any) || [];

    // Ensure array is large enough
    while (existingTokens.length <= parameterIndex) {
      existingTokens.push(undefined);
    }

    // Set the token for this parameter
    existingTokens[parameterIndex] = token;

    // Update metadata
    setInjectionTokens(target as any, existingTokens);
  };
}

/**
 * Get the injection token for a specific parameter.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export function getInjectionToken(
  constructor: unknown,
  parameterIndex: number
): DIToken<any> | undefined {
  const tokens = getInjectionTokens(constructor as any);
  return tokens?.[parameterIndex];
}

/**
 * Check if a parameter has an injection token.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export function hasInjectionToken(
  constructor: unknown,
  parameterIndex: number
): boolean {
  return getInjectionToken(constructor, parameterIndex) !== undefined;
}
