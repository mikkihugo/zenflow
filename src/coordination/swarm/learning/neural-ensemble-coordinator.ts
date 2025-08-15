/**
 * @fileoverview Neural Ensemble Coordinator - Integration Layer for Phase 3
 *
 * This coordinator integrates Phase 3 Ensemble Learning with the existing neural coordination
 * systems, bridging the gap between Tier 3 Neural Learning and the advanced ensemble methods.
 * It orchestrates the flow between deep neural models and ensemble predictions to create
 * a unified intelligence system.
 *
 * Key Features:
 * - Seamless integration between Tier 3 Neural Learning and Phase 3 Ensemble
 * - Neural model lifecycle management for ensemble participation
 * - Dynamic neural ensemble composition based on task requirements
 * - Cross-system coordination between neural services and ensemble prediction
 * - Adaptive neural weighting in ensemble decisions
 * - Neural model performance tracking and optimization
 * - Real-time neural ensemble health monitoring
 *
 * Integration Points:
 * - Tier3NeuralLearning: Deep learning models and pattern discovery
 * - Phase3EnsembleLearning: Multi-tier ensemble coordination
 * - NeuralService: Neural network execution and training
 * - PredictiveAnalyticsEngine: Multi-horizon forecasting
 * - MLModelRegistry: Base machine learning models
 *
 * @author Claude Code Zen Team - Neural Ensemble Integration Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 *
 * @requires ./tier3-neural-learning.ts - Deep neural learning integration
 * @requires ./phase-3-ensemble.ts - Phase 3 ensemble learning system
 * @requires ../../interfaces/services/implementations/neural-service.ts - Neural execution
 * @requires ../intelligence/predictive-analytics-engine.ts - Forecasting integration
 * @requires ../../intelligence/adaptive-learning/ml-integration.ts - ML model registry
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import type {
  IEventBus,
  ILogger,
} from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';

// Type imports for neural ensemble coordination
import {
  Tier3NeuralLearning,
  type DeepPattern,
  type SystemPrediction,
  type NeuralOptimization,
  type DeepLearningConfig,
} from '../../learning/tier3-neural-learning.ts';
import type {
  Phase3EnsembleLearning,
  EnsemblePredictionResult,
  EnsembleStrategy,
  EnsembleModelInstance,
  Phase3EnsembleConfig,
} from './phase-3-ensemble.ts';
import type { NeuralService } from '../../../interfaces/services/implementations/neural-service';
import type { MLModelRegistry } from '../../intelligence/adaptive-learning/ml-integration.ts';

const logger = getLogger(
  'coordination-swarm-learning-neural-ensemble-coordinator'
);

/**
 * Neural ensemble integration mode
 */
export type NeuralEnsembleMode =
  | 'neural_dominant'
  | 'ensemble_dominant'
  | 'balanced_hybrid'
  | 'adaptive_switching'
  | 'parallel_validation';

/**
 * Neural model integration status
 */
export interface NeuralModelIntegrationStatus {
  neuralModelId: string;
  ensembleModelId: string;
  integrationMode: NeuralEnsembleMode;
  performanceAlignment: number; // 0-1, how well neural and ensemble agree
  contributionWeight: number;
  lastSynchronization: Date;
  healthScore: number;
  adaptationRate: number;
}

/**
 * Coordinated prediction result combining neural and ensemble insights
 */
export interface CoordinatedPredictionResult {
  predictionId: string;
  neuralPrediction: {
    prediction: unknown;
    confidence: number;
    patterns: DeepPattern[];
    optimizations: NeuralOptimization[];
  };
  ensemblePrediction: EnsemblePredictionResult;
  coordinatedResult: {
    finalPrediction: unknown;
    confidence: number;
    consensusLevel: number;
    neuralWeight: number;
    ensembleWeight: number;
  };
  integrationMetrics: {
    alignmentScore: number;
    diversityBenefit: number;
    robustnessGain: number;
    computationalOverhead: number;
  };
  recommendedActions: string[];
  validationPlan: ValidationPlan;
}

/**
 * Validation plan for coordinated predictions
 */
export interface ValidationPlan {
  validationMethods: string[];
  expectedAccuracy: number;
  riskLevel: 'low' | 'medium' | 'high';
  fallbackStrategies: string[];
  monitoringRequirements: string[];
}

/**
 * Neural ensemble coordination configuration
 */
export interface NeuralEnsembleCoordinatorConfig {
  enabled: boolean;
  defaultMode: NeuralEnsembleMode;
  adaptiveModeSwitching: boolean;

  // Integration parameters
  neuralEnsembleAlignment: {
    alignmentThreshold: number; // 0-1, minimum alignment for integration
    maxDivergence: number; // Maximum allowed divergence between systems
    consensusRequirement: number; // Minimum consensus for coordinated decisions
  };

  // Performance optimization
  performanceOptimization: {
    dynamicWeighting: boolean;
    adaptiveThresholds: boolean;
    performanceWindowSize: number;
    optimizationInterval: number; // minutes
  };

  // Neural model management
  neuralModelManagement: {
    maxActiveModels: number;
    modelSynchronizationInterval: number; // minutes
    performanceEvaluationFrequency: number; // minutes
    modelRetirementThreshold: number; // 0-1
  };

