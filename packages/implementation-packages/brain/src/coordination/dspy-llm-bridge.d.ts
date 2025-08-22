/**
 * @file Simplified DSPy-LLM Bridge - Fallback Implementation
 *
 * Provides fallback implementations for DSPy integration when the dspy package
 * is not available. This allows the brain package to compile without dependencies.
 */
export interface DSPyCoordinationTask {
  id: string;
  type: string;
  complexity?: 'simple | moderate' | 'complex''' | '''heavy';
  data?: any;
  requirements?: any;
  input?: string;
  context?: any;
  priority?: string;
  [key: string]: any;
}
export interface DSPyOptimizationConfig {
  teleprompter?:'' | '''BootstrapFewShot | COPRO' | 'MIPRO' | 'Ensemble' | 'MIPROv2';
  optimizationSteps?: number;
  maxTokens?: number;
  temperature?: number;
  hybridMode?: boolean;
  [key: string]: any;
}
export type CoordinationTask = DSPyCoordinationTask;
export interface CoordinationResult {
  result: any;
  reasoning: string[];
  confidence: number;
  success?: boolean;
  metrics: {
    executionTime: number;
    tokensUsed: number;
  };
}
export interface DSPyLLMConfig {
  enabled: boolean;
  teleprompter: string;
  optimizationSteps: number;
  temperature: number;
}
export interface LLMBridgeOptions {
  databasePath?: string;
  cacheEnabled?: boolean;
  maxRetries?: number;
}
/**
 * Simplified DSPy LLM Bridge with fallback implementations
 */
export declare class DSPyLLMBridge {
  private logger;
  private databaseAccess;
  constructor(
    configOrDatabaseAccess: any, // Can be config object or database access
    neuralBridge?: any
  );
  /**
   * Execute coordination task using DSPy-optimized prompts (fallback)
   */
  executeCoordinationTask(
    task: DSPyCoordinationTask,
    config?: DSPyOptimizationConfig
  ): Promise<CoordinationResult>;
  /**
   * Process coordination task (alias for backward compatibility)
   */
  processCoordinationTask(
    task: DSPyCoordinationTask,
    config?: DSPyOptimizationConfig
  ): Promise<CoordinationResult>;
  /**
   * Learn from coordination feedback (fallback)
   */
  learnFromCoordination(
    task: DSPyCoordinationTask,
    result: any,
    feedback: {
      success: boolean;
      improvements?: string[];
    }
  ): Promise<void>;
  /**
   * Get coordination statistics (fallback)
   */
  getCoordinationStats(): any;
  /**
   * Initialize DSPy systems (fallback)
   */
  initialize(): Promise<void>;
  /**
   * Shutdown DSPy systems (fallback)
   */
  shutdown(): Promise<void>;
}
/**
 * Factory function to create DSPy LLM Bridge
 */
export declare function createDSPyLLMBridge(databaseAccess: any): DSPyLLMBridge;
export default DSPyLLMBridge;
//# sourceMappingURL=dspy-llm-bridge.d.ts.map
