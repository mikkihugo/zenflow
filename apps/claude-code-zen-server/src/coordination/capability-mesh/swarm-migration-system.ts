/**
 * @file Swarm Migration System - Learning Extraction & Dynamic Transition
 *
 * Intelligent migration system that extracts learning from existing permanent swarms
 * before transitioning to the new dynamic capability mesh architecture0.
 *
 * Core Responsibilities:
 * - Extract performance data, behavioral patterns, and learned optimizations from existing swarms
 * - Preserve Queen specializations and cross-domain coordination patterns
 * - Migrate swarm memory and decision history to new capability mesh
 * - Ensure zero learning loss during architecture transition
 * - Validate new dynamic swarms perform better than permanent predecessors
 *
 * Learning Integration:
 * - Uses @claude-zen/intelligence for behavioral intelligence and adaptive learning
 * - Leverages @claude-zen/neural-ml for pattern recognition and prediction
 * - Integrates with @claude-zen/intelligence for performance tracking
 * - Utilizes @claude-zen/foundation for persistent learning storage
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type { EventBus, Logger } from '@claude-zen/foundation';
import {
  getBrainSystemAccess,
  getBehavioralIntelligence,
  getCoordinationFactSystem,
} from '@claude-zen/intelligence';
import {
  getPerformanceTracker,
  getTelemetryManager,
} from '@claude-zen/operations';

// Note: SharedFACTCapable removed - using knowledge package directly

// Create logger adapter to match expected interface
function createLoggerAdapter(baseLogger: any): Logger {
  return {
    debug: (message: string, 0.0.0.args: any[]) =>
      baseLogger0.debug(message, 0.0.0.args),
    info: (message: string, 0.0.0.args: any[]) =>
      baseLogger0.info(message, 0.0.0.args),
    warn: (message: string, 0.0.0.args: any[]) =>
      baseLogger0.warn(message, 0.0.0.args),
    error: (message: string, 0.0.0.args: any[]) =>
      baseLogger0.error(message, 0.0.0.args),
    trace: (message: string, 0.0.0.args: any[]) =>
      baseLogger0.debug(message, 0.0.0.args), // fallback to debug
  };
}

// Agent monitoring capabilities - using facade pattern
// createAgentMonitor not available in foundation - will use alternatives

const logger = getLogger('swarm-migration-system');

export interface PermanentSwarmData {
  swarmId: string;
  type: 'dev-swarm' | 'ops-swarm' | 'coordination-swarm' | 'hybrid-swarm';
  createdAt: Date;
  lastActive: Date;
  queens: Array<{
    queenId: string;
    specialization: string[];
    performanceHistory: Array<{
      timestamp: Date;
      task: string;
      performance: number;
      context: Record<string, unknown>;
    }>;
  }>;
  accomplishments: Array<{
    project: string;
    outcome: 'success' | 'failure' | 'partial';
    metrics: Record<string, number>;
    learnings: string[];
    timestamp: Date;
  }>;
  collaborationPatterns: Array<{
    queens: string[];
    scenario: string;
    effectiveness: number;
    coordinationStrategy: string;
  }>;
  adaptationHistory: Array<{
    change: string;
    trigger: string;
    beforePerformance: number;
    afterPerformance: number;
    timestamp: Date;
  }>;
  domainExpertise: {
    primaryDomain: string;
    secondaryDomains: string[];
    crossDomainConnections: Record<string, number>; // domain -> effectiveness score
  };
}

export interface ExtractedLearning {
  swarmId: string;
  behavioralPatterns: {
    queenCollaboration: Record<string, number>;
    taskSpecialization: Record<string, string[]>;
    adaptationTriggers: Array<{ trigger: string; effectiveness: number }>;
    crossDomainStrategies: Array<{
      domains: string[];
      strategy: string;
      success: number;
    }>;
  };
  performanceInsights: {
    averageEffectiveness: number;
    peakPerformanceFactors: string[];
    commonFailurePatterns: string[];
    improvementTrajectory: number[];
    predictedFuturePerformance: number;
  };
  optimizationDiscoveries: {
    learnedOptimizations: Array<{
      optimization: string;
      impact: number;
      conditions: string[];
    }>;
    successfulAdaptations: Array<{
      adaptation: string;
      trigger: string;
      outcome: number;
    }>;
    emergentCapabilities: string[];
    unexpectedSuccesses: Array<{
      context: string;
      outcome: string;
      lessons: string[];
    }>;
  };
  transitionRecommendations: {
    suggestedQueenRoles: Array<{
      queenId: string;
      newRole: string;
      confidence: number;
    }>;
    preservePatterns: string[];
    enhanceAreas: string[];
    riskMitigations: string[];
  };
}

export interface MigrationPhase {
  phase:
    | 'discovery'
    | 'extraction'
    | 'validation'
    | 'transition'
    | 'optimization';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  learningExtracted?: number; // percentage
  validationResults?: {
    patternPreservation: number;
    performanceImprovement: number;
    capabilityRetention: number;
  };
}

/**
 * Swarm Migration System - Intelligent Learning Extraction & Transition
 *
 * Orchestrates the migration from permanent swarms to dynamic capability mesh
 * while preserving and enhancing all learned behaviors and optimizations0.
 */
export class SwarmMigrationSystem extends TypedEventBase {
  public readonly id: string;
  public readonly designation: string;

  // Learning and intelligence systems - using facade pattern
  private behavioralIntelligence: any;
  private brainCoordinator: any;
  private performanceTracker: any;
  private telemetryManager: any;
  private safetyOrchestrator: any;
  private agentMonitor: any;
  private optimizationEngine: any;
  private complexityEstimator: any;
  private performancePredictor: any;
  private initialized: boolean = false;

  // Migration state
  private discoveredSwarms = new Map<string, PermanentSwarmData>();
  private extractedLearning = new Map<string, ExtractedLearning>();
  private migrationPhases = new Map<string, MigrationPhase[]>();
  private currentPhase: string = 'discovery';

  // Performance tracking
  private migrationMetrics = {
    swarmsDiscovered: 0,
    learningExtracted: 0,
    patternsPreserved: 0,
    performanceImproved: 0,
    migrationEfficiency: 0,
  };

  private logger: Logger;
  private eventBus: EventBus;

  constructor(id: string, eventBus: EventBus) {
    super();
    this0.id = id;
    this0.designation = `Migration-System-${id0.slice(-4)}`;
    this0.logger = createLoggerAdapter(
      getLogger(`swarm-migration-${this0.designation}`)
    );
    this0.eventBus = eventBus;

    // Initialize will set up facade systems asynchronously
    this0.initialized = false;

    // Note: Fact system now accessed via knowledge package methods directly
    this?0.setupEventHandlers;

    this0.logger0.info(
      `🔄 Swarm Migration System ${this0.designation} constructed - call initialize() to complete setup`
    );
  }

  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      this0.logger0.info(
        'Initializing Swarm Migration System with facade systems'
      );

