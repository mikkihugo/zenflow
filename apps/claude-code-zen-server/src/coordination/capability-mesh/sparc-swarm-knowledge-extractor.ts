/**
 * @file SPARC Swarm Knowledge Extractor - Learning Extraction from SPARC Methodology
 *
 * Intelligent system that extracts all learning, patterns, and insights from SPARC swarms
 * that have been processing Features and Tasks using SPARC methodology0.
 *
 * Core Responsibilities:
 * - Extract SPARC phase performance data and optimization patterns
 * - Preserve agent specializations for Specification, Pseudocode, Architecture, Refinement, Completion
 * - Migrate SPARC coordination patterns and decision history
 * - Extract Feature/Task implementation learnings
 * - Ensure zero SPARC learning loss during transitions
 * - Analyze SPARC methodology effectiveness and improvements
 *
 * SPARC Knowledge Integration:
 * - Uses @claude-zen/foundation for storage abstraction and performance tracking
 * - Leverages @claude-zen/intelligence for behavioral intelligence and adaptive learning
 * - Integrates with @claude-zen/intelligence for performance tracking
 * - Utilizes @claude-zen/sparc for methodology patterns
 * - Connects with DatabaseSPARCBridge for implementation data
 */

import { getLogger } from '@claude-zen/foundation';

// Database access from infrastructure facade
// Note: getDatabaseAccess should come from @claude-zen/infrastructure
// import { getDatabaseAccess } from '@claude-zen/infrastructure';
// Temporarily comment out until infrastructure facade is available
import { TypedEventBase } from '@claude-zen/foundation';
import type { EventBus, Logger } from '@claude-zen/foundation';
import { getBrainSystemAccess } from '@claude-zen/intelligence';
import {
  getTelemetryManager,
  getPerformanceTracker,
} from '@claude-zen/operations';

// Brain coordination for learning - use facade getter

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

// SPARC methodology integration via enterprise facade
type SPARCPhase =
  | 'specification'
  | 'pseudocode'
  | 'architecture'
  | 'refinement'
  | 'completion';

const logger = getLogger('sparc-swarm-knowledge-extractor');

export interface SPARCSwarmData {
  swarmId: string;
  coordinatorId: string;
  type: 'sparc-swarm';
  createdAt: Date;
  lastActive: Date;

  // SPARC-specific agent specializations
  sparcAgents: Array<{
    agentId: string;
    sparcPhase: SPARCPhase;
    specialization: string[];
    performanceHistory: Array<{
      timestamp: Date;
      featureOrTask: string;
      phasePerformance: number;
      artifactsGenerated: string[];
      context: Record<string, any>;
    }>;
  }>;

  // Features and Tasks processed
  sparcAccomplishments: Array<{
    documentId: string;
    documentType: 'feature' | 'task';
    sparcTaskId: string;
    outcome: 'completed' | 'failed' | 'partial';
    phaseMetrics: Record<
      SPARCPhase,
      {
        duration: number;
        quality: number;
        artifacts: string[];
        issues: string[];
      }
    >;
    learnings: string[];
    timestamp: Date;
  }>;

  // SPARC coordination patterns
  sparcCollaborationPatterns: Array<{
    phases: SPARCPhase[];
    scenario: string;
    effectiveness: number;
    coordinationStrategy: string;
    phaseDependencies: Record<SPARCPhase, SPARCPhase[]>;
  }>;

  // SPARC methodology adaptations
  adaptationHistory: Array<{
    change: string;
    sparcPhase: SPARCPhase;
    trigger: string;
    beforePerformance: number;
    afterPerformance: number;
    timestamp: Date;
  }>;

  // SPARC domain expertise
  sparcExpertise: {
    bestPerformingPhases: SPARCPhase[];
    weakestPhases: SPARCPhase[];
    phaseTransitionPatterns: Record<string, number>; // "phase1->phase2" -> effectiveness
    domainSpecializations: Record<string, SPARCPhase[]>; // "frontend" -> ["architecture", "completion"]
  };
}

export interface ExtractedSPARCLearning {
  swarmId: string;
  coordinatorId: string;

  // SPARC behavioral patterns
  sparcBehavioralPatterns: {
    agentCollaboration: Record<string, number>; // agentId pairs -> effectiveness
    phaseSpecialization: Record<SPARCPhase, string[]>; // phase -> agent specializations
    adaptationTriggers: Array<{
      trigger: string;
      phase: SPARCPhase;
      effectiveness: number;
    }>;
    crossPhaseStrategies: Array<{
      phases: SPARCPhase[];
      strategy: string;
      success: number;
    }>;
  };

