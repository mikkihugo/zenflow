/**
 * @fileoverview Dependency Injection Types and Interfaces
 *
 * Foundation DI types and interfaces for dependency injection patterns.
 * Actual implementations are provided by implementation packages.
 *
 * Features:
 * - Type-safe injection token definitions
 * - Lifecycle management enums
 * - DI container interface definitions
 * - Token factory for creating typed tokens
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

import type { UnknownRecord } from './types/primitives';

// Foundation only provides DI interfaces and primitives
// Actual implementations (Awilix, ServiceContainer, etc.) are in implementation packages

// Registry adapters have been moved to infrastructure packages
// Import from @claude-zen/infrastructure when needed

/**
 * Modern injection token type (compatible with both awilix and legacy APIs)
 */
export type InjectionToken<T> =
  | string
  | symbol
  | (new (...args: unknown[]) => T);

/**
 * Lifecycle options for compatibility with legacy APIs
 */
export enum LifecycleCompat {
  Transient = 'TRANSIENT',
  Singleton = 'SINGLETON',
  ContainerScoped = 'SCOPED',
  ResolutionScoped = 'SCOPED',
}

/**
 * DI container interface - implementations provided by infrastructure packages
 */
export interface DIContainer {
  register<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T) | (() => T) | T,
    options?: {
      lifecycle?: LifecycleCompat;
    }
  ): this;

  registerSingleton<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T) | (() => T) | T
  ): this;
  registerInstance<T>(token: InjectionToken<T>, instance: T): this;
  registerFactory<T>(
    token: InjectionToken<T>,
    factory: (container: unknown) => T,
    options?: { lifecycle?: LifecycleCompat }
  ): this;

  resolve<T>(token: InjectionToken<T>): T;
  isRegistered<T>(token: InjectionToken<T>): boolean;
  clear(): void;
  createChild(name?: string): DIContainer;
  getRawContainer(): unknown;
  reset(): void;
  getName(): string;
}

/**
 * Custom error for dependency resolution failures
 */
export class DependencyResolutionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DependencyResolutionError';
  }
}

/**
 * Token factory for creating typed injection tokens
 */
export class TokenFactory {
  /**
   * Create a typed injection token (string-based for awilix compatibility)
   */
  static create<T>(description: string): InjectionToken<T> {
    return description as InjectionToken<T>;
  }

  /**
   * Create a string-based token
   */
  static createString<T>(name: string): InjectionToken<T> {
    return name as InjectionToken<T>;
  }

  /**
   * Create a symbol-based token (for legacy compatibility)
   */
  static createSymbol<T>(description: string): InjectionToken<T> {
    return Symbol(description) as InjectionToken<T>;
  }
}

/**
 * Universal foundation tokens for basic system services only
 * Domain-specific tokens should be defined in their respective packages
 */
export const FOUNDATION_TOKENS = {
  // Only universal foundation services
  Logger: TokenFactory.create<unknown>('Logger'),
  Config: TokenFactory.create<unknown>('Config'),
} as const;

/**
 * DI container factory functions - implementations provided by infrastructure packages
 */
export interface DIContainerFactory {
  getGlobalContainer(): DIContainer;
  createContainer(name?: string, parent?: DIContainer): DIContainer;
  registerGlobal<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T) | (() => T) | T,
    options?: { lifecycle?: LifecycleCompat }
  ): void;
  registerGlobalSingleton<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T) | (() => T) | T
  ): void;
  registerGlobalInstance<T>(token: InjectionToken<T>, instance: T): void;
  resolveGlobal<T>(token: InjectionToken<T>): T;
  isRegisteredGlobal<T>(token: InjectionToken<T>): boolean;
  clearGlobal(): void;
  resetGlobal(): void;
}

/**
 * Decorator types for dependency injection - implementations provided by infrastructure packages
 */
export type InjectableDecorator = <
  T extends new (...args: unknown[]) => unknown,
>(
  target: T
) => T;
export type InjectDecorator = <T>(
  token: InjectionToken<T>
) => (target: unknown, propertyKey: string | symbol | undefined) => void;
export type SingletonDecorator = <
  T extends new (...args: unknown[]) => unknown,
>(
  target: T
) => T;
export type ScopedDecorator = <T extends new (...args: unknown[]) => unknown>(
  target: T
) => T;

/**
 * Configuration helper for quick DI setup
 */
export interface DIConfiguration {
  services: Array<{
    token: InjectionToken<unknown>;
    implementation: UnknownRecord;
    lifecycle?: LifecycleCompat;
  }>;
  instances?: Array<{
    token: InjectionToken<unknown>;
    instance: unknown;
  }>;
  factories?: Array<{
    token: InjectionToken<unknown>;
    factory: (container: unknown) => unknown;
    lifecycle?: LifecycleCompat;
  }>;
}

// Export types for external compatibility
export type DependencyContainer = DIContainer;
export type Lifecycle = LifecycleCompat;
