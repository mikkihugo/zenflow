/**
 * @file Hybrid Coordination Example - Complete DSPy → Brain → Coordination Flow
 * 
 * Demonstrates the complete integration between:
 * - DSPy engine for symbolic reasoning
 * - Brain package neural networks (FANN WASM)
 * - Foundation infrastructure (logging, config, database, LLM)
 * - Automatic retraining based on coordinationSuccessRate
 * 
 * This example shows Options 2, 3, and 4 in action:
 * - Option 2: Neural capabilities expanded with LLM transformer models
 * - Option 3: Enhanced WASM integration with database storage
 * - Option 4: Coordination feedback loops triggering retraining
 */

import {
  getLogger,
  getDatabaseAccess,
  executeClaudeTask,
  getGlobalLLM,
  getSharedConfig
} from '@claude-zen/foundation';
import {
  DIContainer,
  injectable,
  inject,
  CORE_TOKENS,
  type Logger
} from '@claude-zen/foundation/di';

import { 
  NeuralBridge,
  RetrainingMonitor,
  DSPyLLMBridge,
  type CoordinationTask,
  type CoordinationResult,
  type RetrainingConfig
} from '../index';

import { getBrainConfig } from '../config/brain-config';

/**
 * Comprehensive example of the hybrid brain coordination system.
 * 
 * Shows the complete flow from task input through neural/symbolic processing
 * to coordination output with automatic retraining based on performance.
 */
