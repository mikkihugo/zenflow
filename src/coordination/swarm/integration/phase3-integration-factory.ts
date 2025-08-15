/**
 * @fileoverview Phase 3 Integration Factory - Setup and Configuration
 *
 * This factory provides convenient methods for setting up and configuring the complete
 * Phase 3 integration system. It handles the creation and initialization of all
 * integration components and provides sensible defaults for different use cases.
 *
 * Key Features:
 * - Simplified setup for Phase 3 integration systems
 * - Auto-discovery and connection of available components
 * - Configurable integration profiles for different scenarios
 * - Dependency injection and service registration
 * - Error handling and graceful fallbacks
 *
 * Usage Scenarios:
 * - Development: Full integration with fallback data
 * - Testing: Mock systems with controlled data
 * - Production: Real system integration with monitoring
 * - Demo: Realistic simulation data for demonstrations
 *
 * @author Claude Code Zen Team - Phase3Integrator Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import type {
  IEventBus,
  ILogger,
} from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../../memory/core/memory-coordinator.ts';

// Import integration components
import {
  Phase3IntegratorService,
  type Phase3IntegratorServiceConfig,
} from './phase3-integrator-service.ts';
import {
  Phase3EnsembleLearning,
  type Phase3EnsembleConfig,
} from '../learning/phase-3-ensemble.ts';
import {
  NeuralEnsembleCoordinator,
  type NeuralEnsembleCoordinatorConfig,
} from '../learning/neural-ensemble-coordinator.ts';

// Import system types
import type { SwarmService } from '../../../services/coordination/swarm-service.ts';

const logger = getLogger(
  'coordination-swarm-integration-phase3-integration-factory'
);

/**
 * Integration profiles for different use cases
 */
export type IntegrationProfile =
  | 'development'
  | 'testing'
  | 'production'
  | 'demo';

/**
 * Factory configuration for Phase 3 integration
 */
export interface Phase3IntegrationFactoryConfig {
  profile: IntegrationProfile;
  enableRealSystems: boolean;
  enableFallbackData: boolean;
  enableAutoDiscovery: boolean;
  customConfig?: {
    integratorService?: Partial<Phase3IntegratorServiceConfig>;
    ensemble?: Partial<Phase3EnsembleConfig>;
    neuralCoordinator?: Partial<NeuralEnsembleCoordinatorConfig>;
  };
}

/**
 * Created integration bundle
 */
export interface Phase3IntegrationBundle {
  integratorService: Phase3IntegratorService;
  ensembleSystem?: Phase3EnsembleLearning;
  neuralCoordinator?: NeuralEnsembleCoordinator;
  isInitialized: boolean;
  profile: IntegrationProfile;
  systemsConnected: string[];
}

/**
 * Phase 3 Integration Factory
 *
 * Provides convenient factory methods for creating and configuring the complete
 * Phase 3 integration system. Handles dependency injection, service registration,
 * and provides different configuration profiles for various use cases.
 */
export class Phase3IntegrationFactory {
  private logger: ILogger;

  constructor() {
    this.logger = getLogger('Phase3IntegrationFactory');
  }

