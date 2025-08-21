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

import { 
  registerFacade,
  getLogger
} from '@claude-zen/foundation';

const logger = getLogger('infrastructure');

// Register infrastructure facade with expected packages
registerFacade('infrastructure', [
  '@claude-zen/database',
  '@claude-zen/event-system',
  '@claude-zen/load-balancing',
  '@claude-zen/telemetry'
], [
  'Multi-backend database abstraction layer',
  'Type-safe event bus and management',
  'Performance optimization and routing',
  'System telemetry and metrics collection',
  'Infrastructure monitoring and health checks'
]);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './database';
export * from './events';
export * from './load-balancing';
export * from './telemetry';

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all infrastructure capabilities
// =============================================================================

export const infrastructureSystem = {
  // Infrastructure modules
  database: () => import('./database'),
  events: () => import('./events'),
  loadBalancing: () => import('./load-balancing'),
  telemetry: () => import('./telemetry'),
  
  // Utilities
  logger: logger,
  init: async () => {
    logger.info('Infrastructure system initialized');
    return { success: true, message: 'Infrastructure ready' };
  }
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Default export for convenience
export default infrastructureSystem;