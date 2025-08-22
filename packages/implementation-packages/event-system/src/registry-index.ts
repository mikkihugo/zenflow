/**
 * @fileoverview Event Registry Index - ServiceContainer Migration (Option 1)
 *
 * Provides seamless migration from EventRegistry to ServiceContainer-based implementation.
 * Zero breaking changes by making MigratedEventRegistry the default export while preserving
 * legacy EventRegistry for fallback compatibility.
 *
 * Migration Pattern: Option 1 (Zero Breaking Changes)
 * - MigratedEventRegistry as default export
 * - Legacy EventRegistry available for fallback
 * - Factory functions for both implementations
 * - Enhanced ServiceContainer features via MigratedEventRegistry
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// MAIN EXPORTS - Option 1: MigratedEventRegistry as default (zero breaking changes)
// =============================================================================

export {
  MigratedEventRegistry as EventRegistry,
  getMigratedEventRegistry as getEventRegistry,
  createMigratedEventRegistry as createEventRegistry,
} from './registry-migrated';

// =============================================================================
// LEGACY IMPLEMENTATIONS - Available for fallback
// =============================================================================

export {
  EventRegistry as LegacyEventRegistry,
  globalEventRegistry,
} from './registry';

// =============================================================================
// TYPE EXPORTS - Core interfaces and types
// =============================================================================

export type {
  EventRegistryEntry,
  EventTypeRegistry,
  FactoryRegistry,
  HealthMonitoringConfig,
  EventDiscoveryConfig,
} from './registry';

// =============================================================================
// ENHANCED FUNCTIONALITY - ServiceContainer-based features
// =============================================================================

// Re-export ServiceContainer-enhanced EventRegistry for explicit usage
export {
  MigratedEventRegistry,
  getMigratedEventRegistry,
  createMigratedEventRegistry,
} from './registry-migrated';

/**
 * Convenience factory function that creates the migrated registry with sensible defaults
 */
export function createEnhancedEventRegistry(config?: {
  healthMonitoring?: Partial<any>;
  discovery?: Partial<any>;
  autoRegisterDefaults?: boolean;
}) {
  const registry = createMigratedEventRegistry();

  // Auto-initialize with provided config
  registry.initialize(config).catch((error) => {
    console.error('Failed to initialize enhanced event registry:', error);
  });

  return registry;
}

/**
 * Migration information for debugging and validation
 */
export const MIGRATION_INFO = {
  version: '2.1.0',
  strategy: 'Option 1: Zero Breaking Changes',
  description: 'MigratedEventRegistry as default with legacy fallback',
  features: {
    serviceContainer: true,
    healthMonitoring: true,
    serviceDiscovery: true,
    enhancedMetrics: true,
    eventDrivenNotifications: true,
    legacyCompatibility: true,
    zeroBreakingChanges: true,
  },
  defaultImplementation: 'MigratedEventRegistry',
  fallbackImplementation: 'LegacyEventRegistry',
} as const;
