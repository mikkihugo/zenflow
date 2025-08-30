/**
 * Container implementation class - extracted for complexity reduction
 */
import type {
  Container,
  ContainerStats,
  ServiceDiscoveryOptions,
  ServiceInfo,
} from './container.types';
export declare class ContainerImpl implements Container {
  private services;
  private serviceMetadata;
  private singletonCache;
  private disposableServices;
  private eventListeners;
  on(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): boolean;
  off(event: string, listener: (...args: unknown[]) => void): this;
  register<T>(
    token: string,
    implementation: new (...args: unknown[]) => T,
    options?: {
      capabilities?: string[];
      tags?: string[];
      singleton?: boolean;
    }
  ): void;
  registerFunction<T>(
    token: string,
    factory: () => T,
    options?: {
      capabilities?: string[];
      tags?: string[];
      singleton?: boolean;
    }
  ): void;
  registerValue<T>(
    token: string,
    value: T,
    options?: {
      capabilities?: string[];
      tags?: string[];
    }
  ): void;
  registerInstance<T>(
    token: string,
    instance: T,
    options?: {
      capabilities?: string[];
      tags?: string[];
    }
  ): void;
  registerSingleton<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    options?: {
      capabilities?: string[];
      tags?: string[];
    }
  ): void;
  registerAsyncFactory<T>(
    token: string,
    factory: () => Promise<T>,
    options?: {
      capabilities?: string[];
      tags?: string[];
    }
  ): void;
  resolveAsync<T>(token: string): Promise<T>;
  resolve<T>(token: string): T;
  private createServiceInstance;
  private handleServiceInstance;
  has(token: string): boolean;
  remove(token: string): boolean;
  clear(): void;
  getServicesByTags(tags: string[]): string[];
  getServicesByCapabilities(capabilities: string[]): string[];
  resolveAll<T>(tags: string[]): T[];
  registerConditional<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    condition: () => boolean,
    options?: {
      capabilities?: string[];
      tags?: string[];
    }
  ): void;
  dispose(): Promise<void>;
  getServiceMetadata(token: string): ServiceInfo | undefined;
  listServices(): string[];
  autoDiscoverServices(
    patterns: string[],
    options?: ServiceDiscoveryOptions
  ): Promise<ServiceInfo[]>;
  startHealthMonitoring(interval: number): void;
  getStats(): ContainerStats;
  getServicesByCapability(capability: string): ServiceInfo[];
  getServicesByTag(tag: string): ServiceInfo[];
  getHealthStatus(): {
    status: string;
    serviceCount: number;
    timestamp: number;
    uptime: number;
  };
  getName(): string;
  getServiceInfo(name: string): ServiceInfo | undefined;
  getAllServices(): string[];
}
//# sourceMappingURL=container-impl.d.ts.map
