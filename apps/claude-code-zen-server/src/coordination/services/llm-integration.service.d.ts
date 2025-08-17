/**
 * @fileoverview LLM Integration Service with Claude Code SDK and Optimal Model Strategy
 *
 * This service provides a unified interface for integrating with Claude Code SDK,
 * using optimal Opus/Sonnet model selection strategy and intelligent routing.
 * Enhanced with comprehensive logging, error handling, and model strategy tracking.
 *
 * Key Features:
 * - Claude Code SDK integration with optimal Opus/Sonnet strategy
 * - Automatic model selection (Opus for planning, Sonnet for everything else)
 * - Enhanced logging and error handling with detailed model strategy tracking
 * - Automatic fallback from Claude Code to Gemini CLI to GPT-5 to GitHub Copilot
 * - Intelligent rate limit detection and cooldown management
 * - Permission bypass for file operations
 * - Structured output handling with JSON parsing
 * - Context-aware prompt generation with task complexity assessment
 * - Session management and continuity
 *
 * @author Claude Code Zen Team
 * @version 2.0.0 - Migrated to Claude Code SDK
 * @since 2024-01-01
 *
 * @example Claude Code SDK with Optimal Strategy
 * ```typescript
 * const llmService = new LLMIntegrationService({
 *   projectPath: process.cwd(),
 *   preferredProvider: 'claude-code',
 *   useOptimalModel: true
 * });
 *
 * const result = await llmService.analyze({
 *   task: 'typescript-error-analysis',
 *   context: { files: ['src/neural/gnn'], errors: [...] },
 *   requiresFileOperations: true,
 *   taskContext: {
 *     type: 'analysis',
 *     complexity: 'medium',
 *     domain: 'development',
 *     requiresReasoning: true
 *   }
 * });
 * ```
 */
import { type TaskContext, type ModelType } from '../../intelligence/model-strategy/optimal-model-selector';
import LLMStatsService from '../../intelligence/adaptive-learning/llm-stats-service';
/**
 * Enhanced configuration options for LLM Integration Service with Claude Code SDK.
 */
export interface LLMIntegrationConfig {
    /** Project root path for file operations */
    projectPath: string;
    /** LLM provider - only Claude Code SDK supported */
    preferredProvider?: 'claude-code';
    /** Enable debug logging */
    debug?: boolean;
    /** Session ID for conversation continuity */
    sessionId?: string;
    /** Custom model selection (overrides optimal strategy) */
    model?: string;
    /** GitHub organization for GitHub Models (optional) */
    githubOrg?: string;
    /** GitHub token for direct API access */
    githubToken?: string;
    /** Temperature for model responses (0-1) */
    temperature?: number;
    /** Max tokens for model responses */
    maxTokens?: number;
    /** Rate limit cooldown period in milliseconds (default: 1 hour) */
    rateLimitCooldown?: number;
    /** Enable optimal Opus/Sonnet model selection strategy */
    useOptimalModel?: boolean;
    /** Component name for model selection (if part of a larger system) */
    componentName?: string;
    /** Enable enhanced logging with model strategy details */
    enhancedLogging?: boolean;
    /** Statistics service integration */
    statsService?: LLMStatsService;
}
/**
 * Enhanced analysis request configuration with model strategy support.
 */
export interface AnalysisRequest {
    /** Type of analysis task */
    task: 'domain-analysis' | 'typescript-error-analysis' | 'code-review' | 'custom';
    /** Analysis context data */
    context: {
        files?: string[];
        errors?: unknown[];
        domains?: unknown[];
        dependencies?: unknown;
        customData?: unknown;
        swarmContext?: {
            swarmId?: string;
            agentId?: string;
            coordinationLevel?: 'high' | 'medium' | 'low';
        };
    };
    /** Custom prompt text */
    prompt?: string;
    /** Whether analysis requires file write operations (default: false for security) */
    requiresFileOperations?: boolean;
    /** Output file path if writing results */
    outputPath?: string;
    /** JSON schema for structured output (Azure AI inference only) */
    jsonSchema?: {
        name: string;
        schema: object;
        description: string;
        strict?: boolean;
    };
    /** Task context for optimal model selection */
    taskContext?: TaskContext;
    /** Component name for component-based model selection */
    componentName?: string;
    /** Override optimal model selection */
    forceModel?: ModelType;
    /** Enable model strategy tracking in results */
    trackModelStrategy?: boolean;
}
/**
 * Enhanced analysis result structure with model strategy tracking.
 */