// @injectable - Temporarily removed due to constructor type incompatibility  
export class HybridCoordinationExample {
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: Logger,
    private neuralBridge: NeuralBridge,
    private retrainingMonitor: RetrainingMonitor,
    private dspyLLMBridge: DSPyLLMBridge
  ) {
    this.logger.info('HybridCoordinationExample initialized with complete brain infrastructure');
  }

  /**
   * Run a complete demonstration of the hybrid coordination system.
   */
  public async runCompleteDemo(): Promise<void> {
    this.logger.info('🚀 Starting Hybrid Coordination System Demo');
    this.logger.info('This demonstrates DSPy → Brain → Coordination → Feedback Loop');
    
    try {
      // Step 1: Initialize all systems
      await this.initializeAllSystems();
      
      // Step 2: Demonstrate different types of coordination tasks
      await this.demonstrateCoordinationTasks();
      
      // Step 3: Show performance monitoring and metrics
      await this.demonstratePerformanceMonitoring();
      
      // Step 4: Trigger retraining based on performance feedback
      await this.demonstrateAutomaticRetraining();
      
      // Step 5: Show improved performance after retraining
      await this.demonstrateImprovedPerformance();
      
      this.logger.info('✅ Hybrid Coordination System Demo completed successfully');
    } catch (error) {
      this.logger.error('❌ Demo failed:', error);
      throw error;
    }
  }

  /**
   * Initialize all components of the hybrid system.
   */
  private async initializeAllSystems(): Promise<void> {
    this.logger.info('📋 Step 1: Initializing hybrid coordination systems...');
    
    // Initialize brain configuration with foundation
    const brainConfig = getBrainConfig();
    this.logger.info('Brain configuration loaded:', {
      wasmEnabled: !!brainConfig.wasmPath,
      dspyTeleprompter: brainConfig.dspy.teleprompter,
      metricsEnabled: brainConfig.performance.trackMetrics
    });

    // Initialize neural bridge with WASM and database integration
    this.logger.info('Initializing neural bridge with WASM and foundation database...');
    await this.neuralBridge.initialize();
    
    // Initialize DSPy-LLM bridge for hybrid processing
    this.logger.info('Initializing DSPy-LLM bridge for symbolic reasoning...');
    await this.dspyLLMBridge.initialize();
    
    // Start retraining monitor for feedback loops
    this.logger.info('Starting retraining monitor for automatic feedback...');
    await this.retrainingMonitor.startMonitoring();
    
    this.logger.info('✅ All systems initialized successfully');
  }

  /**
   * Demonstrate different types of coordination tasks.
   */
  private async demonstrateCoordinationTasks(): Promise<void> {
    this.logger.info('📋 Step 2: Demonstrating coordination task processing...');
    
    const tasks: CoordinationTask[] = [
      {
        id: 'task-001',
        type: 'classification',
        input: 'Analyze this code snippet for potential bugs',
        priority: 'high'
      },
      {
        id: 'task-002', 
        type: 'reasoning',
        input: 'What is the best architecture pattern for a distributed neural system?',
        context: { domain: 'software-architecture', complexity: 'high' },
        priority: 'medium'
      },
      {
        id: 'task-003',
        type: 'coordination',
        input: 'Coordinate between multiple agents to optimize resource allocation',
        context: { agents: 5, resources: ['CPU', 'memory', 'network'] },
        priority: 'critical'
      },
      {
        id: 'task-004',
        type: 'generation',
        input: 'Generate a code implementation for a neural network training loop',
        priority: 'low'
      }
    ];

    const results: CoordinationResult[] = [];
    
    for (const task of tasks) {
      this.logger.info(`Processing ${task.type} task: ${task.id}`);
      
      const result = await this.dspyLLMBridge.processCoordinationTask(task, {
        teleprompter: 'MIPROv2',
        maxTokens: 1000,
        hybridMode: true // Use both neural and symbolic processing
      });
      
      results.push(result);
      
      this.logger.info(`Task ${task.id} completed:`, {
        method: result.method,
        confidence: result.confidence,
        processingTime: result.processingTime,
        tokensUsed: result.metadata.llmTokensUsed,
        neuralNetwork: result.metadata.neuralNetworkUsed
      });
    }
    
    this.logger.info('✅ All coordination tasks processed', {
      totalTasks: results.length,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      averageTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
      methodDistribution: this.getMethodDistribution(results)
    });
  }

  /**
   * Demonstrate performance monitoring and metrics collection.
   */
  private async demonstratePerformanceMonitoring(): Promise<void> {
    this.logger.info('📋 Step 3: Demonstrating performance monitoring...');
    
    // Get current coordination metrics
    const dbAccess = getDatabaseAccess();
    const kv = await dbAccess.getKV('coordination');
    const metricsData = await kv.get('metrics:latest');
    
    if (metricsData) {
      const metrics = JSON.parse(metricsData);
      this.logger.info('Current coordination metrics:', {
        successRate: metrics.coordinationSuccessRate,
        totalTasks: metrics.totalTasks,
        averageTime: metrics.averageProcessingTime,
        lastUpdated: metrics.lastUpdated
      });
    } else {
      this.logger.warn('No coordination metrics found in database');
    }
    
    // Get neural bridge statistics
    const neuralStats = this.neuralBridge.getStats();
    this.logger.info('Neural system statistics:', neuralStats);
    
    // Get retraining history
    const retrainingHistory = await this.retrainingMonitor.getRetrainingHistory(5);
    this.logger.info('Recent retraining history:', {
      totalRetrainings: retrainingHistory.length,
      recentTriggers: retrainingHistory.map(r => r.reason)
    });
    
    this.logger.info('✅ Performance monitoring data collected');
  }

  /**
   * Demonstrate automatic retraining triggered by performance thresholds.
   */
  private async demonstrateAutomaticRetraining(): Promise<void> {
    this.logger.info('📋 Step 4: Demonstrating automatic retraining...');
    
    // Simulate performance degradation by manually triggering retraining
    this.logger.info('Simulating performance degradation scenario...');
    
    const retrainingResult = await this.retrainingMonitor.manualRetrain(
      'Demo: Simulated coordination success rate below threshold (0.65 < 0.8)',
      {
        coordinationSuccessRate: 0.65,
        averageProcessingTime: 1500,
        errorRate: 0.35
      }
    );
    
    this.logger.info('Retraining completed:', {
      success: retrainingResult.success,
      strategy: retrainingResult.strategy,
      duration: retrainingResult.duration,
      improvement: retrainingResult.improvementMetrics
    });
    
    if (retrainingResult.success) {
      this.logger.info('✅ Automatic retraining successful - neural models updated');
    } else {
      this.logger.error('❌ Automatic retraining failed:', retrainingResult.error);
    }
  }

  /**
   * Demonstrate improved performance after retraining.
   */
  private async demonstrateImprovedPerformance(): Promise<void> {
    this.logger.info('📋 Step 5: Demonstrating improved performance after retraining...');
    
    // Process the same tasks again to show improvement
    const improvementTask: CoordinationTask = {
      id: 'task-improvement',
      type: 'coordination',
      input: 'Optimize neural network performance based on recent training data',
      context: { postRetraining: true, expectedImprovement: true },
      priority: 'high'
    };
    
    const beforeTime = Date.now();
    const improvedResult = await this.dspyLLMBridge.processCoordinationTask(improvementTask, {
      teleprompter: 'MIPROv2',
      hybridMode: true
    });
    const afterTime = Date.now();
    
    this.logger.info('Post-retraining task result:', {
      confidence: improvedResult.confidence,
      processingTime: improvedResult.processingTime,
      method: improvedResult.method,
      improvement: 'Expected higher confidence and faster processing'
    });
    
    // Update and display final metrics
    const dbAccess = getDatabaseAccess();
    const finalKv = await dbAccess.getKV('coordination');
    const finalMetricsData = await finalKv.get('metrics:latest');
    
    if (finalMetricsData) {
      const finalMetrics = JSON.parse(finalMetricsData);
      this.logger.info('Final coordination metrics after retraining:', {
        successRate: finalMetrics.coordinationSuccessRate,
        totalTasks: finalMetrics.totalTasks,
        improvement: 'Success rate should trend higher with continued use'
      });
    }
    
    this.logger.info('✅ Performance improvement demonstration completed');
  }

  /**
   * Get distribution of processing methods used.
   */
  private getMethodDistribution(results: CoordinationResult[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    results.forEach(result => {
      distribution[result.method] = (distribution[result.method] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Create example neural networks for different task types.
   */
  public async createExampleNetworks(): Promise<void> {
    this.logger.info('Creating example neural networks for different task types...');
    
    const networkConfigs = [
      { id: 'classification_classifier', type: 'feedforward' as const, layers: [10, 8, 5, 2] },
      { id: 'reasoning_analyzer', type: 'feedforward' as const, layers: [15, 12, 8, 4] },
      { id: 'coordination_optimizer', type: 'feedforward' as const, layers: [20, 16, 12, 6] },
      { id: 'generation_helper', type: 'feedforward' as const, layers: [12, 10, 6, 3] }
    ];
    
    for (const config of networkConfigs) {
      try {
        await this.neuralBridge.createNetwork(config.id, config.type, config.layers);
        this.logger.info(`Created neural network: ${config.id} with layers [${config.layers.join(', ')}]`);
      } catch (error) {
        this.logger.warn(`Failed to create network ${config.id}:`, error);
      }
    }
    
    this.logger.info('✅ Example neural networks created');
  }

  /**
   * Train example networks with sample data.
   */
  public async trainExampleNetworks(): Promise<void> {
    this.logger.info('Training example neural networks with sample data...');
    
    const trainingData = {
      inputs: [
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1],
        [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2]
      ],
      outputs: [
        [1.0, 0.0],
        [0.0, 1.0], 
        [0.5, 0.5]
      ]
    };
    
    const networks = this.neuralBridge.listNetworks();
    
    for (const network of networks) {
      if (network.status === 'idle') {
        try {
          const success = await this.neuralBridge.trainNetwork(
            network.id, 
            trainingData, 
            100 // epochs
          );
          
          if (success) {
            this.logger.info(`Successfully trained network: ${network.id}`);
          } else {
            this.logger.warn(`Training failed for network: ${network.id}`);
          }
        } catch (error) {
          this.logger.error(`Training error for ${network.id}:`, error);
        }
      }
    }
    
    this.logger.info('✅ Neural network training completed');
  }
}

/**
 * Function to run the complete hybrid coordination demo.
 * Can be called from other parts of the application or tests.
 */
export async function runHybridCoordinationDemo(): Promise<void> {
  const logger = getLogger('HybridDemo');
  
  try {
    logger.info('🎯 Initializing Hybrid Coordination Demo...');
    
    // Create DI container and register services
    const container = new DIContainer();
    
    // Use real foundation services instead of mocks
    const sharedConfig = getSharedConfig();
    
    // Adapt foundation neural config to brain NeuralConfig interface
    const neuralConfig = {
      enableTraining: sharedConfig.neural.learning,
      wasmPath: './wasm/claude_zen_neural',
      gpuAcceleration: false
    };
    
    const neuralBridge = new NeuralBridge(logger, neuralConfig);
    const retrainingMonitor = new RetrainingMonitor(logger, sharedConfig);
    const dspyLLMBridge = new DSPyLLMBridge(logger, neuralBridge);
    
    // Create and run demo
    const demo = new HybridCoordinationExample(
      logger,
      neuralBridge,
      retrainingMonitor,
      dspyLLMBridge
    );
    
    // Setup phase
    await demo.createExampleNetworks();
    await demo.trainExampleNetworks();
    
    // Run complete demo
    await demo.runCompleteDemo();
    
    logger.info('🎉 Hybrid Coordination Demo completed successfully!');
    logger.info('This demonstrated:');
    logger.info('  ✅ Option 2: Neural + LLM transformer integration');
    logger.info('  ✅ Option 3: Enhanced WASM with database storage');
    logger.info('  ✅ Option 4: Coordination feedback loops → retraining');
    
  } catch (error) {
    logger.error('❌ Hybrid Coordination Demo failed:', error);
    throw error;
  }
}

export default HybridCoordinationExample;