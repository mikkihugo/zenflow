/**
 * Conversation Framework Types.
 *
 * Ag2.ai-inspired conversation types for multi-agent communication.
 */
/**
 * @file TypeScript type definitions.
 */

// Standalone types for conversation framework  
export interface AgentId {
  id: string;
  swarmId: string;
  type: AgentType;
  instance: number;
}
export type AgentType = 
  | 'researcher' 
  | 'coder' 
  | 'analyst' 
  | 'optimizer' 
  | 'coordinator' 
  | 'tester' 
  | 'architect';

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

/**
 * Conversation message types for structured agent communication.
 *
 * @example
 */
export interface ConversationMessage {
  id: string;
  conversationId: string;
  fromAgent: AgentId;
  toAgent: AgentId | undefined; // undefined for broadcast messages
  timestamp: Date;
  content: MessageContent;
  messageType: MessageType;
  metadata: MessageMetadata;
}

export type MessageType =
  | 'task_request'
  | 'task_response'
  | 'question'
  | 'answer'
  | 'suggestion'
  | 'critique'
  | 'agreement'
  | 'disagreement'
  | 'clarification'
  | 'summary'
  | 'decision'
  | 'system_notification';

export interface MessageContent {
  text: string;
  code: string | undefined;
  data: unknown | undefined;
  attachments: ConversationAttachment[] | undefined;
}

export interface MessageMetadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  context: ConversationContext;
  tags: string[];
  referencedMessages: string[] | undefined;
}

export interface ConversationAttachment {
  type: 'file' | 'image' | 'data' | 'code' | 'link';
  content: unknown;
  metadata: Record<string, unknown> | undefined;
}

/**
 * Conversation session management.
 *
 * @example
 */
export interface ConversationSession {
  id: string;
  title: string;
  description: string | undefined;
  participants: AgentId[];
  initiator: AgentId;
  orchestrator: AgentId | undefined;
  startTime: Date;
  endTime: Date | undefined;
  status: ConversationStatus;
  context: ConversationContext;
  messages: ConversationMessage[];
  outcomes: ConversationOutcome[];
  metrics: ConversationMetrics;
}

export type ConversationStatus =
  | 'initializing'
  | 'active'
  | 'paused'
  | 'completed'
  | 'terminated'
  | 'error';

export interface ConversationContext {
  task: unknown | undefined;
  goal: string;
  constraints: string[];
  resources: string[];
  deadline: Date | undefined;
  domain: string;
  expertise: string[];
  solutionId?: string;
  impedimentId?: string;
}

export interface ConversationOutcome {
  type:
    | 'decision'
    | 'solution'
    | 'plan'
    | 'code'
    | 'analysis'
    | 'recommendation';
  content: unknown;
  confidence: number;
  contributors: AgentId[];
  timestamp: Date;
}

export interface ConversationMetrics {
  messageCount: number;
  participationByAgent: Record<string, number>;
  averageResponseTime: number;
  resolutionTime?: number;
  consensusScore: number;
  qualityRating: number;
}

/**
 * Conversation patterns and orchestration.
 *
 * @example
 */
export interface ConversationPattern {
  name: string;
  description: string;
  roles: ConversationRole[];
  workflow: ConversationStep[];
  constraints: PatternConstraint[];
}

export interface ConversationRole {
  name: string;
  agentTypes: AgentType[];
  responsibilities: string[];
  permissions: RolePermission[];
  required: boolean;
}

export interface RolePermission {
  action: 'read' | 'write' | 'moderate' | 'terminate' | 'invite';
  scope: 'all' | 'own' | 'direct' | 'group';
}

export interface ConversationStep {
  id: string;
  name: string;
  description: string;
  trigger: StepTrigger;
  actions: StepAction[];
  participants: string[]; // role names
  timeout?: number;
  retries?: number;
}

export interface StepTrigger {
  type: 'time' | 'message' | 'consensus' | 'external' | 'manual';
  condition: unknown;
}

