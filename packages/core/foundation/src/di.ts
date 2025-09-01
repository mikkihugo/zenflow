/**
 * @fileoverview Dependency Injection Entry Point
 *
 * Professional IoC container and dependency injection utilities.
 * Import this when you need DI capabilities.
 */

// =============================================================================
// AWILIX RE-EXPORTS - Professional DI system (internal foundation implementation)
// =============================================================================

export {
  AwilixRegistrationError,
  AwilixResolutionError,
  aliasTo,
  asClass,
  asFunction,
  asValue,
  createContainer as createAwilixContainer,
  InjectionMode,
  Lifetime as AwilixLifetime,
  listModules,
  RESOLVER,
} from 'awilix';

export type {
  Container,
  ContainerStats,
  ServiceDiscoveryOptions,
  ServiceInfo,
} from './dependency-injection';
// =============================================================================
// FOUNDATION DI CONTAINER
// =============================================================================
export {
  container,
  createContainer,
  inject,
  TOKENS,
} from './dependency-injection';

// =============================================================================
// DI TYPES
// =============================================================================

/**
 * Token used to identify services in the dependency injection container.
 * Can be a string, symbol, or constructor function.
 *
 * @template T - The type of service this token represents
 * @example
 * '''typescript'
 * const USER_SERVICE:InjectionToken<UserService> = Symbol('UserService');
 * const API_URL:InjectionToken<string> = 'apiUrl';
 * '
 */
export type InjectionToken<T = unknown> =
  | string
  | symbol
  | (new (...args: unknown[]) => T);

/**
 * Service lifecycle options compatible with Awilix.
 * - 'singleton':One instance shared across the application'
 * - 'transient':New instance created for each resolution'
 * - 'scoped':One instance per scope/request'
 */
export type LifecycleCompat = 'singleton' | 'transient' | 'scoped';

/**
 * Options for service registration in the DI container.
 *
 * @example
 * 'typescript'
 * const options:ServiceRegistrationOptions = {
 *   lifetime: 'singleton', *   capabilities: ['database',    'auth'],
 *   tags: ['critical',    'external'],
 *   healthCheck:() => database.isConnected()
 *};
 * '
 */
export interface ServiceRegistrationOptions {
  /** Service lifecycle - how instances are managed */
  lifetime?: LifecycleCompat;
  /** Service capabilities for discovery and filtering */
  capabilities?: string[];
  /** Tags for categorization and querying */
  tags?: string[];
  /** Optional health check function */
  healthCheck?: () => boolean;
}

/**
 * Service lifetime enumeration for type-safe lifecycle management.
 *
 * @example
 * '''typescript'
 * container.register('service', asClass(MyService).scoped());
 * // Equivalent to:
 * container.register('service', asClass(MyService).lifetime(Lifetime.Scoped));
 * '
 */
export enum Lifetime {
  /** Single instance shared across the application */
  Singleton = 'singleton',
  /** New instance created for each resolution */
  Transient = 'transient',
  /** One instance per scope/request */
  Scoped = 'scoped',
}
