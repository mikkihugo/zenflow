/**
 * @fileoverview Retry - Error recovery and retry logic mechanism
 * 
 * Complete implementation of Stanford's Retry mechanism for robust error handling.
 * Provides automatic retry with feedback and past output tracking for improved reliability.
 * Based on Stanford's retry.py - sophisticated backtracking and error recovery.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { BaseModule } from './module.js';
import { Prediction } from './prediction.js';
import { Predict } from './predict.js';
import type { Signature, Example } from '../interfaces/types.js';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  max_retries?: number;
  /** Backoff multiplier for delay between retries */
  backoff_multiplier?: number;
  /** Initial delay in milliseconds */
  initial_delay?: number;
  /** Maximum delay in milliseconds */
  max_delay?: number;
  /** Enable progressive feedback enhancement */
  progressive_feedback?: boolean;
  /** Custom retry condition function */
  retry_condition?: (error: any, attempt: number) => boolean;
  /** Custom feedback generator */
  feedback_generator?: (error: any, pastOutputs: Record<string, any>, attempt: number) => string;
}

/**
 * Retry state tracking
 */
interface RetryState {
  attempt: number;
  pastOutputs: Record<string, any>[];
  errors: any[];
  feedbacks: string[];
  lastSuccessful?: Prediction;
}

/**
 * Retry mechanism for error recovery and retry logic
 * 
 * Automatically retries failed operations with intelligent feedback
 * and past output tracking for improved success rates.
 */
export class Retry extends Predict {
  private config: Required<RetryConfig>;
  private module: BaseModule;
  private originalSignature: Signature;
  private originalForward: (inputs: Record<string, any>) => Promise<Prediction>;
  private newSignature: Signature;
  private state: RetryState;

  constructor(module: BaseModule, config: RetryConfig = {}) {
    // Create enhanced signature with retry fields
    const enhancedSignature = Retry.createRetrySignature(module.signature || Retry.getDefaultSignature());
    super(enhancedSignature);

    this.config = {
      max_retries: config.max_retries || 3,
      backoff_multiplier: config.backoff_multiplier || 2,
      initial_delay: config.initial_delay || 100,
      max_delay: config.max_delay || 5000,
      progressive_feedback: config.progressive_feedback ?? true,
      retry_condition: config.retry_condition || this.defaultRetryCondition,
      feedback_generator: config.feedback_generator || this.defaultFeedbackGenerator
    };

    this.module = module;
    this.originalSignature = module.signature || Retry.getDefaultSignature();
    this.originalForward = module.forward.bind(module);
    this.newSignature = enhancedSignature;
    
    this.resetState();
  }

  /**
   * Create retry-enhanced signature with past output fields
   */
  private static createRetrySignature(originalSignature: Signature): Signature {
    const retrySignature: Signature = {
      ...originalSignature,
      inputs: { ...originalSignature.inputs },
      outputs: { ...originalSignature.outputs }
    };

    // Add "past_" input fields for each output field
    for (const [key, field] of Object.entries(originalSignature.outputs)) {
      const pastKey = `past_${key}`;
      retrySignature.inputs[pastKey] = {
        ...field,
        description: `Past ${key} attempts with errors`,
        required: false
      };
    }

    // Add feedback input field
    retrySignature.inputs.feedback = {
      type: 'string',
      description: 'Instructions and feedback for retry attempts',
      required: false
    };

    // Add attempt tracking field
    retrySignature.inputs.attempt_number = {
      type: 'number',
      description: 'Current retry attempt number',
      required: false
    };

    return retrySignature;
  }

  /**
   * Get default signature if none provided
   */
  private static getDefaultSignature(): Signature {
    return {
      name: 'DefaultRetry',
      description: 'Default retry signature',
      inputs: {
        input: { type: 'string', description: 'Input to process', required: true }
      },
      outputs: {
        output: { type: 'string', description: 'Processed output', required: true }
      }
    };
  }

  /**
   * Reset retry state
   */
  private resetState(): void {
    this.state = {
      attempt: 0,
      pastOutputs: [],
      errors: [],
      feedbacks: [],
      lastSuccessful: undefined
    };
  }

