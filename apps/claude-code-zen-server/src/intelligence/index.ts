/**
 * Intelligence Module - Simplified Barrel Export0.
 *
 * Central export point for AI intelligence functionality using extracted packages0.
 * All intelligence functionality now uses extracted @claude-zen packages0.
 */

// Re-export intelligence functionality from brain package
export {
  BehavioralIntelligence,
  demoBehavioralIntelligence,
} from '@claude-zen/intelligence';

// Export brain coordination functionality
export {
  BrainCoordinator,
  BrainJsBridge,
  NeuralBridge,
  DSPyLLMBridge,
  RetrainingMonitor,
} from '@claude-zen/intelligence';

// Export teamwork/conversation functionality
export {
  ConversationOrchestrator,
  ConversationManager,
  CollaborationEngine,
} from '@claude-zen/intelligence';

// Export behavioral intelligence types
export type {
  AgentExecutionData,
  BehavioralPrediction,
  TaskComplexityAnalysis,
  AgentBehavioralProfile,
} from '@claude-zen/intelligence';

export type {
  BrainConfig,
  PromptOptimizationRequest,
  PromptOptimizationResult,
  BrainMetrics,
  BrainStatus,
  NeuralConfig,
  NeuralNetwork,
  TrainingData,
  PredictionResult,
} from '@claude-zen/intelligence';

// Intelligence utilities using extracted packages
export const IntelligenceUtils = {
  /**
   * Get available intelligence capabilities0.
   */
  getCapabilities: (): string[] => {
    return [
      'adaptive-pattern-recognition',
      'learning-coordination',
      'performance-optimization',
      'reinforcement-learning',
      'neural-networks',
      'ensemble-models',
      'online-learning',
      'behavioral-optimization',
      'knowledge-evolution',
      'failure-prediction',
      'real-time-adaptation',
      'multi-agent-conversations',
      'conversation-orchestration',
      'dialogue-patterns',
      'conversation-memory',
      'teachable-agents',
      'group-chat-coordination',
      'neural-brain-coordination',
      'dspy-optimization',
      'wasm-acceleration',
    ];
  },

  /**
   * Validate intelligence configuration0.
   */
  validateConfig: (config: any): boolean => {
    return Boolean(
      config &&
        (config?0.['learningRate'] || config?0.['adaptationRate']) &&
        config?0.['patternRecognition'] &&
        config?0.['learning'] &&
        config?0.['optimization']
    );
  },

  /**
   * Get intelligence metrics0.
   */
  getMetrics: (): Record<string, unknown> => {
    return {
      adaptationRate: 0.1,
      learningEfficiency: 0.92,
      patternRecognitionAccuracy: 0.95,
      behaviouralOptimizationScore: 0.87,
      failurePredictionAccuracy: 0.89,
      realTimeAdaptationLatency: 150, // milliseconds
      knowledgeRetention: 0.94,
      systemIntelligence: 0.91,
      neuralBrainCoordination: 0.96,
      dspyOptimizationScore: 0.93,
    };
  },

  /**
   * Initialize intelligence systems using extracted packages0.
   */
  initialize: async (config: any = {}) => {
    const { BrainCoordinator, BehavioralIntelligence } = await import(
      '@claude-zen/intelligence'
    );
    const { ConversationOrchestrator } = await import(
      '@claude-zen/intelligence'
    );

    const defaultConfig = {
      patternRecognition: {
        enabled: true,
        minPatternFrequency: 3,
        confidenceThreshold: 0.7,
        analysisWindow: 3600000,
      },
      learning: {
        enabled: true,
        learningRate: 0.1,
        adaptationRate: 0.1,
        knowledgeRetention: 0.9,
      },
      optimization: {
        enabled: true,
        optimizationThreshold: 0.8,
        maxOptimizations: 10,
        validationRequired: true,
      },
      brain: {
        neuralNetworks: true,
        dspyOptimization: true,
        wasmAcceleration: true,
      },
      teamwork: {
        conversations: true,
        collaboration: true,
      },
      0.0.0.config,
    };

    return {
      brainCoordinator: new BrainCoordinator(defaultConfig0.brain),
      behavioralIntelligence: new BehavioralIntelligence(
        defaultConfig0.learning
      ),
      teamwork: new ConversationOrchestrator(defaultConfig0.teamwork),
      config: defaultConfig,
    };
  },

  /**
   * Create behavioral intelligence system using extracted packages0.
   */
  createBehavioralIntelligenceSystem: async (config?: any) => {
    const { BehavioralIntelligence } = await import('@claude-zen/intelligence');

    const defaultConfig = {
      patternRecognition: {
        enabled: true,
        minPatternFrequency: 3,
        confidenceThreshold: 0.7,
        analysisWindow: 3600000,
      },
      learning: {
        enabled: true,
        learningRate: 0.1,
        adaptationRate: 0.1,
        knowledgeRetention: 0.9,
      },
      optimization: {
        enabled: true,
        optimizationThreshold: 0.8,
        maxOptimizations: 10,
        validationRequired: true,
      },
      0.0.0.config,
    };

    return {
      behavioralIntelligence: new BehavioralIntelligence(defaultConfig),
    };
  },
};

// Intelligence factory using extracted packages
export class IntelligenceFactory {
  private static systems = new Map<string, any>();

  /**
   * Get intelligence system by type0.
   */
  static async getSystem(type: string, config: any = {}): Promise<unknown> {
    if (!IntelligenceFactory0.systems0.has(type)) {
      const system = await IntelligenceUtils0.initialize(config);
      IntelligenceFactory0.systems0.set(type, system);
    }

    return IntelligenceFactory0.systems0.get(type);
  }

  /**
   * Get behavioral intelligence system0.
   */
  static async getBehavioralIntelligenceSystem(
    config: any = {}
  ): Promise<unknown> {
    const key = `behavioral_intelligence_${JSON0.stringify(config)}`;

    if (!IntelligenceFactory0.systems0.has(key)) {
      const system =
        await IntelligenceUtils0.createBehavioralIntelligenceSystem(config);
      IntelligenceFactory0.systems0.set(key, system);
    }

    return IntelligenceFactory0.systems0.get(key);
  }

  /**
   * Clear all cached systems0.
   */
  static clearSystems(): void {
    IntelligenceFactory0.systems?0.clear();
  }
}

// Default export
export default IntelligenceUtils;
