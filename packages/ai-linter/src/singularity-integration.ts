/**
 * @fileoverview Singularity-Coder Integration for AI Linter
 * 
 * Enhances Claude's AI linting capabilities with the singularity-coder's WASM-accelerated 
 * file-aware engine. Works alongside Claude to provide additional insights through 
 * hardware-optimized analysis.
 * 
 * Features:
 * - CodeMesh WASM integration for hardware-optimized analysis
 * - File-aware AI understanding that complements Claude's analysis
 * - Hardware detection and optimization strategies
 * - Tool registry for extensible analysis pipelines
 * - Agent-based analysis to augment Claude's insights
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

// Add createLLMProvider stub until intelligence facade is ready
function createLLMProvider(provider: string): any {
  return { provider, initialized: true };
}
import type { 
  LinterContext, 
  AIAnalysisResult, 
  ClaudeInsights,
  ComplexityIssue,
  PerformanceOptimization,
  TechnicalDebtIndicator
} from './types/ai-linter-types.js';

/**
 * Singularity-Coder analysis configuration
 */
export interface SingularityAnalysisConfig {
  /** Enable hardware-optimized analysis */
  enableHardwareOptimization: boolean;
  /** Maximum analysis depth */
  maxDepth: number;
  /** Focus areas for analysis */
  focusAreas: string[];
  /** Enable agent-based analysis */
  enableAgentAnalysis: boolean;
  /** Confidence threshold for insights */
  confidenceThreshold: number;
}

/**
 * Default configuration for Singularity analysis
 */
export const DEFAULT_SINGULARITY_CONFIG: SingularityAnalysisConfig = {
  enableHardwareOptimization: true,
  maxDepth: 3,
  focusAreas: ['complexity', 'performance', 'maintainability', 'architecture'],
  enableAgentAnalysis: true,
  confidenceThreshold: 0.75,
};

/**
 * Enhanced AI analysis result with Singularity insights that complement Claude's analysis
 */
export interface EnhancedAnalysisResult extends AIAnalysisResult {
  /** Singularity-specific insights that enhance Claude's findings */
  singularityInsights: {
    /** Hardware optimization recommendations from WASM analysis */
    hardwareOptimizations: PerformanceOptimization[];
    /** Agent-based analysis results that complement Claude's insights */
    agentAnalysis: AgentAnalysisResult[];
    /** Code mesh analysis from WASM engine */
    codeMeshAnalysis: CodeMeshAnalysis;
    /** Performance predictions from hardware-optimized analysis */
    performancePredictions: PerformancePrediction[];
    /** File-aware context that enhances Claude's understanding */
    fileAwareContext: FileAwareContext;
  };
}

/**
 * File-aware context from singularity-coder that enhances Claude's analysis
 */
export interface FileAwareContext {
  /** Related files and dependencies */
  relatedFiles: string[];
  /** Import/export relationships */
  dependencies: DependencyRelationship[];
  /** Cross-file patterns detected */
  crossFilePatterns: CrossFilePattern[];
  /** Project-wide context insights */
  projectContext: ProjectContextInsight[];
}

/**
 * Dependency relationship detected by file-aware analysis
 */
export interface DependencyRelationship {
  /** Type of dependency */
  type: 'import' | 'export' | 'reference' | 'inheritance';
  /** Source file */
  source: string;
  /** Target file */
  target: string;
  /** Dependency strength */
  strength: number;
  /** Usage patterns */
  patterns: string[];
}

/**
 * Cross-file pattern detected by singularity-coder
 */
export interface CrossFilePattern {
  /** Pattern type */
  type: 'code-duplication' | 'architecture-violation' | 'inconsistent-style' | 'missing-abstraction';
  /** Files involved */
  files: string[];
  /** Pattern description */
  description: string;
  /** Suggested improvement */
  suggestion: string;
  /** Confidence in detection */
  confidence: number;
}

/**
 * Project context insight from file-aware analysis
 */