export interface AnalysisResult {
    /** Whether analysis was successful */
    success: boolean;
    /** Analysis results data */
    data: unknown;
    /** Which provider was used */
    provider: 'claude-code' | 'gemini' | 'gemini-direct' | 'gemini-pro' | 'github-models' | 'copilot';
    /** Execution time in milliseconds */
    executionTime: number;
    /** Any error that occurred */
    error?: string;
    /** Output file path if file was written */
    outputFile?: string;
    /** Model strategy information */
    modelStrategy?: {
        /** Selected model (opus or sonnet) */
        selectedModel: ModelType;
        /** Model selection rationale */
        rationale: string;
        /** Whether optimal model selection was used */
        wasOptimal: boolean;
        /** Task context used for selection */
        taskContext?: TaskContext;
        /** Fallback information if model selection failed */
        fallbackInfo?: {
            originalModel: ModelType;
            fallbackModel: ModelType;
            reason: string;
        };
    };
    /** Token usage information */
    tokenUsage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    /** Additional metadata */
    metadata?: {
        /** Whether fallback was used */
        fallbackUsed: boolean;
        /** Reason for fallback */
        fallbackReason?: string;
        /** Attempted providers */
        attemptedProviders: string[];
        /** Final model used */
        finalModel?: string;
        /** Performance metrics */
        performance?: {
            latency: number;
            throughput?: number;
            reliability?: number;
        };
    };
}
export declare class LLMIntegrationService {
    private config;
    private sessionId;
    private rateLimitTracker;
    private statsService;
    private enhancedLogger;
    private static readonly JSON_SCHEMAS;
    /**
     * Creates a new LLM Integration Service with Claude Code SDK and optimal model strategy.
     *
     * @constructor
     * @param {LLMIntegrationConfig} config - Service configuration
     *
     * @example Claude Code SDK with Optimal Strategy
     * ```typescript
     * const service = new LLMIntegrationService({
     *   projectPath: '/path/to/project',
     *   preferredProvider: 'claude-code',
     *   useOptimalModel: true,           // Enable Opus/Sonnet strategy
     *   enhancedLogging: true,           // Detailed logging
     *   componentName: 'neural-analyzer' // For component-based selection
     * });
     * ```
     *
     * @example GitHub Models API (Free GPT-5 via Azure AI Inference)
     * ```typescript
     * const service = new LLMIntegrationService({
     *   projectPath: '/path/to/project',
     *   preferredProvider: 'github-models',
     *   model: 'openai/gpt-5',
     *   temperature: 0.1,
     *   maxTokens: 4000,
     *   githubToken: process.env.GITHUB_TOKEN
     * });
     * ```
     */
    constructor(config: LLMIntegrationConfig);
    /**
     * Gets the default model for each provider using centralized config and optimal strategy.
     *
     * @private
     * @param {string} provider - Provider name
     * @returns {string} Default model
     */
    private getDefaultModel;
    /**
     * Performs analysis using Claude Code SDK with optimal Opus/Sonnet model strategy.
     *
     * This method automatically selects the optimal Claude model (Opus for planning,
     * Sonnet for everything else) and handles fallback if the preferred provider is
     * unavailable. Enhanced with comprehensive logging and model strategy tracking.
     *
     * @async
     * @method analyze
     * @param {AnalysisRequest} request - Analysis configuration and context
     * @returns {Promise<AnalysisResult>} Enhanced analysis results with model strategy
     *
     * @example Domain Analysis with Optimal Strategy
     * ```typescript
     * const result = await service.analyze({
     *   task: 'domain-analysis',
     *   context: { domains: domainData, dependencies: dependencyGraph },
     *   taskContext: {
     *     type: 'planning',
     *     complexity: 'high',
     *     domain: 'architecture',
     *     requiresReasoning: true
     *   },
     *   requiresFileOperations: true,
     *   trackModelStrategy: true
     * });
     * // This will use Opus for complex architectural planning
     * ```
     *
     * @example TypeScript Error Analysis
     * ```typescript
     * const result = await service.analyze({
     *   task: 'typescript-error-analysis',
     *   context: { files: ['src/neural/gnn'], errors: compilationErrors },
     *   taskContext: {
     *     type: 'analysis',
     *     complexity: 'medium',
     *     domain: 'development',
     *     requiresReasoning: false
     *   },
     *   requiresFileOperations: true
     * });
     * // This will use Sonnet for efficient analysis
     * ```
     */
    analyze(request: AnalysisRequest): Promise<AnalysisResult>;
    /**
     * Enhanced method to determine optimal model based on task context.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {ModelConfig} Model configuration with rationale
     */
    private determineOptimalModel;
    /**
     * Infers task context from analysis request for optimal model selection.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {TaskContext} Inferred task context
     */
    private inferTaskContext;
    /**
     * Enhanced Claude Code SDK integration with optimal model selection.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @param {ModelConfig | null} modelStrategy - Model selection strategy
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     */
    private analyzeWithClaudeCodeSDK;
    /**
     * Analyzes using Claude Code CLI with proper permissions and model selection.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @param {string} model - Model to use (opus or sonnet)
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     */
    private analyzeWithClaudeCode;
    /**
     * Analyzes using GitHub Models via direct Azure AI inference API (PRIMARY METHOD).
     *
     * This is the primary method for GitHub Models access, using the reliable Azure AI
     * inference REST API instead of CLI tools. Provides consistent JSON responses,
     * better error handling, and proper rate limit detection.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     */
    private analyzeWithGitHubModelsAPI;
    /**
     * Analyzes using GitHub Copilot API directly.
     *
     * Copilot has enterprise-level rate limits and uses GPT-4+ models.
     * Best for larger contexts and complex analysis tasks.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     * @throws {Error} If Copilot authentication or API call fails
     */
    private analyzeWithCopilot;
    /**
     * Analyzes using Gemini CLI with YOLO mode and intelligent rate limit handling.
     *
     * Implements smart cooldown periods to avoid hitting rate limits repeatedly.
     * If Gemini returns a rate limit error, we store the timestamp and avoid
     * retrying for the configured cooldown period (default: 1 hour).
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     * @throws {Error} If still in cooldown period after rate limit
     */
    private analyzeWithGemini;
    /**
     * Analyzes using Gemini Direct API with streaming support.
     *
     * Uses the GeminiHandler with OAuth authentication and real-time streaming.
     * Best for small/fast calls with 2.5 Flash or heavy lifting with 2.5 Pro.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     * @throws {Error} If Gemini Direct API fails or rate limits hit
     */
    private analyzeWithGeminiDirect;
    /**
     * Analyzes using Gemini 2.5 Pro for complex reasoning tasks.
     *
     * Same as GeminiDirect but uses Pro model specifically for high complexity.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<Partial<AnalysisResult>>} Analysis results
     * @throws {Error} If Gemini Pro API fails
     */
    private analyzeWithGeminiPro;
    /**
     * Builds system prompts for providers that support them (like GitHub Models).
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {string} System prompt
     */
    private buildSystemPrompt;
    /**
     * Builds appropriate prompts based on analysis task type.
     *
     * @private
     * @param {AnalysisRequest} request - Analysis request
     * @returns {string} Constructed prompt
     */
    private buildPrompt;
    /**
     * Executes a command with proper error handling.
     *
     * @private
     * @param {string} command - Command to execute
     * @param {string[]} args - Command arguments
     * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>} Command result
     */
    private executeCommand;
    /**
     * Creates a new session for conversation continuity.
     *
     * @method createSession
     * @returns {string} New session ID
     */
    createSession(): string;
    /**
     * Gets current session ID.
     *
     * @method getSessionId
     * @returns {string} Current session ID
     */
    getSessionId(): string;
    /**
     * Updates service configuration.
     *
     * @method updateConfig
     * @param {Partial<LLMIntegrationConfig>} updates - Configuration updates
     */
    updateConfig(updates: Partial<LLMIntegrationConfig>): void;
    /**
     * Checks if a provider is currently in rate limit cooldown.
     *
     * @method isInCooldown
     * @param {string} provider - Provider name ('gemini', etc.)
     * @returns {boolean} True if provider is in cooldown
     */
    isInCooldown(provider: string): boolean;
    /**
     * Gets remaining cooldown time for a provider in minutes.
     *
     * @method getCooldownRemaining
     * @param {string} provider - Provider name ('gemini', etc.)
     * @returns {number} Remaining cooldown time in minutes, or 0 if not in cooldown
     */
    getCooldownRemaining(provider: string): number;
    /**
     * Manually clears cooldown for a provider (use with caution).
     *
     * @method clearCooldown
     * @param {string} provider - Provider name ('gemini', etc.)
     */
    clearCooldown(provider: string): void;
    /**
     * Intelligently selects the best LLM provider based on task requirements and rate limits.
     *
     * **Strategy (Optimized for Rate Limits & Performance):**
     * - **GitHub Models API (GPT-5)**: Primary choice - Azure AI inference, fully free, reliable JSON responses
     * - **Claude Code**: File operations, codebase-aware tasks, complex editing
     * - **Gemini**: Fallback option with intelligent 1-hour cooldown management
     * - **Auto-fallback**: If Gemini hits rate limits, automatically uses GPT-5 API
     * - **o1/DeepSeek/Grok**: Avoided due to severe rate limits
     *
     * @method analyzeSmart
     * @param {AnalysisRequest} request - Analysis request
     * @returns {Promise<AnalysisResult>} Analysis results with optimal provider
     *
     * @example Smart Analysis Selection
     * ```typescript
     * // This will use GPT-5 for general analysis
     * const domainAnalysis = await service.analyzeSmart({
     *   task: 'domain-analysis',
     *   context: { domains, dependencies },
     *   requiresFileOperations: false  // No file ops = GPT-5
     * });
     *
     * // This will use Claude Code for file editing task
     * const codeFixing = await service.analyzeSmart({
     *   task: 'typescript-error-analysis',
     *   context: { files, errors },
     *   requiresFileOperations: true   // File ops = Claude Code
     * });
     * ```
     */
    analyzeSmart(request: AnalysisRequest): Promise<AnalysisResult>;
    /**
     * Optional A/B testing method - use sparingly due to rate limits.
     *
     * Since GPT-5 is fully free and performs excellently, A/B testing should only
     * be used in rare cases where you need to compare different approaches.
     * All other models have rate limits, so this method should be avoided in
     * production workflows.
     *
     * **Recommendation**: Use `analyzeSmart()` instead, which uses GPT-5 for analysis.
     *
     * @async
     * @method analyzeArchitectureAB
     * @param {AnalysisRequest} request - Architecture analysis request
     * @returns {Promise<{gpt5: AnalysisResult, comparison: AnalysisResult, recommendation: string}>} A/B test results
     *
     * @deprecated Use analyzeSmart() instead - GPT-5 is fully free and excellent for all tasks
     */
    analyzeArchitectureAB(request: AnalysisRequest): Promise<{
        gpt5: AnalysisResult;
        comparison: AnalysisResult;
        recommendation: string;
    }>;
    /**
     * Enhanced method to get current configuration with model strategy details.
     *
     * @method getEnhancedConfig
     * @returns {object} Enhanced configuration details
     */
    getEnhancedConfig(): {
        provider: "claude-code" | undefined;
        model: string | undefined;
        useOptimalModel: boolean | undefined;
        enhancedLogging: boolean | undefined;
        componentName: string | undefined;
        sessionId: string;
        statsEnabled: boolean;
        rateLimitCooldowns: {
            [k: string]: number;
        };
        supportedFeatures: {
            claudeCodeSDK: boolean;
            optimalModelSelection: boolean | undefined;
            enhancedLogging: boolean | undefined;
            statisticsTracking: boolean;
            opusModel: boolean;
            sonnetModel: boolean;
            componentBasedSelection: boolean;
            taskContextInference: boolean;
        };
    };
    /**
     * Enhanced method to get comprehensive service status.
     *
     * @method getServiceStatus
     * @returns {object} Service health and status information
     */
    getServiceStatus(): {
        status: string;
        version: string;
        migration: string;
        providers: {
            claudeCode: {
                available: boolean;
                models: string[];
                optimalSelection: boolean | undefined;
            };
            githubModels: {
                available: boolean;
                inCooldown: boolean;
                cooldownRemaining: number;
            };
            gemini: {
                available: boolean;
                inCooldown: boolean;
                cooldownRemaining: number;
            };
            copilot: {
                available: boolean;
                inCooldown: boolean;
            };
        };
        features: {
            enhancedLogging: boolean | undefined;
            statisticsTracking: boolean;
            modelStrategyTracking: boolean | undefined;
            abTesting: boolean;
            smartAnalysis: boolean;
        };
        performance: {
            totalCalls: string;
            systemHealth: string;
        };
    };
}
//# sourceMappingURL=llm-integration.service.d.ts.map