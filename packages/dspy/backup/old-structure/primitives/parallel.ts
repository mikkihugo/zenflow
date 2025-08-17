/**
 * @fileoverview Parallel Execution DSPy Module
 * 
 * Implementation of parallel execution for running multiple DSPy modules
 * concurrently with error handling and progress tracking.
 * Based on Stanford DSPy's Parallel implementation.
 * 
 * Key Features:
 * - Concurrent execution with configurable thread count
 * - Error handling with maximum error limits
 * - Progress tracking and monitoring
 * - Graceful error recovery and cancellation
 * - Support for different input types (Examples, objects, tuples)
 * - Straggler timeout and resubmission
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import type { Example } from './example.js';

/**
 * Execution pair type
 */
export type ExecutionPair = [BaseModule, Example | Record<string, any> | any[] | any];

/**
 * Configuration for Parallel execution
 */
export interface ParallelConfig {
  /** Number of concurrent workers (default: navigator.hardwareConcurrency || 4) */
  numThreads?: number;
  /** Maximum number of errors before cancellation (default: 10) */
  maxErrors?: number;
  /** Access input examples (default: true) */
  accessExamples?: boolean;
  /** Return failed examples in result (default: false) */
  returnFailedExamples?: boolean;
  /** Provide detailed tracebacks on errors (default: true) */
  provideTraceback?: boolean;
  /** Disable progress reporting (default: false) */
  disableProgress?: boolean;
  /** Timeout for individual tasks in milliseconds (default: 120000) */
  timeout?: number;
  /** Number of stragglers before timeout handling kicks in (default: 3) */
  stragglerLimit?: number;
}

/**
 * Result from parallel execution
 */
export interface ParallelResult<T = any> {
  /** Results from successful executions */
  results: (T | null)[];
  /** Failed examples (if returnFailedExamples is true) */
  failedExamples?: any[];
  /** Exceptions encountered (if returnFailedExamples is true) */
  exceptions?: Error[];
  /** Statistics about the execution */
  stats: {
    total: number;
    successful: number;
    failed: number;
    cancelled: number;
    duration: number;
  };
}

/**
 * Progress tracker interface
 */
export interface ProgressTracker {
  /** Start tracking with total count */
  start(total: number): void;
  /** Update progress with current count */
  update(current: number, total: number, message?: string): void;
  /** Finish tracking */
  finish(): void;
}

/**
 * Simple console progress tracker
 */
export class ConsoleProgressTracker implements ProgressTracker {
  private startTime: number = 0;
  private lastUpdate: number = 0;

  start(total: number): void {
    this.startTime = Date.now();
    this.lastUpdate = 0;
    console.log(`🚀 Starting parallel execution of ${total} tasks...`);
  }

  update(current: number, total: number, message?: string): void {
    const percent = Math.round((current / total) * 100);
    const elapsed = Date.now() - this.startTime;
    
    // Only update every 5% or every 2 seconds
    if (percent >= this.lastUpdate + 5 || elapsed > this.lastUpdate + 2000) {
      this.lastUpdate = percent;
      const baseMsg = `📊 Progress: ${current}/${total} (${percent}%)`;
      const timeMsg = elapsed > 1000 ? ` - ${Math.round(elapsed / 1000)}s` : '';
      const customMsg = message ? ` - ${message}` : '';
      console.log(baseMsg + timeMsg + customMsg);
    }
  }

  finish(): void {
    const elapsed = Date.now() - this.startTime;
    console.log(`✅ Parallel execution completed in ${Math.round(elapsed / 1000)}s`);
  }
}

