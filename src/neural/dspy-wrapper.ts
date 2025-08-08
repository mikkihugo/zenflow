/**
 * @file TypeScript Wrapper for DSPy Integration
 *
 * Provides a type-safe, unified interface to the ruvnet dspy.ts package
 * with proper error handling, validation, and consistent API patterns.
 *
 * Created by: Type-System-Analyst agent
 * Purpose: Centralize all DSPy API access with full TypeScript support
 */

import { createLogger } from '../core/logger';
import {
  DEFAULT_DSPY_CONFIG,
  DEFAULT_OPTIMIZATION_CONFIG,
  DSPY_LIMITS,
  DSPyAPIError,
  type DSPyConfig,
  DSPyConfigurationError,
  type DSPyExample,
  DSPyExecutionError,
  type DSPyExecutionResult,
  type DSPyOptimizationConfig,
  DSPyOptimizationError,
  type DSPyOptimizationResult,
  type DSPyProgram,
  type DSPyProgramMetadata,
  type DSPyWrapper,
  isDSPyConfig,
  isDSPyProgram,
} from './types/index';

const logger = createLogger({ prefix: 'DSPyWrapper' });

/**
 * Type-safe wrapper implementation for the dspy.ts package
 * Provides consistent API across all DSPy integrations in claude-code-zen
 */
export class DSPyWrapperImpl implements DSPyWrapper {
  private dspyInstance: any = null;
  private currentConfig: DSPyConfig | null = null;
  private programs: Map<string, DSPyProgramWrapper> = new Map();
  private isInitialized: boolean = false;

  constructor(initialConfig?: DSPyConfig) {
    if (initialConfig && !isDSPyConfig(initialConfig)) {
      throw new DSPyConfigurationError('Invalid DSPy configuration provided', {
        config: initialConfig,
      });
    }

    if (initialConfig) {
      this.configure(initialConfig);
    }
  }

