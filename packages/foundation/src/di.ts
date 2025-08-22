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
export type InjectionToken<T> =|string|symbol|(new (...args: unknown[]) => T);

/**
 * Lifecycle options for compatibility with legacy APIs
 */
export enum LifecycleCompat {
  Transient ='TRANSIENT',
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
    target: (new (...args: unknown[]) => T)|(() => T)|T,
    options?: {
      lifecycle?: LifecycleCompat;
    }
  ): this;

  registerSingleton<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T)|(() => T)|T
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
    this.name ='DependencyResolutionError';
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

// Convenience export for compatibility
export const TOKENS = FOUNDATION_TOKENS;

/**
 * Simple inject function for constructor parameter decoration
 * This is a lightweight replacement for @injectable decorator
 */
export function inject<T>(_token: InjectionToken<T>) {
  return function (
    _target: unknown,
    _propertyKey: string|symbol|undefined,
    _parameterIndex: number
  ) {
    // Simple marker for dependency injection
    // In a real implementation, this would store metadata
    // Note: Injecting dependency token into parameter
    return target;
  };
}

/**
 * Simple injectable decorator replacement
 */
export function injectable() {
  return function <T extends new (...args: unknown[]) => unknown>(
    target: T
  ): T {
    // Simple marker for injectable classes
    // Note: Marking class as injectable
    return target;
  };
}

/**
 * DI container factory functions - implementations in Foundation
 */
export interface DIContainerFactory {
  getGlobalContainer(): DIContainer;
  createContainer(name?: string, parent?: DIContainer): DIContainer;
  registerGlobal<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T)|(() => T)|T,
    options?: { lifecycle?: LifecycleCompat }
  ): void;
  registerGlobalSingleton<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T)|(() => T)|T
  ): void;
  registerGlobalInstance<T>(token: InjectionToken<T>, instance: T): void;
  resolveGlobal<T>(token: InjectionToken<T>): T;
  isRegisteredGlobal<T>(token: InjectionToken<T>): boolean;
  clearGlobal(): void;
  resetGlobal(): void;
}

/**
 * Simple DIContainer implementation for fallback support
 */
export class SimpleDIContainer implements DIContainer {
  private services = new Map<string, unknown>();
  private name: string;

  constructor(name ='default-container') {
    this.name = name;
  }

  register<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T)|(() => T)|T,
    _options?: { lifecycle?: LifecycleCompat }
  ): this {
    const key = this.getTokenKey(token);
    // Note: Registering service in container

    if (typeof target ==='function') {
      this.services.set(key, target);
    } else {
      this.services.set(key, target);
    }
    return this;
  }

  registerSingleton<T>(
    token: InjectionToken<T>,
    target: (new (...args: unknown[]) => T)|(() => T)|T
  ): this {
    return this.register(token, target, {
      lifecycle: LifecycleCompat.Singleton,
    });
  }

  registerInstance<T>(token: InjectionToken<T>, instance: T): this {
    const key = this.getTokenKey(token);
    this.services.set(key, instance);
    return this;
  }

  registerFactory<T>(
    token: InjectionToken<T>,
    factory: (container: unknown) => T,
    _options?: { lifecycle?: LifecycleCompat }
  ): this {
    const key = this.getTokenKey(token);
    // Note: Registering factory for dependency
    this.services.set(key, factory);
    return this;
  }

  resolve<T>(token: InjectionToken<T>): T {
    const key = this.getTokenKey(token);
    const service = this.services.get(key);

    if (service === undefined) {
      throw new DependencyResolutionError(
        `Service'${key}' not found in container '${this.name}'`
      );
    }

    if (typeof service === 'function') {
      const container = {
        resolve: (k: string) => {
          const f = this.services.get(k);
          return f ? (typeof f === 'function'? f() : f) : null;
        },
      };
      return (service as (container: unknown) => T)(container);
    }

    return service as T;
  }

  isRegistered<T>(token: InjectionToken<T>): boolean {
    const key = this.getTokenKey(token);
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
  }

  createChild(name?: string): DIContainer {
    return new SimpleDIContainer(name||`${this.name}-child`);
  }

  getRawContainer(): unknown {
    return this.services;
  }

  reset(): void {
    this.clear();
  }

  getName(): string {
    return this.name;
  }

  private getTokenKey<T>(token: InjectionToken<T>): string {
    if (typeof token ==='string') {
      return token;
    }
    if (typeof token === 'symbol') {
      return token.toString();
    }
    if (typeof token === 'function') {
      return token.name||'anonymous';
    }
    return String(token);
  }
}

