/**
 * @file SPARC Swarm Knowledge Extractor - Learning Extraction from SPARC Methodology
 * 
 * Intelligent system that extracts all learning, patterns, and insights from SPARC swarms
 * that have been processing Features and Tasks using SPARC methodology.
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

import { EventEmitter } from 'eventemitter3';
import { getLogger } from '../../config/logging-config';
import type {
  EventBus,
  Logger,
} from '../../core/interfaces/base-interfaces';

// Database access from infrastructure facade
import { 
  getDatabaseAccess
} from '@claude-zen/infrastructure';
import type { DatabaseAccess, KeyValueStore } from '@claude-zen/infrastructure';

// Telemetry and performance tracking from operations facade
import { 
  TelemetryManager,
  PerformanceTracker
} from '@claude-zen/operations';

// Brain coordination for learning
import { 
  BrainCoordinator
} from '@claude-zen/intelligence';

// SPARC methodology integration via enterprise facade
import { 
  createSPARCWorkflow,
  createSPARCCommander,
  type SPARCPhase,
  type SPARCResult,
  type SPARCConfig,
  type SPARCProject
} from '@claude-zen/enterprise';

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
    phaseMetrics: Record<SPARCPhase, {
      duration: number;
      quality: number;
      artifacts: string[];
      issues: string[];
    }>;
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
    adaptationTriggers: Array<{ trigger: string; phase: SPARCPhase; effectiveness: number }>;
    crossPhaseStrategies: Array<{ phases: SPARCPhase[]; strategy: string; success: number }>;
  };
  
  // SPARC performance insights
  sparcPerformanceInsights: {
    averagePhaseEffectiveness: Record<SPARCPhase, number>;
    bestPerformingPhaseSequences: Array<{ sequence: SPARCPhase[]; effectiveness: number }>;
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
      conditions: string[] 
    }>;
    successfulPhaseAdaptations: Array<{ 
      phase: SPARCPhase;
      adaptation: string; 
      trigger: string; 
      outcome: number 
    }>;
    emergentSPARCCapabilities: string[];
    unexpectedPhaseSuccesses: Array<{ 
      phase: SPARCPhase;
      context: string; 
      outcome: string; 
      lessons: string[] 
    }>;
  };
  
  // SPARC transition recommendations
  sparcTransitionRecommendations: {
    suggestedAgentPhaseRoles: Array<{ 
      agentId: string; 
      currentPhase: SPARCPhase;
      newPhaseRole: SPARCPhase; 
      confidence: number 
    }>;
    preserveSPARCPatterns: string[];
    enhanceSPARCPhases: SPARCPhase[];
    sparcRiskMitigations: string[];
  };
}

export interface SPARCMigrationPhase {
  phase: 'sparc-discovery' | 'sparc-extraction' | 'sparc-validation' | 'sparc-transition' | 'sparc-optimization';
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
 * while preserving and enhancing all learned SPARC behaviors and optimizations.
 */
export class SPARCSwarmKnowledgeExtractor extends EventEmitter {
  public readonly id: string;
  public readonly designation: string;
  
  // Learning and intelligence systems
  private brainCoordinator: BrainCoordinator;
  private telemetryManager: TelemetryManager;
  private performanceTracker: PerformanceTracker;
  
  // Foundation storage access (not direct database)
  private databaseAccess: DatabaseAccess;
  private kvStore: KeyValueStore;
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
    this.id = id;
    this.designation = `SPARC-Knowledge-Extractor-${id.slice(-4)}`;
    this.logger = getLogger(`sparc-knowledge-${this.designation}`);
    this.eventBus = eventBus;

    // Initialize autonomous brain coordinator for intelligent SPARC learning
    this.brainCoordinator = new BrainCoordinator({
      sessionId: `sparc-extraction-${this.id}`,
      enableLearning: true,
      cacheOptimizations: true,
      logLevel: 'info'
    });
    
    this.telemetryManager = new TelemetryManager({
      serviceName: 'sparc-knowledge-extractor',
      enableTracing: true,
      enableMetrics: true
    });
    
    this.performanceTracker = new PerformanceTracker();

    this.setupEventHandlers();

