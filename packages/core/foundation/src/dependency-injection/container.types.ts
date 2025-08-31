/**
 * @fileoverview Container Types and Interfaces
 *
 * Type definitions for dependency injection container system.
 */

/**
 * Information about a registered service in the dependency injection container.
 * Contains metadata for service discovery, monitoring, and debugging.
 *
 * @interface ServiceInfo
 */
export interface ServiceInfo {
  name: string;
  type: 'class' | 'factory' | 'instance' | 'singleton' | 'async-factory';
  capabilities: string[];
  tags: string[];
  registeredAt: number;
  singleton: boolean;
}

/**
 * Options for automatic service discovery in the filesystem.
 * Configures how services are found and registered automatically.
 *
 * @interface ServiceDiscoveryOptions
 *
 * @example
 * '''typescript'
 * const options:ServiceDiscoveryOptions = {
 *   recursive:true,
 *   extensions:['.service.ts',    '.provider.ts'],
 *   ignore:['node_modules',    'dist']
 *};
 * `
 */
export interface ServiceDiscoveryOptions {
  recursive?: boolean;
  includeTests?: boolean;
  extensions?: string[];
  cwd?: string;
  ignore?: string[];
}

/**
 * Statistics about the container health and performance.
 * Used for monitoring and debugging dependency injection operations.
 *
 * @interface ContainerStats
 */
export interface ContainerStats {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  lastHealthCheck: number;
}

/**
 * Professional dependency injection container interface.
 * Provides full featured dependency injection with monitoring and health checks.
 */
export interface Container {
  register<T>(
    name: string,
    implementation: new (...args: unknown[]) => T
  ): void;
  registerFunction<T>(name: string, factory: (...args: unknown[]) => T): void;
  registerInstance<T>(name: string, instance: T): void;
  resolve<T>(name: string): T;
  has(name: string): boolean;
  remove(name: string): boolean;
  clear(): void;
  getStats(): ContainerStats;
  getServiceInfo(name: string): ServiceInfo | undefined;
  getAllServices(): string[];
  dispose(): Promise<void>;
}
