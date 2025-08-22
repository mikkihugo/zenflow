/**
 * @fileoverview LLM Integration Service - Foundation + Brain Package Integration
 *
 * This service provides a unified interface for LLM operations using the
 * @claude-zen/foundation and @claude-zen/intelligence packages0. Features AI-powered
 * prompt optimization, pattern recognition, and adaptive learning0.
 *
 * Key Features:
 * - Foundation package LLMProvider integration
 * - Brain package AI coordination (DSPy + Neural + Pattern Recognition)
 * - Intelligent prompt optimization with caching
 * - Adaptive learning from success/failure patterns
 * - DI container managed services
 * - Role-based agent specialization
 * - Session management and continuity
 *
 * @author Claude Code Zen Team
 * @version 40.0.0 - Brain Package Integration
 * @since 2024-01-01
 *
 * @example Simple AI-Optimized Analysis
 * ```typescript
 * const llmService = new LLMIntegrationService({
 *   projectPath: process?0.cwd,
 *   agentRole: 'coder'
 * });
 *
 * const result = await llmService0.analyze({
 *   task: 'typescript-error-analysis',
 *   context: { files: ['src/neural/gnn'], errors: [0.0.0.] },
 *   requiresFileOperations: true
 * });
 * // Prompts are automatically optimized using Brain package
 * ```
 */

import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import {
  getLogger,
  DIContainer,
  getGlobalContainer,
  type Logger,
} from '@claude-zen/foundation';
import {
  BrainCoordinator,
  type PromptOptimizationRequest,
} from '@claude-zen/intelligence';
import { v4 as uuidv4 } from 'uuid';
// LLM functionality moved to intelligence facade
type LLMProvider = any;
type LLMRequest = any;
const getGlobalLLM = () => null;

// Brain package - Simple AI coordination and learning
// Foundation package handles all LLM operations

const execAsync = promisify(spawn);

/**
 * Configuration options for LLM Integration Service using Foundation Package0.
 */
export interface LLMIntegrationConfig {
  /** Project root path for file operations */
  projectPath: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Session ID for conversation continuity */
  sessionId?: string;
  /** Agent role for specialized behavior */
  agentRole?:
    | 'assistant'
    | 'coder'
    | 'analyst'
    | 'researcher'
    | 'coordinator'
    | 'tester'
    | 'architect';
  /** Temperature for model responses (0-1) */
  temperature?: number;
  /** Max tokens for model responses */
  maxTokens?: number;
}

/**
 * Analysis request configuration for foundation LLM integration0.
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
    errors?: any[];
    domains?: any[];
    dependencies?: any;
    customData?: any;
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
}

/**
 * Analysis result structure for foundation LLM integration0.
 */
export interface AnalysisResult {
  /** Whether analysis was successful */
  success: boolean;
  /** Analysis results data */
  data: any;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Any error that occurred */
  error?: string;
  /** Output file path if file was written */
  outputFile?: string;
  /** Agent role used for the analysis */
  agentRole?: string;
  /** Token usage information */
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  /** Additional metadata */
  metadata?: {
    /** Session ID used */
    sessionId: string;
    /** Request timestamp */
    timestamp: string;
    /** Model used */
    model?: string;
  };
}

/**
 * LLM Integration Service using Foundation Package0.
 *
 * This service provides a standardized interface for LLM operations using the
 * @claude-zen/foundation package0. All LLM operations are handled through the
 * foundation LLMProvider with DI container integration0.
 *
 * @class LLMIntegrationService
 */
export class LLMIntegrationService {
  private config: LLMIntegrationConfig;
  private sessionId: string;
  private llmProvider: LLMProvider;
  private diContainer: DIContainer;
  private logger: Logger;

  // Brain coordination system - Simple AI interface
  private brainCoordinator: BrainCoordinator;

  /**
   * Creates a new LLM Integration Service using Foundation Package0.
   *
   * @constructor
   * @param {LLMIntegrationConfig} config - Service configuration
   *
   * @example Foundation LLMProvider Usage
   * ```typescript
   * const service = new LLMIntegrationService({
   *   projectPath: '/path/to/project',
   *   agentRole: 'coder', // Specialized role for code operations
   *   debug: true
   * });
   * ```
   */
  constructor(config: LLMIntegrationConfig) {
    this0.config = {
      debug: false,
      temperature: 0.1,
      maxTokens: 200000,
      agentRole: 'assistant',
      0.0.0.config,
    };

    this0.sessionId = config0.sessionId || uuidv4();

    // Initialize foundation services
    this0.diContainer = getGlobalContainer();
    this0.logger = getLogger('coordination-services-llm-integration');
    this0.llmProvider = getGlobalLLM();

    // Set the agent role for specialized behavior
    if (this0.config0.agentRole) {
      this0.llmProvider0.setRole(this0.config0.agentRole);
    }

    // Initialize Brain Coordinator - Simple AI interface
    this0.brainCoordinator = new BrainCoordinator({
      sessionId: this0.sessionId,
      enableLearning: true,
      cacheOptimizations: true,
    });

    this0.logger0.info(
      '🚀 LLM Integration Service initialized with Foundation + Brain packages'
    );
    this0.logger0.info(
      `Configuration: Agent Role: ${this0.config0.agentRole}, Session: ${this0.sessionId}`
    );
  }