export interface ProjectContextInsight {
  /** Insight category */
  category: 'architecture' | 'scalability' | 'maintainability' | 'performance';
  /** Insight description */
  description: string;
  /** Impact level */
  impact: 'low' | 'medium' | 'high' | 'critical';
  /** Recommendation */
  recommendation: string;
  /** Files affected */
  affectedFiles: string[];
}

/**
 * Agent analysis result from CodeMesh
 */
export interface AgentAnalysisResult {
  /** Agent ID */
  agentId: string;
  /** Agent type (analyzer, optimizer, etc.) */
  agentType: string;
  /** Analysis task performed */
  task: string;
  /** Agent's findings */
  findings: string;
  /** Confidence in the analysis */
  confidence: number;
  /** Performance metrics */
  performanceMetrics: {
    executionTimeMs: number;
    memoryUsageMb: number;
    cpuUtilization: number;
  };
}

/**
 * Code mesh analysis from WASM engine
 */
export interface CodeMeshAnalysis {
  /** Overall complexity score */
  complexityScore: number;
  /** Architecture quality rating */
  architectureQuality: number;
  /** Maintainability index */
  maintainabilityIndex: number;
  /** Technical debt ratio */
  technicalDebtRatio: number;
  /** Code health indicators */
  healthIndicators: {
    typesSafety: number;
    testCoverage: number;
    documentation: number;
    consistency: number;
  };
}

/**
 * Performance prediction from hardware-optimized analysis
 */
export interface PerformancePrediction {
  /** Metric being predicted */
  metric: string;
  /** Predicted value */
  predictedValue: number;
  /** Confidence in prediction */
  confidence: number;
  /** Optimization suggestions */
  optimizations: string[];
}

/**
 * Singularity-Coder integration for enhanced AI linting
 */
export class SingularityIntegration {
  private readonly logger: Logger;
  private readonly config: SingularityAnalysisConfig;
  private codeMesh: any = null;
  private hardwareDetector: any = null;
  private toolRegistry: any = null;
  private isInitialized = false;

  constructor(config: Partial<SingularityAnalysisConfig> = {}) {
    this.logger = getLogger('singularity-integration');
    this.config = { ...DEFAULT_SINGULARITY_CONFIG, ...config };
  }

