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

import { EventEmitter } from 'node:events';
import type { Logger } from '@claude-zen/foundation';

// ============================================================================
// CAPACITY PLANNING INTERFACES
// ============================================================================

export interface TeamCapacity {
  readonly teamId: string;
  readonly teamName: string;
  readonly totalCapacity: number; // story points or hours
  readonly availableCapacity: number; // after accounting for leave, training, etc.
  readonly velocity: number; // historical velocity
  readonly members: TeamMember[];
  readonly skills: TeamSkill[];
  readonly commitmentReliability: number; // 0-1, historical delivery ratio
  readonly focusFactor: number; // 0-1, percentage of capacity for feature work
  readonly innovationCapacity: number; // capacity reserved for innovation
  readonly bufferCapacity: number; // capacity reserved for risks/issues
}

export interface TeamMember {
  readonly memberId: string;
  readonly name: string;
  readonly role:|developer|tester|architect|analyst|designer|'devops;
  readonly capacity: number; // individual capacity
  readonly skills: string[];
  readonly experience: 'junior|mid|senior|expert;
  readonly availability: number; // 0-1, percentage availability for PI
  readonly crossTrainingAreas: string[];
}

export interface TeamSkill {
  readonly skillName: string;
  readonly proficiency: 'basic|intermediate|advanced|expert;
  readonly memberCount: number; // number of team members with this skill
  readonly capacity: number; // capacity available for this skill
  readonly critical: boolean; // is this a critical bottleneck skill
}

export interface FeatureAllocationRequest {
  readonly featureId: string;
  readonly featureName: string;
  readonly description: string;
  readonly businessValue: number; // 1-100 scale
  readonly complexity: number; // story points or similar
  readonly requiredSkills: string[];
  readonly priority: 'critical|high|medium|low;
  readonly dependencies: string[];
  readonly acceptanceCriteria: string[];
  readonly estimatedDuration: number; // in iterations
}

export interface TeamAllocation {
  readonly allocationId: string;
  readonly teamId: string;
  readonly featureId: string;
  readonly capacityRequired: number;
  readonly capacityAllocated: number;
  readonly skills: SkillMatch[];
  readonly confidence: number; // 0-1, confidence in successful delivery
  readonly risks: AllocationRisk[];
  readonly startIteration: number;
  readonly endIteration: number;
  readonly dependencies: string[];
}

export interface SkillMatch {
  readonly skill: string;
  readonly required: boolean;
  readonly proficiencyRequired:|basic|intermediate|advanced|'expert;
  readonly proficiencyAvailable:|basic|intermediate|advanced|'expert;
  readonly memberCount: number;
  readonly matchQuality: 'perfect|good|adequate|poor;
}

export interface AllocationRisk {
  readonly riskType:|capacity|skill|dependency|timeline|'quality;
  readonly description: string;
  readonly probability: number; // 0-1
  readonly impact: 'low|medium|high|critical;
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
  readonly type:|overallocation|underutilization|skill_gap|dependency|'timeline;
  readonly description: string;
  readonly impact: string;
  readonly mitigation: string;
  readonly severity: 'low|medium|high|critical;
  readonly affectedTeams: string[];
  readonly affectedFeatures: string[];
  readonly dueDate: Date;
}

export interface CapacityRecommendation {
  readonly recommendationId: string;
  readonly type:|rebalancing|skill_development|scope_adjustment|'timeline_adjustment;
  readonly title: string;
  readonly description: string;
  readonly benefits: string[];
  readonly effort: 'low' | 'medium' | 'high';
  readonly timeline: string;
  readonly priority: 'critical|high|medium|low;
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
  readonly allocationSuccess: number; // percentage of features successfully allocated
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
  readonly evenness: number; // 0-1, how evenly work is distributed
  readonly outliers: string[]; // teams with significantly higher/lower allocation
  readonly balanceRecommendations: string[];
}

export interface RiskDistributionAnalysis {
  readonly risksByType: Record<string, number>;
  readonly risksBySeverity: Record<string, number>;
  readonly riskTrends: string[];
  readonly mitigation: string[];
}

export interface ForecastAccuracy {
  readonly historicalAccuracy: number; // 0-1, how accurate past forecasts were
  readonly confidenceLevel: number; // 0-1, confidence in current forecast
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

// ============================================================================
// CAPACITY PLANNING SERVICE
// ============================================================================

/**
 * Capacity Planning Service for intelligent resource allocation and team optimization
 */
export class CapacityPlanningService extends TypedEventBase {
  private readonly logger: Logger;
  private readonly teamCapacities = new Map<string, TeamCapacity>();
  private readonly allocations = new Map<string, TeamAllocation>();
  private readonly config: CapacityPlanningConfiguration;
  private loadBalancer: any;
  private brainCoordinator: any;
  private performanceTracker: any;
  private factSystem: any;
  private initialized = false;