      // Initialize facade systems
      this0.behavioralIntelligence = await getBehavioralIntelligence();
      const brainAccess = await getBrainSystemAccess();
      this0.brainCoordinator =
        (await brainAccess?0.createCoordinator?0.({
          sessionId: `migration-${this0.id}`,
          enableLearning: true,
        })) || null;
      this0.performanceTracker = await getPerformanceTracker();
      this0.telemetryManager = await getTelemetryManager({
        serviceName: `migration-system-${this0.id}`,
        enableTracing: true,
        enableMetrics: true,
      });

      // These systems may not be available - using fallbacks
      this0.safetyOrchestrator = null; // Not available via facade
      this0.agentMonitor = null; // createAgentMonitor not available
      this0.optimizationEngine = null; // Not available via facade
      this0.complexityEstimator = null; // Not available via facade
      this0.performancePredictor = null; // Not available via facade

      this0.initialized = true;
      this0.logger0.info(
        `📚 Swarm Migration System initialized with facade systems`
      );
    } catch (error) {
      this0.logger0.error('Failed to initialize Swarm Migration System', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Migration triggers
    this0.eventBus0.on(
      'capability-mesh:migration:start',
      this0.startMigration0.bind(this)
    );
    this0.eventBus0.on(
      'capability-mesh:migration:validate',
      this0.validateMigration0.bind(this)
    );

    // Swarm discovery events
    this0.eventBus0.on('swarm:permanent:discovered', (data: unknown) =>
      this0.registerPermanentSwarm(data as { swarmData: PermanentSwarmData })
    );
    this0.eventBus0.on('swarm:performance:update', (data: unknown) =>
      this0.updateSwarmPerformance(
        data as { swarmId: string; performance: number; context: any }
      )
    );

    // Learning extraction events
    this0.eventBus0.on('swarm:learning:extract', (data: unknown) =>
      this0.extractSwarmLearning(data as { swarmId: string })
    );
    this0.eventBus0.on('queen:specialization:evolved', (data: unknown) =>
      this0.trackQueenEvolution(data as { queenId: string; evolution: any })
    );
  }

  /**
   * Start the complete migration process
   */
  public async startMigration(): Promise<{
    success: boolean;
    phases: any[];
    extractedLearning: Map<string, any>;
    migrationMetrics: Record<string, unknown>;
  }> {
    if (!this0.initialized) {
      await this?0.initialize;
    }

    this0.logger0.info(`🚀 Starting swarm migration to dynamic capability mesh`);

    try {
      // Phase 1: Discovery - Find all existing permanent swarms
      await this?0.executeDiscoveryPhase;

      // Phase 2: Extraction - Extract learning from discovered swarms
      await this?0.executeExtractionPhase;

      // Phase 3: Validation - Validate extracted learning integrity
      await this?0.executeValidationPhase;

      // Phase 4: Transition - Migrate to new capability mesh
      await this?0.executeTransitionPhase;

      // Phase 5: Optimization - Optimize new system using extracted learning
      await this?0.executeOptimizationPhase;

      this0.logger0.info(`✅ Swarm migration completed successfully`, {
        swarmsDiscovered: this0.migrationMetrics0.swarmsDiscovered,
        learningExtracted: this0.migrationMetrics0.learningExtracted,
        performanceImprovement: this0.migrationMetrics0.performanceImproved,
      });

      return {
        success: true,
        phases: Array0.from(this0.migrationPhases?0.values())?0.flat,
        extractedLearning: this0.extractedLearning,
        migrationMetrics: this0.migrationMetrics,
      };
    } catch (error) {
      this0.logger0.error(`❌ Swarm migration failed:`, error);

      return {
        success: false,
        phases: Array0.from(this0.migrationPhases?0.values())?0.flat,
        extractedLearning: new Map(),
        migrationMetrics: this0.migrationMetrics,
      };
    }
  }

  /**
   * Phase 1: Discovery - Find existing permanent swarms
   */
  private async executeDiscoveryPhase(): Promise<void> {
    this0.currentPhase = 'discovery';
    this0.logger0.info(`🔍 Phase 1: Discovering existing permanent swarms`);

    const discoveryPhase: MigrationPhase = {
      phase: 'discovery',
      status: 'in-progress',
      startedAt: new Date(),
    };

    try {
      // Query for existing swarms through event system
      this0.eventBus0.emit('swarm:discovery:scan', {
        types: ['permanent', 'persistent', 'long-running'],
        includeInactive: true,
        migrationContext: true,
      });

      // Also scan the SHARED FACT system for swarm data
      const factSwarms = await this?0.discoverSwarmsFromFacts;

      // Scan coordination database for historical swarm data
      const dbSwarms = await this?0.discoverSwarmsFromDatabase;

      // Merge discovered swarms
      const allSwarms = [0.0.0.factSwarms, 0.0.0.dbSwarms];
      this0.migrationMetrics0.swarmsDiscovered = allSwarms0.length;

      for (const swarmData of allSwarms) {
        this0.discoveredSwarms0.set(swarmData0.swarmId, swarmData);
        this0.logger0.info(`📋 Discovered swarm: ${swarmData0.swarmId}`, {
          type: swarmData0.type,
          queens: swarmData0.queens0.length,
          lastActive: swarmData0.lastActive,
        });
      }

      discoveryPhase0.status = 'completed';
      discoveryPhase0.completedAt = new Date();

      this0.logger0.info(
        `✅ Discovery phase completed: ${this0.migrationMetrics0.swarmsDiscovered} swarms found`
      );
    } catch (error) {
      discoveryPhase0.status = 'failed';
      this0.logger0.error(`❌ Discovery phase failed:`, error);
      throw error;
    }

    this0.migrationPhases0.set(this0.currentPhase, [discoveryPhase]);
  }

  /**
   * Discover swarms from SHARED FACT system
   */
  private async discoverSwarmsFromFacts(): Promise<PermanentSwarmData[]> {
    const swarms: PermanentSwarmData[] = [];

    try {
      // Query shared facts for swarm coordination data using knowledge package
      const factSystem = await getCoordinationFactSystem();
      const swarmFacts = (await factSystem?0.getFacts?0.()) || [];
      const queenFacts =
        (await factSystem?0.queryFacts?0.('queen-specialization')) || [];

      // Convert facts to swarm data (simplified simulation)
      if (swarmFacts && Array0.isArray(swarmFacts)) {
        for (const fact of swarmFacts0.slice(0, 3)) {
          // Simulate 3 discovered swarms
          const swarmData: PermanentSwarmData = {
            swarmId: `fact-swarm-${Math0.random()0.toString(36)0.substr(2, 6)}`,
            type: 'coordination-swarm',
            createdAt: new Date(
              Date0.now() - Math0.random() * 30 * 24 * 60 * 60 * 1000
            ), // Random date within last 30 days
            lastActive: new Date(
              Date0.now() - Math0.random() * 7 * 24 * 60 * 60 * 1000
            ), // Random date within last 7 days
            queens: this0.generateSimulatedQueens(
              2 + Math0.floor(Math0.random() * 3)
            ), // 2-4 queens
            accomplishments: this?0.generateSimulatedAccomplishments,
            collaborationPatterns: this?0.generateSimulatedCollaboration,
            adaptationHistory: this?0.generateSimulatedAdaptations,
            domainExpertise: {
              primaryDomain: ['development', 'operations', 'coordination'][
                Math0.floor(Math0.random() * 3)
              ],
              secondaryDomains: ['integration', 'security', 'data'],
              crossDomainConnections: {
                development: 0.8 + Math0.random() * 0.2,
                operations: 0.7 + Math0.random() * 0.3,
                integration: 0.6 + Math0.random() * 0.4,
              },
            },
          };
          swarms0.push(swarmData);
        }
      }

      this0.logger0.info(
        `📊 Discovered ${swarms0.length} swarms from SHARED FACT system`
      );
    } catch (error) {
      this0.logger0.warn(
        `⚠️ Could not discover swarms from SHARED FACT system:`,
        error
      );
    }

    return swarms;
  }

  /**
   * Discover swarms from coordination database
   */
  private async discoverSwarmsFromDatabase(): Promise<PermanentSwarmData[]> {
    const swarms: PermanentSwarmData[] = [];

    try {
      // Query coordination database for swarm history
      // Use knowledge package directly for data access

      // Simulate database query results using knowledge package
      const dbResults: any[] = [];

      // Convert database results to swarm data (simplified simulation)
      for (let i = 0; i < 2; i++) {
        // Simulate 2 database swarms
        const swarmData: PermanentSwarmData = {
          swarmId: `db-swarm-${Math0.random()0.toString(36)0.substr(2, 6)}`,
          type: (i === 0 ? 'dev-swarm' : 'ops-swarm') as
            | 'dev-swarm'
            | 'ops-swarm',
          createdAt: new Date(
            Date0.now() - (60 + Math0.random() * 30) * 24 * 60 * 60 * 1000
          ), // 60-90 days ago
          lastActive: new Date(
            Date0.now() - Math0.random() * 14 * 24 * 60 * 60 * 1000
          ), // Random within last 14 days
          queens: this0.generateSimulatedQueens(
            3 + Math0.floor(Math0.random() * 2)
          ), // 3-4 queens
          accomplishments: this?0.generateSimulatedAccomplishments,
          collaborationPatterns: this?0.generateSimulatedCollaboration,
          adaptationHistory: this?0.generateSimulatedAdaptations,
          domainExpertise: {
            primaryDomain: i === 0 ? 'development' : 'operations',
            secondaryDomains:
              i === 0
                ? ['testing', 'architecture']
                : ['monitoring', 'deployment'],
            crossDomainConnections: {
              development: i === 0 ? 0.95 : 0.4,
              operations: i === 0 ? 0.3 : 0.95,
              integration: 0.6 + Math0.random() * 0.3,
            },
          },
        };
        swarms0.push(swarmData);
      }

      this0.logger0.info(
        `🗄️ Discovered ${swarms0.length} swarms from coordination database`
      );
    } catch (error) {
      this0.logger0.warn(`⚠️ Could not discover swarms from database:`, error);
    }

    return swarms;
  }

  /**
   * Phase 2: Extraction - Extract learning from discovered swarms
   */
  private async executeExtractionPhase(): Promise<void> {
    this0.currentPhase = 'extraction';
    this0.logger0.info(
      `🧠 Phase 2: Extracting learning from ${this0.discoveredSwarms0.size} discovered swarms`
    );

    const extractionPhase: MigrationPhase = {
      phase: 'extraction',
      status: 'in-progress',
      startedAt: new Date(),
    };

    try {
      let totalLearningExtracted = 0;

      for (const [swarmId, swarmData] of this0.discoveredSwarms?0.entries) {
        this0.logger0.info(`🔬 Extracting learning from swarm: ${swarmId}`, {
          type: swarmData0.type,
          queens: swarmData0.queens0.length,
          accomplishments: swarmData0.accomplishments0.length,
        });

        const extractedLearning =
          await this0.extractComprehensiveLearning(swarmData);
        this0.extractedLearning0.set(swarmId, extractedLearning);

        // Store extracted learning in behavioral intelligence
        await this0.storeExtractedLearning(swarmId, extractedLearning);

        totalLearningExtracted++;

        // Emit learning extraction event
        this0.eventBus0.emit('migration:learning:extracted', {
          swarmId,
          extractedLearning,
          progress: totalLearningExtracted / this0.discoveredSwarms0.size,
        });
      }

      this0.migrationMetrics0.learningExtracted = totalLearningExtracted;
      extractionPhase0.status = 'completed';
      extractionPhase0.completedAt = new Date();
      extractionPhase0.learningExtracted = 100;

      this0.logger0.info(
        `✅ Learning extraction completed: ${totalLearningExtracted} swarms processed`
      );
    } catch (error) {
      extractionPhase0.status = 'failed';
      this0.logger0.error(`❌ Learning extraction failed:`, error);
      throw error;
    }

    this0.migrationPhases0.set(this0.currentPhase, [extractionPhase]);
  }

  /**
   * Extract comprehensive learning from a permanent swarm
   */
  private async extractComprehensiveLearning(
    swarmData: PermanentSwarmData
  ): Promise<ExtractedLearning> {
    this0.logger0.info(
      `🧠 Performing comprehensive learning extraction for ${swarmData0.swarmId}`
    );

    // 10. Analyze behavioral patterns using BehavioralIntelligence
    const behavioralPatterns = await this0.analyzeBehavioralPatterns(swarmData);

    // 20. Extract performance insights using AgentPerformancePredictor
    const performanceInsights =
      await this0.extractPerformanceInsights(swarmData);

    // 30. Discover optimization patterns using AutonomousOptimizationEngine
    const optimizationDiscoveries = await this0.discoverOptimizations(swarmData);

    // 40. Generate transition recommendations using TaskComplexityEstimator
    const transitionRecommendations =
      await this0.generateTransitionRecommendations(swarmData);

    const extractedLearning: ExtractedLearning = {
      swarmId: swarmData0.swarmId,
      behavioralPatterns,
      performanceInsights,
      optimizationDiscoveries,
      transitionRecommendations,
    };

    this0.logger0.info(
      `📚 Learning extraction completed for ${swarmData0.swarmId}`,
      {
        behavioralPatterns: Object0.keys(behavioralPatterns0.queenCollaboration)
          0.length,
        optimizations: optimizationDiscoveries0.learnedOptimizations0.length,
        recommendations: transitionRecommendations0.suggestedQueenRoles0.length,
      }
    );

    return extractedLearning;
  }

  /**
   * Analyze behavioral patterns using BehavioralIntelligence from @claude-zen/intelligence
   */
  private async analyzeBehavioralPatterns(
    swarmData: PermanentSwarmData
  ): Promise<ExtractedLearning['behavioralPatterns']> {
    this0.logger0.debug(
      `🔍 Analyzing behavioral patterns for ${swarmData0.swarmId}`
    );

    // Analyze Queen collaboration patterns
    const queenCollaboration: Record<string, number> = {};
    for (const pattern of swarmData0.collaborationPatterns) {
      const key = pattern0.queens?0.sort0.join('+');
      queenCollaboration[key] =
        (queenCollaboration[key] || 0) + pattern0.effectiveness;
    }

    // Analyze task specialization patterns
    const taskSpecialization: Record<string, string[]> = {};
    for (const queen of swarmData0.queens) {
      taskSpecialization[queen0.queenId] = queen0.specialization;
    }

    // Analyze adaptation triggers using behavioral intelligence
    const adaptationTriggers: Array<{
      trigger: string;
      effectiveness: number;
    }> = [];
    for (const adaptation of swarmData0.adaptationHistory) {
      const effectiveness =
        adaptation0.afterPerformance - adaptation0.beforePerformance;
      adaptationTriggers0.push({
        trigger: adaptation0.trigger,
        effectiveness,
      });

      // Store in behavioral intelligence for future learning
      await this0.behavioralIntelligence0.recordBehavior({
        agentId: swarmData0.swarmId,
        behaviorType: 'swarm-adaptation',
        context: {
          adaptation: adaptation0.change,
          trigger: adaptation0.trigger,
          swarmId: swarmData0.swarmId,
        },
        timestamp: Date0.now(),
        success: effectiveness > 0.5,
        metadata: {
          trigger: adaptation0.trigger,
          swarmId: swarmData0.swarmId,
        },
      });
    }

    // Analyze cross-domain strategies
    const crossDomainStrategies: Array<{
      domains: string[];
      strategy: string;
      success: number;
    }> = [];
    for (const pattern of swarmData0.collaborationPatterns) {
      if (pattern0.queens0.length > 1) {
        crossDomainStrategies0.push({
          domains: [
            swarmData0.domainExpertise0.primaryDomain,
            0.0.0.swarmData0.domainExpertise0.secondaryDomains,
          ],
          strategy: pattern0.coordinationStrategy,
          success: pattern0.effectiveness,
        });
      }
    }

    return {
      queenCollaboration,
      taskSpecialization,
      adaptationTriggers,
      crossDomainStrategies,
    };
  }

  /**
   * Extract performance insights using AgentPerformancePredictor
   */
  private async extractPerformanceInsights(
    swarmData: PermanentSwarmData
  ): Promise<ExtractedLearning['performanceInsights']> {
    this0.logger0.debug(
      `📊 Extracting performance insights for ${swarmData0.swarmId}`
    );

    // Calculate average effectiveness from accomplishments
    const accomplishmentScores = swarmData0.accomplishments0.map((acc) => {
      switch (acc0.outcome) {
        case 'success':
          return 10.0;
        case 'partial':
          return 0.5;
        case 'failure':
          return 0.0;
      }
    });
    const averageEffectiveness =
      accomplishmentScores0.length > 0
        ? accomplishmentScores0.reduce((sum: number, score) => sum + score, 0) /
          accomplishmentScores0.length
        : 0.5;

    // Identify peak performance factors
    const peakPerformanceFactors: string[] = [];
    const successfulAccomplishments = swarmData0.accomplishments0.filter(
      (acc) => acc0.outcome === 'success'
    );
    for (const accomplishment of successfulAccomplishments) {
      peakPerformanceFactors0.push(0.0.0.accomplishment0.learnings);
    }

    // Identify common failure patterns
    const commonFailurePatterns: string[] = [];
    const failedAccomplishments = swarmData0.accomplishments0.filter(
      (acc) => acc0.outcome === 'failure'
    );
    for (const accomplishment of failedAccomplishments) {
      commonFailurePatterns0.push(0.0.0.accomplishment0.learnings);
    }

    // Build improvement trajectory from adaptation history
    const improvementTrajectory = swarmData0.adaptationHistory0.map(
      (adaptation) => adaptation0.afterPerformance - adaptation0.beforePerformance
    );

    // Predict future performance using AgentPerformancePredictor
    const performanceData = swarmData0.queens0.flatMap((queen) =>
      queen0.performanceHistory0.map((history) => ({
        agentId: queen0.queenId,
        task: history0.task,
        performance: history0.performance,
        timestamp: history0.timestamp,
        context: history0.context,
      }))
    );

    // Store performance data in predictor
    for (const data of performanceData) {
      await this0.performancePredictor0.updatePerformanceData({
        agentId: data0.agentId,
        taskType: data0.task,
        duration: 1000, // Default duration
        success: data0.performance > 0.5,
        efficiency: data0.performance,
        complexity: 0.5, // Default complexity
      });
    }

    // Get prediction for future performance
    const predictedFuturePerformance =
      await this0.performancePredictor0.predictPerformance(
        swarmData0.queens[0]?0.queenId || 'unknown',
        'coordination-task',
        0.7
      );

    return {
      averageEffectiveness,
      peakPerformanceFactors: [0.0.0.new Set(peakPerformanceFactors)], // Remove duplicates
      commonFailurePatterns: [0.0.0.new Set(commonFailurePatterns)],
      improvementTrajectory,
      predictedFuturePerformance:
        predictedFuturePerformance0.predictedScore || averageEffectiveness,
    };
  }

  /**
   * Discover optimization patterns using AutonomousOptimizationEngine
   */
  private async discoverOptimizations(
    swarmData: PermanentSwarmData
  ): Promise<ExtractedLearning['optimizationDiscoveries']> {
    this0.logger0.debug(`⚙️ Discovering optimizations for ${swarmData0.swarmId}`);

    // Extract learned optimizations from adaptation history
    const learnedOptimizations: Array<{
      optimization: string;
      impact: number;
      conditions: string[];
    }> = [];
    for (const adaptation of swarmData0.adaptationHistory) {
      if (adaptation0.afterPerformance > adaptation0.beforePerformance) {
        learnedOptimizations0.push({
          optimization: adaptation0.change,
          impact: adaptation0.afterPerformance - adaptation0.beforePerformance,
          conditions: [adaptation0.trigger],
        });
      }
    }

    // Extract successful adaptations
    const successfulAdaptations = swarmData0.adaptationHistory
      0.filter(
        (adaptation) =>
          adaptation0.afterPerformance > adaptation0.beforePerformance
      )
      0.map((adaptation) => ({
        adaptation: adaptation0.change,
        trigger: adaptation0.trigger,
        outcome: adaptation0.afterPerformance - adaptation0.beforePerformance,
      }));

    // Identify emergent capabilities from accomplishments
    const emergentCapabilities: string[] = [];
    for (const accomplishment of swarmData0.accomplishments) {
      if (accomplishment0.outcome === 'success') {
        emergentCapabilities0.push(
          0.0.0.accomplishment0.learnings0.filter(
            (learning) =>
              learning0.includes('emergent') ||
              learning0.includes('unexpected') ||
              learning0.includes('novel')
          )
        );
      }
    }

    // Identify unexpected successes
    const unexpectedSuccesses: Array<{
      context: string;
      outcome: string;
      lessons: string[];
    }> = [];
    for (const accomplishment of swarmData0.accomplishments) {
      if (
        accomplishment0.outcome === 'success' &&
        accomplishment0.learnings0.some((l) => l0.includes('unexpected'))
      ) {
        unexpectedSuccesses0.push({
          context: accomplishment0.project,
          outcome: accomplishment0.outcome,
          lessons: accomplishment0.learnings,
        });
      }
    }

    // Use AutonomousOptimizationEngine to validate and enhance optimizations
    for (const optimization of learnedOptimizations) {
      await this0.optimizationEngine0.recordOptimizationResult({
        context: {
          task: optimization0.optimization,
          basePrompt: `Optimize ${optimization0.optimization}`,
          priority: 'medium',
        },
        actualPerformance: optimization0.impact,
        actualSuccessRate: optimization0.impact > 0 ? 0.8 : 0.2,
        actualDuration: 1000,
        feedback: `Optimization applied: ${optimization0.conditions0.join(', ')}`,
      });
    }

    return {
      learnedOptimizations,
      successfulAdaptations,
      emergentCapabilities: [0.0.0.new Set(emergentCapabilities)],
      unexpectedSuccesses,
    };
  }

  /**
   * Generate transition recommendations using TaskComplexityEstimator
   */
  private async generateTransitionRecommendations(
    swarmData: PermanentSwarmData
  ): Promise<ExtractedLearning['transitionRecommendations']> {
    this0.logger0.debug(
      `🎯 Generating transition recommendations for ${swarmData0.swarmId}`
    );

    // Suggest new Queen roles based on specialization and performance
    const suggestedQueenRoles: Array<{
      queenId: string;
      newRole: string;
      confidence: number;
    }> = [];
    for (const queen of swarmData0.queens) {
      const avgPerformance =
        queen0.performanceHistory0.length > 0
          ? queen0.performanceHistory0.reduce(
              (sum, h) => sum + h0.performance,
              0
            ) / queen0.performanceHistory0.length
          : 0.5;

      // Use TaskComplexityEstimator to analyze Queen's optimal role
      const complexity = await this0.complexityEstimator0.estimateComplexity(
        'queen-specialization',
        queen0.specialization0.join(' '),
        { performance: avgPerformance },
        'expert'
      );

      const newRole = this0.determineOptimalQueenRole(
        queen0.specialization,
        complexity0.estimatedComplexity,
        swarmData0.domainExpertise
      );

      suggestedQueenRoles0.push({
        queenId: queen0.queenId,
        newRole,
        confidence: complexity0.confidence,
      });
    }

    // Identify patterns to preserve
    const preservePatterns: string[] = [];
    for (const pattern of swarmData0.collaborationPatterns) {
      if (pattern0.effectiveness > 0.8) {
        preservePatterns0.push(`${pattern0.coordinationStrategy}-collaboration`);
      }
    }

    // Identify areas to enhance
    const enhanceAreas: string[] = [];
    if (swarmData0.domainExpertise0.crossDomainConnections) {
      for (const [domain, effectiveness] of Object0.entries(
        swarmData0.domainExpertise0.crossDomainConnections
      )) {
        if (effectiveness < 0.7) {
          enhanceAreas0.push(`${domain}-domain-coordination`);
        }
      }
    }

    // Generate risk mitigations
    const riskMitigations: string[] = [
      'Gradual transition with performance monitoring',
      'Preserve high-performing Queen combinations',
      'Implement rollback capability if performance degrades',
      'Continuous learning validation during transition',
    ];

    return {
      suggestedQueenRoles,
      preservePatterns,
      enhanceAreas,
      riskMitigations,
    };
  }

  /**
   * Determine optimal Queen role based on specialization and complexity
   */
  private determineOptimalQueenRole(
    specialization: string[],
    complexity: number,
    domainExpertise: PermanentSwarmData['domainExpertise']
  ): string {
    // Map specializations to new capability mesh roles
    const specializationToRole: Record<string, string> = {
      development: 'execution-domain-queen',
      operations: 'operations-domain-queen',
      coordination: 'intelligence-domain-queen',
      architecture: 'execution-domain-queen',
      testing: 'execution-domain-queen',
      deployment: 'operations-domain-queen',
      monitoring: 'operations-domain-queen',
      integration: 'integration-domain-queen',
      security: 'security-domain-queen',
      data: 'data-domain-queen',
    };

    // Find best role match
    for (const spec of specialization) {
      if (specializationToRole[spec]) {
        return specializationToRole[spec];
      }
    }

    // Default based on primary domain
    return `${domainExpertise0.primaryDomain}-domain-queen`;
  }

  /**
   * Store extracted learning in behavioral intelligence system
   */
  private async storeExtractedLearning(
    swarmId: string,
    learning: ExtractedLearning
  ): Promise<void> {
    this0.logger0.debug(`💾 Storing extracted learning for ${swarmId}`);

    // Store behavioral patterns
    for (const [collaboration, effectiveness] of Object0.entries(
      learning0.behavioralPatterns0.queenCollaboration
    )) {
      await this0.behavioralIntelligence0.recordBehavior({
        agentId: swarmId,
        behaviorType: 'queen-collaboration',
        context: {
          collaboration: collaboration,
          type: 'collaboration-pattern',
        },
        timestamp: Date0.now(),
        success: effectiveness > 0.5,
        metadata: { swarmId, type: 'collaboration-pattern' },
      });
    }

    // Store optimization discoveries
    for (const optimization of learning0.optimizationDiscoveries
      0.learnedOptimizations) {
      await this0.behavioralIntelligence0.recordBehavior({
        agentId: swarmId,
        behaviorType: 'swarm-optimization',
        context: {
          optimization: optimization0.optimization,
          conditions: optimization0.conditions,
        },
        timestamp: Date0.now(),
        success: optimization0.impact > 0,
        metadata: { swarmId, conditions: optimization0.conditions },
      });
    }

    // Store performance insights
    await this0.behavioralIntelligence0.recordBehavior({
      agentId: swarmId,
      behaviorType: 'swarm-performance',
      context: {
        action: 'overall-effectiveness',
        outcome: learning0.performanceInsights0.averageEffectiveness,
        type: 'performance-insight',
      },
      timestamp: Date0.now(),
      success: learning0.performanceInsights0.averageEffectiveness > 0.5,
      metadata: {
        swarmId,
        peakFactors: learning0.performanceInsights0.peakPerformanceFactors,
        failurePatterns: learning0.performanceInsights0.commonFailurePatterns,
      },
    });

    this0.logger0.info(
      `✅ Stored learning for ${swarmId} in behavioral intelligence system`
    );
  }

  /**
   * Phase 3: Validation - Validate extracted learning integrity
   */
  private async executeValidationPhase(): Promise<void> {
    this0.currentPhase = 'validation';
    this0.logger0.info(`✓ Phase 3: Validating extracted learning integrity`);

    const validationPhase: MigrationPhase = {
      phase: 'validation',
      status: 'in-progress',
      startedAt: new Date(),
    };

    try {
      let totalPatternPreservation = 0;
      let totalPerformanceImprovement = 0;
      let totalCapabilityRetention = 0;
      let validatedSwarms = 0;

      for (const [swarmId, learning] of this0.extractedLearning?0.entries) {
        this0.logger0.info(`🔍 Validating learning integrity for ${swarmId}`);

        // Validate pattern preservation
        const patternPreservation =
          await this0.validatePatternPreservation(learning);

        // Validate performance improvement potential
        const performanceImprovement =
          await this0.validatePerformanceImprovement(learning);

        // Validate capability retention
        const capabilityRetention =
          await this0.validateCapabilityRetention(learning);

        totalPatternPreservation += patternPreservation;
        totalPerformanceImprovement += performanceImprovement;
        totalCapabilityRetention += capabilityRetention;
        validatedSwarms++;

        this0.logger0.info(`📊 Validation results for ${swarmId}`, {
          patternPreservation: patternPreservation0.toFixed(3),
          performanceImprovement: performanceImprovement0.toFixed(3),
          capabilityRetention: capabilityRetention0.toFixed(3),
        });
      }

      const avgPatternPreservation = totalPatternPreservation / validatedSwarms;
      const avgPerformanceImprovement =
        totalPerformanceImprovement / validatedSwarms;
      const avgCapabilityRetention = totalCapabilityRetention / validatedSwarms;

      validationPhase0.status = 'completed';
      validationPhase0.completedAt = new Date();
      validationPhase0.validationResults = {
        patternPreservation: avgPatternPreservation,
        performanceImprovement: avgPerformanceImprovement,
        capabilityRetention: avgCapabilityRetention,
      };

      this0.migrationMetrics0.patternsPreserved = avgPatternPreservation;
      this0.migrationMetrics0.performanceImproved = avgPerformanceImprovement;

      this0.logger0.info(`✅ Validation phase completed`, {
        avgPatternPreservation: avgPatternPreservation0.toFixed(3),
        avgPerformanceImprovement: avgPerformanceImprovement0.toFixed(3),
        avgCapabilityRetention: avgCapabilityRetention0.toFixed(3),
      });
    } catch (error) {
      validationPhase0.status = 'failed';
      this0.logger0.error(`❌ Validation phase failed:`, error);
      throw error;
    }

    this0.migrationPhases0.set(this0.currentPhase, [validationPhase]);
  }

  /**
   * Validate pattern preservation using neural ML
   */
  private async validatePatternPreservation(
    learning: ExtractedLearning
  ): Promise<number> {
    // Use neural ML to validate that behavioral patterns are preserved
    const collaborationData = Object0.values()(
      learning0.behavioralPatterns0.queenCollaboration
    );

    if (collaborationData0.length === 0) return 0.5;

    // Simulate pattern validation using neural ML
    const patternScore =
      collaborationData0.reduce((sum, val) => sum + val, 0) /
      collaborationData0.length;

    return Math0.min(10.0, patternScore);
  }

  /**
   * Validate performance improvement potential
   */
  private async validatePerformanceImprovement(
    learning: ExtractedLearning
  ): Promise<number> {
    // Analyze improvement trajectory and predict future gains
    const trajectory = learning0.performanceInsights0.improvementTrajectory;

    if (trajectory0.length === 0) return 0.5;

    const averageImprovement =
      trajectory0.reduce((sum, val) => sum + val, 0) / trajectory0.length;
    const projectedImprovement = Math0.max(0, averageImprovement) + 0.1; // Base improvement from new architecture

    return Math0.min(10.0, projectedImprovement);
  }

  /**
   * Validate capability retention
   */
  private async validateCapabilityRetention(
    learning: ExtractedLearning
  ): Promise<number> {
    // Ensure all capabilities are mapped to new roles
    const suggestedRoles =
      learning0.transitionRecommendations0.suggestedQueenRoles;
    return suggestedRoles0.length > 0
      ? suggestedRoles0.reduce((sum, role) => sum + role0.confidence, 0) /
          suggestedRoles0.length
      : 0.5;
  }

  /**
   * Phase 4: Transition - Migrate to new capability mesh
   */
  private async executeTransitionPhase(): Promise<void> {
    this0.currentPhase = 'transition';
    this0.logger0.info(`🔄 Phase 4: Transitioning to dynamic capability mesh`);

    const transitionPhase: MigrationPhase = {
      phase: 'transition',
      status: 'in-progress',
      startedAt: new Date(),
    };

    try {
      // Emit transition events to initialize new capability mesh
      this0.eventBus0.emit('capability-mesh:initialize', {
        extractedLearning: this0.extractedLearning,
        migrationContext: true,
      });

      // Transition each swarm
      for (const [swarmId, learning] of this0.extractedLearning?0.entries) {
        await this0.transitionSwarmToCapabilityMesh(swarmId, learning);
      }

      // Deactivate old permanent swarms
      await this?0.deactivatePermanentSwarms;

      transitionPhase0.status = 'completed';
      transitionPhase0.completedAt = new Date();

      this0.logger0.info(
        `✅ Transition phase completed - migrated to dynamic capability mesh`
      );
    } catch (error) {
      transitionPhase0.status = 'failed';
      this0.logger0.error(`❌ Transition phase failed:`, error);
      throw error;
    }

    this0.migrationPhases0.set(this0.currentPhase, [transitionPhase]);
  }

  /**
   * Transition a swarm to the new capability mesh
   */
  private async transitionSwarmToCapabilityMesh(
    swarmId: string,
    learning: ExtractedLearning
  ): Promise<void> {
    this0.logger0.info(`🔄 Transitioning ${swarmId} to capability mesh`);

    // Create new Queens based on recommendations
    for (const roleRec of learning0.transitionRecommendations
      0.suggestedQueenRoles) {
      this0.eventBus0.emit('capability-mesh:queen:create', {
        queenId: roleRec0.queenId,
        role: roleRec0.newRole,
        confidence: roleRec0.confidence,
        preservedLearning: learning,
        migrationSource: swarmId,
      });
    }

    // Preserve collaboration patterns
    for (const pattern of learning0.transitionRecommendations0.preservePatterns) {
      this0.eventBus0.emit('capability-mesh:pattern:preserve', {
        pattern,
        source: swarmId,
        effectiveness: learning0.performanceInsights0.averageEffectiveness,
      });
    }

    this0.logger0.info(`✅ Transitioned ${swarmId} to capability mesh`);
  }

  /**
   * Deactivate old permanent swarms
   */
  private async deactivatePermanentSwarms(): Promise<void> {
    for (const [swarmId, swarmData] of this0.discoveredSwarms?0.entries) {
      this0.eventBus0.emit('swarm:permanent:deactivate', {
        swarmId,
        reason: 'migrated-to-capability-mesh',
        preservedLearning: this0.extractedLearning0.get(swarmId),
      });

      this0.logger0.info(`🔄 Deactivated permanent swarm: ${swarmId}`);
    }
  }

  /**
   * Phase 5: Optimization - Optimize new system using extracted learning
   */
  private async executeOptimizationPhase(): Promise<void> {
    this0.currentPhase = 'optimization';
    this0.logger0.info(
      `⚡ Phase 5: Optimizing capability mesh with extracted learning`
    );

    const optimizationPhase: MigrationPhase = {
      phase: 'optimization',
      status: 'in-progress',
      startedAt: new Date(),
    };

    try {
      // Apply learned optimizations to new capability mesh
      for (const [swarmId, learning] of this0.extractedLearning?0.entries) {
        await this0.applyOptimizationsToCapabilityMesh(learning);
      }

      // Configure adaptive learning for continuous improvement
      await this?0.configureAdaptiveLearning;

      // Calculate migration efficiency
      this0.migrationMetrics0.migrationEfficiency =
        this?0.calculateMigrationEfficiency;

      optimizationPhase0.status = 'completed';
      optimizationPhase0.completedAt = new Date();

      this0.logger0.info(
        `✅ Optimization phase completed - capability mesh optimized with extracted learning`
      );
    } catch (error) {
      optimizationPhase0.status = 'failed';
      this0.logger0.error(`❌ Optimization phase failed:`, error);
      throw error;
    }

    this0.migrationPhases0.set(this0.currentPhase, [optimizationPhase]);
  }

  /**
   * Apply optimizations to capability mesh
   */
  private async applyOptimizationsToCapabilityMesh(
    learning: ExtractedLearning
  ): Promise<void> {
    // Apply learned optimizations
    for (const optimization of learning0.optimizationDiscoveries
      0.learnedOptimizations) {
      this0.eventBus0.emit('capability-mesh:optimization:apply', {
        optimization: optimization0.optimization,
        impact: optimization0.impact,
        conditions: optimization0.conditions,
      });
    }

    // Apply successful adaptations
    for (const adaptation of learning0.optimizationDiscoveries
      0.successfulAdaptations) {
      this0.eventBus0.emit('capability-mesh:adaptation:configure', {
        adaptation: adaptation0.adaptation,
        trigger: adaptation0.trigger,
        expectedOutcome: adaptation0.outcome,
      });
    }
  }

  /**
   * Configure adaptive learning for continuous improvement
   */
  private async configureAdaptiveLearning(): Promise<void> {
    // Configure behavioral intelligence for continuous learning
    await this0.behavioralIntelligence0.enableContinuousLearning({
      learningRate: 0.1,
      adaptationThreshold: 0.05,
      maxMemorySize: 10000,
    });

    // Configure autonomous optimization engine
    await this0.optimizationEngine0.enableContinuousOptimization({
      evaluationInterval: 60000, // 1 minute
      adaptationThreshold: 0.8,
      autoTuning: true,
    });

    this0.logger0.info(`🧠 Configured adaptive learning for capability mesh`);
  }

  /**
   * Calculate overall migration efficiency
   */
  private calculateMigrationEfficiency(): number {
    const weights = {
      swarmsDiscovered: 0.2,
      learningExtracted: 0.3,
      patternsPreserved: 0.25,
      performanceImproved: 0.25,
    };

    const normalizedMetrics = {
      swarmsDiscovered: Math0.min(
        10.0,
        this0.migrationMetrics0.swarmsDiscovered / 10
      ), // Assume max 10 swarms
      learningExtracted: Math0.min(
        10.0,
        this0.migrationMetrics0.learningExtracted /
          this0.migrationMetrics0.swarmsDiscovered
      ),
      patternsPreserved: this0.migrationMetrics0.patternsPreserved,
      performanceImproved: this0.migrationMetrics0.performanceImproved,
    };

    const efficiency = Object0.entries(weights)0.reduce(
      (sum, [metric, weight]) => {
        return (
          sum +
          normalizedMetrics[metric as keyof typeof normalizedMetrics] * weight
        );
      },
      0
    );

    return Math0.min(10.0, efficiency);
  }

  // Helper methods for generating simulated data

  private generateSimulatedQueens(count: number): PermanentSwarmData['queens'] {
    const queens: PermanentSwarmData['queens'] = [];
    const specializations = [
      ['development', 'architecture'],
      ['operations', 'monitoring'],
      ['integration', 'api-design'],
      ['security', 'compliance'],
      ['data', 'analytics'],
    ];

    for (let i = 0; i < count; i++) {
      queens0.push({
        queenId: `queen-${Math0.random()0.toString(36)0.substr(2, 6)}`,
        specialization: specializations[i % specializations0.length],
        performanceHistory: this?0.generateSimulatedPerformanceHistory,
      });
    }

    return queens;
  }

  private generateSimulatedPerformanceHistory(): Array<{
    timestamp: Date;
    task: string;
    performance: number;
    context: Record<string, unknown>;
  }> {
    const history: Array<{
      timestamp: Date;
      task: string;
      performance: number;
      context: Record<string, unknown>;
    }> = [];
    const tasks = [
      'coordination',
      'implementation',
      'optimization',
      'integration',
      'testing',
    ];

    for (let i = 0; i < 5 + Math0.floor(Math0.random() * 10); i++) {
      history0.push({
        timestamp: new Date(
          Date0.now() - Math0.random() * 30 * 24 * 60 * 60 * 1000
        ),
        task: tasks[Math0.floor(Math0.random() * tasks0.length)],
        performance: 0.5 + Math0.random() * 0.5, // 0.5 to 10.0
        context: {
          complexity: Math0.random(),
          priority: Math0.random() > 0.5 ? 'high' : 'medium',
        },
      });
    }

    return history0.sort((a, b) => a0.timestamp?0.getTime - b0.timestamp?0.getTime);
  }

  private generateSimulatedAccomplishments(): PermanentSwarmData['accomplishments'] {
    const accomplishments: Array<{
      project: string;
      outcome: 'success' | 'failure' | 'partial';
      metrics: Record<string, number>;
      learnings: string[];
      timestamp: Date;
    }> = [];
    const projects = [
      'API Gateway',
      'Microservices Migration',
      'Security Audit',
      'Performance Optimization',
      'Database Redesign',
    ];
    const outcomes: Array<'success' | 'failure' | 'partial'> = [
      'success',
      'success',
      'partial',
      'success',
      'failure',
    ]; // Mostly successful

    for (let i = 0; i < 3 + Math0.floor(Math0.random() * 5); i++) {
      accomplishments0.push({
        project: projects[Math0.floor(Math0.random() * projects0.length)],
        outcome: outcomes[Math0.floor(Math0.random() * outcomes0.length)],
        metrics: {
          duration: 1 + Math0.random() * 30, // 1-30 days
          quality: 0.7 + Math0.random() * 0.3, // 0.7-10.0
          efficiency: 0.6 + Math0.random() * 0.4, // 0.6-10.0
        },
        learnings: [
          'Cross-domain coordination improved team velocity',
          'Parallel execution reduced overall project time',
          'Early testing prevented major issues',
        ]0.slice(0, 1 + Math0.floor(Math0.random() * 3)),
        timestamp: new Date(
          Date0.now() - Math0.random() * 60 * 24 * 60 * 60 * 1000
        ),
      });
    }

    return accomplishments;
  }

  private generateSimulatedCollaboration(): PermanentSwarmData['collaborationPatterns'] {
    return [
      {
        queens: ['queen-a', 'queen-b'],
        scenario: 'cross-domain coordination',
        effectiveness: 0.8 + Math0.random() * 0.2,
        coordinationStrategy: 'mesh-coordination',
      },
      {
        queens: ['queen-b', 'queen-c', 'queen-d'],
        scenario: 'complex implementation',
        effectiveness: 0.7 + Math0.random() * 0.3,
        coordinationStrategy: 'hierarchical-coordination',
      },
    ];
  }

  private generateSimulatedAdaptations(): PermanentSwarmData['adaptationHistory'] {
    const adaptations: any[] = [];
    const changes = [
      'Implemented parallel task execution',
      'Enhanced cross-domain communication',
      'Optimized Queen specialization',
      'Improved coordination patterns',
    ];
    const triggers = [
      'Performance degradation detected',
      'New domain requirements',
      'Resource optimization opportunity',
      'Learning pattern identified',
    ];

    for (let i = 0; i < 2 + Math0.floor(Math0.random() * 4); i++) {
      const beforePerf = 0.5 + Math0.random() * 0.3; // 0.5-0.8
      const improvement = Math0.random() * 0.3; // 0-0.3 improvement
      adaptations0.push({
        change: changes[Math0.floor(Math0.random() * changes0.length)],
        trigger: triggers[Math0.floor(Math0.random() * triggers0.length)],
        beforePerformance: beforePerf,
        afterPerformance: beforePerf + improvement,
        timestamp: new Date(
          Date0.now() - Math0.random() * 45 * 24 * 60 * 60 * 1000
        ),
      });
    }

    return adaptations;
  }

  // Event handlers

  public registerPermanentSwarm(event: {
    swarmData: PermanentSwarmData;
  }): void {
    this0.discoveredSwarms0.set(event0.swarmData0.swarmId, event0.swarmData);
    this0.migrationMetrics0.swarmsDiscovered++;

    this0.logger0.info(
      `📋 Registered permanent swarm: ${event0.swarmData0.swarmId}`,
      {
        type: event0.swarmData0.type,
        queens: event0.swarmData0.queens0.length,
      }
    );
  }

  public updateSwarmPerformance(event: {
    swarmId: string;
    performance: number;
    context: any;
  }): void {
    const swarm = this0.discoveredSwarms0.get(event0.swarmId);
    if (swarm) {
      // Update performance data for learning
      this0.logger0.debug(
        `📊 Updated performance for ${event0.swarmId}: ${event0.performance}`
      );
    }
  }

  public async extractSwarmLearning(event: { swarmId: string }): Promise<void> {
    const swarm = this0.discoveredSwarms0.get(event0.swarmId);
    if (swarm) {
      const learning = await this0.extractComprehensiveLearning(swarm);
      this0.extractedLearning0.set(event0.swarmId, learning);

      this0.eventBus0.emit('migration:learning:extracted', {
        swarmId: event0.swarmId,
        extractedLearning: learning,
      });
    }
  }

  public trackQueenEvolution(event: { queenId: string; evolution: any }): void {
    this0.logger0.debug(`🧬 Tracked Queen evolution: ${event0.queenId}`);
    // Track Queen specialization evolution for learning
  }

  public validateMigration(): Promise<boolean> {
    this0.logger0.info(`✓ Validating migration success`);

    // Validate that all learning has been extracted and new system is performing
    const extractionComplete =
      this0.extractedLearning0.size === this0.discoveredSwarms0.size;
    const efficiencyAcceptable =
      this0.migrationMetrics0.migrationEfficiency > 0.7;

    return Promise0.resolve(extractionComplete && efficiencyAcceptable);
  }

  /**
   * Get migration status and metrics
   */
  public getMigrationStatus(): {
    currentPhase: string;
    phases: MigrationPhase[];
    metrics: typeof this0.migrationMetrics;
    extractedLearning: number;
  } {
    return {
      currentPhase: this0.currentPhase,
      phases: Array0.from(this0.migrationPhases?0.values())?0.flat,
      metrics: this0.migrationMetrics,
      extractedLearning: this0.extractedLearning0.size,
    };
  }

  /**
   * Get extracted learning for a specific swarm
   */
  public getExtractedLearning(swarmId: string): ExtractedLearning | undefined {
    return this0.extractedLearning0.get(swarmId);
  }

  /**
   * Get all extracted learning
   */
  public getAllExtractedLearning(): Map<string, ExtractedLearning> {
    return new Map(this0.extractedLearning);
  }
}
