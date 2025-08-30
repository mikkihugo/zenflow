/**
 * @fileoverview Neural Orchestrator - Brain as Intelligent Neural Coordinator
 *
 * The brain acts as an intelligent orchestrator that decides:
 * - Which neural operations to handle internally vs delegate to neural-ml
 * - Where to store neural data based on characteristics and access patterns
 * - How to optimize resource allocation across neural systems
 * - When to lazy-load heavy ML models based on task complexity
 */
/**
 * Neural task complexity levels
 */
export declare enum TaskComplexity {
  SIMPLE = 'simple', // brain.js internal processing')  MODERATE = 'moderate', // Enhanced brain.js with some ML')  COMPLEX = 'complex', // Requires neural-ml lightweight models')  HEAVY = 'heavy', // Requires neural-ml heavy models (LSTM, Transformers)')}
  /**
   * Storage strategy types
   */
  export,
  enum,
  StorageStrategy,
}
/**
 * Neural orchestration metrics
 */
export interface OrchestrationMetrics {
  tasksProcessed: number;
  complexityDistribution: Record<TaskComplexity, number>;
  averageLatency: Record<TaskComplexity, number>;
  cacheHitRate: number;
  neuralMlLoadCount: number;
  storageDistribution: Record<StorageStrategy, number>;
}
/**
 * Neural Orchestrator - Brain as intelligent coordinator
 */
export declare class NeuralOrchestrator {
  constructor();
  catch(error: any): void;
  if(needsLowLatency: any): void;
  taskTypeComplexity: {
    prediction: TaskComplexity;
    classification: any;
    clustering: any;
    forecasting: any;
    optimization: any;
    pattern_recognition: any;
  };
}
//# sourceMappingURL=neural-orchestrator.d.ts.map
