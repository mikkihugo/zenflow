/**
 * @fileoverview Optional AI Enhancement Interfaces
 * 
 * Clean interfaces for optional AI integration with SAFe framework.
 * These interfaces define contracts for AI enhancements without requiring implementation.
 * Services are injected via DI and are completely optional.
 * 
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

/**
 * Optional Brain Coordinator interface for AI-powered decision making
 * Implementation provided by @claude-zen/brain package
 */
export interface IBrainCoordinator {
  analyzeWSJF(input: WSJFAnalysisInput): Promise<WSJFAnalysisResult>;
  analyzeTechnicalDebt(input: TechnicalDebtAnalysisInput): Promise<TechnicalDebtAnalysisResult>;
  analyzeArchitectureDecision(input: ArchitectureDecisionAnalysisInput): Promise<ArchitectureDecisionAnalysisResult>;
  analyzeCapability(input: CapabilityAnalysisInput): Promise<CapabilityAnalysisResult>;
  optimizeResourceAllocation(input: ResourceAllocationInput): Promise<ResourceAllocationResult>;
  predictDeliveryOutcomes(input: DeliveryPredictionInput): Promise<DeliveryPredictionResult>;
}

export interface WSJFAnalysisInput {
  epicId: string;
  businessValue: number;
  urgency: number;
  riskReduction: number;
  opportunityEnablement: number;
  size: number;
  context?: Record<string, any>;
}

export interface WSJFAnalysisResult {
  enhancedScore: number;
  confidenceLevel: number;
  recommendations: string[];
  riskFactors: string[];
  optimizationSuggestions: string[];
}

export interface TechnicalDebtAnalysisInput {
  item: any;
  existingDebt: any[];
  strategy: string;
}

export interface TechnicalDebtAnalysisResult {
  priorityScore: number;
  impactAnalysis: {
    businessImpact: number;
    technicalRisk: number;
    maintenanceBurden: number;
  };
  recommendedRemediation: string[];
  estimatedEffort: number;
}

export interface ArchitectureDecisionAnalysisInput {
  decision: any;
  context: {
    existingDecisions: any[];
    category: string;
    impact: string;
  };
}

export interface ArchitectureDecisionAnalysisResult {
  viabilityScore: number;
  alternatives: Array<{
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    score: number;
  }>;
  riskAssessment: {
    technicalRisk: number;
    businessRisk: number;
    mitigationStrategies: string[];
  };
}

export interface CapabilityAnalysisInput {
  capability: any;
  existingCapabilities: any[];
  context: {
    category: string;
    enablers: string[];
    dependencies: string[];
  };
}

export interface CapabilityAnalysisResult {
  maturityAssessment: {
    currentLevel: number;
    targetLevel: number;
    gapAnalysis: string[];
  };
  businessValue: number;
  technicalComplexity: number;
  roadmapRecommendations: string[];
}

export interface ResourceAllocationInput {
  resources: any[];
  demands: any[];
  constraints: any[];
  objectives: string[];
}

export interface ResourceAllocationResult {
  optimalAllocation: Record<string, number>;
  utilizationMetrics: Record<string, number>;
  bottleneckAnalysis: string[];
  recommendations: string[];
}

export interface DeliveryPredictionInput {
  features: any[];
  teamCapacity: any[];
  historicalData: any[];
  constraints: any[];
}

export interface DeliveryPredictionResult {
  predictedDeliveryDate: Date;
  confidenceInterval: {
    earliest: Date;
    latest: Date;
    confidence: number;
  };
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string[];
  }>;
}

/**
 * Optional Performance Tracker interface
 * Implementation provided by @claude-zen/foundation package
 */
export interface IPerformanceTracker {
  startTimer(operation: string): string;
  endTimer(timerId: string): number;
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  getMetrics(pattern?: string): Record<string, number>;
  reset(): void;
}

/**
 * Optional Telemetry Manager interface
 * Implementation provided by @claude-zen/foundation package  
 */
