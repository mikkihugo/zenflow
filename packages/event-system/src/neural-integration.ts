/**
 * @fileoverview Neural Integration for Event System
 * 
 * Intelligent event processing using @claude-zen/brain package.
 * Provides neural-powered event classification, routing, and prediction.
 * 
 * **BRAIN.JS INTEGRATION:**
 * - Event pattern recognition and classification
 * - Intelligent event routing based on learned patterns
 * - Predictive event flow analysis for optimization
 * - Smart event filtering and prioritization
 * 
 * @example Neural event classification
 * ```typescript
 * import { NeuralEventProcessor } from '@claude-zen/event-system/neural';
 * 
 * const processor = new NeuralEventProcessor({
 *   enableLearning: true,
 *   predictionEnabled: true
 * });
 * 
 * // Neural classification of events
 * const classification = await processor.classifyEvent({
 *   type: 'user.action',
 *   payload: { action: 'click', target: 'button' }
 * });
 * 
 * // Smart routing based on neural patterns
 * const route = await processor.predictOptimalRoute(event);
 * ```
 */

import { z } from 'zod';
import {
  getLogger,
  Result,
  ok,
  err,
  safeAsync,
  recordMetric,
  withTrace,
  traced,
  metered
} from '@claude-zen/foundation';
// Import the full BrainCoordinator with learnFromResult method
import {
  BrainCoordinator,
  type BrainConfig
} from '@claude-zen/brain/coordinator';
import type { BaseEvent } from './validation/zod-validation';

const logger = getLogger('NeuralEventProcessor');

// =============================================================================
// NEURAL EVENT PROCESSING CONFIGURATION
// =============================================================================

export interface NeuralEventConfig {
  /** Enable neural learning from event patterns */
  enableLearning: boolean;
  /** Enable event flow prediction */
  predictionEnabled: boolean;
  /** Enable intelligent event routing */
  smartRoutingEnabled: boolean;
  /** Enable event classification */
  classificationEnabled: boolean;
  /** Learning rate for neural networks */
  learningRate: number;
  /** Minimum confidence threshold for predictions */
  confidenceThreshold: number;
  /** Maximum events to store for training */
  maxTrainingEvents: number;
}

