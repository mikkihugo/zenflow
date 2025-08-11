/**
 * Inject decorator implementation.
 * Enables parameter-level dependency injection.
 */
/**
 * @file Inject implementation.
 */
import 'reflect-metadata';
import type { DIToken } from '../types/di-types.ts';
/**
 * Inject decorator for marking constructor parameters for injection.
 *
 * @param token
 * @example
 */
export declare function inject<T>(token: DIToken<T>): ParameterDecorator;
/**
 * Get the injection token for a specific parameter.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export declare function getInjectionToken(constructor: any, parameterIndex: number): DIToken<any> | undefined;
/**
 * Check if a parameter has an injection token.
 *
 * @param constructor
 * @param parameterIndex
 * @example
 */
export declare function hasInjectionToken(constructor: any, parameterIndex: number): boolean;
//# sourceMappingURL=inject.d.ts.map