  constructor(
    logger: Logger,
    config: Partial<CapacityPlanningConfiguration> = {}
  ) {
    super();
    this.logger = logger;

    this.config = {
      enableIntelligentAllocation: true,
      enableSkillMatching: true,
      enableCapacityForecasting: true,
      enableRiskAnalysis: true,
      bufferPercentage: 20,
      innovationPercentage: 10,
      utilizationTarget: 80,
      skillMatchThreshold: 0.7,
      ...config,
    };
  }

  /**
   * Initialize the service with dependencies
   */
  initialize(): void {
    if (this.initialized) return;

    try {
      // Initialize with fallback implementations
      this.loadBalancer = this.createLoadBalancerFallback();
      this.brainCoordinator = this.createBrainCoordinatorFallback();
      this.performanceTracker = this.createPerformanceTrackerFallback();
      this.factSystem = this.createFactSystemFallback();

      this.initialized = true;
      this.logger.info('Capacity Planning Service initialized successfully');'
    } catch (error) {
      this.logger.error(
        'Failed to initialize Capacity Planning Service:',
        error
      );
      throw error;
    }
  }

  /**
   * Calculate comprehensive team capacities with intelligent analysis
   */
  async calculateTeamCapacities(teams: any[]): Promise<TeamCapacity[]> {
    if (!this.initialized) this.initialize();

    this.logger.info('Calculating team capacities', {'
      teamCount: teams.length,
    });

    const timer = this.performanceTracker.startTimer('capacity_calculation');'

    try {
      const capacities: TeamCapacity[] = [];

      for (const team of teams) {
        // Use brain coordinator for intelligent capacity analysis
        const capacityAnalysis = await this.brainCoordinator.analyzeCapacity({
          team,
          historicalData: await this.factSystem.getTeamHistory(team.id),
          configuration: this.config,
        });

        const teamCapacity: TeamCapacity = {
          teamId: team.id,
          teamName: team.name,
          totalCapacity: this.calculateTotalCapacity(team.members),
          availableCapacity: this.calculateAvailableCapacity(
            team.members,
            capacityAnalysis
          ),
          velocity:
            capacityAnalysis.historicalVelocity || this.estimateVelocity(team),
          members: this.processTeamMembers(team.members),
          skills: this.analyzeTeamSkills(team.members),
          commitmentReliability: capacityAnalysis.commitmentReliability || 0.85,
          focusFactor: capacityAnalysis.focusFactor || 0.7,
          innovationCapacity: this.calculateInnovationCapacity(team),
          bufferCapacity: this.calculateBufferCapacity(team),
        };

        // Store capacity facts for future analysis
        await this.factSystem.storeFact({
          type:'team_capacity',
          entity: team.id,
          properties: {
            totalCapacity: teamCapacity.totalCapacity,
            availableCapacity: teamCapacity.availableCapacity,
            velocity: teamCapacity.velocity,
            memberCount: teamCapacity.members.length,
            skillCount: teamCapacity.skills.length,
          },
          confidence: capacityAnalysis.confidence || 0.8,
          source:'capacity-planning-service',
        });

        capacities.push(teamCapacity);
        this.teamCapacities.set(team.id, teamCapacity);
      }

      this.performanceTracker.endTimer('capacity_calculation');'

      this.emit('team-capacities-calculated', {'
        teamCount: capacities.length,
        totalCapacity: capacities.reduce((sum, c) => sum + c.totalCapacity, 0),
        averageVelocity:
          capacities.reduce((sum, c) => sum + c.velocity, 0) /
          capacities.length,
      });

      this.logger.info('Team capacities calculated successfully', {'
        teamCount: capacities.length,
        totalCapacity: capacities.reduce((sum, c) => sum + c.totalCapacity, 0),
      });

      return capacities;
    } catch (error) {
      this.performanceTracker.endTimer('capacity_calculation');'
      this.logger.error('Team capacity calculation failed:', error);'
      throw error;
    }
  }

