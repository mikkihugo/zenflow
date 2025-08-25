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
 * • @claude-zen/document-processing: Document workflow and processing systems
 * • @claude-zen/documentation: Documentation management and linking
 * • @claude-zen/exporters: Data export management and formatting
 * • @claude-zen/agent-registry: Centralized agent registration and lifecycle management
 * • @claude-zen/interfaces: Interface management and detection systems
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
import './module-declarations';

const logger = getLogger('enterprise');

// Register enterprise facade with expected packages
registerFacade(
  'enterprise',
  [
    '@claude-zen/safe-framework',
    '@claude-zen/sparc',
    '@claude-zen/agui',
    '@claude-zen/knowledge',
    '@claude-zen/kanban',
    '@claude-zen/multi-level-orchestration',
    '@claude-zen/agent-manager',
    '@claude-zen/enterprise-coordination',
    '@claude-zen/document-processing',
    '@claude-zen/documentation',
    '@claude-zen/exporters',
    '@claude-zen/agent-registry',
    '@claude-zen/interfaces',
  ],
  [
    'Safety protocols and risk management',
    'Systematic Problem Analysis and Resolution Coordination',
    'Advanced GUI framework and interface components',
    'Knowledge management and semantic processing',
    'Kanban workflow management and task coordination',
    'Multi-level system orchestration',
    'Agent lifecycle and coordination management',
    'Enterprise coordination implementation',
    'Document workflow and processing systems',
    'Documentation management and linking',
    'Data export management and formatting',
    'Centralized agent registration and lifecycle management',
    'Interface management and detection systems',
    'Enterprise business logic and coordination',
  ],
);

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
export * from './document-processing';
export * from './documentation';
export * from './exporters';
// Dynamic exports with fallbacks for missing packages
try {
  // Re-export agent registry if available
  module.exports = {
    ...module.exports,
    ...require('@claude-zen/agent-registry'),
  };
} catch {
  // agent-registry not available - using fallbacks
}

try {
  // Re-export interfaces if available
  module.exports = { ...module.exports, ...require('@claude-zen/interfaces') };
} catch {
  // interfaces not available - using fallbacks
}

// Enterprise coordination systems delegation - fallback implementations when package not available
export const DevelopmentCoordinator = class {
  async executeCoordination() {
    return { success: false, message: 'Package not available' };
  }
};
export const ProjectCoordinator = class {
  async executeCoordination() {
    return { success: false, message: 'Package not available' };
  }
};
export const DevelopmentManager = class {
  async executeCoordination() {
    return { success: false, message: 'Package not available' };
  }
};
export const createDevelopmentConfig = () => ({
  mode: 'basic',
  enableAI: false,
});
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

  // Document processing modules
  documentProcessing: () => import('./document-processing'),
  documentation: () => import('./documentation'),
  exporters: () => import('./exporters'),

  // Agent and interface management (with fallbacks)
  agentRegistry: () =>
    import('@claude-zen/agent-registry').catch(() => ({ default: {} })),
  interfaces: () =>
    import('@claude-zen/interfaces').catch(() => ({ default: {} })),

  // Legacy coordination functions
  development: {
    coordinator: DevelopmentCoordinator,
    manager: DevelopmentManager,
    createConfig: createDevelopmentConfig,
    createManager: createDevelopmentManager,
    createSAFEManager: createSAFEDevelopmentManager,
  },

  project: {
    coordinator: ProjectCoordinator,
    getCoordinator: getProjectCoordinator,
    createConfig: createProjectConfig,
  },

  // Utilities
  logger: logger,
  init: async () => {
    logger.info('Enterprise system initialized');
    return { success: true, message: 'Enterprise ready' };
  },
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type {
  SAFeConfig,
  TeamworkConfig,
  AGUIConfig,
  KnowledgeConfig,
  KanbanConfig,
} from './types';

// Default export for convenience
export default enterpriseSystem;

// =============================================================================
// BUSINESS AGENT REGISTRIES - Enterprise facade specializations
// =============================================================================

/**
 * getBusinessAgentRegistry - Specialized registry for business/workflow agents
 * Delegates to @claude-zen/business-agents implementation package
 */
export const getBusinessAgentRegistry = async () => {
  throw new Error('Business agent registry not available - implementation package required');
};

/**
 * getWorkflowAgentRegistry - Specialized registry for workflow/process agents
 * Delegates to @claude-zen/workflow-agents implementation package
 */
export const getWorkflowAgentRegistry = async () => {
  throw new Error('Workflow agent registry not available - implementation package required');
};

/**
 * createBusinessAgentRegistry - Factory for business agent registries
 */
export const createBusinessAgentRegistry = async (config?: any) => {
  const registry = await getBusinessAgentRegistry();
  // AgentRegistry from foundation doesn't have configure method
  if (config) {
    console.log('Business agent registry config:', config);
  }
  return registry;
};

/**
 * createWorkflowAgentRegistry - Factory for workflow agent registries
 */
export const createWorkflowAgentRegistry = async (config?: any) => {
  const registry = await getWorkflowAgentRegistry();
  // AgentRegistry from foundation doesn't have configure method
  if (config) {
    console.log('Workflow agent registry config:', config);
  }
  return registry;
};

/**
 * createSafeFrameworkAgentRegistry - Factory for SAFE framework agents
 */
export const createSafeFrameworkAgentRegistry = async (config?: any) => {
  if (config) {
    console.log('SAFE framework agent registry config:', config);
  }
  throw new Error('SAFE framework agent registry not available - implementation package required');
};

// Note: Git operations are in development facade, not enterprise
// Use @claude-zen/development for GitOperationsManager
// Note: Teamwork is handled by @claude-zen/intelligence - use that facade directly
