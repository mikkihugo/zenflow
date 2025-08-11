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
  ConversationMCPTools,
  ConversationMemory,
  ConversationOrchestrator,
} from './types.ts';

/**
 * Configuration for conversation framework creation.
 *
 * @example
 */
export interface ConversationFrameworkConfig {
  memoryBackend?: 'sqlite' | 'json' | 'lancedb';
  memoryConfig?: {
    path?: string;
    basePath?: string;
    [key: string]: any;
  };
}

/**
 * Complete conversation framework system.
 *
 * @example
 */
export interface ConversationFrameworkSystem {
  orchestrator: ConversationOrchestrator;
  memory: ConversationMemory;
  mcpTools: ConversationMCPTools;
}

// MCP integration
export { ConversationMCPTools, ConversationMCPToolsFactory } from './mcp-tools.ts';
// Memory and persistence
export { ConversationMemoryFactory, ConversationMemoryImpl } from './memory.ts';
// Conversation orchestration
export { ConversationOrchestratorImpl } from './orchestrator.ts';
// Core types and interfaces
export * from './types.ts';

/**
 * Conversation Framework Factory.
 *
 * Main entry point for creating conversation systems.
 *
 * @example
 */
export class ConversationFramework {
  /**
   * Create a complete conversation system with orchestrator and memory.
   *
   * @param config
   */
  static async create(
    config: ConversationFrameworkConfig = {}
  ): Promise<ConversationFrameworkSystem> {
    const { memoryBackend = 'json', memoryConfig = {} } = config;

    // Create memory backend
    let memory;
    switch (memoryBackend) {
      case 'sqlite': {
        const { ConversationMemoryFactory: SQLiteFactory } = await import('./memory.ts');
        memory = await SQLiteFactory.createWithSQLite(memoryConfig);
        break;
      }
      case 'lancedb': {
        const { ConversationMemoryFactory: LanceFactory } = await import('./memory.ts');
        memory = await LanceFactory.createWithLanceDB(memoryConfig);
        break;
      }
      default: {
        const { ConversationMemoryFactory: JSONFactory } = await import('./memory.ts');
        memory = await JSONFactory.createWithJSON(memoryConfig);
      }
    }

    // Create orchestrator
    const { ConversationOrchestratorImpl } = await import('./orchestrator.ts');
    const orchestrator = new ConversationOrchestratorImpl(memory);

    // Create MCP tools
    const { ConversationMCPTools } = await import('./mcp-tools.ts');
    const mcpTools = new ConversationMCPTools(orchestrator);

    return {
      orchestrator,
      memory,
      mcpTools,
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
      'mcp-integration',
    ];
  }

  /**
   * Validate conversation configuration.
   *
   * @param config
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config?.title || typeof config?.title !== 'string') {
      errors.push('Title is required and must be a string');
    }

    if (!config?.pattern || typeof config?.pattern !== 'string') {
      errors.push('Pattern is required and must be a string');
    }

    if (!config?.goal || typeof config?.goal !== 'string') {
      errors.push('Goal is required and must be a string');
    }

    if (!config?.domain || typeof config?.domain !== 'string') {
      errors.push('Domain is required and must be a string');
    }

    if (!Array.isArray(config?.participants) || config?.participants.length === 0) {
      errors.push('At least one participant is required');
    }

    if (config?.participants) {
      config?.participants?.forEach((participant: any, index: number) => {
        if (!participant.id || !participant.type || !participant.swarmId) {
          errors.push(`Participant ${index} missing required fields (id, type, swarmId)`);
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
 * 7. **MCP Integration**: Seamless tool integration for external access.
 *
 * Key differences from ag2.ai:
 * - Uses claude-code-zen's existing 147+ agent types
 * - Integrates with existing memory and coordination systems
 * - Provides MCP tools for external integration
 * - Supports domain-driven conversation patterns
 * - Built for the claude-code-zen architecture and requirements.
 */
export default ConversationFramework;
