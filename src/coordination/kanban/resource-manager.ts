/**
 * Dynamic Resource Manager for Adaptive Resource Management
 *
 * Provides intelligent agent assignment, dynamic swarm scaling, and resource optimization
 * for multi-level workflow orchestration with cross-level resource sharing.
 */

import { EventEmitter } from 'events';
import type {
  PerformanceMetrics,
  QueueConfig,
  WorkflowState,
  WorkflowStep,
} from '../types.ts';

// Resource management interfaces
export interface ResourceCapability {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  domains: string[];
  efficiency: number; // 0-1
  availability: number; // 0-1
  cost: number;
  lastUsed?: Date;
  successRate?: number;
}

export interface AgentResource {
  id: string;
  type:
    | 'researcher'
    | 'coder'
    | 'analyst'
    | 'optimizer'
    | 'coordinator'
    | 'tester';
  capabilities: ResourceCapability[];
  currentLoad: number; // 0-1
  maxConcurrency: number;
  performanceHistory: AgentPerformance[];
  preferences: AgentPreferences;
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  allocation?: ResourceAllocation;
  swarmId?: string;
  costPerHour?: number;
  utilization?: ResourceUtilization;
}

export interface AgentPerformance {
  taskId: string;
  taskType: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  quality: number; // 0-1
  efficiency: number; // 0-1
  successRate: number; // 0-1
  feedback?: string;
  metrics?: unknown;
}

export interface AgentPreferences {
  preferredTaskTypes: string[];
  preferredTimeSlots: TimeSlot[];
  skillGrowthInterests: string[];
  collaborationPreferences: CollaborationStyle[];
  workloadPreferences: WorkloadStyle;
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  timezone: string;
  days: string[]; // ['monday', 'tuesday', ...]
}

export interface CollaborationStyle {
  style: 'independent' | 'paired' | 'team' | 'mentoring';
  preference: number; // 0-1
}

export interface WorkloadStyle {
  type: 'burst' | 'steady' | 'mixed';
  preferredConcurrency: number;
  maxConcurrency: number;
  restPeriods: boolean;
}

export interface ResourceAllocation {
  taskId: string;
  workflowId: string;
  level: 'portfolio' | 'program' | 'swarm';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number;
  allocatedTime: Date;
  expectedCompletion: Date;
  actualCompletion?: Date;
  constraints?: AllocationConstraint[];
}

export interface AllocationConstraint {
  type: 'deadline' | 'dependency' | 'resource' | 'quality' | 'budget';
  value: unknown;
  importance: 'required' | 'preferred' | 'nice-to-have';
  impact: string;
}

export interface ResourceUtilization {
  current: number; // 0-1
  average: number; // 0-1
  peak: number; // 0-1
  idle: number; // 0-1
  efficiency: number; // 0-1
  burnoutRisk: number; // 0-1
  overallHealth: number; // 0-1
}

export interface SwarmConfiguration {
  id: string;
  name: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  minAgents: number;
  maxAgents: number;
  currentAgents: number;
  optimalAgents: number;
  scalingRules: ScalingRule[];
  performanceTargets: PerformanceTarget[];
  constraints: SwarmConstraint[];
}

export interface ScalingRule {
  trigger: ScalingTrigger;
  action: ScalingAction;
  cooldown: number; // minutes
  conditions: ScalingCondition[];
}

export interface ScalingTrigger {
  type: 'load' | 'queue' | 'latency' | 'quality' | 'cost' | 'schedule';
  threshold: number;
  duration: number; // minutes
  direction: 'up' | 'down';
}

export interface ScalingAction {
  type: 'add_agent' | 'remove_agent' | 'reallocate' | 'restructure';
  magnitude: number;
  targetCapability?: string;
  priority: number;
}

export interface ScalingCondition {
  type: 'time' | 'budget' | 'availability' | 'quality' | 'dependency';
  condition: string;
  value: unknown;
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  tolerance: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface SwarmConstraint {
  type: 'budget' | 'time' | 'quality' | 'resource' | 'regulatory';
  limit: unknown;
  enforcement: 'hard' | 'soft';
}

export interface ResourceDemand {
  workflowId: string;
  level: 'portfolio' | 'program' | 'swarm';
  taskType: string;
  requiredCapabilities: ResourceCapability[];
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  duration: number;
  deadline?: Date;
  budget?: number;
  qualityRequirements?: QualityRequirement[];
}

export interface QualityRequirement {
  aspect: string;
  minimum: number; // 0-1
  target: number; // 0-1
  weight: number; // 0-1
}

export interface ResourceMatch {
  agent: AgentResource;
  score: number; // 0-1
  reasons: MatchReason[];
  conflicts: MatchConflict[];
  recommendations: MatchRecommendation[];
}

export interface MatchReason {
  type: 'capability' | 'experience' | 'availability' | 'cost' | 'preference';
  factor: string;
  score: number;
  weight: number;
}

export interface MatchConflict {
  type: 'scheduling' | 'capacity' | 'skill' | 'preference' | 'cost';
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  resolution?: string;
}

export interface MatchRecommendation {
  type:
    | 'skill_development'
    | 'scheduling'
    | 'pairing'
    | 'training'
    | 'tool_support';
  action: string;
  benefit: string;
  effort: number; // 0-1
}

export interface ResourceOptimization {
  type: 'allocation' | 'scheduling' | 'capacity' | 'cost' | 'quality';
  currentState: ResourceState;
  targetState: ResourceState;
  optimizationActions: OptimizationAction[];
  expectedBenefits: OptimizationBenefit[];
  risks: OptimizationRisk[];
  timeline: OptimizationTimeline[];
}

export interface ResourceState {
  utilization: number; // 0-1
  efficiency: number; // 0-1
  cost: number;
  quality: number; // 0-1
  satisfaction: number; // 0-1
  capacity: number;
  bottlenecks: string[];
}

export interface OptimizationAction {
  id: string;
  type: 'reallocate' | 'scale' | 'retrain' | 'restructure' | 'automate';
  description: string;
  impact: OptimizationImpact;
  effort: number; // 0-1
  priority: number; // 0-1
  dependencies: string[];
}

export interface OptimizationImpact {
  utilization: number;
  efficiency: number;
  cost: number;
  quality: number;
  timeline: number;
  risk: number;
}

export interface OptimizationBenefit {
  type:
    | 'cost_savings'
    | 'time_savings'
    | 'quality_improvement'
    | 'capacity_increase';
  value: number;
  confidence: number; // 0-1
  timeframe: string;
}

export interface OptimizationRisk {
  type: 'disruption' | 'quality' | 'schedule' | 'cost' | 'morale';
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation: string;
}

export interface OptimizationTimeline {
  phase: string;
  duration: number; // days
  actions: string[];
  milestones: string[];
}

export interface CapacityPrediction {
  timeframe: string;
  demandForecast: DemandForecast[];
  capacityForecast: CapacityForecast[];
  gaps: CapacityGap[];
  recommendations: CapacityRecommendation[];
}

export interface DemandForecast {
  period: string;
  taskType: string;
  volume: number;
  complexity: number; // 0-1
  urgency: number; // 0-1
  confidence: number; // 0-1
}

export interface CapacityForecast {
  period: string;
  agentType: string;
  availableCapacity: number;
  utilization: number; // 0-1
  efficiency: number; // 0-1
  constraints: string[];
}

export interface CapacityGap {
  period: string;
  gapType: 'shortage' | 'surplus' | 'mismatch';
  magnitude: number;
  capability: string;
  impact: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface CapacityRecommendation {
  type: 'hiring' | 'training' | 'reallocation' | 'automation' | 'outsourcing';
  action: string;
  timeline: string;
  cost: number;
  benefit: number;
  priority: number; // 0-1
}

export interface ResourceConflict {
  id: string;
  type:
    | 'double_booking'
    | 'skill_mismatch'
    | 'capacity_exceeded'
    | 'priority_conflict';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedResources: string[];
  affectedTasks: string[];
  impact: string;
  resolutionOptions: ConflictResolution[];
}

export interface ConflictResolution {
  id: string;
  type:
    | 'reschedule'
    | 'reallocate'
    | 'prioritize'
    | 'split_task'
    | 'add_resource';
  description: string;
  effort: number; // 0-1
  impact: ConflictImpact;
  tradeoffs: string[];
}

export interface ConflictImpact {
  schedule: number;
  cost: number;
  quality: number;
  morale: number;
  risk: number;
}

// Cross-level resource sharing interfaces
export interface CrossLevelResourcePool {
  portfolioLevel: ResourceLevel;
  programLevel: ResourceLevel;
  swarmLevel: ResourceLevel;
  sharedPool: ResourceLevel;
}

export interface ResourceLevel {
  id: string;
  name: string;
  priority: number;
  agents: Map<string, AgentResource>;
  reservedCapacity: number; // 0-1
  availableCapacity: number; // 0-1
  borrowingRules: BorrowingRule[];
  lendingRules: LendingRule[];
  performanceMetrics: LevelPerformanceMetrics;
}

export interface BorrowingRule {
  fromLevel: string;
  maxBorrowPercent: number; // 0-1
  urgencyThreshold: 'critical' | 'high' | 'medium' | 'low';
  durationLimit: number; // hours
  returnPriority: number; // 1-10
  cost?: number;
}

export interface LendingRule {
  toLevel: string;
  maxLendPercent: number; // 0-1
  retainMinimum: number; // 0-1
  priorityRequirement: 'critical' | 'high' | 'medium' | 'low';
  compensationRequired: boolean;
}

export interface LevelPerformanceMetrics {
  utilization: number;
  efficiency: number;
  quality: number;
  throughput: number;
  costEfficiency: number;
  agentSatisfaction: number;
}

export interface ResourceTransfer {
  id: string;
  agentId: string;
  fromLevel: string;
  toLevel: string;
  reason: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  duration: number; // hours
  startTime: Date;
  expectedReturnTime: Date;
  actualReturnTime?: Date;
  transferCost?: number;
  performanceImpact: TransferImpact;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface TransferImpact {
  onSourceLevel: LevelImpact;
  onTargetLevel: LevelImpact;
  onAgent: AgentImpact;
}

export interface LevelImpact {
  capacityChange: number; // -1 to 1
  efficiencyChange: number; // -1 to 1
  qualityChange: number; // -1 to 1
  costChange: number;
  riskChange: number; // -1 to 1
}

export interface AgentImpact {
  skillUtilization: number; // 0-1
  learningOpportunity: number; // 0-1
  stressLevel: number; // 0-1
  satisfactionChange: number; // -1 to 1
  careerDevelopment: number; // 0-1
}

export interface SkillBasedAllocation {
  requiredSkills: SkillRequirement[];
  optionalSkills: SkillRequirement[];
  learningOpportunities: SkillDevelopment[];
  skillGapAnalysis: SkillGap[];
  allocationScore: number; // 0-1
}

export interface SkillRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 'required' | 'preferred' | 'nice-to-have';
  weight: number; // 0-1
}

export interface SkillDevelopment {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  effort: number; // hours
  benefit: number; // 0-1
  timeline: string;
}

export interface SkillGap {
  skill: string;
  requiredLevel: string;
  availableLevel: string;
  gap: number; // 0-1
  impact: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface ResourceConflictResolution {
  conflictId: string;
  resolutionStrategy: 'negotiate' | 'escalate' | 'compromise' | 'defer';
  involvedLevels: string[];
  mediator?: string;
  outcome: ResolutionOutcome;
  learnings: string[];
}

export interface ResolutionOutcome {
  resolution: string;
  satisfaction: Record<string, number>; // level -> satisfaction score
  impact: Record<string, LevelImpact>; // level -> impact
  followUpActions: string[];
}

export interface ResourcePerformanceTracking {
  crossLevelEfficiency: number; // 0-1
  transferSuccessRate: number; // 0-1
  conflictResolutionTime: number; // hours
  costOptimization: number; // 0-1
  skillDevelopmentRate: number; // 0-1
  overallSystemHealth: number; // 0-1
}

// Automated capacity management interfaces
export interface CapacityScalingAction {
  id: string;
  type: 'add_agents' | 'remove_agents' | 'optimize_existing' | 'reallocate';
  level: string;
  magnitude: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  estimatedCost: number;
  expectedBenefit: number;
  timeline: string;
  approvalRequired: boolean;
  constraints: string[];
  status:
    | 'pending'
    | 'pending_approval'
    | 'approved'
    | 'in_progress'
    | 'completed'
    | 'failed';
}

export interface CapacityBuffer {
  levelId: string;
  levelName: string;
  totalCapacity: number;
  usedCapacity: number;
  bufferCapacity: number;
  optimalBuffer: number;
  bufferUtilization: number;
  status: 'critical' | 'low' | 'adequate' | 'high';
  risk: number;
}

export interface BufferAdjustment {
  levelId: string;
  type: 'increase' | 'decrease';
  magnitude: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  timeline: string;
}

export interface DemandPrediction {
  period: string;
  taskType: string;
  predictedVolume: number;
  complexity: number;
  urgency: number;
  confidence: number;
  resourceHours: number;
}

export interface HistoricalDemandData {
  totalTasks: number;
  tasksByType: Record<string, number>;
  seasonalPatterns: {
    highDemandPeriods: string[];
    lowDemandPeriods: string[];
    peakUtilization: number;
    lowUtilization: number;
  };
  trendAnalysis: {
    growthRate: number;
    volatility: number;
    cyclicality: number;
  };
}

export interface ResourceEvents {
  'resource-allocated': {
    agentId: string;
    taskId: string;
    allocation: ResourceAllocation;
  };
  'resource-deallocated': { agentId: string; taskId: string };
  'resource-transferred': { transfer: ResourceTransfer };
  'resource-returned': { transferId: string; actualImpact: TransferImpact };
  'swarm-scaled': {
    swarmId: string;
    oldSize: number;
    newSize: number;
    reason: string;
  };
  'conflict-detected': { conflict: ResourceConflict };
  'conflict-resolved': { conflictId: string; resolution: ConflictResolution };
  'optimization-applied': { optimization: ResourceOptimization };
  'capacity-warning': { gap: CapacityGap };
  'performance-alert': { agentId: string; metric: string; value: number };
  'cross-level-request': {
    fromLevel: string;
    toLevel: string;
    request: ResourceDemand;
  };
  'skill-gap-identified': { gap: SkillGap; level: string };
  'capacity-scaled': { action: CapacityScalingAction };
  'buffer-adjusted': { adjustment: BufferAdjustment };
  'demand-predicted': { forecast: DemandPrediction[]; confidence: number };
}

/**
 * Dynamic Resource Manager
 *
 * Intelligent resource allocation and management system for multi-level workflows
 */
export class DynamicResourceManager extends EventEmitter {
  private agents: Map<string, AgentResource> = new Map();
  private swarms: Map<string, SwarmConfiguration> = new Map();
  private allocations: Map<string, ResourceAllocation[]> = new Map();
  private conflicts: Map<string, ResourceConflict> = new Map();
  private optimizationHistory: ResourceOptimization[] = [];
  private capacityPredictions: CapacityPrediction[] = [];

