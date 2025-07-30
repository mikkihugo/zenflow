/**
 * Swarm System Types
 * Enhanced swarm orchestration with neural integration and advanced coordination
 */

import { Identifiable, JSONObject, TypedEventEmitter, ResourceUsage, OperationResult, UUID } from './core.js';
import { Queen, Task, TaskResult, Consensus, TaskType } from './queen.js';

// =============================================================================
// SWARM CORE TYPES
// =============================================================================

export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star' | 'tree' | 'hybrid' | 'adaptive';
export type SwarmStrategy = 'parallel' | 'sequential' | 'adaptive' | 'specialized' | 'consensus' | 'competitive';
export type SwarmMode = 'ephemeral' | 'persistent' | 'hybrid' | 'auto-scaling' | 'on-demand';
export type SwarmStatus = 'initializing' | 'active' | 'busy' | 'scaling' | 'degraded' | 'stopping' | 'stopped' | 'error';

export interface SwarmConfig {
  // Basic configuration
  name: string;
  description: string;
  version: string;
  mode: SwarmMode;
  strategy: SwarmStrategy;
  topology: SwarmTopology;
  
  // Capacity and scaling
  maxAgents: number;
  minAgents: number;
  maxTasks: number;
  maxDuration: number; // milliseconds
  taskTimeoutMinutes: number;
  
  // Coordination strategy
  coordinationStrategy: {
    name: string;
    description: string;
    agentSelection: 'random' | 'skill-based' | 'load-balanced' | 'specialized' | 'adaptive';
    taskScheduling: 'fifo' | 'priority' | 'shortest-job' | 'round-robin' | 'intelligent';
    loadBalancing: 'none' | 'round-robin' | 'least-connections' | 'resource-aware' | 'adaptive';
    faultTolerance: 'none' | 'retry' | 'redundancy' | 'circuit-breaker' | 'self-healing';
    communication: 'direct' | 'broadcast' | 'gossip' | 'hierarchical' | 'event-driven';
  };
  
  // Resource management
  resourceLimits: {
    memory: number; // MB
    cpu: number; // percentage
    disk: number; // MB
    network: number; // KB/s
  };
  
  // Quality and performance
  qualityThreshold: number; // 0-1
  reviewRequired: boolean;
  testingRequired: boolean;
  
  // Monitoring and observability
  monitoring: {
    metricsEnabled: boolean;
    loggingEnabled: boolean;
    tracingEnabled: boolean;
    metricsInterval: number; // seconds
    heartbeatInterval: number; // seconds
    healthCheckInterval: number; // seconds
    retentionPeriod: number; // days
    maxLogSize: number; // MB
    maxMetricPoints: number;
    alertingEnabled: boolean;
    alertThresholds: JSONObject;
    exportEnabled: boolean;
    exportFormat: 'json' | 'csv' | 'prometheus' | 'influx';
    exportDestination: string;
  };
  
  // Memory and state management
  memory: {
    namespace: string;
    partitions: SwarmPartition[];
    permissions: {
      read: 'all' | 'agents' | 'coordinators' | 'restricted';
      write: 'all' | 'agents' | 'coordinators' | 'restricted';
      delete: 'all' | 'agents' | 'coordinators' | 'restricted';
      share: 'all' | 'agents' | 'coordinators' | 'restricted';
    };
    persistent: boolean;
    backupEnabled: boolean;
    distributed: boolean;
    consistency: 'eventual' | 'strong' | 'weak' | 'causal';
    cacheEnabled: boolean;
    compressionEnabled: boolean;
  };
  
  // Security and isolation
  security: {
    authenticationRequired: boolean;
    authorizationRequired: boolean;
    encryptionEnabled: boolean;
    defaultPermissions: string[];
    adminRoles: string[];
    auditEnabled: boolean;
    auditLevel: 'basic' | 'detailed' | 'comprehensive';
    inputValidation: boolean;
    outputSanitization: boolean;
  };
  
  // Performance optimization
  performance: {
    maxConcurrency: number;
    defaultTimeout: number; // milliseconds
    cacheEnabled: boolean;
    cacheSize: number; // MB
    cacheTtl: number; // seconds
    optimizationEnabled: boolean;
    adaptiveScheduling: boolean;
    predictiveLoading: boolean;
    resourcePooling: boolean;
    connectionPooling: boolean;
    memoryPooling: boolean;
  };
  
