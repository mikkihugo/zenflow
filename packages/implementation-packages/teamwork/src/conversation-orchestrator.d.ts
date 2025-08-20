/**
 * @fileoverview Conversation Orchestrator Implementation
 *
 * Implements the ConversationOrchestrator interface for managing
 * multi-agent conversations and coordination workflows.
 */
import type { ConversationOrchestrator, ConversationConfig, ConversationSession, ConversationMessage, ConversationOutcome, ConversationMemory, AgentId, ModerationAction } from './types';
/**
 * Implementation of conversation orchestrator for multi-agent coordination
 */
export declare class ConversationOrchestratorImpl implements ConversationOrchestrator {
    private memory;
    private logger;
    private activeSessions;
    private patternRegistry;
    constructor(memory: ConversationMemory);
    private initializePatterns;
    createConversation(config: ConversationConfig): Promise<ConversationSession>;
    startConversation(conversationId: string): Promise<ConversationSession>;
    joinConversation(conversationId: string, agent: AgentId): Promise<void>;
    leaveConversation(conversationId: string, agent: AgentId): Promise<void>;
    sendMessage(message: ConversationMessage): Promise<void>;
    moderateConversation(conversationId: string, action: ModerationAction): Promise<void>;
    getConversationHistory(conversationId: string): Promise<ConversationMessage[]>;
    terminateConversation(conversationId: string, reason?: string): Promise<ConversationOutcome[]>;
}
//# sourceMappingURL=conversation-orchestrator.d.ts.map