// Event classification schema
const EventClassificationSchema = z.object({
  category: z.enum(['COORDINATION', 'WORKFLOW', 'NEURAL', 'DATABASE', 'MEMORY', 'KNOWLEDGE', 'INTERFACE', 'CORE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  patterns: z.array(z.string()),
  recommendedAction: z.enum(['PROCESS', 'QUEUE', 'PRIORITIZE', 'FILTER', 'ROUTE'])
});

export type EventClassification = z.infer<typeof EventClassificationSchema>;

// =============================================================================
// NEURAL EVENT PROCESSOR
// =============================================================================

/**
 * Neural-powered event processor using brain.js for intelligent event handling.
 * Provides classification, routing, and prediction capabilities.
 */
export class NeuralEventProcessor {
  private brainBridge: BrainCoordinator;
  private config: NeuralEventConfig;
  private trainingData: { input: number[]; output: Record<string, number>; success?: boolean; feedback?: string; context?: any; optimizationResult?: any }[] = [];
  private eventHistory: BaseEvent[] = [];
  private isInitialized = false;

  constructor(config: Partial<NeuralEventConfig> = {}) {
    this.config = {
      enableLearning: true,
      predictionEnabled: true,
      smartRoutingEnabled: true,
      classificationEnabled: true,
      learningRate: 0.3,
      confidenceThreshold: 0.7,
      maxTrainingEvents: 1000,
      ...config
    };

    // Initialize brain coordinator with config
    const brainConfig: BrainConfig = {
      enableLearning: this.config.enableLearning,
      cacheOptimizations: true,
      logLevel: 'info'
    };

    this.brainBridge = new BrainCoordinator(brainConfig);

    logger.info('[NeuralEventProcessor] Initialized with brain.js integration', {
      config: this.config,
      brainConfig
    });
  }

  // =============================================================================
  // NEURAL EVENT CLASSIFICATION
  // =============================================================================

  /**
   * Classify event using neural network pattern recognition.
   * Analyzes event structure and content to determine category and priority.
   */
  // @traced('neural_event.classify') - temporarily disabled
  // @metered('neural_event_classification') - temporarily disabled
  async classifyEvent(event: BaseEvent): Promise<Result<EventClassification, Error>> {
    return withTrace('neural_event.classify', async (span) => {
      return safeAsync(async () => {
        if (!this.config.classificationEnabled) {
          return this.createBasicClassification(event);
        }

        // Extract features from event for neural network
        const features = this.extractEventFeatures(event);
        
        // Get neural prediction if network is trained
        let neuralClassification: EventClassification;
        if (this.isInitialized && this.trainingData.length > 0) {
          // Use BrainCoordinator's optimizePrompt for neural processing
          const optimizationResult = await this.brainBridge.optimizePrompt({
            task: 'event-classification',
            basePrompt: `Classify event: ${event.type}`,
            context: { features, event }
          });
          neuralClassification = this.interpretOptimizationResult(optimizationResult, event);
        } else {
          neuralClassification = this.createBasicClassification(event);
        }

        // Store event for learning if enabled
        if (this.config.enableLearning) {
          await this.recordEventForLearning(event, neuralClassification);
        }

        // Record telemetry
        recordMetric('neural_event.classifications_total', 1, {
          category: neuralClassification.category,
          priority: neuralClassification.priority,
          confidence: neuralClassification.confidence.toString()
        });

        span?.setAttributes({
          'event.classification.category': neuralClassification.category,
          'event.classification.priority': neuralClassification.priority,
          'event.classification.confidence': neuralClassification.confidence
        });

        return neuralClassification;
      });
    });
  }

  /**
   * Predict optimal routing for event based on learned patterns.
   */
  // @traced('neural_event.predict_route') - temporarily disabled
  async predictOptimalRoute(event: BaseEvent): Promise<Result<string[], Error>> {
    return withTrace('neural_event.predict_route', async () => {
      return safeAsync(async () => {
        if (!this.config.smartRoutingEnabled || !this.isInitialized) {
          return this.getDefaultRoutes(event);
        }

        const features = this.extractEventFeatures(event);
        const optimizationResult = await this.brainBridge.optimizePrompt({
          task: 'route-prediction',
          basePrompt: `Predict optimal route for event: ${event.type}`,
          context: { features, event }
        });
        
        // Convert optimization result to routing recommendations
        const routes = this.interpretRoutingOptimization(optimizationResult, event);

        recordMetric('neural_event.route_predictions_total', 1, {
          event_type: event.type,
          route_count: routes.length.toString()
        });

        return routes;
      });
    });
  }

  /**
   * Predict future event flow based on current event.
   */
  // @traced('neural_event.predict_flow') - temporarily disabled
  async predictEventFlow(event: BaseEvent, timeHorizon: number = 300000): Promise<Result<BaseEvent[], Error>> {
    return withTrace('neural_event.predict_flow', async () => {
      return safeAsync(async () => {
        if (!this.config.predictionEnabled || !this.isInitialized) {
          return [];
        }

        const features = this.extractEventFeatures(event);
        const optimizationResult = await this.brainBridge.optimizePrompt({
          task: 'flow-prediction',
          basePrompt: `Predict event flow from: ${event.type}`,
          context: { features, event, timeHorizon }
        });
        
        // Generate predicted future events
        const predictedEvents = this.generatePredictedEvents(optimizationResult, event, timeHorizon);

        recordMetric('neural_event.flow_predictions_total', 1, {
          event_type: event.type,
          predicted_count: predictedEvents.length.toString()
        });

        return predictedEvents;
      });
    });
  }

  // =============================================================================
  // NEURAL LEARNING
  // =============================================================================

  /**
   * Train neural network on accumulated event patterns.
   */
  // @traced('neural_event.train') - temporarily disabled
  async trainOnEventPatterns(): Promise<Result<void, Error>> {
    return withTrace('neural_event.train', async () => {
      return safeAsync(async () => {
        if (!this.config.enableLearning || this.trainingData.length < 10) {
          logger.warn('[NeuralEventProcessor] Insufficient training data', {
            dataSize: this.trainingData.length,
            minRequired: 10
          });
          return;
        }

        logger.info('[NeuralEventProcessor] Training neural network on event patterns', {
          trainingDataSize: this.trainingData.length
        });

        const startTime = Date.now();
        
        // Train the neural system through learning feedback
        for (const dataPoint of this.trainingData) {
          if (dataPoint.optimizationResult) {
            await this.brainBridge.learnFromResult(
              dataPoint.optimizationResult,
              dataPoint.success || false,
              dataPoint.feedback
            );
          }
        }
        
        this.isInitialized = true;
        
        const trainingTime = Date.now() - startTime;
        
        recordMetric('neural_event.training_completed', 1, {
          training_time_ms: trainingTime.toString(),
          data_size: this.trainingData.length.toString()
        });

        logger.info('[NeuralEventProcessor] Neural network training completed', {
          trainingTime,
          isInitialized: this.isInitialized
        });
      });
    });
  }

  // =============================================================================
  // FEATURE EXTRACTION
  // =============================================================================

  /**
   * Extract numerical features from event for neural network processing.
   */
  private extractEventFeatures(event: BaseEvent): number[] {
    const features: number[] = [];
    
    // Event type features (encoded)
    const typeHash = this.hashString(event.type);
    features.push(typeHash / 1000000); // Normalize
    
    // Domain features
    const domainMap = {
      'COORDINATION': 0.1,
      'WORKFLOW': 0.2,
      'NEURAL': 0.3,
      'DATABASE': 0.4,
      'MEMORY': 0.5,
      'KNOWLEDGE': 0.6,
      'INTERFACE': 0.7,
      'CORE': 0.8
    };
    features.push(domainMap[event.domain] || 0.0);
    
    // Temporal features
    const timestamp = new Date(event.timestamp).getTime();
    features.push((timestamp % 86400000) / 86400000); // Time of day (0-1)
    features.push((new Date(event.timestamp).getDay()) / 7); // Day of week (0-1)
    
    // Payload size (if exists)
    const payloadSize = JSON.stringify(event.payload || {}).length;
    features.push(Math.min(payloadSize / 1000, 1)); // Normalize to 0-1
    
    // Version features
    const version = event.version || '1.0.0';
    const versionParts = version.split('.').map(Number);
    features.push((versionParts[0] || 1) / 10); // Major version
    features.push((versionParts[1] || 0) / 10); // Minor version
    
    return features;
  }

  /**
   * Simple string hashing for feature encoding.
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // =============================================================================
  // PREDICTION INTERPRETATION
  // =============================================================================

  /**
   * Interpret neural network prediction as event classification.
   */
  private interpretPrediction(prediction: { output: Record<string, number> }, event: BaseEvent): EventClassification {
    // Convert prediction output to classification
    // This is simplified - in practice, you'd have trained outputs for each class
    
    const confidence = Math.max(...Object.values(prediction.output || {}));
    
    return {
      category: event.domain, // Use event domain as base
      priority: confidence > 0.8 ? 'HIGH' : confidence > 0.6 ? 'MEDIUM' : 'LOW',
      confidence: confidence,
      patterns: this.identifyPatterns(event),
      recommendedAction: confidence > 0.8 ? 'PRIORITIZE' : 'PROCESS'
    };
  }

  /**
   * Interpret prediction for routing recommendations.
   */
  private interpretRoutingPrediction(prediction: { output: Record<string, number> }, event: BaseEvent): string[] {
    const routes: string[] = [];
    
    // Add domain-specific routes
    routes.push(`${event.domain.toLowerCase()}-handler`);
    
    // Add type-specific routes
    if (event.type.includes('.')) {
      const [category] = event.type.split('.');
      routes.push(`${category}-processor`);
    }
    
    // Add priority-based routes
    const confidence = Math.max(...Object.values(prediction.output || {}));
    if (confidence > 0.8) {
      routes.push('priority-queue');
    } else {
      routes.push('standard-queue');
    }
    
    return routes;
  }


  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Create basic classification without neural processing.
   */
  private createBasicClassification(event: BaseEvent): EventClassification {
    return {
      category: event.domain,
      priority: 'MEDIUM',
      confidence: 0.5,
      patterns: this.identifyPatterns(event),
      recommendedAction: 'PROCESS'
    };
  }

  /**
   * Get default routes for event without neural processing.
   */
  private getDefaultRoutes(event: BaseEvent): string[] {
    return [
      `${event.domain.toLowerCase()}-handler`,
      'default-processor'
    ];
  }

  /**
   * Identify patterns in event for classification.
   */
  private identifyPatterns(event: BaseEvent): string[] {
    const patterns: string[] = [];
    
    // Type patterns
    if (event.type.includes('.')) {
      patterns.push('hierarchical-type');
    }
    
    // Domain patterns
    patterns.push(`domain-${event.domain.toLowerCase()}`);
    
    // Temporal patterns
    const hour = new Date(event.timestamp).getHours();
    if (hour >= 9 && hour <= 17) {
      patterns.push('business-hours');
    } else {
      patterns.push('off-hours');
    }
    
    return patterns;
  }

  /**
   * Interpret optimization result as event classification.
   */
  private interpretOptimizationResult(result: any, event: BaseEvent): EventClassification {
    // Use optimization confidence as classification confidence
    const confidence = result.confidence || 0.5;
    
    return {
      category: event.domain,
      priority: confidence > 0.8 ? 'HIGH' : confidence > 0.6 ? 'MEDIUM' : 'LOW',
      confidence,
      patterns: this.identifyPatterns(event),
      recommendedAction: confidence > 0.8 ? 'PRIORITIZE' : 'PROCESS'
    };
  }

  /**
   * Interpret optimization result for routing.
   */
  private interpretRoutingOptimization(result: any, event: BaseEvent): string[] {
    const routes: string[] = [];
    
    // Add domain-specific routes
    routes.push(`${event.domain.toLowerCase()}-handler`);
    
    // Add type-specific routes
    if (event.type.includes('.')) {
      const [category] = event.type.split('.');
      routes.push(`${category}-processor`);
    }
    
    // Add priority-based routes based on optimization confidence
    const confidence = result.confidence || 0.5;
    if (confidence > 0.8) {
      routes.push('priority-queue');
    } else {
      routes.push('standard-queue');
    }
    
    return routes;
  }

  /**
   * Generate predicted events from optimization result.
   */
  private generatePredictedEvents(result: any, currentEvent: BaseEvent, timeHorizon: number): BaseEvent[] {
    const predicted: BaseEvent[] = [];
    
    // Use optimization confidence for prediction
    const confidence = result.confidence || 0.5;
    
    if (confidence > 0.7) {
      // Predict likely follow-up events
      const followUpEvent: BaseEvent = {
        id: `predicted-${Date.now()}`,
        type: `${currentEvent.type}.followup`,
        domain: currentEvent.domain,
        timestamp: new Date(Date.now() + timeHorizon / 2),
        version: currentEvent.version,
        payload: {
          predicted: true,
          confidence,
          source: currentEvent.id
        }
      };
      
      predicted.push(followUpEvent);
    }
    
    return predicted;
  }

  /**
   * Record event for future learning.
   */
  private async recordEventForLearning(event: BaseEvent, classification: EventClassification): Promise<void> {
    // Store event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.config.maxTrainingEvents) {
      this.eventHistory.shift(); // Remove oldest
    }

    // Create training data with feedback structure for BrainCoordinator learning
    const features = this.extractEventFeatures(event);
    
    this.trainingData.push({
      input: features,
      output: this.classificationToTrainingOutput(classification),
      success: classification.confidence > this.config.confidenceThreshold,
      feedback: `Classification: ${classification.category}, Priority: ${classification.priority}`,
      context: {
        eventType: event.type,
        domain: event.domain,
        classification
      },
      optimizationResult: {
        optimizedPrompt: `Event classification for ${event.type}`,
        confidence: classification.confidence,
        method: 'neural-classification',
        fromCache: false,
        processingTime: Date.now(),
        autonomousDecision: false,
        improvementScore: classification.confidence
      }
    });
    
    if (this.trainingData.length > this.config.maxTrainingEvents) {
      this.trainingData.shift(); // Remove oldest
    }

    // Auto-train periodically
    if (this.trainingData.length % 50 === 0) {
      await this.trainOnEventPatterns();
    }
  }

  /**
   * Convert classification to neural network training output.
   */
  private classificationToTrainingOutput(classification: EventClassification): Record<string, number> {
    return {
      priority_low: classification.priority === 'LOW' ? 1 : 0,
      priority_medium: classification.priority === 'MEDIUM' ? 1 : 0,
      priority_high: classification.priority === 'HIGH' ? 1 : 0,
      priority_critical: classification.priority === 'CRITICAL' ? 1 : 0,
      confidence: classification.confidence
    };
  }

  /**
   * Get processor statistics.
   */
  getStats(): {
    isInitialized: boolean;
    trainingDataSize: number;
    eventHistorySize: number;
    config: NeuralEventConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      trainingDataSize: this.trainingData.length,
      eventHistorySize: this.eventHistory.length,
      config: this.config
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create neural event processor with common configuration.
 */
export function createNeuralEventProcessor(
  config?: Partial<NeuralEventConfig>
): NeuralEventProcessor {
  return new NeuralEventProcessor(config);
}

/**
 * Create neural processor optimized for high-performance classification.
 */
export function createHighPerformanceNeuralProcessor(): NeuralEventProcessor {
  return new NeuralEventProcessor({
    enableLearning: true,
    predictionEnabled: false, // Disable for performance
    smartRoutingEnabled: true,
    classificationEnabled: true,
    learningRate: 0.5, // Faster learning
    confidenceThreshold: 0.6, // Lower threshold for speed
    maxTrainingEvents: 500 // Smaller dataset for speed
  });
}

/**
 * Create neural processor with full learning and prediction capabilities.
 */
export function createFullNeuralProcessor(): NeuralEventProcessor {
  return new NeuralEventProcessor({
    enableLearning: true,
    predictionEnabled: true,
    smartRoutingEnabled: true,
    classificationEnabled: true,
    learningRate: 0.3, // Balanced learning
    confidenceThreshold: 0.7, // Higher threshold for accuracy
    maxTrainingEvents: 1000 // Larger dataset for accuracy
  });
}

export default NeuralEventProcessor;