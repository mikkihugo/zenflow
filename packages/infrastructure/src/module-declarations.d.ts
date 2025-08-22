/**
 * Module declarations for infrastructure implementation packages
 * These are fallback declarations that enable compilation when packages aren't available
 */

declare module '@claude-zen/otel-collector' {
  export interface OtelCollectorConfig {
    endpoint?: string;
    apiKey?: string;
  }

  export class OtelCollectorManager {
    constructor(config?: OtelCollectorConfig);
    initialize(): Promise<void>;
    collect(data: unknown): Promise<void>;
  }

  export function createOtelCollector(
    config?: OtelCollectorConfig
  ): OtelCollectorManager;
}

declare module '@claude-zen/service-container' {
  export interface ServiceContainer {
    register<T>(name: string, service: T): void;
    resolve<T>(name: string): T;
    has(name: string): boolean;
  }

  export class ServiceContainerManager {
    constructor();
    createContainer(): ServiceContainer;
  }

  export function createServiceContainer(): ServiceContainer;
}

declare module '@claude-zen/system-monitoring' {
  export interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
  }

  export class SystemMonitor {
    constructor();
    getMetrics(): Promise<SystemMetrics>;
  }

  export function createSystemMonitor(): SystemMonitor;
}
