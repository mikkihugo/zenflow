/**
 * Hive Mind Types
 * Multi-Queen coordination and persistent intelligence system
 */

import { Identifiable, JSONObject, TypedEventEmitter, LifecycleManager, ResourceUsage } from './core';
import { Queen, Task, TaskResult, Consensus, QueenMetrics } from './queen';
import { SwarmConfig, SwarmObjective } from './swarm';

// =============================================================================
// HIVE MIND CORE TYPES
// =============================================================================

export type HiveTopology = 'mesh' | 'hierarchical' | 'ring' | 'star' | 'hybrid';
export type CoordinationStrategy = 'centralized' | 'distributed' | 'hybrid' | 'autonomous';
export type DecisionMaking = 'consensus' | 'majority' | 'weighted' | 'expert' | 'autocratic';

export interface HiveConfig {
  // Core configuration
  name: string;
  description: string;
  version: string;
  instanceId: string;
  
  // Topology and coordination
  topology: HiveTopology;
  coordinationStrategy: CoordinationStrategy;
  decisionMaking: DecisionMaking;
  maxQueens: number;
  maxSwarms: number;
  
  // Performance settings
  taskTimeout: number;
  consensusTimeout: number;
  healthCheckInterval: number;
  optimizationInterval: number;
  
  // Memory and persistence
  persistentMemory: boolean;
  memoryNamespace: string;
  memoryRetention: number; // days
  knowledgeSharing: boolean;
  crossSessionLearning: boolean;
  
  // Security and isolation
  queenIsolation: boolean;
  resourceIsolation: boolean;
  sandboxMode: boolean;
  trustedQueens: string[];
  
  // Monitoring and observability
  detailedLogging: boolean;
  performanceTracking: boolean;
  behaviorAnalysis: boolean;
  predictiveAnalytics: boolean;
  
  // Features
  features: {
    neuralProcessing: boolean;
    vectorSearch: boolean;
    graphAnalysis: boolean;
    realTimeCoordination: boolean;
    adaptiveLearning: boolean;
    selfHealing: boolean;
    loadBalancing: boolean;
    autoScaling: boolean;
  };
}

// =============================================================================
// HIVE STATE & COORDINATION
// =============================================================================

export type HiveStatus = 'initializing' | 'active' | 'busy' | 'degraded' | 'maintenance' | 'offline' | 'error';

export interface HiveState {
  status: HiveStatus;
  health: number; // 0-1
  efficiency: number; // 0-1
  load: number; // 0-1
  
  // Queen management
  activeQueens: number;
  totalQueens: number;
  queenDistribution: Record<string, number>;
  queenHealth: Record<string, number>;
  
  // Task management
  pendingTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  taskBacklog: number;
  
  // Performance metrics
  averageResponseTime: number;
  throughput: number;
  successRate: number;
  resourceUtilization: ResourceUsage;
  
  // Learning and adaptation
  knowledgeSize: number;
  learningRate: number;
  adaptationScore: number;
  memoryUsage: number;
  
  // Timestamps
  lastActivity: Date;
  lastOptimization: Date;
  lastHealthCheck: Date;
  uptime: number;
}

export interface CoordinationContext {
  sessionId: string;
  initiator: string;
  participants: string[];
  objective: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  
  // Context data
  sharedMemory: JSONObject;
  constraints: string[];
  resources: string[];
  dependencies: string[];
  
  // Coordination metadata
  strategy: CoordinationStrategy;
  consensusRequired: boolean;
  minimumParticipants: number;
  maximumDuration: number;
  
  // Progress tracking
  startTime: Date;
  lastUpdate: Date;
  milestones: {
    id: string;
    description: string;
    completed: boolean;
    timestamp?: Date;
  }[];
}

// =============================================================================
// KNOWLEDGE MANAGEMENT
// =============================================================================

export interface KnowledgeNode extends Identifiable {
  type: 'pattern' | 'solution' | 'experience' | 'rule' | 'heuristic' | 'case-study';
  title: string;
  description: string;
  content: JSONObject;
  
  // Relationships
  tags: string[];
  categories: string[];
  relatedNodes: UUID[];
  dependencies: UUID[];
  
