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

// Azure imports removed as they're not needed for this implementation
// import { AzureKeyCredential } from '@azure/core-auth';
// import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { getLogger } from '../../config/logging-config';
import { LLM_PROVIDER_CONFIG } from '../../config/llm-providers.config';
import { v4 as uuidv4 } from 'uuid';
// Legacy providers removed - using Claude Code SDK only
// Enhanced Claude Code SDK integration
import {
  selectOptimalModel,
  getComponentModel,
  getModelConfig,
  type TaskContext,
  type ModelType,
  type ModelConfig,
  Models,
} from '../../intelligence/model-strategy/optimal-model-selector';
import LLMStatsService from '../../intelligence/adaptive-learning/llm-stats-service';

const execAsync = promisify(spawn);

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
  // Enhanced with Claude Code SDK options
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
  task:
    | 'domain-analysis'
    | 'typescript-error-analysis'
    | 'code-review'
    | 'custom';
  /** Analysis context data */
  context: {
    files?: string[];
    errors?: unknown[];
    domains?: unknown[];
    dependencies?: unknown;
    customData?: unknown;
    // Enhanced context for swarm operations
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
  // Enhanced with model strategy options
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
  provider:
    | 'claude-code'
    | 'gemini'
    | 'gemini-direct'
    | 'gemini-pro'
    | 'github-models'
    | 'copilot';
  /** Execution time in milliseconds */
  executionTime: number;
  /** Any error that occurred */
  error?: string;
  /** Output file path if file was written */
  outputFile?: string;
  // Enhanced with model strategy tracking
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

/**
 * LLM Integration Service providing unified access to Claude Code, Gemini CLI, and GitHub Models.
 *
 * This service abstracts away the differences between multiple LLM providers,
 * providing a consistent interface for AI-powered analysis tasks. It automatically
 * handles fallback between providers and manages the necessary permissions for
 * file operations.
 *
 * **Available Providers:**
 * - **Claude Code SDK**: Only provider - comprehensive codebase-aware tasks with optimal model strategy
 *
 * **Security Note**: This service uses permission bypass flags which should only
 * be used in controlled environments. Always review generated files before use.
 *
 * @class LLMIntegrationService
 */
// Safe logger that won't break execution if undefined
let logger;
try {
  logger = getLogger('coordination-services-llm-integration-service');
} catch (e) {
  // Fallback logger to prevent execution failures
  logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.debug('[DEBUG]', ...args),
  };
}

export class LLMIntegrationService {
  private config: LLMIntegrationConfig;
  private sessionId: string;
  private rateLimitTracker: Map<string, number> = new Map(); // Track rate limit timestamps
  // Legacy providers removed - Claude Code SDK only
  // Enhanced with Claude Code SDK integration
  private statsService: LLMStatsService | null = null;
  private enhancedLogger: unknown;

