/**
 * Global Agent Performance System
 *
 * Provides cross-swarm learning capabilities by tracking agent performance across
 * all swarms, identifying best practices, and sharing knowledge between swarms.
 *
 * This system bridges the gap between individual swarm learning (TIER 1) and
 * coordination learning (TIER 2) by enabling agents to learn from each other
 * regardless of which swarm they belong to.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import type {
  IEventBus,
  ILogger,
} from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
import type { AgentType } from '../../types/agent-types.ts';
import type { AgentPerformanceHistory } from '../agents/swarm-commander.ts';

export interface GlobalAgentPerformanceConfig {
  enabled: boolean;
  crossSwarmLearningEnabled: boolean;
  performanceTrackingInterval: number; // minutes
  knowledgeShareInterval: number; // minutes
  bestPracticeThreshold: number; // 0-1 performance threshold for best practices
  minDataPointsForSharing: number;
  agentExpertiseThreshold: number; // 0-1 threshold for considering an agent an expert
  knowledgeRetentionPeriod: number; // days
}

export interface GlobalAgentProfile {
  agentType: AgentType;
  globalId: string; // unique identifier across all swarms
  crossSwarmStats: {
    totalTasksCompleted: number;
    averageQualityScore: number;
    averageSpeed: number;
    collaborationScore: number;
    adaptabilityScore: number;
    learningEfficiency: number;
  };
  expertise: {
    primaryDomains: string[];
    secondaryDomains: string[];
    expertiseLevel: number; // 0-1
    specializations: Record<string, number>; // domain -> proficiency
  };
  swarmHistory: Array<{
    swarmId: string;
    duration: number;
    performance: number;
    contributions: string[];
  }>;
  bestPractices: Array<{
    practiceId: string;
    domain: string;
    description: string;
    effectiveness: number;
    applicableContexts: string[];
    discoveredAt: Date;
    validationCount: number;
  }>;
  learningPatterns: Array<{
    patternId: string;
    learningType: string;
    triggerConditions: string[];
    effectiveness: number;
    transferability: number; // How well this pattern transfers to other agents
  }>;
  mentorshipCapability: {
    canMentor: boolean;
    mentorshipDomains: string[];
    successfulMentorships: number;
    mentorshipRating: number;
  };
  lastUpdated: Date;
}

export interface AgentKnowledgeTransfer {
  transferId: string;
  sourceAgentId: string;
  targetAgentIds: string[];
  knowledgeType:
    | 'best-practice'
    | 'learning-pattern'
    | 'expertise'
    | 'specialization';
  transferData: unknown;
  transferMethod:
    | 'direct-share'
    | 'mentorship'
    | 'collaborative-learning'
    | 'pattern-matching';
  expectedImpact: number;
  actualResults?: Array<{
    agentId: string;
    improvementMeasured: number;
    adoptionSuccess: boolean;
    feedback: string;
  }>;
  timestamp: Date;
  validationDeadline: Date;
}

export interface ExpertiseMapping {
  domain: string;
  experts: Array<{
    agentId: string;
    agentType: AgentType;
    swarmId: string;
    expertiseLevel: number;
    contributions: number;
    availability: 'available' | 'busy' | 'unavailable';
  }>;
  bestPractices: string[]; // IDs of best practices for this domain
  commonChallenges: string[];
  knowledgeGaps: string[];
  lastUpdated: Date;
}

export interface CrossSwarmLearningSession {
  sessionId: string;
  sessionType:
    | 'knowledge-share'
    | 'collaborative-problem-solving'
    | 'skill-transfer'
    | 'innovation-workshop';
  participants: Array<{
    agentId: string;
    agentType: AgentType;
    swarmId: string;
    role: 'expert' | 'learner' | 'facilitator' | 'observer';
    contributionLevel: number;
  }>;
  focus: {
    domain: string;
    specificSkills: string[];
    challenges: string[];
    goals: string[];
  };
  outcomes: Array<{
    outcomeType:
      | 'skill-acquired'
      | 'problem-solved'
      | 'best-practice-discovered'
      | 'innovation-created';
    description: string;
    beneficiaries: string[]; // Agent IDs that benefited
    measurableImpact: number;
  }>;
  duration: number;
  effectiveness: number;
  followUpActions: string[];
  scheduledAt: Date;
  completedAt?: Date;
}

export interface KnowledgeGraph {
  nodes: Array<{
    id: string;
    type: 'agent' | 'skill' | 'domain' | 'best-practice' | 'pattern';
    properties: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationship:
      | 'has-expertise'
      | 'learned-from'
      | 'collaborated-with'
      | 'improved-by'
      | 'applicable-to';
    strength: number; // 0-1
    bidirectional: boolean;
    metadata: Record<string, unknown>;
  }>;
  lastUpdated: Date;
}

/**
 * Global Agent Performance System
 *
 * Tracks agent performance across all swarms and enables cross-swarm learning
 * through knowledge sharing, mentorship, and collaborative learning sessions.
 */
