/**
 * @fileoverview Operations Strategic Facade - System Operations and Monitoring
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
 * 
 * STATUS TRACKING:
 * Uses FacadeStatusManager to track operational package availability, register
 * monitoring services in Awilix container, and provide operations health monitoring.
 * 
 * @example Check Operations Health
 * ```typescript
 * import { getFacadeStatus } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const status = getFacadeStatus('operations');
 * console.log(`Operations: ${status?.capability} (${status?.healthScore}% health)`);
 * if (status?.missingPackages.length > 0) {
 *   console.log(`Missing: ${status.missingPackages.join(', ')}`);
 * }
 * ```
 * 
 * @example Use Monitoring with Auto-Fallback
 * ```typescript
 * import { getService } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const monitoring = await getService('systemmonitoring', () => ({
 *   recordMetric: () => console.log('Fallback metric recording'),
 *   startTrace: () => ({ end: () => {} })
 * }));
 * ```
 */

import { 
  registerFacade, 
  getService, 
  hasService 
} from '@claude-zen/foundation/facade-status-manager';

// Register operations facade with expected packages
registerFacade('operations', [
  '@claude-zen/system-monitoring',
  '@claude-zen/agent-monitoring',
  '@claude-zen/chaos-engineering', 
  '@claude-zen/load-balancing',
  '@claude-zen/llm-routing'
], [
  'System health monitoring and telemetry',
  'Agent performance tracking and health checks',
  'Chaos engineering and resilience testing',
  'Load balancing and performance optimization',
  'LLM provider routing and management',
  'Memory management and optimization',
  'Real-time operational metrics and alerting'
]);

// Try to delegate to real packages, fall back gracefully
export * from './agent-monitoring';
export * from './chaos-engineering';
export * from './monitoring';
export * from './memory';
export * from './llm-routing';

// LLM provider and routing now properly handled by llm-routing.ts

// Re-export types
export * from './types';