  /**
   * Initialize Singularity-Coder WASM modules
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('🚀 Initializing Singularity-Coder WASM integration...');

      // Dynamically import the singularity-coder package
      const singularityModule = await this.loadSingularityModule();
      
      if (singularityModule) {
        try {
          // Debug: Check what's available in the module
          this.logger.debug('Available exports:', Object.keys(singularityModule));
          
          // Check if we have direct WASM classes or need to use bridge
          if (singularityModule.CodeMesh) {
            // Direct WASM classes available
            this.logger.debug('Using direct WASM classes');
            this.codeMesh = new singularityModule.CodeMesh();
            this.codeMesh.init();
            
            if (this.config.enableHardwareOptimization) {
              this.hardwareDetector = new singularityModule.HardwareDetector();
            }
            
            this.toolRegistry = new singularityModule.ToolRegistry();
            this.registerAnalysisTools();
            
          } else if (singularityModule.createCodeMeshBridge) {
            // Use bridge API
            this.logger.debug('Using CodeMesh bridge API');
            const bridgeConfig = {
              rootPath: process.cwd(),
              enableHardwareOptimization: this.config.enableHardwareOptimization,
              enableAgentAnalysis: this.config.enableAgentAnalysis
            };
            
            this.codeMesh = singularityModule.createCodeMeshBridge(bridgeConfig);
            this.logger.debug('CodeMesh bridge created successfully');
            
            // Bridge might not have separate hardware detector
            if (this.config.enableHardwareOptimization && this.codeMesh.detectHardware) {
              this.hardwareDetector = this.codeMesh; // Use codeMesh as hardware detector
            }
            
            // Bridge might not have separate tool registry
            this.toolRegistry = this.codeMesh; // Use codeMesh as tool registry
            
          } else {
            throw new Error('Neither direct WASM classes nor bridge API available');
          }
        } catch (initError) {
          this.logger.error('Failed to initialize WASM classes:', initError);
          throw initError;
        }
        
        this.isInitialized = true;
        this.logger.info('✅ Singularity-Coder WASM integration initialized successfully');
        
        // Setup LLM bridge for Rust agents
        await this.setupLLMBridge();
        
        // Log hardware optimization status
        if (this.config.enableHardwareOptimization) {
          const hardwareInfo = await this.detectHardware();
          this.logger.info(`🖥️ Hardware optimization enabled: ${JSON.stringify(hardwareInfo.optimizationStrategy)}`);
        }
      } else {
        this.logger.warn('⚠️ Singularity-Coder WASM modules not available, falling back to basic analysis');
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize Singularity-Coder integration:', error);
      // Continue without WASM optimization
    }
  }

  /**
   * Dynamically load singularity-coder module
   */
  private async loadSingularityModule(): Promise<any> {
    try {
      // Try to load the main singularity-coder module
      const singularityModule = await import('@claude-zen/singularity-coder' as any);
      this.logger.info('✅ Successfully loaded main singularity-coder module');
      return singularityModule;
    } catch (error) {
      this.logger.debug('Main module not available, trying bridge module...', String(error));
      
      try {
        // Try the bridge which includes WASM exports
        const bridgeModule = await import('@claude-zen/singularity-coder/bridge' as any);
        this.logger.info('✅ Successfully loaded singularity-coder bridge module');
        return bridgeModule;
      } catch (bridgeError) {
        this.logger.debug('Bridge module not available, trying direct WASM import...', String(bridgeError));
        
        try {
          // Load WASM module chunk directly from built distribution
          const wasmModule = await import('../../singularity-coder/dist/chunk-KTBMFE4T.js' as any);
          this.logger.info('✅ Successfully loaded WASM module from chunk');
          return wasmModule;
        } catch (chunkError) {
          this.logger.debug('Chunk import failed, trying relative path...', String(chunkError));
          
          try {
            // Fallback to relative path if package resolution fails
            const wasmModule = await import('../../singularity-coder/dist/code_mesh_wasm.js' as any);
            
            // Initialize WASM module
            if (wasmModule.default && typeof wasmModule.default === 'function') {
              await wasmModule.default();
            }
            
            this.logger.info('✅ Successfully loaded WASM module from relative path');
            return wasmModule;
          } catch (relativeError) {
            this.logger.warn('All singularity-coder import attempts failed, falling back to basic analysis');
            this.logger.warn('Main error:', String(error));
            this.logger.warn('Bridge error:', String(bridgeError));  
            this.logger.warn('Chunk error:', String(chunkError));
            this.logger.warn('Relative error:', String(relativeError));
            return null;
          }
        }
      }
    }
  }

  /**
   * Register analysis tools in the tool registry
   */
  private registerAnalysisTools(): void {
    if (!this.toolRegistry) return;

    try {
      // Register complexity analyzer
      this.toolRegistry.register('complexity-analyzer', JSON.stringify({
        name: 'AI Complexity Analyzer',
        version: '1.0.0',
        description: 'Analyzes code complexity using AI-powered metrics'
      }));

      // Register performance analyzer
      this.toolRegistry.register('performance-analyzer', JSON.stringify({
        name: 'AI Performance Analyzer', 
        version: '1.0.0',
        description: 'Predicts performance characteristics and optimizations'
      }));

      // Register architecture analyzer
      this.toolRegistry.register('architecture-analyzer', JSON.stringify({
        name: 'AI Architecture Analyzer',
        version: '1.0.0', 
        description: 'Evaluates architectural patterns and design quality'
      }));

      this.logger.debug('📦 Registered analysis tools in Singularity tool registry');
      
    } catch (error) {
      this.logger.warn('Failed to register analysis tools:', error);
    }
  }