/**
 * Global container instance
 */
let globalContainer: DIContainer|null = null;

/**
 * Service container factory implementation
 */
export function createContainer(name?: string): DIContainer {
  return new SimpleDIContainer(name);
}

export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new SimpleDIContainer('global');
  }
  return globalContainer;
}

export function createServiceContainer(name?: string): Promise<{
  name: string;
  register: (key: string, factory: (container: unknown) => unknown) => void;
  resolve: (key: string) => unknown;
  has: (key: string) => boolean;
  clear: () => void;
}> {
  const container = createContainer(name);
  const services = new Map<string, (container: unknown) => unknown>();

  return Promise.resolve({
    name: container.getName(),
    register: (key: string, factory: (container: unknown) => unknown) => {
      // Note: Registering service in container
      services.set(key, factory);
    },
    resolve: (key: string) => {
      const factory = services.get(key);
      if (factory) {
        const containerContext = {
          resolve: (k: string) => {
            const f = services.get(k);
            return f ? (typeof f === 'function'? f({}) : f) : null;
          },
        };
        return factory(containerContext);
      }
      return null;
    },
    has: (key: string) => services.has(key),
    clear: () => services.clear(),
  });
}

/**
 * Storage adapter interface - allows different storage backends
 */
export interface RegistryStorage<T> {
  get(id: string): T|null;
  set(id: string, entity: T): void;
  delete(id: string): boolean;
  getAll(): T[];
  clear(): void;
  has(id: string): boolean;
}

/**
 * Generic registry interface for managing entities - storage agnostic
 */
export interface RegistryInterface<T> {
  register(entity: T): { id: string; registered: boolean };
  unregister(id: string): { id: string; unregistered: boolean };
  findById(id: string): T|null;
  findByCapability?(capability: string): T[];
  getAll(): T[];
  getStatus(): { healthy: boolean; count: number };
  clear(): void;
  setStorage(storage: RegistryStorage<T>): void;
}

/**
 * In-memory storage adapter - default implementation
 */
export class InMemoryStorage<T> implements RegistryStorage<T> {
  private entities = new Map<string, T>();

  get(id: string): T|null {
    return this.entities.get(id)||null;
  }

  set(id: string, entity: T): void {
    this.entities.set(id, entity);
  }

  delete(id: string): boolean {
    return this.entities.delete(id);
  }

  getAll(): T[] {
    return Array.from(this.entities.values())();
  }

  clear(): void {
    this.entities.clear();
  }

  has(id: string): boolean {
    return this.entities.has(id);
  }
}

/**
 * Base registry implementation - storage agnostic
 */
