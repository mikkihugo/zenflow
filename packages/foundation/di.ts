/**
 * @fileoverview Foundation DI - Separate Entry Point for Dependency Injection
 * 
 * Provides tree-shakable access to dependency injection utilities.
 * This module is specifically for packages that only need DI features.
 * 
 * @example Basic DI usage
 * ```typescript
 * import { injectable, singleton, inject } from '@claude-zen/foundation/di';
 * 
 * @injectable()
 * @singleton()
 * class MyService {
 *   constructor(@inject('Logger') private logger: Logger) {}
 * }
 * ```
 */

// Re-export all DI functionality from main module
export {
  DIContainer,
  TokenFactory,
  TOKENS,
  getGlobalContainer,
  createContainer,
  registerGlobal,
  registerGlobalSingleton,
  registerGlobalInstance,
  resolveGlobal,
  isRegisteredGlobal,
  clearGlobal,
  resetGlobal,
  loggingInjectable,
  loggingSingleton,
  configureDI,
  DependencyResolutionError,
  injectable,
  inject,
  singleton,
  scoped,
  instanceCachingFactory,
  instancePerContainerCachingFactory
} from './src/main.js';

export type { 
  DIConfiguration,
  Lifecycle,
  DependencyContainer,
  InjectionToken
} from './src/main.js';