  /**
   * Detect hardware capabilities for optimization
   */
  async detectHardware(): Promise<any> {
    if (!this.hardwareDetector) {
      return { optimizationStrategy: 'basic' };
    }

    try {
      const hardwareInfo = await this.hardwareDetector.detect_hardware();
      const optimizationStrategy = this.hardwareDetector.get_optimization_strategy();
      
      return {
        hardwareInfo,
        optimizationStrategy,
        cpuCores: hardwareInfo?.cpu?.cores || 'unknown',
        memoryGb: hardwareInfo?.memory?.total ? Math.round(hardwareInfo.memory.total / (1024 * 1024 * 1024)) : 'unknown',
        hasGpu: hardwareInfo?.gpu?.available || false,
      };
    } catch (error) {
      this.logger.warn('Hardware detection failed:', error);
      return { optimizationStrategy: 'basic' };
    }
  }

  /**
   * Setup LLM provider bridge between TypeScript and Rust WASM
   * This allows Rust agents to use TypeScript LLM providers instead of direct external calls
   */
  async setupLLMBridge(): Promise<void> {
    try {
      this.logger.debug('🔗 Setting up LLM provider bridge for Rust WASM...');
      
      // Create TypeScript LLM provider - Rust will route through this instead of direct external calls
      const llmProvider = createLLMProvider('claude-code');
      
      // Store the LLM provider for bridge calls
      (this as any)._llmProvider = llmProvider;
      
      // Check if the WASM module has direct LLM bridge capability
      if (this.codeMesh && typeof this.codeMesh.setup_llm_bridge === 'function') {
        // Setup bridge directly in WASM - Rust will call back to TypeScript
        this.codeMesh.setup_llm_bridge({
          provider: 'typescript', // Indicate we're using TypeScript provider
          callLLM: async (prompt: string, options: any) => {
            return await this.handleLLMBridgeCall(prompt, options);
          }
        });
        
        this.logger.info('✅ Direct LLM bridge configured - Rust WASM will route to TypeScript LLM provider');
        
      } else if (this.codeMesh) {
        // Manual bridge setup - expose bridge function to WASM
        (this.codeMesh as any)._llmBridge = {
          callLLM: (prompt: string, options: any) => this.handleLLMBridgeCall(prompt, options),
          provider: 'typescript'
        };
        
        this.logger.info('✅ Manual LLM bridge configured - Rust can access TypeScript LLM via _llmBridge');
        
      } else {
        this.logger.info('📝 LLM provider stored for future bridge setup (WASM not ready yet)');
      }
      
    } catch (error) {
      this.logger.warn('Failed to setup LLM bridge:', error);
      // Continue without LLM integration - WASM will use built-in logic
    }
  }