  // Quality and usage
  confidence: number;
  usefulness: number;
  usageCount: number;
  successRate: number;
  lastUsed: Date;
  
  // Provenance
  source: string;
  contributor: string;
  validation: {
    validated: boolean;
    validatedBy: string[];
    validationDate?: Date;
    validationScore?: number;
  };
  
  // Evolution
  version: number;
  previousVersions: UUID[];
  parentNode?: UUID;
  childNodes: UUID[];
  
  // Context
  applicableContexts: string[];
  requiredCapabilities: string[];
  domainSpecific: boolean;
  complexity: 'low' | 'medium' | 'high' | 'expert';
}

export interface KnowledgeGraph {
  nodes: Map<UUID, KnowledgeNode>;
  edges: Map<UUID, KnowledgeEdge>;
  indexes: {
    byType: Map<string, Set<UUID>>;
    byTag: Map<string, Set<UUID>>;
    byCategory: Map<string, Set<UUID>>;
    bySource: Map<string, Set<UUID>>;
    byUsage: UUID[]; // sorted by usage frequency
    byQuality: UUID[]; // sorted by quality score
  };
  
  // Graph statistics
  stats: {
    totalNodes: number;
    totalEdges: number;
    averageConnectivity: number;
    clustersDetected: number;
    centralNodes: UUID[];
    isolatedNodes: UUID[];
  };
}

export interface KnowledgeEdge extends Identifiable {
  sourceId: UUID;
  targetId: UUID;
  type: 'depends-on' | 'related-to' | 'similar-to' | 'contradicts' | 'extends' | 'implements';
  weight: number; // 0-1
  confidence: number; // 0-1
  bidirectional: boolean;
  
  // Context
  description?: string;
  conditions?: string[];
  metadata: JSONObject;
  
  // Quality
  strength: number; // 0-1
  reliability: number; // 0-1
  lastValidated: Date;
  validationCount: number;
}

// =============================================================================
// DECISION MAKING
// =============================================================================

export interface Decision extends Identifiable {
  type: 'strategic' | 'tactical' | 'operational' | 'emergency';
  title: string;
  description: string;
  context: string;
  
  // Decision process
  options: DecisionOption[];
  criteria: DecisionCriteria[];
  method: DecisionMaking;
  participants: string[];
  facilitator?: string;
  
  // Outcome
  selectedOption?: UUID;
  rationale: string;
  confidence: number;
  consensus: boolean;
  dissent?: string[];
  
  // Implementation
  implementation: {
    steps: string[];
    timeline: Date[];
    responsibilities: Record<string, string>;
    dependencies: string[];
    risks: string[];
    mitigations: string[];
  };
  
  // Tracking
  status: 'pending' | 'decided' | 'implemented' | 'evaluated' | 'revised';
  outcome?: {
    successful: boolean;
    actualResults: string;
    lessons: string[];
    improvements: string[];
  };
  
  // Metadata
  priority: 'low' | 'medium' | 'high' | 'critical';
  reversible: boolean;
  impact: 'local' | 'regional' | 'global' | 'system-wide';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface DecisionOption extends Identifiable {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  risks: string[];
  costs: number;
  timeline: number; // days
  confidence: number;
  feasibility: number;
  impact: number;
  supporters: string[];
  critics: string[];
  evidence: JSONObject[];
}

export interface DecisionCriteria extends Identifiable {
  name: string;
  description: string;
  weight: number; // 0-1
  type: 'quantitative' | 'qualitative' | 'boolean';
  measurable: boolean;
  threshold?: number;
  scale?: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
}

// =============================================================================
// LEARNING & ADAPTATION
// =============================================================================

export interface LearningEvent extends Identifiable {
  type: 'success' | 'failure' | 'observation' | 'feedback' | 'insight' | 'discovery';
  source: string; // Queen ID or external source
  context: string;
  description: string;
  
  // Data
  inputs: JSONObject;
  outputs: JSONObject;
  expectedOutputs?: JSONObject;
  actualResults: JSONObject;
  
  // Analysis
  significance: number; // 0-1
  confidence: number; // 0-1
  novelty: number; // 0-1
  generalizability: number; // 0-1
  
  // Classification
  categories: string[];
  patterns: string[];
  principles: string[];
  