  // Predefined JSON schemas for structured output
  private static readonly JSON_SCHEMAS = {
    'domain-analysis': {
      name: 'Domain_Analysis_Schema',
      description: 'Analyzes software domain relationships and cohesion scores',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          domainAnalysis: {
            type: 'object',
            properties: {
              enhancedRelationships: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    strength: { type: 'number', minimum: 0, maximum: 1 },
                    type: { type: 'string' },
                    reasoning: { type: 'string' },
                  },
                  required: ['from', 'to', 'strength', 'type', 'reasoning'],
                },
              },
              cohesionScores: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    domain: { type: 'string' },
                    score: { type: 'number', minimum: 0, maximum: 1 },
                    factors: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['domain', 'score', 'factors'],
                },
              },
              crossDomainInsights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    insight: { type: 'string' },
                    impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                    recommendation: { type: 'string' },
                  },
                  required: ['insight', 'impact', 'recommendation'],
                },
              },
            },
            required: [
              'enhancedRelationships',
              'cohesionScores',
              'crossDomainInsights',
            ],
          },
          architectureRecommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                recommendation: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
              },
              required: ['area', 'recommendation', 'priority'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['domainAnalysis', 'architectureRecommendations', 'summary'],
      },
    },
    'typescript-error-analysis': {
      name: 'TypeScript_Error_Analysis_Schema',
      description:
        'Analyzes and provides fixes for TypeScript compilation errors',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          errorAnalysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                error: { type: 'string' },
                rootCause: { type: 'string' },
                severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                fix: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    code: { type: 'string' },
                    imports: { type: 'array', items: { type: 'string' } },
                    explanation: { type: 'string' },
                  },
                  required: ['description', 'code', 'explanation'],
                },
              },
              required: ['file', 'error', 'rootCause', 'severity', 'fix'],
            },
          },
          preventionStrategies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                strategy: { type: 'string' },
                implementation: { type: 'string' },
                benefit: { type: 'string' },
              },
              required: ['strategy', 'implementation', 'benefit'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['errorAnalysis', 'preventionStrategies', 'summary'],
      },
    },
  };

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
  constructor(config: LLMIntegrationConfig) {
    const defaultProvider = config.preferredProvider || 'claude-code'; // Claude Code SDK as primary
    this.config = {
      preferredProvider: defaultProvider,
      debug: false,
      model: this.getDefaultModel(defaultProvider),
      temperature: 0.1,
      maxTokens: defaultProvider === 'github-models' ? 128000 : 200000,
      rateLimitCooldown: 60 * 60 * 1000,
      githubToken: process.env.GITHUB_TOKEN,
      // Enhanced defaults for Claude Code SDK
      useOptimalModel: true,
      enhancedLogging: false,
      ...config,
    };
    this.sessionId = config.sessionId || uuidv4();

    // Initialize enhanced logging if enabled
    if (this.config.enhancedLogging) {
      this.enhancedLogger = {
        ...logger,
        modelStrategy: (strategy: unknown) => {
          logger.info(`Model Strategy: ${JSON.stringify(strategy, null, 2)}`);
        },
        performance: (metrics: unknown) => {
          logger.info(
            `Performance Metrics: ${JSON.stringify(metrics, null, 2)}`
          );
        },
      };
    } else {
      this.enhancedLogger = logger;
    }

    // Initialize statistics service if provided
    if (config.statsService) {
      this.statsService = config.statsService;
    } else if (this.config.enhancedLogging) {
      this.statsService = new LLMStatsService();
      this.enhancedLogger.info(
        'LLM Statistics Service initialized for enhanced logging'
      );
    }

    // Legacy Copilot provider removed - Claude Code SDK only

    // Legacy Gemini handler removed - Claude Code SDK only

    if (this.config.enhancedLogging) {
      this.enhancedLogger.info(
        '🚀 LLM Integration Service initialized with Claude Code SDK integration'
      );
      this.enhancedLogger.info(
        `Configuration: ${JSON.stringify(
          {
            provider: this.config.preferredProvider,
            useOptimalModel: this.config.useOptimalModel,
            componentName: this.config.componentName,
            enhancedLogging: this.config.enhancedLogging,
          },
          null,
          2
        )}`
      );
    }
  }

  /**
   * Gets the default model for each provider using centralized config and optimal strategy.
   *
   * @private
   * @param {string} provider - Provider name
   * @returns {string} Default model
   */
  private getDefaultModel(provider: string): string {
    const config = LLM_PROVIDER_CONFIG[provider];
    if (provider === 'claude-code' && this.config?.useOptimalModel) {
      // Use component-based selection if available, otherwise default to Sonnet
      return this.config?.componentName
        ? getComponentModel(this.config.componentName)
        : 'sonnet';
    }
    return config?.defaultModel || 'sonnet';
  }

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
  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date.now();
    let modelStrategy: any = null;
    let routingInfo = {
      originalPreference: this.config.preferredProvider || 'claude-code',
      fallbackCount: 0,
      routingReason: 'initial-attempt',
    };

    try {
      // Enhanced: Determine optimal model strategy
      if (
        this.config.useOptimalModel &&
        this.config.preferredProvider === 'claude-code'
      ) {
        modelStrategy = this.determineOptimalModel(request);

        if (this.config.enhancedLogging) {
          this.enhancedLogger.modelStrategy({
            request: {
              task: request.task,
              taskContext: request.taskContext,
              componentName: request.componentName,
              forceModel: request.forceModel,
            },
            strategy: modelStrategy,
            timestamp: new Date().toISOString(),
          });
        }
      }
      // Enhanced: Smart routing with model strategy consideration
      const contextLength = (request.prompt || this.buildPrompt(request))
        .length;
      const optimalProviders = getOptimalProvider({
        contentLength: contextLength,
        requiresFileOps: request.requiresFileOperations,
        requiresCodebaseAware:
          request.task === 'domain-analysis' || request.task === 'code-review',
        requiresStructuredOutput: true, // We always want structured output
        taskType: request.task === 'custom' ? 'custom' : 'analysis',
      });

      routingInfo.routingReason = `smart-routing-context-${contextLength}-chars`;

      if (this.config.debug || this.config.enhancedLogging) {
        this.enhancedLogger.info(`🧪 Enhanced Smart Routing Analysis:`);
        this.enhancedLogger.info(
          `  - Context size: ${contextLength} characters`
        );
        this.enhancedLogger.info(
          `  - Optimal providers: ${optimalProviders.join(' → ')}`
        );
        this.enhancedLogger.info(
          `  - Preferred provider: ${this.config.preferredProvider}`
        );
        if (modelStrategy) {
          this.enhancedLogger.info(
            `  - Selected model: ${modelStrategy.selectedModel} (${modelStrategy.rationale})`
          );
        }
      }

      // FORCE only Claude Code for swarm operations - no fallbacks!

      const providersToTry =
        this.config.preferredProvider === 'claude-code' &&
        request.context?.swarmContext
          ? ['claude-code'] // ONLY Claude Code for swarms
          : this.config.preferredProvider &&
              optimalProviders.includes(this.config.preferredProvider)
            ? [
                this.config.preferredProvider,
                ...optimalProviders.filter(
                  (p) => p !== this.config.preferredProvider
                ),
              ]
            : optimalProviders;

      // Try each provider in optimal order
      for (const provider of providersToTry) {
        try {
          let result;

          switch (provider) {
            case 'claude-code':
              result = await this.analyzeWithClaudeCodeSDK(
                request,
                modelStrategy
              );
              break;
            case 'github-models':
              if (this.isInCooldown('github-models')) {
                continue; // Skip if in cooldown
              }
              result = await this.analyzeWithGitHubModelsAPI(request);
              break;
            case 'copilot':
              if (this.copilotProvider) {
                result = await this.analyzeWithCopilot(request);
              } else {
                continue; // Skip if not available
              }
              break;
            case 'gemini-direct':
              if (this.geminiHandler && !this.isInCooldown('gemini-direct')) {
                result = await this.analyzeWithGeminiDirect(request);
              } else {
                continue; // Skip if not available or in cooldown
              }
              break;
            case 'gemini-pro':
              if (this.geminiHandler && !this.isInCooldown('gemini-direct')) {
                // Use Pro model for complex reasoning tasks
                result = await this.analyzeWithGeminiPro(request);
              } else {
                continue; // Skip if not available or in cooldown
              }
              break;
            case 'gemini':
              result = await this.analyzeWithGemini(request);
              break;
            default:
              continue;
          }

          const enhancedResult = {
            ...result,
            provider: provider as any,
            executionTime: Date.now() - startTime,
            modelStrategy: modelStrategy
              ? {
                  selectedModel: modelStrategy.selectedModel,
                  rationale: modelStrategy.rationale,
                  wasOptimal: true,
                  taskContext: request.taskContext,
                }
              : undefined,
            metadata: {
              ...result.metadata,
              fallbackUsed: routingInfo.fallbackCount > 0,
              fallbackReason:
                routingInfo.fallbackCount > 0
                  ? routingInfo.routingReason
                  : undefined,
              attemptedProviders: [provider],
              finalModel: modelStrategy?.selectedModel || this.config.model,
              performance: {
                latency: Date.now() - startTime,
                throughput: contextLength / (Date.now() - startTime),
                reliability: result.success ? 1.0 : 0.0,
              },
            },
          };

          // Enhanced: Record call statistics if enabled
          if (this.statsService) {
            this.statsService.recordCall(
              {
                task: request.task,
                prompt: request.prompt,
                requiresFileOperations: request.requiresFileOperations,
                contextFiles: request.context.files,
                taskContext: request.taskContext,
                componentName: request.componentName,
              } as any,
              enhancedResult as any,
              routingInfo,
              {
                requestType: 'analyze',
                tokenUsage: enhancedResult.tokenUsage,
                sessionId: this.sessionId,
              }
            );
          }

          if (this.config.enhancedLogging) {
            this.enhancedLogger.performance({
              provider: provider,
              executionTime: enhancedResult.executionTime,
              success: enhancedResult.success,
              modelStrategy: enhancedResult.modelStrategy,
              contextLength,
              timestamp: new Date().toISOString(),
            });
          }

          return enhancedResult;
        } catch (error) {
          routingInfo.fallbackCount++;
          routingInfo.routingReason = `${provider}-failed: ${error.message}`;

          if (this.config.debug || this.config.enhancedLogging) {
            this.enhancedLogger.warn(
              `⚠️ ${provider} failed, trying next provider:`,
              error.message
            );
          }

          // Record failed attempt if stats service is available
          if (this.statsService) {
            this.statsService.recordCall(
              {
                task: request.task,
                prompt: request.prompt,
                requiresFileOperations: request.requiresFileOperations,
              } as any,
              {
                success: false,
                provider: provider as any,
                executionTime: Date.now() - startTime,
                error: error.message,
              } as any,
              routingInfo
            );
          }

          // Continue to next provider
        }
      }

      // Fallback to legacy provider selection if smart routing fails
      if (this.config.debug) {
        console.log(
          '🔄 Smart routing exhausted, falling back to legacy selection'
        );
      }

      // Legacy fallback logic
      if (this.config.preferredProvider === 'claude-code') {
        try {
          const result = await this.analyzeWithClaudeCode(request);
          return {
            ...result,
            provider: 'claude-code',
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          if (this.config.debug) {
            console.log(
              'Claude Code unavailable, falling back to Gemini:',
              error
            );
          }
          // Fall through to Gemini
        }
      }

      // Try GitHub Models API as primary option (with rate limit check)
      if (this.config.preferredProvider === 'github-models') {
        if (!this.isInCooldown('github-models')) {
          try {
            const result = await this.analyzeWithGitHubModelsAPI(request);
            return {
              ...result,
              provider: 'github-models',
              executionTime: Date.now() - startTime,
            };
          } catch (error) {
            if (this.config.debug) {
              console.log(
                'GitHub Models API unavailable, falling back to next provider:',
                error
              );
            }
            // Fall through to next provider
          }
        } else if (this.config.debug) {
          console.log(
            `GitHub Models API in cooldown for ${this.getCooldownRemaining('github-models')} minutes`
          );
        }
      }

      // Try GitHub Copilot API if preferred and available (legacy fallback)
      if (this.config.preferredProvider === 'copilot' && this.copilotProvider) {
        try {
          const result = await this.analyzeWithCopilot(request);
          return {
            ...result,
            provider: 'copilot',
            executionTime: Date.now() - startTime,
          };
        } catch (error) {
          if (this.config.debug) {
            console.log(
              'GitHub Copilot API unavailable, falling back to Gemini:',
              error
            );
          }
          // Fall through to Gemini
        }
      }

      // Try Gemini as final fallback (with cooldown awareness)
      try {
        const result = await this.analyzeWithGemini(request);
        return {
          ...result,
          provider: 'gemini',
          executionTime: Date.now() - startTime,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // If Gemini is in cooldown, try alternative providers as fallback
        if (errorMessage.includes('cooldown')) {
          if (this.config.debug) {
            console.log('Gemini in cooldown, trying fallback providers');
          }

          // Try Copilot first if available
          if (this.copilotProvider) {
            try {
              if (this.config.debug) {
                console.log('Trying GitHub Copilot as fallback');
              }
              const result = await this.analyzeWithCopilot(request);
              return {
                ...result,
                provider: 'copilot',
                executionTime: Date.now() - startTime,
              };
            } catch (copilotError) {
              if (this.config.debug) {
                console.log(
                  'Copilot fallback failed, trying GPT-5:',
                  copilotError
                );
              }
            }
          }

          // Finally try GitHub Models GPT-5
          if (this.isInCooldown('github-models')) {
            throw new Error(
              `All providers in cooldown. Gemini: ${this.getCooldownRemaining('gemini')}min, GitHub Models: ${this.getCooldownRemaining('github-models')}min`
            );
          }
          try {
            // Use GPT-5 as ultimate fallback (fully free, no rate limits)
            const originalProvider = this.config.preferredProvider;
            const originalModel = this.config.model;

            this.config.preferredProvider = 'github-models';
            this.config.model = 'openai/gpt-5';

            const result = await this.analyzeWithGitHubModelsAPI(request);

            // Restore config
            this.config.preferredProvider = originalProvider;
            this.config.model = originalModel;

            return {
              ...result,
              provider: 'github-models',
              executionTime: Date.now() - startTime,
            };
          } catch (gpt5Error) {
            // If even GPT-5 fails, we're out of options
            throw new Error(
              `All providers failed. Gemini: ${errorMessage}, GPT-5: ${gpt5Error}`
            );
          }
        }

        // Re-throw non-cooldown errors
        throw error;
      }
    } catch (error) {
      const errorResult = {
        success: false,
        data: null,
        provider: this.config.preferredProvider || 'claude-code',
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        modelStrategy: modelStrategy
          ? {
              selectedModel: modelStrategy.selectedModel,
              rationale: modelStrategy.rationale,
              wasOptimal: false,
              taskContext: request.taskContext,
              fallbackInfo: {
                originalModel: modelStrategy.selectedModel,
                fallbackModel: 'sonnet' as ModelType,
                reason: 'error-in-execution',
              },
            }
          : undefined,
        metadata: {
          fallbackUsed: routingInfo.fallbackCount > 0,
          fallbackReason: routingInfo.routingReason,
          attemptedProviders: [],
          finalModel: undefined,
        },
      } as AnalysisResult;

      if (this.config.enhancedLogging) {
        this.enhancedLogger.error('Analysis failed with error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelStrategy,
          routingInfo,
          timestamp: new Date().toISOString(),
        });
      }

      return errorResult;
    }
  }

  /**
   * Enhanced method to determine optimal model based on task context.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {ModelConfig} Model configuration with rationale
   */
  private determineOptimalModel(request: AnalysisRequest): ModelConfig {
    // If model is forced, use that
    if (request.forceModel) {
      return {
        primary: request.forceModel,
        fallback: 'sonnet',
        rationale: `Forced model selection: ${request.forceModel}`,
      };
    }

    // If component name is provided, use component-based selection
    if (request.componentName) {
      const componentModel = getComponentModel(request.componentName);
      return {
        primary: componentModel,
        fallback: 'sonnet',
        rationale: `Component-based selection for ${request.componentName}: ${componentModel}`,
      };
    }

    // If task context is provided, use optimal selection
    if (request.taskContext) {
      return getModelConfig(request.taskContext);
    }

    // Create task context from request task type
    const inferredContext: TaskContext = this.inferTaskContext(request);
    return getModelConfig(inferredContext);
  }

  /**
   * Infers task context from analysis request for optimal model selection.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {TaskContext} Inferred task context
   */
  private inferTaskContext(request: AnalysisRequest): TaskContext {
    switch (request.task) {
      case 'domain-analysis':
        return {
          type: 'planning',
          complexity: 'high',
          domain: 'architecture',
          requiresReasoning: true,
        };

      case 'code-review':
        return {
          type: 'analysis',
          complexity: 'medium',
          domain: 'development',
          requiresReasoning: true,
        };

      case 'typescript-error-analysis':
        return {
          type: 'analysis',
          complexity: 'medium',
          domain: 'development',
          requiresReasoning: false,
        };

      default:
        return {
          type: 'processing',
          complexity: 'low',
          domain: 'operations',
          requiresReasoning: false,
        };
    }
  }

  /**
   * Enhanced Claude Code SDK integration with optimal model selection.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @param {ModelConfig | null} modelStrategy - Model selection strategy
   * @returns {Promise<Partial<AnalysisResult>>} Analysis results
   */
  private async analyzeWithClaudeCodeSDK(
    request: AnalysisRequest,
    modelStrategy: ModelConfig | null = null
  ): Promise<Partial<AnalysisResult>> {
    const selectedModel =
      modelStrategy?.primary || this.config.model || 'sonnet';

    if (this.config.enhancedLogging) {
      this.enhancedLogger.info(
        `🚀 Using Claude Code SDK with ${selectedModel} model`
      );
      this.enhancedLogger.info(
        `Rationale: ${modelStrategy?.rationale || 'Default selection'}`
      );
    }

    return this.analyzeWithClaudeCode(request, selectedModel);
  }

  /**
   * Analyzes using Claude Code CLI with proper permissions and model selection.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @param {string} model - Model to use (opus or sonnet)
   * @returns {Promise<Partial<AnalysisResult>>} Analysis results
   */
  private async analyzeWithClaudeCode(
    request: AnalysisRequest,
    model: string = 'sonnet'
  ): Promise<Partial<AnalysisResult>> {
    const prompt = `${this.buildPrompt(request)}

MPORTANT: Respond with valid JSON format only. Do not include markdown code blocks or explanations outside the JSON.`;

    const args = [
      '--print', // Print response and exit (non-interactive)
      '--output-format',
      'json', // JSON output format (works with --print)
      '--model',
      model, // Enhanced: Use provided model (opus/sonnet)
      '--add-dir',
      this.config.projectPath, // Project access
      '--session-id',
      this.sessionId, // Session continuity
    ];

    // Add dangerous permissions for file operations
    if (request.requiresFileOperations) {
      args.push('--dangerously-skip-permissions');
    }

    // Add debug mode if enabled
    if (this.config.debug || this.config.enhancedLogging) {
      args.push('--debug');
    }

    // Enhanced logging for Claude Code execution
    if (this.config.enhancedLogging) {
      this.enhancedLogger.info(
        `Executing Claude Code with args: ${args.join(' ')}`
      );
    }

    // Add the prompt as the final argument
    args.push(prompt);

    const result = await this.executeCommand('claude', args);

    if (this.config.enhancedLogging) {
      this.enhancedLogger.info(`Claude Code execution completed:`);
      this.enhancedLogger.info(`  - Exit code: ${result.exitCode}`);
      this.enhancedLogger.info(
        `  - Stdout length: ${result.stdout.length} characters`
      );
      this.enhancedLogger.info(
        `  - Stderr length: ${result.stderr.length} characters`
      );
    }

    let parsedData;
    try {
      parsedData = JSON.parse(result.stdout);

      if (this.config.enhancedLogging) {
        this.enhancedLogger.info(
          `Successfully parsed JSON response from Claude Code`
        );
      }
    } catch (jsonError) {
      // Try to extract JSON from markdown code blocks or mixed content
      const jsonMatch =
        result.stdout.match(/```json\n([\s\S]*?)\n```/) ||
        result.stdout.match(/```\n([\s\S]*?)\n```/) ||
        result.stdout.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

          if (this.config.enhancedLogging) {
            this.enhancedLogger.info(
              `Successfully extracted JSON from markdown code block`
            );
          }
        } catch {
          if (this.config.debug || this.config.enhancedLogging) {
            this.enhancedLogger.warn(
              'Claude Code returned non-JSON response, falling back to text'
            );
          }
          parsedData = {
            rawResponse: result.stdout,
            note: 'Response was not in requested JSON format',
          };
        }
      } else {
        if (this.config.enhancedLogging) {
          this.enhancedLogger.warn(
            'No JSON found in Claude Code response, using raw text'
          );
        }

        parsedData = {
          rawResponse: result.stdout,
          note: 'Response was not in requested JSON format',
        };
      }
    }

    const analysisResult = {
      success: result.exitCode === 0,
      data: parsedData,
      outputFile: request.outputPath,
    };

    if (this.config.enhancedLogging) {
      this.enhancedLogger.info(
        `Claude Code analysis ${analysisResult.success ? 'completed successfully' : 'failed'}`
      );
      if (!analysisResult.success) {
        this.enhancedLogger.error(`Error details: ${result.stderr}`);
      }
    }

    return analysisResult;
  }

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
  private async analyzeWithGitHubModelsAPI(
    request: AnalysisRequest
  ): Promise<Partial<AnalysisResult>> {
    if (!this.config.githubToken) {
      throw new Error(
        'GitHub token required for GitHub Models API access. Set GITHUB_TOKEN environment variable.'
      );
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildPrompt(request);
    const model = this.config.model || 'openai/gpt-5';

    // GitHub Models API disabled - Azure dependencies removed
    throw new Error('GitHub Models API not available - Azure dependencies removed');

    /* 
    const client = ModelClient(
      'https://models.github.ai/inference',
      new AzureKeyCredential(this.config.githubToken)
    );

    try {
      // Build request body with optional structured output
      const requestBody: unknown = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: model,
        // Note: GPT-5 only supports default temperature (1) and has 4K input limit
        // temperature: this.config.temperature || 0.1,
        max_completion_tokens: this.config.maxTokens || 128000, // 128K output tokens, 4K input limit
      };

      // Add structured output - use provided schema or default for task type
      // Note: JSON schema structured output requires API version 2024-08-01-preview or later
      // Currently falls back to prompt-based JSON requests
      const jsonSchema =
        request.jsonSchema || LLMIntegrationService.JSON_SCHEMAS[request.task];
      if (jsonSchema && this.config.debug) {
        console.log(
          'JSON schema available for task:',
          jsonSchema.name,
          '- using prompt-based JSON instead'
        );
      }

      // TODO: Enable when GitHub Models supports 2024-08-01-preview API version
      // if (jsonSchema) {
      //   requestBody.response_format = {
      //     type: "json_schema",
      //     json_schema: {
      //       name: jsonSchema.name,
      //       schema: jsonSchema.schema,
      //       description: jsonSchema.description,
      //       strict: jsonSchema.strict !== false
      //     }
      //   };
      // }

      const response = await client.path('/chat/completions').post({
        body: requestBody,
      });

      // if (isUnexpected(response)) {
        throw new Error(
          `GitHub Models API error: ${JSON.stringify(response.body.error)}`
        );
      }

      const content = response.body.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from GitHub Models API');
      }

      // Parse JSON response with fallback handling
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (jsonError) {
        // Try to extract JSON from markdown code blocks or mixed content
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) ||
          content.match(/```\n([\s\S]*?)\n```/) ||
          content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            if (this.config.debug) {
              console.warn(
                'GitHub Models returned non-JSON response despite request'
              );
            }
            parsedData = {
              rawResponse: content,
              note: 'Response was not in requested JSON format',
            };
          }
        } else {
          parsedData = {
            rawResponse: content,
            note: 'Response was not in requested JSON format',
          };
        }
      }

      return {
        success: true,
        data: parsedData,
        outputFile: request.outputPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check for rate limit errors
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('too many requests')
      ) {
        // Set rate limit tracking for GitHub Models
        this.rateLimitTracker.set('github-models', Date.now());

        if (this.config.debug) {
          console.log('GitHub Models rate limit detected');
        }

        throw new Error('GitHub Models quota exceeded. Try again later.');
      }

      throw error;
    }
    */
  }

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
  private async analyzeWithCopilot(
    request: AnalysisRequest
  ): Promise<Partial<AnalysisResult>> {
    if (!this.copilotProvider) {
      throw new Error(
        'Copilot provider not initialized. Requires GitHub token.'
      );
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = request.prompt || this.buildPrompt(request);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    if (this.config.debug) {
      console.log('🤖 Using GitHub Copilot API (Enterprise)...');
      console.log('  - Model:', this.config.model || 'gpt-4.1');
      console.log('  - Account Type: Enterprise');
      console.log('  - Context size:', userPrompt.length, 'characters');
    }

    try {
      const response = await this.copilotProvider.createChatCompletion({
        messages,
        model: this.config.model || 'gpt-4.1',
        max_tokens: this.config.maxTokens || 16000, // Updated for 200K context enterprise limits
        temperature: this.config.temperature || 0.1,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Copilot API');
      }

      // Parse JSON response if expected
      let parsedData: unknown = content;
      try {
        // Try to extract JSON if it's in a code block or mixed content
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
          content.match(/\{[\s\S]*\}/) || [null, content];

        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1].trim());
        } else if (
          content.trim().startsWith('{') &&
          content.trim().endsWith('}')
        ) {
          parsedData = JSON.parse(content.trim());
        }
      } catch (parseError) {
        if (this.config.debug) {
          console.log('⚠️ Copilot response not valid JSON, using raw content');
        }
        parsedData = { analysis: content };
      }

      if (this.config.debug) {
        console.log('✅ Copilot analysis complete!');
        console.log('  - Response length:', content.length, 'characters');
        console.log('  - Parsed as JSON:', typeof parsedData === 'object');
      }

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (this.config.debug) {
        console.error('❌ Copilot API error:', errorMessage);
      }

      // Check for authentication or quota errors
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new Error(
          'Copilot authentication failed. Check GitHub token permissions.'
        );
      }

      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        throw new Error(
          'Copilot rate limit exceeded. Enterprise account should have high limits.'
        );
      }

      throw error;
    }
  }

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
  private async analyzeWithGemini(
    request: AnalysisRequest
  ): Promise<Partial<AnalysisResult>> {
    // Check if we're in cooldown period
    const rateLimitKey = 'gemini';
    const lastRateLimit = this.rateLimitTracker.get(rateLimitKey);
    const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000; // 1 hour default

    if (lastRateLimit && Date.now() - lastRateLimit < cooldownPeriod) {
      const remainingTime = Math.ceil(
        (cooldownPeriod - (Date.now() - lastRateLimit)) / (60 * 1000)
      );
      throw new Error(
        `Gemini in rate limit cooldown. Try again in ${remainingTime} minutes.`
      );
    }

    const prompt = `${this.buildPrompt(request)}

CRITICAL: Respond ONLY in valid JSON format. Do not use markdown, code blocks, or any text outside the JSON structure.`;

    const args = [
      '-p',
      prompt, // Prompt text
      '-m',
      this.config.model || 'gemini-pro', // Model selection
      '--all-files', // Include all files in context
      '--include-directories',
      this.config.projectPath, // Project access
    ];

    // Add YOLO mode for file operations
    if (request.requiresFileOperations) {
      args.push('-y', '--yolo');
    }

    // Add debug mode if enabled
    if (this.config.debug) {
      args.push('-d', '--debug');
    }

    try {
      const result = await this.executeCommand('gemini', args);

      // Clear rate limit tracker on successful request
      if (result.exitCode === 0) {
        this.rateLimitTracker.delete(rateLimitKey);
      }

      // Parse JSON response from Gemini with fallback handling
      let parsedData;
      try {
        parsedData = JSON.parse(result.stdout);
      } catch (jsonError) {
        // Try to extract JSON from markdown code blocks or mixed content
        const jsonMatch =
          result.stdout.match(/```json\n([\s\S]*?)\n```/) ||
          result.stdout.match(/```\n([\s\S]*?)\n```/) ||
          result.stdout.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            if (this.config.debug) {
              console.warn('Gemini returned non-JSON response despite request');
            }
            parsedData = {
              rawResponse: result.stdout,
              note: 'Response was not in requested JSON format',
            };
          }
        } else {
          parsedData = {
            rawResponse: result.stdout,
            note: 'Response was not in requested JSON format',
          };
        }
      }

      return {
        success: result.exitCode === 0,
        data: parsedData,
        outputFile: request.outputPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Detect rate limit errors and set cooldown
      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('429') ||
        errorMessage.includes('too many requests')
      ) {
        this.rateLimitTracker.set(rateLimitKey, Date.now());

        if (this.config.debug) {
          console.log(
            `Gemini rate limit detected, setting ${cooldownPeriod / (60 * 1000)} minute cooldown`
          );
        }

        throw new Error(
          `Gemini quota exceeded. Cooldown active for ${cooldownPeriod / (60 * 1000)} minutes.`
        );
      }

      // Re-throw non-rate-limit errors
      throw error;
    }
  }

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
  private async analyzeWithGeminiDirect(
    request: AnalysisRequest
  ): Promise<Partial<AnalysisResult>> {
    if (!this.geminiHandler) {
      throw new Error('Gemini Direct handler not initialized');
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = request.prompt || this.buildPrompt(request);

    const messages = [{ role: 'user' as const, content: userPrompt }];

    if (this.config.debug) {
      console.log('🔮 Using Gemini Direct API...');
      console.log('  - Model:', this.geminiHandler.getModel().id);
      console.log('  - Using OAuth:', '~/.gemini/oauth_creds.json');
      console.log('  - Context size:', userPrompt.length, 'characters');
      console.log('  - Streaming:', true);
    }

    try {
      const stream = this.geminiHandler.createMessage(systemPrompt, messages);
      let fullResponse = '';
      let usage = { inputTokens: 0, outputTokens: 0 };

      // Collect streamed response
      for await (const chunk of stream) {
        if (chunk.type === 'text') {
          fullResponse += chunk.text;

          if (this.config.debug && chunk.text) {
            process.stdout.write(chunk.text); // Show real-time streaming
          }
        } else if (chunk.type === 'usage') {
          usage = {
            inputTokens: chunk.inputTokens,
            outputTokens: chunk.outputTokens,
          };
        }
      }

      if (this.config.debug) {
        console.log('\n✅ Gemini Direct streaming complete!');
        console.log(`  - Response length: ${fullResponse.length} characters`);
        console.log(
          `  - Token usage: ${usage.inputTokens} in, ${usage.outputTokens} out`
        );
      }

      // Parse JSON response with fallback handling
      let parsedData;
      try {
        parsedData = JSON.parse(fullResponse);
      } catch (jsonError) {
        // Try to extract JSON from markdown code blocks or mixed content
        const jsonMatch =
          fullResponse.match(/```json\n([\s\S]*?)\n```/) ||
          fullResponse.match(/```\n([\s\S]*?)\n```/) ||
          fullResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            if (this.config.debug) {
              console.warn(
                'Gemini Direct returned non-JSON response despite request'
              );
            }
            parsedData = {
              rawResponse: fullResponse,
              note: 'Response was not in requested JSON format',
            };
          }
        } else {
          parsedData = {
            rawResponse: fullResponse,
            note: 'Response was not in requested JSON format',
          };
        }
      }

      // Clear rate limit tracker on successful request
      this.rateLimitTracker.delete('gemini-direct');

      return {
        success: true,
        data: parsedData,
        outputFile: request.outputPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (this.config.debug) {
        console.error('❌ Gemini Direct API error:', errorMessage);
      }

      // Check for rate limit errors and set cooldown
      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('429') ||
        errorMessage.includes('too many requests')
      ) {
        this.rateLimitTracker.set('gemini-direct', Date.now());

        if (this.config.debug) {
          console.log(
            'Gemini Direct rate limit detected, setting 30 minute cooldown'
          );
        }

        throw new Error(
          'Gemini Direct quota exceeded. Cooldown active for 30 minutes.'
        );
      }

      // Handle authentication errors
      if (
        errorMessage.includes('authentication') ||
        errorMessage.includes('API_KEY_INVALID')
      ) {
        throw new Error(
          'Gemini Direct authentication failed. Check OAuth credentials or API key.'
        );
      }

      throw error;
    }
  }

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
  private async analyzeWithGeminiPro(
    request: AnalysisRequest
  ): Promise<Partial<AnalysisResult>> {
    if (!this.geminiHandler) {
      throw new Error('Gemini handler not initialized');
    }

    // Create Pro-specific handler for complex reasoning
    const proHandler = new GeminiHandler({
      modelId: 'gemini-2.5-pro', // Force Pro model
      temperature: this.config.temperature || 0.1,
      maxTokens: this.config.maxTokens,
      enableJson: false,
    });

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = request.prompt || this.buildPrompt(request);

    const messages = [{ role: 'user' as const, content: userPrompt }];

    if (this.config.debug) {
      console.log('🔮 Using Gemini 2.5 Pro (Complex Reasoning)...');
      console.log('  - Model: gemini-2.5-pro');
      console.log('  - Use case: High complexity tasks');
      console.log('  - Context size:', userPrompt.length, 'characters');
    }

    try {
      const stream = proHandler.createMessage(systemPrompt, messages);
      let fullResponse = '';
      let usage = { inputTokens: 0, outputTokens: 0 };

      // Collect streamed response
      for await (const chunk of stream) {
        if (chunk.type === 'text') {
          fullResponse += chunk.text;

          if (this.config.debug && chunk.text) {
            process.stdout.write(chunk.text);
          }
        } else if (chunk.type === 'usage') {
          usage = {
            inputTokens: chunk.inputTokens,
            outputTokens: chunk.outputTokens,
          };
        }
      }

      if (this.config.debug) {
        console.log('\n✅ Gemini Pro complex reasoning complete!');
        console.log(
          `  - Token usage: ${usage.inputTokens} in, ${usage.outputTokens} out`
        );
      }

      // Parse JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(fullResponse);
      } catch (jsonError) {
        const jsonMatch =
          fullResponse.match(/```json\n([\s\S]*?)\n```/) ||
          fullResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            parsedData = {
              rawResponse: fullResponse,
              note: 'Non-JSON response',
            };
          }
        } else {
          parsedData = { rawResponse: fullResponse, note: 'Non-JSON response' };
        }
      }

      return {
        success: true,
        data: parsedData,
        outputFile: request.outputPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (this.config.debug) {
        console.error('❌ Gemini Pro error:', errorMessage);
      }

      throw error;
    }
  }

  /**
   * Builds system prompts for providers that support them (like GitHub Models).
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {string} System prompt
   */
  private buildSystemPrompt(request: AnalysisRequest): string {
    return `You are an expert software architect and AI assistant specializing in:
- Graph Neural Networks (GNN) and machine learning systems
- TypeScript/JavaScript analysis and error fixing
- Domain-driven design and software architecture
- Code quality and performance optimization

Context: You're analyzing a GNN-Kuzu integration system that combines neural networks with graph databases for intelligent code analysis.

MPORTANT: Always respond in valid JSON format unless explicitly requested otherwise. Structure your responses as:
{
  "analysis": "your main analysis here",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "codeExamples": [{"description": "what this does", "code": "actual code"}],
  "summary": "brief summary of findings"
}

For error analysis, use:
{
  "errors": [{"file": "path", "issue": "description", "fix": "solution", "code": "fixed code"}],
  "summary": "overall assessment"
}

Provide detailed, actionable insights with specific code examples in the JSON structure.`;
  }

  /**
   * Builds appropriate prompts based on analysis task type.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {string} Constructed prompt
   */
  private buildPrompt(request: AnalysisRequest): string {
    if (request.prompt) {
      return request.prompt;
    }

    const baseContext = `Project: ${path.basename(this.config.projectPath)}\n`;

    switch (request.task) {
      case 'domain-analysis':
        return (
          baseContext +
          `
Analyze the following domain relationships using your GNN-Kuzu integration expertise:

Domains: ${JSON.stringify(request.context.domains, null, 2)}
Dependencies: ${JSON.stringify(request.context.dependencies, null, 2)}

RESPOND N JSON FORMAT:
{
  "domainAnalysis": {
    "enhancedRelationships": [
      {"from": "domain1", "to": "domain2", "strength": 0.8, "type": "dependency", "reasoning": "why this relationship exists"}
    ],
    "cohesionScores": [
      {"domain": "domain1", "score": 0.9, "factors": ["factor1", "factor2"]}
    ],
    "crossDomainInsights": [
      {"insight": "description", "impact": "high/medium/low", "recommendation": "what to do"}
    ]
  },
  "architectureRecommendations": [
    {"area": "domain boundaries", "recommendation": "specific advice", "priority": "high/medium/low"}
  ],
  "optimizations": [
    {"target": "cohesion calculation", "improvement": "description", "code": "implementation example"}
  ],
  "summary": "overall domain analysis summary"
}

${request.outputPath ? `Write results to: ${request.outputPath}` : ''}
`
        );

      case 'typescript-error-analysis':
        return (
          baseContext +
          `
Analyze and fix the following TypeScript errors in the GNN-Kuzu integration system:

Files: ${request.context.files?.join(', ')}
Errors: ${JSON.stringify(request.context.errors, null, 2)}

RESPOND N JSON FORMAT:
{
  "errorAnalysis": [
    {
      "file": "path/to/file",
      "error": "error description", 
      "rootCause": "why this error occurs",
      "severity": "high/medium/low",
      "fix": {
        "description": "what needs to be changed",
        "code": "corrected code snippet",
        "imports": ["any new imports needed"],
        "explanation": "why this fix works"
      }
    }
  ],
  "preventionStrategies": [
    {"strategy": "description", "implementation": "how to implement", "benefit": "what it prevents"}
  ],
  "architecturalImpact": {
    "changes": ["change 1", "change 2"],
    "risks": ["potential risk 1"],
    "benefits": ["benefit 1", "benefit 2"]
  },
  "summary": "overall assessment and next steps"
}

${request.requiresFileOperations ? 'Apply fixes directly to the files after providing the JSON analysis.' : ''}
`
        );

      case 'code-review':
        return (
          baseContext +
          `
Perform a comprehensive code review of the GNN-Kuzu integration components:

Files: ${request.context.files?.join(', ')}

RESPOND N JSON FORMAT:
{
  "codeReview": {
    "overallRating": "A/B/C/D/F",
    "strengths": ["strength 1", "strength 2"],
    "criticalIssues": [
      {"file": "path", "issue": "description", "severity": "high/medium/low", "recommendation": "fix"}
    ],
    "improvements": [
      {"category": "performance/architecture/style", "suggestion": "description", "example": "code example", "priority": "high/medium/low"}
    ]
  },
  "architectureAnalysis": {
    "patterns": ["pattern 1", "pattern 2"],
    "antiPatterns": ["issue 1", "issue 2"],
    "recommendations": ["rec 1", "rec 2"]
  },
  "performanceAnalysis": {
    "bottlenecks": ["bottleneck 1", "bottleneck 2"],
    "optimizations": [{"area": "description", "improvement": "suggestion", "impact": "expected benefit"}]
  },
  "integrationPoints": [
    {"component1": "name", "component2": "name", "coupling": "tight/loose", "recommendation": "advice"}
  ],
  "actionItems": [
    {"priority": "high/medium/low", "task": "description", "timeEstimate": "hours/days"}
  ],
  "summary": "overall assessment and next steps"
}
`
        );

      default:
        return (
          baseContext +
          `
Perform custom analysis task: ${request.task}

Context: ${JSON.stringify(request.context, null, 2)}

RESPOND N JSON FORMAT:
{
  "taskType": "${request.task}",
  "analysis": "detailed analysis of the provided context",
  "findings": [
    {"category": "category name", "finding": "description", "importance": "high/medium/low"}
  ],
  "recommendations": [
    {"recommendation": "specific advice", "reasoning": "why this helps", "priority": "high/medium/low"}
  ],
  "nextSteps": ["step 1", "step 2", "step 3"],
  "summary": "concise summary of analysis and key takeaways"
}
`
        );
    }
  }

  /**
   * Executes a command with proper error handling.
   *
   * @private
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>} Command result
   */
  private async executeCommand(
    command: string,
    args: string[]
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: this.config.projectPath,
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code || 0,
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        child.kill();
        reject(new Error(`Command timeout: ${command} ${args.join(' ')}`));
      }, 60000); // 60 second timeout
    });
  }

  /**
   * Creates a new session for conversation continuity.
   *
   * @method createSession
   * @returns {string} New session ID
   */
  createSession(): string {
    this.sessionId = uuidv4();
    return this.sessionId;
  }

  /**
   * Gets current session ID.
   *
   * @method getSessionId
   * @returns {string} Current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Updates service configuration.
   *
   * @method updateConfig
   * @param {Partial<LLMIntegrationConfig>} updates - Configuration updates
   */
  updateConfig(updates: Partial<LLMIntegrationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Checks if a provider is currently in rate limit cooldown.
   *
   * @method isInCooldown
   * @param {string} provider - Provider name ('gemini', etc.)
   * @returns {boolean} True if provider is in cooldown
   */
  isInCooldown(provider: string): boolean {
    const lastRateLimit = this.rateLimitTracker.get(provider);
    if (!lastRateLimit) return false;

    const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000;
    return Date.now() - lastRateLimit < cooldownPeriod;
  }

  /**
   * Gets remaining cooldown time for a provider in minutes.
   *
   * @method getCooldownRemaining
   * @param {string} provider - Provider name ('gemini', etc.)
   * @returns {number} Remaining cooldown time in minutes, or 0 if not in cooldown
   */
  getCooldownRemaining(provider: string): number {
    const lastRateLimit = this.rateLimitTracker.get(provider);
    if (!lastRateLimit) return 0;

    const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000;
    const remaining = cooldownPeriod - (Date.now() - lastRateLimit);

    return remaining > 0 ? Math.ceil(remaining / (60 * 1000)) : 0;
  }

  /**
   * Manually clears cooldown for a provider (use with caution).
   *
   * @method clearCooldown
   * @param {string} provider - Provider name ('gemini', etc.)
   */
  clearCooldown(provider: string): void {
    this.rateLimitTracker.delete(provider);
  }

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
  async analyzeSmart(request: AnalysisRequest): Promise<AnalysisResult> {
    const originalProvider = this.config.preferredProvider;

    // Simple provider selection: GPT-5 for analysis, Claude Code for file operations
    if (request.requiresFileOperations) {
      // File operations need Claude Code with dangerous permissions
      this.config.preferredProvider = 'claude-code';
    } else {
      // All analysis tasks use fully free GPT-5 (200k context, 100k output)
      this.config.preferredProvider = 'github-models';
      this.config.model = 'openai/gpt-5'; // Fully free, excellent for all tasks
      this.config.maxTokens = 100000; // Full output capacity
    }

    try {
      const result = await this.analyze(request);
      return result;
    } finally {
      // Restore original provider preference
      this.config.preferredProvider = originalProvider;
    }
  }

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
  async analyzeArchitectureAB(request: AnalysisRequest): Promise<{
    gpt5: AnalysisResult;
    comparison: AnalysisResult;
    recommendation: string;
  }> {
    const originalProvider = this.config.preferredProvider;
    const originalModel = this.config.model;

    try {
      // Run analysis with GPT-5 (fully free, primary choice)
      this.config.preferredProvider = 'github-models';
      this.config.model = 'openai/gpt-5';
      this.config.maxTokens = 4000; // API limit
      const gpt5Result = await this.analyzeWithGitHubModelsAPI({
        ...request,
        prompt: `[GPT-5 API Analysis] ${request.prompt || this.buildPrompt(request)}`,
      });

      // Run analysis with Codestral (for coding comparison) via API
      this.config.model = 'mistral-ai/codestral-2501';
      this.config.maxTokens = 4000; // API limit
      const codestralResult = await this.analyzeWithGitHubModelsAPI({
        ...request,
        prompt: `[Codestral API Analysis] ${request.prompt || this.buildPrompt(request)}`,
      });

      // Generate recommendation based on results and rate limits
      let recommendation = '';
      if (gpt5Result.success && codestralResult.success) {
        if (
          request.task?.includes('code') ||
          request.task?.includes('typescript')
        ) {
          recommendation =
            'Codestral specialized for coding but GPT-5 preferred due to no rate limits';
        } else {
          recommendation =
            'GPT-5 preferred - fully free with excellent analysis capabilities';
        }
      } else if (gpt5Result.success) {
        recommendation =
          'GPT-5 succeeded while Codestral failed - stick with GPT-5';
      } else if (codestralResult.success) {
        recommendation =
          'Codestral succeeded while GPT-5 failed - unusual, investigate';
      } else {
        recommendation = 'Both models failed - check network or API status';
      }

      return {
        gpt5: gpt5Result,
        comparison: codestralResult,
        recommendation:
          'Recommendation: Use GPT-5 exclusively - it is fully free and excellent for all tasks',
      };
    } finally {
      // Restore original configuration
      this.config.preferredProvider = originalProvider;
      this.config.model = originalModel;
    }
  }

  /**
   * Enhanced method to get current configuration with model strategy details.
   *
   * @method getEnhancedConfig
   * @returns {object} Enhanced configuration details
   */
  getEnhancedConfig() {
    return {
      provider: this.config.preferredProvider,
      model: this.config.model,
      useOptimalModel: this.config.useOptimalModel,
      enhancedLogging: this.config.enhancedLogging,
      componentName: this.config.componentName,
      sessionId: this.sessionId,
      statsEnabled: !!this.statsService,
      rateLimitCooldowns: Object.fromEntries(this.rateLimitTracker),
      supportedFeatures: {
        claudeCodeSDK: true,
        optimalModelSelection: this.config.useOptimalModel,
        enhancedLogging: this.config.enhancedLogging,
        statisticsTracking: !!this.statsService,
        opusModel: true,
        sonnetModel: true,
        componentBasedSelection: true,
        taskContextInference: true,
      },
    };
  }

  /**
   * Enhanced method to get comprehensive service status.
   *
   * @method getServiceStatus
   * @returns {object} Service health and status information
   */
  getServiceStatus() {
    return {
      status: 'operational',
      version: '2.0.0',
      migration: 'claude-code-sdk-integrated',
      providers: {
        claudeCode: {
          available: true,
          models: ['opus', 'sonnet'],
          optimalSelection: this.config.useOptimalModel,
        },
        githubModels: {
          available: !!this.config.githubToken,
          inCooldown: this.isInCooldown('github-models'),
          cooldownRemaining: this.getCooldownRemaining('github-models'),
        },
        gemini: {
          available: !!this.geminiHandler,
          inCooldown: this.isInCooldown('gemini-direct'),
          cooldownRemaining: this.getCooldownRemaining('gemini-direct'),
        },
        copilot: {
          available: !!this.copilotProvider,
          inCooldown: false,
        },
      },
      features: {
        enhancedLogging: this.config.enhancedLogging,
        statisticsTracking: !!this.statsService,
        modelStrategyTracking: this.config.useOptimalModel,
        abTesting: true,
        smartAnalysis: true,
      },
      performance: this.statsService
        ? {
            totalCalls: 'available-via-stats-service',
            systemHealth: 'available-via-stats-service',
          }
        : {
            totalCalls: 'stats-service-not-initialized',
            systemHealth: 'stats-service-not-initialized',
          },
    };
  }
}