  // Cross-level resource management
  private resourcePool: CrossLevelResourcePool;
  private activeTransfers: Map<string, ResourceTransfer> = new Map();
  private performanceTracking: ResourcePerformanceTracking;
  private skillDatabase: Map<string, SkillBasedAllocation> = new Map();

  constructor() {
    super();
    this.initializeResourcePool();
    this.initializeDefaultAgents();
    this.initializePerformanceTracking();
    this.setupPeriodicOptimization();
  }

  /**
   * Initialize resource pool with cross-level structure
   */
  private initializeResourcePool(): void {
    this.resourcePool = {
      portfolioLevel: {
        id: 'portfolio',
        name: 'Portfolio Level',
        priority: 1,
        agents: new Map(),
        reservedCapacity: 0.8,
        availableCapacity: 0.2,
        borrowingRules: [
          {
            fromLevel: 'shared',
            maxBorrowPercent: 0.3,
            urgencyThreshold: 'high',
            durationLimit: 48,
            returnPriority: 9,
          },
        ],
        lendingRules: [
          {
            toLevel: 'program',
            maxLendPercent: 0.2,
            retainMinimum: 0.6,
            priorityRequirement: 'critical',
            compensationRequired: false,
          },
        ],
        performanceMetrics: {
          utilization: 0.7,
          efficiency: 0.85,
          quality: 0.9,
          throughput: 5,
          costEfficiency: 0.8,
          agentSatisfaction: 0.85,
        },
      },
      programLevel: {
        id: 'program',
        name: 'Program Level',
        priority: 2,
        agents: new Map(),
        reservedCapacity: 0.6,
        availableCapacity: 0.4,
        borrowingRules: [
          {
            fromLevel: 'shared',
            maxBorrowPercent: 0.4,
            urgencyThreshold: 'medium',
            durationLimit: 24,
            returnPriority: 7,
          },
          {
            fromLevel: 'portfolio',
            maxBorrowPercent: 0.1,
            urgencyThreshold: 'critical',
            durationLimit: 12,
            returnPriority: 10,
          },
        ],
        lendingRules: [
          {
            toLevel: 'swarm',
            maxLendPercent: 0.3,
            retainMinimum: 0.4,
            priorityRequirement: 'high',
            compensationRequired: true,
          },
        ],
        performanceMetrics: {
          utilization: 0.75,
          efficiency: 0.88,
          quality: 0.85,
          throughput: 15,
          costEfficiency: 0.82,
          agentSatisfaction: 0.8,
        },
      },
      swarmLevel: {
        id: 'swarm',
        name: 'Swarm Level',
        priority: 3,
        agents: new Map(),
        reservedCapacity: 0.5,
        availableCapacity: 0.5,
        borrowingRules: [
          {
            fromLevel: 'shared',
            maxBorrowPercent: 0.6,
            urgencyThreshold: 'low',
            durationLimit: 8,
            returnPriority: 5,
          },
          {
            fromLevel: 'program',
            maxBorrowPercent: 0.2,
            urgencyThreshold: 'high',
            durationLimit: 4,
            returnPriority: 8,
          },
        ],
        lendingRules: [
          {
            toLevel: 'shared',
            maxLendPercent: 0.4,
            retainMinimum: 0.3,
            priorityRequirement: 'low',
            compensationRequired: false,
          },
        ],
        performanceMetrics: {
          utilization: 0.8,
          efficiency: 0.9,
          quality: 0.8,
          throughput: 50,
          costEfficiency: 0.85,
          agentSatisfaction: 0.75,
        },
      },
      sharedPool: {
        id: 'shared',
        name: 'Shared Resource Pool',
        priority: 0,
        agents: new Map(),
        reservedCapacity: 0.2,
        availableCapacity: 0.8,
        borrowingRules: [],
        lendingRules: [
          {
            toLevel: 'portfolio',
            maxLendPercent: 0.3,
            retainMinimum: 0.1,
            priorityRequirement: 'medium',
            compensationRequired: false,
          },
          {
            toLevel: 'program',
            maxLendPercent: 0.4,
            retainMinimum: 0.1,
            priorityRequirement: 'medium',
            compensationRequired: false,
          },
          {
            toLevel: 'swarm',
            maxLendPercent: 0.6,
            retainMinimum: 0.1,
            priorityRequirement: 'low',
            compensationRequired: false,
          },
        ],
        performanceMetrics: {
          utilization: 0.6,
          efficiency: 0.85,
          quality: 0.8,
          throughput: 25,
          costEfficiency: 0.9,
          agentSatisfaction: 0.8,
        },
      },
    };
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    this.performanceTracking = {
      crossLevelEfficiency: 0.85,
      transferSuccessRate: 0.9,
      conflictResolutionTime: 2.5,
      costOptimization: 0.8,
      skillDevelopmentRate: 0.7,
      overallSystemHealth: 0.85,
    };
  }

  /**
   * Initialize with default agent pool
   */
  private initializeDefaultAgents(): void {
    const defaultAgents: AgentResource[] = [
      {
        id: 'researcher-001',
        type: 'researcher',
        capabilities: [
          {
            id: 'research',
            name: 'Research & Analysis',
            level: 'expert',
            domains: ['technology', 'market', 'competitive'],
            efficiency: 0.9,
            availability: 0.8,
            cost: 100,
          },
          {
            id: 'documentation',
            name: 'Documentation',
            level: 'advanced',
            domains: ['technical', 'user'],
            efficiency: 0.85,
            availability: 0.9,
            cost: 80,
          },
        ],
        currentLoad: 0.3,
        maxConcurrency: 3,
        performanceHistory: [],
        preferences: {
          preferredTaskTypes: ['research', 'analysis', 'documentation'],
          preferredTimeSlots: [
            {
              start: '09:00',
              end: '17:00',
              timezone: 'UTC',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            },
          ],
          skillGrowthInterests: ['ai-research', 'data-analysis'],
          collaborationPreferences: [{ style: 'independent', preference: 0.8 }],
          workloadPreferences: {
            type: 'steady',
            preferredConcurrency: 2,
            maxConcurrency: 3,
            restPeriods: true,
          },
        },
        status: 'available',
        costPerHour: 100,
        utilization: {
          current: 0.3,
          average: 0.5,
          peak: 0.8,
          idle: 0.2,
          efficiency: 0.85,
          burnoutRisk: 0.1,
          overallHealth: 0.9,
        },
      },
      {
        id: 'coder-001',
        type: 'coder',
        capabilities: [
          {
            id: 'typescript',
            name: 'TypeScript Development',
            level: 'expert',
            domains: ['web', 'api', 'tools'],
            efficiency: 0.95,
            availability: 0.85,
            cost: 120,
          },
          {
            id: 'architecture',
            name: 'Software Architecture',
            level: 'advanced',
            domains: ['distributed', 'microservices'],
            efficiency: 0.88,
            availability: 0.7,
            cost: 150,
          },
        ],
        currentLoad: 0.6,
        maxConcurrency: 2,
        performanceHistory: [],
        preferences: {
          preferredTaskTypes: ['coding', 'architecture', 'code-review'],
          preferredTimeSlots: [
            {
              start: '08:00',
              end: '16:00',
              timezone: 'UTC',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            },
          ],
          skillGrowthInterests: ['ai-integration', 'performance-optimization'],
          collaborationPreferences: [{ style: 'paired', preference: 0.7 }],
          workloadPreferences: {
            type: 'burst',
            preferredConcurrency: 1,
            maxConcurrency: 2,
            restPeriods: false,
          },
        },
        status: 'busy',
        costPerHour: 120,
        utilization: {
          current: 0.6,
          average: 0.7,
          peak: 0.95,
          idle: 0.05,
          efficiency: 0.9,
          burnoutRisk: 0.2,
          overallHealth: 0.8,
        },
      },
      {
        id: 'analyst-001',
        type: 'analyst',
        capabilities: [
          {
            id: 'data-analysis',
            name: 'Data Analysis',
            level: 'expert',
            domains: ['performance', 'business', 'user'],
            efficiency: 0.92,
            availability: 0.9,
            cost: 110,
          },
          {
            id: 'optimization',
            name: 'Process Optimization',
            level: 'advanced',
            domains: ['workflow', 'performance'],
            efficiency: 0.87,
            availability: 0.8,
            cost: 130,
          },
        ],
        currentLoad: 0.4,
        maxConcurrency: 4,
        performanceHistory: [],
        preferences: {
          preferredTaskTypes: ['analysis', 'optimization', 'reporting'],
          preferredTimeSlots: [
            {
              start: '10:00',
              end: '18:00',
              timezone: 'UTC',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            },
          ],
          skillGrowthInterests: ['machine-learning', 'predictive-analytics'],
          collaborationPreferences: [{ style: 'team', preference: 0.6 }],
          workloadPreferences: {
            type: 'mixed',
            preferredConcurrency: 3,
            maxConcurrency: 4,
            restPeriods: true,
          },
        },
        status: 'available',
        costPerHour: 110,
        utilization: {
          current: 0.4,
          average: 0.6,
          peak: 0.85,
          idle: 0.15,
          efficiency: 0.88,
          burnoutRisk: 0.15,
          overallHealth: 0.85,
        },
      },
    ];

    defaultAgents.forEach((agent) => this.agents.set(agent.id, agent));
  }

  /**
   * Setup periodic optimization
   */
  private setupPeriodicOptimization(): void {
    setInterval(() => {
      this.runPeriodicOptimization();
    }, 300000); // 5 minutes
  }

  /**
   * Intelligent agent assignment
   */
  async assignAgent(demand: ResourceDemand): Promise<ResourceMatch | null> {
    try {
      const availableAgents = Array.from(this.agents.values()).filter(
        (agent) => agent.status === 'available' || agent.currentLoad < 0.8,
      );

      if (availableAgents.length === 0) {
        return null;
      }

      const matches = availableAgents.map((agent) =>
        this.calculateAgentMatch(agent, demand),
      );
      const bestMatch = matches
        .filter((match) => match.score > 0.5)
        .sort((a, b) => b.score - a.score)[0];

      if (bestMatch) {
        await this.allocateAgent(bestMatch.agent, demand);
        return bestMatch;
      }

      return null;
    } catch (error) {
      console.error('Agent assignment failed:', error);
      return null;
    }
  }

