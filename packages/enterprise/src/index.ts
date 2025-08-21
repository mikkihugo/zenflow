/**
 * @fileoverview Enterprise Strategic Facade
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
 * • @claude-zen/enterprise-coordination: Enterprise coordination implementation
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

const logger = getLogger('enterprise');

// Register enterprise facade with expected packages
registerFacade('enterprise', [
  '@claude-zen/safe-framework',
  '@claude-zen/sparc',
  '@claude-zen/agui',
  '@claude-zen/knowledge',
  '@claude-zen/kanban',
  '@claude-zen/multi-level-orchestration',
  '@claude-zen/agent-manager',
  '@claude-zen/coordination-core',
  '@claude-zen/enterprise-coordination'
], [
  'Safety protocols and risk management',
  'Systematic Problem Analysis and Resolution Coordination',
  'Advanced GUI framework and interface components',
  'Knowledge management and semantic processing',
  'Kanban workflow management and task coordination',
  'Multi-level system orchestration',
  'Agent lifecycle and coordination management',
  'Core coordination primitives and patterns',
  'Enterprise coordination implementation',
  'Enterprise business logic and coordination'
]);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './safe-framework';
export * from './sparc';
export * from './agui';
export * from './knowledge';
export * from './kanban';
export * from './multi-level-orchestration';
export * from './agent-manager';
export * from './coordination-core';

// Enterprise coordination systems delegation - fallback implementations when package not available
export const DevelopmentCoordinator = class { async executeCoordination() { return { success: false, message: 'Package not available' }; } };
export const ProjectCoordinator = class { async executeCoordination() { return { success: false, message: 'Package not available' }; } };
export const DevelopmentManager = class { async executeCoordination() { return { success: false, message: 'Package not available' }; } };
export const createDevelopmentConfig = () => ({ mode: 'basic', enableAI: false });
export const getProjectCoordinator = () => null;
export const createProjectConfig = () => ({ mode: 'basic' });
export const createDevelopmentManager = () => null;
export const createSAFEDevelopmentManager = () => null;

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all enterprise capabilities
// =============================================================================

export const enterpriseSystem = {
  // Enterprise modules
  safe: () => import('./safe-framework'),
  sparc: () => import('./sparc'),
  knowledge: () => import('./knowledge'),
  kanban: () => import('./kanban'),
  agui: () => import('./agui'),
  orchestration: () => import('./multi-level-orchestration'),
  agents: () => import('./agent-manager'),
  coordination: () => import('./coordination-core'),
  
  // Legacy coordination functions
  development: {
    coordinator: DevelopmentCoordinator,
    manager: DevelopmentManager,
    createConfig: createDevelopmentConfig,
    createManager: createDevelopmentManager,
    createSAFEManager: createSAFEDevelopmentManager
  },
  
  project: {
    coordinator: ProjectCoordinator,
    getCoordinator: getProjectCoordinator,
    createConfig: createProjectConfig
  },
  
  // Utilities
  logger: logger,
  init: async () => {
    logger.info('Enterprise system initialized');
    return { success: true, message: 'Enterprise ready' };
  }
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type { SAFeConfig, TeamworkConfig, AGUIConfig, KnowledgeConfig, KanbanConfig } from './types';

// Default export for convenience
export default enterpriseSystem;

// Note: Git operations are in development facade, not enterprise
// Use @claude-zen/development for GitOperationsManager
// Note: Teamwork is handled by @claude-zen/intelligence - use that facade directly