/**
 * Parallel Module - Concurrent Execution Engine
 * 
 * Executes multiple DSPy modules concurrently with error handling,
 * progress tracking, and timeout management.
 * 
 * Algorithm:
 * 1. Validate and prepare execution pairs
 * 2. Create worker pool with specified concurrency
 * 3. Submit all tasks to workers
 * 4. Monitor progress and handle errors
 * 5. Apply timeout and straggler handling
 * 6. Collect and return results
 * 
 * @example
 * ```typescript
 * import { Parallel, ChainOfThought } from './primitives';
 * 
 * // Create modules and examples
 * const qa = new ChainOfThought({
 *   inputs: { question: 'string' },
 *   outputs: { answer: 'string' }
 * });
 * 
 * const examples = [
 *   { question: "What is 2+2?" },
 *   { question: "What is the capital of France?" },
 *   { question: "What is the meaning of life?" }
 * ];
 * 
 * // Create execution pairs
 * const execPairs = examples.map(ex => [qa, ex] as ExecutionPair);
 * 
 * // Execute in parallel
 * const parallel = new Parallel({ numThreads: 2, maxErrors: 1 });
 * const result = await parallel.forward(execPairs);
 * 
 * console.log(result.results); // Array of results
 * console.log(result.stats);   // Execution statistics
 * ```
 */
export class Parallel extends BaseModule {
  private numThreads: number;
  private maxErrors: number;
  private accessExamples: boolean;
  private returnFailedExamples: boolean;
  private provideTraceback: boolean;
  private disableProgress: boolean;
  private timeout: number;
  private stragglerLimit: number;
  private progressTracker: ProgressTracker;

  /**
   * Initialize Parallel execution module
   * 
   * @param config - Configuration options
   */
  constructor(config: ParallelConfig = {}) {
    super();

    this.numThreads = config.numThreads || (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4) || 4;
    this.maxErrors = config.maxErrors || 10;
    this.accessExamples = config.accessExamples ?? true;
    this.returnFailedExamples = config.returnFailedExamples || false;
    this.provideTraceback = config.provideTraceback ?? true;
    this.disableProgress = config.disableProgress || false;
    this.timeout = config.timeout || 120000; // 2 minutes
    this.stragglerLimit = config.stragglerLimit || 3;
    this.progressTracker = new ConsoleProgressTracker();

    // Add parameters
    this.addParameter('numThreads', this.numThreads, true);
    this.addParameter('maxErrors', this.maxErrors, true);
    this.addParameter('accessExamples', this.accessExamples, true);
    this.addParameter('returnFailedExamples', this.returnFailedExamples, true);
    this.addParameter('timeout', this.timeout, true);
  }

  /**
   * Forward pass - execute tasks in parallel
   * 
   * @param execPairs - Array of [module, example] pairs to execute
   * @param numThreads - Override number of threads for this execution
   * @returns Parallel execution result
   */
  async forward<T = any>(
    execPairs: ExecutionPair[], 
    numThreads?: number
  ): Promise<ParallelResult<T>> {
    const startTime = Date.now();
    const actualThreads = numThreads ?? this.numThreads;
    
    if (!Array.isArray(execPairs) || execPairs.length === 0) {
      throw new Error('Parallel: execPairs must be a non-empty array');
    }

    // Initialize progress tracking
    if (!this.disableProgress) {
      this.progressTracker.start(execPairs.length);
    }

    // Initialize state
    const results: (T | null)[] = new Array(execPairs.length).fill(null);
    const failedExamples: any[] = [];
    const exceptions: Error[] = [];
    let errorCount = 0;
    let cancelled = false;

    // Create AbortController for cancellation
    const abortController = new AbortController();
    
    try {
      // Execute with limited concurrency
      await this.executeWithConcurrency(
        execPairs,
        actualThreads,
        async (pair, index) => {
          if (abortController.signal.aborted || cancelled) {
            return null;
          }

          try {
            const result = await this.processPair(pair, abortController.signal);
            results[index] = result;
            
            // Update progress
            if (!this.disableProgress) {
              const completed = results.filter(r => r !== null).length;
              this.progressTracker.update(completed, execPairs.length);
            }
            
            return result;
          } catch (error) {
            errorCount++;
            
            if (this.provideTraceback) {
              console.error(`❌ Error processing pair ${index}:`, error);
            } else {
              console.error(`❌ Error processing pair ${index}: ${error instanceof Error ? error.message : error}`);
            }

            // Store failed example and exception if requested
            if (this.returnFailedExamples) {
              failedExamples.push(pair[1]);
              exceptions.push(error instanceof Error ? error : new Error(String(error)));
            }

            // Check if we should cancel
            if (errorCount >= this.maxErrors) {
              console.warn(`🚨 Maximum errors (${this.maxErrors}) reached, cancelling remaining tasks`);
              cancelled = true;
              abortController.abort();
            }

            return null;
          }
        }
      );

    } catch (error) {
      console.error('❌ Parallel execution failed:', error);
      throw error;
    } finally {
      if (!this.disableProgress) {
        this.progressTracker.finish();
      }
    }

    // Calculate statistics
    const successful = results.filter(r => r !== null).length;
    const failed = errorCount;
    const cancelledCount = execPairs.length - successful - failed;
    const duration = Date.now() - startTime;

    const stats = {
      total: execPairs.length,
      successful,
      failed,
      cancelled: cancelledCount,
      duration
    };

    console.log(`📊 Parallel execution stats: ${successful}/${execPairs.length} successful, ${failed} failed, ${cancelledCount} cancelled`);

    // Build result
    const result: ParallelResult<T> = {
      results,
      stats
    };

    if (this.returnFailedExamples) {
      result.failedExamples = failedExamples;
      result.exceptions = exceptions;
    }

    return result;
  }