  // SPARC performance insights
  sparcPerformanceInsights: {
    averagePhaseEffectiveness: Record<SPARCPhase, number>;
    bestPerformingPhaseSequences: Array<{
      sequence: SPARCPhase[];
      effectiveness: number;
    }>;
    commonPhaseFailurePatterns: Record<SPARCPhase, string[]>;
    phaseImprovementTrajectories: Record<SPARCPhase, number[]>;
    predictedPhasePerformance: Record<SPARCPhase, number>;
  };

  // SPARC optimization discoveries
  sparcOptimizationDiscoveries: {
    learnedPhaseOptimizations: Array<{
      phase: SPARCPhase;
      optimization: string;
      impact: number;
      conditions: string[];
    }>;
    successfulPhaseAdaptations: Array<{
      phase: SPARCPhase;
      adaptation: string;
      trigger: string;
      outcome: number;
    }>;
    emergentSPARCCapabilities: string[];
    unexpectedPhaseSuccesses: Array<{
      phase: SPARCPhase;
      context: string;
      outcome: string;
      lessons: string[];
    }>;
  };

  // SPARC transition recommendations
  sparcTransitionRecommendations: {
    suggestedAgentPhaseRoles: Array<{
      agentId: string;
      currentPhase: SPARCPhase;
      newPhaseRole: SPARCPhase;
      confidence: number;
    }>;
    preserveSPARCPatterns: string[];
    enhanceSPARCPhases: SPARCPhase[];
    sparcRiskMitigations: string[];
  };
}

export interface SPARCMigrationPhase {
  phase:
    | 'sparc-discovery'
    | 'sparc-extraction'
    | 'sparc-validation'
    | 'sparc-transition'
    | 'sparc-optimization';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  sparcLearningExtracted?: number; // percentage
  validationResults?: {
    sparcPatternPreservation: number;
    phasePerformanceImprovement: number;
    methodologyCapabilityRetention: number;
  };
}

/**
 * SPARC Swarm Knowledge Extractor - Intelligent SPARC Learning Extraction & Transition
 *
 * Orchestrates the extraction of all SPARC methodology learning from permanent SPARC swarms
 * while preserving and enhancing all learned SPARC behaviors and optimizations0.
 */
export class SPARCSwarmKnowledgeExtractor extends TypedEventBase {
  public readonly id: string;
  public readonly designation: string;

  // Learning and intelligence systems
  private brainCoordinator: any; // BrainCoordinator via facade
  private telemetryManager: any;
  private performanceTracker: any;

  // Foundation storage access (not direct database)
  private databaseAccess: any;
  private kvStore: any; // KeyValueStore via facade
  private sqlStore: any;
  private vectorStore: any;
  private graphStore: any;
  private initialized = false;

  // SPARC extraction state
  private discoveredSPARCSwarms = new Map<string, SPARCSwarmData>();
  private extractedSPARCLearning = new Map<string, ExtractedSPARCLearning>();
  private sparcMigrationPhases = new Map<string, SPARCMigrationPhase[]>();
  private currentPhase: string = 'sparc-discovery';

  // SPARC performance tracking
  private sparcMetrics = {
    sparcSwarmsDiscovered: 0,
    sparcLearningExtracted: 0,
    sparcPatternsPreserved: 0,
    phasePerformanceImproved: 0,
    sparcMigrationEfficiency: 0,
    featuresTasksProcessed: 0,
  };

  private logger: Logger;
  private eventBus: EventBus;