export interface ITelemetryManager {
  initialize(): Promise<void>;
  recordCounter(name: string, value: number, tags?: Record<string, string>): void;
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  createSpan(name: string, parentContext?: any): any;
  finishSpan(span: any, tags?: Record<string, string>): void;
  shutdown(): Promise<void>;
}

/**
 * Optional Workflow Engine interface
 * Implementation provided by @claude-zen/workflows package
 */
export interface IWorkflowEngine {
  executeWorkflow(workflowId: string, input: any): Promise<any>;
  createWorkflow(definition: WorkflowDefinition): Promise<string>;
  getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>;
  cancelWorkflow(workflowId: string): Promise<void>;
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  config?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'parallel' | 'sequence';
  config: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  config: Record<string, any>;
}

export interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

/**
 * Optional Load Balancer interface
 * Implementation provided by @claude-zen/load-balancing package
 */
export interface ILoadBalancer {
  distributeLoad(requests: any[], resources: any[]): Promise<any[]>;
  getOptimalDistribution(workload: any[], capacity: any[]): Promise<any>;
  balanceResources(allocation: ResourceAllocationInput): Promise<ResourceAllocationResult>;
  analyzeBottlenecks(metrics: any[]): Promise<string[]>;
}

/**
 * Note: AGUI (Advanced GUI) interfaces removed from AI enhancements.
 * UI interactions should use event-driven architecture, not dependency injection.
 * 
 * For approval workflows, emit events like 'approval-required' and listen for
 * 'approval-received' events. This maintains clean separation between business
 * logic and presentation layer.
 */

/**
 * Optional Conversation Orchestrator interface
 * Implementation provided by @claude-zen/teamwork package
 */
export interface IConversationOrchestrator {
  startConversation(config: ConversationConfig): Promise<string>;
  addParticipant(conversationId: string, participant: ConversationParticipant): Promise<void>;
  sendMessage(conversationId: string, message: ConversationMessage): Promise<void>;
  getConversationHistory(conversationId: string): Promise<ConversationMessage[]>;
  endConversation(conversationId: string): Promise<ConversationSummary>;
}

export interface ConversationConfig {
  topic: string;
  type: 'planning' | 'retrospective' | 'decision' | 'review';
  participants: ConversationParticipant[];
  duration?: number;
  context?: Record<string, any>;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'decision' | 'action' | 'question';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  conversationId: string;
  topic: string;
  participants: ConversationParticipant[];
  duration: number;
  messageCount: number;
  decisions: Array<{
    decision: string;
    decisionMaker: string;
    timestamp: Date;
  }>;
  actionItems: Array<{
    action: string;
    assignee: string;
    dueDate?: Date;
  }>;
  keyPoints: string[];
}

/**
 * Helper type to make all AI enhancements optional
 * Note: AGUI removed - use event-driven architecture for UI interactions
 */
export type OptionalAIEnhancements = {
  brainCoordinator?: IBrainCoordinator;
  performanceTracker?: IPerformanceTracker;
  telemetryManager?: ITelemetryManager;
  workflowEngine?: IWorkflowEngine;
  loadBalancer?: ILoadBalancer;
  conversationOrchestrator?: IConversationOrchestrator;
};

/**
 * Configuration for AI enhancements
 */
export interface AIEnhancementConfig {
  enableBrainCoordinator?: boolean;
  enablePerformanceTracking?: boolean;
  enableTelemetry?: boolean;
  enableWorkflowAutomation?: boolean;
  enableLoadBalancing?: boolean;
  // enableInteractiveGUI removed - use event-driven architecture for UI
  enableConversationOrchestration?: boolean;
  
  // AI-specific configuration
  brainConfig?: {
    learningRate?: number;
    adaptationThreshold?: number;
    confidenceThreshold?: number;
  };
  
  // Performance tracking configuration
  performanceConfig?: {
    enableDetailedMetrics?: boolean;
    retentionDays?: number;
    aggregationInterval?: number;
  };
  
  // Telemetry configuration
  telemetryConfig?: {
    serviceName?: string;
    enableTracing?: boolean;
    enableMetrics?: boolean;
    sampleRate?: number;
  };
}