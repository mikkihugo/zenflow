/**
 * @fileoverview Enterprise Strategic Facade - Business Logic Coordination
 * 
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to enterprise business logic and coordination
 * capabilities while delegating to real implementation packages when available.
 * 
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/safe-framework: Safety protocols and risk management
 * • @claude-zen/sparc: Systematic Problem Analysis and Resolution Coordination
 * • @claude-zen/agui: Advanced GUI framework and interface components  
 * • @claude-zen/knowledge: Knowledge management and semantic processing
 * • @claude-zen/kanban: Kanban workflow management and task coordination
 * • @claude-zen/multi-level-orchestration: Multi-level system orchestration
 * • @claude-zen/agent-manager: Agent lifecycle and coordination management
 * • @claude-zen/coordination-core: Core coordination primitives and patterns
 * 
 * STATUS TRACKING:
 * Uses FacadeStatusManager to track enterprise package availability, register
 * business services in Awilix container, and provide enterprise health monitoring.
 * 
 * @example Check Enterprise Capabilities
 * ```typescript
 * import { getFacadeStatus } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const status = getFacadeStatus('enterprise');
 * if (status?.capability === 'full') {
 *   console.log('🏢 Full enterprise capabilities available');
 * } else {
 *   console.log(`⚠️ Limited enterprise: ${status?.missingPackages.join(', ')}`);
 * }
 * ```
 * 
 * @example Use SAFE Framework with Auto-Fallback
 * ```typescript
 * import { getService } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const safeFramework = await getService('safeframework', () => ({
 *   analyze: async () => ({ risks: [], recommendations: [] })
 * }));
 * ```
 * 
 * GRACEFUL DEGRADATION:
 * When implementation packages are not available, the facade provides
 * compatibility implementations that maintain interface contracts without
 * advanced features. This ensures zero breaking changes for enterprise features.
 * 
 * NOTE: Teamwork functionality is handled by @claude-zen/intelligence facade
 * as it's more closely related to AI/neural coordination than business logic.
 */

import { 
  registerFacade, 
  getService, 
  hasService 
} from '@claude-zen/foundation/facade-status-manager';

// Register enterprise facade with expected packages
registerFacade('enterprise', [
  '@claude-zen/safe-framework',
  '@claude-zen/sparc',
  '@claude-zen/agui',
  '@claude-zen/knowledge',
  '@claude-zen/kanban',
  '@claude-zen/multi-level-orchestration',
  '@claude-zen/agent-manager',
  '@claude-zen/coordination-core'
], [
  'Safety protocols and risk management',
  'Systematic Problem Analysis and Resolution Coordination',
  'Advanced GUI framework and interface components',
  'Knowledge management and semantic processing',
  'Kanban workflow management and task coordination',
  'Multi-level system orchestration',
  'Agent lifecycle and coordination management',
  'Core coordination primitives and patterns',
  'Enterprise business logic and coordination'
]);

// Try to delegate to real packages, fall back gracefully
export * from './safe-framework';
export * from './sparc';
// Note: teamwork functionality now handled by @claude-zen/intelligence facade
export * from './agui';
export * from './knowledge';
export * from './kanban';
export * from './multi-level-orchestration';
export * from './agent-manager';
export * from './coordination-core';

// Re-export types
export * from './types';

// Teamwork is handled by @claude-zen/intelligence - use that facade directly