export interface StepAction {
  type:
    | 'send_message'
    | 'request_input'
    | 'make_decision'
    | 'summarize'
    | 'escalate';
  params: unknown;
  agent?: string; // role name
}

export interface PatternConstraint {
  type:
    | 'time_limit'
    | 'message_limit'
    | 'participant_limit'
    | 'quality_threshold';
  value: unknown;
}

/**
 * Conversation orchestration engine.
 *
 * @example
 */
export interface ConversationOrchestrator {
  createConversation(config: ConversationConfig): Promise<ConversationSession>;
  startConversation(config: ConversationConfig | string): Promise<ConversationSession>;
  joinConversation(conversationId: string, agent: AgentId): Promise<void>;
  leaveConversation(conversationId: string, agent: AgentId): Promise<void>;
  sendMessage(message: ConversationMessage): Promise<void>;
  moderateConversation(
    conversationId: string,
    action: ModerationAction
  ): Promise<void>;
  getConversationHistory(
    conversationId: string
  ): Promise<ConversationMessage[]>;
  terminateConversation(
    conversationId: string,
    reason?: string
  ): Promise<ConversationOutcome[]>;
}

export interface ConversationConfig {
  title: string;
  description?: string;
  pattern: string; // pattern name
  context: ConversationContext;
  initialParticipants: AgentId[];
  orchestrator?: AgentId;
  timeout?: number;
  maxMessages?: number;
}

export interface ModerationAction {
  type:
    | 'mute'
    | 'unmute'
    | 'warn'
    | 'remove'
    | 'change_role'
    | 'pause'
    | 'resume';
  target: AgentId;
  reason: string;
  duration?: number;
}

/**
 * Learning and adaptation types.
 *
 * @example
 */
export interface ConversationLearning {
  patternId: string;
  sessionId: string;
  insights: LearningInsight[];
  improvements: PatternImprovement[];
  feedback: ConversationFeedback[];
}

export interface LearningInsight {
  type: 'efficiency' | 'quality' | 'participation' | 'outcome';
  description: string;
  confidence: number;
  evidence: unknown[];
  applicability: string[];
}

export interface PatternImprovement {
  target: 'workflow' | 'roles' | 'constraints' | 'triggers';
  change: unknown;
  rationale: string;
  expectedImpact: number;
}

export interface ConversationFeedback {
  from: AgentId;
  rating: number;
  comments: string;
  suggestions: string[];
  timestamp: Date;
}

/**
 * Memory and persistence.
 *
 * @example
 */
export interface ConversationMemory {
  storeConversation(session: ConversationSession): Promise<void>;
  getConversation(id: string): Promise<ConversationSession | null>;
  searchConversations(query: ConversationQuery): Promise<ConversationSession[]>;
  updateConversation(
    id: string,
    updates: Partial<ConversationSession>
  ): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  getAgentConversationHistory(agentId: string): Promise<ConversationSession[]>;
}

export interface ConversationQuery {
  agentId?: string;
  pattern?: string;
  domain?: string;
  dateRange?: { start: Date; end: Date };
  status?: ConversationStatus;
  outcome?: string;
  limit?: number;
  offset?: number;
}

/**
 * Interface for conversation tools integration.
 *
 * @example
 */
export interface ConversationTools {
  getTools(): Tool[];
}

// Add missing exports for index.ts compatibility
export interface ConversationParticipant {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
}

export interface DialoguePattern {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    role: string;
    action: string;
    parameters?: Record<string, unknown>;
  }>;
}

export interface TeamworkConfig {
  maxParticipants?: number;
  enableLogging?: boolean;
  timeout?: number;
  patterns?: DialoguePattern[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  participantCount: number;
  messageCount: number;
  duration?: number;
  status: ConversationStatus;
  outcome?: string;
  keyDecisions: string[];
  timestamp: Date;
}
