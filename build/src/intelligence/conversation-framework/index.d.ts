/**
 * Conversation Framework - ag2.ai Integration.
 *
 * Multi-agent conversation capabilities inspired by ag2.ai (AutoGen)
 * for enhanced agent collaboration and structured dialogue.
 */
/**
 * @file Conversation-framework module exports.
 */
import type { ConversationMCPTools, ConversationMemory, ConversationOrchestrator } from './types.ts';
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
export { ConversationMCPTools, ConversationMCPToolsFactory } from './mcp-tools.ts';
export { ConversationMemoryFactory, ConversationMemoryImpl } from './memory.ts';
export { ConversationOrchestratorImpl } from './orchestrator.ts';
export * from './types.ts';
/**
 * Conversation Framework Factory.
 *
 * Main entry point for creating conversation systems.
 *
 * @example
 */
export declare class ConversationFramework {
    /**
     * Create a complete conversation system with orchestrator and memory.
     *
     * @param config
     */
    static create(config?: ConversationFrameworkConfig): Promise<ConversationFrameworkSystem>;
    /**
     * Get available conversation patterns.
     */
    static getAvailablePatterns(): string[];
    /**
     * Get conversation framework capabilities.
     */
    static getCapabilities(): string[];
    /**
     * Validate conversation configuration.
     *
     * @param config
     */
    static validateConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
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
//# sourceMappingURL=index.d.ts.map