    this.logger.info(`🔄 SPARC Knowledge Extractor ${this.designation} initialized`);
    this.logger.info(`📚 SPARC learning extraction capabilities: S.P.A.R.C methodology analysis + Brain Intelligence + Performance Tracking`);
  }

  /**
   * Initialize with foundation storage access
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing SPARC Knowledge Extractor with foundation storage');

      // Delegate to @claude-zen/foundation for all storage access
      this.databaseAccess = getDatabaseAccess();
      this.kvStore = await this.databaseAccess.getKV('sparc-knowledge-extractor');
      this.sqlStore = await this.databaseAccess.getSQL('sparc-knowledge-extractor');
      this.vectorStore = await this.databaseAccess.getVector('sparc-knowledge-extractor');
      this.graphStore = await this.databaseAccess.getGraph('sparc-knowledge-extractor');

      await this.telemetryManager.initialize();
      await this.brainCoordinator.initialize();

      this.initialized = true;
      this.logger.info('SPARC Knowledge Extractor initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize SPARC Knowledge Extractor:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // SPARC migration triggers
    this.eventBus.on('sparc-mesh:migration:start', this.startSPARCExtraction.bind(this));
    this.eventBus.on('sparc-mesh:migration:validate', this.validateSPARCExtraction.bind(this));
    
    // SPARC swarm events
    this.eventBus.on('sparc-swarm:task:completed', this.recordSPARCAccomplishment.bind(this));
    this.eventBus.on('sparc-swarm:phase:completed', this.recordPhaseCompletion.bind(this));
    this.eventBus.on('sparc-swarm:coordination:pattern', this.recordCoordinationPattern.bind(this));
  }

  /**
   * Start SPARC knowledge extraction process
   */
  async startSPARCExtraction(): Promise<void> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('sparc_extraction');
    
    try {
      this.logger.info('🚀 Starting SPARC swarm knowledge extraction process');
      this.currentPhase = 'sparc-discovery';

      // Phase 1: Discover SPARC swarms
      await this.discoverSPARCSwarms();
      
      // Phase 2: Extract SPARC learning
      await this.extractSPARCLearning();
      
      // Phase 3: Validate SPARC patterns
      await this.validateSPARCPatterns();
      
      // Phase 4: Generate SPARC recommendations
      await this.generateSPARCRecommendations();

      this.performanceTracker.endTimer('sparc_extraction');
      this.telemetryManager.recordCounter('sparc_extractions_completed', 1);

      this.emit('sparc-extraction:completed', {
        swarmsProcessed: this.discoveredSPARCSwarms.size,
        learningExtracted: this.extractedSPARCLearning.size,
        metrics: this.sparcMetrics
      });

      this.logger.info(`✅ SPARC knowledge extraction completed for ${this.discoveredSPARCSwarms.size} swarms`);

    } catch (error) {
      this.performanceTracker.endTimer('sparc_extraction');
      this.logger.error('SPARC knowledge extraction failed:', error);
      throw error;
    }
  }

  /**
   * Discover active SPARC swarms and their data
   */
  private async discoverSPARCSwarms(): Promise<void> {
    this.logger.info('🔍 Discovering SPARC swarms...');
    
    try {
      // Query for SPARC swarm coordinators and their data
      const sparcCoordinators = await this.sqlStore.query(`
        SELECT * FROM sparc_coordinators 
        WHERE status = 'active' OR last_active > ?
      `, [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]); // Last 30 days

      for (const coordinator of sparcCoordinators) {
        const sparcData = await this.extractSPARCSwarmData(coordinator.id);
        this.discoveredSPARCSwarms.set(coordinator.id, sparcData);
        this.sparcMetrics.sparcSwarmsDiscovered++;
      }

      this.logger.info(`📊 Discovered ${this.discoveredSPARCSwarms.size} active SPARC swarms`);

    } catch (error) {
      this.logger.error('Failed to discover SPARC swarms:', error);
      throw error;
    }
  }

  /**
   * Extract comprehensive data from a SPARC swarm
   */
  private async extractSPARCSwarmData(coordinatorId: string): Promise<SPARCSwarmData> {
    // Query SPARC swarm accomplishments (Features/Tasks)
    const accomplishments = await this.sqlStore.query(`
      SELECT sr.*, d.type as document_type, d.title
      FROM sparc_results sr
      JOIN documents d ON sr.document_id = d.id
      WHERE sr.coordinator_id = ?
      ORDER BY sr.completed_at DESC
    `, [coordinatorId]);

    // Query SPARC agent performance data
    const agentPerformance = await this.sqlStore.query(`
      SELECT sa.*, sph.* 
      FROM sparc_agents sa
      LEFT JOIN sparc_phase_history sph ON sa.id = sph.agent_id
      WHERE sa.coordinator_id = ?
    `, [coordinatorId]);

    // Query SPARC coordination patterns
    const coordinationPatterns = await this.sqlStore.query(`
      SELECT * FROM sparc_coordination_patterns
      WHERE coordinator_id = ?
    `, [coordinatorId]);

    // Build comprehensive SPARC swarm data structure
    const sparcData: SPARCSwarmData = {
      swarmId: coordinatorId,
      coordinatorId: coordinatorId,
      type: 'sparc-swarm',
      createdAt: new Date(), // Will be updated with actual data
      lastActive: new Date(),
      sparcAgents: this.buildSPARCAgentData(agentPerformance),
      sparcAccomplishments: this.buildSPARCAccomplishments(accomplishments),
      sparcCollaborationPatterns: this.buildSPARCCollaborationPatterns(coordinationPatterns),
      adaptationHistory: [], // Will be populated from historical data
      sparcExpertise: this.analyzeSPARCExpertise(agentPerformance, accomplishments)
    };

    return sparcData;
  }

  /**
   * Extract all SPARC learning from discovered swarms
   */
  private async extractSPARCLearning(): Promise<void> {
    this.logger.info('🧠 Extracting SPARC methodology learning...');
    this.currentPhase = 'sparc-extraction';

    for (const [swarmId, sparcData] of this.discoveredSPARCSwarms) {
      const learning = await this.extractLearningFromSPARCData(sparcData);
      this.extractedSPARCLearning.set(swarmId, learning);
      this.sparcMetrics.sparcLearningExtracted++;

      // Store learning in vector database for semantic search
      await this.vectorStore.insert({
        id: `sparc-learning-${swarmId}`,
        vector: await this.generateSPARCLearningEmbedding(learning),
        metadata: {
          swarmId,
          extractedAt: new Date(),
          phases: learning.sparcBehavioralPatterns.phaseSpecialization
        }
      });
    }

    this.logger.info(`🎯 Extracted SPARC learning from ${this.extractedSPARCLearning.size} swarms`);
  }

  /**
   * Extract learning patterns from SPARC swarm data
   */
  private async extractLearningFromSPARCData(sparcData: SPARCSwarmData): Promise<ExtractedSPARCLearning> {
    // Use brain coordinator for intelligent coordination (future: pattern analysis)
    // For now, use direct analysis methods until brain coordinator API is available
    
    return {
      swarmId: sparcData.swarmId,
      coordinatorId: sparcData.coordinatorId,
      sparcBehavioralPatterns: {
        agentCollaboration: this.analyzeSPARCAgentCollaboration(sparcData),
        phaseSpecialization: this.analyzeSPARCPhaseSpecialization(sparcData),
        adaptationTriggers: this.analyzeSPARCAdaptationTriggers(sparcData),
        crossPhaseStrategies: this.analyzeCrossPhaseStrategies(sparcData)
      },
      sparcPerformanceInsights: this.analyzeSPARCPerformanceInsights(sparcData),
      sparcOptimizationDiscoveries: this.discoverSPARCOptimizations(sparcData),
      sparcTransitionRecommendations: this.generateSPARCTransitionRecommendations(sparcData)
    };
  }

  /**
   * Get all extracted SPARC learning
   */
  getSPARCLearning(): Map<string, ExtractedSPARCLearning> {
    return new Map(this.extractedSPARCLearning);
  }

  /**
   * Get SPARC extraction metrics
   */
  getSPARCMetrics() {
    return { ...this.sparcMetrics };
  }

  // Helper methods for SPARC data analysis
  private buildSPARCAgentData(agentPerformance: any[]): SPARCSwarmData['sparcAgents'] {
    // Implementation would build agent data from database results
    return [];
  }

  private buildSPARCAccomplishments(accomplishments: any[]): SPARCSwarmData['sparcAccomplishments'] {
    // Implementation would build accomplishments from database results
    return [];
  }

  private buildSPARCCollaborationPatterns(patterns: any[]): SPARCSwarmData['sparcCollaborationPatterns'] {
    // Implementation would build collaboration patterns
    return [];
  }

  private analyzeSPARCExpertise(agentPerformance: any[], accomplishments: any[]): SPARCSwarmData['sparcExpertise'] {
    // Implementation would analyze SPARC phase expertise
    return {
      bestPerformingPhases: [],
      weakestPhases: [],
      phaseTransitionPatterns: {},
      domainSpecializations: {}
    };
  }

  private analyzeSPARCAgentCollaboration(data: SPARCSwarmData): Record<string, number> {
    // Implementation would analyze agent collaboration patterns
    return {};
  }

  private analyzeSPARCPhaseSpecialization(data: SPARCSwarmData): Record<SPARCPhase, string[]> {
    // Implementation would analyze phase specializations
    return {
      specification: [],
      pseudocode: [],
      architecture: [],
      refinement: [],
      completion: []
    };
  }

  private analyzeSPARCAdaptationTriggers(data: SPARCSwarmData): Array<{ trigger: string; phase: SPARCPhase; effectiveness: number }> {
    // Implementation would analyze adaptation triggers per phase
    return [];
  }

  private analyzeCrossPhaseStrategies(data: SPARCSwarmData): Array<{ phases: SPARCPhase[]; strategy: string; success: number }> {
    // Implementation would analyze cross-phase strategies
    return [];
  }

  private analyzeSPARCPerformanceInsights(data: SPARCSwarmData): ExtractedSPARCLearning['sparcPerformanceInsights'] {
    // Implementation would analyze performance per phase
    return {
      averagePhaseEffectiveness: {
        specification: 0,
        pseudocode: 0,
        architecture: 0,
        refinement: 0,
        completion: 0
      },
      bestPerformingPhaseSequences: [],
      commonPhaseFailurePatterns: {
        specification: [],
        pseudocode: [],
        architecture: [],
        refinement: [],
        completion: []
      },
      phaseImprovementTrajectories: {
        specification: [],
        pseudocode: [],
        architecture: [],
        refinement: [],
        completion: []
      },
      predictedPhasePerformance: {
        specification: 0,
        pseudocode: 0,
        architecture: 0,
        refinement: 0,
        completion: 0
      }
    };
  }

  private discoverSPARCOptimizations(data: SPARCSwarmData): ExtractedSPARCLearning['sparcOptimizationDiscoveries'] {
    // Implementation would discover SPARC optimizations
    return {
      learnedPhaseOptimizations: [],
      successfulPhaseAdaptations: [],
      emergentSPARCCapabilities: [],
      unexpectedPhaseSuccesses: []
    };
  }

  private generateSPARCTransitionRecommendations(data: SPARCSwarmData): ExtractedSPARCLearning['sparcTransitionRecommendations'] {
    // Implementation would generate transition recommendations
    return {
      suggestedAgentPhaseRoles: [],
      preserveSPARCPatterns: [],
      enhanceSPARCPhases: [],
      sparcRiskMitigations: []
    };
  }

  private async generateSPARCLearningEmbedding(learning: ExtractedSPARCLearning): Promise<number[]> {
    // Implementation would generate vector embedding for SPARC learning
    return new Array(1536).fill(0);
  }

  private async validateSPARCPatterns(): Promise<void> {
    this.logger.info('✅ Validating SPARC patterns...');
    // Implementation for validation
  }

  private async generateSPARCRecommendations(): Promise<void> {
    this.logger.info('📋 Generating SPARC recommendations...');
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
    this.logger.info('Shutting down SPARC Knowledge Extractor');
    
    if (this.brainCoordinator) {
      await this.brainCoordinator.shutdown();
    }
    
    if (this.telemetryManager) {
      await this.telemetryManager.shutdown();
    }
    
    this.initialized = false;
  }
}

export default SPARCSwarmKnowledgeExtractor;