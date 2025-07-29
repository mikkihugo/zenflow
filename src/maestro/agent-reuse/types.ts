/**
 * Types and interfaces for intelligent agent reuse system
 * Following SOLID principles with clear interface segregation
 */

export interface TaskContext {
  id: string;
  type: string;
  featureName?: string;
  priority: number;
  estimatedDuration?: number;
  complexity: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface SelectionOptions {
  maxAgents?: number;
  preferReuse?: boolean;
  qualityThreshold?: number;
  performanceWeight?: number;
  workloadBalance?: boolean;
  priorityBonus?: boolean;
  taskType?: string;
  preferExperienced?: boolean;
}

export interface ExecutionOptions extends SelectionOptions {
  timeout?: number;
  retryCount?: number;
  failureStrategy?: 'abort' | 'retry' | 'fallback';
}

export interface RegisteredAgent {
  id: string;
  profile: AgentProfile;
  status: AgentStatus;
  currentWorkload: number;
  capabilities: string[];
  performanceHistory: PerformanceHistory;
  registeredAt: Date;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

export interface AvailableAgent extends RegisteredAgent {
  estimatedCapacity: number;
  availabilityScore: number;
}

export interface ScoredAgent extends AvailableAgent {
  score: AgentScore;
  scoreBreakdown: ScoreBreakdown;
}

export interface AcquiredAgent {
  id: string;
  type: string;
  capabilities: string[];
  source: 'reused' | 'spawned';
  spawnedAt?: Date;
  reusedAt?: Date;
  assignedTaskId?: string;
}

export interface AgentScore {
  total: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  capability: number;
  performance: number;
  availability: number;
  success: number;
  priority: number;
}

export interface AgentSelection {
  selectedAgents: ScoredAgent[];
  alternativeAgents: ScoredAgent[];
  selectionReason: string;
  confidence: number;
  estimatedSuccess: number;
}

export interface TaskResult {
  success: boolean;
  output?: any;
  duration: number;
  agentMetrics: AgentMetrics[];
  error?: Error;
}

export interface AgentMetrics {
  agentId: string;
  taskDuration: number;
  cpuUsage: number;
  memoryUsage: number;
  successRate: number;
  qualityScore: number;
}

export interface PerformanceHistory {
  tasksCompleted: number;
  tasksFailed: number;
  averageDuration: number;
  successRate: number;
  qualityScores: number[];
  lastUpdated: Date;
  
  addCompletion(duration: number, estimatedDuration: number): void;
  addFailure(reason: string): void;
  getRecentSuccessRate(window?: number): number;
  getAverageQuality(window?: number): number;
}

export interface WorkloadData {
  agentId: string;
  currentLoad: number;
  estimatedCapacity: number;
  activeTasks: Map<string, ActiveTask>;
  performanceHistory: PerformanceHistory;
  lastUpdated: Date;
}

export interface ActiveTask {
  taskId: string;
  startTime: Date;
  estimatedDuration: number;
  status: 'running' | 'paused' | 'completing';
}

export interface RegistryStatistics {
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  averageWorkload: number;
  capabilityCoverage: number;
  registryHealth: number;
}

export interface WorkloadStatistics {
  totalAgents: number;
  averageLoad: number;
  overloadedAgents: number;
  idleAgents: number;
  totalActiveTasks: number;
  loadDistribution: LoadDistribution;
}

export interface LoadDistribution {
  low: number;    // 0-0.3 load
  medium: number; // 0.3-0.7 load
  high: number;   // 0.7-1.0 load
  overload: number; // >1.0 load
}

export interface LoadBalancingResult {
  assignments: TaskAssignment[];
  balanceScore: number;
  estimatedCompletion: Date;
  recommendations: string[];
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  estimatedStartTime: Date;
  estimatedDuration: number;
  confidence: number;
}

export interface PoolOptimizationResult {
  initialStats: RegistryStatistics;
  recommendations: OptimizationRecommendation[];
  results: OptimizationResult[];
  optimizedAt: Date;
}

export interface OptimizationRecommendation {
  type: 'spawn' | 'cleanup' | 'rebalance' | 'upgrade';
  reason: string;
  expectedImpact: number;
  priority: 'high' | 'medium' | 'low';
  agentId?: string;
  agentType?: string;
}

export interface OptimizationResult {
  recommendation: OptimizationRecommendation;
  applied: boolean;
  actualImpact?: number;
  error?: string;
}

export type AgentStatus = 
  | 'available'    // Ready for new tasks
  | 'busy'         // Currently executing tasks
  | 'overloaded'   // Above capacity threshold
  | 'maintenance'  // Undergoing maintenance
  | 'error'        // In error state
  | 'offline';     // Not responding

export interface AgentProfile {
  id: string;
  name: string;
  type: string;
  capabilities?: string[];
  maxConcurrentTasks: number;
  priority: number;
  metadata?: Record<string, any>;
}

export interface TaskDefinition {
  id: string;
  type: string;
  description: string;
  input: any;
  priority: number;
  metadata?: Record<string, any>;
}

export interface TaskRequirements {
  capabilities: string[];
  estimatedDuration?: number;
  maxDuration?: number;
  qualityThreshold?: number;
  specialRequirements?: string[];
}

// Strategy pattern interfaces
export interface SelectionStrategy {
  selectAgents(scoredAgents: ScoredAgent[], options: SelectionOptions): AgentSelection;
}

export interface ReuseStrategy {
  findReusableAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    maxAgents: number
  ): Promise<AcquiredAgent[]>;
}

export interface ScoringStrategy {
  getWeights(taskContext: TaskContext): ScoringWeights;
}

export interface ScoringWeights {
  capability: number;
  performance: number;
  availability: number;
  success: number;
  priority: number;
}

// Configuration interfaces
export interface AgentReuseConfig {
  // Selection preferences
  reuseThreshold: number;
  maxPoolSize: number;
  cleanupThreshold: number;
  
