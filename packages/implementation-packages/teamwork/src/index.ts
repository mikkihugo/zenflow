/**
 * @fileoverview Teamwork Package - Multi-Agent Conversation Framework
 * 
 * Ag2.ai-inspired conversation framework for multi-agent communication and coordination.
 * Provides conversation management, orchestration, and persistent memory.
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.0.0
 */

// Export all types
export * from './types';

// Export conversation management
export * from './conversation-manager';

// Export conversation orchestrator
export { ConversationOrchestratorImpl } from './conversation-orchestrator';

// Export conversation memory
export * from './conversation-memory';

// Default export for convenience
export { ConversationOrchestratorImpl as ConversationOrchestrator } from './conversation-orchestrator';