/**
 * @file Coordination Event System - Main Export
 *
 * Exports the modular coordination event adapter system with all components.
 */

// Type exports
export type {
  CoordinationEventAdapterConfig,
  CoordinationEventMetrics,
  CoordinationCorrelation,
  CoordinationHealthEntry,
  WrappedCoordinationComponent,
} from './types';

// Main adapter class
export { CoordinationEventAdapter } from './adapter';

// Helper functions and utilities
export { CoordinationEventHelpers, CoordinationEventUtils } from './helpers';

// Data extraction utilities
export { CoordinationEventExtractor } from './extractor';

// Factory function for creating CoordinationEventAdapter instances
import { CoordinationEventAdapter } from './adapter';
import type { CoordinationEventAdapterConfig } from './types';

export function createCoordinationEventAdapter(
  config: CoordinationEventAdapterConfig
): CoordinationEventAdapter {
  return new CoordinationEventAdapter(config);
}

// Helper function for creating default coordination event adapter configuration
export function createDefaultCoordinationEventAdapterConfig(
  name: string,
  overrides?: Partial<CoordinationEventAdapterConfig>
): CoordinationEventAdapterConfig {
  return {
    name,
    type: 'coordination' as any, // EventManagerTypes.COORDINATION would be here
    processing: {
      strategy: 'immediate',
      queueSize: 2000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 5000,
    },
    // Core EventManagerConfig only - custom config removed to match interface
    ...overrides,
  };
}

// Default export
export default CoordinationEventAdapter;
