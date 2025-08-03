/**
 * Injectable decorator implementation
 * Marks classes as injectable and enables automatic dependency resolution
 */

import 'reflect-metadata';
import type { Constructor, DIToken, InjectionMetadata } from '../types/di-types';

// Metadata keys
const INJECTION_TOKENS_KEY = Symbol('injection_tokens');
const INJECTABLE_KEY = Symbol('injectable');

/**
 * Injectable decorator for marking classes as injectable
 */
export function injectable<T extends Constructor>(constructor: T): T {
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
 * Check if a class is marked as injectable
 */
export function isInjectable(constructor: Constructor): boolean {
  return Reflect.getMetadata(INJECTABLE_KEY, constructor) === true;
}

/**
 * Get injection tokens for a constructor
 */
export function getInjectionTokens(
  constructor: Constructor
): (DIToken<any> | undefined)[] | undefined {
  return Reflect.getMetadata(INJECTION_TOKENS_KEY, constructor);
}

/**
 * Set injection tokens for a constructor
 */
export function setInjectionTokens(
  constructor: Constructor,
  tokens: (DIToken<any> | undefined)[]
): void {
  Reflect.defineMetadata(INJECTION_TOKENS_KEY, tokens, constructor);
}

/**
 * Get injection metadata for a constructor
 */
export function getInjectionMetadata(constructor: Constructor): InjectionMetadata | undefined {
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
 * Set injection metadata for a constructor
 */
export function setInjectionMetadata(constructor: Constructor, metadata: InjectionMetadata): void {
  Reflect.defineMetadata('design:paramtypes', metadata.parameterTypes, constructor);
  setInjectionTokens(constructor, metadata.injectionTokens);
}

/**
 * Copy metadata from source to target constructor
 */
export function copyMetadata(source: Constructor, target: Constructor): void {
  const keys = Reflect.getMetadataKeys(source);
  for (const key of keys) {
    const metadata = Reflect.getMetadata(key, source);
    Reflect.defineMetadata(key, metadata, target);
  }
}