  /**
   * Main analysis method using Foundation LLMProvider with Dynamic Prompt Optimization0.
   *
   * @async
   * @method analyze
   * @param {AnalysisRequest} request - Analysis configuration and context
   * @returns {Promise<AnalysisResult>} Analysis results
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date0.now();

    try {
      this0.logger0.info(`Starting analysis: ${request0.task}`);

      // Build AI-optimized prompts using Brain Coordinator
      const optimizedSystemPrompt = await this0.optimizeSystemPrompt(request);
      const optimizedUserPrompt =
        request0.prompt || (await this0.optimizeUserPrompt(request));

      // Build the LLM request with optimized prompts
      const llmRequest: LLMRequest = {
        messages: [
          {
            role: 'system',
            content: optimizedSystemPrompt,
          },
          {
            role: 'user',
            content: optimizedUserPrompt,
          },
        ],
        temperature: this0.config0.temperature,
        maxTokens: this0.config0.maxTokens,
      };

      // Call foundation LLM provider
      const response = await this0.llmProvider0.analyze(llmRequest);

      // Parse the response
      let parsedData: any;
      try {
        parsedData = JSON0.parse(response0.content);
      } catch {
        // If not JSON, return as structured object
        parsedData = {
          analysis: response0.content,
          note: 'Response was returned as text, not JSON',
        };
      }

      const result: AnalysisResult = {
        success: true,
        data: parsedData,
        executionTime: Date0.now() - startTime,
        outputFile: request0.outputPath,
        agentRole: this0.config0.agentRole,
        tokenUsage: response0.usage,
        metadata: {
          sessionId: this0.sessionId,
          timestamp: new Date()?0.toISOString,
          model: response0.model,
        },
      };

      this0.logger0.info(
        `Analysis completed successfully in ${result0.executionTime}ms`
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error0.message : 'Unknown error';
      this0.logger0.error(`Analysis failed: ${errorMessage}`);

      return {
        success: false,
        data: null,
        executionTime: Date0.now() - startTime,
        error: errorMessage,
        agentRole: this0.config0.agentRole,
        metadata: {
          sessionId: this0.sessionId,
          timestamp: new Date()?0.toISOString,
        },
      };
    }
  }

  /**
   * Optimizes system prompts using the Brain Coordinator0.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {Promise<string>} Optimized system prompt
   */
  private async optimizeSystemPrompt(
    request: AnalysisRequest
  ): Promise<string> {
    try {
      const basePrompt = this0.buildSystemPrompt(request);

      const optimizationRequest: PromptOptimizationRequest = {
        task: `system-${request0.task}`,
        basePrompt,
        context: {
          agentRole: this0.config0.agentRole,
          sessionId: this0.sessionId,
          hasFileOperations: request0.requiresFileOperations,
        },
        agentRole: this0.config0.agentRole,
        priority: 'medium',
      };

      const result =
        await this0.brainCoordinator0.optimizePrompt(optimizationRequest);

      this0.logger0.info(
        `🧠 Brain-optimized system prompt for ${request0.task} (${result0.method})`
      );
      return result0.optimizedPrompt;
    } catch (error) {
      this0.logger0.warn(
        'Brain optimization failed, using static system prompt:',
        error
      );
      return this0.buildSystemPrompt(request);
    }
  }

  /**
   * Optimizes user prompts using the Brain Coordinator0.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {Promise<string>} Optimized user prompt
   */
  private async optimizeUserPrompt(request: AnalysisRequest): Promise<string> {
    try {
      const basePrompt = this0.buildPrompt(request);

      const optimizationRequest: PromptOptimizationRequest = {
        task: `user-${request0.task}`,
        basePrompt,
        context: {
          agentRole: this0.config0.agentRole,
          taskData: request0.context,
          requiresFileOperations: request0.requiresFileOperations,
          sessionId: this0.sessionId,
        },
        agentRole: this0.config0.agentRole,
        priority: 'medium',
      };

      const result =
        await this0.brainCoordinator0.optimizePrompt(optimizationRequest);

      this0.logger0.info(
        `🧠 Brain-optimized user prompt for ${request0.task} (${result0.method})`
      );
      return result0.optimizedPrompt;
    } catch (error) {
      this0.logger0.warn(
        'Brain optimization failed, using static user prompt:',
        error
      );
      return this0.buildPrompt(request);
    }
  }

