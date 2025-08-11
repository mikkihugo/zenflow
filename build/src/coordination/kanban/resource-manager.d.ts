/**
 * Dynamic Resource Manager for Adaptive Resource Management
 *
 * Provides intelligent agent assignment, dynamic swarm scaling, and resource optimization
 * for multi-level workflow orchestration with cross-level resource sharing.
 */
import { EventEmitter } from 'events';
export interface ResourceCapability {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    domains: string[];
    efficiency: number;
    availability: number;
    cost: number;
    lastUsed?: Date;
    successRate?: number;
}
export interface AgentResource {
    id: string;
    type: 'researcher' | 'coder' | 'analyst' | 'optimizer' | 'coordinator' | 'tester';
    capabilities: ResourceCapability[];
    currentLoad: number;
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
    quality: number;
    efficiency: number;
    successRate: number;
    feedback?: string;
    metrics?: any;
}
export interface AgentPreferences {
    preferredTaskTypes: string[];
    preferredTimeSlots: TimeSlot[];
    skillGrowthInterests: string[];
    collaborationPreferences: CollaborationStyle[];
    workloadPreferences: WorkloadStyle;
}
export interface TimeSlot {
    start: string;
    end: string;
    timezone: string;
    days: string[];
}
export interface CollaborationStyle {
    style: 'independent' | 'paired' | 'team' | 'mentoring';
    preference: number;
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
    value: any;
    importance: 'required' | 'preferred' | 'nice-to-have';
    impact: string;
}
export interface ResourceUtilization {
    current: number;
    average: number;
    peak: number;
    idle: number;
    efficiency: number;
    burnoutRisk: number;
    overallHealth: number;
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
    cooldown: number;
    conditions: ScalingCondition[];
}
export interface ScalingTrigger {
    type: 'load' | 'queue' | 'latency' | 'quality' | 'cost' | 'schedule';
    threshold: number;
    duration: number;
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
    value: any;
}
export interface PerformanceTarget {
    metric: string;
    target: number;
    tolerance: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
}
export interface SwarmConstraint {
    type: 'budget' | 'time' | 'quality' | 'resource' | 'regulatory';
    limit: any;
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
    minimum: number;
    target: number;
    weight: number;
}
export interface ResourceMatch {
    agent: AgentResource;
    score: number;
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
    type: 'skill_development' | 'scheduling' | 'pairing' | 'training' | 'tool_support';
    action: string;
    benefit: string;
    effort: number;
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
    utilization: number;
    efficiency: number;
    cost: number;
    quality: number;
    satisfaction: number;
    capacity: number;
    bottlenecks: string[];
}
export interface OptimizationAction {
    id: string;
    type: 'reallocate' | 'scale' | 'retrain' | 'restructure' | 'automate';
    description: string;
    impact: OptimizationImpact;
    effort: number;
    priority: number;
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
    type: 'cost_savings' | 'time_savings' | 'quality_improvement' | 'capacity_increase';
    value: number;
    confidence: number;
    timeframe: string;
}
export interface OptimizationRisk {
    type: 'disruption' | 'quality' | 'schedule' | 'cost' | 'morale';
    probability: number;
    impact: number;
    mitigation: string;
}
export interface OptimizationTimeline {
    phase: string;
    duration: number;
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
    complexity: number;
    urgency: number;
    confidence: number;
}
export interface CapacityForecast {
    period: string;
    agentType: string;
    availableCapacity: number;
    utilization: number;
    efficiency: number;
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
    priority: number;
}
export interface ResourceConflict {
    id: string;
    type: 'double_booking' | 'skill_mismatch' | 'capacity_exceeded' | 'priority_conflict';
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedResources: string[];
    affectedTasks: string[];
    impact: string;
    resolutionOptions: ConflictResolution[];
}
export interface ConflictResolution {
    id: string;
    type: 'reschedule' | 'reallocate' | 'prioritize' | 'split_task' | 'add_resource';
    description: string;
    effort: number;
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
    reservedCapacity: number;
    availableCapacity: number;
    borrowingRules: BorrowingRule[];
    lendingRules: LendingRule[];
    performanceMetrics: LevelPerformanceMetrics;
}
export interface BorrowingRule {
    fromLevel: string;
    maxBorrowPercent: number;
    urgencyThreshold: 'critical' | 'high' | 'medium' | 'low';
    durationLimit: number;
    returnPriority: number;
    cost?: number;
}
export interface LendingRule {
    toLevel: string;
    maxLendPercent: number;
    retainMinimum: number;
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
    duration: number;
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
    capacityChange: number;
    efficiencyChange: number;
    qualityChange: number;
    costChange: number;
    riskChange: number;
}
export interface AgentImpact {
    skillUtilization: number;
    learningOpportunity: number;
    stressLevel: number;
    satisfactionChange: number;
    careerDevelopment: number;
}
export interface SkillBasedAllocation {
    requiredSkills: SkillRequirement[];
    optionalSkills: SkillRequirement[];
    learningOpportunities: SkillDevelopment[];
    skillGapAnalysis: SkillGap[];
    allocationScore: number;
}
export interface SkillRequirement {
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    importance: 'required' | 'preferred' | 'nice-to-have';
    weight: number;
}
export interface SkillDevelopment {
    skill: string;
    currentLevel: string;
    targetLevel: string;
    effort: number;
    benefit: number;
    timeline: string;
}
export interface SkillGap {
    skill: string;
    requiredLevel: string;
    availableLevel: string;
    gap: number;
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
    satisfaction: Record<string, number>;
    impact: Record<string, LevelImpact>;
    followUpActions: string[];
}
export interface ResourcePerformanceTracking {
    crossLevelEfficiency: number;
    transferSuccessRate: number;
    conflictResolutionTime: number;
    costOptimization: number;
    skillDevelopmentRate: number;
    overallSystemHealth: number;
}
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
    status: 'pending' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'failed';
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
    'resource-deallocated': {
        agentId: string;
        taskId: string;
    };
    'resource-transferred': {
        transfer: ResourceTransfer;
    };
    'resource-returned': {
        transferId: string;
        actualImpact: TransferImpact;
    };
    'swarm-scaled': {
        swarmId: string;
        oldSize: number;
        newSize: number;
        reason: string;
    };
    'conflict-detected': {
        conflict: ResourceConflict;
    };
    'conflict-resolved': {
        conflictId: string;
        resolution: ConflictResolution;
    };
    'optimization-applied': {
        optimization: ResourceOptimization;
    };
    'capacity-warning': {
        gap: CapacityGap;
    };
    'performance-alert': {
        agentId: string;
        metric: string;
        value: number;
    };
    'cross-level-request': {
        fromLevel: string;
        toLevel: string;
        request: ResourceDemand;
    };
    'skill-gap-identified': {
        gap: SkillGap;
        level: string;
    };
    'capacity-scaled': {
        action: CapacityScalingAction;
    };
    'buffer-adjusted': {
        adjustment: BufferAdjustment;
    };
    'demand-predicted': {
        forecast: DemandPrediction[];
        confidence: number;
    };
}
/**
 * Dynamic Resource Manager
 *
 * Intelligent resource allocation and management system for multi-level workflows
 */