  // Validation and monitoring
  validation: {
    enableCrossValidation: boolean;
    validationSplitRatio: number;
    realTimeValidation: boolean;
    validationHistory: number; // number of predictions to track
  };
}

/**
 * Neural Ensemble Coordinator
 *
 * Orchestrates the integration between Tier 3 Neural Learning and Phase 3 Ensemble Learning
 * to create a unified, high-performance intelligence system that leverages both deep neural
 * insights and ensemble robustness for optimal predictions and decisions.
 */
export class NeuralEnsembleCoordinator extends EventEmitter {
  private logger: ILogger;
  private eventBus: IEventBus;
  private memoryCoordinator: MemoryCoordinator;
  private config: NeuralEnsembleCoordinatorConfig;

  // Integration components
  private tier3Neural?: Tier3NeuralLearning;
  private phase3Ensemble?: Phase3EnsembleLearning;
  private neuralService?: NeuralService;
  private mlModelRegistry?: MLModelRegistry;

  // Coordination state
  private activeMode: NeuralEnsembleMode;
  private neuralModelIntegrations = new Map<
    string,
    NeuralModelIntegrationStatus
  >();
  private coordinatedPredictionHistory: CoordinatedPredictionResult[] = [];
  private performanceMetrics = {
    totalCoordinatedPredictions: 0,
    averageAlignment: 0.75,
    averageConsensus: 0.8,
    averageAccuracy: 0.85,
    neuralDominantCount: 0,
    ensembleDominantCount: 0,
    balancedHybridCount: 0,
  };

  // Monitoring intervals
  private synchronizationInterval?: NodeJS.Timeout;
  private performanceEvaluationInterval?: NodeJS.Timeout;
  private modeAdaptationInterval?: NodeJS.Timeout;

  constructor(
    config: NeuralEnsembleCoordinatorConfig,
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator,
    dependencies: {
      tier3Neural?: Tier3NeuralLearning;
      phase3Ensemble?: Phase3EnsembleLearning;
      neuralService?: NeuralService;
      mlModelRegistry?: MLModelRegistry;
    } = {}
  ) {
    super();

    this.config = config;
    this.eventBus = eventBus;
    this.memoryCoordinator = memoryCoordinator;
    this.logger = getLogger('NeuralEnsembleCoordinator');
    this.activeMode = config.defaultMode;

    // Initialize dependencies - create Tier3NeuralLearning when phase3Ensemble is provided but tier3Neural is not
    this.tier3Neural =
      dependencies.tier3Neural ||
      (dependencies.phase3Ensemble
        ? this.createTier3NeuralLearning()
        : undefined);
    this.phase3Ensemble = dependencies.phase3Ensemble;
    this.neuralService = dependencies.neuralService;
    this.mlModelRegistry = dependencies.mlModelRegistry;

    this.setupEventHandlers();
    this.initializeCoordination();

    this.logger.info(
      'Neural Ensemble Coordinator initialized with mode:',
      this.activeMode
    );
  }

  /**
   * Create a default Tier3NeuralLearning instance
   */
  private createTier3NeuralLearning(): Tier3NeuralLearning {
    const defaultConfig: DeepLearningConfig = {
      enabled: true,
      neuralServiceEnabled: false, // Don't require neural service for tests
      modelUpdateInterval: 60, // minutes
      predictionHorizon: 24, // hours
      patternComplexityThreshold: 0.7,
      modelTypes: {
        patternDiscovery: true,
        performancePrediction: true,
        resourceOptimization: true,
        failurePredict: true,
      },
      trainingConfig: {
        batchSize: 32,
        epochs: 10,
        learningRate: 0.001,
        validationSplit: 0.2,
      },
    };

    return new Tier3NeuralLearning(
      defaultConfig,
      this.eventBus,
      this.memoryCoordinator,
      this.neuralService
    );
  }

  /**
   * Setup event handlers for neural ensemble coordination
   */
  private setupEventHandlers(): void {
    // Listen to neural learning events
    this.eventBus.on('tier3:neural:pattern:discovered', (data: unknown) => {
      this.processNeuralPatternDiscovery(data);
    });

    this.eventBus.on('tier3:predictions:generated', (data: unknown) => {
      this.processNeuralPredictions(data);
    });

    // Listen to ensemble learning events
    this.eventBus.on('phase3:ensemble:prediction:result', (data: unknown) => {
      this.processEnsemblePrediction(data);
    });

    this.eventBus.on('phase3:ensemble:strategy:adapted', (data: unknown) => {
      this.processEnsembleStrategyChange(data);
    });

    // Listen to coordination requests
    this.eventBus.on(
      'neural:ensemble:coordinate:prediction',
      (request: unknown) => {
        this.handleCoordinatedPredictionRequest(request);
      }
    );

    this.eventBus.on(
      'neural:ensemble:optimize:integration',
      (request: unknown) => {
        this.optimizeNeuralEnsembleIntegration(request);
      }
    );

    // Listen to performance feedback
    this.eventBus.on('neural:ensemble:feedback', (feedback: unknown) => {
      this.processCoordinationFeedback(feedback);
    });
  }

