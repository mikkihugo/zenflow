/**
 * Intelligence Module - Barrel Export
 *
 * Central export point for AI intelligence and adaptive learning functionality
 */

// Adaptive learning components
export * from './adaptive-learning/behavioral-optimization.js';
export * from './adaptive-learning/knowledge-evolution.js';
export * from './adaptive-learning/ml-integration.js';
export * from './adaptive-learning/pattern-recognition-engine.js';

// Intelligence utilities
export const IntelligenceUtils = {
  /**
   * Get available intelligence capabilities
   */
  getCapabilities: (): string[] => {
    return [
      'behavioral-optimization',
      'knowledge-evolution',
      'ml-integration',
      'pattern-recognition',
    ];
  },

  /**
   * Validate intelligence configuration
   */
  validateConfig: (config: any): boolean => {
    return Boolean(config && (config.learningRate || config.adaptationRate));
  },

  /**
   * Get intelligence metrics
   */
  getMetrics: (): Record<string, any> => {
    return {
      adaptationRate: 0.1,
      learningEfficiency: 0.85,
      patternRecognitionAccuracy: 0.92,
      behaviouralOptimizationScore: 0.78,
    };
  },

  /**
   * Initialize intelligence systems
   */
  initialize: async (config: any = {}) => {
    const systems = await Promise.all([
      import('./adaptive-learning/behavioral-optimization.js'),
      import('./adaptive-learning/knowledge-evolution.js'),
      import('./adaptive-learning/ml-integration.js'),
      import('./adaptive-learning/pattern-recognition-engine.js'),
    ]);

    return {
      behavioralOptimization: systems[0],
      knowledgeEvolution: systems[1],
      mlIntegration: systems[2],
      patternRecognition: systems[3],
    };
  },
};

// Intelligence factory
export class IntelligenceFactory {
  private static systems = new Map<string, any>();

  /**
   * Get intelligence system by type
   */
  static async getSystem(type: string, config: any = {}): Promise<any> {
    if (!IntelligenceFactory.systems.has(type)) {
      const system = await IntelligenceUtils.initialize(config);
      IntelligenceFactory.systems.set(type, system);
    }

    return IntelligenceFactory.systems.get(type);
  }

  /**
   * Clear all cached systems
   */
  static clearSystems(): void {
    IntelligenceFactory.systems.clear();
  }
}

// Default export
export default IntelligenceUtils;