export declare class DynamicResourceManager extends EventEmitter {
    private agents;
    private swarms;
    private allocations;
    private conflicts;
    private optimizationHistory;
    private capacityPredictions;
    private resourcePool;
    private activeTransfers;
    private performanceTracking;
    private skillDatabase;
    constructor();
    /**
     * Initialize resource pool with cross-level structure
     */
    private initializeResourcePool;
    /**
     * Initialize performance tracking
     */
    private initializePerformanceTracking;
    /**
     * Initialize with default agent pool
     */
    private initializeDefaultAgents;
    /**
     * Setup periodic optimization
     */
    private setupPeriodicOptimization;
    /**
     * Intelligent agent assignment
     */
    assignAgent(demand: ResourceDemand): Promise<ResourceMatch | null>;
    /**
     * Calculate agent match score
     */
    private calculateAgentMatch;
    /**
     * Calculate capability match
     */
    private calculateCapabilityMatch;
    /**
     * Get level score
     */
    private getLevelScore;
    /**
     * Calculate experience match
     */
    private calculateExperienceMatch;
    /**
     * Calculate cost efficiency
     */
    private calculateCostEfficiency;
    /**
     * Allocate agent to task
     */
    private allocateAgent;
    /**
     * Dynamic swarm scaling
     */
    scaleSwarm(swarmId: string, targetSize?: number): Promise<SwarmConfiguration>;
    /**
     * Create default swarm configuration
     */
    private createDefaultSwarm;
    /**
     * Add agents to swarm
     */
    private addAgentsToSwarm;
    /**
     * Remove agents from swarm
     */
    private removeAgentsFromSwarm;
    /**
     * Create new agent
     */
    private createNewAgent;
    /**
     * Generate default capabilities
     */
    private generateDefaultCapabilities;
    /**
     * Generate default preferences
     */
    private generateDefaultPreferences;
    /**
     * Resource utilization optimization
     */
    optimizeResourceUtilization(): Promise<ResourceOptimization>;
    /**
     * Calculate current resource state
     */
    private calculateCurrentResourceState;
    /**
     * Calculate target resource state
     */
    private calculateTargetResourceState;
    /**
     * Generate optimization actions
     */
    private generateOptimizationActions;
    /**
     * Calculate expected benefits
     */
    private calculateExpectedBenefits;
    /**
     * Assess optimization risks
     */
    private assessOptimizationRisks;
    /**
     * Create optimization timeline
     */
    private createOptimizationTimeline;
    /**
     * Identify bottlenecks
     */
    private identifyBottlenecks;
    /**
     * Detect and resolve conflicts
     */
    detectConflicts(): Promise<ResourceConflict[]>;
    /**
     * Resolve specific conflict
     */
    resolveConflict(conflictId: string, resolutionId: string): Promise<boolean>;
    /**
     * Reschedule conflicted tasks
     */
    private rescheduleConflictedTasks;
    /**
     * Reallocate conflicted resources
     */
    private reallocateConflictedResources;
    /**
     * Reprioritize conflicted tasks
     */
    private reprioritizeConflictedTasks;
    /**
     * Capacity planning and forecasting
     */
    generateCapacityForecast(timeframe: string): Promise<CapacityPrediction>;
    /**
     * Forecast demand
     */
    private forecastDemand;
    /**
     * Forecast capacity
     */
    private forecastCapacity;
    /**
     * Identify capacity gaps
     */
    private identifyCapacityGaps;
    /**
     * Generate capacity recommendations
     */
    private generateCapacityRecommendations;
    /**
     * Run periodic optimization
     */
    private runPeriodicOptimization;
    /**
     * Get resource status
     */
    getResourceStatus(): {
        agents: AgentResource[];
        swarms: SwarmConfiguration[];
        conflicts: ResourceConflict[];
        utilization: number;
        efficiency: number;
    };
    /**
     * Request resources from another level
     */
    requestCrossLevelResource(fromLevel: string, toLevel: string, demand: ResourceDemand): Promise<ResourceTransfer | null>;
    /**
     * Get resource level by ID
     */
    private getResourceLevel;
    /**
     * Check if resource can be borrowed
     */
    private canBorrowResource;
    /**
     * Check if resource can be lent
     */
    private canLendResource;
    /**
     * Find suitable agent for cross-level transfer
     */
    private findCrossLevelAgent;
    /**
     * Create resource transfer
     */
    private createResourceTransfer;
    /**
     * Calculate transfer impact
     */
    private calculateTransferImpact;
    /**
     * Execute resource transfer
     */
    private executeResourceTransfer;
    /**
     * Return transferred resource
     */
    private returnTransferredResource;
    /**
     * Calculate actual transfer impact
     */
    private calculateActualTransferImpact;
    /**
     * Skill-based resource allocation
     */
    allocateBySkills(demand: ResourceDemand): Promise<SkillBasedAllocation | null>;
    /**
     * Extract skill requirements from demand
     */
    private extractSkillRequirements;
    /**
     * Find agents by skills
     */
    private findAgentsBySkills;
    /**
     * Identify skill gaps
     */
    private identifySkillGaps;
    /**
     * Generate learning opportunities
     */
    private generateLearningOpportunities;
    /**
     * Calculate training effort
     */
    private calculateTrainingEffort;
    /**
     * Estimate training timeline
     */
    private estimateTrainingTimeline;
    /**
     * Calculate skill allocation score
     */
    private calculateSkillAllocationScore;
    /**
     * Resolve resource conflicts across levels
     */
    resolveCrossLevelConflict(conflictId: string): Promise<ResourceConflictResolution | null>;
    /**
     * Determine resolution strategy
     */
    private determineResolutionStrategy;
    /**
     * Identify involved levels
     */
    private identifyInvolvedLevels;
    /**
     * Execute conflict resolution
     */
    private executeConflictResolution;
    /**
     * Extract learnings from conflict resolution
     */
    private extractLearnings;
    /**
     * Automated capacity scaling based on workload
     */
    autoScaleCapacity(): Promise<{
        scalingActions: CapacityScalingAction[];
        predictedCapacity: CapacityPrediction;
        recommendations: CapacityRecommendation[];
    }>;
    /**
     * Analyze current capacity across all levels
     */
    private analyzeCurrentCapacity;
    /**
     * Identify constraints for a level
     */
    private identifyLevelConstraints;
    /**
     * Generate capacity scaling actions
     */
    private generateScalingActions;
    /**
     * Map capability to level
     */
    private mapCapabilityToLevel;
    /**
     * Execute scaling actions
     */
    private executeScalingActions;
    /**
     * Execute add agents action
     */
    private executeAddAgents;
    /**
     * Create optimized agent based on level needs
     */
    private createOptimizedAgent;
    /**
     * Get optimal agent types for level
     */
    private getOptimalAgentTypes;
    /**
     * Generate optimized capabilities
     */
    private generateOptimizedCapabilities;
    /**
     * Get optimal concurrency for agent type
     */
    private getOptimalConcurrency;
    /**
     * Generate optimized preferences
     */
    private generateOptimizedPreferences;
    /**
     * Calculate optimal cost for agent
     */
    private calculateOptimalCost;
    /**
     * Execute optimize existing action
     */
    private executeOptimizeExisting;
    /**
     * Execute reallocate action
     */
    private executeReallocate;
    /**
     * Find level with highest demand
     */
    private findLevelWithHighestDemand;
    /**
     * Execute remove agents action
     */
    private executeRemoveAgents;
    /**
     * Automated capacity buffer management
     */
    manageCapacityBuffers(): Promise<{
        currentBuffers: CapacityBuffer[];
        adjustments: BufferAdjustment[];
        recommendations: string[];
    }>;
    /**
     * Calculate current capacity buffers
     */
    private calculateCurrentBuffers;
    /**
     * Get buffer status
     */
    private getBufferStatus;
    /**
     * Calculate buffer risk
     */
    private calculateBufferRisk;
    /**
     * Calculate buffer adjustments
     */
    private calculateBufferAdjustments;
    /**
     * Apply buffer adjustments
     */
    private applyBufferAdjustments;
    /**
     * Increase buffer capacity
     */
    private increaseBuffer;
    /**
     * Decrease buffer capacity
     */
    private decreaseBuffer;
    /**
     * Generate buffer recommendations
     */
    private generateBufferRecommendations;
    /**
     * Resource demand prediction with ML-like forecasting
     */
    predictResourceDemand(timeframe: string): Promise<{
        demandForecast: DemandPrediction[];
        confidenceInterval: number;
        riskFactors: string[];
        recommendations: string[];
    }>;
    /**
     * Analyze historical demand patterns
     */
    private analyzeHistoricalDemand;
    /**
     * Generate demand forecast
     */
    private generateDemandForecast;
    /**
     * Get periods from timeframe
     */
    private getPeriodsFromTimeframe;
    /**
     * Get seasonal adjustment
     */
    private getSeasonalAdjustment;
    /**
     * Get predicted complexity
     */
    private getPredictedComplexity;
    /**
     * Get predicted urgency
     */
    private getPredictedUrgency;
    /**
     * Calculate period confidence
     */
    private calculatePeriodConfidence;
    /**
     * Get average task duration
     */
    private getAverageTaskDuration;
    /**
     * Calculate forecast confidence
     */
    private calculateForecastConfidence;
    /**
     * Identify demand risk factors
     */
    private identifyDemandRiskFactors;
    /**
     * Generate demand recommendations
     */
    private generateDemandRecommendations;
    /**
     * Get cross-level performance metrics
     */
    getCrossLevelPerformance(): ResourcePerformanceTracking;
    /**
     * Cleanup and shutdown
     */
    shutdown(): void;
}
export default DynamicResourceManager;
//# sourceMappingURL=resource-manager.d.ts.map