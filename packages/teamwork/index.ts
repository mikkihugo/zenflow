/**
 * Conversation Framework - ag2.ai Integration.
 *
 * Multi-agent conversation capabilities inspired by ag2.ai (AutoGen)
 * for enhanced agent collaboration and structured dialogue.
 */
/**
 * @file Conversation-framework module exports.
 */

import type {
  ConversationOrchestrator,
} from './types';

/**
 * Conversation framework with shared storage.
 *
 * @example
 */
export interface ConversationSystem {
  orchestrator: ConversationOrchestrator;
}

// Core exports
export * from './types';
export { getConversationStorage, conversationStorage } from './storage';
export { ConversationOrchestratorImpl } from './orchestrator';

/**
 * Conversation Framework.
 * 
 * ag2.ai-inspired conversations with @claude-zen/foundation storage.
 *
 * @example
 */
export class ConversationFramework {
  /**
   * Create a conversation system with persistent storage.
   */
  static async create(): Promise<ConversationSystem> {
    const { ConversationOrchestratorImpl } = await import('./orchestrator');
    const orchestrator = new ConversationOrchestratorImpl();

    return {
      orchestrator,
    };
  }

  /**
   * Get available conversation patterns.
   */
  static getAvailablePatterns(): string[] {
    return [
      'code-review',
      'problem-solving',
      'brainstorming',
      'planning',
      'debugging',
      'architecture-review',
      'sprint-planning',
      'retrospective',
    ];
  }

  /**
   * Get conversation framework capabilities.
   */
  static getCapabilities(): string[] {
    return [
      'multi-agent-conversations',
      'structured-dialogue-patterns',
      'conversation-memory',
      'outcome-tracking',
      'consensus-building',
      'role-based-participation',
      'workflow-orchestration',
      'moderation-support',
      'learning-from-conversations',
    ];
  }

  /**
   * Validate conversation configuration.
   *
   * @param config
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config?.title || typeof config.title !== 'string') {
      errors.push('Title is required and must be a string');
    }

    if (!config?.pattern || typeof config.pattern !== 'string') {
      errors.push('Pattern is required and must be a string');
    }

    if (!config?.context?.goal || typeof config.context.goal !== 'string') {
      errors.push('Goal is required and must be a string');
    }

    if (!config?.context?.domain || typeof config.context.domain !== 'string') {
      errors.push('Domain is required and must be a string');
    }

    if (
      !Array.isArray(config?.initialParticipants) ||
      config.initialParticipants.length === 0
    ) {
      errors.push('At least one participant is required');
    }

    if (config?.initialParticipants) {
      config.initialParticipants.forEach((participant: any, index: number) => {
        if (!(participant?.id && participant?.type && participant?.swarmId)) {
          errors.push(
            `Participant ${index} missing required fields (id, type, swarmId)`
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Ag2.ai Integration Summary.
 *
 * This conversation framework brings ag2.ai's key concepts to claude-code-zen:
 *
 * 1. **Multi-Agent Conversations**: Structured dialogue between specialized agents
 * 2. **Conversation Patterns**: Predefined workflows for common scenarios
 * 3. **Role-Based Participation**: Agents have specific roles and permissions
 * 4. **Teachable Interactions**: Agents learn from conversation outcomes
 * 5. **Group Chat Coordination**: Support for multi-participant discussions
 * 6. **Conversation Memory**: Persistent context and history
 *
 * Key differences from ag2.ai:
 * - Uses claude-code-zen's existing 147+ agent types
 * - Integrates with existing memory and coordination systems
 * - Supports domain-driven conversation patterns
 * - Built for the claude-code-zen architecture and requirements.
 */
export default ConversationFramework;