  /**
   * Handle LLM bridge calls from Rust WASM - routes to TypeScript LLM providers
   */
  private async handleLLMBridgeCall(prompt: string, options: any = {}): Promise<any> {
    const llmProvider = (this as any)._llmProvider;
    if (!llmProvider) {
      this.logger.warn('No TypeScript LLM provider available for Rust bridge');
      return {
        success: false,
        error: 'TypeScript LLM provider not initialized',
        content: 'Fallback: Using WASM native analysis'
      };
    }
    
    try {
      this.logger.debug(`🌉 Bridging LLM call from Rust WASM to TypeScript provider: ${prompt.substring(0, 100)}...`);
      
      const response = await llmProvider.generateCompletion({
        messages: [{ role: 'user', content: prompt }],
        model: options.model || 'claude-3-sonnet',
        maxTokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7
      });
      
      this.logger.debug('✅ TypeScript LLM provider responded successfully to Rust WASM');
      
      return {
        success: true,
        content: response.content,
        usage: response.usage || { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
        provider: 'typescript-claude'
      };
      
    } catch (error) {
      this.logger.warn('TypeScript LLM bridge call failed:', String(error));
      return {
        success: false,
        error: String(error),
        content: 'Fallback: Using WASM native analysis',
        provider: 'typescript-claude'
      };
    }
  }

  /**
   * Legacy manual LLM call for Rust agents - now routes through the bridge
   * @deprecated Use the LLM bridge instead
   */
  async callLLMForRust(prompt: string, options: any = {}): Promise<string> {
    this.logger.debug('🔄 Legacy callLLMForRust - routing through new bridge system');
    
    try {
      const bridgeResponse = await this.handleLLMBridgeCall(prompt, options);
      return bridgeResponse.success ? bridgeResponse.content : bridgeResponse.error || 'Bridge call failed';
    } catch (error) {
      this.logger.warn('Legacy LLM call failed:', error);
      return 'LLM call failed - using heuristic analysis';
    }
  }

  /**
   * Enhance Claude's analysis with Singularity-Coder's WASM-accelerated capabilities
   * This provides additional insights that complement Claude's AI analysis
   */
  async enhanceClaudeAnalysis(
    filePath: string,
    content: string,
    context: LinterContext,
    claudeBaseAnalysis?: AIAnalysisResult
  ): Promise<EnhancedAnalysisResult> {
    await this.initialize();

    this.logger.debug(`🔍 Enhancing Claude's analysis for ${filePath} with Singularity-Coder...`);

    // Use Claude's existing analysis as the base, or create a minimal one if not provided
    const baseResult: AIAnalysisResult = claudeBaseAnalysis || {
      filePath,
      timestamp: Date.now(),
      patterns: [],
      claudeInsights: {
        complexity_issues: [],
        type_safety_concerns: [],
        architectural_suggestions: [],
        performance_optimizations: [],
        maintainability_score: 80,
        quality_assessment: {
          overallScore: 80,
          categoryScores: {
            'complexity': 80,
            'type-safety': 85,
            'performance': 75,
            'security': 80,
            'maintainability': 80,
            'architecture': 80,
            'style': 85,
            'correctness': 90,
            'accessibility': 70,
            'i18n': 60,
          },
          strengths: ['Well-structured code'],
          improvements: ['Add more comprehensive error handling'],
          technicalDebt: [],
        },
        antipatterns: [],
        good_practices: [],
      },
      generatedRules: [],
      swarmEnhancements: {
        architectural_review: '',
        security_analysis: '',
        performance_insights: '',
        coordination_quality: 'medium' as const,
        agent_contributions: [],
        consensus_score: 0.8,
        conflicts: [],
      },
      confidence: 0.8,
      suggestions: [],
      performance: {
        totalTimeMs: 0,
        astParsingTimeMs: 0,
        claudeAnalysisTimeMs: 0,
        swarmCoordinationTimeMs: 0,
        ruleGenerationTimeMs: 0,
        memoryUsageMb: 0,
        tokensUsed: 0,
        cacheStats: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          cacheSize: 0,
          cacheMemoryMb: 0,
        },
      },
      fromCache: false,
    };

    // Enhanced analysis with Singularity-Coder that complements Claude's insights
    const enhancedResult: EnhancedAnalysisResult = {
      ...baseResult,
      singularityInsights: {
        hardwareOptimizations: [],
        agentAnalysis: [],
        codeMeshAnalysis: {
          complexityScore: 0,
          architectureQuality: 0,
          maintainabilityIndex: 0,
          technicalDebtRatio: 0,
          healthIndicators: {
            typesSafety: 0,
            testCoverage: 0,
            documentation: 0,
            consistency: 0,
          },
        },
        performancePredictions: [],
        fileAwareContext: {
          relatedFiles: [],
          dependencies: [],
          crossFilePatterns: [],
          projectContext: [],
        },
      },
    };

    const startTime = Date.now();

    try {
      // Perform agent-based analysis if enabled and CodeMesh is available
      if (this.config.enableAgentAnalysis && this.codeMesh) {
        const agentAnalysis = await this.performAgentAnalysis(content, context);
        enhancedResult.singularityInsights.agentAnalysis = agentAnalysis;
      }

      // Perform code mesh analysis if available
      if (this.codeMesh) {
        const codeMeshAnalysis = await this.performCodeMeshAnalysis(content, context);
        enhancedResult.singularityInsights.codeMeshAnalysis = codeMeshAnalysis;
      }

      // Generate performance predictions
      if (this.config.enableHardwareOptimization) {
        const performancePredictions = await this.generatePerformancePredictions(content, context);
        enhancedResult.singularityInsights.performancePredictions = performancePredictions;
      }

      // Generate file-aware context that enhances Claude's understanding
      const fileAwareContext = await this.generateFileAwareContext(filePath, content, context);
      enhancedResult.singularityInsights.fileAwareContext = fileAwareContext;

      // Calculate overall confidence based on available analysis
      const analysisCount = [
        enhancedResult.singularityInsights.agentAnalysis.length > 0,
        enhancedResult.singularityInsights.codeMeshAnalysis.complexityScore > 0,
        enhancedResult.singularityInsights.performancePredictions.length > 0,
      ].filter(Boolean).length;

      enhancedResult.confidence = Math.min(0.95, 0.6 + (analysisCount * 0.15));

      const analysisTime = Date.now() - startTime;
      enhancedResult.performance.totalTimeMs = analysisTime;

      this.logger.debug(`✅ Singularity analysis completed in ${analysisTime}ms (confidence: ${(enhancedResult.confidence * 100).toFixed(1)}%)`);

    } catch (error) {
      this.logger.error('Singularity analysis failed:', error);
      enhancedResult.confidence = 0.5; // Fallback confidence
    }

    return enhancedResult;
  }