  // Advanced features
  maxRetries: number;
  autoScaling: boolean;
  loadBalancing: boolean;
  faultTolerance: boolean;
  realTimeMonitoring: boolean;
  maxThroughput: number;
  latencyTarget: number; // milliseconds
  reliabilityTarget: number; // 0-1
  
  // Integration flags
  mcpIntegration: boolean;
  hiveIntegration: boolean;
  claudeCodeIntegration: boolean;
  neuralProcessing: boolean;
  learningEnabled: boolean;
  adaptiveScheduling: boolean;
}

export interface SwarmPartition {
  name: string;
  type: 'shared' | 'private' | 'public' | 'restricted';
  maxSize: number; // MB
  encryption: boolean;
  compression: boolean;
  replication: number;
  consistency: 'eventual' | 'strong' | 'weak';
}

// =============================================================================
// SWARM OBJECTIVE & TASKS
// =============================================================================

export interface SwarmObjective extends Identifiable {
  name: string;
  description: string;
  strategy: SwarmStrategy;
  mode: SwarmMode;
  
  // Requirements and constraints
  requirements: {
    minAgents: number;
    maxAgents: number;
    agentTypes: AgentType[];
    estimatedDuration: number; // milliseconds
    maxDuration: number; // milliseconds
    qualityThreshold: number; // 0-1
    reviewCoverage: number; // 0-1
    testCoverage: number; // 0-1
    reliabilityTarget: number; // 0-1
  };
  
  constraints: {
    maxCost: number;
    resourceLimits: ResourceLimits;
    minQuality: number; // 0-1
    requiredApprovals: ApprovalRequirement[];
    allowedFailures: number;
    recoveryTime: number; // milliseconds
    milestones: Milestone[];
    deadline?: Date;
  };
  
  // Task breakdown
  tasks: SwarmTask[];
  dependencies: TaskDependency[];
  
  // Execution tracking
  status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: SwarmProgress;
  startedAt?: Date;
  completedAt?: Date;
  
  // Results and outcomes
  results: SwarmResults;
  metrics: SwarmMetrics;
}

export interface AgentType {
  type: string;
  count: number;
  specialization: string[];
  requirements: string[];
}

export interface ResourceLimits {
  memory: number; // MB
  cpu: number; // percentage
  disk: number; // MB
  network: number; // KB/s
  gpu?: number; // percentage
}

export interface ApprovalRequirement {
  type: 'human' | 'automated' | 'peer-review' | 'quality-gate';
  criteria: string[];
  threshold: number;
  required: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  estimatedCompletion: Date;
  actualCompletion?: Date;
  criteria: string[];
  weight: number; // 0-1
}

export interface TaskDependency {
  taskId: UUID;
  dependsOn: UUID[];
  type: 'hard' | 'soft' | 'resource' | 'data';
  description: string;
}

// =============================================================================
// SWARM AGENTS
// =============================================================================

export interface SwarmAgent extends Identifiable {
  name: string;
  type: AgentType;
  status: 'initializing' | 'idle' | 'busy' | 'overloaded' | 'error' | 'offline';
  
  // Capabilities and specialization
  capabilities: AgentCapability[];
  specializations: string[];
  skills: Skill[];
  experience: Experience[];
  
  // Performance metrics
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    averageExecutionTime: number;
    totalDuration: number;
    qualityScore: number; // 0-1
    reliabilityScore: number; // 0-1
    collaborationScore: number; // 0-1
    learningRate: number; // 0-1
    adaptationSpeed: number; // 0-1
    lastActivity: Date;
  };
  
  // Current state
  currentTask?: UUID;
  queuedTasks: UUID[];
  workload: number; // 0-1
  availability: number; // 0-1
  
  // Resource usage
  resourceUsage: ResourceUsage;
  resourceLimits: ResourceLimits;
  
  // Learning and adaptation
  knowledgeBase: JSONObject;
  learningHistory: LearningEvent[];
  adaptationEvents: AdaptationEvent[];
  
  // Relationships
  teammates: UUID[];
  mentors: UUID[];
  mentees: UUID[];
  collaborationHistory: CollaborationHistory[];
}

export interface AgentCapability {
  name: string;
  proficiency: number; // 0-1
  experience: number; // hours
  lastUsed: Date;
  certification?: string;
  prerequisites: string[];
}