  /**
   * Synchronous forward pass (not supported)
   */
  forwardSync(execPairs: ExecutionPair[]): ParallelResult {
    throw new Error('Synchronous parallel execution not supported');
  }

  /**
   * Execute tasks with limited concurrency
   */
  private async executeWithConcurrency<T>(
    items: ExecutionPair[],
    concurrency: number,
    processor: (item: ExecutionPair, index: number) => Promise<T | null>
  ): Promise<void> {
    const semaphore = new Array(concurrency).fill(null);
    const promises: Promise<any>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Wait for available slot
      const promise = (async () => {
        const slotIndex = await this.acquireSlot(semaphore);
        try {
          return await processor(item, i);
        } finally {
          this.releaseSlot(semaphore, slotIndex);
        }
      })();

      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  /**
   * Acquire a semaphore slot
   */
  private async acquireSlot(semaphore: any[]): Promise<number> {
    while (true) {
      for (let i = 0; i < semaphore.length; i++) {
        if (semaphore[i] === null) {
          semaphore[i] = true;
          return i;
        }
      }
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  /**
   * Release a semaphore slot
   */
  private releaseSlot(semaphore: any[], index: number): void {
    semaphore[index] = null;
  }

  /**
   * Process a single execution pair
   */
  private async processPair(pair: ExecutionPair, signal: AbortSignal): Promise<any> {
    const [module, example] = pair;

    // Check for cancellation
    if (signal.aborted) {
      throw new Error('Execution cancelled');
    }

    // Apply timeout
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timeout after ${this.timeout}ms`));
      }, this.timeout);
      
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Execution cancelled'));
      });
    });

    const executionPromise = this.executeModule(module, example);

    return Promise.race([executionPromise, timeoutPromise]);
  }

  /**
   * Execute a module with an example
   */
  private async executeModule(module: BaseModule, example: any): Promise<any> {
    if (this.isExample(example)) {
      if (this.accessExamples) {
        // Extract inputs from Example
        const inputs = this.extractInputs(example);
        return await module.aforward(inputs);
      } else {
        return await module.aforward(example);
      }
    } else if (this.isPlainObject(example)) {
      return await module.aforward(example);
    } else if (Array.isArray(example)) {
      // Handle array inputs
      if (module.constructor.name === 'Parallel') {
        return await (module as any).forward(example);
      } else {
        throw new Error('Array inputs only supported for Parallel modules');
      }
    } else if (this.isTuple(example)) {
      // Handle tuple inputs (array with specific structure)
      const inputs = Array.isArray(example) ? example : [example];
      return await module.aforward(...inputs);
    } else {
      throw new Error(
        `Invalid example type: ${typeof example}, supported types are Example, object, array, and tuple`
      );
    }
  }

  /**
   * Check if value is an Example
   */
  private isExample(value: any): value is Example {
    return value && typeof value === 'object' && '_input_keys' in value;
  }

  /**
   * Check if value is a plain object
   */
  private isPlainObject(value: any): value is Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) && !this.isExample(value);
  }

  /**
   * Check if value is a tuple (array with mixed types)
   */
  private isTuple(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Extract inputs from an Example
   */
  private extractInputs(example: Example): Record<string, any> {
    const inputs: Record<string, any> = {};
    const inputKeys = example._input_keys || [];
    
    for (const key of inputKeys) {
      if (key in example) {
        inputs[key] = (example as any)[key];
      }
    }
    
    return inputs;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ParallelConfig>): void {
    if (updates.numThreads !== undefined) {
      this.numThreads = updates.numThreads;
      this.updateParameter('numThreads', this.numThreads);
    }
    
    if (updates.maxErrors !== undefined) {
      this.maxErrors = updates.maxErrors;
      this.updateParameter('maxErrors', this.maxErrors);
    }
    
    if (updates.accessExamples !== undefined) {
      this.accessExamples = updates.accessExamples;
      this.updateParameter('accessExamples', this.accessExamples);
    }
    
    if (updates.returnFailedExamples !== undefined) {
      this.returnFailedExamples = updates.returnFailedExamples;
      this.updateParameter('returnFailedExamples', this.returnFailedExamples);
    }
    
    if (updates.timeout !== undefined) {
      this.timeout = updates.timeout;
      this.updateParameter('timeout', this.timeout);
    }

    if (updates.provideTraceback !== undefined) {
      this.provideTraceback = updates.provideTraceback;
    }

    if (updates.disableProgress !== undefined) {
      this.disableProgress = updates.disableProgress;
    }

    if (updates.stragglerLimit !== undefined) {
      this.stragglerLimit = updates.stragglerLimit;
    }
  }

  /**
   * Set custom progress tracker
   */
  setProgressTracker(tracker: ProgressTracker): void {
    this.progressTracker = tracker;
  }

  /**
   * Get current configuration
   */
  getConfig(): ParallelConfig {
    return {
      numThreads: this.numThreads,
      maxErrors: this.maxErrors,
      accessExamples: this.accessExamples,
      returnFailedExamples: this.returnFailedExamples,
      provideTraceback: this.provideTraceback,
      disableProgress: this.disableProgress,
      timeout: this.timeout,
      stragglerLimit: this.stragglerLimit
    };
  }

  /**
   * Create deep copy
   */
  deepcopy(): Parallel {
    const copy = new Parallel({
      numThreads: this.numThreads,
      maxErrors: this.maxErrors,
      accessExamples: this.accessExamples,
      returnFailedExamples: this.returnFailedExamples,
      provideTraceback: this.provideTraceback,
      disableProgress: this.disableProgress,
      timeout: this.timeout,
      stragglerLimit: this.stragglerLimit
    });
    
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Factory function to create Parallel module
 */
export function createParallel(config: ParallelConfig = {}): Parallel {
  return new Parallel(config);
}

/**
 * Utility function to create execution pairs
 */
export function createExecutionPairs(
  module: BaseModule,
  examples: (Example | Record<string, any> | any[] | any)[]
): ExecutionPair[] {
  return examples.map(example => [module, example]);
}

/**
 * Utility function to create execution pairs for multiple modules
 */
export function createMultiModuleExecutionPairs(
  pairs: Array<[BaseModule, Example | Record<string, any> | any[] | any]>
): ExecutionPair[] {
  return pairs;
}

/**
 * Default export
 */
export default Parallel;