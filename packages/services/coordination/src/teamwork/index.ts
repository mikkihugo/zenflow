import { getLogger as _getLogger } from '@claude-zen/foundation';
/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus, getLogger } from '@claude-zen/foundation';
const logger = getLogger('Teamwork');

// Agent conversation types
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
  toAgent?: string; // undefined for broadcast
  content: string;
  timestamp: Date;
  type: 'request' | 'response' | 'notification' | 'broadcast';
}

export interface Conversation {
  id: string;
  name: string;
  participants: string[]; // agent IDs
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'paused';
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
  _context: {
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
// SAFE TEAMWORK INTEGRATION TYPES
// ============================================================================
export interface SAFeTeam {
  id: string;
  name: string;
  artId: string; // Agile Release Train ID
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
  capacity: number; // percentage of time available
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
  commitmentLevel: number; // 0-1 scale
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
  duration: number; // minutes
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
  duration: number; // minutes
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
  _context: {
    relatedFeatures: string[];
    dependencies: string[];
    constraints: string[];
  };
  deadline?: Date;
}

// ============================================================================
// EVENT-DRIVEN CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Event-driven Conversation Manager with optional SPARC integration and SAFe teamwork
 */
export class ConversationManager extends EventBus {
  private conversations = new Map<string, Conversation>();
  private agents = new Map<string, Agent>();
  private sparcReviews = new Map<string, SPARCCollaborationRequest>();
  private safeTeams = new Map<string, SAFeTeam>();
  private safeMeetings = new Map<string, SAFeMeeting>();
  private teamworkRequests = new Map<string, TeamworkCoordinationRequest>();

  constructor() {
    super();

    // Listen for SPARC collaboration requests (optional - only if SPARC active)
    this.on(
      'sparc:collaboration:request',
      async (_request: SPARCCollaborationRequest) => {
        const conversationName = `SPARC ${request.phase} Review - ${request.projectId}"Fixed unterminated template" `SPARC ${request.phase} phase review requested. Context: ${JSON.stringify(request.context, null, 2)}"Fixed unterminated template"(`Created SPARC review conversation: ${conversation.id}"Fixed unterminated template" `${meeting.type.toUpperCase()} - ${meeting.teamId || meeting.artId}"Fixed unterminated template" `${item.title} (${item.duration}min) - ${item.presenter}"Fixed unterminated template" `Meeting started: ${meeting.type}\nAgenda:\n${agendaContent}"Fixed unterminated template" `Created SAFe meeting conversation: ${conversation.id} for ${meeting.type}"Fixed unterminated template" `Team Coordination: ${request.type} - ${request.teamId}"Fixed unterminated template" `Coordination _request: ${request.description}\nPriority: ${request.priority}\nContext: ${JSON.stringify(request.context, null, 2)}"Fixed unterminated template" `Created teamwork coordination conversation: ${conversation.id}"Fixed unterminated template" `${agent.name} is now ${update.availability.status}"Fixed unterminated template"(`Conversation not found: ${conversationId}"Fixed unterminated template"(`Conversation not found: ${params.conversationId}"Fixed unterminated template"(`No SPARC review found for conversation: ${conversationId}"Fixed unterminated template" `${member.role} (${team.name})"Fixed unterminated template" `Registered SAFe team: ${team.name} with ${team.members.length} members"Fixed unterminated template"}"Fixed unterminated template" `${outcome.type.toUpperCase()}: ${outcome.description} ${outcome.owner ? `(Owner: ${outcome.owner})` : ''}"Fixed unterminated template" `Meeting completed. Outcomes:\n${outcomesSummary}"Fixed unterminated template" `Completed SAFe meeting: ${meeting.type} with ${outcomes.length} outcomes"Fixed unterminated template"(`Team not found: ${request.teamId}"Fixed unterminated template" `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `${member.role} (${team.name})"Fixed unterminated template" `SAFe Team Session - ${team.name}"Fixed unterminated template"(`Session not found: ${sessionId}"Fixed unterminated template" `${session.name} - Main Discussion"Fixed unterminated template"(`SAFe team not found: ${teamId}"Fixed unterminated template" `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"