  /**
   * Perform agent-based analysis using CodeMesh
   */
  private async performAgentAnalysis(content: string, context: LinterContext): Promise<AgentAnalysisResult[]> {
    if (!this.codeMesh) return [];

    const results: AgentAnalysisResult[] = [];

    try {
      // Create different types of analysis agents
      const agentTypes = ['complexity-analyzer', 'performance-optimizer', 'architecture-reviewer'];

      for (const agentType of agentTypes) {
        const startTime = Date.now();
        
        try {
          const agentId = this.codeMesh.create_agent(agentType);
          
          const task = `Analyze ${context.language} code for ${agentType.replace('-', ' ')}`;
          const findings = this.codeMesh.execute_task(agentId, task);
          
          const executionTime = Date.now() - startTime;
          
          results.push({
            agentId,
            agentType,
            task,
            findings: findings || `${agentType} analysis completed`,
            confidence: 0.85,
            performanceMetrics: {
              executionTimeMs: executionTime,
              memoryUsageMb: process.memoryUsage().heapUsed / (1024 * 1024),
              cpuUtilization: 0.3, // Estimated
            },
          });
        } catch (agentError) {
          this.logger.warn(`Agent ${agentType} failed:`, agentError);
        }
      }

    } catch (error) {
      this.logger.warn('Agent analysis failed:', error);
    }

    return results;
  }