export interface Skill {
  name: string;
  level: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'master';
  domain: string;
  acquired: Date;
  lastPracticed: Date;
  proficiency: number; // 0-1
  transferability: number; // 0-1
}

export interface Experience {
  task: string;
  domain: string;
  outcome: 'success' | 'failure' | 'partial';
  lessons: string[];
  duration: number; // milliseconds
  difficulty: number; // 0-1
  satisfaction: number; // 0-1
  date: Date;
}

export interface LearningEvent {
  type: 'observation' | 'feedback' | 'exploration' | 'instruction' | 'discovery';
  content: JSONObject;
  source: string;
  confidence: number; // 0-1
  applicability: number; // 0-1
  retention: number; // 0-1
  timestamp: Date;
}

export interface AdaptationEvent {
  trigger: string;
  changes: JSONObject;
  effectiveness: number; // 0-1
  persistence: boolean;
  context: JSONObject;
  timestamp: Date;
}

export interface CollaborationHistory {
  partnerId: UUID;
  taskId: UUID;
  role: 'leader' | 'follower' | 'peer' | 'specialist' | 'coordinator';
  satisfaction: number; // 0-1
  effectiveness: number; // 0-1
  lessons: string[];
  date: Date;
}

// =============================================================================
// SWARM TASKS
// =============================================================================

export interface SwarmTask extends Identifiable {
  type: TaskType;
  name: string;
  description: string;
  
  // Requirements and specifications
  requirements: {
    capabilities: AgentCapability[];
    tools: string[];
    permissions: string[];
    estimatedDuration: number; // milliseconds
    maxDuration: number; // milliseconds
    memoryRequired: number; // MB
    cpuRequired: number; // percentage
    qualityThreshold: number; // 0-1
  };
  
  // Constraints and dependencies
  constraints: {
    dependencies: UUID[];
    dependents: UUID[];
    conflicts: UUID[];
    maxRetries: number;
    timeoutAfter: number; // milliseconds
    resourceLimits: ResourceLimits;
    qualityGates: QualityGate[];
  };
  
  // Scheduling and priority
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  scheduledFor?: Date;
  deadline?: Date;
  
  // Input and context
  input: JSONObject;
  instructions: string;
  context: JSONObject;
  examples: JSONObject[];
  
  // Execution tracking
  status: 'pending' | 'queued' | 'assigned' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  assignedAgents: UUID[];
  attempts: TaskAttempt[];
  statusHistory: TaskStatusChange[];
  
  // Results and outputs
  output?: JSONObject;
  artifacts?: JSONObject[];
  logs?: string[];
  metrics?: TaskMetrics;
  
  // Quality assurance
  reviewStatus: 'pending' | 'in-review' | 'approved' | 'rejected' | 'conditionally-approved';
  reviewers: UUID[];
  reviewComments: ReviewComment[];
  testResults?: TestResult[];
}

export interface QualityGate {
  name: string;
  type: 'automated' | 'manual' | 'hybrid';
  criteria: JSONObject;
  threshold: number; // 0-1
  blocking: boolean;
  timeout: number; // milliseconds
}

export interface TaskAttempt {
  attemptNumber: number;
  agentId: UUID;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  output?: JSONObject;
  error?: string;
  metrics: TaskMetrics;
  resources: ResourceUsage;
}

export interface TaskStatusChange {
  from: string;
  to: string;
  reason: string;
  agentId?: UUID;
  timestamp: Date;
  metadata?: JSONObject;
}

export interface TaskMetrics {
  executionTime: number; // milliseconds
  cpuTime: number; // milliseconds
  memoryPeak: number; // MB
  networkIO: number; // KB
  diskIO: number; // KB
  cacheHits: number;
  cacheMisses: number;
  qualityScore: number; // 0-1
  complexityScore: number; // 0-1
  innovationScore: number; // 0-1
}

export interface ReviewComment {
  reviewerId: UUID;
  type: 'suggestion' | 'issue' | 'approval' | 'rejection' | 'question';
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  location?: string;
  resolved: boolean;
  timestamp: Date;
}

export interface TestResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number; // milliseconds
  message?: string;
  details?: JSONObject;
  coverage?: number; // 0-1
}

// =============================================================================
// SWARM COORDINATION
// =============================================================================

export interface SwarmCoordinator extends Identifiable {
  type: 'central' | 'distributed' | 'hierarchical' | 'peer-to-peer' | 'hybrid';
  status: 'active' | 'standby' | 'overloaded' | 'failed';
  
