/**
 * Hive Mind Types;
 * Multi-Queen coordination and persistent intelligence system;
 */
import type {
  Identifiable,
JSONObject,
LifecycleManager,
ResourceUsage,
TypedEventEmitter } from './core'

import type { QueenMetrics } from './queen';

// =============================================================================
// HIVE MIND CORE TYPES
// =============================================================================

export type HiveTopology = 'mesh' | 'hierarchical' | 'ring' | 'star' | 'hybrid';
export type CoordinationStrategy = 'centralized' | 'distributed' | 'hybrid' | 'autonomous';
export type DecisionMaking = 'consensus' | 'majority' | 'weighted' | 'expert' | 'autocratic';

export interface HiveConfig {
  // Core configurationname = ============================================================================
// HIVE STATE & COORDINATION
// =============================================================================

export type HiveStatus = 'initializing' | 'active' | 'busy' | 'degraded' | 'maintenance' | 'offline' | 'error'

export interface HiveState {status = ============================================================================
// KNOWLEDGE MANAGEMENT
// =============================================================================

export interface KnowledgeNode extends Identifiable {type = ============================================================================
// DECISION MAKING
// =============================================================================

export interface Decision extends Identifiable {type = ============================================================================
// LEARNING & ADAPTATION
// =============================================================================

export interface LearningEvent extends Identifiable {type = ============================================================================
// HIVE MIND EVENTS
// =============================================================================

export interface HiveEvents {
  // Lifecycle events
  'initialized': () => void;
  'started': () => void;
  'stopped': () => void;
  'error': (error = > void;
// Queen events
('queen-joined');
: (queen = > void
('queen-left')
: (queenId = > void
('queen-failed')
: (queenId = > void
('queen-recovered')
: (queenId = > void
// Task events
('task-submitted')
: (task = > void
('task-assigned')
: (taskId = > void
('task-completed')
: (taskId = > void
('task-failed')
: (taskId = > void
('consensus-reached')
: (consensus = > void
// Coordination events
('coordination-started')
: (context = > void
('coordination-completed')
: (context = > void
('decision-made')
: (decision = > void
// Learning events
('knowledge-updated')
: (nodeId = > void
('pattern-discovered')
: (pattern = > void
('adaptation-triggered')
: (strategy = > void
('improvement-detected')
: (metric = > void
// System events
('health-changed')
: (oldHealth = > void
('performance-alert')
: (metric = > void
('resource-warning')
: (resource = > void
('optimization-completed')
: (improvements = > void
}
// =============================================================================
// HIVE MIND INTERFACE
// =============================================================================

export interface HiveMind extends TypedEventEmitter<HiveEvents>, LifecycleManager, Identifiable {
  // Configuration
  readonlyconfig = ============================================================================
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