  /**
   * Create a complete Phase 3 integration bundle
   */
  public async createIntegrationBundle(
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator,
    config: Phase3IntegrationFactoryConfig,
    availableSystems: {
      swarmService?: SwarmService;
      existingEnsemble?: Phase3EnsembleLearning;
      existingCoordinator?: NeuralEnsembleCoordinator;
    } = {}
  ): Promise<Phase3IntegrationBundle> {
    this.logger.info(
      `Creating Phase 3 integration bundle with profile: ${config.profile}`
    );

    try {
      // Get profile-specific configurations
      const profileConfigs = this.getProfileConfigurations(config.profile);

      // Merge with custom config
      const integratorConfig = {
        ...profileConfigs.integratorService,
        ...config.customConfig?.integratorService,
      };

      const ensembleConfig = {
        ...profileConfigs.ensemble,
        ...config.customConfig?.ensemble,
      };

      const coordinatorConfig = {
        ...profileConfigs.neuralCoordinator,
        ...config.customConfig?.neuralCoordinator,
      };

      // Create systems if needed and enabled
      let ensembleSystem = availableSystems.existingEnsemble;
      let neuralCoordinator = availableSystems.existingCoordinator;
      const systemsConnected: string[] = [];

      // Create ensemble system if not provided and real systems are enabled
      if (
        !ensembleSystem &&
        config.enableRealSystems &&
        ensembleConfig.enabled
      ) {
        ensembleSystem = new Phase3EnsembleLearning(
          ensembleConfig,
          eventBus,
          memoryCoordinator
        );
        systemsConnected.push('phase3-ensemble');
        this.logger.debug('Created new Phase3EnsembleLearning system');
      }

      // Create neural coordinator if not provided and real systems are enabled
      if (
        !neuralCoordinator &&
        config.enableRealSystems &&
        coordinatorConfig.enabled
      ) {
        neuralCoordinator = new NeuralEnsembleCoordinator(
          coordinatorConfig,
          eventBus,
          memoryCoordinator,
          {
            phase3Ensemble: ensembleSystem,
          }
        );
        systemsConnected.push('neural-coordinator');
        this.logger.debug('Created new NeuralEnsembleCoordinator');
      }

      // Track connected systems
      if (availableSystems.swarmService) {
        systemsConnected.push('swarm-service');
      }
      if (availableSystems.existingEnsemble) {
        systemsConnected.push('existing-ensemble');
      }
      if (availableSystems.existingCoordinator) {
        systemsConnected.push('existing-coordinator');
      }

      // Create integrator service
      const integratorService = new Phase3IntegratorService(
        integratorConfig,
        eventBus,
        memoryCoordinator
      );

      // Initialize integrator service with available systems
      await integratorService.initialize({
        swarmService: availableSystems.swarmService,
        phase3Ensemble: ensembleSystem,
        neuralCoordinator: neuralCoordinator,
      });

      const bundle: Phase3IntegrationBundle = {
        integratorService,
        ensembleSystem,
        neuralCoordinator,
        isInitialized: true,
        profile: config.profile,
        systemsConnected,
      };

      this.logger.info(
        `Phase 3 integration bundle created successfully with ${systemsConnected.length} systems connected`
      );

      return bundle;
    } catch (error) {
      this.logger.error('Failed to create Phase 3 integration bundle:', error);
      throw error;
    }
  }

  /**
   * Create a simple integration service for basic use cases
   */
  public async createSimpleIntegration(
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator,
    profile: IntegrationProfile = 'development'
  ): Promise<Phase3IntegratorService> {
    const config: Phase3IntegrationFactoryConfig = {
      profile,
      enableRealSystems: profile !== 'testing',
      enableFallbackData: true,
      enableAutoDiscovery: true,
    };

    const bundle = await this.createIntegrationBundle(
      eventBus,
      memoryCoordinator,
      config
    );

    return bundle.integratorService;
  }

  /**
   * Create integration for Learning Monitor specifically
   */
  public async createLearningMonitorIntegration(
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator,
    existingSystems: {
      ensembleSystem?: Phase3EnsembleLearning;
      coordinator?: NeuralEnsembleCoordinator;
      swarmService?: SwarmService;
    } = {}
  ): Promise<Phase3IntegratorService> {
    const config: Phase3IntegrationFactoryConfig = {
      profile: 'development',
      enableRealSystems: true,
      enableFallbackData: true,
      enableAutoDiscovery: true,
      customConfig: {
        integratorService: {
          updateInterval: 2000, // 2 seconds for responsive UI
          healthCheckInterval: 5000, // 5 seconds
          fallbackDataEnabled: true,
        },
      },
    };

    const bundle = await this.createIntegrationBundle(
      eventBus,
      memoryCoordinator,
      config,
      {
        swarmService: existingSystems.swarmService,
        existingEnsemble: existingSystems.ensembleSystem,
        existingCoordinator: existingSystems.coordinator,
      }
    );

    // Start the integration service for immediate use
    await bundle.integratorService.start();

    this.logger.info('Learning Monitor integration created and started');

    return bundle.integratorService;
  }