  // Coordination responsibilities
  responsibilities: {
    taskScheduling: boolean;
    resourceAllocation: boolean;
    loadBalancing: boolean;
    conflictResolution: boolean;
    performanceMonitoring: boolean;
    qualityAssurance: boolean;
    learningCoordination: boolean;
  };
  
  // Managed entities
  managedAgents: UUID[];
  managedTasks: UUID[];
  managedResources: string[];
  
  // Decision making
  decisionAlgorithms: {
    taskAssignment: 'round-robin' | 'capability-based' | 'load-balanced' | 'ml-optimized';
    resourceAllocation: 'fair-share' | 'priority-based' | 'demand-driven' | 'predictive';
    conflictResolution: 'priority-based' | 'negotiation' | 'consensus' | 'escalation';
    performanceOptimization: 'reactive' | 'proactive' | 'predictive' | 'adaptive';
  };
  
  // Performance metrics
  coordinationMetrics: {
    tasksCoordinated: number;
    averageResponseTime: number;
    conflictsResolved: number;
    optimizationActions: number;
    agentSatisfaction: number; // 0-1
    systemEfficiency: number; // 0-1
    decisionAccuracy: number; // 0-1
  };
  
  // Learning and adaptation
  coordinationPatterns: CoordinationPattern[];
  optimizationHistory: OptimizationEvent[];
  performanceModels: PerformanceModel[];
}

export interface CoordinationPattern {
  name: string;
  context: JSONObject;
  actions: JSONObject[];
  effectiveness: number; // 0-1
  frequency: number;
  lastUsed: Date;
  success_rate: number; // 0-1
}

export interface OptimizationEvent {
  type: 'resource_reallocation' | 'task_reassignment' | 'algorithm_adjustment' | 'topology_change';
  trigger: string;
  actions: JSONObject[];
  impact: JSONObject;
  effectiveness: number; // 0-1
  timestamp: Date;
}

export interface PerformanceModel {
  name: string;
  type: 'statistical' | 'ml' | 'heuristic' | 'hybrid';
  accuracy: number; // 0-1
  parameters: JSONObject;
  training_data: JSONObject[];
  predictions: Prediction[];
  lastUpdated: Date;
}

export interface Prediction {
  type: 'performance' | 'resource_usage' | 'completion_time' | 'quality' | 'bottleneck';
  value: number;
  confidence: number; // 0-1
  horizon: number; // minutes
  context: JSONObject;
  timestamp: Date;
}

// =============================================================================
// SWARM PROGRESS & RESULTS
// =============================================================================

export interface SwarmProgress {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  queuedTasks: number;
  
  // Percentage metrics
  percentComplete: number; // 0-100
  percentFailed: number; // 0-100
  percentRunning: number; // 0-100
  percentQueued: number; // 0-100
  
  // Time estimates
  estimatedCompletion: Date;
  timeRemaining: number; // milliseconds
  timeElapsed: number; // milliseconds
  
  // Quality metrics
  averageQuality: number; // 0-1
  passedReviews: number;
  failedReviews: number;
  passedTests: number;
  failedTests: number;
  
  // Resource utilization
  resourceUtilization: ResourceUsage;
  costSpent: number;
  costProjected: number;
  
  // Agent status
  activeAgents: number;
  idleAgents: number;
  busyAgents: number;
  overloadedAgents: number;
  failedAgents: number;
  
  // Throughput and performance
  tasksPerHour: number;
  averageTaskDuration: number;
  bottlenecks: Bottleneck[];
  
  // Milestones
  milestonesCompleted: number;
  milestonesTotal: number;
  nextMilestone?: Milestone;
}

export interface Bottleneck {
  type: 'resource' | 'dependency' | 'agent' | 'coordination' | 'quality';
  description: string;
  impact: number; // 0-1
  affected_tasks: UUID[];
  suggested_resolution: string[];
  estimated_resolution_time: number; // milliseconds
}

export interface SwarmResults {
  // Primary outputs
  outputs: JSONObject;
  artifacts: JSONObject;
  reports: JSONObject;
  
  // Quality metrics
  overallQuality: number; // 0-1
  qualityByTask: Record<UUID, number>;
  qualityDistribution: number[];
  
  // Performance metrics
  totalExecutionTime: number; // milliseconds
  averageExecutionTime: number; // milliseconds
  resourcesUsed: ResourceUsage;
  efficiency: number; // 0-1
  throughput: number; // tasks per hour
  