  /**
   * Implement intelligent capacity planning and feature allocation
   */
  async implementCapacityPlanning(
    teamCapacities: TeamCapacity[],
    features: FeatureAllocationRequest[]
  ): Promise<CapacityPlanningResult> {
    if (!this.initialized) this.initialize();

    this.logger.info('Implementing capacity planning', {'
      teamCount: teamCapacities.length,
      featureCount: features.length,
    });

    const timer = this.performanceTracker.startTimer('capacity_planning');'

    try {
      // Initialize planning result
      const planningResult: CapacityPlanningResult = {
        totalCapacity: teamCapacities.reduce(
          (sum, t) => sum + t.totalCapacity,
          0
        ),
        allocatedCapacity: 0,
        bufferCapacity: 0,
        innovationCapacity: 0,
        utilizationRate: 0,
        teamAllocations: [],
        unallocatedFeatures: [],
        capacityRisks: [],
        recommendations: [],
        analytics: this.initializeAnalytics(),
      };

      // Calculate capacity reserves
      planningResult.bufferCapacity = teamCapacities.reduce(
        (sum, t) => sum + t.bufferCapacity,
        0
      );
      planningResult.innovationCapacity = teamCapacities.reduce(
        (sum, t) => sum + t.innovationCapacity,
        0
      );

      // Sort features by priority and business value for intelligent allocation
      const prioritizedFeatures = await this.prioritizeFeatures(features);

      // Use load balancer for intelligent allocation
      const allocationStrategy =
        await this.loadBalancer.createAllocationStrategy({
          teams: teamCapacities,
          workload: prioritizedFeatures,
          objectives: {
            maximizeUtilization: true,
            balanceLoad: true,
            matchSkills: this.configuration.enableSkillMatching,
            minimizeRisks: this.configuration.enableRiskAnalysis,
          },
          constraints: {
            bufferPercentage: this.configuration.bufferPercentage,
            innovationPercentage: this.configuration.innovationPercentage,
            utilizationTarget: this.configuration.utilizationTarget,
          },
        });

      // Execute intelligent allocation
      for (const feature of prioritizedFeatures) {
        const allocation = await this.allocateFeatureToTeam(
          feature,
          teamCapacities,
          allocationStrategy,
          planningResult.teamAllocations
        );

        if (allocation) {
          planningResult.teamAllocations.push(allocation);
          planningResult.allocatedCapacity += allocation.capacityAllocated;
          this.allocations.set(allocation.allocationId, allocation);

          // Store allocation facts
          await this.factSystem.storeFact({
            type: 'feature_allocation',
            entity: feature.featureId,
            properties: {
              teamId: allocation.teamId,
              capacityRequired: allocation.capacityRequired,
              capacityAllocated: allocation.capacityAllocated,
              confidence: allocation.confidence,
              riskCount: allocation.risks.length,
            },
            confidence: allocation.confidence,
            source: 'capacity-planning-service',
          });
        } else {
          planningResult.unallocatedFeatures.push(feature);
          this.logger.warn('Feature allocation failed', {'
            featureId: feature.featureId,
            featureName: feature.featureName,
            complexity: feature.complexity,
          });
        }
      }

      // Calculate utilization rate
      planningResult.utilizationRate =
        planningResult.totalCapacity > 0
          ? planningResult.allocatedCapacity /
            (planningResult.totalCapacity -
              planningResult.bufferCapacity -
              planningResult.innovationCapacity)
          : 0;

      // Identify capacity risks
      planningResult.capacityRisks = this.identifyCapacityRisks(
        teamCapacities,
        planningResult.teamAllocations,
        planningResult.unallocatedFeatures
      );

      // Generate intelligent recommendations
      planningResult.recommendations =
        await this.generateCapacityRecommendations(
          planningResult,
          teamCapacities,
          allocationStrategy
        );

      // Calculate comprehensive analytics
      planningResult.analytics = this.calculateCapacityAnalytics(
        teamCapacities,
        planningResult
      );

      this.performanceTracker.endTimer('capacity_planning');'

      this.emit('capacity-planning-completed', {'
        allocatedFeatures: planningResult.teamAllocations.length,
        unallocatedFeatures: planningResult.unallocatedFeatures.length,
        utilizationRate: planningResult.utilizationRate,
        riskCount: planningResult.capacityRisks.length,
        recommendationCount: planningResult.recommendations.length,
      });

      this.logger.info('Capacity planning completed successfully', {'
        allocatedFeatures: planningResult.teamAllocations.length,
        utilizationRate: Math.round(planningResult.utilizationRate * 100),
      });

      return planningResult;
    } catch (error) {
      this.performanceTracker.endTimer('capacity_planning');'
      this.logger.error('Capacity planning implementation failed:', error);'
      throw error;
    }
  }

  /**
   * Get team capacity by ID
   */
  getTeamCapacity(teamId: string): TeamCapacity | undefined {
    return this.teamCapacities.get(teamId);
  }

  /**
   * Get all team capacities
   */
  getAllTeamCapacities(): TeamCapacity[] {
    return Array.from(this.teamCapacities.values())();
  }

  /**
   * Get allocation by ID
   */
  getAllocation(allocationId: string): TeamAllocation | undefined {
    return this.allocations.get(allocationId);
  }

