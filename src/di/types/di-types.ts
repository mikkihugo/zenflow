/**
 * Core dependency injection type definitions
 * Following Google TypeScript Style Guide and enterprise DI patterns
 */

/**
 * Dependency injection token for type-safe service registration
 */
export interface DIToken<T> {
  readonly symbol: symbol;
  readonly name: string;
  readonly type?: new (...args: any[]) => T;
}

/**
 * Provider lifecycle types
 */
export type ProviderLifestyle = 'singleton' | 'transient' | 'scoped';

/**
 * Base provider interface for service creation
 */
export interface Provider<T> {
  readonly type: ProviderLifestyle;
  create(container: DIContainer): T;
  dispose?(instance: T): Promise<void>;
}

/**
 * Main dependency injection container interface
 */
export interface DIContainer {
  register<T>(token: DIToken<T>, provider: Provider<T>): void;
  resolve<T>(token: DIToken<T>): T;
  createScope(): DIScope;
  dispose(): Promise<void>;
}

/**
 * Scoped container interface extending base container
 */
export interface DIScope extends DIContainer {
  readonly parent: DIContainer | null;
  createChild(): DIScope;
}

/**
 * Singleton provider configuration
 */
export interface SingletonProvider<T> extends Provider<T> {
  readonly type: 'singleton';
  readonly instance?: T;
}

/**
 * Factory provider configuration
 */
export interface FactoryProvider<T> extends Provider<T> {
  readonly type: 'transient';
  readonly factory: (container: DIContainer) => T;
}

/**
 * Scoped provider configuration
 */
export interface ScopedProvider<T> extends Provider<T> {
  readonly type: 'scoped';
}

/**
 * Service configuration for configuration-based registration
 */
export interface ServiceConfiguration {
  services: Array<{
    token: string;
    implementation: string;
    lifestyle: ProviderLifestyle;
    dependencies?: string[];
  }>;
  modules: string[];
}

/**
 * Service mapping for auto-registration
 */
export interface ServiceMapping {
  token: DIToken<any>;
  implementation: new (...args: any[]) => any;
  lifestyle: ProviderLifestyle;
  dependencies: DIToken<any>[];
}

/**
 * Service registration result
 */
export interface ServiceRegistration {
  file: string;
  exports: Array<{
    name: string;
    type: 'class' | 'interface' | 'function';
    isService: boolean;
  }>;
}

/**
 * DI container configuration options
 */
export interface DIContainerOptions {
  enableCircularDependencyDetection?: boolean;
  maxResolutionDepth?: number;
  enablePerformanceMetrics?: boolean;
  autoRegisterByConvention?: boolean;
}

/**
 * DI error types
 */
export class DIError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DIError';
  }
}

export class CircularDependencyError extends DIError {
  constructor(dependencyChain: string[]) {
    super(`Circular dependency detected: ${dependencyChain.join(' -> ')}`, 'CIRCULAR_DEPENDENCY');
    this.name = 'CircularDependencyError';
  }
}

export class ServiceNotFoundError extends DIError {
  constructor(token: string) {
    super(`No provider registered for token: ${token}`, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

/**
 * Injection metadata for decorator support
 */
export interface InjectionMetadata {
  parameterTypes: any[];
  injectionTokens: (DIToken<any> | undefined)[];
}

/**
 * Constructor type for injectable classes
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Parameter decorator type
 */
export type ParameterDecorator = (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => void;

/**
 * Class decorator type for injectable
 */
export type ClassDecorator = <T extends Constructor>(constructor: T) => T;