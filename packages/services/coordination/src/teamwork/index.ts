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
  context:  {
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
  type: 'daily-standup' | 'iteration-planning' | 'iteration-review' | 'iteration-retrospective' | 
        'pi-planning' | 'system-demo' | 'inspect-adapt' | 'scrum-of-scrums' | 'po-sync' | 'art-sync';
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
    this.on('sparc:collaboration:request', async (request: SPARCCollaborationRequest) => {
      const conversationName = `SPARC ${request.phase} Review - ${request.projectId}`;
      const conversation = await this.createConversation(conversationName, request.suggestedAgents);
      
      // Store SPARC review context
      this.sparcReviews.set(conversation.id, request);
      
      // Add initial context message
      await this.addMessage(conversation.id, {
        fromAgent: 'system',
        content: `SPARC ${request.phase} phase review requested. Context: ${JSON.stringify(request.context, null, 2)}`,
        type: 'notification'
      });
      
      // Simulate review process (in real implementation, this would be actual agent conversations)
      setTimeout(() => {
        this.completeSPARCReview(conversation.id, true, ['Phase looks good'], ['Continue to next phase']);
      }, 5000); // 5 second simulated review
      
      logger.info(`Created SPARC review conversation: ${conversation.id}`);
    });

    // Listen for SAFe meeting requests
    this.on('safe:meeting:scheduled', async (meeting: SAFeMeeting) => {
      const conversationName = `${meeting.type.toUpperCase()} - ${meeting.teamId || meeting.artId}`;
      const conversation = await this.createConversation(conversationName, meeting.participants);
      
      // Store meeting context
      meeting.conversationId = conversation.id;
      this.safeMeetings.set(meeting.id, meeting);
      
      // Add meeting agenda as initial message
      const agendaContent = meeting.agenda.map(item => 
        `${item.title} (${item.duration}min) - ${item.presenter}`
      ).join('\n');
      
      await this.addMessage(conversation.id, {
        fromAgent: 'facilitator',
        content: `Meeting started: ${meeting.type}\nAgenda:\n${agendaContent}`,
        type: 'notification'
      });
      
      logger.info(`Created SAFe meeting conversation: ${conversation.id} for ${meeting.type}`);
    });

    // Listen for teamwork coordination requests
    this.on('teamwork:coordination:request', async (request: TeamworkCoordinationRequest) => {
      const conversationName = `Team Coordination: ${request.type} - ${request.teamId}`;
      const conversation = await this.createConversation(conversationName, request.requestedParticipants);
      
      // Store coordination context
      this.teamworkRequests.set(request.requestId, request);
      
      // Add initial coordination message
      await this.addMessage(conversation.id, {
        fromAgent: 'team-coordinator',
        content: `Coordination request: ${request.description}\nPriority: ${request.priority}\nContext: ${JSON.stringify(request.context, null, 2)}`,
        type: 'request'
      });
      
      logger.info(`Created teamwork coordination conversation: ${conversation.id}`);
    });

    // Listen for team member availability updates
    this.on('team:member:availability', async (update: { agentId: string; availability: AgentAvailability }) => {
      const agent = this.agents.get(update.agentId);
      if (agent) {
        // Update agent status based on availability
        agent.status = update.availability.status === 'available' ? 'idle' : 'busy';
        
        // Notify relevant conversations about availability change
        const relevantConversations = this.listConversations(update.agentId);
        for (const conversation of relevantConversations) {
          if (conversation.status === 'active') {
            await this.addMessage(conversation.id, {
              fromAgent: 'system',
              content: `${agent.name} is now ${update.availability.status}`,
              type: 'notification'
            });
          }
        }
      }
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(name: string, participantIds: string[]): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      name,
      participants: participantIds,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.set(conversation.id, conversation);
    this.emit('conversationCreated', conversation);
    
    return conversation;
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date()
    };

    conversation.messages.push(fullMessage);
    conversation.updatedAt = new Date();
    
    this.emit('messageAdded', { conversationId, message: fullMessage });
    
    return fullMessage;
  }

  /**
   * Send message to conversation
   */
  async sendMessage(params:  {
    conversationId: string;
    fromAgent: string;
    content: string;
    toAgent?: string;
    type?: ConversationMessage['type'];
  }): Promise<ConversationMessage> {
    const { type = 'request' } = params;
    
    const conversation = this.conversations.get(params.conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${params.conversationId}`);
    }

    const message: ConversationMessage = {
      id: this.generateMessageId(),
      fromAgent: params.fromAgent,
      toAgent: params.toAgent,
      content: params.content,
      type,
      timestamp: new Date()
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();
    
    this.emit('messageSent', { conversationId: params.conversationId, message });
    
    return message;
  }

  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * List conversations, optionally filtered by agent
   */
  listConversations(agentId?: string): Conversation[] {
    const conversations = Array.from(this.conversations.values());
    
    if (agentId) {
      return conversations.filter(c => c.participants.includes(agentId));
    }
    
    return conversations;
  }

  /**
   * Complete SPARC review
   */
  private completeSPARCReview(conversationId: string, approved: boolean, feedback: string[], recommendations: string[]): void {
    const request = this.sparcReviews.get(conversationId);
    if (!request) {
      logger.warn(`No SPARC review found for conversation: ${conversationId}`);
      return;
    }

    const result: SPARCReviewResult = {
      projectId: request.projectId,
      phase: request.phase,
      approved,
      feedback,
      recommendations,
      conversationId
    };

    this.emit('sparc:review:completed', result);
    this.sparcReviews.delete(conversationId);
  }

  /**
   * Register a SAFe team for teamwork coordination
   */
  async registerSAFeTeam(team: SAFeTeam): Promise<void> {
    this.safeTeams.set(team.id, team);
    
    // Register team members as agents
    for (const member of team.members) {
      const agent: Agent = {
        id: member.id,
        name: member.name,
        role: `${member.role} (${team.name})`,
        capabilities: member.skills,
        status: member.availability.status === 'available' ? 'idle' : 'busy'
      };
      this.agents.set(member.id, agent);
    }
    
    this.emit('safe:team:registered', team);
    logger.info(`Registered SAFe team: ${team.name} with ${team.members.length} members`);
  }

  /**
   * Schedule a SAFe meeting with conversation support
   */
  async scheduleSAFeMeeting(meeting: SAFeMeeting): Promise<string> {
    // Validate participants are available
    const unavailableParticipants: string[] = [];
    for (const participantId of meeting.participants) {
      const agent = this.agents.get(participantId);
      if (agent && agent.status === 'busy') {
        unavailableParticipants.push(agent.name);
      }
    }

    if (unavailableParticipants.length > 0 && meeting.type !== 'daily-standup') {
      logger.warn(`Some participants unavailable for ${meeting.type}: ${unavailableParticipants.join(', ')}`);
    }

    // Store meeting and emit event to trigger conversation creation
    this.safeMeetings.set(meeting.id, meeting);
    this.emit('safe:meeting:scheduled', meeting);
    
    return meeting.conversationId || '';
  }

  /**
   * Complete a SAFe meeting and capture outcomes
   */
  async completeSAFeMeeting(meetingId: string, outcomes: MeetingOutcome[]): Promise<void> {
    const meeting = this.safeMeetings.get(meetingId);
    if (!meeting) {
      throw new Error(`Meeting not found: ${meetingId}`);
    }

    meeting.status = 'completed';
    meeting.outcomes = outcomes;

    if (meeting.conversationId) {
      // Add meeting outcomes to conversation
      const outcomesSummary = outcomes.map(outcome => 
        `${outcome.type.toUpperCase()}: ${outcome.description} ${outcome.owner ? `(Owner: ${outcome.owner})` : ''}`
      ).join('\n');

      await this.addMessage(meeting.conversationId, {
        fromAgent: 'facilitator',
        content: `Meeting completed. Outcomes:\n${outcomesSummary}`,
        type: 'notification'
      });
    }

    this.emit('safe:meeting:completed', { meeting, outcomes });
    logger.info(`Completed SAFe meeting: ${meeting.type} with ${outcomes.length} outcomes`);
  }

  /**
   * Request cross-team coordination
   */
  async requestTeamworkCoordination(request: TeamworkCoordinationRequest): Promise<string> {
    // Validate team exists
    const team = this.safeTeams.get(request.teamId);
    if (!team) {
      throw new Error(`Team not found: ${request.teamId}`);
    }

    // Store request and emit event to trigger conversation creation
    this.teamworkRequests.set(request.requestId, request);
    this.emit('teamwork:coordination:request', request);
    
    return request.requestId;
  }

  /**
   * Get SAFe team by ID
   */
  getSAFeTeam(teamId: string): SAFeTeam | undefined {
    return this.safeTeams.get(teamId);
  }

  /**
   * List all SAFe teams
   */
  listSAFeTeams(): SAFeTeam[] {
    return Array.from(this.safeTeams.values());
  }

  /**
   * Get meeting by ID
   */
  getSAFeMeeting(meetingId: string): SAFeMeeting | undefined {
    return this.safeMeetings.get(meetingId);
  }

  /**
   * List meetings for a team or ART
   */
  listSAFeMeetings(teamId?: string, artId?: string): SAFeMeeting[] {
    const meetings = Array.from(this.safeMeetings.values());
    
    if (teamId) {
      return meetings.filter(m => m.teamId === teamId);
    }
    
    if (artId) {
      return meetings.filter(m => m.artId === artId);
    }
    
    return meetings;
  }

  /**
   * Update team member availability
   */
  async updateMemberAvailability(agentId: string, availability: AgentAvailability): Promise<void> {
    this.emit('team:member:availability', { agentId, availability });
  }

  /**
   * Generate conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Multi-agent orchestration
export interface TeamworkSession {
  id: string;
  name: string;
  agents: Agent[];
  conversations: Conversation[];
  status: 'idle' | 'executing' | 'completed';
  createdAt: Date;
}

export class TeamworkOrchestrator {
  private sessions = new Map<string, TeamworkSession>();
  private conversationManager = new ConversationManager();

  /**
   * Create teamwork session
   */
  async createSession(name: string, agents: Agent[]): Promise<TeamworkSession> {
    const session: TeamworkSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      agents,
      conversations: [],
      status: 'idle',
      createdAt: new Date()
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Create session from SAFe team
   */
  async createSAFeTeamSession(team: SAFeTeam): Promise<TeamworkSession> {
    const agents: Agent[] = team.members.map(member => ({
      id: member.id,
      name: member.name,
      role: `${member.role} (${team.name})`,
      capabilities: member.skills,
      status: member.availability.status === 'available' ? 'idle' : 'busy'
    }));

    const session = await this.createSession(`SAFe Team Session - ${team.name}`, agents);
    
    // Register the SAFe team with the conversation manager
    await this.conversationManager.registerSAFeTeam(team);
    
    return session;
  }

  /**
   * Start collaboration session
   */
  async startCollaboration(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const agentIds = session.agents.map(a => a.id);
    const conversation = await this.conversationManager.createConversation(
      `${session.name} - Main Discussion`,
      agentIds
    );
    
    session.conversations.push(conversation);
    session.status = 'executing';
  }

  /**
   * Schedule SAFe ceremony with conversation support
   */
  async scheduleSAFeCeremony(
    teamId: string, 
    ceremonyType: SAFeMeeting['type'], 
    duration: number,
    agenda: MeetingAgenda[]
  ): Promise<string> {
    const team = this.conversationManager.getSAFeTeam(teamId);
    if (!team) {
      throw new Error(`SAFe team not found: ${teamId}`);
    }

    const meeting: SAFeMeeting = {
      id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ceremonyType,
      teamId,
      participants: team.members.map(m => m.id),
      duration,
      scheduledAt: new Date(),
      status: 'scheduled',
      agenda,
      outcomes: []
    };

    const conversationId = await this.conversationManager.scheduleSAFeMeeting(meeting);
    return conversationId;
  }

  /**
   * Facilitate daily standup
   */
  async facilitateDailyStandup(teamId: string): Promise<string> {
    const agenda: MeetingAgenda[] = [
      {
        id: 'standup-1',
        title: 'What did you accomplish yesterday?',
        description: 'Share completed work and progress',
        duration: 5,
        presenter: 'team',
        topics: ['completed-work', 'progress-updates']
      },
      {
        id: 'standup-2', 
        title: 'What will you work on today?',
        description: 'Share planned work for today',
        duration: 5,
        presenter: 'team',
        topics: ['planned-work', 'commitments']
      },
      {
        id: 'standup-3',
        title: 'Are there any impediments?',
        description: 'Identify and discuss blockers',
        duration: 5,
        presenter: 'team',
        topics: ['impediments', 'blockers', 'help-needed']
      }
    ];

    return await this.scheduleSAFeCeremony(teamId, 'daily-standup', 15, agenda);
  }

  /**
   * Facilitate iteration planning
   */
  async facilitateIterationPlanning(teamId: string): Promise<string> {
    const agenda: MeetingAgenda[] = [
      {
        id: 'planning-1',
        title: 'Review Iteration Goals',
        description: 'Understand objectives for the iteration',
        duration: 30,
        presenter: 'product-owner',
        topics: ['iteration-goals', 'business-objectives']
      },
      {
        id: 'planning-2',
        title: 'Story Planning and Estimation',
        description: 'Break down and estimate stories',
        duration: 90,
        presenter: 'team',
        topics: ['story-breakdown', 'estimation', 'acceptance-criteria']
      },
      {
        id: 'planning-3',
        title: 'Capacity Planning',
        description: 'Determine team capacity and commitment',
        duration: 30,
        presenter: 'scrum-master',
        topics: ['capacity-planning', 'commitment']
      }
    ];

    return await this.scheduleSAFeCeremony(teamId, 'iteration-planning', 150, agenda);
  }

  /**
   * Get session by ID
   */
  getSession(id: string): TeamworkSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get conversation manager for advanced coordination
   */
  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }
}

export class ConversationMemoryManager {
  private memories = new Map<string, any>();

  /**
   * Store memory for conversation
   */
  async storeMemory(memory:  { conversationId: string, key: string, value: any }): Promise<void> {
    const existing = this.memories.get(memory.conversationId) || {};
    const updates = { [memory.key]: memory.value };
    
    this.memories.set(memory.conversationId, { ...existing, ...updates, lastUpdated: new Date() });
  }

  /**
   * Retrieve memory for conversation
   */
  getMemory(conversationId: string, key?: string): any {
    const memory = this.memories.get(conversationId);
    return key ? memory?.[key] : memory;
  }
}

// Factory functions
export function createConversationManager(): ConversationManager {
  return new ConversationManager();
}

export function createTeamworkOrchestrator(): TeamworkOrchestrator {
  return new TeamworkOrchestrator();
}

export function createConversationMemoryManager(): ConversationMemoryManager {
  return new ConversationMemoryManager();
}

// SAFe integration factory functions
export function createSAFeTeam(config: {
  name: string;
  artId: string;
  members: Omit<TeamMember, 'availability'>[];
  role?: SAFeTeam['role'];
}): SAFeTeam {
  return {
    id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    artId: config.artId,
    members: config.members.map(member => ({
      ...member,
      availability: {
        status: 'available',
        nextAvailable: new Date()
      }
    })),
    role: config.role || 'development',
    capacity: {
      totalStoryPoints: 0,
      availableHours: config.members.length * 40, // Default 40 hours per member
      commitmentLevel: 0.8, // Default 80% commitment
      velocityHistory: []
    },
    skills: [...new Set(config.members.flatMap(m => m.skills))],
    status: 'forming'
  };
}

export function createSAFeMeeting(config: {
  type: SAFeMeeting['type'];
  teamId?: string;
  artId?: string;
  participants: string[];
  duration: number;
  agenda: MeetingAgenda[];
}): SAFeMeeting {
  return {
    id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: config.type,
    teamId: config.teamId,
    artId: config.artId,
    participants: config.participants,
    duration: config.duration,
    scheduledAt: new Date(),
    status: 'scheduled',
    agenda: config.agenda,
    outcomes: []
  };
}

export function createTeamworkCoordinationRequest(config: {
  teamId: string;
  type: TeamworkCoordinationRequest['type'];
  description: string;
  requestedParticipants: string[];
  priority?: TeamworkCoordinationRequest['priority'];
  context?: TeamworkCoordinationRequest['context'];
}): TeamworkCoordinationRequest {
  return {
    requestId: `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    teamId: config.teamId,
    type: config.type,
    description: config.description,
    priority: config.priority || 'medium',
    requestedParticipants: config.requestedParticipants,
    context: config.context || {
      relatedFeatures: [],
      dependencies: [],
      constraints: []
    }
  };
}

// Enhanced teamwork orchestrator with SAFe integration
export function createSAFeTeamworkOrchestrator(): TeamworkOrchestrator {
  const orchestrator = new TeamworkOrchestrator();
  
  // Pre-configure common SAFe ceremonies
  const originalCreate = orchestrator.createSAFeTeamSession.bind(orchestrator);
  
  return orchestrator;
}

// Legacy compatibility
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };