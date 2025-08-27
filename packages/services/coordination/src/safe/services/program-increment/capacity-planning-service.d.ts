/**
 * @fileoverview Capacity Planning Service - Resource Allocation and Team Optimization
 *
 * Specialized service for managing team capacity planning, resource allocation, and workload optimization
 * within SAFe Program Increments. Handles intelligent team allocation, skill matching, and capacity analytics.
 *
 * Features:
 * - Intelligent team capacity calculation and allocation
 * - Feature-to-team assignment with skill matching
 * - Capacity risk assessment and mitigation
 * - Resource optimization and load balancing
 * - Capacity analytics and forecasting
 * - Team utilization monitoring and recommendations
 *
 * Integrations:
 * - @claude-zen/brain: Intelligent resource allocation and optimization
 * - @claude-zen/brain: AI-powered capacity forecasting and decision making
 * - @claude-zen/foundation: Performance tracking and analytics
 * - @claude-zen/fact-system: Capacity data storage and reasoning
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface TeamCapacity {
    readonly teamId: string;
    readonly teamName: string;
    readonly totalCapacity: number;
    readonly availableCapacity: number;
    readonly velocity: number;
    readonly members: TeamMember[];
    readonly skills: TeamSkill[];
    readonly commitmentReliability: number;
    readonly focusFactor: number;
    readonly innovationCapacity: number;
    readonly bufferCapacity: number;
}
export interface TeamMember {
    readonly memberId: string;
    readonly name: string;
    readonly role: developer | tester | architect | analyst | designer | 'devops;;
    readonly capacity: number;
    readonly skills: string[];
    readonly experience: 'junior|mid|senior|expert;;
    readonly availability: number;
    readonly crossTrainingAreas: string[];
}
export interface TeamSkill {
    readonly skillName: string;
    readonly proficiency: 'basic|intermediate|advanced|expert;;
    readonly memberCount: number;
    readonly capacity: number;
    readonly critical: boolean;
}
export interface FeatureAllocationRequest {
    readonly featureId: string;
    readonly featureName: string;
    readonly description: string;
    readonly businessValue: number;
    readonly complexity: number;
    readonly requiredSkills: string[];
    readonly priority: 'critical|high|medium|low;;
    readonly dependencies: string[];
    readonly acceptanceCriteria: string[];
    readonly estimatedDuration: number;
}
export interface TeamAllocation {
    readonly allocationId: string;
    readonly teamId: string;
    readonly featureId: string;
    readonly capacityRequired: number;
    readonly capacityAllocated: number;
    readonly skills: SkillMatch[];
    readonly confidence: number;
    readonly risks: AllocationRisk[];
    readonly startIteration: number;
    readonly endIteration: number;
    readonly dependencies: string[];
}
export interface SkillMatch {
    readonly skill: string;
    readonly required: boolean;
    readonly proficiencyRequired: basic | intermediate | advanced | 'expert;;
    readonly proficiencyAvailable: basic | intermediate | advanced | 'expert;;
    readonly memberCount: number;
    readonly matchQuality: 'perfect|good|adequate|poor;;
}
export interface AllocationRisk {
    readonly riskType: capacity | skill | dependency | timeline | 'quality;;
    readonly description: string;
    readonly probability: number;
    readonly impact: 'low|medium|high|critical;;
    readonly mitigation: string;
    readonly owner: string;
}
export interface CapacityPlanningResult {
    totalCapacity: number;
    allocatedCapacity: number;
    bufferCapacity: number;
    innovationCapacity: number;
    utilizationRate: number;
    teamAllocations: TeamAllocation[];
    unallocatedFeatures: FeatureAllocationRequest[];
    capacityRisks: CapacityRisk[];
    recommendations: CapacityRecommendation[];
    analytics: CapacityAnalytics;
}
export interface CapacityRisk {
    readonly riskId: string;
    readonly type: overallocation | underutilization | skill_gap | dependency | 'timeline;;
    readonly description: string;
    readonly impact: string;
    readonly mitigation: string;
    readonly severity: 'low|medium|high|critical;;
    readonly affectedTeams: string[];
    readonly affectedFeatures: string[];
    readonly dueDate: Date;
}
export interface CapacityRecommendation {
    readonly recommendationId: string;
    readonly type: rebalancing | skill_development | scope_adjustment | 'timeline_adjustment;;
    readonly title: string;
    readonly description: string;
    readonly benefits: string[];
    readonly effort: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly priority: 'critical|high|medium|low;;
    readonly implementation: RecommendationImplementation;
}
export interface RecommendationImplementation {
    readonly steps: string[];
    readonly resources: string[];
    readonly timeline: string;
    readonly successCriteria: string[];
    readonly risks: string[];
    readonly dependencies: string[];
}
export interface CapacityAnalytics {
    readonly totalTeams: number;
    readonly totalFeatures: number;
    readonly allocationSuccess: number;
    readonly averageUtilization: number;
    readonly skillCoverage: SkillCoverageAnalysis;
    readonly teamDistribution: TeamDistributionAnalysis;
    readonly riskDistribution: RiskDistributionAnalysis;
    readonly forecastAccuracy: ForecastAccuracy;
}
export interface SkillCoverageAnalysis {
    readonly totalSkills: number;
    readonly coveredSkills: number;
    readonly skillGaps: string[];
    readonly overloadedSkills: string[];
    readonly crossTrainingOpportunities: string[];
}
export interface TeamDistributionAnalysis {
    readonly evenness: number;
    readonly outliers: string[];
    readonly balanceRecommendations: string[];
}
export interface RiskDistributionAnalysis {
    readonly risksByType: Record<string, number>;
    readonly risksBySeverity: Record<string, number>;
    readonly riskTrends: string[];
    readonly mitigation: string[];
}
export interface ForecastAccuracy {
    readonly historicalAccuracy: number;
    readonly confidenceLevel: number;
    readonly uncertaintyFactors: string[];
    readonly improvementAreas: string[];
}
export interface CapacityPlanningConfiguration {
    readonly enableIntelligentAllocation: boolean;
    readonly enableSkillMatching: boolean;
    readonly enableCapacityForecasting: boolean;
    readonly enableRiskAnalysis: boolean;
    readonly bufferPercentage: number;
    readonly innovationPercentage: number;
    readonly utilizationTarget: number;
    readonly skillMatchThreshold: number;
}
/**
 * Capacity Planning Service for intelligent resource allocation and team optimization
 */