  // Performance tuning
  selectionTimeout: number;
  monitoringInterval: number;
  optimizationFrequency: number;
  
  // Scoring weights
  scoringWeights: ScoringWeights;
  
  // Strategy selection
  selectionStrategy: 'balanced' | 'performance' | 'efficiency' | 'custom';
  reuseStrategy: 'greedy' | 'conservative' | 'adaptive';
  poolStrategy: 'static' | 'dynamic' | 'predictive';
}

export interface PoolManagerConfig {
  maxPoolSize: number;
  cleanupThreshold: number;
  maintenanceInterval: number;
  spawningStrategy: 'conservative' | 'aggressive' | 'adaptive';
  reusePreference: number; // 0-1, higher values prefer reuse more
}

export interface WorkloadMonitorConfig {
  updateInterval: number;
  overloadThreshold: number;
  idleThreshold: number;
  historyWindow: number;
}

export interface PerformanceScorerConfig {
  defaultWeights: ScoringWeights;
  performanceWindow: number;
  minimumSampleSize: number;
  confidenceThreshold: number;
}

// Subscriber interfaces for Observer pattern
export interface AgentStatusSubscriber {
  onAgentStatusChange(agentId: string, status: AgentStatus, metadata?: any): void;
}

export interface WorkloadSubscriber {
  onWorkloadChange(agentId: string, workload: WorkloadData): void;
}

// Default configurations
export const DEFAULT_AGENT_REUSE_CONFIG: AgentReuseConfig = {
  reuseThreshold: 0.7,
  maxPoolSize: 20,
  cleanupThreshold: 0.1,
  selectionTimeout: 50,
  monitoringInterval: 5000,
  optimizationFrequency: 300000,
  scoringWeights: {
    capability: 0.4,
    performance: 0.3,
    availability: 0.2,
    success: 0.08,
    priority: 0.02
  },
  selectionStrategy: 'balanced',
  reuseStrategy: 'greedy',
  poolStrategy: 'dynamic'
};

export const DEFAULT_POOL_MANAGER_CONFIG: PoolManagerConfig = {
  maxPoolSize: 20,
  cleanupThreshold: 0.1,
  maintenanceInterval: 60000,
  spawningStrategy: 'adaptive',
  reusePreference: 0.8
};

export const DEFAULT_WORKLOAD_MONITOR_CONFIG: WorkloadMonitorConfig = {
  updateInterval: 5000,
  overloadThreshold: 0.8,
  idleThreshold: 0.1,
  historyWindow: 3600000 // 1 hour
};

export const DEFAULT_PERFORMANCE_SCORER_CONFIG: PerformanceScorerConfig = {
  defaultWeights: {
    capability: 0.4,
    performance: 0.3,
    availability: 0.2,
    success: 0.08,
    priority: 0.02
  },
  performanceWindow: 1800000, // 30 minutes
  minimumSampleSize: 3,
  confidenceThreshold: 0.6
};