  /**
   * Get all allocations
   */
  getAllAllocations(): TeamAllocation[] {
    return Array.from(this.allocations.values())();
  }

  /**
   * Get allocations by team
   */
  getAllocationsByTeam(teamId: string): TeamAllocation[] {
    return Array.from(this.allocations.values()).filter(
      (a) => a.teamId === teamId
    );
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    this.logger.info('Shutting down Capacity Planning Service');'
    this.removeAllListeners();
    this.teamCapacities.clear();
    this.allocations.clear();
    this.initialized = false;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate total team capacity
   */
  private calculateTotalCapacity(members: any[]): number {
    return members.reduce((total, member) => {
      const baseCapacity = member.hoursPerWeek || 40;
      const availability = member.availability || 1.0;
      return total + baseCapacity * availability;
    }, 0);
  }

  /**
   * Calculate available capacity after accounting for overhead
   */
  private calculateAvailableCapacity(members: any[], analysis: any): number {
    const totalCapacity = this.calculateTotalCapacity(members);
    const focusFactor = analysis.focusFactor || 0.7;
    return totalCapacity * focusFactor;
  }

  /**
   * Estimate team velocity based on capacity and historical data
   */
  private estimateVelocity(team: any): number {
    // In practice, this would use historical data
    const baseVelocity = team.members.length * 8; // 8 story points per person per iteration
    const experienceMultiplier = this.calculateExperienceMultiplier(
      team.members
    );
    return baseVelocity * experienceMultiplier;
  }

  /**
   * Calculate experience multiplier based on team member experience
   */
  private calculateExperienceMultiplier(members: any[]): number {
    const experienceWeights = {
      junior: 0.7,
      mid: 1.0,
      senior: 1.3,
      expert: 1.5,
    };

    const avgExperience =
      members.reduce((sum, member) => {
        return (
          sum +
          (experienceWeights[
            member.experience as keyof typeof experienceWeights
          ] || 1.0)
        );
      }, 0) / members.length;

    return avgExperience;
  }

  /**
   * Process team members into structured format
   */
  private processTeamMembers(members: any[]): TeamMember[] {
    return members.map((member) => ({
      memberId: member.id,
      name: member.name,
      role: member.role || 'developer',
      capacity: member.hoursPerWeek || 40,
      skills: member.skills || [],
      experience: member.experience || 'mid',
      availability: member.availability || 1.0,
      crossTrainingAreas: member.crossTrainingAreas || [],
    }));
  }

  /**
   * Analyze team skills and capabilities
   */
  private analyzeTeamSkills(members: any[]): TeamSkill[] {
    const skillMap = new Map<
      string,
      { count: number; capacity: number; proficiencies: string[] }
    >();

    // Aggregate skills across team members
    for (const member of members) {
      for (const skill of member.skills || []) {
        if (!skillMap.has(skill.name)) {
          skillMap.set(skill.name, {
            count: 0,
            capacity: 0,
            proficiencies: [],
          });
        }

        const skillInfo = skillMap.get(skill.name)!;
        skillInfo.count++;
        skillInfo.capacity += member.hoursPerWeek * member.availability || 40;
        skillInfo.proficiencies.push(skill.proficiency || 'intermediate');'
      }
    }

    // Convert to TeamSkill format
    const teamSkills: TeamSkill[] = [];
    for (const [skillName, info] of skillMap) {
      const avgProficiency = this.calculateAverageProficiency(
        info.proficiencies
      );

      teamSkills.push({
        skillName,
        proficiency: avgProficiency,
        memberCount: info.count,
        capacity: info.capacity,
        critical: info.count === 1, // Single point of failure
      });
    }

    return teamSkills;
  }

  /**
   * Calculate average proficiency level
   */
  private calculateAverageProficiency(
    proficiencies: string[]
  ): 'basic|intermediate|advanced|expert'{'
    const proficiencyValues = {
      basic: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };

    const avgValue =
      proficiencies.reduce((sum, prof) => {
        return (
          sum + (proficiencyValues[prof as keyof typeof proficiencyValues] || 2)
        );
      }, 0) / proficiencies.length;

    if (avgValue >= 3.5) return'expert;
    if (avgValue >= 2.5) return 'advanced;
    if (avgValue >= 1.5) return 'intermediate;
    return 'basic;
  }

  /**
   * Calculate innovation capacity (reserved for innovation work)
   */
  private calculateInnovationCapacity(team: any): number {
    const totalCapacity = this.calculateTotalCapacity(team.members);
    return totalCapacity * (this.configuration.innovationPercentage / 100);
  }

  /**
   * Calculate buffer capacity (reserved for risks and issues)
   */
  private calculateBufferCapacity(team: any): number {
    const totalCapacity = this.calculateTotalCapacity(team.members);
    return totalCapacity * (this.configuration.bufferPercentage / 100);
  }

  /**
   * Prioritize features using intelligent algorithms
   */
  private async prioritizeFeatures(
    features: FeatureAllocationRequest[]
  ): Promise<FeatureAllocationRequest[]> {
    if (!this.configuration.enableIntelligentAllocation) {
      // Simple priority-based sorting
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return [...features].sort((a, b) => {
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }

        return b.businessValue - a.businessValue; // Higher business value first
      });
    }

    // Use brain coordinator for intelligent prioritization
    const prioritization = await this.brainCoordinator.prioritizeFeatures({
      features,
      criteria: {
        businessValue: 0.4,
        priority: 0.3,
        complexity: 0.2,
        dependencies: 0.1,
      },
      constraints: {
        maxComplexity: 100,
        dependencyDepth: 3,
      },
    });

    return prioritization.orderedFeatures;
  }

