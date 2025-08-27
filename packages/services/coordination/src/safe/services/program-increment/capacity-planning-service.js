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
// ============================================================================
// CAPACITY PLANNING SERVICE
// ============================================================================
/**
 * Capacity Planning Service for intelligent resource allocation and team optimization
 */
export class CapacityPlanningService extends EventBus {
    logger;
    teamCapacities = new Map();
    allocations = new Map();
    config;
    loadBalancer;
    brainCoordinator;
    performanceTracker;
    factSystem;
    initialized = false;
    constructor(logger, config = {}) {
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
    initialize() {
        if (this.initialized)
            return;
        try {
            // Initialize with fallback implementations
            this.loadBalancer = this.createLoadBalancerFallback();
            this.brainCoordinator = this.createBrainCoordinatorFallback();
            this.performanceTracker = this.createPerformanceTrackerFallback();
            this.factSystem = this.createFactSystemFallback();
            this.initialized = true;
            this.logger.info('Capacity Planning Service initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize Capacity Planning Service:', error);
            throw error;
        }
    }
    /**
     * Calculate comprehensive team capacities with intelligent analysis
     */
    async calculateTeamCapacities(teams) {
        if (!this.initialized)
            this.initialize();
        this.logger.info('Calculating team capacities', { ': teamCount, teams, : .length,
        });
        const _timer = this.performanceTracker.startTimer('capacity_calculation');
        ';
        try {
            const capacities = [];
            for (const team of teams) {
                // Use brain coordinator for intelligent capacity analysis
                const capacityAnalysis = await this.brainCoordinator.analyzeCapacity({
                    team,
                    historicalData: await this.factSystem.getTeamHistory(team.id),
                    configuration: this.config,
                });
                const teamCapacity = {
                    teamId: team.id,
                    teamName: team.name,
                    totalCapacity: this.calculateTotalCapacity(team.members),
                    availableCapacity: this.calculateAvailableCapacity(team.members, capacityAnalysis),
                    velocity: capacityAnalysis.historicalVelocity || this.estimateVelocity(team),
                    members: this.processTeamMembers(team.members),
                    skills: this.analyzeTeamSkills(team.members),
                    commitmentReliability: capacityAnalysis.commitmentReliability || 0.85,
                    focusFactor: capacityAnalysis.focusFactor || 0.7,
                    innovationCapacity: this.calculateInnovationCapacity(team),
                    bufferCapacity: this.calculateBufferCapacity(team),
                };
                // Store capacity facts for future analysis
                await this.factSystem.storeFact({
                    type: 'team_capacity',
                    entity: team.id,
                    properties: {
                        totalCapacity: teamCapacity.totalCapacity,
                        availableCapacity: teamCapacity.availableCapacity,
                        velocity: teamCapacity.velocity,
                        memberCount: teamCapacity.members.length,
                        skillCount: teamCapacity.skills.length,
                    },
                    confidence: capacityAnalysis.confidence || 0.8,
                    source: 'capacity-planning-service',
                });
                capacities.push(teamCapacity);
                this.teamCapacities.set(team.id, teamCapacity);
            }
            this.performanceTracker.endTimer('capacity_calculation');
            ';
            this.emit('team-capacities-calculated', ', teamCount, capacities.length, totalCapacity, capacities.reduce((sum, c) => sum + c.totalCapacity, 0), averageVelocity, capacities.reduce((sum, c) => sum + c.velocity, 0) /
                capacities.length);
            this.logger.info('Team capacities calculated successfully', { ': teamCount, capacities, : .length,
                totalCapacity: capacities.reduce((sum, c) => sum + c.totalCapacity, 0),
            });
            return capacities;
        }
        catch (error) {
            this.performanceTracker.endTimer('capacity_calculation');
            ';
            this.logger.error('Team capacity calculation failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Implement intelligent capacity planning and feature allocation
     */
    async implementCapacityPlanning(teamCapacities, features) {
        if (!this.initialized)
            this.initialize();
        this.logger.info('Implementing capacity planning', { ': teamCount, teamCapacities, : .length,
            featureCount: features.length,
        });
        const _timer = this.performanceTracker.startTimer('capacity_planning');
        ';
        try {
            // Initialize planning result
            const planningResult = {
                totalCapacity: teamCapacities.reduce((sum, t) => sum + t.totalCapacity, 0),
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
            planningResult.bufferCapacity = teamCapacities.reduce((sum, t) => sum + t.bufferCapacity, 0);
            planningResult.innovationCapacity = teamCapacities.reduce((sum, t) => sum + t.innovationCapacity, 0);
            // Sort features by priority and business value for intelligent allocation
            const prioritizedFeatures = await this.prioritizeFeatures(features);
            // Use load balancer for intelligent allocation
            const allocationStrategy = await this.loadBalancer.createAllocationStrategy({
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
                const allocation = await this.allocateFeatureToTeam(feature, teamCapacities, allocationStrategy, planningResult.teamAllocations);
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
                }
                else {
                    planningResult.unallocatedFeatures.push(feature);
                    this.logger.warn('Feature allocation failed', { ': featureId, feature, : .featureId,
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
            planningResult.capacityRisks = this.identifyCapacityRisks(teamCapacities, planningResult.teamAllocations, planningResult.unallocatedFeatures);
            // Generate intelligent recommendations
            planningResult.recommendations =
                await this.generateCapacityRecommendations(planningResult, teamCapacities, allocationStrategy);
            // Calculate comprehensive analytics
            planningResult.analytics = this.calculateCapacityAnalytics(teamCapacities, planningResult);
            this.performanceTracker.endTimer('capacity_planning');
            ';
            this.emit('capacity-planning-completed', ', allocatedFeatures, planningResult.teamAllocations.length, unallocatedFeatures, planningResult.unallocatedFeatures.length, utilizationRate, planningResult.utilizationRate, riskCount, planningResult.capacityRisks.length, recommendationCount, planningResult.recommendations.length);
            this.logger.info('Capacity planning completed successfully', { ': allocatedFeatures, planningResult, : .teamAllocations.length,
                utilizationRate: Math.round(planningResult.utilizationRate * 100),
            });
            return planningResult;
        }
        catch (error) {
            this.performanceTracker.endTimer('capacity_planning');
            ';
            this.logger.error('Capacity planning implementation failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Get team capacity by ID
     */
    getTeamCapacity(teamId) {
        return this.teamCapacities.get(teamId);
    }
    /**
     * Get all team capacities
     */
    getAllTeamCapacities() {
        return Array.from(this.teamCapacities.values())();
    }
    /**
     * Get allocation by ID
     */
    getAllocation(allocationId) {
        return this.allocations.get(allocationId);
    }
    /**
     * Get all allocations
     */
    getAllAllocations() {
        return Array.from(this.allocations.values())();
    }
    /**
     * Get allocations by team
     */
    getAllocationsByTeam(teamId) {
        return Array.from(this.allocations.values()).filter((a) => a.teamId === teamId);
    }
    /**
     * Shutdown the service
     */
    shutdown() {
        this.logger.info('Shutting down Capacity Planning Service');
        ';
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
    calculateTotalCapacity(members) {
        return members.reduce((total, member) => {
            const baseCapacity = member.hoursPerWeek || 40;
            const availability = member.availability || 1.0;
            return total + baseCapacity * availability;
        }, 0);
    }
    /**
     * Calculate available capacity after accounting for overhead
     */
    calculateAvailableCapacity(members, analysis) {
        const totalCapacity = this.calculateTotalCapacity(members);
        const focusFactor = analysis.focusFactor || 0.7;
        return totalCapacity * focusFactor;
    }
    /**
     * Estimate team velocity based on capacity and historical data
     */
    estimateVelocity(team) {
        // In practice, this would use historical data
        const baseVelocity = team.members.length * 8; // 8 story points per person per iteration
        const experienceMultiplier = this.calculateExperienceMultiplier(team.members);
        return baseVelocity * experienceMultiplier;
    }
    /**
     * Calculate experience multiplier based on team member experience
     */
    calculateExperienceMultiplier(members) {
        const experienceWeights = {
            junior: 0.7,
            mid: 1.0,
            senior: 1.3,
            expert: 1.5,
        };
        const avgExperience = members.reduce((sum, member) => {
            return (sum +
                (experienceWeights[member.experience] || 1.0));
        }, 0) / members.length;
        return avgExperience;
    }
    /**
     * Process team members into structured format
     */
    processTeamMembers(members) {
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
    analyzeTeamSkills(members) {
        const skillMap = new Map();
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
                const skillInfo = skillMap.get(skill.name);
                skillInfo.count++;
                skillInfo.capacity += member.hoursPerWeek * member.availability || 40;
                skillInfo.proficiencies.push(skill.proficiency || 'intermediate');
                ';
            }
        }
        // Convert to TeamSkill format
        const teamSkills = [];
        for (const [skillName, info] of skillMap) {
            const avgProficiency = this.calculateAverageProficiency(info.proficiencies);
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
    calculateAverageProficiency(proficiencies) {
        ';
        const proficiencyValues = {
            basic: 1,
            intermediate: 2,
            advanced: 3,
            expert: 4,
        };
        const avgValue = proficiencies.reduce((sum, prof) => {
            return (sum + (proficiencyValues[prof] || 2));
        }, 0) / proficiencies.length;
        if (avgValue >= 3.5)
            return 'expert;;
        if (avgValue >= 2.5)
            return 'advanced;;
        if (avgValue >= 1.5)
            return 'intermediate;;
        return 'basic;;
    }
    /**
     * Calculate innovation capacity (reserved for innovation work)
     */
    calculateInnovationCapacity(team) {
        const totalCapacity = this.calculateTotalCapacity(team.members);
        return totalCapacity * (this.configuration.innovationPercentage / 100);
    }
    /**
     * Calculate buffer capacity (reserved for risks and issues)
     */
    calculateBufferCapacity(team) {
        const totalCapacity = this.calculateTotalCapacity(team.members);
        return totalCapacity * (this.configuration.bufferPercentage / 100);
    }
    /**
     * Prioritize features using intelligent algorithms
     */
    async prioritizeFeatures(features) {
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
    async allocateFeatureToTeam(feature, teamCapacities, allocationStrategy, existingAllocations) {
        this.logger.debug('Allocating feature to team', { ': featureId, feature, : .featureId,
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
        const _allocationId = `alloc-${feature.featureId}-${team.teamId}-${Date.now()}`;
        `

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
        description: `;
        Skill;
        gaps;
        identified: $poorSkillMatches.map((sm) => sm.skill).join(', ') `,`;
        probability: 0.8,
            impact;
        'high',
            mitigation;
        'Cross-training or external expertise required',
            owner;
        `team-lead-$team.teamId`, `
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
        owner: `;
        team - lead - $;
        {
            team.teamId;
        }
        `,`;
    }
    ;
}
// Dependency risk
if (feature.dependencies.length > 0) {
    risks.push({
        riskType: 'dependency',
        description: `Feature has ${feature.dependencies.length} dependencies`,
    } `
        probability: 0.6,
        impact: feature.dependencies.length > 2 ? 'high' : 'medium',
        mitigation: 'Coordinate dependency resolution early in the PI',
        owner: `, dependency - manager `,`);
}
;
return risks;
identifyCapacityRisks(teamCapacities, TeamCapacity[], allocations, TeamAllocation[], unallocatedFeatures, FeatureAllocationRequest[]);
CapacityRisk[];
{
    const risks = [];
    // Overallocation risk
    const overallocatedTeams = teamCapacities.filter((team) => {
        const teamAllocations = allocations.filter((a) => a.teamId === team.teamId);
        const totalAllocated = teamAllocations.reduce((sum, a) => sum + a.capacityAllocated, 0);
        return totalAllocated > team.availableCapacity * 0.9;
    });
    if (overallocatedTeams.length > 0) {
        risks.push({
            riskId: `overallocation-${Date.now()}`,
        } `
        type: 'overallocation',
        description: `, $, { overallocatedTeams, : .length }, teams, are, overallocated `,`, impact, 'High risk of delayed delivery and team burnout', mitigation, 'Rebalance workload or adjust scope', severity, 'high', affectedTeams, overallocatedTeams.map((t) => t.teamId), affectedFeatures, [], dueDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week
    }
    ;
}
// Underutilization risk
const underutilizedTeams = teamCapacities.filter((team) => {
    const teamAllocations = allocations.filter((a) => a.teamId === team.teamId);
    const totalAllocated = teamAllocations.reduce((sum, a) => sum + a.capacityAllocated, 0);
    return totalAllocated < team.availableCapacity * 0.6;
});
if (underutilizedTeams.length > 0) {
    risks.push({
        riskId: `underutilization-${Date.now()}`,
    } `
        type: 'underutilization',
        description: `, $, { underutilizedTeams, : .length }, teams, are, underutilized `,`, impact, 'Inefficient resource utilization and reduced delivery capacity', mitigation, 'Assign additional features or cross-train for other teams', severity, 'medium', affectedTeams, underutilizedTeams.map((t) => t.teamId), affectedFeatures, [], dueDate, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // 2 weeks
}
;
// Unallocated features risk
if (unallocatedFeatures.length > 0) {
    const criticalUnallocated = unallocatedFeatures.filter((f) => f.priority === 'critical' || f.priority === 'high', ');
    if (criticalUnallocated.length > 0) {
        risks.push({
            riskId: `unallocated-critical-${Date.now()}`,
        } `
          type: 'timeline',
          description: `, $, { criticalUnallocated, : .length }, critical / high, priority, features, unallocated `,`, impact, 'Business objectives may not be met', mitigation, 'Increase capacity, reduce scope, or defer lower priority work', severity, 'critical', affectedTeams, [], affectedFeatures, criticalUnallocated.map((f) => f.featureId), dueDate, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days
    }
    ;
}
return risks;
async;
generateCapacityRecommendations(planningResult, CapacityPlanningResult, teamCapacities, TeamCapacity[], allocationStrategy, any);
Promise < CapacityRecommendation[] > {
    const: _recommendations, CapacityRecommendation, []:  = [],
    // Use brain coordinator for intelligent recommendations
    const: intelligentRecommendations =
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
        }),
    return: intelligentRecommendations.recommendations || []
};
calculateCapacityAnalytics(teamCapacities, TeamCapacity[], planningResult, CapacityPlanningResult);
CapacityAnalytics;
{
    const analytics = {
        totalTeams: teamCapacities.length,
        totalFeatures: planningResult.teamAllocations.length +
            planningResult.unallocatedFeatures.length,
        allocationSuccess: (planningResult.teamAllocations.length /
            (planningResult.teamAllocations.length +
                planningResult.unallocatedFeatures.length)) *
            100,
        averageUtilization: planningResult.utilizationRate * 100,
        skillCoverage: this.analyzeSkillCoverage(teamCapacities, planningResult.teamAllocations),
        teamDistribution: this.analyzeTeamDistribution(teamCapacities, planningResult.teamAllocations),
        riskDistribution: this.analyzeRiskDistribution(planningResult.capacityRisks),
        forecastAccuracy: this.calculateForecastAccuracy(teamCapacities),
    };
    return analytics;
}
analyzeSkillCoverage(teamCapacities, TeamCapacity[], allocations, TeamAllocation[]);
SkillCoverageAnalysis;
{
    const allSkills = new Set();
    const skillTeamCount = new Map();
    // Collect all skills across teams
    for (const team of teamCapacities) {
        for (const skill of team.skills) {
            allSkills.add(skill.skillName);
            skillTeamCount.set(skill.skillName, (skillTeamCount.get(skill.skillName) || 0) + 1);
        }
    }
    // Analyze skill distribution
    const skillGaps = Array.from(allSkills).filter((skill) => skillTeamCount.get(skill) === 1);
    const overloadedSkills = Array.from(allSkills).filter((skill) => {
        const teamCount = skillTeamCount.get(skill) || 0;
        const demandsForSkill = allocations.filter((a) => a.skills.some((s) => s.skill === skill)).length;
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
analyzeTeamDistribution(teamCapacities, TeamCapacity[], allocations, TeamAllocation[]);
TeamDistributionAnalysis;
{
    const teamWorkloads = teamCapacities.map((team) => {
        const teamAllocations = allocations.filter((a) => a.teamId === team.teamId);
        const totalWork = teamAllocations.reduce((sum, a) => sum + a.capacityAllocated, 0);
        const utilizationRate = team.availableCapacity > 0 ? totalWork / team.availableCapacity : 0;
        return { teamId: team.teamId, utilization: utilizationRate };
    });
    const averageUtilization = teamWorkloads.reduce((sum, t) => sum + t.utilization, 0) /
        teamWorkloads.length;
    const utilizationVariance = teamWorkloads.reduce((sum, t) => sum + (t.utilization - averageUtilization) ** 2, 0) / teamWorkloads.length;
    const evenness = Math.max(0, 1 - Math.sqrt(utilizationVariance));
    const outliers = teamWorkloads
        .filter((t) => Math.abs(t.utilization - averageUtilization) > 0.2)
        .map((t) => t.teamId);
    return {
        evenness,
        outliers,
        balanceRecommendations: outliers.length > 0
            ? [
                `Rebalance workload for ${outliers.length} teams with significant deviation`, `
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
            ] : 
    };
}