  // Success metrics
  objectivesMet: ObjectiveOutcome[];
  objectivesFailed: ObjectiveOutcome[];
  partiallyMet: ObjectiveOutcome[];
  
  // Learning outcomes
  patternsDiscovered: string[];
  knowledgeGained: JSONObject[];
  improvements: Improvement[];
  bestPractices: BestPractice[];
  
  // Future planning
  nextActions: NextAction[];
  recommendations: Recommendation[];
  lessonsLearned: LessonLearned[];
}

export interface ObjectiveOutcome {
  objectiveId: string;
  description: string;
  targetValue: number;
  actualValue: number;
  variance: number;
  success: boolean;
  factors: string[];
}

export interface Improvement {
  area: string;
  description: string;
  impact: number; // 0-1
  effort: number; // 0-1
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string[];
}

export interface BestPractice {
  name: string;
  description: string;
  context: JSONObject;
  effectiveness: number; // 0-1
  applicability: string[];
  evidence: JSONObject[];
}

export interface NextAction {
  type: 'immediate' | 'short-term' | 'long-term' | 'strategic';
  action: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  estimated_effort: number; // hours
  expected_impact: number; // 0-1
}

export interface Recommendation {
  category: 'process' | 'technology' | 'organization' | 'quality' | 'performance';
  recommendation: string;
  justification: string;
  benefits: string[];
  risks: string[];
  implementation_steps: string[];
  success_metrics: string[];
}

export interface LessonLearned {
  category: 'success' | 'failure' | 'insight' | 'pattern' | 'innovation';
  description: string;
  context: JSONObject;
  applicability: string[];
  confidence: number; // 0-1
  impact: number; // 0-1
  transferability: number; // 0-1
}

// =============================================================================
// SWARM METRICS
// =============================================================================

export interface SwarmMetrics {
  // Performance metrics
  throughput: number; // tasks per hour
  latency: number; // milliseconds
  efficiency: number; // 0-1
  reliability: number; // 0-1
  availability: number; // 0-1
  
  // Quality metrics
  averageQuality: number; // 0-1
  qualityVariance: number;
  defectRate: number; // 0-1
  reworkRate: number; // 0-1
  reviewPassRate: number; // 0-1
  testPassRate: number; // 0-1
  
  // Resource metrics
  resourceUtilization: ResourceUtilization;
  costEfficiency: number; // 0-1
  energyEfficiency: number; // 0-1
  
  // Agent metrics
  agentUtilization: number; // 0-1
  agentSatisfaction: number; // 0-1
  agentTurnover: number; // 0-1
  collaborationEffectiveness: number; // 0-1
  learningVelocity: number; // 0-1
  
  // Coordination metrics
  coordinationOverhead: number; // 0-1
  decisionLatency: number; // milliseconds
  conflictRate: number; // per hour
  consensusTime: number; // milliseconds
  
  // Project metrics
  scheduleVariance: number; // percentage
  budgetVariance: number; // percentage
  scopeVariance: number; // percentage
  deadlineAdherence: number; // 0-1
  
  // Innovation metrics
  innovationIndex: number; // 0-1
  creativityScore: number; // 0-1
  experimentationRate: number; // 0-1
  knowledgeGrowth: number; // 0-1
  
  // Risk metrics
  riskScore: number; // 0-1
  vulnerabilities: string[];
  mitigationEffectiveness: number; // 0-1
  
  // Trend data
  trends: {
    throughput: TrendData;
    quality: TrendData;
    efficiency: TrendData;
    satisfaction: TrendData;
  };
}

export interface ResourceUtilization {
  memory: {
    average: number; // percentage
    peak: number; // percentage
    efficiency: number; // 0-1
  };
  cpu: {
    average: number; // percentage
    peak: number; // percentage
    efficiency: number; // 0-1
  };
  disk: {
    average: number; // percentage
    peak: number; // percentage
    efficiency: number; // 0-1
  };
  network: {
    average: number; // KB/s
    peak: number; // KB/s
    efficiency: number; // 0-1
  };
}

export interface TrendData {
  current: number;
  previous: number;
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number; // percentage
  predictions: number[];
  timestamps: Date[];
}

// =============================================================================
// SWARM EVENTS
// =============================================================================

