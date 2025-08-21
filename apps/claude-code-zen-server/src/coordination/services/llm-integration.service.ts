/**
 * @fileoverview LLM Integration Service - Foundation + Brain Package Integration
 *
 * This service provides a unified interface for LLM operations using the
 * @claude-zen/foundation and @claude-zen/intelligence packages. Features AI-powered
 * prompt optimization, pattern recognition, and adaptive learning.
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
 * @version 4.0.0 - Brain Package Integration
 * @since 2024-01-01
 *
 * @example Simple AI-Optimized Analysis
 * ```typescript
 * const llmService = new LLMIntegrationService({
 *   projectPath: process.cwd(),
 *   agentRole: 'coder'
 * });
 *
 * const result = await llmService.analyze({
 *   task: 'typescript-error-analysis',
 *   context: { files: ['src/neural/gnn'], errors: [...] },
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
  LLMProvider,
  getGlobalLLM,
  DIContainer,
  getGlobalContainer,
  type Logger,
  type LLMRequest
} from '@claude-zen/foundation';
import { 
  BrainCoordinator,
  type PromptOptimizationRequest
} from '@claude-zen/intelligence';
import { v4 as uuidv4 } from 'uuid';

// Brain package - Simple AI coordination and learning
// Foundation package handles all LLM operations

const execAsync = promisify(spawn);

/**
 * Configuration options for LLM Integration Service using Foundation Package.
 */
export interface LLMIntegrationConfig {
  /** Project root path for file operations */
  projectPath: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Session ID for conversation continuity */
  sessionId?: string;
  /** Agent role for specialized behavior */
  agentRole?: 'assistant' | 'coder' | 'analyst' | 'researcher' | 'coordinator' | 'tester' | 'architect';
  /** Temperature for model responses (0-1) */
  temperature?: number;
  /** Max tokens for model responses */
  maxTokens?: number;
}

/**
 * Analysis request configuration for foundation LLM integration.
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
}

/**
 * Analysis result structure for foundation LLM integration.
 */
export interface AnalysisResult {
  /** Whether analysis was successful */
  success: boolean;
  /** Analysis results data */
  data: unknown;
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
 * LLM Integration Service using Foundation Package.
 *
 * This service provides a standardized interface for LLM operations using the
 * @claude-zen/foundation package. All LLM operations are handled through the
 * foundation LLMProvider with DI container integration.
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
   * Creates a new LLM Integration Service using Foundation Package.
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
    this.config = {
      debug: false,
      temperature: 0.1,
      maxTokens: 200000,
      agentRole: 'assistant',
      ...config,
    };
    
    this.sessionId = config.sessionId || uuidv4();
    
    // Initialize foundation services
    this.diContainer = getGlobalContainer();
    this.logger = getLogger('coordination-services-llm-integration');
    this.llmProvider = getGlobalLLM();
    
    // Set the agent role for specialized behavior
    if (this.config.agentRole) {
      this.llmProvider.setRole(this.config.agentRole);
    }
    
    // Initialize Brain Coordinator - Simple AI interface
    this.brainCoordinator = new BrainCoordinator({
      sessionId: this.sessionId,
      enableLearning: true,
      cacheOptimizations: true
    });
    
