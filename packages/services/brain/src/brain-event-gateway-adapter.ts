/**
 * @fileoverview Brain Event Gateway Adapter
 * 
 * Bridges the brain's local EventBus events with the server's EventGateway
 * for API integration. This adapter translates between the brain's event-driven
 * system and the server's request/response API pattern.
 */

import { getLogger, generateUUID } from '@claude-zen/foundation';
import { IntelligenceOrchestrator, type BrainEvents } from './brain-coordinator';
import { TaskAnalyzer, type TaskAnalysisEvents } from './autonomous-optimization-engine';
import { TaskComplexityEstimator, type ComplexityEvents } from './task-complexity-estimator';

const logger = getLogger('BrainEventGatewayAdapter');

/**
 * Event Gateway Adapter for Brain System
 * 
 * This adapter implements the EventGateway interface methods and translates
 * them into brain events, then listens for responses to provide API-style
 * request/response behavior over the event-driven system.
 */
export class BrainEventGatewayAdapter {
  private brain: IntelligenceOrchestrator;
  private taskAnalyzer: TaskAnalyzer;
  private complexityEstimator: TaskComplexityEstimator;
  private initialized = false;

  constructor() {
    this.brain = new IntelligenceOrchestrator({
      sessionId: 'event-gateway-adapter',
      enableLearning: true,
    });
    this.taskAnalyzer = new TaskAnalyzer();
    this.complexityEstimator = new TaskComplexityEstimator();

    logger.info('BrainEventGatewayAdapter created');
  }

  /**
   * Initialize the brain systems
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.brain.initialize();
      await this.taskAnalyzer.initialize();
      await this.complexityEstimator.initialize();

      this.initialized = true;
      logger.info('BrainEventGatewayAdapter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize BrainEventGatewayAdapter:', error);
      throw error;
    }
  }

  /**
   * Analyze brain task - EventGateway interface method
   */
  async analyzeBrainTask(request: { task: string; context?: Record<string, unknown> }): Promise<{
    taskId: string;
    taskType: string;
    complexity: number;
    suggestedTools?: string[];
  }> {
    if (!this.initialized) {
      throw new Error('BrainEventGatewayAdapter not initialized');
    }

    const taskId = generateUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Brain task analysis timeout'));
      }, 10000); // 10 second timeout

      // Listen for analysis completion
      this.taskAnalyzer.once('task:analysis_completed', (event) => {
        clearTimeout(timeout);
        resolve({
          taskId: event.result.taskId,
          taskType: event.result.taskType,
          complexity: event.result.complexity,
          suggestedTools: event.result.suggestedTools,
        });
      });

      // Listen for analysis errors
      this.taskAnalyzer.once('task:analysis_error', (event) => {
        clearTimeout(timeout);
        reject(new Error(`Brain analysis failed: ${event.error}`));
      });

      // Start the analysis
      this.taskAnalyzer.analyzeTask({
        taskId,
        task: request.task,
        context: request.context,
      }).catch(reject);
    });
  }

  /**
   * Optimize brain prompt - EventGateway interface method
   */
  async optimizeBrainPrompt(request: {
    task: string;
    basePrompt: string;
    context?: Record<string, unknown>;
    priority?: string;
  }): Promise<{
    strategy: string;
    prompt: string;
    confidence: number;
    reasoning: string;
  }> {
    if (!this.initialized) {
      throw new Error('BrainEventGatewayAdapter not initialized');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Brain prompt optimization timeout'));
      }, 10000);

      // Listen for optimization completion
      this.brain.once('brain:task_completed', (event) => {
        clearTimeout(timeout);
        resolve({
          strategy: event.result?.strategy || 'basic',
          prompt: event.result?.prompt || request.basePrompt,
          confidence: event.result?.confidence || 0.7,
          reasoning: event.result?.reasoning || 'Default optimization applied',
        });
      });

      // Listen for errors
      this.brain.once('brain:error', (event) => {
        clearTimeout(timeout);
        reject(new Error(`Brain optimization failed: ${event.error}`));
      });

      // Start optimization via brain coordinator
      this.brain.optimizePrompt({
        task: request.task,
        basePrompt: request.basePrompt,
        context: request.context,
      }).catch(reject);
    });
  }

  /**
   * Estimate brain complexity - EventGateway interface method
   */
  async estimateBrainComplexity(request: {
    taskId: string;
    task: string;
    context?: Record<string, unknown>;
  }): Promise<{
    taskId: string;
    estimate: any;
    timestamp: number;
  }> {
    if (!this.initialized) {
      throw new Error('BrainEventGatewayAdapter not initialized');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Brain complexity estimation timeout'));
      }, 10000);

      // Listen for estimation completion
      this.complexityEstimator.once('complexity:estimation_completed', (event) => {
        clearTimeout(timeout);
        resolve({
          taskId: event.taskId,
          estimate: event.estimate,
          timestamp: event.timestamp,
        });
      });

      // Listen for estimation errors
      this.complexityEstimator.once('complexity:estimation_error', (event) => {
        clearTimeout(timeout);
        reject(new Error(`Brain complexity estimation failed: ${event.error}`));
      });

      // Start estimation
      this.complexityEstimator.estimateComplexity(
        request.taskId,
        request.task,
        request.context || {}
      ).catch(reject);
    });
  }

  /**
   * Get brain status - EventGateway interface method
   */
  async getBrainStatus(): Promise<{
    initialized: boolean;
    sessionId?: string;
    metrics: any;
  }> {
    const brainMetrics = this.brain.getMetrics?.() || {};
    const analyzerMetrics = this.taskAnalyzer.getMetrics?.() || {};
    const complexityMetrics = this.complexityEstimator.getComplexityStats?.() || {};

    return {
      initialized: this.initialized,
      sessionId: this.brain.getSessionId?.() || 'event-gateway-adapter',
      metrics: {
        brain: brainMetrics,
        taskAnalyzer: analyzerMetrics,
        complexityEstimator: complexityMetrics,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Shutdown the adapter and all brain systems
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      await this.brain.shutdown();
      // TaskAnalyzer and TaskComplexityEstimator don't have shutdown methods in our simplified design
      
      this.initialized = false;
      logger.info('BrainEventGatewayAdapter shut down successfully');
    } catch (error) {
      logger.error('Error during BrainEventGatewayAdapter shutdown:', error);
      throw error;
    }
  }

  /**
   * Check if adapter is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the underlying brain coordinator for advanced usage
   */
  getBrainCoordinator(): IntelligenceOrchestrator {
    return this.brain;
  }

  /**
   * Get the task analyzer for advanced usage
   */
  getTaskAnalyzer(): TaskAnalyzer {
    return this.taskAnalyzer;
  }

  /**
   * Get the complexity estimator for advanced usage
   */
  getComplexityEstimator(): TaskComplexityEstimator {
    return this.complexityEstimator;
  }
}

// Singleton pattern for server integration
let adapterInstance: BrainEventGatewayAdapter | null = null;

/**
 * Get singleton instance of BrainEventGatewayAdapter
 */
export function getBrainEventGatewayAdapter(): BrainEventGatewayAdapter {
  if (!adapterInstance) {
    adapterInstance = new BrainEventGatewayAdapter();
  }
  return adapterInstance;
}

/**
 * Initialize the brain event gateway adapter
 */
export async function initializeBrainEventGateway(): Promise<BrainEventGatewayAdapter> {
  const adapter = getBrainEventGatewayAdapter();
  if (!adapter.isInitialized()) {
    await adapter.initialize();
  }
  return adapter;
}