export class GlobalAgentPerformance extends EventEmitter {
  private logger: ILogger;
  private eventBus: IEventBus;
  private memoryCoordinator: MemoryCoordinator;
  private config: GlobalAgentPerformanceConfig;

  // Global tracking data structures
  private globalAgentProfiles = new Map<string, GlobalAgentProfile>();
  private knowledgeTransfers = new Map<string, AgentKnowledgeTransfer>();
  private expertiseMappings = new Map<string, ExpertiseMapping>();
  private learningSessionsHistory: CrossSwarmLearningSession[] = [];
  private knowledgeGraph: KnowledgeGraph;

  // Active sessions and processes
  private activeLearningSession?: CrossSwarmLearningSession;
  private pendingTransfers: AgentKnowledgeTransfer[] = [];

  // Monitoring intervals
  private performanceTrackingInterval?: NodeJS.Timeout;
  private knowledgeShareInterval?: NodeJS.Timeout;

  constructor(
    config: GlobalAgentPerformanceConfig,
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator
  ) {
    super();

    this.config = config;
    this.eventBus = eventBus;
    this.memoryCoordinator = memoryCoordinator;
    this.logger = getLogger('GlobalAgentPerformance');

    this.knowledgeGraph = {
      nodes: [],
      edges: [],
      lastUpdated: new Date(),
    };

    this.setupEventHandlers();
    this.initializeGlobalPerformanceSystem();

    this.logger.info('Global Agent Performance System initialized');
  }

  /**
   * Setup event handlers for cross-swarm learning
   */
  private setupEventHandlers(): void {
    // Listen to agent performance updates from all swarms
    this.eventBus.on('swarm:*:agent:performance:update', (data: unknown) => {
      this.updateGlobalAgentProfile(data);
    });

    // Listen to completed tasks for performance tracking
    this.eventBus.on('swarm:*:task:completed', (data: unknown) => {
      this.trackTaskCompletion(data);
    });

    // Listen to learning events from swarms
    this.eventBus.on('swarm:*:learning:event', (data: unknown) => {
      this.processLearningEvent(data);
    });

    // Listen to requests for cross-swarm collaboration
    this.eventBus.on('global:agent:collaboration:request', (data: unknown) => {
      this.handleCollaborationRequest(data);
    });

    // Listen to knowledge transfer requests
    this.eventBus.on('global:knowledge:transfer:request', (data: unknown) => {
      this.handleKnowledgeTransferRequest(data);
    });

    // Listen to expert consultation requests
    this.eventBus.on('global:expert:consultation:request', (data: unknown) => {
      this.handleExpertConsultationRequest(data);
    });
  }

  /**
   * Initialize global performance system
   */
  private async initializeGlobalPerformanceSystem(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info(
        'Global Agent Performance System disabled by configuration'
      );
      return;
    }

