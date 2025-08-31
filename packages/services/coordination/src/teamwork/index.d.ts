/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus } from '@claude-zen/foundation';
export interface Agent {
  id: string;
}
export interface ConversationMessage {
  id: string;
}
export interface Conversation {
  id: string;
}
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
export interface SAFeTeam {
  id: string;
}
export interface TeamMember {
  id: string;
}
export interface AgentAvailability {
    status: 'available' | 'busy' | 'offline' | 'in-meeting';
    currentTask?: string;
    nextAvailable?: Date;
}
export interface TeamCapacity {
    totalStoryPoints: number;
    availableHours: number;
    commitmentLevel: number;
    velocityHistory: number[];
}
export interface SAFeMeeting {
  id: string;
}
export interface MeetingAgenda {
  id: string;
}
export interface MeetingOutcome {
  id: string;
}
export interface TeamworkCoordinationRequest {
    requestId: string;
    teamId: string;
    type: 'cross-team-collaboration' | 'dependency-resolution' | 'knowledge-sharing' | 'problem-solving';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requestedParticipants: string[];
    context: {
        relatedFeatures: string[];
        dependencies: string[];
        constraints: string[];
    };
    deadline?: Date;
}
/**
 * Event-driven Conversation Manager with optional SPARC integration and SAFe teamwork
 */
export declare class ConversationManager extends EventBus {
    private conversations;
    private agents;
    private sparcReviews;
    private safeTeams;
    private safeMeetings;
    private teamworkRequests;
    constructor(): void {
        conversationId: string;
        fromAgent: string;
        content: string;
        toAgent?: string;
        type?: ConversationMessage['type'];
    }): Promise<ConversationMessage>;
    /**
     * Get conversation by ID
     */
    getConversation(): void {
    id: string;
    name: string;
    agents: Agent[];
    conversations: Conversation[];
    status: 'idle' | 'executing' | 'completed';
    createdAt: Date;
}
export declare class TeamworkOrchestrator {
    private sessions;
    private conversationManager;
    /**
     * Create teamwork session
     */
    createSession(): void {
    private memories;
    /**
     * Store memory for conversation
     */
    storeMemory(): void {
    name: string;
    artId: string;
    members: Omit<TeamMember, 'availability'>[];
    role?: SAFeTeam['role'];
}): SAFeTeam;
export declare function createSAFeMeeting(): void {
    teamId: string;
    type: TeamworkCoordinationRequest['type'];
    description: string;
    requestedParticipants: string[];
    priority?: TeamworkCoordinationRequest['priority'];
    context?: TeamworkCoordinationRequest['context'];
}): TeamworkCoordinationRequest;
export declare function createSAFeTeamworkOrchestrator(): void { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };
//# sourceMappingURL=index.d.ts.map