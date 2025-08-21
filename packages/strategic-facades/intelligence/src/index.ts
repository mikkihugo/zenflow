/**
 * @fileoverview Intelligence Strategic Facade - AI and Neural Coordination
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
 * 
 * STATUS TRACKING:
 * Uses FacadeStatusManager to track AI package availability, register neural
 * services in Awilix container when available, and provide intelligence health monitoring.
 * 
 * @example Check Intelligence Capabilities
 * ```typescript
 * import { getFacadeStatus } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const status = getFacadeStatus('intelligence');
 * if (status?.capability === 'full') {
 *   console.log('🧠 Full AI capabilities available');
 * } else {
 *   console.log(`⚠️ Limited AI: ${status?.missingPackages.join(', ')}`);
 * }
 * ```
 * 
 * @example Use Brain Service with Auto-Fallback
 * ```typescript
 * import { getService } from '@claude-zen/foundation/facade-status-manager';
 * 
 * const brain = await getService('brain', () => ({
 *   coordinate: async () => ({ result: 'fallback-coordination' })
 * }));
 * ```
 * 
 * GRACEFUL DEGRADATION:
 * When implementation packages are not available, the facade provides
 * compatibility implementations that maintain interface contracts without
 * advanced AI features. This ensures zero breaking changes for intelligence features.
 * 
 * ARCHITECTURAL NOTE:
 * neural-ml and dspy are NOT exposed here - they are internal dependencies
 * of the brain package only. The brain system decides when and how to use them
 * based on complexity analysis and resource availability.
 */

import { 
  registerFacade, 
  getService, 
  hasService 
} from '@claude-zen/foundation/facade-status-manager';

// Register intelligence facade with expected packages
registerFacade('intelligence', [
  '@claude-zen/brain',
  '@claude-zen/ai-safety', 
  '@claude-zen/fact-system',
  '@claude-zen/teamwork',
  '@claude-zen/workflows'
], [
  'Neural network coordination and brain intelligence',
  'AI safety protocols and risk management',
  'Fact checking and semantic validation',
  'Multi-agent conversation and collaboration',
  'Intelligent workflow management and automation',
  'Behavioral intelligence and performance prediction',
  'DSPy integration for neural program optimization'
]);

// Re-export from individual facade files
export * from './brain';
export * from './safety';
export * from './fact-system';
export * from './teamwork';
export * from './workflows';
// LLM routing moved to operations facade (better architectural fit)

// Additional compatibility exports for missing classes
export { ConversationOrchestratorImpl, teamworkSystem } from './teamwork';

// Add memory compatibility classes
export class InMemoryConversationMemory {
  private memory = new Map<string, any>();
  
  async store(key: string, value: any): Promise<void> {
    this.memory.set(key, value);
  }
  
  async retrieve(key: string): Promise<any> {
    return this.memory.get(key);
  }
  
  async clear(): Promise<void> {
    this.memory.clear();
  }
}

// Export compatibility classes needed by server
export type { ServiceCoordinator, McpClientMessageType, ConversationPattern } from './teamwork';
export { AgentType, ServiceCoordinatorImpl } from './teamwork';