  // Impact
  affectedComponents: string[];
  behaviorChanges: string[];
  performanceImpact: number;
  
  // Learning outcomes
  knowledgeGained: string[];
  rulesLearned: string[];
  strategiesDiscovered: string[];
  improvementsIdentified: string[];
}

export interface AdaptationStrategy {
  name: string;
  description: string;
  triggers: string[];
  conditions: string[];
  actions: AdaptationAction[];
  
  // Effectiveness
  successRate: number;
  averageImprovement: number;
  sideEffects: string[];
  contraindications: string[];
  
  // Usage
  usageCount: number;
  lastUsed: Date;
  contexts: string[];
  
  // Evolution
  version: number;
  improvements: string[];
  deprecated: boolean;
  replacement?: string;
}

export interface AdaptationAction {
  type: 'parameter-adjustment' | 'strategy-change' | 'resource-reallocation' | 'topology-modification' | 'queen-specialization';
  target: string;
  change: JSONObject;
  rationale: string;
  expectedImpact: string;
  reversible: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

// =============================================================================
// HIVE MIND EVENTS
// =============================================================================

export interface HiveEvents {
  // Lifecycle events
  'initialized': () => void;
  'started': () => void;
  'stopped': () => void;
  'error': (error: Error) => void;
  
  // Queen events
  'queen-joined': (queen: Queen) => void;
  'queen-left': (queenId: UUID) => void;
  'queen-failed': (queenId: UUID, error: Error) => void;
  'queen-recovered': (queenId: UUID) => void;
  
  // Task events
  'task-submitted': (task: Task) => void;
  'task-assigned': (taskId: UUID, queenIds: UUID[]) => void;
  'task-completed': (taskId: UUID, result: TaskResult) => void;
  'task-failed': (taskId: UUID, error: Error) => void;
  'consensus-reached': (consensus: Consensus) => void;
  
  // Coordination events
  'coordination-started': (context: CoordinationContext) => void;
  'coordination-completed': (context: CoordinationContext) => void;
  'decision-made': (decision: Decision) => void;
  
  // Learning events
  'knowledge-updated': (nodeId: UUID, type: string) => void;
  'pattern-discovered': (pattern: string, confidence: number) => void;
  'adaptation-triggered': (strategy: string, reason: string) => void;
  'improvement-detected': (metric: string, improvement: number) => void;
  
  // System events
  'health-changed': (oldHealth: number, newHealth: number) => void;
  'performance-alert': (metric: string, value: number, threshold: number) => void;
  'resource-warning': (resource: string, usage: number) => void;
  'optimization-completed': (improvements: string[]) => void;
}

// =============================================================================
// HIVE MIND INTERFACE
// =============================================================================

export interface HiveMind extends TypedEventEmitter<HiveEvents>, LifecycleManager, Identifiable {
  // Configuration
  readonly config: HiveConfig;
  readonly state: HiveState;
  
  // Queen management
  registerQueen(queen: Queen): Promise<void>;
  unregisterQueen(queenId: UUID): Promise<boolean>;
  getQueen(queenId: UUID): Promise<Queen | null>;
  getAllQueens(): Promise<Queen[]>;
  findSuitableQueens(task: Task): Promise<Queen[]>;
  
  // Task coordination
  submitTask(task: Task): Promise<UUID>;
  assignTask(taskId: UUID, queenIds: UUID[]): Promise<void>;
  coordinateTask(task: Task, queens: Queen[]): Promise<Consensus>;
  cancelTask(taskId: UUID): Promise<boolean>;
  getTaskStatus(taskId: UUID): Promise<Task | null>;
  
  // Decision making
  makeDecision(decision: Decision): Promise<DecisionOption>;
  evaluateOptions(decision: Decision): Promise<DecisionOption[]>;
  reachConsensus(decision: Decision): Promise<Consensus>;
  implementDecision(decisionId: UUID): Promise<void>;
  
  // Knowledge management
  addKnowledge(node: KnowledgeNode): Promise<UUID>;
  queryKnowledge(query: string, filters?: JSONObject): Promise<KnowledgeNode[]>;
  updateKnowledge(nodeId: UUID, updates: Partial<KnowledgeNode>): Promise<void>;
  validateKnowledge(nodeId: UUID, validator: string): Promise<void>;
  getKnowledgeGraph(): Promise<KnowledgeGraph>;
  
