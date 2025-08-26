/**
 * @fileoverview Conversation Manager
 *
 * Basic conversation management utilities and helpers.
 */
import type { ConversationSession, AgentId } from "./types";
/**
 * Utility functions for conversation management
 */
export declare class ConversationManager {
	/**
	 * Create a new conversation session
	 */
	createSession(id: string, participants: AgentId[]): ConversationSession;
	/**
	 * Add participant to conversation
	 */
	addParticipant(session: ConversationSession, agent: AgentId): void;
	/**
	 * Remove participant from conversation
	 */
	removeParticipant(session: ConversationSession, agentId: string): void;
}
//# sourceMappingURL=conversation-manager.d.ts.map
