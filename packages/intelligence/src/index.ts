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
  getLogger
} from '@claude-zen/foundation';

const logger = getLogger('intelligence');

// Register intelligence facade with expected packages
registerFacade('intelligence', [
  '@claude-zen/brain',
  '@claude-zen/ai-safety',
  '@claude-zen/fact-system',
  '@claude-zen/teamwork',
  '@claude-zen/workflows',
  '@claude-zen/llm-providers',
  '@claude-zen/dspy',
  '@claude-zen/neural-ml'
], [
  'Neural network coordination and brain intelligence systems',
  'AI safety protocols and risk management',
  'Fact checking and semantic validation',
  'Multi-agent conversation and collaboration',
  'Intelligent workflow management and automation',
  'LLM provider integrations (CLI tools and direct APIs)',
  'DSPy neural optimization and prompt engineering',
  'Neural machine learning coordination',
  'AI-powered coordination and decision making'
]);

// =============================================================================
// MODULE EXPORTS - Delegate to implementation modules with fallback patterns
// =============================================================================

export * from './brain';
export * from './safety';
export * from './fact-system';
export * from './teamwork';
export * from './workflows';

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
  
  // Utilities
  logger: logger,
  init: async () => {
    logger.info('Intelligence system initialized');
    return { success: true, message: 'Intelligence ready' };
  }
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Default export for convenience
export default intelligenceSystem;