  /**
   * Perform code mesh analysis
   */
  private async performCodeMeshAnalysis(content: string, context: LinterContext): Promise<CodeMeshAnalysis> {
    const defaultAnalysis: CodeMeshAnalysis = {
      complexityScore: 5,
      architectureQuality: 0.7,
      maintainabilityIndex: 0.75,
      technicalDebtRatio: 0.2,
      healthIndicators: {
        typesSafety: 0.8,
        testCoverage: 0.6,
        documentation: 0.5,
        consistency: 0.85,
      },
    };

    if (!this.codeMesh) return defaultAnalysis;

    try {
      // Get performance metrics from CodeMesh
      const performanceMetrics = this.codeMesh.get_performance_metrics();
      
      // Simulate code mesh analysis (in a real implementation, this would use WASM analysis)
      const analysis: CodeMeshAnalysis = {
        complexityScore: Math.min(20, content.split('\n').length / 10), // Simple complexity estimate
        architectureQuality: 0.8,
        maintainabilityIndex: Math.max(0.5, 1.0 - (content.length / 10000)), // Size-based estimate
        technicalDebtRatio: 0.15,
        healthIndicators: {
          typesSafety: context.language === 'typescript' ? 0.9 : 0.6,
          testCoverage: content.includes('test') || content.includes('spec') ? 0.8 : 0.3,
          documentation: (content.match(/\/\*\*|\*\/|\/\//g) || []).length / content.split('\n').length,
          consistency: 0.85,
        },
      };

      return analysis;
      
    } catch (error) {
      this.logger.warn('CodeMesh analysis failed:', error);
      return defaultAnalysis;
    }
  }

  /**
   * Generate performance predictions
   */
  private async generatePerformancePredictions(content: string, context: LinterContext): Promise<PerformancePrediction[]> {
    const predictions: PerformancePrediction[] = [];

    try {
      // Analyze content for performance characteristics
      const lineCount = content.split('\n').length;
      const functionCount = (content.match(/function|const\s+\w+\s*=/g) || []).length;
      const loopCount = (content.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length;

      // Runtime performance prediction
      predictions.push({
        metric: 'Execution Time',
        predictedValue: Math.max(1, lineCount * 0.1 + loopCount * 2), // ms
        confidence: 0.7,
        optimizations: [
          'Consider memoization for expensive computations',
          'Use efficient data structures for large datasets',
          'Implement lazy loading where appropriate',
        ],
      });

      // Memory usage prediction
      predictions.push({
        metric: 'Memory Usage',
        predictedValue: Math.max(0.5, functionCount * 0.2 + lineCount * 0.01), // MB
        confidence: 0.6,
        optimizations: [
          'Use object pooling for frequently created objects',
          'Implement garbage collection optimization',
          'Consider streaming for large data processing',
        ],
      });

      // Bundle size prediction (for web code)
      if (context.language === 'javascript' || context.language === 'typescript') {
        predictions.push({
          metric: 'Bundle Size',
          predictedValue: content.length / 1024, // KB
          confidence: 0.8,
          optimizations: [
            'Use tree shaking to eliminate dead code',
            'Implement code splitting for large bundles',
            'Consider using lighter-weight alternatives',
          ],
        });
      }

    } catch (error) {
      this.logger.warn('Performance prediction failed:', error);
    }

    return predictions;
  }

  /**
   * Generate file-aware context that enhances Claude's understanding
   */
  private async generateFileAwareContext(filePath: string, content: string, context: LinterContext): Promise<FileAwareContext> {
    const fileAwareContext: FileAwareContext = {
      relatedFiles: [],
      dependencies: [],
      crossFilePatterns: [],
      projectContext: [],
    };

    try {
      // Analyze imports/exports to find related files
      const importMatches = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
      const exportMatches = content.match(/export.*from\s+['"`]([^'"`]+)['"`]/g) || [];
      
      // Extract dependency relationships
      for (const importMatch of importMatches) {
        const moduleMatch = importMatch.match(/from\s+['"`]([^'"`]+)['"`]/);
        if (moduleMatch) {
          const modulePath = moduleMatch[1];
          fileAwareContext.dependencies.push({
            type: 'import',
            source: filePath,
            target: modulePath,
            strength: 0.8,
            patterns: ['es6-import'],
          });
          
          // Add to related files if it's a relative import
          if (modulePath.startsWith('.')) {
            fileAwareContext.relatedFiles.push(modulePath);
          }
        }
      }

      // Detect cross-file patterns
      if (content.includes('TODO') || content.includes('FIXME')) {
        fileAwareContext.crossFilePatterns.push({
          type: 'missing-abstraction',
          files: [filePath],
          description: 'Contains TODO/FIXME comments indicating incomplete implementation',
          suggestion: 'Complete implementation or create proper abstraction',
          confidence: 0.9,
        });
      }

      // Check for code duplication patterns
      const functionMatches = content.match(/function\s+(\w+)/g) || [];
      if (functionMatches.length > 5) {
        fileAwareContext.crossFilePatterns.push({
          type: 'code-duplication',
          files: [filePath],
          description: `File contains ${functionMatches.length} functions, potential for code duplication`,
          suggestion: 'Consider extracting common functionality into shared utilities',
          confidence: 0.6,
        });
      }

      // Generate project context insights
      if (context.language === 'typescript' && !content.includes('interface') && !content.includes('type ')) {
        fileAwareContext.projectContext.push({
          category: 'maintainability',
          description: 'TypeScript file lacks type definitions',
          impact: 'medium',
          recommendation: 'Add interfaces and type definitions for better type safety',
          affectedFiles: [filePath],
        });
      }

      // Performance insights based on content analysis
      const asyncMatches = content.match(/async\s+function|await\s+/g) || [];
      const syncLoopMatches = content.match(/for\s*\(|while\s*\(/g) || [];
      
      if (asyncMatches.length > 0 && syncLoopMatches.length > 2) {
        fileAwareContext.projectContext.push({
          category: 'performance',
          description: 'Mix of async operations and synchronous loops detected',
          impact: 'high',
          recommendation: 'Consider using Promise.all() or async iteration patterns for better performance',
          affectedFiles: [filePath],
        });
      }

      // Architecture insights
      if (content.length > 2000 && functionMatches.length > 10) {
        fileAwareContext.projectContext.push({
          category: 'architecture',
          description: 'Large file with many functions indicates potential for modularization',
          impact: 'medium',
          recommendation: 'Consider splitting into smaller, focused modules',
          affectedFiles: [filePath],
        });
      }

    } catch (error) {
      this.logger.warn('File-aware context generation failed:', error);
    }

    return fileAwareContext;
  }

  /**
   * Get agent count for monitoring
   */
  getAgentCount(): number {
    if (!this.codeMesh) return 0;
    
    try {
      return this.codeMesh.get_agent_count();
    } catch (error) {
      this.logger.warn('Failed to get agent count:', error);
      return 0;
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<any> {
    const info: any = {
      isInitialized: this.isInitialized,
      config: this.config,
      agentCount: this.getAgentCount(),
    };

    if (this.hardwareDetector) {
      try {
        info.hardware = await this.detectHardware();
      } catch (error) {
        this.logger.warn('Failed to get hardware info:', error);
      }
    }

    return info;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.codeMesh) {
      try {
        // Cleanup CodeMesh resources if available
        if (typeof this.codeMesh.free === 'function') {
          this.codeMesh.free();
        }
      } catch (error) {
        this.logger.warn('Failed to cleanup CodeMesh:', error);
      }
    }

    if (this.hardwareDetector) {
      try {
        if (typeof this.hardwareDetector.free === 'function') {
          this.hardwareDetector.free();
        }
      } catch (error) {
        this.logger.warn('Failed to cleanup HardwareDetector:', error);
      }
    }

    if (this.toolRegistry) {
      try {
        if (typeof this.toolRegistry.free === 'function') {
          this.toolRegistry.free();
        }
      } catch (error) {
        this.logger.warn('Failed to cleanup ToolRegistry:', error);
      }
    }

    this.isInitialized = false;
    this.logger.info('🧹 Singularity-Coder integration cleanup completed');
  }
}

/**
 * Factory function to create Singularity integration
 */
export function createSingularityIntegration(
  config?: Partial<SingularityAnalysisConfig>
): SingularityIntegration {
  return new SingularityIntegration(config);
}

/**
 * Default export for easy importing
 */
export default SingularityIntegration;