  /**
   * Calculate agent match score
   */
  private calculateAgentMatch(
    agent: AgentResource,
    demand: ResourceDemand,
  ): ResourceMatch {
    const reasons: MatchReason[] = [];
    const conflicts: MatchConflict[] = [];
    const recommendations: MatchRecommendation[] = [];

    let score = 0;
    let totalWeight = 0;

    // Capability matching
    const capabilityScore = this.calculateCapabilityMatch(agent, demand);
    reasons.push({
      type: 'capability',
      factor: 'skills',
      score: capabilityScore,
      weight: 0.4,
    });
    score += capabilityScore * 0.4;
    totalWeight += 0.4;

    // Availability matching
    const availabilityScore = Math.max(0, 1 - agent.currentLoad);
    reasons.push({
      type: 'availability',
      factor: 'current_load',
      score: availabilityScore,
      weight: 0.3,
    });
    score += availabilityScore * 0.3;
    totalWeight += 0.3;

    // Experience matching
    const experienceScore = this.calculateExperienceMatch(agent, demand);
    reasons.push({
      type: 'experience',
      factor: 'past_performance',
      score: experienceScore,
      weight: 0.2,
    });
    score += experienceScore * 0.2;
    totalWeight += 0.2;

    // Cost efficiency
    const costScore = this.calculateCostEfficiency(agent, demand);
    reasons.push({
      type: 'cost',
      factor: 'cost_efficiency',
      score: costScore,
      weight: 0.1,
    });
    score += costScore * 0.1;
    totalWeight += 0.1;

    // Check for conflicts
    if (agent.currentLoad > 0.9) {
      conflicts.push({
        type: 'capacity',
        severity: 'high',
        impact: 'May cause performance degradation',
        resolution: 'Consider load balancing or scaling',
      });
    }

    // Generate recommendations
    if (capabilityScore < 0.7) {
      recommendations.push({
        type: 'skill_development',
        action: 'Provide additional training in required capabilities',
        benefit: 'Improved match score and future assignments',
        effort: 0.3,
      });
    }

    return {
      agent,
      score: totalWeight > 0 ? score / totalWeight : 0,
      reasons,
      conflicts,
      recommendations,
    };
  }

  /**
   * Calculate capability match
   */
  private calculateCapabilityMatch(
    agent: AgentResource,
    demand: ResourceDemand,
  ): number {
    if (demand.requiredCapabilities.length === 0) return 0.5;

    let totalScore = 0;
    let matchedCapabilities = 0;

    for (const required of demand.requiredCapabilities) {
      const agentCap = agent.capabilities.find((cap) =>
        cap.domains.some((domain) => required.domains.includes(domain)),
      );

      if (agentCap) {
        const levelScore = this.getLevelScore(agentCap.level, required.level);
        totalScore += levelScore * agentCap.efficiency;
        matchedCapabilities++;
      }
    }

    return matchedCapabilities > 0 ? totalScore / matchedCapabilities : 0;
  }

  /**
   * Get level score
   */
  private getLevelScore(agentLevel: string, requiredLevel: string): number {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const agentIndex = levels.indexOf(agentLevel);
    const requiredIndex = levels.indexOf(requiredLevel);

    if (agentIndex >= requiredIndex) {
      return 1.0 - (agentIndex - requiredIndex) * 0.1;
    }
    return Math.max(0, 0.5 - (requiredIndex - agentIndex) * 0.2);
  }

  /**
   * Calculate experience match
   */
  private calculateExperienceMatch(
    agent: AgentResource,
    demand: ResourceDemand,
  ): number {
    if (agent.performanceHistory.length === 0) return 0.5;

    const relevantHistory = agent.performanceHistory
      .filter((perf) => perf.taskType === demand.taskType)
      .slice(-5); // Last 5 relevant tasks

    if (relevantHistory.length === 0) return 0.3;

    const avgQuality =
      relevantHistory.reduce((sum, perf) => sum + perf.quality, 0) /
      relevantHistory.length;
    const avgEfficiency =
      relevantHistory.reduce((sum, perf) => sum + perf.efficiency, 0) /
      relevantHistory.length;

    return (avgQuality + avgEfficiency) / 2;
  }

  /**
   * Calculate cost efficiency
   */
  private calculateCostEfficiency(
    agent: AgentResource,
    demand: ResourceDemand,
  ): number {
    const baseCost = agent.costPerHour || 100;
    const efficiency = agent.utilization?.efficiency || 0.8;
    const effectiveCost = baseCost / efficiency;

    // Normalize against budget if provided
    if (demand.budget) {
      const estimatedCost = effectiveCost * demand.duration;
      return Math.max(0, Math.min(1, demand.budget / estimatedCost));
    }

    // Default scoring based on cost tier
    if (effectiveCost < 80) return 1.0;
    if (effectiveCost < 120) return 0.8;
    if (effectiveCost < 160) return 0.6;
    return 0.4;
  }

  /**
   * Allocate agent to task
   */
  private async allocateAgent(
    agent: AgentResource,
    demand: ResourceDemand,
  ): Promise<void> {
    const allocation: ResourceAllocation = {
      taskId: demand.workflowId,
      workflowId: demand.workflowId,
      level: demand.level,
      priority: demand.urgency === 'immediate' ? 'critical' : demand.urgency,
      estimatedDuration: demand.duration,
      allocatedTime: new Date(),
      expectedCompletion: new Date(Date.now() + demand.duration * 60000),
    };

    agent.allocation = allocation;
    agent.currentLoad = Math.min(1, agent.currentLoad + 0.2);
    agent.status = agent.currentLoad >= 0.9 ? 'busy' : 'available';

    const workflowAllocations = this.allocations.get(demand.workflowId) || [];
    workflowAllocations.push(allocation);
    this.allocations.set(demand.workflowId, workflowAllocations);

    this.emit('resource-allocated', {
      agentId: agent.id,
      taskId: demand.workflowId,
      allocation,
    });
  }

  /**
   * Dynamic swarm scaling
   */
  async scaleSwarm(
    swarmId: string,
    targetSize?: number,
  ): Promise<SwarmConfiguration> {
    let swarm = this.swarms.get(swarmId);
    if (!swarm) {
      swarm = this.createDefaultSwarm(swarmId);
      this.swarms.set(swarmId, swarm);
    }

    const currentSize = swarm.currentAgents;
    const optimalSize = targetSize || swarm.optimalAgents;

    if (currentSize < optimalSize) {
      await this.addAgentsToSwarm(swarm, optimalSize - currentSize);
    } else if (currentSize > optimalSize) {
      await this.removeAgentsFromSwarm(swarm, currentSize - optimalSize);
    }

    this.emit('swarm-scaled', {
      swarmId,
      oldSize: currentSize,
      newSize: swarm.currentAgents,
      reason: 'optimization',
    });

    return swarm;
  }

  /**
   * Create default swarm configuration
   */
  private createDefaultSwarm(swarmId: string): SwarmConfiguration {
    return {
      id: swarmId,
      name: `Swarm ${swarmId}`,
      topology: 'mesh',
      minAgents: 2,
      maxAgents: 10,
      currentAgents: 0,
      optimalAgents: 4,
      scalingRules: [
        {
          trigger: {
            type: 'load',
            threshold: 0.8,
            duration: 5,
            direction: 'up',
          },
          action: { type: 'add_agent', magnitude: 1, priority: 1 },
          cooldown: 10,
          conditions: [],
        },
        {
          trigger: {
            type: 'load',
            threshold: 0.3,
            duration: 15,
            direction: 'down',
          },
          action: { type: 'remove_agent', magnitude: 1, priority: 0.5 },
          cooldown: 20,
          conditions: [],
        },
      ],
      performanceTargets: [
        {
          metric: 'utilization',
          target: 0.7,
          tolerance: 0.1,
          priority: 'high',
        },
        {
          metric: 'efficiency',
          target: 0.85,
          tolerance: 0.05,
          priority: 'high',
        },
      ],
      constraints: [
        { type: 'budget', limit: 10000, enforcement: 'hard' },
        { type: 'quality', limit: 0.8, enforcement: 'soft' },
      ],
    };
  }

  /**
   * Add agents to swarm
   */
  private async addAgentsToSwarm(
    swarm: SwarmConfiguration,
    count: number,
  ): Promise<void> {
    const availableAgents = Array.from(this.agents.values())
      .filter((agent) => !agent.swarmId && agent.status === 'available')
      .slice(0, count);

    for (const agent of availableAgents) {
      agent.swarmId = swarm.id;
      swarm.currentAgents++;
    }

    // If not enough available agents, create new ones
    const remaining = count - availableAgents.length;
    for (let i = 0; i < remaining; i++) {
      const newAgent = await this.createNewAgent(swarm.id);
      this.agents.set(newAgent.id, newAgent);
      swarm.currentAgents++;
    }
  }

  /**
   * Remove agents from swarm
   */
  private async removeAgentsFromSwarm(
    swarm: SwarmConfiguration,
    count: number,
  ): Promise<void> {
    const swarmAgents = Array.from(this.agents.values())
      .filter(
        (agent) => agent.swarmId === swarm.id && agent.status === 'available',
      )
      .slice(0, count);

    for (const agent of swarmAgents) {
      agent.swarmId = undefined;
      swarm.currentAgents--;

      // Optionally remove agent entirely if surplus
      if (swarm.currentAgents > swarm.maxAgents) {
        this.agents.delete(agent.id);
      }
    }
  }