  /**
   * Enhanced forward method with retry logic
   */
  async forward(inputs: Record<string, any>): Promise<Prediction> {
    this.resetState();
    let lastError: any = null;

    for (let attempt = 0; attempt <= this.config.max_retries; attempt++) {
      this.state.attempt = attempt;

      try {
        // Prepare inputs with retry context
        const retryInputs = this.prepareRetryInputs(inputs, attempt);
        
        // Execute original module with retry context
        const prediction = await this.executeWithRetryContext(retryInputs);
        
        // Success - reset state and return
        this.state.lastSuccessful = prediction;
        return prediction;
        
      } catch (error) {
        lastError = error;
        this.state.errors.push(error);
        
        // Check if we should retry
        if (attempt < this.config.max_retries && this.config.retry_condition(error, attempt)) {
          // Generate feedback for next attempt
          const feedback = this.config.feedback_generator(
            error,
            this.state.pastOutputs.length > 0 ? this.state.pastOutputs[this.state.pastOutputs.length - 1] : {},
            attempt
          );
          this.state.feedbacks.push(feedback);
          
          // Add failed attempt to past outputs
          this.state.pastOutputs.push({
            error: error.message || String(error),
            attempt,
            timestamp: Date.now()
          });
          
          // Wait before retry (exponential backoff)
          const delay = Math.min(
            this.config.initial_delay * Math.pow(this.config.backoff_multiplier, attempt),
            this.config.max_delay
          );
          
          console.log(`🔄 Retry attempt ${attempt + 1}/${this.config.max_retries} after ${delay}ms...`);
          await this.sleep(delay);
          
        } else {
          // Max retries reached or retry condition failed
          break;
        }
      }
    }

    // All retries failed - create failure prediction
    return this.createFailurePrediction(lastError, inputs);
  }

  /**
   * Prepare inputs with retry context
   */
  private prepareRetryInputs(originalInputs: Record<string, any>, attempt: number): Record<string, any> {
    const retryInputs = { ...originalInputs };

    // Add past outputs for each original output field
    for (const outputKey of Object.keys(this.originalSignature.outputs)) {
      const pastKey = `past_${outputKey}`;
      if (this.state.pastOutputs.length > 0) {
        retryInputs[pastKey] = this.state.pastOutputs.map(output => output[outputKey] || output.error);
      }
    }

    // Add feedback if available
    if (this.state.feedbacks.length > 0) {
      retryInputs.feedback = this.state.feedbacks[this.state.feedbacks.length - 1];
    }

    // Add attempt number
    retryInputs.attempt_number = attempt;

    return retryInputs;
  }

  /**
   * Execute module with retry context
   */
  private async executeWithRetryContext(inputs: Record<string, any>): Promise<Prediction> {
    // Use enhanced signature for retry context
    const retryPrediction = await super.forward(inputs);
    
    // Execute original module with processed inputs
    const originalInputs = { ...inputs };
    
    // Remove retry-specific fields for original module
    delete originalInputs.feedback;
    delete originalInputs.attempt_number;
    for (const outputKey of Object.keys(this.originalSignature.outputs)) {
      delete originalInputs[`past_${outputKey}`];
    }
    
    return this.originalForward(originalInputs);
  }

  /**
   * Default retry condition - retry on most errors except certain types
   */
  private defaultRetryCondition(error: any, attempt: number): boolean {
    // Don't retry on authentication or permission errors
    if (error.name === 'AuthenticationError' || error.name === 'PermissionError') {
      return false;
    }
    
    // Don't retry on validation errors
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return false;
    }
    
