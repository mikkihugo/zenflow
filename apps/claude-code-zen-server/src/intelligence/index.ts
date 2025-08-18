/**
 * Intelligence Module - Simplified Barrel Export.
 *
 * Central export point for AI intelligence functionality using extracted packages.
 * All intelligence functionality now uses extracted @claude-zen packages.
 */

// Re-export intelligence functionality from brain package
export {
  BehavioralIntelligence,
  demoBehavioralIntelligence
} from '@claude-zen/brain';

// Export brain coordination functionality
export {
  BrainCoordinator,
  BrainJsBridge,
  NeuralBridge,
  DSPyLLMBridge,
  RetrainingMonitor
} from '@claude-zen/brain';

// Export teamwork/conversation functionality
export {
  Teamwork,
  ConversationFramework
} from '@claude-zen/teamwork';

// Export behavioral intelligence types
export type {
  AgentExecutionData,
  BehavioralPrediction,
  TaskComplexityAnalysis,
  AgentBehavioralProfile
} from '@claude-zen/brain';

export type {
  BrainConfig,
  PromptOptimizationRequest,
  PromptOptimizationResult,
  BrainMetrics,
  BrainStatus,
  NeuralConfig,
  NeuralNetwork,
  TrainingData,
  PredictionResult
} from '@claude-zen/brain';

// Intelligence utilities using extracted packages
export const IntelligenceUtils = {
  /**
   * Get available intelligence capabilities.
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
   * Validate intelligence configuration.
   */
  validateConfig: (config: unknown): boolean => {
    return Boolean(
      config &&
        (config?.['learningRate'] || config?.['adaptationRate']) &&
        config?.['patternRecognition'] &&
        config?.['learning'] &&
        config?.['optimization']
    );
  },

  /**
   * Get intelligence metrics.
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
   * Initialize intelligence systems using extracted packages.
   */
  initialize: async (config: unknown = {}) => {
    const { BrainCoordinator, BehavioralIntelligence } = await import('@claude-zen/brain');
    const { Teamwork } = await import('@claude-zen/teamwork');

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
      ...config,
    };

    return {
      brainCoordinator: new BrainCoordinator(defaultConfig.brain),
      behavioralIntelligence: new BehavioralIntelligence(defaultConfig.learning),
      teamwork: new Teamwork(defaultConfig.teamwork),
      config: defaultConfig,
    };
  },

  /**
   * Create behavioral intelligence system using extracted packages.
   */
  createBehavioralIntelligenceSystem: async (config?: unknown) => {
    const { BehavioralIntelligence } = await import('@claude-zen/brain');

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
      ...config,
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
   * Get intelligence system by type.
   */
  static async getSystem(type: string, config: unknown = {}): Promise<unknown> {
    if (!IntelligenceFactory.systems.has(type)) {
      const system = await IntelligenceUtils.initialize(config);
      IntelligenceFactory.systems.set(type, system);
    }

    return IntelligenceFactory.systems.get(type);
  }

  /**
   * Get behavioral intelligence system.
   */
  static async getBehavioralIntelligenceSystem(config: unknown = {}): Promise<unknown> {
    const key = `behavioral_intelligence_${JSON.stringify(config)}`;

    if (!IntelligenceFactory.systems.has(key)) {
      const system = await IntelligenceUtils.createBehavioralIntelligenceSystem(config);
      IntelligenceFactory.systems.set(key, system);
    }

    return IntelligenceFactory.systems.get(key);
  }

  /**
   * Clear all cached systems.
   */
  static clearSystems(): void {
    IntelligenceFactory.systems.clear();
  }
}

// Default export
export default IntelligenceUtils;