  /**
   * Create new agent
   */
  private async createNewAgent(swarmId: string): Promise<AgentResource> {
    const types: AgentResource['type'][] = [
      'researcher',
      'coder',
      'analyst',
      'optimizer',
      'coordinator',
      'tester',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    return {
      id: `${randomType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: randomType,
      capabilities: this.generateDefaultCapabilities(randomType),
      currentLoad: 0,
      maxConcurrency: 2,
      performanceHistory: [],
      preferences: this.generateDefaultPreferences(randomType),
      status: 'available',
      swarmId,
      costPerHour: 100,
      utilization: {
        current: 0,
        average: 0,
        peak: 0,
        idle: 1,
        efficiency: 0.8,
        burnoutRisk: 0,
        overallHealth: 1,
      },
    };
  }

  /**
   * Generate default capabilities
   */
  private generateDefaultCapabilities(
    type: AgentResource['type'],
  ): ResourceCapability[] {
    const capabilityMap: Record<string, ResourceCapability[]> = {
      researcher: [
        {
          id: 'research',
          name: 'Research & Analysis',
          level: 'advanced',
          domains: ['technology'],
          efficiency: 0.8,
          availability: 0.9,
          cost: 90,
        },
      ],
      coder: [
        {
          id: 'coding',
          name: 'Software Development',
          level: 'advanced',
          domains: ['web', 'api'],
          efficiency: 0.85,
          availability: 0.8,
          cost: 110,
        },
      ],
      analyst: [
        {
          id: 'analysis',
          name: 'Data Analysis',
          level: 'advanced',
          domains: ['performance'],
          efficiency: 0.82,
          availability: 0.9,
          cost: 95,
        },
      ],
      optimizer: [
        {
          id: 'optimization',
          name: 'Performance Optimization',
          level: 'advanced',
          domains: ['workflow'],
          efficiency: 0.88,
          availability: 0.85,
          cost: 105,
        },
      ],
      coordinator: [
        {
          id: 'coordination',
          name: 'Project Coordination',
          level: 'advanced',
          domains: ['management'],
          efficiency: 0.9,
          availability: 0.8,
          cost: 120,
        },
      ],
      tester: [
        {
          id: 'testing',
          name: 'Quality Assurance',
          level: 'advanced',
          domains: ['automated', 'manual'],
          efficiency: 0.85,
          availability: 0.9,
          cost: 85,
        },
      ],
    };

    return capabilityMap[type] || [];
  }

  /**
   * Generate default preferences
   */
  private generateDefaultPreferences(
    type: AgentResource['type'],
  ): AgentPreferences {
    return {
      preferredTaskTypes: [type],
      preferredTimeSlots: [
        {
          start: '09:00',
          end: '17:00',
          timezone: 'UTC',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
      ],
      skillGrowthInterests: ['ai-integration'],
      collaborationPreferences: [{ style: 'team', preference: 0.6 }],
      workloadPreferences: {
        type: 'steady',
        preferredConcurrency: 1,
        maxConcurrency: 2,
        restPeriods: true,
      },
    };
  }

  /**
   * Resource utilization optimization
   */
  async optimizeResourceUtilization(): Promise<ResourceOptimization> {
    const currentState = this.calculateCurrentResourceState();
    const targetState = this.calculateTargetResourceState();
    const optimizationActions = this.generateOptimizationActions(
      currentState,
      targetState,
    );

    const optimization: ResourceOptimization = {
      type: 'allocation',
      currentState,
      targetState,
      optimizationActions,
      expectedBenefits: this.calculateExpectedBenefits(optimizationActions),
      risks: this.assessOptimizationRisks(optimizationActions),
      timeline: this.createOptimizationTimeline(optimizationActions),
    };

    this.optimizationHistory.push(optimization);
    this.emit('optimization-applied', { optimization });

    return optimization;
  }

  /**
   * Calculate current resource state
   */
  private calculateCurrentResourceState(): ResourceState {
    const agents = Array.from(this.agents.values());
    const totalUtilization =
      agents.reduce(
        (sum, agent) => sum + (agent.utilization?.current || 0),
        0,
      ) / agents.length;
    const totalEfficiency =
      agents.reduce(
        (sum, agent) => sum + (agent.utilization?.efficiency || 0),
        0,
      ) / agents.length;
    const totalCost = agents.reduce(
      (sum, agent) => sum + (agent.costPerHour || 0),
      0,
    );

    return {
      utilization: totalUtilization,
      efficiency: totalEfficiency,
      cost: totalCost,
      quality: 0.8, // Default quality score
      satisfaction: 0.75, // Default satisfaction score
      capacity: agents.length,
      bottlenecks: this.identifyBottlenecks(),
    };
  }

  /**
   * Calculate target resource state
   */
  private calculateTargetResourceState(): ResourceState {
    return {
      utilization: 0.75, // Target 75% utilization
      efficiency: 0.9, // Target 90% efficiency
      cost: 0, // Will be calculated
      quality: 0.9, // Target 90% quality
      satisfaction: 0.85, // Target 85% satisfaction
      capacity: 0, // Will be calculated
      bottlenecks: [], // Target zero bottlenecks
    };
  }

  /**
   * Generate optimization actions
   */
  private generateOptimizationActions(
    current: ResourceState,
    target: ResourceState,
  ): OptimizationAction[] {
    const actions: OptimizationAction[] = [];

    // Utilization optimization
    if (current.utilization < target.utilization - 0.1) {
      actions.push({
        id: 'increase-utilization',
        type: 'reallocate',
        description: 'Reallocate underutilized resources to high-demand areas',
        impact: {
          utilization: 0.1,
          efficiency: 0.05,
          cost: -0.05,
          quality: 0,
          timeline: -0.1,
          risk: 0.2,
        },
        effort: 0.3,
        priority: 0.8,
        dependencies: [],
      });
    }

    // Efficiency optimization
    if (current.efficiency < target.efficiency - 0.05) {
      actions.push({
        id: 'improve-efficiency',
        type: 'retrain',
        description: 'Provide training to improve agent efficiency',
        impact: {
          utilization: 0,
          efficiency: 0.1,
          cost: 0.1,
          quality: 0.05,
          timeline: 0.1,
          risk: 0.1,
        },
        effort: 0.5,
        priority: 0.7,
        dependencies: [],
      });
    }

    // Bottleneck resolution
    if (current.bottlenecks.length > 0) {
      actions.push({
        id: 'resolve-bottlenecks',
        type: 'scale',
        description: 'Add resources to resolve identified bottlenecks',
        impact: {
          utilization: -0.05,
          efficiency: 0.1,
          cost: 0.2,
          quality: 0.1,
          timeline: -0.2,
          risk: 0.15,
        },
        effort: 0.4,
        priority: 0.9,
        dependencies: [],
      });
    }

    return actions;
  }

  /**
   * Calculate expected benefits
   */
  private calculateExpectedBenefits(
    actions: OptimizationAction[],
  ): OptimizationBenefit[] {
    return actions.map((action) => ({
      type: 'efficiency_improvement',
      value: action.impact.efficiency * 100,
      confidence: 1 - action.impact.risk,
      timeframe: '1-4 weeks',
    }));
  }

  /**
   * Assess optimization risks
   */
  private assessOptimizationRisks(
    actions: OptimizationAction[],
  ): OptimizationRisk[] {
    return actions.map((action) => ({
      type: 'disruption',
      probability: action.impact.risk,
      impact: action.effort,
      mitigation: `Gradual rollout with monitoring for ${action.description}`,
    }));
  }

  /**
   * Create optimization timeline
   */
  private createOptimizationTimeline(
    actions: OptimizationAction[],
  ): OptimizationTimeline[] {
    return [
      {
        phase: 'Planning',
        duration: 1,
        actions: ['Analyze current state', 'Plan optimization actions'],
        milestones: ['Optimization plan approved'],
      },
      {
        phase: 'Implementation',
        duration: 7,
        actions: actions.map((a) => a.description),
        milestones: ['50% actions completed', 'All actions implemented'],
      },
      {
        phase: 'Validation',
        duration: 3,
        actions: ['Monitor results', 'Measure improvements'],
        milestones: ['Optimization validated', 'Results documented'],
      },
    ];
  }

  /**
   * Identify bottlenecks
   */
  private identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];

    const highLoadAgents = Array.from(this.agents.values()).filter(
      (agent) => (agent.utilization?.current || 0) > 0.9,
    );

    if (highLoadAgents.length > 0) {
      bottlenecks.push(`High load on ${highLoadAgents.length} agents`);
    }

    const busyAgents = Array.from(this.agents.values()).filter(
      (agent) => agent.status === 'busy',
    );

    if (busyAgents.length / this.agents.size > 0.8) {
      bottlenecks.push('High overall system load');
    }

    return bottlenecks;
  }

  /**
   * Detect and resolve conflicts
   */
  async detectConflicts(): Promise<ResourceConflict[]> {
    const conflicts: ResourceConflict[] = [];

    // Check for double bookings
    for (const [agentId, agent] of this.agents) {
      if (agent.currentLoad > 1.0) {
        conflicts.push({
          id: `double-booking-${agentId}`,
          type: 'double_booking',
          severity: 'critical',
          affectedResources: [agentId],
          affectedTasks: [], // Would need to track specific tasks
          impact: 'Agent overloaded, quality may suffer',
          resolutionOptions: [
            {
              id: 'reschedule',
              type: 'reschedule',
              description: 'Reschedule lower priority tasks',
              effort: 0.3,
              impact: {
                schedule: 0.2,
                cost: 0,
                quality: -0.1,
                morale: 0.1,
                risk: 0.2,
              },
              tradeoffs: ['Delayed delivery', 'Improved quality'],
            },
          ],
        });
      }
    }

    // Store conflicts for tracking
    conflicts.forEach((conflict) => {
      this.conflicts.set(conflict.id, conflict);
      this.emit('conflict-detected', { conflict });
    });

    return conflicts;
  }

  /**
   * Resolve specific conflict
   */
  async resolveConflict(
    conflictId: string,
    resolutionId: string,
  ): Promise<boolean> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;

    const resolution = conflict.resolutionOptions.find(
      (r) => r.id === resolutionId,
    );
    if (!resolution) return false;

    // Apply resolution based on type
    switch (resolution.type) {
      case 'reschedule':
        await this.rescheduleConflictedTasks(conflict);
        break;
      case 'reallocate':
        await this.reallocateConflictedResources(conflict);
        break;
      case 'prioritize':
        await this.reprioritizeConflictedTasks(conflict);
        break;
    }

    this.conflicts.delete(conflictId);
    this.emit('conflict-resolved', { conflictId, resolution });

    return true;
  }

  /**
   * Reschedule conflicted tasks
   */
  private async rescheduleConflictedTasks(
    conflict: ResourceConflict,
  ): Promise<void> {
    // Implementation would reschedule tasks based on priority
    console.log(`Rescheduling tasks for conflict: ${conflict.id}`);
  }

  /**
   * Reallocate conflicted resources
   */
  private async reallocateConflictedResources(
    conflict: ResourceConflict,
  ): Promise<void> {
    // Implementation would reallocate resources to different agents
    console.log(`Reallocating resources for conflict: ${conflict.id}`);
  }

  /**
   * Reprioritize conflicted tasks
   */
  private async reprioritizeConflictedTasks(
    conflict: ResourceConflict,
  ): Promise<void> {
    // Implementation would adjust task priorities
    console.log(`Reprioritizing tasks for conflict: ${conflict.id}`);
  }

  /**
   * Capacity planning and forecasting
   */
  async generateCapacityForecast(
    timeframe: string,
  ): Promise<CapacityPrediction> {
    const demandForecast = this.forecastDemand(timeframe);
    const capacityForecast = this.forecastCapacity(timeframe);
    const gaps = this.identifyCapacityGaps(demandForecast, capacityForecast);
    const recommendations = this.generateCapacityRecommendations(gaps);

    const prediction: CapacityPrediction = {
      timeframe,
      demandForecast,
      capacityForecast,
      gaps,
      recommendations,
    };

    this.capacityPredictions.push(prediction);
    return prediction;
  }

  /**
   * Forecast demand
   */
  private forecastDemand(timeframe: string): DemandForecast[] {
    // Simple linear forecast based on historical data
    return [
      {
        period: 'week-1',
        taskType: 'research',
        volume: 10,
        complexity: 0.6,
        urgency: 0.7,
        confidence: 0.8,
      },
      {
        period: 'week-2',
        taskType: 'coding',
        volume: 15,
        complexity: 0.8,
        urgency: 0.8,
        confidence: 0.75,
      },
    ];
  }

  /**
   * Forecast capacity
   */
  private forecastCapacity(timeframe: string): CapacityForecast[] {
    const agents = Array.from(this.agents.values());

    return [
      {
        period: 'week-1',
        agentType: 'researcher',
        availableCapacity:
          agents.filter((a) => a.type === 'researcher').length * 40, // hours
        utilization: 0.7,
        efficiency: 0.85,
        constraints: ['Limited availability on weekends'],
      },
      {
        period: 'week-2',
        agentType: 'coder',
        availableCapacity: agents.filter((a) => a.type === 'coder').length * 40,
        utilization: 0.8,
        efficiency: 0.9,
        constraints: ['Code review bottleneck'],
      },
    ];
  }

  /**
   * Identify capacity gaps
   */
  private identifyCapacityGaps(
    demand: DemandForecast[],
    capacity: CapacityForecast[],
  ): CapacityGap[] {
    const gaps: CapacityGap[] = [];

    // Simple gap analysis
    for (const demandItem of demand) {
      const capacityItem = capacity.find((c) => c.period === demandItem.period);
      if (capacityItem) {
        const requiredCapacity = demandItem.volume * demandItem.complexity * 2; // hours
        const availableCapacity =
          capacityItem.availableCapacity * capacityItem.utilization;

        if (requiredCapacity > availableCapacity) {
          gaps.push({
            period: demandItem.period,
            gapType: 'shortage',
            magnitude: requiredCapacity - availableCapacity,
            capability: demandItem.taskType,
            impact: `${Math.round(requiredCapacity - availableCapacity)} hours shortfall`,
            urgency: demandItem.urgency > 0.8 ? 'critical' : 'high',
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Generate capacity recommendations
   */
  private generateCapacityRecommendations(
    gaps: CapacityGap[],
  ): CapacityRecommendation[] {
    return gaps.map((gap) => ({
      type: gap.magnitude > 20 ? 'hiring' : 'training',
      action: `${gap.type === 'shortage' ? 'Add' : 'Reduce'} ${Math.ceil(gap.magnitude / 40)} ${gap.capability} agents`,
      timeline: gap.urgency === 'critical' ? '1-2 weeks' : '2-4 weeks',
      cost: Math.ceil(gap.magnitude / 40) * 100 * 40, // Rough cost estimate
      benefit: gap.magnitude * 2, // Rough benefit calculation
      priority: gap.urgency === 'critical' ? 1 : 0.7,
    }));
  }

  /**
   * Run periodic optimization
   */
  private async runPeriodicOptimization(): Promise<void> {
    try {
      // Detect and resolve conflicts
      await this.detectConflicts();

      // Optimize resource utilization
      await this.optimizeResourceUtilization();

      // Update capacity forecasts
      await this.generateCapacityForecast('4-weeks');

      console.log('Periodic resource optimization completed');
    } catch (error) {
      console.error('Periodic optimization failed:', error);
    }
  }

  /**
   * Get resource status
   */
  getResourceStatus(): {
    agents: AgentResource[];
    swarms: SwarmConfiguration[];
    conflicts: ResourceConflict[];
    utilization: number;
    efficiency: number;
  } {
    const agents = Array.from(this.agents.values());
    const swarms = Array.from(this.swarms.values());
    const conflicts = Array.from(this.conflicts.values());

    const totalUtilization =
      agents.reduce(
        (sum, agent) => sum + (agent.utilization?.current || 0),
        0,
      ) / agents.length;
    const totalEfficiency =
      agents.reduce(
        (sum, agent) => sum + (agent.utilization?.efficiency || 0),
        0,
      ) / agents.length;

    return {
      agents,
      swarms,
      conflicts,
      utilization: totalUtilization,
      efficiency: totalEfficiency,
    };
  }

  // ===============================
  // Cross-Level Resource Optimization Methods
  // ===============================

  /**
   * Request resources from another level
   */
  async requestCrossLevelResource(
    fromLevel: string,
    toLevel: string,
    demand: ResourceDemand,
  ): Promise<ResourceTransfer | null> {
    try {
      const sourceLevel = this.getResourceLevel(fromLevel);
      const targetLevel = this.getResourceLevel(toLevel);

      if (!(sourceLevel && targetLevel)) {
        throw new Error(`Invalid resource level: ${fromLevel} or ${toLevel}`);
      }

      // Check borrowing rules
      const borrowRule = targetLevel.borrowingRules.find(
        (rule) => rule.fromLevel === fromLevel,
      );
      if (!(borrowRule && this.canBorrowResource(demand, borrowRule))) {
        return null;
      }

      // Check lending rules
      const lendRule = sourceLevel.lendingRules.find(
        (rule) => rule.toLevel === toLevel,
      );
      if (!(lendRule && this.canLendResource(demand, lendRule, sourceLevel))) {
        return null;
      }

      // Find suitable agent
      const suitableAgent = this.findCrossLevelAgent(sourceLevel, demand);
      if (!suitableAgent) {
        return null;
      }

      // Create transfer
      const transfer = this.createResourceTransfer(
        suitableAgent,
        fromLevel,
        toLevel,
        demand,
        borrowRule,
      );

      // Execute transfer
      await this.executeResourceTransfer(transfer);

      this.emit('cross-level-request', { fromLevel, toLevel, request: demand });

      return transfer;
    } catch (error) {
      console.error('Cross-level resource request failed:', error);
      return null;
    }
  }

  /**
   * Get resource level by ID
   */
  private getResourceLevel(levelId: string): ResourceLevel | null {
    switch (levelId) {
      case 'portfolio':
        return this.resourcePool.portfolioLevel;
      case 'program':
        return this.resourcePool.programLevel;
      case 'swarm':
        return this.resourcePool.swarmLevel;
      case 'shared':
        return this.resourcePool.sharedPool;
      default:
        return null;
    }
  }

  /**
   * Check if resource can be borrowed
   */
  private canBorrowResource(
    demand: ResourceDemand,
    rule: BorrowingRule,
  ): boolean {
    // Check urgency threshold
    const urgencyLevels = ['low', 'medium', 'high', 'critical'];
    const demandUrgencyIndex = urgencyLevels.indexOf(demand.urgency);
    const ruleUrgencyIndex = urgencyLevels.indexOf(rule.urgencyThreshold);

    if (demandUrgencyIndex < ruleUrgencyIndex) {
      return false;
    }

    // Check duration limit
    if (demand.duration > rule.durationLimit) {
      return false;
    }

    return true;
  }

  /**
   * Check if resource can be lent
   */
  private canLendResource(
    demand: ResourceDemand,
    rule: LendingRule,
    level: ResourceLevel,
  ): boolean {
    // Check priority requirement
    const priorityLevels = ['low', 'medium', 'high', 'critical'];
    const demandPriorityIndex = priorityLevels.indexOf(demand.urgency);
    const rulePriorityIndex = priorityLevels.indexOf(rule.priorityRequirement);

    if (demandPriorityIndex < rulePriorityIndex) {
      return false;
    }

    // Check available capacity
    const currentUtilization = level.performanceMetrics.utilization;
    const availableForLending = Math.max(
      0,
      rule.maxLendPercent - (currentUtilization - rule.retainMinimum),
    );

    if (availableForLending <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Find suitable agent for cross-level transfer
   */
  private findCrossLevelAgent(
    level: ResourceLevel,
    demand: ResourceDemand,
  ): AgentResource | null {
    const availableAgents = Array.from(level.agents.values()).filter(
      (agent) => agent.status === 'available' && agent.currentLoad < 0.8,
    );

    if (availableAgents.length === 0) {
      return null;
    }

    // Score agents based on capability match
    const scoredAgents = availableAgents.map((agent) => ({
      agent,
      score: this.calculateCapabilityMatch(agent, demand),
    }));

    // Return best match above threshold
    const bestMatch = scoredAgents
      .filter((item) => item.score > 0.6)
      .sort((a, b) => b.score - a.score)[0];

    return bestMatch?.agent || null;
  }

  /**
   * Create resource transfer
   */
  private createResourceTransfer(
    agent: AgentResource,
    fromLevel: string,
    toLevel: string,
    demand: ResourceDemand,
    rule: BorrowingRule,
  ): ResourceTransfer {
    const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: transferId,
      agentId: agent.id,
      fromLevel,
      toLevel,
      reason: `Resource demand: ${demand.taskType}`,
      urgency: demand.urgency,
      duration: Math.min(demand.duration, rule.durationLimit),
      startTime: new Date(),
      expectedReturnTime: new Date(
        Date.now() +
          Math.min(demand.duration, rule.durationLimit) * 60 * 60 * 1000,
      ),
      transferCost: rule.cost,
      performanceImpact: this.calculateTransferImpact(
        agent,
        fromLevel,
        toLevel,
      ),
      status: 'pending',
    };
  }

  /**
   * Calculate transfer impact
   */
  private calculateTransferImpact(
    agent: AgentResource,
    fromLevel: string,
    toLevel: string,
  ): TransferImpact {
    const sourceLevel = this.getResourceLevel(fromLevel);
    const targetLevel = this.getResourceLevel(toLevel);

    return {
      onSourceLevel: {
        capacityChange: -0.1,
        efficiencyChange: -0.05,
        qualityChange: -0.02,
        costChange: 0,
        riskChange: 0.05,
      },
      onTargetLevel: {
        capacityChange: 0.1,
        efficiencyChange: 0.08,
        qualityChange: 0.05,
        costChange: 50,
        riskChange: -0.1,
      },
      onAgent: {
        skillUtilization: 0.8,
        learningOpportunity: 0.7,
        stressLevel: 0.3,
        satisfactionChange: 0.1,
        careerDevelopment: 0.6,
      },
    };
  }

  /**
   * Execute resource transfer
   */
  private async executeResourceTransfer(
    transfer: ResourceTransfer,
  ): Promise<void> {
    try {
      const agent = this.agents.get(transfer.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${transfer.agentId}`);
      }

      const sourceLevel = this.getResourceLevel(transfer.fromLevel);
      const targetLevel = this.getResourceLevel(transfer.toLevel);

      if (!(sourceLevel && targetLevel)) {
        throw new Error(
          `Invalid levels: ${transfer.fromLevel} -> ${transfer.toLevel}`,
        );
      }

      // Remove from source level
      sourceLevel.agents.delete(transfer.agentId);
      sourceLevel.availableCapacity = Math.max(
        0,
        sourceLevel.availableCapacity - 0.1,
      );

      // Add to target level
      targetLevel.agents.set(transfer.agentId, agent);
      targetLevel.availableCapacity = Math.min(
        1,
        targetLevel.availableCapacity + 0.1,
      );

      // Update agent status
      agent.allocation = {
        taskId: `transfer-${transfer.id}`,
        workflowId: transfer.id,
        level: transfer.toLevel as any,
        priority: transfer.urgency === 'critical' ? 'critical' : 'high',
        estimatedDuration: transfer.duration,
        allocatedTime: transfer.startTime,
        expectedCompletion: transfer.expectedReturnTime,
      };

      // Track transfer
      transfer.status = 'active';
      this.activeTransfers.set(transfer.id, transfer);

      // Schedule return
      setTimeout(
        () => {
          this.returnTransferredResource(transfer.id);
        },
        transfer.duration * 60 * 60 * 1000,
      );

      this.emit('resource-transferred', { transfer });
    } catch (error) {
      transfer.status = 'cancelled';
      console.error('Resource transfer execution failed:', error);
      throw error;
    }
  }