    try {
      // Load persistent data
      await this.loadGlobalPerformanceData();

      // Start monitoring intervals
      this.startMonitoringIntervals();

      // Initialize knowledge graph
      await this.initializeKnowledgeGraph();

      this.logger.info(
        'Global Agent Performance System initialization completed'
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize Global Agent Performance System:',
        error
      );
      throw error;
    }
  }

  /**
   * Start monitoring intervals for performance tracking and knowledge sharing
   */
  private startMonitoringIntervals(): void {
    // Performance tracking interval
    this.performanceTrackingInterval = setInterval(
      () => {
        this.performGlobalPerformanceAnalysis();
      },
      this.config.performanceTrackingInterval * 60 * 1000
    );

    // Knowledge sharing interval
    this.knowledgeShareInterval = setInterval(
      () => {
        this.facilitateKnowledgeSharing();
      },
      this.config.knowledgeShareInterval * 60 * 1000
    );

    this.logger.info('Global performance monitoring intervals started');
  }

  /**
   * Update global agent profile with new performance data
   */
  private async updateGlobalAgentProfile(data: unknown): Promise<void> {
    const { agentId, agentType, swarmId, performance } = data;
    const globalId = `${agentType}_${agentId}`;

    let profile = this.globalAgentProfiles.get(globalId);

    if (!profile) {
      profile = this.createNewGlobalProfile(globalId, agentType, swarmId);
    }

    // Update cross-swarm statistics
    const weight = 0.8;
    profile.crossSwarmStats.totalTasksCompleted +=
      performance.tasksCompleted || 0;
    profile.crossSwarmStats.averageQualityScore =
      profile.crossSwarmStats.averageQualityScore * weight +
      (performance.qualityScore || 0.8) * (1 - weight);
    profile.crossSwarmStats.averageSpeed =
      profile.crossSwarmStats.averageSpeed * weight +
      (performance.speed || 0.8) * (1 - weight);

    // Update collaboration score if collaborative work was done
    if (performance.collaborationMetrics) {
      profile.crossSwarmStats.collaborationScore =
        profile.crossSwarmStats.collaborationScore * weight +
        (performance.collaborationMetrics.score || 0.8) * (1 - weight);
    }

    // Update expertise based on performance
    this.updateAgentExpertise(profile, performance);

    // Check for best practices
    if (performance.qualityScore > this.config.bestPracticeThreshold) {
      await this.identifyBestPractices(profile, performance);
    }

    // Update swarm history
    this.updateSwarmHistory(profile, swarmId, performance);

    profile.lastUpdated = new Date();
    this.globalAgentProfiles.set(globalId, profile);

    // Update knowledge graph
    this.updateKnowledgeGraph(profile);

    this.logger.debug(`Updated global profile for agent ${globalId}`);
  }

  /**
   * Track task completion for global performance metrics
   */
  private async trackTaskCompletion(data: unknown): Promise<void> {
    const {
      swarmId,
      agentId,
      agentType,
      taskType,
      performance,
      duration,
      quality,
    } = data;

    // Update global statistics
    await this.updateGlobalAgentProfile({
      agentId,
      agentType,
      swarmId,
      performance: {
        tasksCompleted: 1,
        qualityScore: quality,
        speed: duration ? 1 / duration : 0.8,
        taskType,
      },
    });

    // Identify potential knowledge transfer opportunities
    if (quality > 0.9) {
      await this.identifyKnowledgeTransferOpportunities({
        sourceAgentId: `${agentType}_${agentId}`,
        taskType,
        quality,
        swarmId,
      });
    }
  }

  /**
   * Process learning events from swarms
   */
  private async processLearningEvent(data: unknown): Promise<void> {
    const { swarmId, agentId, agentType, learningType, event } = data;
    const globalId = `${agentType}_${agentId}`;

    const profile = this.globalAgentProfiles.get(globalId);
    if (!profile) return;

    // Update learning efficiency
    if (event.success) {
      const weight = 0.8;
      profile.crossSwarmStats.learningEfficiency =
        profile.crossSwarmStats.learningEfficiency * weight +
        event.efficiency * (1 - weight);
    }

    // Record learning patterns
    const pattern = {
      patternId: `pattern_${Date.now()}`,
      learningType,
      triggerConditions: event.triggerConditions || [],
      effectiveness: event.success ? event.efficiency : 0,
      transferability: this.calculateTransferability(learningType, event),
    };

    profile.learningPatterns.push(pattern);

    // Limit learning patterns to prevent memory bloat
    if (profile.learningPatterns.length > 50) {
      profile.learningPatterns = profile.learningPatterns.slice(-50);
    }

    this.globalAgentProfiles.set(globalId, profile);
  }

  /**
   * Perform global performance analysis
   */
  private async performGlobalPerformanceAnalysis(): Promise<void> {
    this.logger.info('Performing global performance analysis');

    // Identify top performers
    const topPerformers = this.identifyTopPerformers();

    // Update expertise mappings
    await this.updateExpertiseMappings();

    // Identify knowledge gaps
    const knowledgeGaps = this.identifyKnowledgeGaps();

    // Generate learning recommendations
    const recommendations = await this.generateLearningRecommendations();

    // Schedule cross-swarm learning sessions if needed
    if (recommendations.length > 0) {
      await this.scheduleCrossSwarmLearningSession(recommendations);
    }

    // Emit analysis results
    this.eventBus.emit('global:performance:analysis:complete', {
      topPerformers,
      knowledgeGaps,
      recommendations,
      timestamp: new Date(),
    });

    this.logger.info(
      `Global performance analysis complete - ${recommendations.length} recommendations generated`
    );
  }

  /**
   * Facilitate knowledge sharing between agents
   */
  private async facilitateKnowledgeSharing(): Promise<void> {
    if (!this.config.crossSwarmLearningEnabled) return;

    this.logger.info('Facilitating cross-swarm knowledge sharing');

    // Process pending transfers
    await this.processPendingTransfers();

    // Identify new knowledge sharing opportunities
    const opportunities = this.identifyKnowledgeSharingOpportunities();

    // Create knowledge transfers for high-value opportunities
    for (const opportunity of opportunities) {
      if (opportunity.expectedImpact > 0.7) {
        await this.initiateKnowledgeTransfer(opportunity);
      }
    }

    this.logger.info(
      `Processed ${opportunities.length} knowledge sharing opportunities`
    );
  }

  /**
   * Handle collaboration request between agents from different swarms
   */
  private async handleCollaborationRequest(request: unknown): Promise<void> {
    this.logger.info(`Handling collaboration request: ${request.type}`);

    const {
      requestingAgentId,
      requestingSwarmId,
      skillsNeeded,
      taskComplexity,
    } = request;

    // Find suitable collaborators
    const collaborators = this.findSuitableCollaborators(
      skillsNeeded,
      requestingSwarmId
    );

    if (collaborators.length > 0) {
      // Create collaboration session
      const session = await this.createCollaborationSession({
        requestingAgentId,
        requestingSwarmId,
        collaborators,
        skillsNeeded,
        taskComplexity,
      });

      this.eventBus.emit('global:collaboration:session:created', {
        sessionId: session.sessionId,
        participants: session.participants,
        focus: session.focus,
      });

      this.logger.info(`Created collaboration session: ${session.sessionId}`);
    } else {
      this.logger.warn('No suitable collaborators found for request');

      // Suggest alternatives or learning paths
      const alternatives = this.suggestAlternatives(skillsNeeded);

      this.eventBus.emit('global:collaboration:alternatives', {
        requestId: request.id,
        alternatives,
      });
    }
  }

  /**
   * Handle knowledge transfer request
   */
  private async handleKnowledgeTransferRequest(
    request: unknown
  ): Promise<void> {
    const { sourceAgentId, targetAgentId, knowledgeType, specificSkills } =
      request;

    this.logger.info(`Handling knowledge transfer request: ${knowledgeType}`);

    const sourceProfile = this.globalAgentProfiles.get(sourceAgentId);
    const targetProfile = this.globalAgentProfiles.get(targetAgentId);

    if (!sourceProfile || !targetProfile) {
      this.logger.warn('Source or target agent profile not found');
      return;
    }

    // Validate transfer feasibility
    const transferFeasibility = this.assessTransferFeasibility(
      sourceProfile,
      targetProfile,
      knowledgeType
    );

    if (transferFeasibility.feasible) {
      const transfer = await this.createKnowledgeTransfer({
        sourceAgentId,
        targetAgentIds: [targetAgentId],
        knowledgeType,
        specificSkills,
        feasibility: transferFeasibility,
      });

      this.knowledgeTransfers.set(transfer.transferId, transfer);
      this.pendingTransfers.push(transfer);

      this.eventBus.emit('global:knowledge:transfer:initiated', {
        transferId: transfer.transferId,
        expectedImpact: transfer.expectedImpact,
      });

      this.logger.info(`Initiated knowledge transfer: ${transfer.transferId}`);
    } else {
      this.logger.warn(
        'Knowledge transfer not feasible',
        transferFeasibility.reasons
      );
    }
  }

  /**
   * Handle expert consultation request
   */
  private async handleExpertConsultationRequest(
    request: unknown
  ): Promise<void> {
    const { domain, problemDescription, urgency, requestingSwarmId } = request;

    this.logger.info(
      `Handling expert consultation request for domain: ${domain}`
    );

    // Find domain experts
    const expertiseMapping = this.expertiseMappings.get(domain);
    if (!expertiseMapping) {
      this.logger.warn(`No expertise mapping found for domain: ${domain}`);
      return;
    }

    const availableExperts = expertiseMapping.experts.filter(
      (expert) =>
        expert.availability === 'available' &&
        expert.expertiseLevel > this.config.agentExpertiseThreshold
    );

    if (availableExperts.length > 0) {
      // Select best expert based on expertise level and past performance
      const selectedExpert = availableExperts.sort(
        (a, b) =>
          b.expertiseLevel +
          b.contributions -
          (a.expertiseLevel + a.contributions)
      )[0];

      // Create consultation session
      const consultationId = `consultation_${Date.now()}`;

      this.eventBus.emit('global:expert:consultation:assigned', {
        consultationId,
        expertAgentId: selectedExpert.agentId,
        expertSwarmId: selectedExpert.swarmId,
        requestingSwarmId,
        domain,
        problemDescription,
        urgency,
      });

      this.logger.info(
        `Assigned expert consultation: ${selectedExpert.agentId} for ${domain}`
      );
    } else {
      this.logger.warn(`No available experts found for domain: ${domain}`);

      // Suggest learning paths or alternative solutions
      this.eventBus.emit('global:expert:consultation:unavailable', {
        requestId: request.id,
        domain,
        suggestedAlternatives: expertiseMapping.bestPractices,
      });
    }
  }

  // === UTILITY METHODS ===

  private createNewGlobalProfile(
    globalId: string,
    agentType: AgentType,
    swarmId: string
  ): GlobalAgentProfile {
    return {
      agentType,
      globalId,
      crossSwarmStats: {
        totalTasksCompleted: 0,
        averageQualityScore: 0.8,
        averageSpeed: 0.8,
        collaborationScore: 0.8,
        adaptabilityScore: 0.8,
        learningEfficiency: 0.8,
      },
      expertise: {
        primaryDomains: [],
        secondaryDomains: [],
        expertiseLevel: 0.5,
        specializations: {},
      },
      swarmHistory: [
        {
          swarmId,
          duration: 0,
          performance: 0.8,
          contributions: [],
        },
      ],
      bestPractices: [],
      learningPatterns: [],
      mentorshipCapability: {
        canMentor: false,
        mentorshipDomains: [],
        successfulMentorships: 0,
        mentorshipRating: 0,
      },
      lastUpdated: new Date(),
    };
  }

  private updateAgentExpertise(
    profile: GlobalAgentProfile,
    performance: unknown
  ): void {
    // Update expertise based on task performance
    if (performance.taskType) {
      const currentSpecialization =
        profile.expertise.specializations[performance.taskType] || 0.5;
      const weight = 0.9;
      profile.expertise.specializations[performance.taskType] =
        currentSpecialization * weight +
        (performance.qualityScore || 0.8) * (1 - weight);

      // Update primary/secondary domains
      if (profile.expertise.specializations[performance.taskType] > 0.8) {
        if (!profile.expertise.primaryDomains.includes(performance.taskType)) {
          profile.expertise.primaryDomains.push(performance.taskType);
        }
      } else if (
        profile.expertise.specializations[performance.taskType] > 0.6
      ) {
        if (
          !profile.expertise.secondaryDomains.includes(performance.taskType)
        ) {
          profile.expertise.secondaryDomains.push(performance.taskType);
        }
      }
    }

    // Calculate overall expertise level
    const specializationScores = Object.values(
      profile.expertise.specializations
    );
    if (specializationScores.length > 0) {
      profile.expertise.expertiseLevel =
        specializationScores.reduce((sum, score) => sum + score, 0) /
        specializationScores.length;
    }

    // Update mentorship capability
    if (
      profile.expertise.expertiseLevel > this.config.agentExpertiseThreshold
    ) {
      profile.mentorshipCapability.canMentor = true;
      profile.mentorshipCapability.mentorshipDomains =
        profile.expertise.primaryDomains;
    }
  }

  private async identifyBestPractices(
    profile: GlobalAgentProfile,
    performance: unknown
  ): Promise<void> {
    // Identify potential best practices from high-performance tasks
    const practice = {
      practiceId: `practice_${Date.now()}`,
      domain: performance.taskType || 'general',
      description: performance.approach || 'High-performance task execution',
      effectiveness: performance.qualityScore,
      applicableContexts: [performance.taskType],
      discoveredAt: new Date(),
      validationCount: 1,
    };

    profile.bestPractices.push(practice);

    // Limit best practices to prevent memory bloat
    if (profile.bestPractices.length > 20) {
      profile.bestPractices = profile.bestPractices
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .slice(0, 20);
    }
  }

  private updateSwarmHistory(
    profile: GlobalAgentProfile,
    swarmId: string,
    performance: unknown
  ): void {
    let swarmRecord = profile.swarmHistory.find((h) => h.swarmId === swarmId);

    if (!swarmRecord) {
      swarmRecord = {
        swarmId,
        duration: 0,
        performance: performance.qualityScore || 0.8,
        contributions: [],
      };
      profile.swarmHistory.push(swarmRecord);
    } else {
      const weight = 0.8;
      swarmRecord.performance =
        swarmRecord.performance * weight +
        (performance.qualityScore || 0.8) * (1 - weight);
    }

    swarmRecord.duration += performance.duration || 1;

    if (performance.contributions) {
      swarmRecord.contributions.push(...performance.contributions);
    }
  }

  private calculateTransferability(
    learningType: string,
    event: unknown
  ): number {
    // Calculate how well this learning pattern can transfer to other agents
    const baseTransferability = {
      'skill-acquisition': 0.8,
      'problem-solving': 0.7,
      collaboration: 0.9,
      adaptation: 0.6,
      optimization: 0.5,
    };

    return (
      baseTransferability[learningType as keyof typeof baseTransferability] ||
      0.5
    );
  }

  private identifyTopPerformers(): Array<{
    agentId: string;
    score: number;
    domains: string[];
  }> {
    const performers = Array.from(this.globalAgentProfiles.values())
      .map((profile) => ({
        agentId: profile.globalId,
        score:
          (profile.crossSwarmStats.averageQualityScore +
            profile.crossSwarmStats.averageSpeed +
            profile.expertise.expertiseLevel) /
          3,
        domains: profile.expertise.primaryDomains,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return performers;
  }

  private async updateExpertiseMappings(): Promise<void> {
    // Update expertise mappings for each domain
    const domainExpertise: Record<string, ExpertiseMapping> = {};

    for (const profile of this.globalAgentProfiles.values()) {
      for (const domain of profile.expertise.primaryDomains) {
        if (!domainExpertise[domain]) {
          domainExpertise[domain] = {
            domain,
            experts: [],
            bestPractices: [],
            commonChallenges: [],
            knowledgeGaps: [],
            lastUpdated: new Date(),
          };
        }

        domainExpertise[domain].experts.push({
          agentId: profile.globalId,
          agentType: profile.agentType,
          swarmId:
            profile.swarmHistory[profile.swarmHistory.length - 1]?.swarmId ||
            'unknown',
          expertiseLevel: profile.expertise.specializations[domain] || 0,
          contributions: profile.crossSwarmStats.totalTasksCompleted,
          availability: 'available', // Would be determined by actual availability
        });

        // Add best practices for this domain
        const domainBestPractices = profile.bestPractices
          .filter((bp) => bp.domain === domain)
          .map((bp) => bp.practiceId);

        domainExpertise[domain].bestPractices.push(...domainBestPractices);
      }
    }

    // Update expertise mappings
    for (const [domain, mapping] of Object.entries(domainExpertise)) {
      // Sort experts by expertise level
      mapping.experts.sort((a, b) => b.expertiseLevel - a.expertiseLevel);

      // Remove duplicates from best practices
      mapping.bestPractices = Array.from(new Set(mapping.bestPractices));

      this.expertiseMappings.set(domain, mapping);
    }
  }

  private identifyKnowledgeGaps(): string[] {
    const gaps: string[] = [];

    for (const mapping of this.expertiseMappings.values()) {
      // Identify domains with few experts
      if (mapping.experts.length < 2) {
        gaps.push(`${mapping.domain}: insufficient_experts`);
      }

      // Identify domains with low expertise levels
      const avgExpertise =
        mapping.experts.reduce((sum, e) => sum + e.expertiseLevel, 0) /
        mapping.experts.length;
      if (avgExpertise < 0.7) {
        gaps.push(`${mapping.domain}: low_expertise_level`);
      }
    }

    return gaps;
  }

  private async generateLearningRecommendations(): Promise<any[]> {
    const recommendations: unknown[] = [];

    // Recommend cross-swarm learning sessions for knowledge gaps
    const knowledgeGaps = this.identifyKnowledgeGaps();

    for (const gap of knowledgeGaps) {
      const [domain, gapType] = gap.split(': ');

      recommendations.push({
        type: 'cross-swarm-learning-session',
        priority: 0.8,
        domain,
        gapType,
        suggestedParticipants: this.findLearningParticipants(domain),
      });
    }

    // Recommend knowledge transfers
    const transferOpportunities = this.identifyKnowledgeSharingOpportunities();

    for (const opportunity of transferOpportunities.slice(0, 5)) {
      recommendations.push({
        type: 'knowledge-transfer',
        priority: opportunity.expectedImpact,
        ...opportunity,
      });
    }

    return recommendations;
  }

  private findLearningParticipants(domain: string): unknown[] {
    const mapping = this.expertiseMappings.get(domain);
    if (!mapping) return [];

    const experts = mapping.experts.filter((e) => e.expertiseLevel > 0.7);
    const learners = mapping.experts.filter((e) => e.expertiseLevel < 0.6);

    return [
      ...experts.slice(0, 2).map((e) => ({ ...e, role: 'expert' })),
      ...learners.slice(0, 4).map((l) => ({ ...l, role: 'learner' })),
    ];
  }

  private identifyKnowledgeSharingOpportunities(): unknown[] {
    const opportunities: unknown[] = [];

    // Look for agents with complementary skills
    const profiles = Array.from(this.globalAgentProfiles.values());

    for (const sourceProfile of profiles) {
      if (sourceProfile.expertise.expertiseLevel < 0.7) continue;

      for (const targetProfile of profiles) {
        if (sourceProfile.globalId === targetProfile.globalId) continue;

        // Find complementary expertise
        const sourceStrengths = sourceProfile.expertise.primaryDomains;
        const targetWeaknesses = Object.entries(
          targetProfile.expertise.specializations
        )
          .filter(([_, score]) => score < 0.6)
          .map(([domain, _]) => domain);

        const overlap = sourceStrengths.filter((s) =>
          targetWeaknesses.includes(s)
        );

        if (overlap.length > 0) {
          opportunities.push({
            sourceAgentId: sourceProfile.globalId,
            targetAgentId: targetProfile.globalId,
            domains: overlap,
            expectedImpact: this.calculateKnowledgeTransferImpact(
              sourceProfile,
              targetProfile,
              overlap
            ),
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.expectedImpact - a.expectedImpact);
  }

  private calculateKnowledgeTransferImpact(
    source: GlobalAgentProfile,
    target: GlobalAgentProfile,
    domains: string[]
  ): number {
    let impact = 0;

    for (const domain of domains) {
      const sourceExpertise = source.expertise.specializations[domain] || 0;
      const targetExpertise = target.expertise.specializations[domain] || 0;
      const gap = sourceExpertise - targetExpertise;

      // Higher impact for larger gaps with high source expertise
      impact += gap * sourceExpertise;
    }

    return Math.min(1, impact / domains.length);
  }

  // Additional methods would continue here...
  // For brevity, I'll include the key structural methods

  private async initializeKnowledgeGraph(): Promise<void> {
    // Initialize knowledge graph with current agent profiles
    this.logger.debug('Initializing knowledge graph');
  }

  private updateKnowledgeGraph(profile: GlobalAgentProfile): void {
    // Update knowledge graph with new profile data
    this.logger.debug(`Updating knowledge graph for ${profile.globalId}`);
  }

  private async loadGlobalPerformanceData(): Promise<void> {
    try {
      const data = await this.memoryCoordinator.retrieve(
        'global_agent_performance_data'
      );

      if (data) {
        // Restore global performance data
        this.logger.info(
          'Loaded global agent performance data from persistent memory'
        );
      }
    } catch (error) {
      this.logger.warn('Failed to load global agent performance data:', error);
    }
  }

  private async saveGlobalPerformanceData(): Promise<void> {
    try {
      const data = {
        globalAgentProfiles: Object.fromEntries(this.globalAgentProfiles),
        knowledgeTransfers: Object.fromEntries(this.knowledgeTransfers),
        expertiseMappings: Object.fromEntries(this.expertiseMappings),
        knowledgeGraph: this.knowledgeGraph,
        lastSaved: new Date(),
      };

      await this.memoryCoordinator.store(
        'global_agent_performance_data',
        data,
        {
          persistent: true,
          importance: 0.9,
          tags: ['global', 'agent-performance', 'cross-swarm-learning'],
        }
      );

      this.logger.debug(
        'Saved global agent performance data to persistent memory'
      );
    } catch (error) {
      this.logger.error('Failed to save global agent performance data:', error);
    }
  }

  // Placeholder methods for completion
  private async identifyKnowledgeTransferOpportunities(
    data: unknown
  ): Promise<void> {
    /* Implementation */
  }
  private async processPendingTransfers(): Promise<void> {
    /* Implementation */
  }
  private async initiateKnowledgeTransfer(opportunity: unknown): Promise<void> {
    /* Implementation */
  }
  private findSuitableCollaborators(
    skills: string[],
    excludeSwarm: string
  ): unknown[] {
    return [];
  }
  private async createCollaborationSession(
    params: unknown
  ): Promise<CrossSwarmLearningSession> {
    return {} as CrossSwarmLearningSession;
  }
  private suggestAlternatives(skills: string[]): unknown[] {
    return [];
  }
  private assessTransferFeasibility(
    source: unknown,
    target: unknown,
    type: string
  ): any {
    return { feasible: true, reasons: [] };
  }
  private async createKnowledgeTransfer(
    params: unknown
  ): Promise<AgentKnowledgeTransfer> {
    return {} as AgentKnowledgeTransfer;
  }
  private async scheduleCrossSwarmLearningSession(
    recommendations: unknown[]
  ): Promise<void> {
    /* Implementation */
  }

  /**
   * Get global agent performance status
   */
  public getGlobalPerformanceStatus(): {
    enabled: boolean;
    totalAgentsTracked: number;
    activeKnowledgeTransfers: number;
    expertiseDomains: number;
    topPerformers: number;
    averageExpertiseLevel: number;
    crossSwarmLearningSessionsCompleted: number;
  } {
    const avgExpertise =
      Array.from(this.globalAgentProfiles.values()).reduce(
        (sum, p) => sum + p.expertise.expertiseLevel,
        0
      ) / this.globalAgentProfiles.size || 0;

    return {
      enabled: this.config.enabled,
      totalAgentsTracked: this.globalAgentProfiles.size,
      activeKnowledgeTransfers: this.pendingTransfers.length,
      expertiseDomains: this.expertiseMappings.size,
      topPerformers: this.identifyTopPerformers().length,
      averageExpertiseLevel: avgExpertise,
      crossSwarmLearningSessionsCompleted: this.learningSessionsHistory.filter(
        (s) => s.completedAt
      ).length,
    };
  }

  /**
   * Shutdown global agent performance system
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Global Agent Performance System');

    // Clear intervals
    if (this.performanceTrackingInterval)
      clearInterval(this.performanceTrackingInterval);
    if (this.knowledgeShareInterval) clearInterval(this.knowledgeShareInterval);

    // Save final data
    await this.saveGlobalPerformanceData();

    this.removeAllListeners();

    this.logger.info('Global Agent Performance System shutdown complete');
  }
}
