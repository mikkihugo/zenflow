/**
 * @fileoverview Conversation Memory Implementation
 *
 * Basic conversation memory implementation for testing and development.
 */
import type {
	ConversationMemory,
	ConversationSession,
	ConversationQuery,
} from "./types";
/**
 * In-memory conversation storage for testing
 */
export declare class InMemoryConversationMemory implements ConversationMemory {
	private conversations;
	storeConversation(session: ConversationSession): Promise<void>;
	getConversation(id: string): Promise<ConversationSession | null>;
	searchConversations(query: ConversationQuery): Promise<ConversationSession[]>;
	updateConversation(
		id: string,
		updates: Partial<ConversationSession>,
	): Promise<void>;
	deleteConversation(id: string): Promise<void>;
	getAgentConversationHistory(agentId: string): Promise<ConversationSession[]>;
}
//# sourceMappingURL=conversation-memory.d.ts.map