  /**
   * Return transferred resource
   */
  private async returnTransferredResource(transferId: string): Promise<void> {
    try {
      const transfer = this.activeTransfers.get(transferId);
      if (!transfer || transfer.status !== 'active') {
        return;
      }

      const agent = this.agents.get(transfer.agentId);
      if (!agent) {
        console.error(`Agent not found for return: ${transfer.agentId}`);
        return;
      }

      const sourceLevel = this.getResourceLevel(transfer.fromLevel);
      const targetLevel = this.getResourceLevel(transfer.toLevel);

      if (!(sourceLevel && targetLevel)) {
        console.error(
          `Invalid levels for return: ${transfer.fromLevel} -> ${transfer.toLevel}`,
        );
        return;
      }

      // Return to source level
      targetLevel.agents.delete(transfer.agentId);
      sourceLevel.agents.set(transfer.agentId, agent);

      // Update capacities
      targetLevel.availableCapacity = Math.max(
        0,
        targetLevel.availableCapacity - 0.1,
      );
      sourceLevel.availableCapacity = Math.min(
        1,
        sourceLevel.availableCapacity + 0.1,
      );

      // Clear agent allocation
      agent.allocation = undefined;
      agent.currentLoad = Math.max(0, agent.currentLoad - 0.2);

      // Complete transfer
      transfer.status = 'completed';
      transfer.actualReturnTime = new Date();

      // Calculate actual impact
      const actualImpact = this.calculateActualTransferImpact(transfer);

      this.activeTransfers.delete(transferId);
      this.emit('resource-returned', { transferId, actualImpact });
    } catch (error) {
      console.error('Resource return failed:', error);
    }
  }

  /**
   * Calculate actual transfer impact
   */
  private calculateActualTransferImpact(
    transfer: ResourceTransfer,
  ): TransferImpact {
    // In real implementation, this would analyze actual performance data
    return transfer.performanceImpact;
  }

  /**
   * Skill-based resource allocation
   */
  async allocateBySkills(
    demand: ResourceDemand,
  ): Promise<SkillBasedAllocation | null> {
    try {
      const skillAllocation: SkillBasedAllocation = {
        requiredSkills: this.extractSkillRequirements(demand),
        optionalSkills: [],
        learningOpportunities: [],
        skillGapAnalysis: [],
        allocationScore: 0,
      };

      // Find agents with matching skills
      const matchedAgents = this.findAgentsBySkills(
        skillAllocation.requiredSkills,
      );

      if (matchedAgents.length === 0) {
        // Identify skill gaps
        skillAllocation.skillGapAnalysis = this.identifySkillGaps(
          skillAllocation.requiredSkills,
        );

        // Generate learning opportunities
        skillAllocation.learningOpportunities =
          this.generateLearningOpportunities(skillAllocation.skillGapAnalysis);

        this.skillDatabase.set(demand.workflowId, skillAllocation);

        // Emit skill gap event
        skillAllocation.skillGapAnalysis.forEach((gap) => {
          this.emit('skill-gap-identified', { gap, level: demand.level });
        });

        return skillAllocation;
      }

      // Score allocation
      skillAllocation.allocationScore = this.calculateSkillAllocationScore(
        matchedAgents,
        skillAllocation.requiredSkills,
      );

      this.skillDatabase.set(demand.workflowId, skillAllocation);

      return skillAllocation;
    } catch (error) {
      console.error('Skill-based allocation failed:', error);
      return null;
    }
  }

  /**
   * Extract skill requirements from demand
   */
  private extractSkillRequirements(demand: ResourceDemand): SkillRequirement[] {
    // Map task types to skill requirements
    const skillMap: Record<string, SkillRequirement[]> = {
      research: [
        {
          skill: 'research',
          level: 'advanced',
          importance: 'required',
          weight: 0.8,
        },
        {
          skill: 'analysis',
          level: 'intermediate',
          importance: 'preferred',
          weight: 0.6,
        },
      ],
      coding: [
        {
          skill: 'programming',
          level: 'advanced',
          importance: 'required',
          weight: 0.9,
        },
        {
          skill: 'architecture',
          level: 'intermediate',
          importance: 'preferred',
          weight: 0.7,
        },
      ],
      analysis: [
        {
          skill: 'data-analysis',
          level: 'advanced',
          importance: 'required',
          weight: 0.8,
        },
        {
          skill: 'statistics',
          level: 'intermediate',
          importance: 'preferred',
          weight: 0.6,
        },
      ],
    };

    return skillMap[demand.taskType] || [];
  }

  /**
   * Find agents by skills
   */
  private findAgentsBySkills(
    requiredSkills: SkillRequirement[],
  ): AgentResource[] {
    const agents = Array.from(this.agents.values());

    return agents.filter((agent) => {
      return requiredSkills.every((required) => {
        return agent.capabilities.some((cap) => {
          const skillMatch = cap.name
            .toLowerCase()
            .includes(required.skill.toLowerCase());
          const levelMatch =
            this.getLevelScore(cap.level, required.level) > 0.5;
          return skillMatch && levelMatch;
        });
      });
    });
  }