  // Learning and adaptation
  recordLearningEvent(event: LearningEvent): Promise<void>;
  identifyPatterns(): Promise<string[]>;
  applyAdaptation(strategy: AdaptationStrategy): Promise<void>;
  optimizePerformance(): Promise<string[]>;
  
  // Monitoring and analytics
  getMetrics(): Promise<HiveMetrics>;
  getHealthReport(): Promise<HiveHealthReport>;
  getPerformanceAnalysis(): Promise<PerformanceAnalysis>;
  getPredictiveInsights(): Promise<PredictiveInsights>;
  
  // Configuration and control
  updateConfig(updates: Partial<HiveConfig>): Promise<void>;
  restartHive(): Promise<void>;
  emergencyShutdown(): Promise<void>;
}

// =============================================================================
// ANALYTICS AND REPORTING
// =============================================================================

export interface HiveMetrics {
  // Overall performance
  throughput: number; // tasks per hour
  successRate: number; // 0-1
  averageResponseTime: number; // milliseconds
  efficiency: number; // 0-1
  
  // Queen performance
  queenMetrics: Record<UUID, QueenMetrics>;
  queenCollaboration: Record<string, number>;
  queenSpecialization: Record<string, number>;
  
  // Task metrics
  taskDistribution: Record<string, number>;
  taskComplexity: Record<string, number>;
  taskSuccess: Record<string, number>;
  
  // Resource utilization
  resourceUsage: ResourceUsage;
  resourceEfficiency: number;
  resourceBottlenecks: string[];
  
  // Learning metrics
  knowledgeGrowth: number;
  learningVelocity: number;
  adaptationFrequency: number;
  improvementRate: number;
  
  // System health
  healthScore: number;
  availabilityRate: number;
  errorRate: number;
  recoveryTime: number;
  
  // Coordination metrics
  consensusRate: number;
  decisionQuality: number;
  collaborationEffectiveness: number;
  coordinationOverhead: number;
}

export interface HiveHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    queens: ComponentHealth;
    coordination: ComponentHealth;
    memory: ComponentHealth;
    knowledge: ComponentHealth;
    performance: ComponentHealth;
  };
  issues: HealthIssue[];
  recommendations: string[];
  trends: HealthTrends;
  predictions: HealthPredictions;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-1
  metrics: JSONObject;
  issues: string[];
  lastCheck: Date;
}

export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: string;
  solution: string;
  autoFixable: boolean;
  estimatedFixTime: number;
}

export interface HealthTrends {
  performance: number[]; // time series
  reliability: number[]; // time series
  efficiency: number[]; // time series
  resourceUsage: number[]; // time series
  timestamps: Date[];
}

export interface HealthPredictions {
  nextIssues: {
    issue: string;
    probability: number;
    timeframe: string;
    prevention: string[];
  }[];
  capacityProjections: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    timeframe: string;
    confidence: number;
  }[];
  maintenanceRecommendations: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    benefit: string;
    effort: string;
  }[];
}

export interface PerformanceAnalysis {
  bottlenecks: {
    component: string;
    severity: number;
    impact: string;
    solutions: string[];
  }[];
  optimizations: {
    opportunity: string;
    potential: number;
    difficulty: string;
    implementation: string[];
  }[];
  benchmarks: {
    metric: string;
    current: number;
    target: number;
    industry: number;
    percentile: number;
  }[];
  trends: {
    metric: string;
    direction: 'improving' | 'stable' | 'degrading';
    rate: number;
    projection: number;
  }[];
}

export interface PredictiveInsights {
  workloadForecasts: {
    timeframe: string;
    expectedLoad: number;
    confidence: number;
    factors: string[];
  }[];
  resourceNeeds: {
    resource: string;
    currentUsage: number;
    projectedUsage: number;
    recommendation: string;
  }[];
  riskAssessments: {
    risk: string;
    probability: number;
    impact: string;
    mitigation: string[];
  }[];
  opportunities: {
    opportunity: string;
    potential: number;
    requirements: string[];
    timeline: string;
  }[];
}