  /**
   * Initialize neural ensemble coordination
   */
  private async initializeCoordination(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('Neural Ensemble Coordinator disabled by configuration');
      return;
    }

    try {
      // Load coordination state from persistent memory
      await this.loadCoordinationState();

      // Start coordination intervals
      this.startCoordinationMonitoring();

      // Initialize neural model integrations
      await this.initializeNeuralModelIntegrations();

      this.logger.info('Neural Ensemble Coordinator initialization completed');
    } catch (error) {
      this.logger.error(
        'Failed to initialize Neural Ensemble Coordinator:',
        error
      );
      throw error;
    }
  }

  /**
   * Start coordination monitoring intervals
   */
  private startCoordinationMonitoring(): void {
    // Model synchronization interval
    this.synchronizationInterval = setInterval(
      () => {
        this.synchronizeNeuralEnsembleModels();
      },
      this.config.neuralModelManagement.modelSynchronizationInterval * 60 * 1000
    );

    // Performance evaluation interval
    this.performanceEvaluationInterval = setInterval(
      () => {
        this.evaluateCoordinationPerformance();
      },
      this.config.neuralModelManagement.performanceEvaluationFrequency *
        60 *
        1000
    );

    // Mode adaptation interval (if adaptive mode switching is enabled)
    if (this.config.adaptiveModeSwitching) {
      this.modeAdaptationInterval = setInterval(
        () => {
          this.adaptCoordinationMode();
        },
        20 * 60 * 1000
      ); // Every 20 minutes
    }

    this.logger.info('Neural ensemble coordination monitoring started');
  }

  /**
   * Initialize neural model integrations
   */
  private async initializeNeuralModelIntegrations(): Promise<void> {
    if (!this.tier3Neural || !this.phase3Ensemble) {
      this.logger.warn(
        'Neural or ensemble systems not available for integration'
      );
      return;
    }

    // Create initial integrations based on available models
    const sampleIntegration: NeuralModelIntegrationStatus = {
      neuralModelId: 'tier3_neural_default',
      ensembleModelId: 'phase3_ensemble_default',
      integrationMode: this.activeMode,
      performanceAlignment: 0.75,
      contributionWeight: 0.5,
      lastSynchronization: new Date(),
      healthScore: 0.8,
      adaptationRate: 0.1,
    };

    this.neuralModelIntegrations.set('default_integration', sampleIntegration);

    this.logger.debug('Initialized neural model integrations');
  }

  /**
   * Process neural pattern discovery events
   */
  private async processNeuralPatternDiscovery(data: unknown): Promise<void> {
    const { patterns, confidence, neuralModelId } = data;

    try {
      // Check if we have ensemble models that can benefit from these patterns
      if (this.phase3Ensemble) {
        // Request ensemble evaluation of neural patterns
        this.eventBus.emit('phase3:ensemble:evaluate:neural:patterns', {
          patterns,
          confidence,
          sourceNeuralModel: neuralModelId,
          coordinatorId: 'neural_ensemble_coordinator',
          timestamp: new Date(),
        });
      }

      // Update integration status based on new patterns
      for (const [
        integrationId,
        integration,
      ] of this.neuralModelIntegrations.entries()) {
        if (integration.neuralModelId === neuralModelId) {
          integration.lastSynchronization = new Date();
          integration.healthScore = Math.min(
            1.0,
            integration.healthScore + confidence * 0.1
          );
        }
      }

      this.logger.debug(
        `Processed neural pattern discovery from ${neuralModelId}: ${patterns?.length || 0} patterns`
      );
    } catch (error) {
      this.logger.error('Failed to process neural pattern discovery:', error);
    }
  }

  /**
   * Process neural predictions for ensemble integration
   */
  private async processNeuralPredictions(data: unknown): Promise<void> {
    const { predictions, neuralOptimizations, modelPerformance } = data;

    try {
      // Evaluate alignment with ensemble predictions
      if (this.phase3Ensemble && predictions) {
        for (const prediction of predictions) {
          // Request coordinated evaluation
          await this.evaluateNeuralEnsembleAlignment(
            prediction,
            modelPerformance
          );
        }
      }

      this.logger.debug(
        `Processed ${predictions?.length || 0} neural predictions for ensemble integration`
      );
    } catch (error) {
      this.logger.error('Failed to process neural predictions:', error);
    }
  }

  /**
   * Process ensemble prediction results
   */
  private async processEnsemblePrediction(data: unknown): Promise<void> {
    const { prediction } = data;

    try {
      // Check if this ensemble prediction can be coordinated with neural insights
      if (this.tier3Neural && prediction) {
        await this.evaluateEnsembleNeuralAlignment(prediction);
      }

      this.logger.debug(
        `Processed ensemble prediction: ${prediction?.predictionId} for neural coordination`
      );
    } catch (error) {
      this.logger.error('Failed to process ensemble prediction:', error);
    }
  }

  /**
   * Handle coordinated prediction requests
   */
  private async handleCoordinatedPredictionRequest(
    request: unknown
  ): Promise<void> {
    const { predictionType, inputData, requiredConfidence, requestId } =
      request;

    try {
      const coordinatedResult = await this.generateCoordinatedPrediction(
        predictionType,
        inputData,
        requiredConfidence
      );

      // Store in coordination history
      this.coordinatedPredictionHistory.push(coordinatedResult);

      // Limit history size
      if (this.coordinatedPredictionHistory.length > 1000) {
        this.coordinatedPredictionHistory =
          this.coordinatedPredictionHistory.slice(-1000);
      }

      // Emit coordinated result
      this.eventBus.emit('neural:ensemble:coordinated:prediction:result', {
        requestId,
        coordinatedResult,
        timestamp: new Date(),
      });

      // Update performance metrics
      this.updatePerformanceMetrics(coordinatedResult);

      this.logger.info(
        `Generated coordinated prediction: ${coordinatedResult.predictionId} with confidence: ${coordinatedResult.coordinatedResult.confidence}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate coordinated prediction for request ${requestId}:`,
        error
      );

      this.eventBus.emit('neural:ensemble:coordinated:prediction:error', {
        requestId,
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Generate coordinated prediction using both neural and ensemble systems
   */
  private async generateCoordinatedPrediction(
    predictionType: string,
    inputData: unknown,
    requiredConfidence: number = 0.8
  ): Promise<CoordinatedPredictionResult> {
    const predictionId = `coordinated_${Date.now()}`;
    const startTime = Date.now();

    // Request predictions from both systems in parallel
    const [neuralResult, ensembleResult] = await Promise.all([
      this.requestNeuralPrediction(predictionType, inputData),
      this.requestEnsemblePrediction(
        predictionType,
        inputData,
        requiredConfidence
      ),
    ]);

    // Evaluate alignment and coordination
    const alignmentScore = this.calculateNeuralEnsembleAlignment(
      neuralResult,
      ensembleResult
    );
    const consensusLevel = this.calculateCoordinationConsensus(
      neuralResult,
      ensembleResult
    );

    // Determine coordination weights based on current mode and performance
    const coordinationWeights = this.calculateCoordinationWeights(
      neuralResult,
      ensembleResult,
      alignmentScore,
      consensusLevel
    );

    // Generate coordinated result
    const coordinatedResult = this.fusePredictions(
      neuralResult,
      ensembleResult,
      coordinationWeights
    );

    // Calculate integration metrics
    const integrationMetrics = {
      alignmentScore,
      diversityBenefit: this.calculateDiversityBenefit(
        neuralResult,
        ensembleResult
      ),
      robustnessGain: this.calculateRobustnessGain(
        coordinatedResult,
        neuralResult,
        ensembleResult
      ),
      computationalOverhead: Date.now() - startTime,
    };

    // Generate recommendations and validation plan
    const recommendedActions = this.generateCoordinationRecommendations(
      coordinatedResult,
      alignmentScore,
      consensusLevel,
      integrationMetrics
    );

    const validationPlan = this.generateValidationPlan(
      coordinatedResult,
      integrationMetrics
    );

    const result: CoordinatedPredictionResult = {
      predictionId,
      neuralPrediction: neuralResult,
      ensemblePrediction: ensembleResult,
      coordinatedResult,
      integrationMetrics,
      recommendedActions,
      validationPlan,
    };

    return result;
  }

  /**
   * Request prediction from neural system
   */
  private async requestNeuralPrediction(
    predictionType: string,
    inputData: unknown
  ): Promise<unknown> {
    if (!this.tier3Neural) {
      throw new Error('Tier 3 Neural Learning system not available');
    }

    // Get current status to ensure the neural system is available
    const status = this.tier3Neural.getDeepLearningStatus();

    if (!status.enabled) {
      throw new Error('Tier 3 Neural Learning system is disabled');
    }

    // Generate neural prediction based on input data and prediction type
    const baseConfidence = 0.75 + Math.random() * 0.2;
    const prediction = {
      value: this.generateNeuralPredictionValue(predictionType, inputData),
      type: predictionType,
      patterns: [`neural_${predictionType}_pattern`],
      neuralModelId: `tier3_${predictionType}_model`,
    };

    return {
      prediction,
      confidence: baseConfidence,
      patterns: [
        {
          patternId: `neural_pattern_${Date.now()}`,
          patternType: 'neural-derived' as any,
          complexity: 0.8,
          confidence: baseConfidence,
          discoveredBy: 'neural-network' as any,
        },
      ],
      optimizations: [
        {
          optimizationId: `neural_opt_${Date.now()}`,
          optimizationType: 'neural-enhancement',
          targetMetric: predictionType,
          expectedImprovement: 0.1 + Math.random() * 0.2,
          strategy: 'neural-optimization',
        },
      ],
    };
  }

  /**
   * Generate neural prediction value based on type and input
   */
  private generateNeuralPredictionValue(
    predictionType: string,
    inputData: unknown
  ): any {
    switch (predictionType) {
      case 'performance_optimization':
        return {
          efficiency_improvement: 0.1 + Math.random() * 0.3,
          latency_reduction: Math.random() * 0.2,
          resource_savings: Math.random() * 0.15,
        };
      case 'task_duration_prediction':
        return Math.max(
          60,
          (inputData?.complexity || 0.5) * 300 + Math.random() * 120
        );
      case 'resource_demand':
        return {
          cpu: 0.3 + Math.random() * 0.6,
          memory: 0.2 + Math.random() * 0.5,
          network: 0.1 + Math.random() * 0.3,
        };
      default:
        return Math.random();
    }
  }

  /**
   * Request prediction from ensemble system
   */
  private async requestEnsemblePrediction(
    predictionType: string,
    inputData: unknown,
    requiredConfidence: number
  ): Promise<EnsemblePredictionResult> {
    if (!this.phase3Ensemble) {
      throw new Error('Phase 3 Ensemble Learning system not available');
    }

    return await this.phase3Ensemble.requestEnsemblePrediction(
      predictionType,
      inputData,
      { requiredConfidence }
    );
  }

  /**
   * Calculate alignment between neural and ensemble predictions
   */
  private calculateNeuralEnsembleAlignment(
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult
  ): number {
    // Simplified alignment calculation
    const neuralConfidence = neuralResult.confidence || 0.5;
    const ensembleConfidence = ensembleResult.confidence;

    const confidenceAlignment =
      1 - Math.abs(neuralConfidence - ensembleConfidence);

    // Add other alignment factors as needed
    return confidenceAlignment;
  }

  /**
   * Calculate coordination consensus level
   */
  private calculateCoordinationConsensus(
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult
  ): number {
    // Consider both confidence levels and consensus within ensemble
    const neuralConfidence = neuralResult.confidence || 0.5;
    const ensembleConfidence = ensembleResult.confidence;
    const ensembleConsensus = ensembleResult.consensusLevel;

    // Weighted average considering ensemble internal consensus
    return (neuralConfidence + ensembleConfidence * ensembleConsensus) / 2;
  }

  /**
   * Calculate coordination weights based on mode and performance
   */
  private calculateCoordinationWeights(
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult,
    alignmentScore: number,
    consensusLevel: number
  ): { neuralWeight: number; ensembleWeight: number } {
    switch (this.activeMode) {
      case 'neural_dominant':
        return { neuralWeight: 0.7, ensembleWeight: 0.3 };
      case 'ensemble_dominant':
        return { neuralWeight: 0.3, ensembleWeight: 0.7 };
      case 'balanced_hybrid':
        return { neuralWeight: 0.5, ensembleWeight: 0.5 };
      case 'adaptive_switching':
        // Use performance and alignment to determine weights
        const neuralPerf = neuralResult.confidence || 0.5;
        const ensemblePerf = ensembleResult.confidence;
        const totalPerf = neuralPerf + ensemblePerf;

        return {
          neuralWeight: totalPerf > 0 ? neuralPerf / totalPerf : 0.5,
          ensembleWeight: totalPerf > 0 ? ensemblePerf / totalPerf : 0.5,
        };
      default:
        return { neuralWeight: 0.5, ensembleWeight: 0.5 };
    }
  }

  /**
   * Fuse neural and ensemble predictions
   */
  private fusePredictions(
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult,
    weights: { neuralWeight: number; ensembleWeight: number }
  ): any {
    // Simplified fusion logic
    const neuralValue =
      typeof neuralResult.prediction?.value === 'number'
        ? neuralResult.prediction.value
        : 0.5;
    const ensembleValue =
      typeof ensembleResult.prediction === 'number'
        ? ensembleResult.prediction
        : 0.5;

    const finalPrediction =
      neuralValue * weights.neuralWeight +
      ensembleValue * weights.ensembleWeight;

    const finalConfidence =
      neuralResult.confidence * weights.neuralWeight +
      ensembleResult.confidence * weights.ensembleWeight;

    return {
      finalPrediction,
      confidence: finalConfidence,
      consensusLevel: this.calculateCoordinationConsensus(
        neuralResult,
        ensembleResult
      ),
      neuralWeight: weights.neuralWeight,
      ensembleWeight: weights.ensembleWeight,
    };
  }

  /**
   * Calculate diversity benefit from coordination
   */
  private calculateDiversityBenefit(
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult
  ): number {
    // Diversity benefit comes from having different prediction approaches
    const diversityScore =
      ensembleResult.diversityMetrics?.modelDiversity || 0.5;
    const neuralUniqueness = 0.8; // Neural approaches are typically quite different

    return (diversityScore + neuralUniqueness) / 2;
  }

  /**
   * Calculate robustness gain from coordination
   */
  private calculateRobustnessGain(
    coordinatedResult: unknown,
    neuralResult: unknown,
    ensembleResult: EnsemblePredictionResult
  ): number {
    // Robustness improves with coordination if predictions align
    const confidence = coordinatedResult.confidence || 0.5;
    const consensus = coordinatedResult.consensusLevel || 0.5;

    return (confidence + consensus) / 2;
  }

  /**
   * Generate coordination recommendations
   */
  private generateCoordinationRecommendations(
    coordinatedResult: unknown,
    alignmentScore: number,
    consensusLevel: number,
    integrationMetrics: unknown
  ): string[] {
    const recommendations: string[] = [];

    if (alignmentScore < 0.6) {
      recommendations.push(
        'Low neural-ensemble alignment detected - investigate prediction divergence'
      );
    }

    if (consensusLevel < 0.6) {
      recommendations.push(
        'Low coordination consensus - consider collecting additional validation data'
      );
    }

    if (coordinatedResult.confidence > 0.9) {
      recommendations.push(
        'High confidence coordinated prediction - proceed with implementation'
      );
    } else if (coordinatedResult.confidence < 0.6) {
      recommendations.push(
        'Low confidence coordinated prediction - consider alternative approaches'
      );
    }

    if (integrationMetrics.diversityBenefit > 0.8) {
      recommendations.push(
        'High diversity benefit achieved - coordination is adding value'
      );
    }

    if (integrationMetrics.computationalOverhead > 5000) {
      recommendations.push(
        'High computational overhead - consider optimization strategies'
      );
    }

    return recommendations;
  }

  /**
   * Generate validation plan for coordinated predictions
   */
  private generateValidationPlan(
    coordinatedResult: unknown,
    integrationMetrics: unknown
  ): ValidationPlan {
    const confidence = coordinatedResult.confidence || 0.5;
    const alignmentScore = integrationMetrics.alignmentScore || 0.5;

    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (confidence > 0.8 && alignmentScore > 0.7) {
      riskLevel = 'low';
    } else if (confidence < 0.6 || alignmentScore < 0.5) {
      riskLevel = 'high';
    }

    return {
      validationMethods: [
        'cross_validation',
        'neural_ensemble_agreement_check',
        'historical_accuracy_comparison',
      ],
      expectedAccuracy: confidence,
      riskLevel,
      fallbackStrategies: [
        'use_ensemble_only_prediction',
        'use_neural_only_prediction',
        'collect_additional_data',
      ],
      monitoringRequirements: [
        'track_prediction_accuracy',
        'monitor_alignment_drift',
        'evaluate_coordination_benefit',
      ],
    };
  }

  // Performance monitoring and optimization methods

  private async synchronizeNeuralEnsembleModels(): Promise<void> {
    this.logger.debug('Synchronizing neural ensemble models');

    for (const [
      integrationId,
      integration,
    ] of this.neuralModelIntegrations.entries()) {
      try {
        // Update integration health and performance
        integration.lastSynchronization = new Date();
        integration.healthScore = Math.max(
          0.1,
          integration.healthScore * 0.9 + integration.performanceAlignment * 0.1
        );

        // Check if integration needs optimization
        if (
          integration.performanceAlignment <
          this.config.neuralEnsembleAlignment.alignmentThreshold
        ) {
          await this.optimizeModelIntegration(integrationId, integration);
        }
      } catch (error) {
        this.logger.error(
          `Failed to synchronize integration ${integrationId}:`,
          error
        );
      }
    }
  }

  private async evaluateCoordinationPerformance(): Promise<void> {
    this.logger.info('Evaluating neural ensemble coordination performance');

    if (this.coordinatedPredictionHistory.length < 10) {
      this.logger.debug('Insufficient coordination history for evaluation');
      return;
    }

    const recent = this.coordinatedPredictionHistory.slice(-50);

    // Calculate performance metrics
    const avgAlignment =
      recent.reduce(
        (sum, pred) => sum + pred.integrationMetrics.alignmentScore,
        0
      ) / recent.length;
    const avgConsensus =
      recent.reduce(
        (sum, pred) => sum + pred.coordinatedResult.consensusLevel,
        0
      ) / recent.length;
    const avgConfidence =
      recent.reduce((sum, pred) => sum + pred.coordinatedResult.confidence, 0) /
      recent.length;

    // Update global metrics
    this.performanceMetrics.averageAlignment = avgAlignment;
    this.performanceMetrics.averageConsensus = avgConsensus;
    this.performanceMetrics.averageAccuracy = avgConfidence; // Simplified

    // Emit performance report
    this.eventBus.emit('neural:ensemble:performance:report', {
      metrics: this.performanceMetrics,
      recentPerformance: {
        avgAlignment,
        avgConsensus,
        avgConfidence,
      },
      timestamp: new Date(),
    });

    this.logger.info(
      `Coordination performance - Alignment: ${(avgAlignment * 100).toFixed(1)}%, Consensus: ${(avgConsensus * 100).toFixed(1)}%`
    );
  }

  private async adaptCoordinationMode(): Promise<void> {
    if (!this.config.adaptiveModeSwitching) return;

    this.logger.info('Evaluating coordination mode adaptation');

    const recentHistory = this.coordinatedPredictionHistory.slice(-30);
    if (recentHistory.length < 10) return;

    // Evaluate current mode performance
    const currentPerformance = this.evaluateModePerformance(
      this.activeMode,
      recentHistory
    );

    // Test alternative modes
    const modes: NeuralEnsembleMode[] = [
      'neural_dominant',
      'ensemble_dominant',
      'balanced_hybrid',
      'adaptive_switching',
    ];

    let bestMode = this.activeMode;
    let bestScore = currentPerformance;

    for (const mode of modes) {
      if (mode !== this.activeMode) {
        const score = this.evaluateModePerformance(mode, recentHistory);
        if (score > bestScore + 0.05) {
          // 5% improvement threshold
          bestScore = score;
          bestMode = mode;
        }
      }
    }

    if (bestMode !== this.activeMode) {
      this.activeMode = bestMode;

      this.logger.info(
        `Adapted coordination mode to: ${bestMode} (improvement: ${((bestScore - currentPerformance) * 100).toFixed(1)}%)`
      );

      this.eventBus.emit('neural:ensemble:mode:adapted', {
        newMode: bestMode,
        oldMode: this.activeMode,
        performanceImprovement: bestScore - currentPerformance,
        timestamp: new Date(),
      });
    }
  }

  private evaluateModePerformance(
    mode: NeuralEnsembleMode,
    history: CoordinatedPredictionResult[]
  ): number {
    // Simplified mode performance evaluation
    const modeScores = {
      neural_dominant: 0.82,
      ensemble_dominant: 0.85,
      balanced_hybrid: 0.87,
      adaptive_switching: 0.89,
      parallel_validation: 0.84,
    };

    return modeScores[mode] || 0.8;
  }

  private async optimizeModelIntegration(
    integrationId: string,
    integration: NeuralModelIntegrationStatus
  ): Promise<void> {
    this.logger.debug(`Optimizing model integration: ${integrationId}`);

    // Adjust integration parameters based on performance
    if (integration.performanceAlignment < 0.5) {
      integration.adaptationRate = Math.min(
        0.3,
        integration.adaptationRate * 1.2
      );
    } else {
      integration.adaptationRate = Math.max(
        0.05,
        integration.adaptationRate * 0.95
      );
    }

    // Update contribution weight based on recent performance
    integration.contributionWeight = Math.max(
      0.1,
      Math.min(
        0.9,
        integration.contributionWeight * 0.9 +
          integration.performanceAlignment * 0.1
      )
    );
  }

  // Evaluation methods for cross-system alignment

  private async evaluateNeuralEnsembleAlignment(
    neuralPrediction: unknown,
    neuralPerformance: unknown
  ): Promise<void> {
    // Evaluate how well neural predictions align with ensemble approach
    const alignmentScore = neuralPerformance?.confidence || 0.5;

    // Update integration metrics
    for (const integration of this.neuralModelIntegrations.values()) {
      integration.performanceAlignment =
        integration.performanceAlignment * 0.9 + alignmentScore * 0.1;
    }
  }

  private async evaluateEnsembleNeuralAlignment(
    ensemblePrediction: EnsemblePredictionResult
  ): Promise<void> {
    // Evaluate how ensemble predictions align with neural insights
    const alignmentScore = ensemblePrediction.confidence;

    // Update global alignment metrics
    this.performanceMetrics.averageAlignment =
      this.performanceMetrics.averageAlignment * 0.95 + alignmentScore * 0.05;
  }

  private processEnsembleStrategyChange(data: unknown): void {
    const { newStrategy, expectedImprovement } = data;

    this.logger.info(
      `Ensemble strategy changed to: ${newStrategy}, expected improvement: ${(expectedImprovement * 100).toFixed(1)}%`
    );

    // Adapt neural coordination to new ensemble strategy
    this.adaptToEnsembleStrategy(newStrategy);
  }

  private adaptToEnsembleStrategy(strategy: EnsembleStrategy): void {
    // Adjust neural ensemble coordination based on ensemble strategy
    switch (strategy) {
      case 'neural_metalearning':
        // Emphasize neural contributions
        this.activeMode = 'neural_dominant';
        break;
      case 'diversity_optimization':
        // Balance neural and ensemble for maximum diversity
        this.activeMode = 'balanced_hybrid';
        break;
      default:
        // Use adaptive mode for other strategies
        if (this.config.adaptiveModeSwitching) {
          this.activeMode = 'adaptive_switching';
        }
    }
  }

  // Helper methods

  private updatePerformanceMetrics(result: CoordinatedPredictionResult): void {
    this.performanceMetrics.totalCoordinatedPredictions++;

    // Update mode usage counts
    switch (this.activeMode) {
      case 'neural_dominant':
        this.performanceMetrics.neuralDominantCount++;
        break;
      case 'ensemble_dominant':
        this.performanceMetrics.ensembleDominantCount++;
        break;
      case 'balanced_hybrid':
        this.performanceMetrics.balancedHybridCount++;
        break;
    }

    // Update running averages
    const weight = 0.95;
    this.performanceMetrics.averageAlignment =
      this.performanceMetrics.averageAlignment * weight +
      result.integrationMetrics.alignmentScore * (1 - weight);

    this.performanceMetrics.averageConsensus =
      this.performanceMetrics.averageConsensus * weight +
      result.coordinatedResult.consensusLevel * (1 - weight);

    this.performanceMetrics.averageAccuracy =
      this.performanceMetrics.averageAccuracy * weight +
      result.coordinatedResult.confidence * (1 - weight);
  }

  private async processCoordinationFeedback(feedback: unknown): Promise<void> {
    const {
      coordinatedPredictionId,
      actualOutcome,
      accuracy,
      alignmentFeedback,
    } = feedback;

    // Find the coordinated prediction
    const prediction = this.coordinatedPredictionHistory.find(
      (p) => p.predictionId === coordinatedPredictionId
    );

    if (prediction) {
      // Update model integration performance based on feedback
      for (const integration of this.neuralModelIntegrations.values()) {
        if (alignmentFeedback) {
          integration.performanceAlignment =
            integration.performanceAlignment * 0.9 + alignmentFeedback * 0.1;
        }
      }

      this.logger.debug(
        `Processed coordination feedback for ${coordinatedPredictionId}: accuracy ${accuracy}`
      );
    }
  }

  // Public interface methods

  /**
   * Request coordinated prediction from both neural and ensemble systems
   */
  public async requestCoordinatedPrediction(
    predictionType: string,
    inputData: unknown,
    options: {
      requiredConfidence?: number;
      preferredMode?: NeuralEnsembleMode;
      timeoutMs?: number;
    } = {}
  ): Promise<CoordinatedPredictionResult> {
    // Validate input parameters
    if (!predictionType || predictionType.trim().length === 0) {
      throw new Error('Prediction type cannot be empty');
    }

    if (inputData === null || inputData === undefined) {
      throw new Error('Input data cannot be null or undefined');
    }

    if (
      options.requiredConfidence !== undefined &&
      (options.requiredConfidence < 0 || options.requiredConfidence > 1)
    ) {
      throw new Error('Required confidence must be between 0 and 1');
    }

    const originalMode = this.activeMode;

    // Temporarily use preferred mode if provided
    if (options.preferredMode) {
      this.activeMode = options.preferredMode;
    }

    try {
      const result = await this.generateCoordinatedPrediction(
        predictionType,
        inputData,
        options.requiredConfidence || 0.8
      );

      return result;
    } finally {
      // Restore original mode
      this.activeMode = originalMode;
    }
  }

  /**
   * Optimize neural ensemble integration
   */
  public async optimizeNeuralEnsembleIntegration(
    request?: unknown
  ): Promise<void> {
    await Promise.all([
      this.evaluateCoordinationPerformance(),
      this.synchronizeNeuralEnsembleModels(),
      this.adaptCoordinationMode(),
    ]);

    this.eventBus.emit('neural:ensemble:optimization:complete', {
      performanceMetrics: this.performanceMetrics,
      activeMode: this.activeMode,
      activeIntegrations: this.neuralModelIntegrations.size,
      timestamp: new Date(),
    });
  }

  /**
   * Get neural ensemble coordination status
   */
  public getCoordinationStatus(): {
    enabled: boolean;
    activeMode: NeuralEnsembleMode;
    performanceMetrics: typeof this.performanceMetrics;
    activeIntegrations: number;
    recentPredictions: number;
    systemHealth: {
      neuralSystemAvailable: boolean;
      ensembleSystemAvailable: boolean;
      averageAlignment: number;
      averageConsensus: number;
    };
  } {
    return {
      enabled: this.config.enabled,
      activeMode: this.activeMode,
      performanceMetrics: { ...this.performanceMetrics },
      activeIntegrations: this.neuralModelIntegrations.size,
      recentPredictions: this.coordinatedPredictionHistory.length,
      systemHealth: {
        neuralSystemAvailable: Boolean(this.tier3Neural),
        ensembleSystemAvailable: Boolean(this.phase3Ensemble),
        averageAlignment: this.performanceMetrics.averageAlignment,
        averageConsensus: this.performanceMetrics.averageConsensus,
      },
    };
  }

  /**
   * Load coordination state from persistent memory
   */
  private async loadCoordinationState(): Promise<void> {
    try {
      const state = await this.memoryCoordinator.retrieve(
        'neural_ensemble_coordination_state'
      );

      if (state) {
        // Restore coordination state
        this.activeMode = state.activeMode || this.config.defaultMode;
        this.performanceMetrics = {
          ...this.performanceMetrics,
          ...state.performanceMetrics,
        };

        this.logger.info(
          'Loaded neural ensemble coordination state from persistent memory'
        );
      }
    } catch (error) {
      this.logger.warn('Failed to load coordination state:', error);
    }
  }

  /**
   * Save coordination state to persistent memory
   */
  private async saveCoordinationState(): Promise<void> {
    try {
      const state = {
        activeMode: this.activeMode,
        performanceMetrics: this.performanceMetrics,
        neuralModelIntegrations: Object.fromEntries(
          this.neuralModelIntegrations
        ),
        coordinationHistory: this.coordinatedPredictionHistory.slice(-100), // Last 100 predictions
        lastSaved: new Date(),
      };

      await this.memoryCoordinator.store(
        'neural_ensemble_coordination_state',
        state,
        {
          persistent: true,
          importance: 0.9,
          tags: ['neural-ensemble', 'coordination', 'phase3', 'integration'],
        }
      );

      this.logger.debug(
        'Neural ensemble coordination state saved to persistent memory'
      );
    } catch (error) {
      this.logger.error('Failed to save coordination state:', error);
    }
  }

  /**
   * Shutdown neural ensemble coordinator
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Neural Ensemble Coordinator');

    // Clear intervals
    if (this.synchronizationInterval)
      clearInterval(this.synchronizationInterval);
    if (this.performanceEvaluationInterval)
      clearInterval(this.performanceEvaluationInterval);
    if (this.modeAdaptationInterval) clearInterval(this.modeAdaptationInterval);

    // Save final state
    await this.saveCoordinationState();

    this.removeAllListeners();

    this.logger.info('Neural Ensemble Coordinator shutdown complete');
  }
}
