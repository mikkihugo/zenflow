/**
 * @fileoverview DSPy Language Model Interface - Production Grade
 *
 * Core LM interface for all DSPy language model interactions.
 * 100% compatible with Stanford DSPy's LM interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

/**
 * Language Model Interface
 * Base interface that all DSPy language models must implement
 */
export interface LMInterface {
  /** Model identifier/name */
  model?: string;

  /** Generate text from prompt */
  generate(prompt: string, options?: GenerationOptions): Promise<string>;

  /** Optional: Generate multiple completions */
  generateMultiple?(
    prompts: string[],
    options?: GenerationOptions
  ): Promise<string[]>;

  /** Optional: Kill/cleanup LM resources */
  kill?(): void;

  /** Optional: Launch/initialize LM */
  launch?(): void;

  /** Optional: Check if LM is ready */
  isReady?(): boolean;

  /** Optional: Get model info */
  getInfo?(): ModelInfo;

  /** Optional: Get usage statistics */
  getUsage?(): ModelUsage;

  /** Optional: Reset usage statistics */
  resetUsage?(): void;
}

/**
 * Generation options for language models
 */
export interface GenerationOptions {
  /** Maximum tokens to generate */
  max_tokens?: number;

  /** Temperature for sampling (0-1) */
  temperature?: number;

  /** Top-p sampling threshold */
  top_p?: number;

  /** Top-k sampling threshold */
  top_k?: number;

  /** Stop sequences */
  stop?: string[];

  /** Number of completions to generate */
  n?: number;

  /** Whether to echo the prompt */
  echo?: boolean;

  /** Random seed for reproducibility */
  seed?: number;

  /** Custom model parameters */
  [key: string]: any;
}

/**
 * Model information interface
 */
export interface ModelInfo {
  /** Model name/identifier */
  name: string;

  /** Model provider (OpenAI, Anthropic, etc.) */
  provider?: string;

  /** Model version */
  version?: string;

  /** Context length limit */
  context_length?: number;

  /** Maximum output tokens */
  max_output_tokens?: number;

  /** Supported capabilities */
  capabilities?: string[];

  /** Cost per token (if available) */
  cost_per_token?: {
    input?: number;
    output?: number;
  };
}

/**
 * Model usage statistics
 */
export interface ModelUsage {
  /** Total input tokens used */
  input_tokens: number;

  /** Total output tokens used */
  output_tokens: number;

  /** Total API calls made */
  api_calls: number;

  /** Total cost (if tracking enabled) */
  total_cost?: number;

  /** Last usage timestamp */
  last_used?: number;

  /** Usage by date */
  daily_usage?: Record<
    string,
    {
      input_tokens: number;
      output_tokens: number;
      api_calls: number;
      cost?: number;
    }
  >;
}

/**
 * Base Language Model class with common functionality
 */
export abstract class BaseLM implements LMInterface {
  public model?: string;
  protected usage: ModelUsage = {
    input_tokens: 0,
    output_tokens: 0,
    api_calls: 0,
    last_used: Date.now(),
  };

  constructor(model?: string) {
    this.model = model ?? 'unknown';
  }

  abstract generate(
    prompt: string,
    options?: GenerationOptions
  ): Promise<string>;

  /**
   * Track usage statistics
   */
  protected trackUsage(
    inputTokens: number,
    outputTokens: number,
    cost?: number
  ): void {
    this.usage.input_tokens += inputTokens;
    this.usage.output_tokens += outputTokens;
    this.usage.api_calls += 1;
    this.usage.last_used = Date.now();

    if (cost !== undefined) {
      this.usage.total_cost = (this.usage.total_cost'' | '''' | ''0) + cost;
    }

    // Track daily usage
    const today = new Date().toISOString().split('T')[0];
    if (!today) {
      throw new Error("Failed to get today's date");
    }
    if (!this.usage.daily_usage) {
      this.usage.daily_usage = {};
    }
    if (!this.usage.daily_usage[today]) {
      this.usage.daily_usage[today] = {
        input_tokens: 0,
        output_tokens: 0,
        api_calls: 0,
        cost: 0,
      };
    }

    const dayUsage = this.usage.daily_usage[today];
    if (dayUsage) {
      dayUsage.input_tokens += inputTokens;
      dayUsage.output_tokens += outputTokens;
      dayUsage.api_calls += 1;
      if (cost !== undefined) {
        dayUsage.cost = (dayUsage.cost'' | '''' | ''0) + cost;
      }
    }
  }

  /**
   * Get usage statistics
   */
  getUsage(): ModelUsage {
    return { ...this.usage };
  }

  /**
   * Reset usage statistics
   */
  resetUsage(): void {
    this.usage = {
      input_tokens: 0,
      output_tokens: 0,
      api_calls: 0,
      last_used: Date.now(),
    };
  }

  /**
   * Get model info (override in subclasses)
   */
  getInfo(): ModelInfo {
    return {
      name: this.model'' | '''' | '''unknown',
      provider: 'unknown',
    };
  }

  /**
   * Check if ready (default implementation)
   */
  isReady(): boolean {
    return true;
  }

  /**
   * Kill/cleanup (default implementation)
   */
  kill(): void {
    // Default: no-op
  }

  /**
   * Launch/initialize (default implementation)
   */
  launch(): void {
    // Default: no-op
  }
}

export default LMInterface;
