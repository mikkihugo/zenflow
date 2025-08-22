/**
 * @fileoverview Intelligence Strategic Facade
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to AI, neural, and machine learning
 * capabilities while delegating to real implementation packages when available.
 *
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/brain: Neural network coordination and brain intelligence systems
 * • @claude-zen/ai-safety: AI safety protocols and risk management
 * • @claude-zen/fact-system: Fact checking and semantic validation
 * • @claude-zen/teamwork: Multi-agent conversation and collaboration
 * • @claude-zen/workflows: Intelligent workflow management and automation
 * • @claude-zen/llm-providers: LLM provider integrations (CLI tools and direct APIs)
 * • @claude-zen/dspy: DSPy neural optimization and prompt engineering
 * • @claude-zen/neural-ml: Neural machine learning coordination
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
  getLogger,
  TypedEventBase,
} from '@claude-zen/foundation';

// Re-export foundation utilities for convenience
export { getLogger } from '@claude-zen/foundation';

const logger = getLogger('intelligence');

// Register intelligence facade with expected packages
registerFacade(
  'intelligence',
  [
    '@claude-zen/brain',
    '@claude-zen/ai-safety',
    '@claude-zen/fact-system',
    '@claude-zen/teamwork',
    '@claude-zen/workflows',
    '@claude-zen/llm-providers',
    '@claude-zen/dspy',
    '@claude-zen/neural-ml',
  ],
  [
    'Neural network coordination and brain intelligence systems',
    'AI safety protocols and risk management',
    'Fact checking and semantic validation',
    'Multi-agent conversation and collaboration',
    'Intelligent workflow management and automation',
    'LLM provider integrations (CLI tools and direct APIs)',
    'DSPy neural optimization and prompt engineering',
    'Neural machine learning coordination',
    'AI-powered coordination and decision making',
  ],
);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './brain';
export * from './safety';
export * from './fact-system';
export * from './teamwork';
export * from './workflows';
export * from './llm-providers';

// Additional exports for missing functions that may not be in brain.ts
export { getTaskComplexityEstimator } from './brain';

// Memory System Exports - Complete memory capabilities delegation
export {
  getMemorySystem,
  getMemoryManager,
  getMemoryStorage,
  getSessionMemory,
  getMemoryCoordination,
  createConversationMemory,
  createLearningMemory,
  createContextMemory,
  createKnowledgeGraph,
  memorySystem,
  InMemoryConversationMemory,
} from './brain';

// Agent Registry Exports - Neural Intelligence registries
export {
  getNeuralAgentRegistry,
  getIntelligenceAgentRegistry,
  createNeuralAgentRegistry,
  createIntelligenceAgentRegistry,
  createConversationAgentRegistry,
} from './brain';

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all intelligence capabilities
// =============================================================================

export const intelligenceSystem = {
  // Intelligence modules
  brain: () => import('./brain'),
  safety: () => import('./safety'),
  facts: () => import('./fact-system'),
  teamwork: () => import('./teamwork'),
  workflows: () => import('./workflows'),

  // Memory system access - Direct delegation to comprehensive memory implementation
  memory: async () => {
    const { memorySystem } = await import('./brain');
    return memorySystem;
  },

  // Convenience memory access functions
  getMemory: async (config?: any) => {
    const { getMemorySystem } = await import('./brain');
    return getMemorySystem(config);
  },

  createMemory: async (
    type: 'conversation | learning' | 'context''' | '''knowledge',
    config?: any,
  ) => {
    const brain = await import('./brain');
    switch (type) {
    case 'conversation':
      return brain.createConversationMemory(config);
    case 'learning':
      return brain.createLearningMemory(config);
    case 'context':
      return brain.createContextMemory(config);
    case 'knowledge':
      return brain.createKnowledgeGraph(config);
    default:
      return brain.createConversationMemory(config);
    }
  },

  // Utilities
  logger: logger,
  init: async () => {
    logger.info(
      'Intelligence system initialized with comprehensive memory integration',
    );
    return {
      success: true,
      message: 'Intelligence ready with memory capabilities',
    };
  },
};

// =============================================================================
// MISSING FACADE EXPORTS - Strategic Pattern Completions
// =============================================================================

// Workflow system exports (commonly imported)
export { WorkflowEngine, getWorkflowEngine } from './workflows';
export type { WorkflowEngineConfig } from './workflows';

// Document type exports (commonly imported)
export type { DocumentType } from './types';

// Event system re-exports (for compatibility)
export { TypedEventBus, createEventBus } from './brain';

// Neural components (compatibility exports - real implementations are in @claude-zen packages)
export const getLoadBalancer = async () => {
  console.warn(
    'getLoadBalancer: Use @claude-zen/operations for production load balancing',
  );
  return { balance: () => ({ selected: 'default' }) };
};

export const NeuralML = class NeuralMLStub {
  constructor() {
    console.warn(
      'NeuralML: Use @claude-zen/neural-ml package for production neural ML',
    );
  }
};

export const AdaptiveOptimizer = class AdaptiveOptimizerStub {
  constructor() {
    console.warn(
      'AdaptiveOptimizer: Use @claude-zen/neural-ml package for production optimization',
    );
  }
};

export const NeuralForecastingEngine = class NeuralForecastingEngineStub {
  constructor() {
    console.warn(
      'NeuralForecastingEngine: Use @claude-zen/neural-ml package for production forecasting',
    );
  }
};

// DI system re-exports (for compatibility)
export const CORE_TOKENS = {
  Logger: 'Logger',
  Config: 'Config',
  Database: 'Database',
  EventBus: 'EventBus',
};

export const inject = () => () => {
  console.warn('inject: Use @claude-zen/foundation DI system for production');
};

export const injectable = () => {
  console.warn(
    'injectable: Use @claude-zen/foundation DI system for production',
  );
  return {};
};

// EventBus alias
export { TypedEventBase as EventBus };
export const Logger = getLogger;

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Default export for convenience
export default intelligenceSystem;
