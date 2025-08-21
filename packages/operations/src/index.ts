/**
 * @fileoverview Operations Strategic Facade
 * 
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to operational capabilities including
 * monitoring, telemetry, chaos engineering, and performance management.
 * 
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/system-monitoring: System health monitoring and telemetry
 * • @claude-zen/agent-monitoring: Agent health and performance tracking
 * • @claude-zen/chaos-engineering: Chaos testing and resilience validation
 * • @claude-zen/load-balancing: Performance optimization and routing
 * • @claude-zen/llm-routing: LLM provider routing and management
 * • @claude-zen/memory: Memory management and optimization
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

const logger = getLogger('operations');

// Register operations facade with expected packages
registerFacade('operations', [
  '@claude-zen/system-monitoring',
  '@claude-zen/agent-monitoring',
  '@claude-zen/chaos-engineering', 
  '@claude-zen/load-balancing',
  '@claude-zen/llm-routing',
  '@claude-zen/memory'
], [
  'System health monitoring and telemetry',
  'Agent performance tracking and health checks',
  'Chaos engineering and resilience testing',
  'Load balancing and performance optimization',
  'LLM provider routing and management',
  'Memory management and optimization',
  'Real-time operational metrics and alerting'
]);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './agent-monitoring';
export * from './chaos-engineering';
export * from './monitoring';
export * from './memory';
export * from './llm-routing';

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all operations capabilities
// =============================================================================

export const operationsSystem = {
  // System monitoring
  monitoring: () => import('./monitoring'),
  
  // Memory management  
  memory: () => import('./memory'),
  
  // Agent monitoring
  agents: () => import('./agent-monitoring'),
  
  // Chaos engineering
  chaos: () => import('./chaos-engineering'),
  
  // LLM routing
  llm: () => import('./llm-routing'),
  
  // Utilities
  logger: logger,
  init: async () => {
    logger.info('Operations system initialized');
    return { success: true, message: 'Operations ready' };
  }
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Default export for convenience
export default operationsSystem;