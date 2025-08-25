/**
 * @fileoverview Infrastructure Strategic Facade
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to infrastructure capabilities including
 * database systems, event management, load balancing, and telemetry systems.
 *
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/database: Multi-backend database abstraction layer
 * • @claude-zen/event-system: Type-safe event bus and management
 * • @claude-zen/load-balancing: Performance optimization and routing
 * • @claude-zen/telemetry: System telemetry and metrics collection
 * • @claude-zen/otel-collector: OpenTelemetry collection and processing
 * • @claude-zen/service-container: Service container and dependency injection
 *
 * STANDARD FACADE PATTERN:
 * All facades follow the same architectural pattern:
 * 1. registerFacade() - Register with facade status manager
 * 2. Import from foundation utilities
 * 3. Export all module implementations (with fallbacks)
 * 4. Export main system object for programmatic access
 * 5. Export types for external consumers
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { registerFacade, getLogger } from '@claude-zen/foundation';

const logger = getLogger('infrastructure');

// Register infrastructure facade with expected packages
registerFacade(
  'infrastructure',
  [
    '@claude-zen/database',
    '@claude-zen/event-system', 
    '@claude-zen/load-balancing',
    '@claude-zen/telemetry',
    '@claude-zen/otel-collector',
    '@claude-zen/service-container',
  ],
  [
    'Multi-backend database abstraction layer',
    'Type-safe event bus and management',
    'Performance optimization and routing',
    'System telemetry and metrics collection',
    'OpenTelemetry collection and processing',
    'Service container and dependency injection',
    'Infrastructure coordination and management',
  ],
);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './database';
export * from './events';
export * from './load-balancing';
export * from './telemetry';

// =============================================================================
// STRATEGIC FACADE DELEGATION - Advanced Infrastructure Components
// =============================================================================

// OpenTelemetry Collector Integration with Enhanced Fallback
let otelCollectorCache: unknown = null;

async function loadOtelCollector() {
  if (!otelCollectorCache) {
    try {
      const packageName = '@claude-zen/otel-collector';
      otelCollectorCache = await import(packageName);
    } catch {
      // Enhanced fallback OTel collector implementation
      otelCollectorCache = {
        OtelCollector: class {
          async initialize() {
            return this;
          }
          async collect(metrics: unknown) {
            console.debug(
              'OTel Collector Fallback: Collected metrics',
              metrics,
            );
            return {
              result: 'fallback-collection',
              status: 'collected',
              timestamp: Date.now(),
            };
          }
          async export(data: unknown) {
            console.debug('OTel Collector Fallback: Exported data', data);
            return {
              result: 'fallback-export',
              status: 'exported',
              timestamp: Date.now(),
            };
          }
          getStatus() {
            return { status: 'fallback', healthy: true };
          }
        },
        createOtelCollector: () => ({
          initialize: async () => Promise.resolve(),
          collect: async (metrics: unknown) => ({
            result: 'fallback-collection',
            metrics,
            timestamp: Date.now(),
          }),
          export: async (data: unknown) => ({
            result: 'fallback-export',
            data,
            timestamp: Date.now(),
          }),
          getStatus: () => ({ status: 'fallback', healthy: true }),
        }),
      };
    }
  }
  return otelCollectorCache;
}

// Service Container Integration with Enhanced Fallback
let serviceContainerCache: unknown = null;

async function loadServiceContainer() {
  if (!serviceContainerCache) {
    try {
      const packageName = '@claude-zen/service-container';
      serviceContainerCache = await import(packageName);
    } catch {
      // Enhanced fallback service container implementation
      serviceContainerCache = {
        ServiceContainer: class {
          private services = new Map<string, unknown>();
          async initialize() {
            return this;
          }
          register(key: string, factory: unknown) {
            this.services.set(key, factory);
          }
          resolve(key: string) {
            const factory = this.services.get(key);
            return factory
              ? typeof factory === 'function'
                ? factory()
                : factory
              : null;
          }
          has(key: string) {
            return this.services.has(key);
          }
          clear() {
            this.services.clear();
          }
          getStatus() {
            return {
              status: 'fallback',
              healthy: true,
              services: this.services.size,
            };
          }
        },
        createServiceContainer: (name = 'default') => {
          // Enhanced fallback service container with local registry
          const localServices = new Map<string, unknown>();

          return {
            name,
            register: (key: string, factory: unknown) => {
              console.debug(
                `Registering service '${key}' in container '${name}'`,
              );
              // Store factory function for potential resolution
              localServices.set(key, factory);
              return { registered: true, key, container: name };
            },
            resolve: (key: string) => {
              console.debug(
                `Resolving service '${key}' from container '${name}'`,
              );
              const factory = localServices.get(key);
              if (factory) {
                try {
                  return typeof factory === 'function' ? factory() : factory;
                } catch (error) {
                  console.warn(`Failed to resolve service '${key}':`, error);
                  return null;
                }
              }
              return null;
            },
            has: (key: string) => localServices.has(key),
            clear: () => {
              console.debug(
                `Cleared container '${name}' (${localServices.size} services)`,
              );
              localServices.clear();
            },
            getStatus: () => ({
              status: 'fallback',
              healthy: true,
              name,
              serviceCount: localServices.size,
              services: Array.from(localServices.keys()),
            }),
          };
        },
      };
    }
  }
  return serviceContainerCache;
}

// Professional exports for advanced infrastructure components
export const getOtelCollector = async () => {
  const otelModule = await loadOtelCollector();
  return (otelModule as any).createOtelCollector?.() || (otelModule as any).createOtelCollector();
};

export const getServiceContainer = async (name?: string) => {
  const containerModule = await loadServiceContainer();
  return (
    (containerModule as any).createServiceContainer?.(name) || (containerModule as any).createServiceContainer(name)
  );
};

// Direct exports for commonly used functions
export { getDatabaseAccess } from './database';
export { createEventSystem, getEventSystemAccess } from './events';
export {
  getLoadBalancer,
  getPerformanceTracker,
  getTelemetryManager,
} from './load-balancing';

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all infrastructure capabilities
// =============================================================================

export const infrastructureSystem = {
  // Infrastructure modules
  database: () => import('./database'),
  events: () => import('./events'),
  loadBalancing: () => import('./load-balancing'),
  telemetry: () => import('./telemetry'),

  // Advanced infrastructure with enhanced fallbacks
  otelCollector: () => loadOtelCollector(),
  serviceContainer: () => loadServiceContainer(),

  // Direct access functions
  getOtelCollector,
  getServiceContainer,
  getDatabaseAccess: async () => {
    const { getDatabaseAccess } = await import('./database');
    return getDatabaseAccess();
  },

  // Utilities
  logger,
  init: async () => {
    logger.info('Infrastructure system initialized');
    return { success: true, message: 'Infrastructure ready' };
  },
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Default export for convenience
export default infrastructureSystem;