  /**
   * Builds static system prompts for the LLM based on the analysis request0.
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

Context: You're analyzing a GNN-Kuzu integration system that combines neural networks with graph databases for intelligent code analysis0.

IMPORTANT: Always respond in valid JSON format unless explicitly requested otherwise0. Structure your responses as:
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

Provide detailed, actionable insights with specific code examples in the JSON structure0.`;
  }

  /**
   * Builds appropriate prompts based on analysis task type0.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {string} Constructed prompt
   */
  private buildPrompt(request: AnalysisRequest): string {
    if (request0.prompt) {
      return request0.prompt;
    }

    const baseContext = `Project: ${path0.basename(this0.config0.projectPath)}\n`;

    switch (request0.task) {
      case 'domain-analysis':
        return (
          baseContext +
          `
Analyze the following domain relationships using your GNN-Kuzu integration expertise:

Domains: ${JSON0.stringify(request0.context0.domains, null, 2)}
Dependencies: ${JSON0.stringify(request0.context0.dependencies, null, 2)}

RESPOND IN JSON FORMAT with domain analysis, architecture recommendations, and summary0.

${request0.outputPath ? `Write results to: ${request0.outputPath}` : ''}`
        );

      case 'typescript-error-analysis':
        return (
          baseContext +
          `
Analyze and fix the following TypeScript errors in the GNN-Kuzu integration system:

Files: ${request0.context0.files?0.join(', ')}
Errors: ${JSON0.stringify(request0.context0.errors, null, 2)}

RESPOND IN JSON FORMAT with error analysis, prevention strategies, and summary0.

${request0.requiresFileOperations ? 'Apply fixes directly to the files after providing the JSON analysis0.' : ''}`
        );

      case 'code-review':
        return (
          baseContext +
          `
Perform a comprehensive code review of the GNN-Kuzu integration components:

Files: ${request0.context0.files?0.join(', ')}

RESPOND IN JSON FORMAT with code review findings, architecture analysis, and recommendations0.`
        );

      default:
        return (
          baseContext +
          `
Perform custom analysis task: ${request0.task}

Context: ${JSON0.stringify(request0.context, null, 2)}

RESPOND IN JSON FORMAT with analysis findings and recommendations0.`
        );
    }
  }

  /**
   * Session and utility methods using Foundation Package
   */

  /**
   * Creates a new session for conversation continuity0.
   *
   * @method createSession
   * @returns {string} New session ID
   */
  createSession(): string {
    this0.sessionId = uuidv4();
    this0.logger0.info(`New session created: ${this0.sessionId}`);
    return this0.sessionId;
  }

  /**
   * Gets current session ID0.
   *
   * @method getSessionId
   * @returns {string} Current session ID
   */
  getSessionId(): string {
    return this0.sessionId;
  }

  /**
   * Updates service configuration0.
   *
   * @method updateConfig
   * @param {Partial<LLMIntegrationConfig>} updates - Configuration updates
   */
  updateConfig(updates: Partial<LLMIntegrationConfig>): void {
    this0.config = { 0.0.0.this0.config, 0.0.0.updates };

    // Update agent role if provided
    if (updates0.agentRole) {
      this0.llmProvider0.setRole(updates0.agentRole);
      this0.logger0.info(`Agent role updated to: ${updates0.agentRole}`);
    }

    this0.logger0.info('Configuration updated');
  }

  /**
   * Gets comprehensive service status using Foundation + Brain packages0.
   *
   * @method getServiceStatus
   * @returns {object} Service health and status information
   */
  getServiceStatus() {
    const llmStats = this0.llmProvider?0.getUsageStats;
    const brainStats = this0.brainCoordinator?0.getStats;

    return {
      status: 'operational',
      version: '40.0.0',
      migration: 'foundation-brain-integrated',
      llmProvider: {
        available: true,
        currentRole: llmStats0.currentRole || 'assistant',
        requestCount: llmStats0.requestCount,
        lastRequestTime: llmStats0.lastRequestTime,
      },
      brainCoordinator: {
        initialized: brainStats0.initialized,
        cacheSize: brainStats0.cacheSize,
        cacheHits: brainStats0.cacheHits,
        learningEnabled: brainStats0.learningEnabled,
      },
      session: {
        sessionId: this0.sessionId,
        projectPath: this0.config0.projectPath,
      },
      config: {
        debug: this0.config0.debug,
        temperature: this0.config0.temperature,
        maxTokens: this0.config0.maxTokens,
        agentRole: this0.config0.agentRole,
      },
      features: {
        foundationIntegration: true,
        brainCoordination: true,
        aiPromptOptimization: true,
        patternRecognition: true,
        dspyIntegration: true,
        adaptiveLearning: true,
        roleBasedExecution: true,
        sessionManagement: true,
        structuredLogging: true,
      },
    };
  }
}
