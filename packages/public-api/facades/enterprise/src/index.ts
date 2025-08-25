/**
 * @fileoverview Enterprise Strategic Facade - Pure Delegation
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to enterprise business logic and coordination
 * by delegating directly to implementation packages.
 *
 * PURE DELEGATION ARCHITECTURE:
 * • @claude-zen/safe-framework: Safety protocols and risk management
 * • @claude-zen/sparc: Systematic Problem Analysis and Resolution Coordination
 * • @claude-zen/agui: Advanced GUI framework and interface components
 * • @claude-zen/knowledge: Knowledge management and semantic processing
 * • @claude-zen/kanban: Kanban workflow management and task coordination
 * • @claude-zen/multi-level-orchestration: Multi-level system orchestration
 * • @claude-zen/agent-manager: Agent lifecycle and coordination management
 * • @claude-zen/enterprise-coordination: Enterprise coordination implementation
 * • @claude-zen/document-intelligence: Document workflow and processing systems
 * • @claude-zen/documentation: Documentation management and linking
 * • @claude-zen/exporters: Data export management and formatting
 * • @claude-zen/agent-registry: Centralized agent registration and lifecycle management
 * • @claude-zen/interfaces: Interface management and detection systems
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 2.0.0
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('enterprise');

// =============================================================================
// PURE DELEGATION - Direct import and re-export
// =============================================================================

export const getSafeFramework = async () => {
  const { createSafeFramework } = await import('@claude-zen/safe-framework');
  return createSafeFramework();
};

export const getSPARCEngine = async () => {
  const { createSPARCEngine } = await import('@claude-zen/sparc');
  return createSPARCEngine();
};

export const getAGUISystem = async () => {
  const { createAGUISystem } = await import('@claude-zen/agui');
  return createAGUISystem();
};

export const getKnowledgeManager = async () => {
  const { createKnowledgeManager } = await import('@claude-zen/knowledge');
  return createKnowledgeManager();
};

export const getKanbanManager = async () => {
  const { createKanbanManager } = await import('@claude-zen/kanban');
  return createKanbanManager();
};

export const getOrchestrationEngine = async () => {
  const { createOrchestrationEngine } = await import('@claude-zen/multi-level-orchestration');
  return createOrchestrationEngine();
};

export const getAgentManager = async () => {
  const { createAgentManager } = await import('@claude-zen/agent-manager');
  return createAgentManager();
};

export const getEnterpriseCoordinator = async () => {
  const { createEnterpriseCoordinator } = await import('@claude-zen/enterprise-coordination');
  return createEnterpriseCoordinator();
};

export const getDocumentIntelligence = async () => {
  const { createDocumentIntelligence } = await import('@claude-zen/document-intelligence');
  return createDocumentIntelligence();
};

export const getDocumentationManager = async () => {
  const { createDocumentationManager } = await import('@claude-zen/documentation');
  return createDocumentationManager();
};

export const getExportManager = async () => {
  const { createExportManager } = await import('@claude-zen/exporters');
  return createExportManager();
};

export const getAgentRegistry = async () => {
  const { createAgentRegistry } = await import('@claude-zen/agent-registry');
  return createAgentRegistry();
};

export const getInterfaceManager = async () => {
  const { createInterfaceManager } = await import('@claude-zen/interfaces');
  return createInterfaceManager();
};

// =============================================================================
// MAIN SYSTEM OBJECT - Pure delegation system
// =============================================================================

export const enterpriseSystem = {
  // Core enterprise tools
  getSafeFramework,
  getSPARCEngine,
  getAGUISystem,
  getKnowledgeManager,
  getKanbanManager,
  getOrchestrationEngine,
  getAgentManager,
  getEnterpriseCoordinator,
  
  // Document processing tools
  getDocumentIntelligence,
  getDocumentationManager,
  getExportManager,
  
  // Agent and interface management
  getAgentRegistry,
  getInterfaceManager,

  // Utilities
  logger,
  init: () => {
    logger.info('Enterprise system initialized');
    return { success: true, message: 'Enterprise tools ready' };
  },
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Re-export package types
export type * from '@claude-zen/safe-framework';
export type * from '@claude-zen/sparc';
export type * from '@claude-zen/agui';
export type * from '@claude-zen/knowledge';
export type * from '@claude-zen/kanban';
export type * from '@claude-zen/multi-level-orchestration';
export type * from '@claude-zen/agent-manager';
export type * from '@claude-zen/enterprise-coordination';
export type * from '@claude-zen/document-intelligence';
export type * from '@claude-zen/documentation';
export type * from '@claude-zen/exporters';
export type * from '@claude-zen/agent-registry';
export type * from '@claude-zen/interfaces';

// Default export for convenience
export default enterpriseSystem;
