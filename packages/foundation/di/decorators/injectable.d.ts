/**
 * Injectable decorator implementation.
 * Marks classes as injectable and enables automatic dependency resolution.
 */
/**
 * @file Injectable implementation.
 */
import 'reflect-metadata';
import type { Constructor, DIToken, InjectionMetadata } from '../types/di-types';
/**
 * Injectable decorator for marking classes as injectable.
 *
 * @param constructor
 * @example
 */
export declare function injectable<T extends Constructor>(constructor: T): T;
/**
 * Inject decorator for parameter injection.
 *
 * @param token
 * @example
 */
export declare function inject<T>(token: DIToken<T>): (target: unknown, _propertyKey: string | symbol | undefined, parameterIndex: number) => void;
/**
 * Check if a class is marked as injectable.
 *
 * @param constructor
 * @example
 */
export declare function isInjectable(constructor: Constructor): boolean;
/**
 * Get injection tokens for a constructor.
 *
 * @param constructor
 * @example
 */
export declare function getInjectionTokens(constructor: Constructor): (DIToken<any> | undefined)[] | undefined;
/**
 * Set injection tokens for a constructor.
 *
 * @param constructor
 * @param tokens
 * @example
 */
export declare function setInjectionTokens(constructor: Constructor, tokens: (DIToken<any> | undefined)[]): void;
/**
 * Get injection metadata for a constructor.
 *
 * @param constructor
 * @example
 */
export declare function getInjectionMetadata(constructor: Constructor): InjectionMetadata | undefined;
/**
 * Set injection metadata for a constructor.
 *
 * @param constructor
 * @param metadata
 * @example
 */
export declare function setInjectionMetadata(constructor: Constructor, metadata: InjectionMetadata): void;
/**
 * Copy metadata from source to target constructor.
 *
 * @param source
 * @param target
 * @example
 */
export declare function copyMetadata(source: Constructor, target: Constructor): void;
//# sourceMappingURL=injectable.d.ts.map