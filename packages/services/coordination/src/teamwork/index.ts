/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 * 
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus, getLogger, EventLogger } from '@claude-zen/foundation';
const logger = getLogger('Teamwork');
// Agent conversation types
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status : 'idle' | 'busy' | 'offline';';
}
export interface ConversationMessage {
  id: string;
  fromAgent: string;
  toAgent?: string; // undefined for broadcast
  content: string;
  timestamp: Date;
  type : 'request' | 'response' | 'notification' | 'broadcast';';
}
export interface Conversation {
  id: string;
  name: string;
  participants: string[]; // agent IDs
  messages: ConversationMessage[];
  status : 'active' | 'completed' | 'paused';';
  createdAt: Date;
  updatedAt: Date;
}
// ============================================================================
// SPARC INTEGRATION TYPES
// ============================================================================
export interface SPARCCollaborationRequest {
  requestId: string;
  projectId: string;
  phase: string;
  requiresReview: boolean;
  suggestedAgents: string[];
  context: {
    artifacts: unknown[];
    requirements: string[];
};
  timeout?: number;
}
export interface SPARCReviewResult {
  projectId: string;
  phase: string;
  approved: boolean;
  feedback: string[];
  recommendations: string[];
  conversationId: string;
}
// ============================================================================
// EVENT-DRIVEN CONVERSATION MANAGEMENT
// ============================================================================
/**
 * Event-driven Conversation Manager with optional SPARC integration
 */
export class ConversationManager extends EventBus {
  private conversations: new Map();
  private agents: new Map();
  private sparcReviews: new Map();
  constructor() {
    super();
    
    // Listen for SPARC collaboration requests (optional - only if SPARC active)
    this.on('sparc: `SPARC ${request.phase} Review - ${request.projectId};`;
      const conversation = await this.createConversation(conversationName, request.suggestedAgents);
      // Store SPARC review context
      this.sparcReviews.set(conversation.id, request);
      // Add initial context message
      await this.addMessage(conversation.id, {
        fromAgent,``;
        content: `SPARC ${request.phase} phase review requested. Context: ${JSON.stringify(request.context, null, 2)},`;
        type: ``notification'';
      });
      // Simulate review process (in real implementation, this would be actual agent conversations)
      setTimeout(() => {
        this.completeSPARCReview(conversation.id, true, ['Phase looks good'], [Continue to next phase`]);`;
      }, 5000); // 5 second simulated review
      logger.info(`Created SPARC review conversation: {`
        projectId: this.sparcReviews.get(conversationId);
    if (!request) {
      logger.warn(`No SPARC review found for conversation: {`
      projectId: {
      id: this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: {`
      id: new Date();
    return message;
}
  async sendMessage(params: `request`} = params;`;
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: {`
      id: new Date();
    return message;
}
  getConversation(id: Array.from(this.conversations.values());
    
    if (agentId) {
      return conversations.filter(c => c.participants.includes(agentId));
}
    
    return conversations;
}
}
// Multi-agent orchestration
export interface TeamworkSession {
  id: new Map();
  private conversationManager: new ConversationManager();
}
  async createSession(name: {
      id: this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: session.agents.map(a => a.id);
    const conversation = await this.conversationManager.createConversation(
      `${session.name} - Main Discussion``,';
      agentIds
    );
    session.conversations.push(conversation);
    session.status = 'executing'';
}
  getSession(id: new Map();
  async storeMemory(memory: this.memories.get(conversationId);
    if (existing) {
      this.memories.set(conversationId, { ...existing, ...updates, lastUpdated: new Date()});
}
}
}
// Factory functions
export function createConversationManager():ConversationManager {
  return new ConversationManager();
}
export function createTeamworkOrchestrator():TeamworkOrchestrator {
  return new TeamworkOrchestrator();
}
export function createConversationMemoryManager():ConversationMemoryManager {
  return new ConversationMemoryManager();
}
// Legacy compatibility
export { ConversationManager as TeamworkManager};
export { TeamworkOrchestrator as MultiAgentOrchestrator};