  constructor(id: string, eventBus: EventBus) {
    super();
    this0.id = id;
    this0.designation = `SPARC-Knowledge-Extractor-${id0.slice(-4)}`;
    this0.logger = createLoggerAdapter(
      getLogger(`sparc-knowledge-${this0.designation}`)
    );
    this0.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      this0.logger0.info(
        'Initializing SPARC Knowledge Extractor with foundation storage'
      );

      // Initialize autonomous brain coordinator for intelligent SPARC learning
      const brainAccess = await getBrainSystemAccess();
      this0.brainCoordinator =
        (await brainAccess?0.createCoordinator?0.({
          sessionId: `sparc-extraction-${this0.id}`,
          enableLearning: true,
          cacheOptimizations: true,
          logLevel: 'info',
        })) || null;

      this0.telemetryManager = await getTelemetryManager({
        serviceName: 'sparc-knowledge-extractor',
        enableTracing: true,
        enableMetrics: true,
      });

      this0.performanceTracker = await getPerformanceTracker();

      // Delegate to @claude-zen/infrastructure for all storage access
      const { getDatabaseAccess } = await import('@claude-zen/infrastructure');
      this0.databaseAccess = await getDatabaseAccess();
      this0.kvStore = await this0.databaseAccess0.getKV(
        'sparc-knowledge-extractor'
      );
      this0.sqlStore = await this0.databaseAccess0.getSQL(
        'sparc-knowledge-extractor'
      );
      this0.vectorStore = await this0.databaseAccess0.getVector(
        'sparc-knowledge-extractor'
      );
      this0.graphStore = await this0.databaseAccess0.getGraph(
        'sparc-knowledge-extractor'
      );

      await this0.telemetryManager?0.initialize;
      await this0.brainCoordinator?0.initialize;

      this?0.setupEventHandlers;

      this0.initialized = true;
      this0.logger0.info(
        `🔄 SPARC Knowledge Extractor ${this0.designation} initialized successfully`
      );
      this0.logger0.info(
        `📚 SPARC learning extraction capabilities: S0.P0.A0.R0.C methodology analysis + Brain Intelligence + Performance Tracking`
      );
    } catch (error) {
      this0.logger0.error(
        'Failed to initialize SPARC Knowledge Extractor:',
        error
      );
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // SPARC migration triggers
    this0.eventBus0.on(
      'sparc-mesh:migration:start',
      this0.startSPARCExtraction0.bind(this)
    );
    this0.eventBus0.on(
      'sparc-mesh:migration:validate',
      this0.validateSPARCExtraction0.bind(this)
    );

    // SPARC swarm events
    this0.eventBus0.on(
      'sparc-swarm:task:completed',
      this0.recordSPARCAccomplishment0.bind(this)
    );
    this0.eventBus0.on(
      'sparc-swarm:phase:completed',
      this0.recordPhaseCompletion0.bind(this)
    );
    this0.eventBus0.on(
      'sparc-swarm:coordination:pattern',
      this0.recordCoordinationPattern0.bind(this)
    );
  }

  /**
   * Start SPARC knowledge extraction process
   */
  async startSPARCExtraction(): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    const timer = this0.performanceTracker0.startTimer('sparc_extraction');