    this.logger.info('🚀 LLM Integration Service initialized with Foundation + Brain packages');
    this.logger.info(`Configuration: Agent Role: ${this.config.agentRole}, Session: ${this.sessionId}`);
  }


  /**
   * Main analysis method using Foundation LLMProvider with Dynamic Prompt Optimization.
   *
   * @async
   * @method analyze
   * @param {AnalysisRequest} request - Analysis configuration and context
   * @returns {Promise<AnalysisResult>} Analysis results
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting analysis: ${request.task}`);
      
      // Build AI-optimized prompts using Brain Coordinator
      const optimizedSystemPrompt = await this.optimizeSystemPrompt(request);
      const optimizedUserPrompt = request.prompt || await this.optimizeUserPrompt(request);
      
      // Build the LLM request with optimized prompts
      const llmRequest: LLMRequest = {
        messages: [
          {
            role: 'system',
            content: optimizedSystemPrompt
          },
          {
            role: 'user', 
            content: optimizedUserPrompt
          }
        ],
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens
      };
      
      // Call foundation LLM provider
      const response = await this.llmProvider.analyze(llmRequest);
      
      // Parse the response
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(response.content);
      } catch {
        // If not JSON, return as structured object
        parsedData = {
          analysis: response.content,
          note: 'Response was returned as text, not JSON'
        };
      }
      
      const result: AnalysisResult = {
        success: true,
        data: parsedData,
        executionTime: Date.now() - startTime,
        outputFile: request.outputPath,
        agentRole: this.config.agentRole,
        tokenUsage: response.usage,
        metadata: {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          model: response.model
        }
      };
      
      this.logger.info(`Analysis completed successfully in ${result.executionTime}ms`);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Analysis failed: ${errorMessage}`);
      
      return {
        success: false,
        data: null,
        executionTime: Date.now() - startTime,
        error: errorMessage,
        agentRole: this.config.agentRole,
        metadata: {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Optimizes system prompts using the Brain Coordinator.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {Promise<string>} Optimized system prompt
   */
  private async optimizeSystemPrompt(request: AnalysisRequest): Promise<string> {
    try {
      const basePrompt = this.buildSystemPrompt(request);
      
      const optimizationRequest: PromptOptimizationRequest = {
        task: `system-${request.task}`,
        basePrompt,
        context: {
          agentRole: this.config.agentRole,
          sessionId: this.sessionId,
          hasFileOperations: request.requiresFileOperations
        },
        agentRole: this.config.agentRole,
        priority: 'medium'
      };
      
      const result = await this.brainCoordinator.optimizePrompt(optimizationRequest);
      
      this.logger.info(`🧠 Brain-optimized system prompt for ${request.task} (${result.method})`);
      return result.optimizedPrompt;
      
    } catch (error) {
      this.logger.warn('Brain optimization failed, using static system prompt:', error);
      return this.buildSystemPrompt(request);
    }
  }

  /**
   * Optimizes user prompts using the Brain Coordinator.
   *
   * @private
   * @param {AnalysisRequest} request - Analysis request
   * @returns {Promise<string>} Optimized user prompt
   */
  private async optimizeUserPrompt(request: AnalysisRequest): Promise<string> {
    try {
      const basePrompt = this.buildPrompt(request);
      
      const optimizationRequest: PromptOptimizationRequest = {
        task: `user-${request.task}`,
        basePrompt,
        context: {
          agentRole: this.config.agentRole,
          taskData: request.context,
          requiresFileOperations: request.requiresFileOperations,
          sessionId: this.sessionId
        },
        agentRole: this.config.agentRole,
        priority: 'medium'
      };
      
      const result = await this.brainCoordinator.optimizePrompt(optimizationRequest);
      
      this.logger.info(`🧠 Brain-optimized user prompt for ${request.task} (${result.method})`);
      return result.optimizedPrompt;
      
    } catch (error) {
      this.logger.warn('Brain optimization failed, using static user prompt:', error);
      return this.buildPrompt(request);
    }
  }


  /**
   * Builds static system prompts for the LLM based on the analysis request.
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

IMPORTANT: Always respond in valid JSON format unless explicitly requested otherwise. Structure your responses as:
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
        return baseContext + `
Analyze the following domain relationships using your GNN-Kuzu integration expertise:

Domains: ${JSON.stringify(request.context.domains, null, 2)}
Dependencies: ${JSON.stringify(request.context.dependencies, null, 2)}

RESPOND IN JSON FORMAT with domain analysis, architecture recommendations, and summary.

${request.outputPath ? `Write results to: ${request.outputPath}` : ''}`;

      case 'typescript-error-analysis':
        return baseContext + `
Analyze and fix the following TypeScript errors in the GNN-Kuzu integration system:

Files: ${request.context.files?.join(', ')}
Errors: ${JSON.stringify(request.context.errors, null, 2)}

RESPOND IN JSON FORMAT with error analysis, prevention strategies, and summary.

${request.requiresFileOperations ? 'Apply fixes directly to the files after providing the JSON analysis.' : ''}`;

      case 'code-review':
        return baseContext + `
Perform a comprehensive code review of the GNN-Kuzu integration components:

Files: ${request.context.files?.join(', ')}

RESPOND IN JSON FORMAT with code review findings, architecture analysis, and recommendations.`;

      default:
        return baseContext + `
Perform custom analysis task: ${request.task}

Context: ${JSON.stringify(request.context, null, 2)}

RESPOND IN JSON FORMAT with analysis findings and recommendations.`;
    }
  }

  /**
   * Session and utility methods using Foundation Package
   */

  /**
   * Creates a new session for conversation continuity.
   *
   * @method createSession
   * @returns {string} New session ID
   */
  createSession(): string {
    this.sessionId = uuidv4();
    this.logger.info(`New session created: ${this.sessionId}`);
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
    
    // Update agent role if provided
    if (updates.agentRole) {
      this.llmProvider.setRole(updates.agentRole);
      this.logger.info(`Agent role updated to: ${updates.agentRole}`);
    }
    
    this.logger.info('Configuration updated');
  }

  /**
   * Gets comprehensive service status using Foundation + Brain packages.
   *
   * @method getServiceStatus
   * @returns {object} Service health and status information
   */
  getServiceStatus() {
    const llmStats = this.llmProvider.getUsageStats();
    const brainStats = this.brainCoordinator.getStats();
    
    return {
      status: 'operational',
      version: '4.0.0',
      migration: 'foundation-brain-integrated',
      llmProvider: {
        available: true,
        currentRole: llmStats.currentRole || 'assistant',
        requestCount: llmStats.requestCount,
        lastRequestTime: llmStats.lastRequestTime
      },
      brainCoordinator: {
        initialized: brainStats.initialized,
        cacheSize: brainStats.cacheSize,
        cacheHits: brainStats.cacheHits,
        learningEnabled: brainStats.learningEnabled
      },
      session: {
        sessionId: this.sessionId,
        projectPath: this.config.projectPath
      },
      config: {
        debug: this.config.debug,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        agentRole: this.config.agentRole
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
        structuredLogging: true
      }
    };
  }
}
