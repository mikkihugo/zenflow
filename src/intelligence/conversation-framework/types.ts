/**
 * Conversation Framework Types.
 *
 * Ag2.ai-inspired conversation types for multi-agent communication.
 */
/**
 * @file TypeScript type definitions.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { AgentId, DetailedAgentType as AgentType } from '../../types';

/**
 * Conversation message types for structured agent communication.
 *
 * @example
 */
export interface ConversationMessage {
  id: string;
  conversationId: string;
  fromAgent: AgentId;
  toAgent?: AgentId; // undefined for broadcast messages
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
  code?: string;
  data?: any;
  attachments?: ConversationAttachment[];
}

export interface MessageMetadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  context: ConversationContext;
  tags: string[];
  referencedMessages?: string[];
}

export interface ConversationAttachment {
  type: 'file' | 'image' | 'data' | 'code' | 'link';
  content: any;
  metadata?: Record<string, any>;
}

/**
 * Conversation session management.
 *
 * @example
 */
export interface ConversationSession {
  id: string;
  title: string;
  description?: string;
  participants: AgentId[];
  initiator: AgentId;
  orchestrator?: AgentId;
  startTime: Date;
  endTime?: Date;
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
  task?: any;
  goal: string;
  constraints: string[];
  resources: string[];
  deadline?: Date;
  domain: string;
  expertise: string[];
}

export interface ConversationOutcome {
  type: 'decision' | 'solution' | 'plan' | 'code' | 'analysis' | 'recommendation';
  content: any;
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
  condition: any;
}

export interface StepAction {
  type: 'send_message' | 'request_input' | 'make_decision' | 'summarize' | 'escalate';
  params: any;
  agent?: string; // role name
}

export interface PatternConstraint {
  type: 'time_limit' | 'message_limit' | 'participant_limit' | 'quality_threshold';
  value: any;
}

/**
 * Conversation orchestration engine.
 *
 * @example
 */
export interface ConversationOrchestrator {
  createConversation(config: ConversationConfig): Promise<ConversationSession>;
  joinConversation(conversationId: string, agent: AgentId): Promise<void>;
  leaveConversation(conversationId: string, agent: AgentId): Promise<void>;
  sendMessage(message: ConversationMessage): Promise<void>;
  moderateConversation(conversationId: string, action: ModerationAction): Promise<void>;
  getConversationHistory(conversationId: string): Promise<ConversationMessage[]>;
  terminateConversation(conversationId: string, reason?: string): Promise<ConversationOutcome[]>;
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
  type: 'mute' | 'unmute' | 'warn' | 'remove' | 'change_role' | 'pause' | 'resume';
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
  evidence: any[];
  applicability: string[];
}

export interface PatternImprovement {
  target: 'workflow' | 'roles' | 'constraints' | 'triggers';
  change: any;
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
  updateConversation(id: string, updates: Partial<ConversationSession>): Promise<void>;
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
 * Interface for MCP tools integration.
 *
 * @example
 */
export interface ConversationMCPTools {
  getTools(): Tool[];
}