  /**
   * Allocate feature to best-fit team using intelligent matching
   */
  private async allocateFeatureToTeam(
    feature: FeatureAllocationRequest,
    teamCapacities: TeamCapacity[],
    allocationStrategy: any,
    existingAllocations: TeamAllocation[]
  ): Promise<TeamAllocation | null> {
    this.logger.debug('Allocating feature to team', {'
      featureId: feature.featureId,
      complexity: feature.complexity,
      requiredSkills: feature.requiredSkills,
    });

    // Find best team match using load balancer
    const teamMatch = await this.loadBalancer.findBestMatch({
      workload: feature,
      resources: teamCapacities,
      existingAllocations,
      strategy: allocationStrategy,
      matchingCriteria: {
        skillMatch: this.configuration.enableSkillMatching
          ? this.configuration.skillMatchThreshold
          : 0,
        capacityThreshold: 0.8,
        utilizationTarget: this.configuration.utilizationTarget / 100,
      },
    });

    if (!teamMatch || teamMatch.confidence < 0.5) {
      return null;
    }

    const team = teamMatch.team;
    const allocationId = `alloc-${feature.featureId}-${team.teamId}-${Date.now()}`;`

    // Calculate skill matches
    const skillMatches = this.calculateSkillMatches(
      feature.requiredSkills,
      team.skills
    );

    // Assess allocation risks
    const risks = this.assessAllocationRisks(feature, team, skillMatches);

    // Create allocation
    const allocation: TeamAllocation = {
      allocationId,
      teamId: team.teamId,
      featureId: feature.featureId,
      capacityRequired: feature.complexity,
      capacityAllocated: teamMatch.allocatedCapacity,
      skills: skillMatches,
      confidence: teamMatch.confidence,
      risks,
      startIteration: teamMatch.startIteration || 1,
      endIteration:
        teamMatch.endIteration || 1 + Math.ceil(feature.complexity / team.velocity),
      dependencies: feature.dependencies,
    };

    this.logger.debug('Feature allocated successfully', {'
      featureId: feature.featureId,
      teamId: team.teamId,
      confidence: allocation.confidence,
      riskCount: risks.length,
    });

    return allocation;
  }

  /**
   * Calculate skill matches between feature requirements and team capabilities
   */
  private calculateSkillMatches(
    requiredSkills: string[],
    teamSkills: TeamSkill[]
  ): SkillMatch[] {
    const skillMatches: SkillMatch[] = [];

    for (const requiredSkill of requiredSkills) {
      const teamSkill = teamSkills.find(
        (s) => s.skillName.toLowerCase() === requiredSkill.toLowerCase()
      );

      if (teamSkill) {
        const match: SkillMatch = {
          skill: requiredSkill,
          required: true,
          proficiencyRequired: 'intermediate', // Default requirement'
          proficiencyAvailable: teamSkill.proficiency,
          memberCount: teamSkill.memberCount,
          matchQuality: this.evaluateSkillMatchQuality(
            'intermediate',
            teamSkill.proficiency,
            teamSkill.memberCount
          ),
        };
        skillMatches.push(match);
      } else {
        // Skill gap identified
        const match: SkillMatch = {
          skill: requiredSkill,
          required: true,
          proficiencyRequired: 'intermediate',
          proficiencyAvailable: 'basic', // Assume basic if not present'
          memberCount: 0,
          matchQuality: 'poor',
        };
        skillMatches.push(match);
      }
    }

    return skillMatches;
  }

  /**
   * Evaluate skill match quality
   */
  private evaluateSkillMatchQuality(
    required: string,
    available: string,
    memberCount: number
  ): 'perfect|good|adequate|poor'{'
    const proficiencyLevels = {
      basic: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    const requiredLevel =
      proficiencyLevels[required as keyof typeof proficiencyLevels] || 2;
    const availableLevel =
      proficiencyLevels[available as keyof typeof proficiencyLevels] || 1;

    if (memberCount === 0) return'poor;
    if (availableLevel >= requiredLevel + 1) return 'perfect;
    if (availableLevel >= requiredLevel)
      return memberCount >= 2 ? 'good' : 'adequate;
    if (availableLevel >= requiredLevel - 1) return 'adequate;
    return 'poor;
  }

  /**
   * Assess allocation risks
   */
  private assessAllocationRisks(
    feature: FeatureAllocationRequest,
    team: TeamCapacity,
    skillMatches: SkillMatch[]
  ): AllocationRisk[] {
    const risks: AllocationRisk[] = [];

    // Skill gap risks
    const poorSkillMatches = skillMatches.filter(
      (sm) => sm.matchQuality === 'poor''
    );
    if (poorSkillMatches.length > 0) {
      risks.push({
        riskType: 'skill',
        description: `Skill gaps identified: ${poorSkillMatches.map((sm) => sm.skill).join(', ')}`,`
        probability: 0.8,
        impact: 'high',
        mitigation: 'Cross-training or external expertise required',
        owner: `team-lead-${team.teamId}`,`
      });
    }

    // Capacity risk
    if (feature.complexity > team.availableCapacity * 0.8) {
      risks.push({
        riskType: 'capacity',
        description: 'Feature complexity exceeds comfortable team capacity',
        probability: 0.7,
        impact: 'medium',
        mitigation: 'Consider feature decomposition or timeline extension',
        owner: `team-lead-${team.teamId}`,`
      });
    }

    // Dependency risk
    if (feature.dependencies.length > 0) {
      risks.push({
        riskType: 'dependency',
        description: `Feature has ${feature.dependencies.length} dependencies`,`
        probability: 0.6,
        impact: feature.dependencies.length > 2 ? 'high' : 'medium',
        mitigation: 'Coordinate dependency resolution early in the PI',
        owner: `dependency-manager`,`
      });
    }

    return risks;
  }

  /**
   * Identify capacity risks across the entire planning result
   */
  private identifyCapacityRisks(
    teamCapacities: TeamCapacity[],
    allocations: TeamAllocation[],
    unallocatedFeatures: FeatureAllocationRequest[]
  ): CapacityRisk[] {
    const risks: CapacityRisk[] = [];

    // Overallocation risk
    const overallocatedTeams = teamCapacities.filter((team) => {
      const teamAllocations = allocations.filter(
        (a) => a.teamId === team.teamId
      );
      const totalAllocated = teamAllocations.reduce(
        (sum, a) => sum + a.capacityAllocated,
        0
      );
      return totalAllocated > team.availableCapacity * 0.9;
    });

    if (overallocatedTeams.length > 0) {
      risks.push({
        riskId: `overallocation-${Date.now()}`,`
        type: 'overallocation',
        description: `${overallocatedTeams.length} teams are overallocated`,`
        impact: 'High risk of delayed delivery and team burnout',
        mitigation: 'Rebalance workload or adjust scope',
        severity: 'high',
        affectedTeams: overallocatedTeams.map((t) => t.teamId),
        affectedFeatures: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      });
    }

    // Underutilization risk
    const underutilizedTeams = teamCapacities.filter((team) => {
      const teamAllocations = allocations.filter(
        (a) => a.teamId === team.teamId
      );
      const totalAllocated = teamAllocations.reduce(
        (sum, a) => sum + a.capacityAllocated,
        0
      );
      return totalAllocated < team.availableCapacity * 0.6;
    });

    if (underutilizedTeams.length > 0) {
      risks.push({
        riskId: `underutilization-${Date.now()}`,`
        type: 'underutilization',
        description: `${underutilizedTeams.length} teams are underutilized`,`
        impact:
          'Inefficient resource utilization and reduced delivery capacity',
        mitigation: 'Assign additional features or cross-train for other teams',
        severity: 'medium',
        affectedTeams: underutilizedTeams.map((t) => t.teamId),
        affectedFeatures: [],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      });
    }

    // Unallocated features risk
    if (unallocatedFeatures.length > 0) {
      const criticalUnallocated = unallocatedFeatures.filter(
        (f) => f.priority === 'critical' || f.priority ==='high''
      );

      if (criticalUnallocated.length > 0) {
        risks.push({
          riskId: `unallocated-critical-${Date.now()}`,`
          type: 'timeline',
          description: `${criticalUnallocated.length} critical/high priority features unallocated`,`
          impact: 'Business objectives may not be met',
          mitigation:
            'Increase capacity, reduce scope, or defer lower priority work',
          severity: 'critical',
          affectedTeams: [],
          affectedFeatures: criticalUnallocated.map((f) => f.featureId),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        });
      }
    }

    return risks;
  }

  /**
   * Generate intelligent capacity recommendations
   */
  private async generateCapacityRecommendations(
    planningResult: CapacityPlanningResult,
    teamCapacities: TeamCapacity[],
    allocationStrategy: any
  ): Promise<CapacityRecommendation[]> {
    const recommendations: CapacityRecommendation[] = [];

    // Use brain coordinator for intelligent recommendations
    const intelligentRecommendations =
      await this.brainCoordinator.generateRecommendations({
        planningResult,
        teamCapacities,
        allocationStrategy,
        context: {
          utilizationTarget: this.configuration.utilizationTarget,
          riskTolerance: 'medium',
          optimizationGoals: [
            'maximize_value',
            'balance_load',
            'minimize_risks',
          ],
        },
      });

    return intelligentRecommendations.recommendations || [];
  }

  /**
   * Calculate comprehensive capacity analytics
   */
  private calculateCapacityAnalytics(
    teamCapacities: TeamCapacity[],
    planningResult: CapacityPlanningResult
  ): CapacityAnalytics {
    const analytics: CapacityAnalytics = {
      totalTeams: teamCapacities.length,
      totalFeatures:
        planningResult.teamAllocations.length +
        planningResult.unallocatedFeatures.length,
      allocationSuccess:
        (planningResult.teamAllocations.length /
          (planningResult.teamAllocations.length +
            planningResult.unallocatedFeatures.length)) *
        100,
      averageUtilization: planningResult.utilizationRate * 100,
      skillCoverage: this.analyzeSkillCoverage(
        teamCapacities,
        planningResult.teamAllocations
      ),
      teamDistribution: this.analyzeTeamDistribution(
        teamCapacities,
        planningResult.teamAllocations
      ),
      riskDistribution: this.analyzeRiskDistribution(
        planningResult.capacityRisks
      ),
      forecastAccuracy: this.calculateForecastAccuracy(teamCapacities),
    };

    return analytics;
  }

  /**
   * Analyze skill coverage across teams
   */
  private analyzeSkillCoverage(
    teamCapacities: TeamCapacity[],
    allocations: TeamAllocation[]
  ): SkillCoverageAnalysis {
    const allSkills = new Set<string>();
    const skillTeamCount = new Map<string, number>();

    // Collect all skills across teams
    for (const team of teamCapacities) {
      for (const skill of team.skills) {
        allSkills.add(skill.skillName);
        skillTeamCount.set(
          skill.skillName,
          (skillTeamCount.get(skill.skillName) || 0) + 1
        );
      }
    }

    // Analyze skill distribution
    const skillGaps = Array.from(allSkills).filter(
      (skill) => skillTeamCount.get(skill) === 1
    );

    const overloadedSkills = Array.from(allSkills).filter((skill) => {
      const teamCount = skillTeamCount.get(skill) || 0;
      const demandsForSkill = allocations.filter((a) =>
        a.skills.some((s) => s.skill === skill)
      ).length;
      return demandsForSkill > teamCount * 2; // More than 2 features per skill per team
    });

    return {
      totalSkills: allSkills.size,
      coveredSkills: Array.from(skillTeamCount.keys()).length,
      skillGaps,
      overloadedSkills,
      crossTrainingOpportunities: skillGaps.slice(0, 5), // Top 5 opportunities
    };
  }

  /**
   * Analyze team distribution and balance
   */
  private analyzeTeamDistribution(
    teamCapacities: TeamCapacity[],
    allocations: TeamAllocation[]
  ): TeamDistributionAnalysis {
    const teamWorkloads = teamCapacities.map((team) => {
      const teamAllocations = allocations.filter(
        (a) => a.teamId === team.teamId
      );
      const totalWork = teamAllocations.reduce(
        (sum, a) => sum + a.capacityAllocated,
        0
      );
      const utilizationRate =
        team.availableCapacity > 0 ? totalWork / team.availableCapacity : 0;
      return { teamId: team.teamId, utilization: utilizationRate };
    });

    const averageUtilization =
      teamWorkloads.reduce((sum, t) => sum + t.utilization, 0) /
      teamWorkloads.length;
    const utilizationVariance =
      teamWorkloads.reduce(
        (sum, t) => sum + Math.pow(t.utilization - averageUtilization, 2),
        0
      ) / teamWorkloads.length;
    const evenness = Math.max(0, 1 - Math.sqrt(utilizationVariance));

    const outliers = teamWorkloads
      .filter((t) => Math.abs(t.utilization - averageUtilization) > 0.2)
      .map((t) => t.teamId);

    return {
      evenness,
      outliers,
      balanceRecommendations:
        outliers.length > 0
          ? [
              `Rebalance workload for ${outliers.length} teams with significant deviation`,`
            ]
          : ['Work distribution is well balanced'],
    };
  }

  /**
   * Analyze risk distribution
   */
  private analyzeRiskDistribution(
    risks: CapacityRisk[]
  ): RiskDistributionAnalysis {
    const risksByType = risks.reduce(
      (acc, risk) => {
        acc[risk.type] = (acc[risk.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const risksBySeverity = risks.reduce(
      (acc, risk) => {
        acc[risk.severity] = (acc[risk.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      risksByType,
      risksBySeverity,
      riskTrends: ['Capacity-related risks are primary concern'],
      mitigation: [
        'Implement proactive capacity monitoring',
        'Establish cross-training programs',
      ],
    };
  }

  /**
   * Calculate forecast accuracy based on historical data
   */
  private calculateForecastAccuracy(
    teamCapacities: TeamCapacity[]
  ): ForecastAccuracy {
    // In practice, this would analyze historical forecasting accuracy
    const avgCommitmentReliability =
      teamCapacities.reduce((sum, t) => sum + t.commitmentReliability, 0) /
      teamCapacities.length;

    return {
      historicalAccuracy: avgCommitmentReliability,
      confidenceLevel: avgCommitmentReliability * 0.9, // Slightly conservative
      uncertaintyFactors: [
        'New team members',
        'Changing requirements',
        'External dependencies',
        'Technical complexity',
      ],
      improvementAreas: [
        'Historical data collection',
        'Estimation training',
        'Velocity tracking',
        'Risk assessment',
      ],
    };
  }

  /**
   * Initialize empty analytics structure
   */
  private initializeAnalytics(): CapacityAnalytics {
    return {
      totalTeams: 0,
      totalFeatures: 0,
      allocationSuccess: 0,
      averageUtilization: 0,
      skillCoverage: {
        totalSkills: 0,
        coveredSkills: 0,
        skillGaps: [],
        overloadedSkills: [],
        crossTrainingOpportunities: [],
      },
      teamDistribution: {
        evenness: 0,
        outliers: [],
        balanceRecommendations: [],
      },
      riskDistribution: {
        risksByType: {},
        risksBySeverity: {},
        riskTrends: [],
        mitigation: [],
      },
      forecastAccuracy: {
        historicalAccuracy: 0,
        confidenceLevel: 0,
        uncertaintyFactors: [],
        improvementAreas: [],
      },
    };
  }

  /**
   * Create fallback implementations
   */
  private createLoadBalancerFallback() {
    return {
      createAllocationStrategy: (config: any) => {
        this.logger.debug('Allocation strategy created (fallback)');'
        return { strategy: 'simple_priority' };'
      },
      findBestMatch: (config: any) => {
        this.logger.debug('Best match found (fallback)', {'
          workloadId: config.workload.featureId,
        });
        return {
          team: config.resources[0],
          confidence: 0.7,
          allocatedCapacity: config.workload.complexity,
          startIteration: 1,
          endIteration: 3,
        };
      },
    };
  }

  private createBrainCoordinatorFallback() {
    return {
      analyzeCapacity: (config: any) => {
        this.logger.debug('Capacity analyzed (fallback)', {'
          teamId: config.team.id,
        });
        return {
          historicalVelocity: 30,
          commitmentReliability: 0.85,
          focusFactor: 0.7,
          confidence: 0.8,
        };
      },
      prioritizeFeatures: (config: any) => {
        this.logger.debug('Features prioritized (fallback)', {'
          featureCount: config.features.length,
        });
        return { orderedFeatures: config.features };
      },
      generateRecommendations: (config: any) => {
        this.logger.debug('Recommendations generated (fallback)');'
        return { recommendations: [] };
      },
    };
  }

  private createPerformanceTrackerFallback() {
    return {
      startTimer: (name: string) => {
        return { name, startTime: Date.now() };
      },
      endTimer: (name: string) => {
        this.logger.debug('Timer ended (fallback)', { name });'
      },
    };
  }

  private createFactSystemFallback() {
    return {
      storeFact: (fact: any) => {
        this.logger.debug('Fact stored (fallback)', { type: fact.type });'
      },
      getTeamHistory: (teamId: string) => {
        this.logger.debug('Team history retrieved (fallback)', { teamId });'
        return { velocity: [], capacity: [], reliability: [] };
      },
    };
  }
}