    try {
      this0.logger0.info('🚀 Starting SPARC swarm knowledge extraction process');
      this0.currentPhase = 'sparc-discovery';

      // Phase 1: Discover SPARC swarms
      await this?0.discoverSPARCSwarms;

      // Phase 2: Extract SPARC learning
      await this?0.extractSPARCLearning;

      // Phase 3: Validate SPARC patterns
      await this?0.validateSPARCPatterns;

      // Phase 4: Generate SPARC recommendations
      await this?0.generateSPARCRecommendations;

      this0.performanceTracker0.endTimer('sparc_extraction');
      this0.telemetryManager0.recordCounter('sparc_extractions_completed', 1);

      this0.emit('sparc-extraction:completed', {
        swarmsProcessed: this0.discoveredSPARCSwarms0.size,
        learningExtracted: this0.extractedSPARCLearning0.size,
        metrics: this0.sparcMetrics,
      });

      this0.logger0.info(
        `✅ SPARC knowledge extraction completed for ${this0.discoveredSPARCSwarms0.size} swarms`
      );
    } catch (error) {
      this0.performanceTracker0.endTimer('sparc_extraction');
      this0.logger0.error('SPARC knowledge extraction failed:', error);
      throw error;
    }
  }

  /**
   * Discover active SPARC swarms and their data
   */
  private async discoverSPARCSwarms(): Promise<void> {
    this0.logger0.info('🔍 Discovering SPARC swarms0.0.0.');

    try {
      // Query for SPARC swarm coordinators and their data
      const sparcCoordinators = await this0.sqlStore0.query(
        `
        SELECT * FROM sparc_coordinators 
        WHERE status = 'active' OR last_active > ?
      `,
        [new Date(Date0.now() - 30 * 24 * 60 * 60 * 1000)]
      ); // Last 30 days

      for (const coordinator of sparcCoordinators) {
        const sparcData = await this0.extractSPARCSwarmData(coordinator0.id);
        this0.discoveredSPARCSwarms0.set(coordinator0.id, sparcData);
        this0.sparcMetrics0.sparcSwarmsDiscovered++;
      }

      this0.logger0.info(
        `📊 Discovered ${this0.discoveredSPARCSwarms0.size} active SPARC swarms`
      );
    } catch (error) {
      this0.logger0.error('Failed to discover SPARC swarms:', error);
      throw error;
    }
  }

  /**
   * Extract comprehensive data from a SPARC swarm
   */
  private async extractSPARCSwarmData(
    coordinatorId: string
  ): Promise<SPARCSwarmData> {
    // Query SPARC swarm accomplishments (Features/Tasks)
    const accomplishments = await this0.sqlStore0.query(
      `
      SELECT sr0.*, d0.type as document_type, d0.title
      FROM sparc_results sr
      JOIN documents d ON sr0.document_id = d0.id
      WHERE sr0.coordinator_id = ?
      ORDER BY sr0.completed_at DESC
    `,
      [coordinatorId]
    );

    // Query SPARC agent performance data
    const agentPerformance = await this0.sqlStore0.query(
      `
      SELECT sa0.*, sph0.* 
      FROM sparc_agents sa
      LEFT JOIN sparc_phase_history sph ON sa0.id = sph0.agent_id
      WHERE sa0.coordinator_id = ?
    `,
      [coordinatorId]
    );

    // Query SPARC coordination patterns
    const coordinationPatterns = await this0.sqlStore0.query(
      `
      SELECT * FROM sparc_coordination_patterns
      WHERE coordinator_id = ?
    `,
      [coordinatorId]
    );

    // Build comprehensive SPARC swarm data structure
    const sparcData: SPARCSwarmData = {
      swarmId: coordinatorId,
      coordinatorId: coordinatorId,
      type: 'sparc-swarm',
      createdAt: new Date(), // Will be updated with actual data
      lastActive: new Date(),
      sparcAgents: this0.buildSPARCAgentData(agentPerformance),
      sparcAccomplishments: this0.buildSPARCAccomplishments(accomplishments),
      sparcCollaborationPatterns:
        this0.buildSPARCCollaborationPatterns(coordinationPatterns),
      adaptationHistory: [], // Will be populated from historical data
      sparcExpertise: this0.analyzeSPARCExpertise(
        agentPerformance,
        accomplishments
      ),
    };

    return sparcData;
  }

  /**
   * Extract all SPARC learning from discovered swarms
   */
  private async extractSPARCLearning(): Promise<void> {
    this0.logger0.info('🧠 Extracting SPARC methodology learning0.0.0.');
    this0.currentPhase = 'sparc-extraction';

    for (const [swarmId, sparcData] of this0.discoveredSPARCSwarms) {
      const learning = await this0.extractLearningFromSPARCData(sparcData);
      this0.extractedSPARCLearning0.set(swarmId, learning);
      this0.sparcMetrics0.sparcLearningExtracted++;

      // Store learning in vector database for semantic search
      await this0.vectorStore0.insert({
        id: `sparc-learning-${swarmId}`,
        vector: await this0.generateSPARCLearningEmbedding(learning),
        metadata: {
          swarmId,
          extractedAt: new Date(),
          phases: learning0.sparcBehavioralPatterns0.phaseSpecialization,
        },
      });
    }

    this0.logger0.info(
      `🎯 Extracted SPARC learning from ${this0.extractedSPARCLearning0.size} swarms`
    );
  }

  /**
   * Extract learning patterns from SPARC swarm data
   */
  private async extractLearningFromSPARCData(
    sparcData: SPARCSwarmData
  ): Promise<ExtractedSPARCLearning> {
    // Use brain coordinator for intelligent coordination (future: pattern analysis)
    // For now, use direct analysis methods until brain coordinator API is available

    return {
      swarmId: sparcData0.swarmId,
      coordinatorId: sparcData0.coordinatorId,
      sparcBehavioralPatterns: {
        agentCollaboration: this0.analyzeSPARCAgentCollaboration(sparcData),
        phaseSpecialization: this0.analyzeSPARCPhaseSpecialization(sparcData),
        adaptationTriggers: this0.analyzeSPARCAdaptationTriggers(sparcData),
        crossPhaseStrategies: this0.analyzeCrossPhaseStrategies(sparcData),
      },
      sparcPerformanceInsights: this0.analyzeSPARCPerformanceInsights(sparcData),
      sparcOptimizationDiscoveries: this0.discoverSPARCOptimizations(sparcData),
      sparcTransitionRecommendations:
        this0.generateSPARCTransitionRecommendations(sparcData),
    };
  }

  /**
   * Get all extracted SPARC learning
   */
  getSPARCLearning(): Map<string, ExtractedSPARCLearning> {
    return new Map(this0.extractedSPARCLearning);
  }

  /**
   * Get SPARC extraction metrics
   */
  getSPARCMetrics() {
    return { 0.0.0.this0.sparcMetrics };
  }

  // Helper methods for SPARC data analysis
  private buildSPARCAgentData(
    agentPerformance: any[]
  ): SPARCSwarmData['sparcAgents'] {
    // Implementation would build agent data from database results
    return [];
  }

  private buildSPARCAccomplishments(
    accomplishments: any[]
  ): SPARCSwarmData['sparcAccomplishments'] {
    // Implementation would build accomplishments from database results
    return [];
  }

  private buildSPARCCollaborationPatterns(
    patterns: any[]
  ): SPARCSwarmData['sparcCollaborationPatterns'] {
    // Implementation would build collaboration patterns
    return [];
  }

  private analyzeSPARCExpertise(
    agentPerformance: any[],
    accomplishments: any[]
  ): SPARCSwarmData['sparcExpertise'] {
    // Implementation would analyze SPARC phase expertise
    return {
      bestPerformingPhases: [],
      weakestPhases: [],
      phaseTransitionPatterns: {},
      domainSpecializations: {},
    };
  }

  private analyzeSPARCAgentCollaboration(
    data: SPARCSwarmData
  ): Record<string, number> {
    // Implementation would analyze agent collaboration patterns
    return {};
  }

  private analyzeSPARCPhaseSpecialization(
    data: SPARCSwarmData
  ): Record<SPARCPhase, string[]> {
    // Implementation would analyze phase specializations
    return {
      specification: [],
      pseudocode: [],
      architecture: [],
      refinement: [],
      completion: [],
    };
  }

  private analyzeSPARCAdaptationTriggers(
    data: SPARCSwarmData
  ): Array<{ trigger: string; phase: SPARCPhase; effectiveness: number }> {
    // Implementation would analyze adaptation triggers per phase
    return [];
  }

  private analyzeCrossPhaseStrategies(
    data: SPARCSwarmData
  ): Array<{ phases: SPARCPhase[]; strategy: string; success: number }> {
    // Implementation would analyze cross-phase strategies
    return [];
  }

  private analyzeSPARCPerformanceInsights(
    data: SPARCSwarmData
  ): ExtractedSPARCLearning['sparcPerformanceInsights'] {
    // Implementation would analyze performance per phase
    return {
      averagePhaseEffectiveness: {
        specification: 0,
        pseudocode: 0,
        architecture: 0,
        refinement: 0,
        completion: 0,
      },
      bestPerformingPhaseSequences: [],
      commonPhaseFailurePatterns: {
        specification: [],
        pseudocode: [],
        architecture: [],
        refinement: [],
        completion: [],
      },
      phaseImprovementTrajectories: {
        specification: [],
        pseudocode: [],
        architecture: [],
        refinement: [],
        completion: [],
      },
      predictedPhasePerformance: {
        specification: 0,
        pseudocode: 0,
        architecture: 0,
        refinement: 0,
        completion: 0,
      },
    };
  }

  private discoverSPARCOptimizations(
    data: SPARCSwarmData
  ): ExtractedSPARCLearning['sparcOptimizationDiscoveries'] {
    // Implementation would discover SPARC optimizations
    return {
      learnedPhaseOptimizations: [],
      successfulPhaseAdaptations: [],
      emergentSPARCCapabilities: [],
      unexpectedPhaseSuccesses: [],
    };
  }

  private generateSPARCTransitionRecommendations(
    data: SPARCSwarmData
  ): ExtractedSPARCLearning['sparcTransitionRecommendations'] {
    // Implementation would generate transition recommendations
    return {
      suggestedAgentPhaseRoles: [],
      preserveSPARCPatterns: [],
      enhanceSPARCPhases: [],
      sparcRiskMitigations: [],
    };
  }

  private async generateSPARCLearningEmbedding(
    learning: ExtractedSPARCLearning
  ): Promise<number[]> {
    // Implementation would generate vector embedding for SPARC learning
    return new Array(1536)0.fill(0);
  }

  private async validateSPARCPatterns(): Promise<void> {
    this0.logger0.info('✅ Validating SPARC patterns0.0.0.');
    // Implementation for validation
  }

  private async generateSPARCRecommendations(): Promise<void> {
    this0.logger0.info('📋 Generating SPARC recommendations0.0.0.');
    // Implementation for recommendations
  }

  private async recordSPARCAccomplishment(event: any): Promise<void> {
    // Implementation to record SPARC accomplishments
  }

  private async recordPhaseCompletion(event: any): Promise<void> {
    // Implementation to record phase completions
  }

  private async recordCoordinationPattern(event: any): Promise<void> {
    // Implementation to record coordination patterns
  }

  private async validateSPARCExtraction(): Promise<void> {
    // Implementation for validation
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down SPARC Knowledge Extractor');

    if (this0.brainCoordinator) {
      await this0.brainCoordinator?0.shutdown();
    }

    if (this0.telemetryManager) {
      await this0.telemetryManager?0.shutdown();
    }

    this0.initialized = false;
  }
}

export default SPARCSwarmKnowledgeExtractor;