  /**
   * Configure the DSPy language model with proper error handling
   */
  async configure(config: DSPyConfig): Promise<void> {
    try {
      if (!isDSPyConfig(config)) {
        throw new DSPyConfigurationError('Invalid configuration object', { config });
      }

      // Import dspy.ts dynamically to handle potential import issues
      let DSPy: any, configureLM: any;
      try {
        const dspyModule = await import('dspy.ts');
        // Handle different export patterns - use type assertion for external package
        DSPy = (dspyModule as any).default || (dspyModule as any).DSPy || dspyModule;
        configureLM = (dspyModule as any).configureLM || (dspyModule as any).configure;
      } catch (error) {
        throw new DSPyAPIError('Failed to import dspy.ts package', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Merge with defaults
      const finalConfig = { ...DEFAULT_DSPY_CONFIG, ...config };

      // Configure the language model
      if (configureLM) {
        try {
          await configureLM({
            model: finalConfig.model,
            temperature: finalConfig.temperature,
            maxTokens: finalConfig.maxTokens,
            ...(finalConfig.apiKey && { apiKey: finalConfig.apiKey }),
            ...(finalConfig.baseURL && { baseURL: finalConfig.baseURL }),
            ...finalConfig.modelParams,
          });
        } catch (error) {
          throw new DSPyConfigurationError('Failed to configure language model', {
            error: error instanceof Error ? error.message : String(error),
            config: finalConfig,
          });
        }
      }

      // Initialize DSPy instance
      if (DSPy) {
        try {
          // Try constructor approach first
          this.dspyInstance = new DSPy(finalConfig);
        } catch (error) {
          // Fallback to static access if constructor fails
          logger.warn('Constructor approach failed, using static access', { error });
          this.dspyInstance = DSPy;
        }
      } else {
        throw new DSPyAPIError('DSPy class not found in dspy.ts module');
      }

      this.currentConfig = finalConfig;
      this.isInitialized = true;

      logger.info('DSPy configured successfully', {
        model: finalConfig.model,
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
      });
    } catch (error) {
      this.isInitialized = false;
      if (error instanceof DSPyConfigurationError || error instanceof DSPyAPIError) {
        throw error;
      }
      throw new DSPyConfigurationError('Unexpected error during configuration', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Create a new DSPy program with type safety and validation
   */
  async createProgram(signature: string, description: string): Promise<DSPyProgram> {
    this.ensureInitialized();

    if (!signature || typeof signature !== 'string') {
      throw new DSPyAPIError('Invalid program signature', { signature });
    }

    if (!description || typeof description !== 'string') {
      throw new DSPyAPIError('Invalid program description', { description });
    }

    if (this.programs.size >= DSPY_LIMITS.MAX_PROGRAMS_PER_WRAPPER) {
      throw new DSPyAPIError(
        `Maximum programs limit reached: ${DSPY_LIMITS.MAX_PROGRAMS_PER_WRAPPER}`
      );
    }

    try {
      let rawProgram: any;

      // Try different API patterns to create program
      if (this.dspyInstance.createProgram) {
        rawProgram = await this.dspyInstance.createProgram(signature, description);
      } else if (this.dspyInstance.Program) {
        rawProgram = new this.dspyInstance.Program(signature, description);
      } else {
        // Fallback: create a mock program structure
        logger.warn('Creating mock program structure - dspy.ts API not fully compatible');
        rawProgram = {
          signature,
          description,
          forward: async (_input: any) => {
            throw new DSPyAPIError('Program forward method not implemented by dspy.ts');
          },
        };
      }

      const program = new DSPyProgramWrapper(rawProgram, signature, description, this);
      this.programs.set(program.id!, program);

      logger.debug('DSPy program created successfully', {
        id: program.id,
        signature,
        description: description.substring(0, 100),
      });

      return program;
    } catch (error) {
      throw new DSPyAPIError('Failed to create DSPy program', {
        signature,
        description,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Execute a program with comprehensive error handling and result validation
   */
  async execute(program: DSPyProgram, input: Record<string, any>): Promise<DSPyExecutionResult> {
    this.ensureInitialized();

    if (!isDSPyProgram(program)) {
      throw new DSPyAPIError('Invalid DSPy program provided', { program });
    }

    if (!input || typeof input !== 'object') {
      throw new DSPyAPIError('Invalid input provided', { input });
    }

    const startTime = Date.now();

    try {
      const rawResult = await program.forward(input);
      const executionTime = Date.now() - startTime;

      // Update program metadata if it's our wrapper
      if (program instanceof DSPyProgramWrapper) {
        program.updateExecutionStats(executionTime);
      }

      const result: DSPyExecutionResult = {
        success: true,
        result: rawResult || {},
        metadata: {
          executionTime,
          timestamp: new Date(),
          model: this.currentConfig?.model,
          // Add token usage if available in result
          ...(rawResult?.['tokensUsed'] && { tokensUsed: rawResult['tokensUsed'] }),
          // Ensure confidence is always present, even if undefined
          confidence: rawResult?.['confidence'] || undefined,
        },
      };

      logger.debug('DSPy program executed successfully', {
        programId: (program as any).id,
        executionTime,
        inputKeys: Object.keys(input),
        outputKeys: Object.keys(rawResult || {}),
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error('DSPy program execution failed', {
        programId: (program as any).id,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
      });

      const metadata: any = {
        executionTime,
        timestamp: new Date(),
        confidence: 0.0, // Low confidence for failed executions
      };

      if (this.currentConfig?.model) {
        metadata.model = this.currentConfig.model;
      }

      return {
        success: false,
        result: {},
        metadata,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Add training examples to a program with validation
   */
  async addExamples(program: DSPyProgram, examples: DSPyExample[]): Promise<void> {
    this.ensureInitialized();

    if (!isDSPyProgram(program)) {
      throw new DSPyAPIError('Invalid DSPy program provided');
    }

    if (!Array.isArray(examples) || examples.length === 0) {
      throw new DSPyAPIError('Invalid examples array provided', { examples });
    }

    if (examples.length > DSPY_LIMITS.MAX_EXAMPLES) {
      throw new DSPyAPIError(`Too many examples provided. Maximum: ${DSPY_LIMITS.MAX_EXAMPLES}`, {
        provided: examples.length,
      });
    }

    // Validate examples structure
    for (const example of examples) {
      if (
        !example.input ||
        !example.output ||
        typeof example.input !== 'object' ||
        typeof example.output !== 'object'
      ) {
        throw new DSPyAPIError('Invalid example structure', { example });
      }
    }

    try {
      // Try different API patterns for adding examples
      const rawProgram = (program as any).rawProgram;

      if (this.dspyInstance.addExamples) {
        await this.dspyInstance.addExamples(rawProgram, examples);
      } else if (rawProgram.addExamples) {
        await rawProgram.addExamples(examples);
      } else {
        logger.warn('addExamples method not found - examples stored locally only');
        // Store examples in our wrapper for later use
        if (program instanceof DSPyProgramWrapper) {
          program.addExamples(examples);
        }
      }

      logger.debug('Examples added to DSPy program', {
        programId: (program as any).id,
        exampleCount: examples.length,
      });
    } catch (error) {
      throw new DSPyAPIError('Failed to add examples to program', {
        programId: (program as any).id,
        exampleCount: examples.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Optimize a program with comprehensive configuration and result handling
   */
  async optimize(
    program: DSPyProgram,
    config?: DSPyOptimizationConfig
  ): Promise<DSPyOptimizationResult> {
    this.ensureInitialized();

    if (!isDSPyProgram(program)) {
      throw new DSPyAPIError('Invalid DSPy program provided');
    }

    const optimizationConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
    const startTime = Date.now();

    try {
      const rawProgram = (program as any).rawProgram;
      let optimizationResult: any;

      // Try different optimization API patterns
      if (this.dspyInstance.optimize) {
        optimizationResult = await this.dspyInstance.optimize(rawProgram, {
          strategy: optimizationConfig.strategy,
          maxIterations: optimizationConfig.maxIterations,
          ...optimizationConfig.strategyParams,
        });
      } else if (rawProgram.optimize) {
        optimizationResult = await rawProgram.optimize(optimizationConfig);
      } else {
        logger.warn('Optimization not available - returning original program');
        optimizationResult = { program: rawProgram, metrics: { improvementPercent: 0 } };
      }

      const executionTime = Date.now() - startTime;
      const result: DSPyOptimizationResult = {
        success: true,
        program: optimizationResult.program
          ? new DSPyProgramWrapper(
              optimizationResult.program,
              program.signature,
              program.description,
              this
            )
          : program,
        metrics: {
          iterationsCompleted: optimizationResult.iterations || 0,
          executionTime,
          initialAccuracy: optimizationResult.initialAccuracy,
          finalAccuracy: optimizationResult.finalAccuracy,
          improvementPercent: optimizationResult.improvementPercent || 0,
        },
        issues: optimizationResult.warnings || [],
      };

      logger.info('DSPy program optimization completed', {
        programId: (program as any).id,
        strategy: optimizationConfig.strategy,
        executionTime,
        improvement: result.metrics.improvementPercent,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error('DSPy program optimization failed', {
        programId: (program as any).id,
        strategy: optimizationConfig.strategy,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DSPyOptimizationError('Program optimization failed', {
        programId: (program as any).id,
        config: optimizationConfig,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): DSPyConfig | null {
    return this.currentConfig;
  }

  /**
   * Health check for DSPy system
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.currentConfig) {
        return false;
      }

      // Try a simple operation to verify the system is working
      const testProgram = await this.createProgram(
        'test: string -> result: string',
        'Simple health check program'
      );

      const result = await this.execute(testProgram, { test: 'health_check' });

      // Clean up test program
      this.programs.delete((testProgram as any).id);

      return result.success;
    } catch (error) {
      logger.warn('DSPy health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get statistics about the wrapper usage
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      currentConfig: this.currentConfig,
      programCount: this.programs.size,
      programs: Array.from(this.programs.values()).map((p) => ({
        id: p.id,
        signature: p.signature,
        description: p.description,
        executionCount: p.getMetadata()?.executionCount || 0,
        averageExecutionTime: p.getMetadata()?.averageExecutionTime || 0,
      })),
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.programs.clear();
    this.dspyInstance = null;
    this.currentConfig = null;
    this.isInitialized = false;

    logger.info('DSPy wrapper cleaned up');
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.dspyInstance) {
      throw new DSPyAPIError('DSPy wrapper not initialized. Call configure() first.');
    }
  }
}

/**
 * Internal wrapper class for DSPy programs with enhanced metadata tracking
 */
class DSPyProgramWrapper implements DSPyProgram {
  public readonly id: string;
  public readonly signature: string;
  public readonly description: string;
  private rawProgram: any;
  private metadata: DSPyProgramMetadata;
  private examples: DSPyExample[] = [];

  constructor(rawProgram: any, signature: string, description: string, wrapper: DSPyWrapperImpl) {
    this.id = `dspy-program-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.signature = signature;
    this.description = description;
    this.rawProgram = rawProgram;
    // wrapper parameter is unused - removed assignment to non-existent property

    this.metadata = {
      signature,
      description,
      createdAt: new Date(),
      executionCount: 0,
      averageExecutionTime: 0,
      examples: [],
    };
  }

  async forward(input: Record<string, any>): Promise<Record<string, any>> {
    if (this.rawProgram.forward) {
      return await this.rawProgram.forward(input);
    } else if (typeof this.rawProgram === 'function') {
      return await this.rawProgram(input);
    } else {
      throw new DSPyExecutionError('Program forward method not available', {
        programId: this.id,
        rawProgramType: typeof this.rawProgram,
      });
    }
  }

  getMetadata(): DSPyProgramMetadata {
    return { ...this.metadata, examples: [...this.examples] };
  }

  updateExecutionStats(executionTime: number): void {
    this.metadata.executionCount++;
    this.metadata.lastExecuted = new Date();

    // Update rolling average
    if (this.metadata.executionCount === 1) {
      this.metadata.averageExecutionTime = executionTime;
    } else {
      this.metadata.averageExecutionTime =
        (this.metadata.averageExecutionTime * (this.metadata.executionCount - 1) + executionTime) /
        this.metadata.executionCount;
    }
  }

  addExamples(examples: DSPyExample[]): void {
    this.examples.push(...examples);
    this.metadata.examples = [...this.examples];
  }
}

// =============================================================================
// Factory Functions for Easy Creation
// =============================================================================

/**
 * Create a new DSPy wrapper with configuration
 */
export async function createDSPyWrapper(config: DSPyConfig): Promise<DSPyWrapper> {
  const wrapper = new DSPyWrapperImpl();
  await wrapper.configure(config);
  return wrapper;
}

/**
 * Create a DSPy wrapper with default configuration
 */
export async function createDefaultDSPyWrapper(): Promise<DSPyWrapper> {
  return createDSPyWrapper(DEFAULT_DSPY_CONFIG);
}

/**
 * Get a singleton DSPy wrapper instance (lazy initialization)
 */
let singletonWrapper: DSPyWrapper | null = null;
export async function getSingletonDSPyWrapper(config?: DSPyConfig): Promise<DSPyWrapper> {
  if (!singletonWrapper) {
    singletonWrapper = await createDSPyWrapper(config || DEFAULT_DSPY_CONFIG);
  }
  return singletonWrapper;
}

// Export types that other modules need
export type { DSPyWrapper, DSPyProgram };
// Export the main implementation class as default
export default DSPyWrapperImpl;