    // Retry on network, timeout, and rate limit errors
    return true;
  }

  /**
   * Default feedback generator
   */
  private defaultFeedbackGenerator(
    error: any,
    pastOutputs: Record<string, any>,
    attempt: number
  ): string {
    let feedback = `Attempt ${attempt + 1} failed with error: ${error.message || String(error)}. `;
    
    if (this.config.progressive_feedback && attempt > 0) {
      feedback += `Previous attempts have failed. Please analyze the error pattern and try a different approach. `;
    }
    
    // Provide specific guidance based on error type
    if (error.name === 'SyntaxError' || error.message?.includes('syntax')) {
      feedback += 'Focus on correct syntax and formatting. ';
    } else if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      feedback += 'Previous attempt timed out. Try a more efficient approach. ';
    } else if (error.message?.includes('rate limit')) {
      feedback += 'Rate limit exceeded. The system will automatically retry after a delay. ';
    } else {
      feedback += 'Please review the requirements and ensure your response meets all criteria. ';
    }
    
    return feedback;
  }

  /**
   * Create failure prediction when all retries exhausted
   */
  private createFailurePrediction(error: any, inputs: Record<string, any>): Prediction {
    return {
      id: `retry-failed-${Date.now()}`,
      outputs: {},
      metadata: {
        retry_failed: true,
        total_attempts: this.state.attempt + 1,
        final_error: error.message || String(error),
        all_errors: this.state.errors.map(e => e.message || String(e)),
        feedbacks: this.state.feedbacks,
        inputs
      },
      trace: []
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Override call method to handle backtracking
   */
  async __call__(inputs: Record<string, any>): Promise<Prediction> {
    // Handle backtracking if configured
    if ((globalThis as any).dspy_settings?.backtrack_to === this) {
      const backtrackArgs = (globalThis as any).dspy_settings?.backtrack_to_args || {};
      const mergedInputs = { ...inputs, ...backtrackArgs };
      return this.forward(mergedInputs);
    }
    
    return this.forward(inputs);
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    totalAttempts: number;
    successRate: number;
    averageAttempts: number;
    commonErrors: string[];
  } {
    return {
      totalAttempts: this.state.attempt + 1,
      successRate: this.state.lastSuccessful ? 1 : 0,
      averageAttempts: this.state.attempt + 1,
      commonErrors: this.state.errors.map(e => e.message || String(e))
    };
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<RetryConfig> {
    return { ...this.config };
  }
}

/**
 * Factory function for creating Retry wrapper
 */
export function createRetry(module: BaseModule, config: RetryConfig = {}): Retry {
  return new Retry(module, config);
}

/**
 * Default Retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Partial<RetryConfig> = {
  max_retries: 3,
  backoff_multiplier: 2,
  initial_delay: 100,
  max_delay: 5000,
  progressive_feedback: true
};

/**
 * Retry factory for common patterns
 */
export const RetryFactory = {
  /**
   * Create fast retry with minimal delays
   */
  fast(module: BaseModule): Retry {
    return new Retry(module, {
      max_retries: 2,
      initial_delay: 50,
      max_delay: 500,
      backoff_multiplier: 1.5
    });
  },

  /**
   * Create standard retry with balanced settings
   */
  standard(module: BaseModule): Retry {
    return new Retry(module, {
      max_retries: 3,
      initial_delay: 100,
      max_delay: 2000,
      backoff_multiplier: 2
    });
  },

  /**
   * Create patient retry with longer delays
   */
  patient(module: BaseModule): Retry {
    return new Retry(module, {
      max_retries: 5,
      initial_delay: 200,
      max_delay: 10000,
      backoff_multiplier: 2.5
    });
  },

  /**
   * Create aggressive retry for critical operations
   */
  aggressive(module: BaseModule): Retry {
    return new Retry(module, {
      max_retries: 10,
      initial_delay: 50,
      max_delay: 1000,
      backoff_multiplier: 1.2,
      progressive_feedback: true
    });
  },

  /**
   * Create custom retry with specific conditions
   */
  custom(
    module: BaseModule,
    retryCondition: (error: any, attempt: number) => boolean,
    feedbackGenerator?: (error: any, pastOutputs: Record<string, any>, attempt: number) => string
  ): Retry {
    return new Retry(module, {
      max_retries: 3,
      retry_condition: retryCondition,
      feedback_generator: feedbackGenerator
    });
  }
};