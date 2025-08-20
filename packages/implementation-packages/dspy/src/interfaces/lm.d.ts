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
    generateMultiple?(prompts: string[], options?: GenerationOptions): Promise<string[]>;
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
    daily_usage?: Record<string, {
        input_tokens: number;
        output_tokens: number;
        api_calls: number;
        cost?: number;
    }>;
}
/**
 * Base Language Model class with common functionality
 */
export declare abstract class BaseLM implements LMInterface {
    model?: string;
    protected usage: ModelUsage;
    constructor(model?: string);
    abstract generate(prompt: string, options?: GenerationOptions): Promise<string>;
    /**
     * Track usage statistics
     */
    protected trackUsage(inputTokens: number, outputTokens: number, cost?: number): void;
    /**
     * Get usage statistics
     */
    getUsage(): ModelUsage;
    /**
     * Reset usage statistics
     */
    resetUsage(): void;
    /**
     * Get model info (override in subclasses)
     */
    getInfo(): ModelInfo;
    /**
     * Check if ready (default implementation)
     */
    isReady(): boolean;
    /**
     * Kill/cleanup (default implementation)
     */
    kill(): void;
    /**
     * Launch/initialize (default implementation)
     */
    launch(): void;
}
export default LMInterface;
//# sourceMappingURL=lm.d.ts.map