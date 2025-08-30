/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus } from '@claude-zen/foundation';
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
}
export interface ConversationMessage {
  id: string;
  fromAgent: string;
  toAgent?: string;
  content: string;
  timestamp: Date;
  type: 'request' | 'response' | 'notification' | 'broadcast';
}
export interface Conversation {
  id: string;
  name: string;
  participants: string[];
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
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
  name: string;
  artId: string;
  members: TeamMember[];
  role: 'development' | 'system' | 'shared-services' | 'complicated-subsystem';
  capacity: TeamCapacity;
  skills: string[];
  status: 'forming' | 'storming' | 'norming' | 'performing';
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  capacity: number;
  availability: AgentAvailability;
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
  type:
    | 'daily-standup'
    | 'iteration-planning'
    | 'iteration-review'
    | 'iteration-retrospective'
    | 'pi-planning'
    | 'system-demo'
    | 'inspect-adapt'
    | 'scrum-of-scrums'
    | 'po-sync'
    | 'art-sync';
  teamId?: string;
  artId?: string;
  participants: string[];
  duration: number;
  scheduledAt: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  agenda: MeetingAgenda[];
  outcomes: MeetingOutcome[];
  conversationId?: string;
}
export interface MeetingAgenda {
  id: string;
  title: string;
  description: string;
  duration: number;
  presenter: string;
  topics: string[];
}
export interface MeetingOutcome {
  id: string;
  type: 'decision' | 'action-item' | 'risk' | 'dependency' | 'impediment';
  description: string;
  owner?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface TeamworkCoordinationRequest {
  requestId: string;
  teamId: string;
  type:
    | 'cross-team-collaboration'
    | 'dependency-resolution'
    | 'knowledge-sharing'
    | 'problem-solving';
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
  constructor();
  /**
   * Create a new conversation
   */
  createConversation(
    name: string,
    participantIds: string[]
  ): Promise<Conversation>;
  /**
   * Add message to conversation
   */
  addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): Promise<ConversationMessage>;
  /**
   * Send message to conversation
   */
  sendMessage(params: {
    conversationId: string;
    fromAgent: string;
    content: string;
    toAgent?: string;
    type?: ConversationMessage['type'];
  }): Promise<ConversationMessage>;
  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined;
  /**
   * List conversations, optionally filtered by agent
   */
  listConversations(agentId?: string): Conversation[];
  /**
   * Complete SPARC review
   */
  private completeSPARCReview;
  /**
   * Register a SAFe team for teamwork coordination
   */
  registerSAFeTeam(team: SAFeTeam): Promise<void>;
  /**
   * Schedule a SAFe meeting with conversation support
   */
  scheduleSAFeMeeting(meeting: SAFeMeeting): Promise<string>;
  /**
   * Complete a SAFe meeting and capture outcomes
   */
  completeSAFeMeeting(
    meetingId: string,
    outcomes: MeetingOutcome[]
  ): Promise<void>;
  /**
   * Request cross-team coordination
   */
  requestTeamworkCoordination(
    request: TeamworkCoordinationRequest
  ): Promise<string>;
  /**
   * Get SAFe team by ID
   */
  getSAFeTeam(teamId: string): SAFeTeam | undefined;
  /**
   * List all SAFe teams
   */
  listSAFeTeams(): SAFeTeam[];
  /**
   * Get meeting by ID
   */
  getSAFeMeeting(meetingId: string): SAFeMeeting | undefined;
  /**
   * List meetings for a team or ART
   */
  listSAFeMeetings(teamId?: string, artId?: string): SAFeMeeting[];
  /**
   * Update team member availability
   */
  updateMemberAvailability(
    agentId: string,
    availability: AgentAvailability
  ): Promise<void>;
  /**
   * Generate conversation ID
   */
  private generateConversationId;
  /**
   * Generate message ID
   */
  private generateMessageId;
}
export interface TeamworkSession {
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
  createSession(name: string, agents: Agent[]): Promise<TeamworkSession>;
  /**
   * Create session from SAFe team
   */
  createSAFeTeamSession(team: SAFeTeam): Promise<TeamworkSession>;
  /**
   * Start collaboration session
   */
  startCollaboration(sessionId: string): Promise<void>;
  /**
   * Schedule SAFe ceremony with conversation support
   */
  scheduleSAFeCeremony(
    teamId: string,
    ceremonyType: SAFeMeeting['type'],
    duration: number,
    agenda: MeetingAgenda[]
  ): Promise<string>;
  /**
   * Facilitate daily standup
   */
  facilitateDailyStandup(teamId: string): Promise<string>;
  /**
   * Facilitate iteration planning
   */
  facilitateIterationPlanning(teamId: string): Promise<string>;
  /**
   * Get session by ID
   */
  getSession(id: string): TeamworkSession | undefined;
  /**
   * Get conversation manager for advanced coordination
   */
  getConversationManager(): ConversationManager;
}
export declare class ConversationMemoryManager {
  private memories;
  /**
   * Store memory for conversation
   */
  storeMemory(memory: {
    conversationId: string;
    key: string;
    value: any;
  }): Promise<void>;
  /**
   * Retrieve memory for conversation
   */
  getMemory(conversationId: string, key?: string): any;
}
export declare function createConversationManager(): ConversationManager;
export declare function createTeamworkOrchestrator(): TeamworkOrchestrator;
export declare function createConversationMemoryManager(): ConversationMemoryManager;
export declare function createSAFeTeam(config: {
  name: string;
  artId: string;
  members: Omit<TeamMember, 'availability'>[];
  role?: SAFeTeam['role'];
}): SAFeTeam;
export declare function createSAFeMeeting(config: {
  type: SAFeMeeting['type'];
  teamId?: string;
  artId?: string;
  participants: string[];
  duration: number;
  agenda: MeetingAgenda[];
}): SAFeMeeting;
export declare function createTeamworkCoordinationRequest(config: {
  teamId: string;
  type: TeamworkCoordinationRequest['type'];
  description: string;
  requestedParticipants: string[];
  priority?: TeamworkCoordinationRequest['priority'];
  context?: TeamworkCoordinationRequest['context'];
}): TeamworkCoordinationRequest;
export declare function createSAFeTeamworkOrchestrator(): TeamworkOrchestrator;
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };
//# sourceMappingURL=index.d.ts.map