export interface SwarmEvents {
  // Lifecycle events
  'swarm-created': (swarm: SwarmIdentity) => void;
  'swarm-started': (swarmId: UUID) => void;
  'swarm-paused': (swarmId: UUID, reason: string) => void;
  'swarm-resumed': (swarmId: UUID) => void;
  'swarm-completed': (swarmId: UUID, results: SwarmResults) => void;
  'swarm-failed': (swarmId: UUID, error: string) => void;
  'swarm-cancelled': (swarmId: UUID, reason: string) => void;
  
  // Agent events
  'agent-joined': (swarmId: UUID, agentId: UUID) => void;
  'agent-left': (swarmId: UUID, agentId: UUID, reason: string) => void;
  'agent-assigned': (swarmId: UUID, agentId: UUID, taskId: UUID) => void;
  'agent-completed': (swarmId: UUID, agentId: UUID, taskId: UUID) => void;
  'agent-failed': (swarmId: UUID, agentId: UUID, taskId: UUID, error: string) => void;
  
  // Task events
  'task-created': (swarmId: UUID, task: SwarmTask) => void;
  'task-queued': (swarmId: UUID, taskId: UUID) => void;
  'task-scheduled': (swarmId: UUID, taskId: UUID, agentId: UUID) => void;
  'task-started': (swarmId: UUID, taskId: UUID, agentId: UUID) => void;
  'task-progress': (swarmId: UUID, taskId: UUID, progress: number) => void;
  'task-completed': (swarmId: UUID, taskId: UUID, result: TaskResult) => void;
  'task-failed': (swarmId: UUID, taskId: UUID, error: string) => void;
  'task-timeout': (swarmId: UUID, taskId: UUID) => void;
  'task-cancelled': (swarmId: UUID, taskId: UUID, reason: string) => void;
  
  // Coordination events
  'coordination-started': (swarmId: UUID, coordinatorId: UUID) => void;
  'coordination-changed': (swarmId: UUID, oldCoordinator: UUID, newCoordinator: UUID) => void;
  'bottleneck-detected': (swarmId: UUID, bottleneck: Bottleneck) => void;
  'optimization-triggered': (swarmId: UUID, type: string, reason: string) => void;
  'scaling-triggered': (swarmId: UUID, direction: 'up' | 'down', reason: string) => void;
  
  // Quality events
  'quality-check': (swarmId: UUID, taskId: UUID, score: number) => void;
  'review-completed': (swarmId: UUID, taskId: UUID, approved: boolean) => void;
  'test-completed': (swarmId: UUID, taskId: UUID, passed: boolean) => void;
  
  // Performance events
  'milestone-reached': (swarmId: UUID, milestone: Milestone) => void;
  'performance-warning': (swarmId: UUID, metric: string, value: number) => void;
  'resource-exhausted': (swarmId: UUID, resource: string) => void;
  'sla-violated': (swarmId: UUID, sla: string, actual: number, expected: number) => void;
  
  // Learning events
  'pattern-discovered': (swarmId: UUID, pattern: string, confidence: number) => void;
  'knowledge-shared': (swarmId: UUID, fromAgent: UUID, toAgent: UUID, knowledge: string) => void;
  'adaptation-triggered': (swarmId: UUID, agentId: UUID, trigger: string) => void;
  'improvement-identified': (swarmId: UUID, improvement: Improvement) => void;
  [event: string]: (...args: any[]) => void;
}

// =============================================================================
// SWARM INTERFACE
// =============================================================================

export interface Swarm extends TypedEventEmitter<SwarmEvents>, Identifiable {
  // Configuration and metadata
  readonly config: SwarmConfig;
  readonly objective: SwarmObjective;
  readonly status: SwarmStatus;
  readonly progress: SwarmProgress;
  readonly metrics: SwarmMetrics;
  
  // Lifecycle management
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  cancel(reason: string): Promise<void>;
  
  // Agent management
  addAgent(agent: SwarmAgent): Promise<void>;
  removeAgent(agentId: UUID): Promise<boolean>;
  getAgent(agentId: UUID): Promise<SwarmAgent | null>;
  getAllAgents(): Promise<SwarmAgent[]>;
  getAvailableAgents(): Promise<SwarmAgent[]>;
  
  // Task management
  addTask(task: SwarmTask): Promise<UUID>;
  removeTask(taskId: UUID): Promise<boolean>;
  getTask(taskId: UUID): Promise<SwarmTask | null>;
  getAllTasks(): Promise<SwarmTask[]>;
  getPendingTasks(): Promise<SwarmTask[]>;
  