export declare class CapacityPlanningService extends EventBus {
    private readonly logger;
    private readonly teamCapacities;
    private readonly allocations;
    private readonly config;
    private loadBalancer;
    private brainCoordinator;
    private performanceTracker;
    private factSystem;
    private initialized;
    constructor(logger: Logger, config?: Partial<CapacityPlanningConfiguration>);
    /**
     * Initialize the service with dependencies
     */
    initialize(): void;
    /**
     * Calculate comprehensive team capacities with intelligent analysis
     */
    calculateTeamCapacities(teams: any[]): Promise<TeamCapacity[]>;
    /**
     * Implement intelligent capacity planning and feature allocation
     */
    implementCapacityPlanning(teamCapacities: TeamCapacity[], features: FeatureAllocationRequest[]): Promise<CapacityPlanningResult>;
    /**
     * Get team capacity by ID
     */
    getTeamCapacity(teamId: string): TeamCapacity | undefined;
    /**
     * Get all team capacities
     */
    getAllTeamCapacities(): TeamCapacity[];
    /**
     * Get allocation by ID
     */
    getAllocation(allocationId: string): TeamAllocation | undefined;
    /**
     * Get all allocations
     */
    getAllAllocations(): TeamAllocation[];
    /**
     * Get allocations by team
     */
    getAllocationsByTeam(teamId: string): TeamAllocation[];
    /**
     * Shutdown the service
     */
    shutdown(): void;
    /**
     * Calculate total team capacity
     */
    private calculateTotalCapacity;
    /**
     * Calculate available capacity after accounting for overhead
     */
    private calculateAvailableCapacity;
    /**
     * Estimate team velocity based on capacity and historical data
     */
    private estimateVelocity;
    /**
     * Calculate experience multiplier based on team member experience
     */
    private calculateExperienceMultiplier;
    /**
     * Process team members into structured format
     */
    private processTeamMembers;
    /**
     * Analyze team skills and capabilities
     */
    private analyzeTeamSkills;
    /**
     * Calculate average proficiency level
     */
    private calculateAverageProficiency;
    /**
     * Calculate innovation capacity (reserved for innovation work)
     */
    private calculateInnovationCapacity;
    /**
     * Calculate buffer capacity (reserved for risks and issues)
     */
    private calculateBufferCapacity;
    /**
     * Prioritize features using intelligent algorithms
     */
    private prioritizeFeatures;
    /**
     * Allocate feature to best-fit team using intelligent matching
     */
    private allocateFeatureToTeam;
}
//# sourceMappingURL=capacity-planning-service.d.ts.map