export class BaseRegistry<T extends { id?: string }>
  implements RegistryInterface<T>
{
  protected storage: RegistryStorage<T>;
  protected name: string;

  constructor(name ='default-registry', storage?: RegistryStorage<T>) {
    this.name = name;
    this.storage = storage||new InMemoryStorage<T>();
  }

  setStorage(storage: RegistryStorage<T>): void {
    this.storage = storage;
  }

  register(entity: T): { id: string; registered: boolean } {
    const id =
      entity.id||`entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entityWithId = { ...entity, id } as T & { id: string };
    this.storage.set(id, entityWithId);
    // Note: Registered entity in registry
    return { id, registered: true };
  }

  unregister(id: string): { id: string; unregistered: boolean } {
    const existed = this.storage.delete(id);
    // Note: Unregistered entity from registry
    return { id, unregistered: existed };
  }

  findById(id: string): T|null {
    return this.storage.get(id);
  }

  findByCapability(capability: string): T[] {
    // Note: Finding entities with capability in registry
    const entities = this.storage.getAll();
    return entities.filter((entity: T) => {
      const hasCapabilities ='capabilities' in entity &&
        Array.isArray((entity as { capabilities?: string[] }).capabilities);
      const hasCapability =
        'capability' in entity &&
        typeof (entity as { capability?: string }).capability === 'string';
      return (
        (hasCapabilities &&
          (entity as { capabilities: string[] }).capabilities.includes(
            capability
          ))||(hasCapability &&
          (entity as { capability: string }).capability === capability)
      );
    });
  }

  getAll(): T[] {
    return this.storage.getAll();
  }

  getStatus(): { healthy: boolean; count: number } {
    const entities = this.storage.getAll();
    return {
      healthy: true,
      count: entities.length,
    };
  }

  clear(): void {
    this.storage.clear();
    // Note: Cleared all entities from registry
  }

  getName(): string {
    return this.name;
  }
}

/**
 * Registry implementation - uses configurable storage
 */
export class Registry<T extends { id?: string }> extends BaseRegistry<T> {
  constructor(name ='default-registry', storage?: RegistryStorage<T>) {
    super(name, storage||new InMemoryStorage<T>());
  }
}

/**
 * Common entity interfaces for pre-built registries
 */

// Agent - For AI agents, workers, coordinators
export interface Agent {
  id?: string;
  name?: string;
  capability?: string;
  capabilities?: string[];
  status?:'active|inactive|error|busy';
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Service - For microservices, APIs, system services
export interface Service {
  id?: string;
  name: string;
  type: 'api|worker|database|queue|storage|other';
  url?: string;
  status?: 'running|stopped|error|starting';
  version?: string;
  capabilities?: string[];
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

// Task - For jobs, workflows, operations
export interface Task {
  id?: string;
  title: string;
  description?: string;
  status?: 'pending|running|completed|failed|cancelled';
  priority?: 'low|medium|high|urgent';
  assignedTo?: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Resource - For files, databases, external APIs
export interface Resource {
  id?: string;
  name: string;
  type: 'file|database|api|cache|queue|storage|other'';
  url?: string;
  status?: 'available|unavailable|error|maintenance';
  capabilities?: string[];
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Foundation provides registry templates that can be extended for specific use cases
 * These are templates/base classes, not business-specific implementations
 */

// Template registry for agent-like entities - can be extended for different agent types
export class AgentRegistry extends Registry<Agent> {
  constructor(storage?: RegistryStorage<Agent>) {
    super('agent-registry', storage);
  }

  override findById(id: string): Agent|null {
    const agent = super.findById(id);
    return agent ? { ...agent, status: agent.status||'active' } : null;
  }

  findByStatus(status: Agent['status']): Agent[] {
    const agents = this.getAll();
    return agents.filter((agent) => agent.status === status);
  }
}

// Template registry for service-like entities - can be extended for different service types
export class ServiceRegistry extends Registry<Service> {
  constructor(storage?: RegistryStorage<Service>) {
    super('service-registry', storage);
  }

  async findByType(type: Service['type']): Promise<Service[]> {
    const services = await this.getAll();
    return services.filter((service) => service.type === type);
  }

  findByStatus(status: Service['status']): Service[] {
    const services = this.getAll();
    return services.filter((service) => service.status === status);
  }

  async getHealthStatus(): Promise<{
    healthy: number;
    total: number;
    percentage: number;
  }> {
    const services = await this.getAll();
    const healthy = services.filter((s) => s.status === 'running').length;
    const total = services.length;
    return {
      healthy,
      total,
      percentage: total > 0 ? Math.round((healthy / total) * 100) : 100,
    };
  }
}

// Template registry for task-like entities - can be extended for different task types
export class TaskRegistry extends Registry<Task> {
  constructor(storage?: RegistryStorage<Task>) {
    super('task-registry', storage);
  }

  findByStatus(status: Task['status']): Task[] {
    const tasks = this.getAll();
    return tasks.filter((task) => task.status === status);
  }

  async findByPriority(priority: Task['priority']): Promise<Task[]> {
    const tasks = await this.getAll();
    return tasks.filter((task) => task.priority === priority);
  }

  async findByAssignee(assignedTo: string): Promise<Task[]> {
    const tasks = await this.getAll();
    return tasks.filter((task) => task.assignedTo === assignedTo);
  }

  async getProgress(): Promise<{
    completed: number;
    total: number;
    percentage: number;
  }> {
    const tasks = await this.getAll();
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const total = tasks.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

// Template registry for resource-like entities - can be extended for different resource types
export class ResourceRegistry extends Registry<Resource> {
  constructor(storage?: RegistryStorage<Resource>) {
    super('resource-registry', storage);
  }

  async findByType(type: Resource['type']): Promise<Resource[]> {
    const resources = await this.getAll();
    return resources.filter((resource) => resource.type === type);
  }

  findByStatus(status: Resource['status']): Resource[] {
    const resources = this.getAll();
    return resources.filter((resource) => resource.status === status);
  }

  async getAvailabilityStatus(): Promise<{
    available: number;
    total: number;
    percentage: number;
  }> {
    const resources = await this.getAll();
    const available = resources.filter((r) => r.status === 'available').length;
    const total = resources.length;
    return {
      available,
      total,
      percentage: total > 0 ? Math.round((available / total) * 100) : 100,
    };
  }
}

/**
 * Custom registry for any entity type with additional query methods
 */
export class CustomRegistry<T extends { id?: string }> extends Registry<T> {
  constructor(name: string, storage?: RegistryStorage<T>) {
    super(`custom-${name}`, storage);
  }

  // Add query methods for custom entity types
  async findByProperty<K extends keyof T>(
    property: K,
    value: T[K]
  ): Promise<T[]> {
    const entities = await this.getAll();
    return entities.filter((entity) => entity[property] === value);
  }

  async findByProperties(criteria: Partial<T>): Promise<T[]> {
    const entities = await this.getAll();
    return entities.filter((entity) => {
      return Object.entries(criteria).every(
        ([key, value]) => entity[key as keyof T] === value
      );
    });
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    const entities = await this.getAll();
    return entities.filter(predicate);
  }
}

/**
 * Registry factory functions
 */

// Generic registry factory
export function createRegistry<T extends { id?: string }>(
  name?: string
): RegistryInterface<T> {
  return new Registry<T>(name);
}

// Template registry factory functions
export function createAgentRegistry(): AgentRegistry {
  return new AgentRegistry();
}

export function createServiceRegistry(): ServiceRegistry {
  return new ServiceRegistry();
}

export function createTaskRegistry(): TaskRegistry {
  return new TaskRegistry();
}

export function createResourceRegistry(): ResourceRegistry {
  return new ResourceRegistry();
}

// Custom registry factory for typed registries
export function createCustomRegistry<T extends { id?: string }>(
  name: string
): CustomRegistry<T> {
  return new CustomRegistry<T>(name);
}

// Global template registry instances (examples - can be used for multiple specific agent types)
let globalAgentRegistry: AgentRegistry | null = null;
let globalServiceRegistry: ServiceRegistry | null = null;
let globalTaskRegistry: TaskRegistry | null = null;
let globalResourceRegistry: ResourceRegistry | null = null;

// Global template registry getters
export function getAgentRegistry(): AgentRegistry {
  if (!globalAgentRegistry) {
    globalAgentRegistry = new AgentRegistry();
  }
  return globalAgentRegistry;
}

export function getServiceRegistry(): ServiceRegistry {
  if (!globalServiceRegistry) {
    globalServiceRegistry = new ServiceRegistry();
  }
  return globalServiceRegistry;
}

export function getTaskRegistry(): TaskRegistry {
  if (!globalTaskRegistry) {
    globalTaskRegistry = new TaskRegistry();
  }
  return globalTaskRegistry;
}

export function getResourceRegistry(): ResourceRegistry {
  if (!globalResourceRegistry) {
    globalResourceRegistry = new ResourceRegistry();
  }
  return globalResourceRegistry;
}

// Convenience functions (templates for agent operations)
export function createNewAgentRegistry(): AgentRegistry {
  return new AgentRegistry();
}

export function registerAgent(agent: Agent) {
  const registry = getAgentRegistry();
  return registry.register(agent);
}

export function getAllAgents(): Agent[] {
  const registry = getAgentRegistry();
  return registry.getAll();
}

export function findAgentsByCapability(
  capability: string
): Agent[] {
  const registry = getAgentRegistry();
  return registry.findByCapability(capability);
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
