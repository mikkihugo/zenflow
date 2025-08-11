/**
 * Inject decorator implementation.
 * Enables parameter-level dependency injection.
 */
/**
 * @file Inject implementation.
 */

import 'reflect-metadata';
import type { DIToken } from '../types/di-types.ts';
import { getInjectionTokens, setInjectionTokens } from './injectable.ts';

/**
 * Inject decorator for marking constructor parameters for injection.
 *
 * @param token
 * @example
 */
export function inject<T>(token: DIToken<T>): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
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
export function getInjectionToken(
  constructor: any,
  parameterIndex: number
): DIToken<any> | undefined {
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
export function hasInjectionToken(constructor: any, parameterIndex: number): boolean {
  return getInjectionToken(constructor, parameterIndex) !== undefined;
}
