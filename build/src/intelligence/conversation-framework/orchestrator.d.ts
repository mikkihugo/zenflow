/**
 * Conversation Orchestrator.
 *
 * Core orchestration engine for ag2.ai-inspired multi-agent conversations.
 */
/**
 * @file Orchestrator implementation.
 */
import type { AgentId } from '../types/agent-types';
import type { ConversationConfig, ConversationMemory, ConversationMessage, ConversationOrchestrator, ConversationOutcome, ConversationSession, ModerationAction } from './types.ts';
/**
 * Implementation of the conversation orchestrator.
 * Manages multi-agent conversations with patterns and learning.
 *
 * @example
 */
export declare class ConversationOrchestratorImpl implements ConversationOrchestrator {
    private memory;
    private activeSessions;
    private patterns;
    private eventHandlers;
    constructor(memory: ConversationMemory);
    /**
     * Create a new conversation session.
     *
     * @param config
     */
    createConversation(config: ConversationConfig): Promise<ConversationSession>;
    /**
     * Add an agent to an active conversation.
     *
     * @param conversationId
     * @param agent
     */
    joinConversation(conversationId: string, agent: AgentId): Promise<void>;
    /**
     * Remove an agent from a conversation.
     *
     * @param conversationId
     * @param agent
     */
    leaveConversation(conversationId: string, agent: AgentId): Promise<void>;
    /**
     * Send a message in a conversation.
     *
     * @param message
     */
    sendMessage(message: ConversationMessage): Promise<void>;
    /**
     * Moderate a conversation (mute, warn, etc.).
     *
     * @param conversationId
     * @param action
     */
    moderateConversation(conversationId: string, action: ModerationAction): Promise<void>;
    /**
     * Get conversation message history.
     *
     * @param conversationId
     */
    getConversationHistory(conversationId: string): Promise<ConversationMessage[]>;
    /**
     * Terminate a conversation and return outcomes.
     *
     * @param conversationId
     * @param reason
     */
    terminateConversation(conversationId: string, reason?: string): Promise<ConversationOutcome[]>;
    /**
     * Initialize default conversation patterns.
     */
    private initializeDefaultPatterns;
    /**
     * Start pattern workflow for a session.
     *
     * @param session
     * @param pattern
     */
    private startPatternWorkflow;
    /**
     * Process message for workflow progression.
     *
     * @param session
     * @param message
     */
    private processMessageForWorkflow;
    /**
     * Check if a workflow step should be triggered.
     *
     * @param step
     * @param message
     * @param session
     */
    private shouldTriggerStep;
    /**
     * Execute a workflow step.
     *
     * @param session
     * @param _pattern
     * @param step
     */
    private executeWorkflowStep;
    /**
     * Check consensus among participants.
     *
     * @param session
     * @param threshold
     */
    private checkConsensus;
    /**
     * Send system message.
     *
     * @param session
     * @param text
     */
    private sendSystemMessage;
    /**
     * Generate conversation outcomes.
     *
     * @param session
     */
    private generateConversationOutcomes;
    /**
     * Update final conversation metrics.
     *
     * @param session
     */
    private updateFinalMetrics;
    /**
     * Calculate consensus score.
     *
     * @param session
     */
    private calculateConsensusScore;
    /**
     * Calculate quality rating.
     *
     * @param session
     */
    private calculateQualityRating;
    /**
     * Calculate participation balance.
     *
     * @param session
     */
    private calculateParticipationBalance;
    /**
     * Calculate average response time.
     *
     * @param session
     */
    private calculateAverageResponseTime;
    /**
     * Event system for conversation events.
     *
     * @param event
     * @param data
     */
    private emit;
    /**
     * Register event handler.
     *
     * @param event
     * @param handler
     */
    on(event: string, handler: Function): void;
}
//# sourceMappingURL=orchestrator.d.ts.map