  /**
   * Identify skill gaps
   */
  private identifySkillGaps(requiredSkills: SkillRequirement[]): SkillGap[] {
    const agents = Array.from(this.agents.values());
    const gaps: SkillGap[] = [];

    for (const required of requiredSkills) {
      const agentsWithSkill = agents.filter((agent) =>
        agent.capabilities.some((cap) =>
          cap.name.toLowerCase().includes(required.skill.toLowerCase()),
        ),
      );

      if (agentsWithSkill.length === 0) {
        gaps.push({
          skill: required.skill,
          requiredLevel: required.level,
          availableLevel: 'none',
          gap: 1.0,
          impact: required.importance === 'required' ? 'critical' : 'high',
          mitigation: `Hire or train agents in ${required.skill}`,
        });
      } else {
        const maxAvailableLevel = agentsWithSkill.reduce((max, agent) => {
          const skillCap = agent.capabilities.find((cap) =>
            cap.name.toLowerCase().includes(required.skill.toLowerCase()),
          );
          return skillCap && this.getLevelScore(skillCap.level, max) > 0
            ? skillCap.level
            : max;
        }, 'beginner');

        const gapSize = this.getLevelScore(required.level, maxAvailableLevel);
        if (gapSize < 0.8) {
          gaps.push({
            skill: required.skill,
            requiredLevel: required.level,
            availableLevel: maxAvailableLevel,
            gap: 1 - gapSize,
            impact: required.importance === 'required' ? 'high' : 'medium',
            mitigation: `Provide additional training in ${required.skill}`,
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Generate learning opportunities
   */
  private generateLearningOpportunities(gaps: SkillGap[]): SkillDevelopment[] {
    return gaps.map((gap) => ({
      skill: gap.skill,
      currentLevel: gap.availableLevel,
      targetLevel: gap.requiredLevel,
      effort: this.calculateTrainingEffort(
        gap.availableLevel,
        gap.requiredLevel,
      ),
      benefit: 1 - gap.gap,
      timeline: this.estimateTrainingTimeline(
        gap.availableLevel,
        gap.requiredLevel,
      ),
    }));
  }

  /**
   * Calculate training effort
   */
  private calculateTrainingEffort(current: string, target: string): number {
    const levels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    const targetIndex = levels.indexOf(target);

    return Math.max(0, (targetIndex - currentIndex) * 20); // 20 hours per level
  }

  /**
   * Estimate training timeline
   */
  private estimateTrainingTimeline(current: string, target: string): string {
    const effort = this.calculateTrainingEffort(current, target);

    if (effort <= 20) return '1-2 weeks';
    if (effort <= 40) return '3-4 weeks';
    if (effort <= 80) return '2-3 months';
    return '3-6 months';
  }

  /**
   * Calculate skill allocation score
   */
  private calculateSkillAllocationScore(
    agents: AgentResource[],
    requiredSkills: SkillRequirement[],
  ): number {
    if (agents.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    for (const required of requiredSkills) {
      const matchedAgents = agents.filter((agent) =>
        agent.capabilities.some((cap) =>
          cap.name.toLowerCase().includes(required.skill.toLowerCase()),
        ),
      );

      if (matchedAgents.length > 0) {
        const bestAgent = matchedAgents[0];
        const capability = bestAgent.capabilities.find((cap) =>
          cap.name.toLowerCase().includes(required.skill.toLowerCase()),
        );

        if (capability) {
          const skillScore = this.getLevelScore(
            capability.level,
            required.level,
          );
          totalScore += skillScore * required.weight;
          totalWeight += required.weight;
        }
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Resolve resource conflicts across levels
   */
  async resolveCrossLevelConflict(
    conflictId: string,
  ): Promise<ResourceConflictResolution | null> {
    try {
      const conflict = this.conflicts.get(conflictId);
      if (!conflict) {
        return null;
      }

      // Determine resolution strategy
      const strategy = this.determineResolutionStrategy(conflict);

      // Find involved levels
      const involvedLevels = this.identifyInvolvedLevels(conflict);

      // Execute resolution
      const outcome = await this.executeConflictResolution(
        conflict,
        strategy,
        involvedLevels,
      );

      const resolution: ResourceConflictResolution = {
        conflictId,
        resolutionStrategy: strategy,
        involvedLevels,
        outcome,
        learnings: this.extractLearnings(conflict, outcome),
      };

      return resolution;
    } catch (error) {
      console.error('Cross-level conflict resolution failed:', error);
      return null;
    }
  }

  /**
   * Determine resolution strategy
   */
  private determineResolutionStrategy(
    conflict: ResourceConflict,
  ): 'negotiate' | 'escalate' | 'compromise' | 'defer' {
    switch (conflict.severity) {
      case 'critical':
        return 'escalate';
      case 'high':
        return 'negotiate';
      case 'medium':
        return 'compromise';
      case 'low':
        return 'defer';
      default:
        return 'negotiate';
    }
  }

  /**
   * Identify involved levels
   */
  private identifyInvolvedLevels(conflict: ResourceConflict): string[] {
    const levels = new Set<string>();

    // Check which levels have affected resources
    for (const resourceId of conflict.affectedResources) {
      const agent = this.agents.get(resourceId);
      if (agent?.allocation?.level) {
        levels.add(agent.allocation.level);
      }
    }

    // Check active transfers
    for (const transfer of this.activeTransfers.values()) {
      if (conflict.affectedResources.includes(transfer.agentId)) {
        levels.add(transfer.fromLevel);
        levels.add(transfer.toLevel);
      }
    }

    return Array.from(levels);
  }

  /**
   * Execute conflict resolution
   */
  private async executeConflictResolution(
    conflict: ResourceConflict,
    strategy: string,
    levels: string[],
  ): Promise<ResolutionOutcome> {
    // Simplified resolution implementation
    const outcome: ResolutionOutcome = {
      resolution: `Applied ${strategy} strategy for ${conflict.type} conflict`,
      satisfaction: {},
      impact: {},
      followUpActions: [],
    };

    // Calculate satisfaction and impact for each level
    for (const level of levels) {
      outcome.satisfaction[level] = 0.7 + Math.random() * 0.2; // 0.7-0.9
      outcome.impact[level] = {
        capacityChange: -0.05 + Math.random() * 0.1,
        efficiencyChange: -0.02 + Math.random() * 0.04,
        qualityChange: 0,
        costChange: Math.random() * 100,
        riskChange: -0.1 + Math.random() * 0.05,
      };
    }

    // Add follow-up actions
    outcome.followUpActions = [
      'Monitor resource allocation for next 48 hours',
      'Review and adjust borrowing/lending rules if needed',
      'Conduct post-resolution retrospective',
    ];

    return outcome;
  }

  /**
   * Extract learnings from conflict resolution
   */
  private extractLearnings(
    conflict: ResourceConflict,
    outcome: ResolutionOutcome,
  ): string[] {
    return [
      `${conflict.type} conflicts require ${Math.round(this.performanceTracking.conflictResolutionTime)} hours average resolution time`,
      `Multi-level conflicts benefit from early ${outcome.resolution.includes('negotiate') ? 'negotiation' : 'escalation'}`,
      'Cross-level communication protocols need regular review',
    ];
  }

  // ===============================
  // Automated Capacity Management Methods
  // ===============================

  /**
   * Automated capacity scaling based on workload
   */
  async autoScaleCapacity(): Promise<{
    scalingActions: CapacityScalingAction[];
    predictedCapacity: CapacityPrediction;
    recommendations: CapacityRecommendation[];
  }> {
    try {
      // Analyze current capacity vs demand
      const currentCapacityAnalysis = this.analyzeCurrentCapacity();
      const demandForecast = this.forecastDemand('2-weeks');
      const capacityGaps = this.identifyCapacityGaps(
        demandForecast,
        currentCapacityAnalysis.capacityForecast,
      );

      // Generate scaling actions
      const scalingActions = this.generateScalingActions(
        capacityGaps,
        currentCapacityAnalysis,
      );

      // Execute approved actions
      await this.executeScalingActions(scalingActions);

      // Generate updated capacity prediction
      const predictedCapacity = await this.generateCapacityForecast('4-weeks');

      // Generate optimization recommendations
      const recommendations =
        this.generateCapacityRecommendations(capacityGaps);

      return {
        scalingActions,
        predictedCapacity,
        recommendations,
      };
    } catch (error) {
      console.error('Auto-scaling failed:', error);
      return {
        scalingActions: [],
        predictedCapacity: {
          timeframe: '4-weeks',
          demandForecast: [],
          capacityForecast: [],
          gaps: [],
          recommendations: [],
        },
        recommendations: [],
      };
    }
  }

  /**
   * Analyze current capacity across all levels
   */
  private analyzeCurrentCapacity(): {
    totalCapacity: number;
    utilization: number;
    bottlenecks: string[];
    capacityForecast: CapacityForecast[];
  } {
    const levels = [
      this.resourcePool.portfolioLevel,
      this.resourcePool.programLevel,
      this.resourcePool.swarmLevel,
      this.resourcePool.sharedPool,
    ];

    let totalCapacity = 0;
    let totalUtilization = 0;
    const bottlenecks: string[] = [];
    const capacityForecast: CapacityForecast[] = [];

    for (const level of levels) {
      const levelCapacity = level.agents.size * 40; // Assuming 40 hours per agent per week
      const levelUtilization = level.performanceMetrics.utilization;

      totalCapacity += levelCapacity;
      totalUtilization += levelUtilization;

      // Identify bottlenecks
      if (levelUtilization > 0.9) {
        bottlenecks.push(
          `${level.name} at ${Math.round(levelUtilization * 100)}% utilization`,
        );
      }

      // Generate capacity forecast for this level
      capacityForecast.push({
        period: 'current',
        agentType: level.id,
        availableCapacity: levelCapacity * (1 - levelUtilization),
        utilization: levelUtilization,
        efficiency: level.performanceMetrics.efficiency,
        constraints: this.identifyLevelConstraints(level),
      });
    }

    return {
      totalCapacity,
      utilization: totalUtilization / levels.length,
      bottlenecks,
      capacityForecast,
    };
  }

  /**
   * Identify constraints for a level
   */
  private identifyLevelConstraints(level: ResourceLevel): string[] {
    const constraints: string[] = [];

    if (level.performanceMetrics.utilization > 0.85) {
      constraints.push('High utilization - limited scaling headroom');
    }

    if (level.performanceMetrics.efficiency < 0.8) {
      constraints.push('Low efficiency - may need process improvements');
    }

    if (level.performanceMetrics.agentSatisfaction < 0.7) {
      constraints.push('Low agent satisfaction - risk of turnover');
    }

    if (level.availableCapacity < 0.2) {
      constraints.push('Low available capacity - immediate scaling needed');
    }

    return constraints;
  }

  /**
   * Generate capacity scaling actions
   */
  private generateScalingActions(
    gaps: CapacityGap[],
    currentAnalysis: {
      totalCapacity: number;
      utilization: number;
      bottlenecks: string[];
    },
  ): CapacityScalingAction[] {
    const actions: CapacityScalingAction[] = [];

    for (const gap of gaps) {
      if (gap.gapType === 'shortage' && gap.urgency === 'critical') {
        // Critical shortage - immediate action needed
        const requiredAgents = Math.ceil(gap.magnitude / 40); // Convert hours to agents

        actions.push({
          id: `scale-${gap.capability}-${Date.now()}`,
          type: 'add_agents',
          level: this.mapCapabilityToLevel(gap.capability),
          magnitude: requiredAgents,
          urgency: gap.urgency,
          reason: `Critical shortage: ${gap.impact}`,
          estimatedCost: requiredAgents * 100 * 40 * 4, // Cost per agent per month
          expectedBenefit: gap.magnitude * 1.5, // Expected productivity gain
          timeline: '1-2 weeks',
          approvalRequired: requiredAgents > 2,
          constraints: [],
          status: 'pending',
        });
      } else if (gap.gapType === 'shortage' && gap.urgency === 'high') {
        // High priority shortage - medium-term scaling
        actions.push({
          id: `optimize-${gap.capability}-${Date.now()}`,
          type: 'optimize_existing',
          level: this.mapCapabilityToLevel(gap.capability),
          magnitude: 1,
          urgency: gap.urgency,
          reason: `Optimize existing resources: ${gap.impact}`,
          estimatedCost: 5000, // Training and optimization cost
          expectedBenefit: gap.magnitude * 0.8,
          timeline: '2-4 weeks',
          approvalRequired: false,
          constraints: ['Requires agent availability for training'],
          status: 'pending',
        });
      } else if (gap.gapType === 'surplus') {
        // Surplus capacity - consider reallocation or reduction
        actions.push({
          id: `reallocate-${gap.capability}-${Date.now()}`,
          type: 'reallocate',
          level: this.mapCapabilityToLevel(gap.capability),
          magnitude: Math.floor(gap.magnitude / 40),
          urgency: 'low',
          reason: `Surplus capacity: ${gap.impact}`,
          estimatedCost: 1000, // Reallocation cost
          expectedBenefit: gap.magnitude * 0.5,
          timeline: '1-2 weeks',
          approvalRequired: false,
          constraints: ['Requires suitable target level'],
          status: 'pending',
        });
      }
    }

    // Add predictive scaling actions
    if (currentAnalysis.utilization > 0.8) {
      actions.push({
        id: `predictive-scale-${Date.now()}`,
        type: 'add_agents',
        level: 'shared',
        magnitude: 2,
        urgency: 'medium',
        reason: 'Predictive scaling - high utilization trend',
        estimatedCost: 8000,
        expectedBenefit: 3200,
        timeline: '2-3 weeks',
        approvalRequired: true,
        constraints: ['Budget approval required'],
        status: 'pending',
      });
    }

    return actions;
  }

  /**
   * Map capability to level
   */
  private mapCapabilityToLevel(capability: string): string {
    const capabilityLevelMap: Record<string, string> = {
      research: 'portfolio',
      analysis: 'program',
      coding: 'swarm',
      coordination: 'program',
      testing: 'swarm',
    };

    return capabilityLevelMap[capability] || 'shared';
  }

  /**
   * Execute scaling actions
   */
  private async executeScalingActions(
    actions: CapacityScalingAction[],
  ): Promise<void> {
    for (const action of actions) {
      try {
        if (action.approvalRequired) {
          // In real implementation, this would request approval
          console.log(`Approval required for: ${action.reason}`);
          action.status = 'pending_approval';
          continue;
        }

        switch (action.type) {
          case 'add_agents':
            await this.executeAddAgents(action);
            break;
          case 'optimize_existing':
            await this.executeOptimizeExisting(action);
            break;
          case 'reallocate':
            await this.executeReallocate(action);
            break;
          case 'remove_agents':
            await this.executeRemoveAgents(action);
            break;
        }

        action.status = 'completed';
        console.log(`Executed scaling action: ${action.reason}`);
      } catch (error) {
        action.status = 'failed';
        console.error(
          `Failed to execute scaling action: ${action.reason}`,
          error,
        );
      }
    }
  }

  /**
   * Execute add agents action
   */
  private async executeAddAgents(action: CapacityScalingAction): Promise<void> {
    const targetLevel = this.getResourceLevel(action.level);
    if (!targetLevel) {
      throw new Error(`Invalid level: ${action.level}`);
    }

    // Create new agents
    for (let i = 0; i < action.magnitude; i++) {
      const newAgent = await this.createOptimizedAgent(action.level);
      this.agents.set(newAgent.id, newAgent);
      targetLevel.agents.set(newAgent.id, newAgent);
    }

    // Update level capacity
    targetLevel.availableCapacity = Math.min(
      1,
      targetLevel.availableCapacity + action.magnitude * 0.1,
    );
  }

  /**
   * Create optimized agent based on level needs
   */
  private async createOptimizedAgent(levelId: string): Promise<AgentResource> {
    const level = this.getResourceLevel(levelId);
    const agentTypes: AgentResource['type'][] =
      this.getOptimalAgentTypes(levelId);
    const selectedType =
      agentTypes[Math.floor(Math.random() * agentTypes.length)];

    return {
      id: `${selectedType}-optimized-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType,
      capabilities: this.generateOptimizedCapabilities(selectedType, levelId),
      currentLoad: 0,
      maxConcurrency: this.getOptimalConcurrency(selectedType),
      performanceHistory: [],
      preferences: this.generateOptimizedPreferences(selectedType, levelId),
      status: 'available',
      costPerHour: this.calculateOptimalCost(selectedType, levelId),
      utilization: {
        current: 0,
        average: 0,
        peak: 0,
        idle: 1,
        efficiency: 0.85, // Start with good efficiency
        burnoutRisk: 0,
        overallHealth: 1,
      },
    };
  }

  /**
   * Get optimal agent types for level
   */
  private getOptimalAgentTypes(levelId: string): AgentResource['type'][] {
    const typeMap: Record<string, AgentResource['type'][]> = {
      portfolio: ['researcher', 'analyst', 'coordinator'],
      program: ['analyst', 'coordinator', 'coder'],
      swarm: ['coder', 'tester', 'optimizer'],
      shared: [
        'researcher',
        'coder',
        'analyst',
        'optimizer',
        'coordinator',
        'tester',
      ],
    };

    return typeMap[levelId] || ['coder', 'analyst'];
  }

  /**
   * Generate optimized capabilities
   */
  private generateOptimizedCapabilities(
    type: AgentResource['type'],
    levelId: string,
  ): ResourceCapability[] {
    const baseCapabilities = this.generateDefaultCapabilities(type);

    // Enhance capabilities based on level requirements
    const levelBonus =
      levelId === 'portfolio' ? 0.1 : levelId === 'program' ? 0.05 : 0;

    return baseCapabilities.map((cap) => ({
      ...cap,
      efficiency: Math.min(1, cap.efficiency + levelBonus),
      cost: cap.cost * (1 + levelBonus),
    }));
  }

  /**
   * Get optimal concurrency for agent type
   */
  private getOptimalConcurrency(type: AgentResource['type']): number {
    const concurrencyMap: Record<string, number> = {
      researcher: 2,
      coder: 1,
      analyst: 3,
      optimizer: 2,
      coordinator: 4,
      tester: 3,
    };

    return concurrencyMap[type] || 2;
  }

  /**
   * Generate optimized preferences
   */
  private generateOptimizedPreferences(
    type: AgentResource['type'],
    levelId: string,
  ): AgentPreferences {
    const base = this.generateDefaultPreferences(type);

    // Optimize based on level characteristics
    if (levelId === 'swarm') {
      base.workloadPreferences.type = 'burst';
      base.workloadPreferences.restPeriods = false;
    } else if (levelId === 'portfolio') {
      base.workloadPreferences.type = 'steady';
      base.collaborationPreferences = [
        { style: 'independent', preference: 0.8 },
      ];
    }

    return base;
  }

  /**
   * Calculate optimal cost for agent
   */
  private calculateOptimalCost(
    type: AgentResource['type'],
    levelId: string,
  ): number {
    const baseCosts: Record<string, number> = {
      researcher: 100,
      coder: 120,
      analyst: 110,
      optimizer: 115,
      coordinator: 125,
      tester: 95,
    };

    const levelMultiplier =
      levelId === 'portfolio' ? 1.3 : levelId === 'program' ? 1.1 : 1;

    return baseCosts[type] * levelMultiplier;
  }

  /**
   * Execute optimize existing action
   */
  private async executeOptimizeExisting(
    action: CapacityScalingAction,
  ): Promise<void> {
    const targetLevel = this.getResourceLevel(action.level);
    if (!targetLevel) {
      throw new Error(`Invalid level: ${action.level}`);
    }

    // Apply optimization to existing agents
    for (const agent of targetLevel.agents.values()) {
      // Improve efficiency through training
      if (agent.utilization) {
        agent.utilization.efficiency = Math.min(
          1,
          agent.utilization.efficiency + 0.05,
        );
        agent.utilization.overallHealth = Math.min(
          1,
          agent.utilization.overallHealth + 0.02,
        );
      }

      // Enhance capabilities
      agent.capabilities.forEach((cap) => {
        cap.efficiency = Math.min(1, cap.efficiency + 0.03);
      });
    }

    // Update level performance
    targetLevel.performanceMetrics.efficiency = Math.min(
      1,
      targetLevel.performanceMetrics.efficiency + 0.05,
    );
  }

  /**
   * Execute reallocate action
   */
  private async executeReallocate(
    action: CapacityScalingAction,
  ): Promise<void> {
    const sourceLevel = this.getResourceLevel(action.level);
    if (!sourceLevel) {
      throw new Error(`Invalid source level: ${action.level}`);
    }

    // Find underutilized agents
    const candidates = Array.from(sourceLevel.agents.values())
      .filter((agent) => (agent.utilization?.current || 0) < 0.5)
      .slice(0, action.magnitude);

    // Find target level with highest demand
    const targetLevel = this.findLevelWithHighestDemand(action.level);
    if (!targetLevel) {
      throw new Error('No suitable target level found');
    }

    // Transfer agents
    for (const agent of candidates) {
      sourceLevel.agents.delete(agent.id);
      targetLevel.agents.set(agent.id, agent);

      // Update agent allocation
      agent.allocation = {
        taskId: `reallocation-${Date.now()}`,
        workflowId: `reallocation-${action.id}`,
        level: targetLevel.id as any,
        priority: 'medium',
        estimatedDuration: 160, // 4 weeks
        allocatedTime: new Date(),
        expectedCompletion: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
      };
    }
  }

  /**
   * Find level with highest demand
   */
  private findLevelWithHighestDemand(
    excludeLevel: string,
  ): ResourceLevel | null {
    const levels = [
      this.resourcePool.portfolioLevel,
      this.resourcePool.programLevel,
      this.resourcePool.swarmLevel,
      this.resourcePool.sharedPool,
    ].filter((level) => level.id !== excludeLevel);

    let highestDemandLevel: ResourceLevel | null = null;
    let highestDemand = 0;

    for (const level of levels) {
      const demand =
        level.performanceMetrics.utilization + (1 - level.availableCapacity);
      if (demand > highestDemand) {
        highestDemand = demand;
        highestDemandLevel = level;
      }
    }

    return highestDemandLevel;
  }

  /**
   * Execute remove agents action
   */
  private async executeRemoveAgents(
    action: CapacityScalingAction,
  ): Promise<void> {
    const targetLevel = this.getResourceLevel(action.level);
    if (!targetLevel) {
      throw new Error(`Invalid level: ${action.level}`);
    }

    // Find agents suitable for removal (lowest utilization, no critical allocations)
    const candidates = Array.from(targetLevel.agents.values())
      .filter(
        (agent) =>
          (agent.utilization?.current || 0) < 0.3 &&
          (!agent.allocation || agent.allocation.priority !== 'critical'),
      )
      .sort(
        (a, b) => (a.utilization?.current || 0) - (b.utilization?.current || 0),
      )
      .slice(0, action.magnitude);

    // Remove agents
    for (const agent of candidates) {
      targetLevel.agents.delete(agent.id);
      this.agents.delete(agent.id);
    }

    // Update level capacity
    targetLevel.availableCapacity = Math.max(
      0,
      targetLevel.availableCapacity - action.magnitude * 0.1,
    );
  }

  /**
   * Automated capacity buffer management
   */
  async manageCapacityBuffers(): Promise<{
    currentBuffers: CapacityBuffer[];
    adjustments: BufferAdjustment[];
    recommendations: string[];
  }> {
    try {
      const currentBuffers = this.calculateCurrentBuffers();
      const adjustments = this.calculateBufferAdjustments(currentBuffers);

      // Apply adjustments
      await this.applyBufferAdjustments(adjustments);

      const recommendations = this.generateBufferRecommendations(
        currentBuffers,
        adjustments,
      );

      return {
        currentBuffers,
        adjustments,
        recommendations,
      };
    } catch (error) {
      console.error('Capacity buffer management failed:', error);
      return {
        currentBuffers: [],
        adjustments: [],
        recommendations: [
          'Error in buffer management - manual review required',
        ],
      };
    }
  }

  /**
   * Calculate current capacity buffers
   */
  private calculateCurrentBuffers(): CapacityBuffer[] {
    const levels = [
      this.resourcePool.portfolioLevel,
      this.resourcePool.programLevel,
      this.resourcePool.swarmLevel,
      this.resourcePool.sharedPool,
    ];

    return levels.map((level) => {
      const totalCapacity = level.agents.size * 40; // hours per week
      const usedCapacity = totalCapacity * level.performanceMetrics.utilization;
      const bufferCapacity = totalCapacity - usedCapacity;
      const optimalBuffer = totalCapacity * 0.2; // 20% buffer target

      return {
        levelId: level.id,
        levelName: level.name,
        totalCapacity,
        usedCapacity,
        bufferCapacity,
        optimalBuffer,
        bufferUtilization: bufferCapacity / optimalBuffer,
        status: this.getBufferStatus(bufferCapacity, optimalBuffer),
        risk: this.calculateBufferRisk(bufferCapacity, optimalBuffer),
      };
    });
  }

  /**
   * Get buffer status
   */
  private getBufferStatus(
    current: number,
    optimal: number,
  ): 'critical' | 'low' | 'adequate' | 'high' {
    const ratio = current / optimal;

    if (ratio < 0.5) return 'critical';
    if (ratio < 0.8) return 'low';
    if (ratio <= 1.2) return 'adequate';
    return 'high';
  }

  /**
   * Calculate buffer risk
   */
  private calculateBufferRisk(current: number, optimal: number): number {
    const ratio = current / optimal;

    if (ratio < 0.5) return 0.9; // High risk
    if (ratio < 0.8) return 0.6; // Medium risk
    if (ratio <= 1.2) return 0.2; // Low risk
    return 0.1; // Very low risk
  }

  /**
   * Calculate buffer adjustments
   */
  private calculateBufferAdjustments(
    buffers: CapacityBuffer[],
  ): BufferAdjustment[] {
    return buffers
      .filter((buffer) => buffer.status !== 'adequate')
      .map((buffer) => {
        const adjustmentType =
          buffer.status === 'critical' || buffer.status === 'low'
            ? 'increase'
            : 'decrease';
        const magnitude = Math.abs(
          buffer.bufferCapacity - buffer.optimalBuffer,
        );

        return {
          levelId: buffer.levelId,
          type: adjustmentType,
          magnitude,
          reason: `Buffer ${buffer.status} - current: ${Math.round(buffer.bufferCapacity)}h, optimal: ${Math.round(buffer.optimalBuffer)}h`,
          priority: buffer.status === 'critical' ? 'high' : 'medium',
          estimatedCost: magnitude * 2.5, // Cost per hour of capacity
          timeline: buffer.status === 'critical' ? '1 week' : '2-3 weeks',
        };
      });
  }

  /**
   * Apply buffer adjustments
   */
  private async applyBufferAdjustments(
    adjustments: BufferAdjustment[],
  ): Promise<void> {
    for (const adjustment of adjustments) {
      try {
        if (adjustment.type === 'increase') {
          await this.increaseBuffer(adjustment);
        } else {
          await this.decreaseBuffer(adjustment);
        }
        console.log(`Applied buffer adjustment: ${adjustment.reason}`);
      } catch (error) {
        console.error(
          `Failed to apply buffer adjustment: ${adjustment.reason}`,
          error,
        );
      }
    }
  }

  /**
   * Increase buffer capacity
   */
  private async increaseBuffer(adjustment: BufferAdjustment): Promise<void> {
    const level = this.getResourceLevel(adjustment.levelId);
    if (!level) return;

    // Increase available capacity
    const capacityIncrease = adjustment.magnitude / 40 / level.agents.size; // Per agent capacity increase
    level.availableCapacity = Math.min(
      1,
      level.availableCapacity + capacityIncrease,
    );

    // If still not enough, consider adding agents
    if (adjustment.priority === 'high' && capacityIncrease < 0.1) {
      const additionalAgents = Math.ceil(adjustment.magnitude / 40);
      for (let i = 0; i < additionalAgents; i++) {
        const newAgent = await this.createOptimizedAgent(adjustment.levelId);
        this.agents.set(newAgent.id, newAgent);
        level.agents.set(newAgent.id, newAgent);
      }
    }
  }

  /**
   * Decrease buffer capacity
   */
  private async decreaseBuffer(adjustment: BufferAdjustment): Promise<void> {
    const level = this.getResourceLevel(adjustment.levelId);
    if (!level) return;

    // Reallocate excess capacity to other levels
    const excessCapacity = adjustment.magnitude;
    const targetLevel = this.findLevelWithHighestDemand(adjustment.levelId);

    if (targetLevel) {
      // Transfer some agents if the excess is significant
      const agentsToTransfer = Math.min(2, Math.floor(excessCapacity / 40));
      if (agentsToTransfer > 0) {
        const candidates = Array.from(level.agents.values()).slice(
          0,
          agentsToTransfer,
        );
        for (const agent of candidates) {
          level.agents.delete(agent.id);
          targetLevel.agents.set(agent.id, agent);
        }
      }
    }
  }

  /**
   * Generate buffer recommendations
   */
  private generateBufferRecommendations(
    buffers: CapacityBuffer[],
    adjustments: BufferAdjustment[],
  ): string[] {
    const recommendations: string[] = [];

    // Overall buffer health
    const criticalBuffers = buffers.filter(
      (b) => b.status === 'critical',
    ).length;
    const lowBuffers = buffers.filter((b) => b.status === 'low').length;

    if (criticalBuffers > 0) {
      recommendations.push(
        `${criticalBuffers} level(s) have critical buffer shortage - immediate action required`,
      );
    }

    if (lowBuffers > 1) {
      recommendations.push(
        `${lowBuffers} level(s) have low buffers - consider systematic capacity review`,
      );
    }

    // Specific level recommendations
    for (const buffer of buffers) {
      if (buffer.status === 'critical') {
        recommendations.push(
          `${buffer.levelName}: Add ${Math.ceil(buffer.optimalBuffer / 40)} agents or reduce workload by ${Math.round((1 - buffer.bufferUtilization) * 100)}%`,
        );
      } else if (buffer.status === 'high') {
        recommendations.push(
          `${buffer.levelName}: Excess capacity available - consider reallocating ${Math.floor(buffer.bufferCapacity / 40)} agents`,
        );
      }
    }

    // Adjustment recommendations
    const highPriorityAdjustments = adjustments.filter(
      (a) => a.priority === 'high',
    ).length;
    if (highPriorityAdjustments > 0) {
      recommendations.push(
        `${highPriorityAdjustments} high-priority buffer adjustments planned - monitor closely`,
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ['All capacity buffers are within optimal range'];
  }

  /**
   * Resource demand prediction with ML-like forecasting
   */
  async predictResourceDemand(timeframe: string): Promise<{
    demandForecast: DemandPrediction[];
    confidenceInterval: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      // Analyze historical patterns
      const historicalData = this.analyzeHistoricalDemand();

      // Generate forecast
      const demandForecast = this.generateDemandForecast(
        historicalData,
        timeframe,
      );

      // Calculate confidence
      const confidenceInterval =
        this.calculateForecastConfidence(historicalData);

      // Identify risk factors
      const riskFactors = this.identifyDemandRiskFactors(demandForecast);

      // Generate recommendations
      const recommendations = this.generateDemandRecommendations(
        demandForecast,
        riskFactors,
      );

      return {
        demandForecast,
        confidenceInterval,
        riskFactors,
        recommendations,
      };
    } catch (error) {
      console.error('Demand prediction failed:', error);
      return {
        demandForecast: [],
        confidenceInterval: 0.5,
        riskFactors: ['Prediction error - using default assumptions'],
        recommendations: ['Manual demand planning recommended'],
      };
    }
  }

  /**
   * Analyze historical demand patterns
   */
  private analyzeHistoricalDemand(): HistoricalDemandData {
    // Simplified historical analysis
    return {
      totalTasks: 250,
      tasksByType: {
        research: 50,
        coding: 120,
        analysis: 45,
        coordination: 20,
        testing: 15,
      },
      seasonalPatterns: {
        highDemandPeriods: ['Q1', 'Q3'],
        lowDemandPeriods: ['Q2'],
        peakUtilization: 0.9,
        lowUtilization: 0.6,
      },
      trendAnalysis: {
        growthRate: 0.15, // 15% yearly growth
        volatility: 0.2,
        cyclicality: 0.1,
      },
    };
  }

  /**
   * Generate demand forecast
   */
  private generateDemandForecast(
    historical: HistoricalDemandData,
    timeframe: string,
  ): DemandPrediction[] {
    const periods = this.getPeriodsFromTimeframe(timeframe);
    const forecast: DemandPrediction[] = [];

    for (let i = 0; i < periods; i++) {
      const period = `week-${i + 1}`;
      const baseVolume = historical.totalTasks / 52; // Weekly average
      const trendAdjustment =
        baseVolume * historical.trendAnalysis.growthRate * (i / 52);
      const seasonalAdjustment = this.getSeasonalAdjustment(i, historical);

      const adjustedVolume = baseVolume + trendAdjustment + seasonalAdjustment;

      // Generate forecasts by task type
      for (const [taskType, historicalCount] of Object.entries(
        historical.tasksByType,
      )) {
        const typeRatio = historicalCount / historical.totalTasks;
        const predictedVolume = adjustedVolume * typeRatio;

        forecast.push({
          period,
          taskType,
          predictedVolume,
          complexity: this.getPredictedComplexity(taskType),
          urgency: this.getPredictedUrgency(taskType, i),
          confidence: this.calculatePeriodConfidence(i),
          resourceHours:
            predictedVolume * this.getAverageTaskDuration(taskType),
        });
      }
    }

    return forecast;
  }

  /**
   * Get periods from timeframe
   */
  private getPeriodsFromTimeframe(timeframe: string): number {
    if (timeframe.includes('week')) {
      return Number.parseInt(timeframe.split('-')[0]) || 4;
    }
    return 4; // Default to 4 weeks
  }

  /**
   * Get seasonal adjustment
   */
  private getSeasonalAdjustment(
    weekIndex: number,
    historical: HistoricalDemandData,
  ): number {
    const quarterIndex = Math.floor(weekIndex / 13);
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentQuarter = quarters[quarterIndex % 4];

    if (
      historical.seasonalPatterns.highDemandPeriods.includes(currentQuarter)
    ) {
      return (historical.totalTasks * 0.2) / 52; // 20% increase
    }
    if (historical.seasonalPatterns.lowDemandPeriods.includes(currentQuarter)) {
      return (-historical.totalTasks * 0.1) / 52; // 10% decrease
    }

    return 0;
  }

  /**
   * Get predicted complexity
   */
  private getPredictedComplexity(taskType: string): number {
    const complexityMap: Record<string, number> = {
      research: 0.7,
      coding: 0.8,
      analysis: 0.6,
      coordination: 0.5,
      testing: 0.6,
    };

    return complexityMap[taskType] || 0.6;
  }

  /**
   * Get predicted urgency
   */
  private getPredictedUrgency(taskType: string, weekIndex: number): number {
    // Urgency tends to increase towards end of quarters
    const quarterProgress = (weekIndex % 13) / 13;
    const baseUrgency = taskType === 'coordination' ? 0.8 : 0.6;

    return Math.min(1, baseUrgency + quarterProgress * 0.2);
  }

  /**
   * Calculate period confidence
   */
  private calculatePeriodConfidence(weekIndex: number): number {
    // Confidence decreases with distance into future
    return Math.max(0.5, 1 - weekIndex * 0.05);
  }

  /**
   * Get average task duration
   */
  private getAverageTaskDuration(taskType: string): number {
    const durationMap: Record<string, number> = {
      research: 16, // hours
      coding: 20,
      analysis: 12,
      coordination: 8,
      testing: 10,
    };

    return durationMap[taskType] || 15;
  }

  /**
   * Calculate forecast confidence
   */
  private calculateForecastConfidence(
    historical: HistoricalDemandData,
  ): number {
    // Confidence based on volatility and data quality
    const volatilityPenalty = historical.trendAnalysis.volatility * 0.3;
    const baseConfidence = 0.8;

    return Math.max(0.5, baseConfidence - volatilityPenalty);
  }

  /**
   * Identify demand risk factors
   */
  private identifyDemandRiskFactors(forecast: DemandPrediction[]): string[] {
    const risks: string[] = [];

    // Check for demand spikes
    const avgVolume =
      forecast.reduce((sum, p) => sum + p.predictedVolume, 0) / forecast.length;
    const spikes = forecast.filter((p) => p.predictedVolume > avgVolume * 1.5);

    if (spikes.length > 0) {
      risks.push(
        `${spikes.length} periods with demand spikes (>50% above average)`,
      );
    }

    // Check for high complexity periods
    const highComplexity = forecast.filter(
      (p) => p.complexity > 0.75 && p.predictedVolume > avgVolume,
    );
    if (highComplexity.length > 0) {
      risks.push(
        `${highComplexity.length} periods with high complexity + high volume`,
      );
    }

    // Check for low confidence predictions
    const lowConfidence = forecast.filter((p) => p.confidence < 0.6);
    if (lowConfidence.length > 0) {
      risks.push(
        `${lowConfidence.length} periods with low prediction confidence`,
      );
    }

    return risks.length > 0
      ? risks
      : ['No significant risk factors identified'];
  }

  /**
   * Generate demand recommendations
   */
  private generateDemandRecommendations(
    forecast: DemandPrediction[],
    risks: string[],
  ): string[] {
    const recommendations: string[] = [];

    // Capacity recommendations
    const totalHours = forecast.reduce((sum, p) => sum + p.resourceHours, 0);
    const requiredAgents = Math.ceil(totalHours / ((40 * forecast.length) / 7)); // Assuming weekly periods

    recommendations.push(
      `Estimated ${requiredAgents} agents required for forecasted demand`,
    );

    // Risk-based recommendations
    if (risks.some((r) => r.includes('demand spikes'))) {
      recommendations.push(
        'Consider flexible capacity or overtime arrangements for demand spikes',
      );
    }

    if (risks.some((r) => r.includes('high complexity'))) {
      recommendations.push(
        'Ensure senior agents available for high complexity periods',
      );
    }

    if (risks.some((r) => r.includes('low confidence'))) {
      recommendations.push(
        'Plan for demand variability - maintain higher capacity buffers',
      );
    }

    // Task type specific recommendations
    const codingDemand = forecast
      .filter((p) => p.taskType === 'coding')
      .reduce((sum, p) => sum + p.predictedVolume, 0);
    if (codingDemand > totalHours * 0.6) {
      recommendations.push(
        'High coding demand forecasted - ensure sufficient developer capacity',
      );
    }

    return recommendations;
  }

  /**
   * Get cross-level performance metrics
   */
  getCrossLevelPerformance(): ResourcePerformanceTracking {
    // Update performance tracking based on recent activity
    const activeTransferCount = this.activeTransfers.size;
    const completedTransfers = Array.from(this.activeTransfers.values()).filter(
      (t) => t.status === 'completed',
    ).length;

    if (activeTransferCount > 0) {
      this.performanceTracking.transferSuccessRate =
        completedTransfers / activeTransferCount;
    }

    // Update cross-level efficiency based on resource utilization
    const levels = [
      this.resourcePool.portfolioLevel,
      this.resourcePool.programLevel,
      this.resourcePool.swarmLevel,
      this.resourcePool.sharedPool,
    ];

    const avgEfficiency =
      levels.reduce(
        (sum, level) => sum + level.performanceMetrics.efficiency,
        0,
      ) / levels.length;

    this.performanceTracking.crossLevelEfficiency = avgEfficiency;

    // Update overall system health
    this.performanceTracking.overallSystemHealth =
      this.performanceTracking.crossLevelEfficiency * 0.3 +
      this.performanceTracking.transferSuccessRate * 0.2 +
      this.performanceTracking.costOptimization * 0.2 +
      this.performanceTracking.skillDevelopmentRate * 0.15 +
      (1 - this.performanceTracking.conflictResolutionTime / 24) * 0.15; // Normalize to 0-1

    return { ...this.performanceTracking };
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    // Return all transferred resources
    for (const transfer of this.activeTransfers.values()) {
      if (transfer.status === 'active') {
        this.returnTransferredResource(transfer.id);
      }
    }

    // Clean up resources and save state
    console.log('Dynamic Resource Manager shutting down');
  }
}

export default DynamicResourceManager;
