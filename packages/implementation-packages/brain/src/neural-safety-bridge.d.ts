/**
 * @file Neural Safety Bridge - Brain Package Integration with AI Safety
 *
 * Integrates the 25-pattern AI deception detection system with the brain package's
 * neural networks, behavioral intelligence, and cognitive patterns for enhanced
 * safety monitoring and real-time intervention.
 */
import { TypedEventBase } from '@claude-zen/foundation';
export interface NeuralSafetyConfig {
  enabled: boolean;
  enhancedDetection: boolean;
  behavioralLearning: boolean;
  realTimeMonitoring: boolean;
  interventionThreshold: number;
  neuralModelPath?: string;
}
export interface EnhancedDeceptionResult {
  standardDetection: any[];
  neuralEnhancement: {
    confidence: number;
    patterns: string[];
    behavioralSignals: number[];
  };
  behavioralAnalysis: {
    anomalyScore: number;
    riskLevel: 'LOW | MEDIUM' | 'HIGH''' | '''CRITICAL';
    recommendation: string;
  };
  combinedVerdict: {
    isDeceptive: boolean;
    confidence: number;
    interventionRequired: boolean;
    reasoning: string[];
  };
}
/**
 * Neural Safety Bridge - Enhanced AI safety with brain package integration.
 *
 * Combines the 25-pattern deception detection system with neural networks,
 * behavioral intelligence, and cognitive pattern analysis for comprehensive
 * AI safety monitoring.
 */
export declare class NeuralSafetyBridge extends TypedEventBase {
  private logger;
  private aiDeceptionDetector;
  private neuralDeceptionDetector;
  private neuralBridge;
  private behavioralIntelligence;
  private config;
  private isInitialized;
  constructor(config: NeuralSafetyConfig);
  /**
   * Initialize neural safety bridge with brain system integration.
   */
  initialize(): Promise<void>;
  /**
   * Enhanced deception detection combining all brain systems.
   */
  detectEnhancedDeception(
    interactionData: any
  ): Promise<EnhancedDeceptionResult>;
  /**
   * Extract behavioral features for analysis.
   */
  private extractBehavioralFeatures;
  /**
   * Analyze behavioral patterns using brain's behavioral intelligence.
   */
  private analyzeBehavioralPatterns;
  /**
   * Process neural patterns using brain's neural network.
   */
  private processNeuralPatterns;
  /**
   * Convert text to numerical vector for neural processing.
   */
  private convertTextToVector;
  /**
   * Compute combined verdict from all detection systems.
   */
  private computeCombinedVerdict;
  /**
   * Setup real-time monitoring for continuous safety assessment.
   */
  private setupRealTimeMonitoring;
  /**
   * Learn from feedback to improve detection accuracy.
   */
  learnFromFeedback(
    interactionData: any,
    actualDeception: boolean,
    feedback: string
  ): Promise<void>;
  /**
   * Get comprehensive safety statistics.
   */
  getSafetyStatistics(): {
    standard: any;
    neural: any;
    behavioral: any;
    combined: {
      totalAnalyses: number;
      deceptionDetected: number;
      interventionsTriggered: number;
      accuracy: number;
    };
  };
  /**
   * Shutdown neural safety bridge.
   */
  shutdown(): Promise<void>;
}
/**
 * Factory function to create neural safety bridge.
 */
export declare function createNeuralSafetyBridge(
  config: NeuralSafetyConfig
): NeuralSafetyBridge;
//# sourceMappingURL=neural-safety-bridge.d.ts.map