  /**
   * Get profile-specific configurations
   */
  private getProfileConfigurations(profile: IntegrationProfile): {
    integratorService: Phase3IntegratorServiceConfig;
    ensemble: Phase3EnsembleConfig;
    neuralCoordinator: NeuralEnsembleCoordinatorConfig;
  } {
    const baseConfigs = {
      development: {
        integratorService: {
          enabled: true,
          autoDiscovery: true,
          enableDataBridge: true,
          enableSwarmIntegrator: true,
          updateInterval: 2000,
          healthCheckInterval: 10000,
          fallbackDataEnabled: true,
        },
        ensemble: {
          enabled: true,
          defaultStrategy: 'adaptive_stacking' as const,
          adaptiveStrategySelection: true,
          maxModelsPerTier: 10,
          modelRetentionPeriod: 7,
          performanceEvaluationInterval: 5,
          minimumConsensusThreshold: 0.6,
          confidenceThreshold: 0.7,
          uncertaintyToleranceLevel: 0.3,
          diversityRequirement: 0.5,
          weightUpdateFrequency: 10,
          performanceWindowSize: 20,
          adaptationSensitivity: 0.7,
          predictionValidationEnabled: true,
          crossValidationFolds: 5,
          ensembleStabilityThreshold: 0.8,
        },
        neuralCoordinator: {
          enabled: true,
          defaultMode: 'adaptive_switching' as const,
          adaptiveModeSwitching: true,
          neuralEnsembleAlignment: {
            alignmentThreshold: 0.6,
            maxDivergence: 0.4,
            consensusRequirement: 0.7,
          },
          performanceOptimization: {
            dynamicWeighting: true,
            adaptiveThresholds: true,
            performanceWindowSize: 30,
            optimizationInterval: 15,
          },
          neuralModelManagement: {
            maxActiveModels: 5,
            modelSynchronizationInterval: 10,
            performanceEvaluationFrequency: 15,
            modelRetirementThreshold: 0.3,
          },
          validation: {
            enableCrossValidation: true,
            validationSplitRatio: 0.2,
            realTimeValidation: true,
            validationHistory: 100,
          },
        },
      },
      testing: {
        integratorService: {
          enabled: true,
          autoDiscovery: false,
          enableDataBridge: true,
          enableSwarmIntegrator: false,
          updateInterval: 1000,
          healthCheckInterval: 2000,
          fallbackDataEnabled: true,
        },
        ensemble: {
          enabled: false,
          defaultStrategy: 'weighted_voting' as const,
          adaptiveStrategySelection: false,
          maxModelsPerTier: 3,
          modelRetentionPeriod: 1,
          performanceEvaluationInterval: 1,
          minimumConsensusThreshold: 0.5,
          confidenceThreshold: 0.6,
          uncertaintyToleranceLevel: 0.5,
          diversityRequirement: 0.3,
          weightUpdateFrequency: 1,
          performanceWindowSize: 5,
          adaptationSensitivity: 0.5,
          predictionValidationEnabled: false,
          crossValidationFolds: 3,
          ensembleStabilityThreshold: 0.6,
        },
        neuralCoordinator: {
          enabled: false,
          defaultMode: 'balanced_hybrid' as const,
          adaptiveModeSwitching: false,
          neuralEnsembleAlignment: {
            alignmentThreshold: 0.5,
            maxDivergence: 0.5,
            consensusRequirement: 0.5,
          },
          performanceOptimization: {
            dynamicWeighting: false,
            adaptiveThresholds: false,
            performanceWindowSize: 10,
            optimizationInterval: 5,
          },
          neuralModelManagement: {
            maxActiveModels: 2,
            modelSynchronizationInterval: 5,
            performanceEvaluationFrequency: 5,
            modelRetirementThreshold: 0.2,
          },
          validation: {
            enableCrossValidation: false,
            validationSplitRatio: 0.1,
            realTimeValidation: false,
            validationHistory: 10,
          },
        },
      },
      production: {
        integratorService: {
          enabled: true,
          autoDiscovery: true,
          enableDataBridge: true,
          enableSwarmIntegrator: true,
          updateInterval: 5000,
          healthCheckInterval: 30000,
          fallbackDataEnabled: false,
        },
        ensemble: {
          enabled: true,
          defaultStrategy: 'neural_metalearning' as const,
          adaptiveStrategySelection: true,
          maxModelsPerTier: 20,
          modelRetentionPeriod: 30,
          performanceEvaluationInterval: 15,
          minimumConsensusThreshold: 0.8,
          confidenceThreshold: 0.8,
          uncertaintyToleranceLevel: 0.2,
          diversityRequirement: 0.7,
          weightUpdateFrequency: 30,
          performanceWindowSize: 100,
          adaptationSensitivity: 0.3,
          predictionValidationEnabled: true,
          crossValidationFolds: 10,
          ensembleStabilityThreshold: 0.9,
        },
        neuralCoordinator: {
          enabled: true,
          defaultMode: 'adaptive_switching' as const,
          adaptiveModeSwitching: true,
          neuralEnsembleAlignment: {
            alignmentThreshold: 0.8,
            maxDivergence: 0.2,
            consensusRequirement: 0.8,
          },
          performanceOptimization: {
            dynamicWeighting: true,
            adaptiveThresholds: true,
            performanceWindowSize: 100,
            optimizationInterval: 60,
          },
          neuralModelManagement: {
            maxActiveModels: 10,
            modelSynchronizationInterval: 30,
            performanceEvaluationFrequency: 60,
            modelRetirementThreshold: 0.5,
          },
          validation: {
            enableCrossValidation: true,
            validationSplitRatio: 0.3,
            realTimeValidation: true,
            validationHistory: 1000,
          },
        },
      },
      demo: {
        integratorService: {
          enabled: true,
          autoDiscovery: true,
          enableDataBridge: true,
          enableSwarmIntegrator: true,
          updateInterval: 1000,
          healthCheckInterval: 5000,
          fallbackDataEnabled: true,
        },
        ensemble: {
          enabled: true,
          defaultStrategy: 'hierarchical_fusion' as const,
          adaptiveStrategySelection: true,
          maxModelsPerTier: 5,
          modelRetentionPeriod: 1,
          performanceEvaluationInterval: 2,
          minimumConsensusThreshold: 0.7,
          confidenceThreshold: 0.75,
          uncertaintyToleranceLevel: 0.25,
          diversityRequirement: 0.6,
          weightUpdateFrequency: 5,
          performanceWindowSize: 10,
          adaptationSensitivity: 0.8,
          predictionValidationEnabled: true,
          crossValidationFolds: 3,
          ensembleStabilityThreshold: 0.7,
        },
        neuralCoordinator: {
          enabled: true,
          defaultMode: 'balanced_hybrid' as const,
          adaptiveModeSwitching: true,
          neuralEnsembleAlignment: {
            alignmentThreshold: 0.7,
            maxDivergence: 0.3,
            consensusRequirement: 0.75,
          },
          performanceOptimization: {
            dynamicWeighting: true,
            adaptiveThresholds: true,
            performanceWindowSize: 20,
            optimizationInterval: 10,
          },
          neuralModelManagement: {
            maxActiveModels: 3,
            modelSynchronizationInterval: 5,
            performanceEvaluationFrequency: 10,
            modelRetirementThreshold: 0.4,
          },
          validation: {
            enableCrossValidation: true,
            validationSplitRatio: 0.2,
            realTimeValidation: true,
            validationHistory: 50,
          },
        },
      },
    };

    return baseConfigs[profile];
  }