  // Execution control
  assignTask(taskId: UUID, agentId: UUID): Promise<void>;
  reassignTask(taskId: UUID, fromAgent: UUID, toAgent: UUID): Promise<void>;
  cancelTask(taskId: UUID, reason: string): Promise<void>;
  retryTask(taskId: UUID): Promise<void>;
  
  // Coordination
  setCoordinator(coordinatorId: UUID): Promise<void>;
  getCoordinator(): Promise<SwarmCoordinator | null>;
  requestCoordination(request: CoordinationRequest): Promise<CoordinationResponse>;
  resolveConflict(conflict: Conflict): Promise<Resolution>;
  
  // Monitoring and analytics
  getProgress(): Promise<SwarmProgress>;
  getMetrics(): Promise<SwarmMetrics>;
  getResults(): Promise<SwarmResults>;
  getHealthStatus(): Promise<SwarmHealthStatus>;
  
  // Optimization
  optimize(): Promise<OptimizationResult>;
  scaleUp(count: number): Promise<boolean>;
  scaleDown(count: number): Promise<boolean>;
  rebalance(): Promise<void>;
  
  // Learning and adaptation
  learnFromExecution(): Promise<LearningOutcome[]>;
  adaptConfiguration(changes: Partial<SwarmConfig>): Promise<void>;
  shareKnowledge(knowledge: JSONObject): Promise<void>;
  
  // Reporting
  generateReport(type: 'progress' | 'performance' | 'quality' | 'comprehensive'): Promise<SwarmReport>;
  exportData(format: 'json' | 'csv' | 'xml'): Promise<Buffer>;
  
  // Configuration
  updateConfig(updates: Partial<SwarmConfig>): Promise<void>;
  getConfig(): SwarmConfig;
  validateConfig(config: SwarmConfig): Promise<ValidationResult[]>;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface SwarmIdentity {
  id: UUID;
  name: string;
  type: string;
  version: string;
  createdAt: Date;
  creator: string;
}

export interface CoordinationRequest {
  type: 'task_assignment' | 'resource_allocation' | 'conflict_resolution' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: JSONObject;
  constraints: JSONObject;
  preferences: JSONObject;
}

export interface CoordinationResponse {
  success: boolean;
  action: JSONObject;
  reasoning: string;
  confidence: number; // 0-1
  alternatives: JSONObject[];
  metadata: JSONObject;
}

export interface Conflict {
  type: 'resource' | 'dependency' | 'priority' | 'constraint' | 'goal';
  description: string;
  parties: UUID[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: JSONObject;
  constraints: JSONObject;
}

export interface Resolution {
  approach: string;
  actions: JSONObject[];
  rationale: string;
  impact: JSONObject;
  satisfaction: Record<UUID, number>; // 0-1 satisfaction per party
  durability: number; // 0-1 expected persistence
}

export interface SwarmHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'failed';
  components: {
    agents: ComponentHealth;
    coordination: ComponentHealth;
    resources: ComponentHealth;
    tasks: ComponentHealth;
    communication: ComponentHealth;
  };
  issues: HealthIssue[];
  recommendations: string[];
  trends: HealthTrend[];
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  score: number; // 0-1
  metrics: JSONObject;
  lastCheck: Date;
}

export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: string;
  resolution: string[];
  estimated_resolution_time: number; // minutes
}

export interface HealthTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'degrading';
  rate: number; // percentage change
  confidence: number; // 0-1
  projection: number;
}

export interface OptimizationResult {
  improvements: Improvement[];
  changes: JSONObject;
  expected_impact: JSONObject;
  confidence: number; // 0-1
  implementation_time: number; // minutes
  reversible: boolean;
}

export interface LearningOutcome {
  type: 'pattern' | 'strategy' | 'best_practice' | 'anti_pattern' | 'optimization';
  description: string;
  evidence: JSONObject[];
  confidence: number; // 0-1
  applicability: string[];
  transferability: number; // 0-1
}

export interface SwarmReport {
  type: 'progress' | 'performance' | 'quality' | 'comprehensive';
  swarmId: UUID;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  
  summary: JSONObject;
  details: JSONObject;
  metrics: JSONObject;
  recommendations: string[];
  charts: Chart[];
  appendices: JSONObject[];
}

export interface Chart {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  data: JSONObject;
  options: JSONObject;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}