  /**
   * Create a demo integration with realistic simulation data
   */
  public async createDemoIntegration(
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator
  ): Promise<Phase3IntegratorService> {
    return this.createSimpleIntegration(eventBus, memoryCoordinator, 'demo');
  }

  /**
   * Create a testing integration with minimal overhead
   */
  public async createTestingIntegration(
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator
  ): Promise<Phase3IntegratorService> {
    return this.createSimpleIntegration(eventBus, memoryCoordinator, 'testing');
  }

  /**
   * Shutdown an integration bundle safely
   */
  public async shutdownIntegrationBundle(
    bundle: Phase3IntegrationBundle
  ): Promise<void> {
    this.logger.info('Shutting down Phase 3 integration bundle');

    try {
      // Stop and shutdown integrator service
      await bundle.integratorService.shutdown();

      // Shutdown neural coordinator if created by factory
      if (
        bundle.neuralCoordinator &&
        bundle.systemsConnected.includes('neural-coordinator')
      ) {
        await bundle.neuralCoordinator.shutdown();
      }

      // Shutdown ensemble system if created by factory
      if (
        bundle.ensembleSystem &&
        bundle.systemsConnected.includes('phase3-ensemble')
      ) {
        await bundle.ensembleSystem.shutdown();
      }

      this.logger.info('Phase 3 integration bundle shutdown complete');
    } catch (error) {
      this.logger.error('Failed to shutdown integration bundle:', error);
    }
  }
}
