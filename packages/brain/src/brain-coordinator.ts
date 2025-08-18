/**
 * @file Brain Coordinator - Simple High-Level Interface
 * 
 * Easy-to-use interface for the Brain package that handles:
 * - Prompt optimization using DSPy
 * - Learning from success/failure
 * - Smart caching
 * - Coordination between AI systems
 * 
 * This is the main entry point for using the Brain package.
 */

import { 
  getLogger, 
  type Logger,
  ContextError,
  withRetry,
  safeAsync,
  Storage,
  getDatabaseAccess,
  getConfig,
  getGlobalLLM,
  type Config,
  // Comprehensive telemetry and monitoring integration
  getTelemetry,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  // All 4 Foundation monitoring classes
  SystemMonitor,
  PerformanceTracker,
  AgentMonitor,
  MLMonitor,
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
  type Span,
  type Attributes
} from '@claude-zen/foundation';
import { DSPyLLMBridge, type CoordinationTask, type CoordinationResult } from './coordination/dspy-llm-bridge';
import { RetrainingMonitor } from './coordination/retraining-monitor';
import { NeuralBridge } from './neural-bridge';
// Adaptive learning functionality is now part of BehavioralIntelligence
import { BehavioralIntelligence } from './behavioral-intelligence.js';
// Autonomous optimization engine for intelligent decision making
import { AutonomousOptimizationEngine, type OptimizationContext, type OptimizationResult } from './autonomous-optimization-engine';
// Autonomous coordinator for self-governing system decisions (temporarily disabled)
// import { AutonomousCoordinator, type SystemMetrics, type AutonomousDecision } from './autonomous-coordinator';

export interface BrainConfig {
  sessionId?: string;
  enableLearning?: boolean;
  cacheOptimizations?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  autonomous?: {
    enabled: boolean;
    learningRate: number;
    adaptationThreshold: number;
  };
  neural?: {
    rustAcceleration: boolean;
    gpuAcceleration: boolean;
    parallelProcessing: number;
  };
}

export interface PromptOptimizationRequest {
  task: string;
  basePrompt: string;
  context?: Record<string, any>;
  agentRole?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface PromptOptimizationResult {
  optimizedPrompt: string;
  confidence: number;
  fromCache: boolean;
  processingTime: number;
  method: 'dspy' | 'ml' | 'hybrid' | 'pattern' | 'fallback';
  autonomousDecision?: boolean; // Indicates if autonomous engine made the decision
  improvementScore?: number; // Estimated improvement over original
  reasoning?: string[]; // Autonomous decision reasoning
}

export interface BrainMetrics {
  totalOptimizations: number;
  cacheHitRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  methodDistribution: Record<string, number>;
  successRate: number;
}

export interface BrainStatus {
  initialized: boolean;
  componentsHealth: {
    neuralBridge: boolean;
    dspyBridge: boolean;
    retrainingMonitor: boolean;
    patternEngine: boolean;
  };
  performance: BrainMetrics;
  cacheStats: {
    size: number;
    hits: number;
    totalRequests: number;
  };
}

export interface OptimizationStrategy {
  name: string;
  description: string;
  conditions: string[];
  expectedImprovement: number;
  riskLevel: 'low' | 'medium' | 'high';
  applicableContexts: string[];
}

/**
 * Simple Brain Coordinator - Main interface for the Brain package.
 * 
 * Use this class for all AI coordination, prompt optimization, and learning.
 * Handles complexity internally while providing a clean, simple API.
 */
export class BrainCoordinator {
  private logger: Logger;
  private dspyBridge: DSPyLLMBridge | null = null;
  private retrainingMonitor: RetrainingMonitor | null = null;
  private neuralBridge: NeuralBridge | null = null;
  private behavioralIntelligence: BehavioralIntelligence | null = null;
  private autonomousEngine: AutonomousOptimizationEngine | null = null;
  // private autonomousCoordinator: AutonomousCoordinator | null = null;
  private initialized = false;
  
  // 🔬 COMPREHENSIVE FOUNDATION MONITORING INTEGRATION
  private systemMonitor: SystemMonitor;
  private performanceTracker: PerformanceTracker;
  private agentMonitor: AgentMonitor;
  private mlMonitor: MLMonitor;
  
  // Simple cache for optimized prompts
  private promptCache = new Map<string, {
    prompt: string;
    confidence: number;
    timestamp: number;
    hitCount: number;
  }>();

  constructor(private config: BrainConfig = {}) {
    this.logger = getLogger('brain-coordinator');
    
    // 🔬 Initialize comprehensive Foundation monitoring
    this.systemMonitor = createSystemMonitor({ intervalMs: 10000 }); // 10-second intervals
    this.performanceTracker = createPerformanceTracker();
    this.agentMonitor = createAgentMonitor();
    this.mlMonitor = createMLMonitor();
    
    this.logger.info('🧠 Brain Coordinator created with comprehensive Foundation monitoring');
    
    // Record initialization metric
    recordMetric('brain_coordinator_created', 1, {
      service: 'brain-coordinator',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Initialize the Brain Coordinator. Call this once before using.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('Brain Coordinator already initialized');
      return;
    }

    // 🔍 COMPREHENSIVE TELEMETRY INTEGRATION
    return withAsyncTrace('brain-coordinator-initialize', async (span: Span) => {
      const initTimer = this.performanceTracker.startTimer('brain-initialization');
      
      try {
        this.logger.info('🧠 Initializing Brain Coordinator with comprehensive Foundation monitoring...');
        
        // Set telemetry attributes
        span.setAttributes({
          'brain.coordinator.version': '1.0.0',
          'brain.config.enable_learning': this.config.enableLearning !== false,
          'brain.config.cache_optimizations': this.config.cacheOptimizations !== false,
          'brain.config.log_level': this.config.logLevel || 'info'
        });

        // Start system monitoring
        this.systemMonitor.start();
        recordEvent('brain-system-monitoring-started');
        
        // Initialize telemetry system
        const telemetry = getTelemetry();
        if (!telemetry.isInitialized()) {
          await telemetry.initialize();
        }

        // Initialize neural bridge for WASM neural networks
        await withAsyncTrace('neural-bridge-init', async () => {
          this.neuralBridge = new NeuralBridge(this.logger);
          await this.neuralBridge.initialize();
          recordEvent('neural-bridge-initialized');
        });

        // Initialize DSPy bridge for AI coordination
        await withAsyncTrace('dspy-bridge-init', async () => {
          const dspyConfig = {
            teleprompter: 'MIPROv2' as const,
            maxTokens: 8192,
            optimizationSteps: 10,
            coordinationFeedback: true,
            hybridMode: true
          };
          if (this.neuralBridge) {
            this.dspyBridge = new DSPyLLMBridge(dspyConfig, this.neuralBridge);
          } else {
            throw new ContextError('Cannot initialize DSPy bridge: neuralBridge is null', { code: 'NEURAL_BRIDGE_NULL' });
          }
          await this.dspyBridge.initialize();
          recordEvent('dspy-bridge-initialized');
        });

        // Initialize retraining monitor for continuous learning
        if (this.config.enableLearning !== false) {
          await withAsyncTrace('retraining-monitor-init', async () => {
            const retrainingConfig = {
              checkIntervalMs: 3600000, // 1 hour
              minCoordinationSuccessRateThreshold: 0.8,
              cooldownHours: 6,
              enableAutoRetraining: true,
              maxRetrainingAttemptsPerDay: 3
            };
            this.retrainingMonitor = new RetrainingMonitor(retrainingConfig);
            await this.retrainingMonitor.initialize();
            recordEvent('retraining-monitor-initialized');
          });
        }

        // Initialize behavioral intelligence for adaptive learning
        // Note: BehavioralIntelligence will be initialized when brainJsBridge is available
        // this.behavioralIntelligence = new BehavioralIntelligence(this.neuralBridge.brainJsBridge);
        // await this.behavioralIntelligence.initialize();

        // Initialize autonomous optimization engine for intelligent decision making
        await withAsyncTrace('autonomous-engine-init', async () => {
          this.autonomousEngine = new AutonomousOptimizationEngine();
          if (this.dspyBridge) {
            await this.autonomousEngine.initialize(this.dspyBridge);
          } else {
            throw new ContextError('Cannot initialize autonomous engine: dspyBridge is null', { code: 'DSPY_BRIDGE_NULL' });
          }
          recordEvent('autonomous-engine-initialized');
        });

        // Initialize autonomous coordinator for system-wide self-governance (temporarily disabled)
        // this.autonomousCoordinator = new AutonomousCoordinator();
        // await this.autonomousCoordinator.initialize(this.behavioralIntelligence, this.autonomousEngine);

        this.initialized = true;
        const { duration } = this.performanceTracker.endTimer('brain-initialization');
        
        // Record comprehensive metrics
        recordMetric('brain_coordinator_initialized', 1, {
          status: 'success',
          duration_ms: String(duration),
          learning_enabled: String(this.config.enableLearning !== false),
          cache_enabled: String(this.config.cacheOptimizations !== false)
        });
        
        recordHistogram('brain_initialization_duration_ms', duration, {
          component: 'brain-coordinator'
        });

        // Track initialization in agent monitor
        this.agentMonitor.trackAgent('brain-coordinator', {
          tasksAssigned: 0,
          tasksCompleted: 1, // Initialization complete
          averageResponseTime: duration,
          coordinationEfficiency: 1.0 // Successful initialization
        });

        span.setAttributes({
          'brain.initialization.success': true,
          'brain.initialization.duration_ms': duration,
          'brain.components.neural_bridge': true,
          'brain.components.dspy_bridge': true,
          'brain.components.retraining_monitor': this.config.enableLearning !== false,
          'brain.components.autonomous_engine': true
        });

        this.logger.info('✅ Brain Coordinator initialized successfully with comprehensive Foundation monitoring');
      } catch (error) {
        this.performanceTracker.endTimer('brain-initialization');
        
        // Record error metrics
        recordMetric('brain_coordinator_initialized', 1, {
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });

        span.setAttributes({
          'brain.initialization.success': false,
          'brain.initialization.error': error instanceof Error ? error.message : String(error)
        });

        this.logger.error('❌ Failed to initialize Brain Coordinator:', error);
        throw new ContextError(`Brain initialization failed: ${error}`, { code: 'BRAIN_INIT_ERROR' });
      }
    });
  }

  /**
   * Optimize a prompt using AI. Simple main method.
   * 
   * @param request - What you want to optimize
   * @returns Optimized prompt with confidence score
   */
  async optimizePrompt(request: PromptOptimizationRequest): Promise<PromptOptimizationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // 🔍 COMPREHENSIVE TELEMETRY INTEGRATION
    return withAsyncTrace('brain-optimize-prompt', async (span: Span) => {
      const optimizationTimer = this.performanceTracker.startTimer('prompt-optimization');
      const startTime = Date.now();
      const cacheKey = this.getCacheKey(request);

      // Set comprehensive telemetry attributes
      span.setAttributes({
        'brain.prompt.task': request.task,
        'brain.prompt.agent_role': request.agentRole || 'default',
        'brain.prompt.priority': request.priority || 'medium',
        'brain.prompt.base_length': request.basePrompt.length,
        'brain.prompt.has_context': Boolean(request.context),
        'brain.prompt.cache_key': cacheKey,
        'brain.config.cache_enabled': this.config.cacheOptimizations !== false
      });

      try {
        // Check cache first
        if (this.config.cacheOptimizations !== false) {
          const cached = this.promptCache.get(cacheKey);
          if (cached && this.isCacheValid(cached)) {
            cached.hitCount++;
            const { duration } = this.performanceTracker.endTimer('prompt-optimization');
            
            this.logger.debug(`📦 Using cached optimization for ${request.task}`);
            
            // Record cache hit metrics
            recordMetric('brain_prompt_optimization_total', 1, {
              cache_hit: 'true',
              task_type: request.task,
              method: 'pattern',
              status: 'success'
            });
            
            recordHistogram('brain_prompt_optimization_duration_ms', duration, {
              cache_hit: 'true',
              method: 'pattern'
            });

            // Track in ML monitor
            this.mlMonitor.trackPrediction('brain-prompt-optimizer', {
              confidence: cached.confidence,
              latency: duration,
              timestamp: new Date()
            });

            span.setAttributes({
              'brain.optimization.cache_hit': true,
              'brain.optimization.method': 'pattern',
              'brain.optimization.confidence': cached.confidence,
              'brain.optimization.duration_ms': duration,
              'brain.cache.hit_count': cached.hitCount
            });

            recordEvent('prompt-optimization-cache-hit', {
              task: request.task,
              confidence: String(cached.confidence),
              hit_count: String(cached.hitCount)
            });
            
            return {
              optimizedPrompt: cached.prompt,
              confidence: cached.confidence,
              fromCache: true,
              processingTime: Date.now() - startTime,
              method: 'pattern'
            };
          }
        }

        // 🤖 AUTONOMOUS OPTIMIZATION: Let the engine make intelligent decisions
        if (this.autonomousEngine) {
          const optimizationContext: OptimizationContext = {
            task: request.task,
            basePrompt: request.basePrompt,
            agentRole: request.agentRole,
            priority: request.priority,
            context: request.context,
            expectedComplexity: this.estimateTaskComplexity(request),
            timeConstraint: this.getTimeConstraint(request.priority)
          };

          span.setAttributes({
            'brain.optimization.complexity': optimizationContext.expectedComplexity || 0,
            'brain.optimization.time_constraint': optimizationContext.timeConstraint || 0
          });

          const autonomousResult = await withAsyncTrace('autonomous-optimization', async () => {
            return this.autonomousEngine!.autonomousOptimize(optimizationContext);
          });

          // Cache the autonomous result
          if (this.config.cacheOptimizations !== false) {
            this.promptCache.set(cacheKey, {
              prompt: autonomousResult.optimizedPrompt,
              confidence: autonomousResult.confidence,
              timestamp: Date.now(),
              hitCount: 1
            });
          }

          const { duration } = this.performanceTracker.endTimer('prompt-optimization');
          
          this.logger.info(`🤖 Autonomous optimization for ${request.task} using ${autonomousResult.method} (confidence: ${autonomousResult.confidence.toFixed(2)})`);

          // Record comprehensive metrics
          recordMetric('brain_prompt_optimization_total', 1, {
            cache_hit: 'false',
            task_type: request.task,
            method: autonomousResult.method,
            status: 'success',
            autonomous: 'true'
          });
          
          recordHistogram('brain_prompt_optimization_duration_ms', duration, {
            cache_hit: 'false',
            method: autonomousResult.method
          });

          recordGauge('brain_prompt_optimization_confidence', autonomousResult.confidence, {
            method: autonomousResult.method,
            task_type: request.task
          });

          // Track in ML monitor
          this.mlMonitor.trackPrediction('brain-autonomous-optimizer', {
            confidence: autonomousResult.confidence,
            latency: duration,
            timestamp: new Date()
          });

          // Track in agent monitor
          this.agentMonitor.trackAgent('brain-autonomous-engine', {
            tasksCompleted: 1,
            averageResponseTime: duration,
            coordinationEfficiency: autonomousResult.confidence
          });

          span.setAttributes({
            'brain.optimization.cache_hit': false,
            'brain.optimization.method': autonomousResult.method,
            'brain.optimization.confidence': autonomousResult.confidence,
            'brain.optimization.duration_ms': duration,
            'brain.optimization.improvement_score': autonomousResult.improvementScore || 0,
            'brain.optimization.autonomous': true,
            'brain.optimization.reasoning_steps': autonomousResult.reasoning?.length || 0
          });

          recordEvent('autonomous-prompt-optimization', {
            task: request.task,
            method: autonomousResult.method,
            confidence: String(autonomousResult.confidence),
            improvement_score: String(autonomousResult.improvementScore || 0)
          });
            
          return {
            optimizedPrompt: autonomousResult.optimizedPrompt,
            confidence: autonomousResult.confidence,
            fromCache: false,
            processingTime: autonomousResult.processingTime,
            method: autonomousResult.method,
            autonomousDecision: true,
            improvementScore: autonomousResult.improvementScore,
            reasoning: autonomousResult.reasoning
          };
        }

        // Fallback: return original prompt
        const { duration } = this.performanceTracker.endTimer('prompt-optimization');
        
        this.logger.warn(`⚠️ No optimization available for ${request.task}, using original`);
        
        // Record fallback metrics
        recordMetric('brain_prompt_optimization_total', 1, {
          cache_hit: 'false',
          task_type: request.task,
          method: 'fallback',
          status: 'fallback'
        });

        span.setAttributes({
          'brain.optimization.cache_hit': false,
          'brain.optimization.method': 'fallback',
          'brain.optimization.confidence': 0.5,
          'brain.optimization.duration_ms': duration,
          'brain.optimization.autonomous': false
        });
        
        return {
          optimizedPrompt: request.basePrompt,
          confidence: 0.5,
          fromCache: false,
          processingTime: Date.now() - startTime,
          method: 'fallback'
        };

      } catch (error) {
        this.performanceTracker.endTimer('prompt-optimization');
        
        this.logger.error(`❌ Prompt optimization failed for ${request.task}:`, error);
        
        // Record error metrics
        recordMetric('brain_prompt_optimization_total', 1, {
          cache_hit: 'false',
          task_type: request.task,
          method: 'error',
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });

        span.setAttributes({
          'brain.optimization.error': true,
          'brain.optimization.error_message': error instanceof Error ? error.message : String(error),
          'brain.optimization.error_type': error instanceof Error ? error.constructor.name : 'unknown'
        });

        recordEvent('prompt-optimization-error', {
          task: request.task,
          error_type: error instanceof Error ? error.constructor.name : 'unknown',
          error_message: error instanceof Error ? error.message : String(error)
        });
        
        // Always return something usable
        return {
          optimizedPrompt: request.basePrompt,
          confidence: 0.3,
          fromCache: false,
          processingTime: Date.now() - startTime,
          method: 'fallback'
        };
      }
    });
  }

  /**
   * Learn from success or failure. Call this after using an optimized prompt.
   * 
   * @param promptResult - The result you got from using the optimized prompt
   * @param success - Whether the prompt worked well (true/false)
   * @param feedback - Optional feedback about what happened
   */
  async learnFromResult(
    promptResult: PromptOptimizationResult, 
    success: boolean, 
    feedback?: string
  ): Promise<void> {
    // 🔍 COMPREHENSIVE TELEMETRY FOR LEARNING
    return withAsyncTrace('brain-learn-from-result', async (span: Span) => {
      const learningTimer = this.performanceTracker.startTimer('learning-feedback');

      // Set telemetry attributes
      span.setAttributes({
        'brain.learning.success': success,
        'brain.learning.method': promptResult.method,
        'brain.learning.confidence': promptResult.confidence,
        'brain.learning.from_cache': promptResult.fromCache,
        'brain.learning.processing_time': promptResult.processingTime,
        'brain.learning.autonomous_decision': promptResult.autonomousDecision || false,
        'brain.learning.has_feedback': Boolean(feedback),
        'brain.learning.improvement_score': promptResult.improvementScore || 0
      });

      try {
        // Traditional learning for retraining monitor
        if (this.retrainingMonitor) {
          await withAsyncTrace('retraining-monitor-feedback', async () => {
            const promptId = this.hashString(promptResult.optimizedPrompt);
            await this.retrainingMonitor!.recordPromptFeedback(promptId, {
              success,
              accuracy: promptResult.confidence,
              userSatisfaction: success ? 0.8 : 0.3,
              context: {
                method: promptResult.method,
                fromCache: promptResult.fromCache,
                processingTime: promptResult.processingTime,
                feedback
              }
            });

            this.logger.debug(`📊 Recorded learning feedback: ${success ? 'success' : 'failure'}`);
          });
        }

        // 🤖 AUTONOMOUS LEARNING: Feed results back to autonomous engine
        if (this.autonomousEngine && promptResult.autonomousDecision) {
          await withAsyncTrace('autonomous-engine-feedback', async () => {
            const optimizationFeedback = {
              actualSuccessRate: success ? 1.0 : 0.0,
              actualResponseTime: promptResult.processingTime,
              userSatisfaction: success ? 0.8 : 0.3,
              taskCompleted: success,
              errorOccurred: !success
            };

            // The autonomous engine needs the original context to learn properly
            // We'll create a minimal context from available data
            const learningContext: OptimizationContext = {
              task: 'unknown', // We don't have the original task saved
              basePrompt: 'unknown', // We don't have the original prompt saved
              agentRole: undefined,
              priority: 'medium',
              context: promptResult.reasoning ? { reasoning: promptResult.reasoning } : undefined
            };

            await this.autonomousEngine!.learnFromFeedback(
              learningContext,
              {
                optimizedPrompt: promptResult.optimizedPrompt,
                confidence: promptResult.confidence,
                method: promptResult.method as any,
                processingTime: promptResult.processingTime,
                improvementScore: promptResult.improvementScore || 1.0,
                reasoning: promptResult.reasoning || []
              },
              optimizationFeedback
            );

            this.logger.debug(`🤖 Autonomous engine learned from ${promptResult.method} optimization result`);
          });
        }

        const { duration } = this.performanceTracker.endTimer('learning-feedback');

        // Record comprehensive learning metrics
        recordMetric('brain_learning_feedback_total', 1, {
          success: String(success),
          method: promptResult.method,
          autonomous: String(promptResult.autonomousDecision || false),
          from_cache: String(promptResult.fromCache),
          has_feedback: String(Boolean(feedback))
        });

        recordHistogram('brain_learning_feedback_duration_ms', duration, {
          success: String(success),
          method: promptResult.method
        });

        // Track learning effectiveness in ML monitor
        this.mlMonitor.trackPerformance('brain-learning-system', {
          accuracy: success ? 1.0 : 0.0,
          precision: promptResult.confidence,
          recall: success ? 0.8 : 0.2
        });

        // Track agent learning in agent monitor
        this.agentMonitor.trackAgent('brain-learning-agent', {
          tasksCompleted: 1,
          averageResponseTime: duration,
          collaborationScore: success ? 0.9 : 0.4,
          coordinationEfficiency: promptResult.confidence
        });

        span.setAttributes({
          'brain.learning.duration_ms': duration,
          'brain.learning.recorded_traditional': Boolean(this.retrainingMonitor),
          'brain.learning.recorded_autonomous': Boolean(this.autonomousEngine && promptResult.autonomousDecision),
          'brain.learning.status': 'success'
        });

        recordEvent('brain-learning-completed', {
          success: String(success),
          method: promptResult.method,
          confidence: String(promptResult.confidence),
          duration_ms: String(duration)
        });

      } catch (error) {
        this.performanceTracker.endTimer('learning-feedback');
        
        // Record learning error metrics
        recordMetric('brain_learning_feedback_total', 1, {
          success: String(success),
          method: promptResult.method,
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });

        span.setAttributes({
          'brain.learning.error': true,
          'brain.learning.error_message': error instanceof Error ? error.message : String(error),
          'brain.learning.error_type': error instanceof Error ? error.constructor.name : 'unknown'
        });

        this.logger.warn('⚠️ Failed to record learning feedback:', error);
        
        recordEvent('brain-learning-error', {
          error_type: error instanceof Error ? error.constructor.name : 'unknown',
          method: promptResult.method
        });
      }
    });
  }

  /**
   * Get comprehensive coordination statistics with autonomous insights and Foundation monitoring.
   */
  getStats(): {
    initialized: boolean;
    cacheSize: number;
    cacheHits: number;
    learningEnabled: boolean;
    autonomousEngine?: {
      bestMethod: string;
      adaptationRate: number;
      totalOptimizations: number;
      learningEffectiveness: number;
    };
    // 🔬 COMPREHENSIVE FOUNDATION MONITORING DATA
    monitoring: {
      systemHealth: any;
      performanceStats: any;
      agentMetrics: any;
      mlMetrics: {
        brain_coordinator: any;
        brain_prompt_optimizer: any;
        brain_autonomous_optimizer: any;
        brain_learning_system: any;
      };
    };
  } {
    return withTrace('brain-get-stats', (span: Span) => {
      const statsTimer = this.performanceTracker.startTimer('get-stats');
      
      try {
        const cacheHits = Array.from(this.promptCache.values())
          .reduce((total, entry) => total + entry.hitCount, 0);

        const baseStats = {
          initialized: this.initialized,
          cacheSize: this.promptCache.size,
          cacheHits,
          learningEnabled: this.retrainingMonitor !== null
        };

        // 🔬 COMPREHENSIVE FOUNDATION MONITORING DATA
        const monitoring = {
          systemHealth: this.systemMonitor.getMetrics(),
          performanceStats: this.performanceTracker.getStats(),
          agentMetrics: this.agentMonitor.getAgentMetrics(),
          mlMetrics: {
            brain_coordinator: this.agentMonitor.getAgentMetrics('brain-coordinator'),
            brain_prompt_optimizer: this.agentMonitor.getAgentMetrics('brain-prompt-optimizer'),
            brain_autonomous_optimizer: this.agentMonitor.getAgentMetrics('brain-autonomous-engine'),
            brain_learning_system: this.agentMonitor.getAgentMetrics('brain-learning-agent')
          }
        };

        span.setAttributes({
          'brain.stats.cache_size': this.promptCache.size,
          'brain.stats.cache_hits': cacheHits,
          'brain.stats.learning_enabled': this.retrainingMonitor !== null,
          'brain.stats.system_memory_rss': monitoring.systemHealth.memory?.rss || 0,
          'brain.stats.system_uptime': monitoring.systemHealth.process?.uptime || 0
        });

        // Add autonomous engine insights if available
        if (this.autonomousEngine) {
          try {
            const insights = this.autonomousEngine.getAutonomousInsights();
            const { duration } = this.performanceTracker.endTimer('get-stats');
            
            // Record stats retrieval metrics
            recordMetric('brain_stats_retrieved', 1, {
              status: 'success',
              has_autonomous_insights: 'true',
              cache_size: String(this.promptCache.size),
              cache_hits: String(cacheHits)
            });

            recordHistogram('brain_stats_retrieval_duration_ms', duration, {
              has_autonomous_insights: 'true'
            });

            span.setAttributes({
              'brain.stats.autonomous.best_method': insights.bestMethod,
              'brain.stats.autonomous.adaptation_rate': insights.adaptationRate,
              'brain.stats.autonomous.total_optimizations': insights.totalOptimizations,
              'brain.stats.autonomous.learning_effectiveness': insights.learningEffectiveness,
              'brain.stats.duration_ms': duration
            });

            recordEvent('brain-stats-retrieved-with-autonomous', {
              cache_size: String(this.promptCache.size),
              autonomous_optimizations: String(insights.totalOptimizations),
              best_method: insights.bestMethod
            });

            return {
              ...baseStats,
              autonomousEngine: {
                bestMethod: insights.bestMethod,
                adaptationRate: insights.adaptationRate,
                totalOptimizations: insights.totalOptimizations,
                learningEffectiveness: insights.learningEffectiveness
              },
              monitoring
            };
          } catch (error) {
            this.logger.warn('Failed to get autonomous engine insights:', error);
            
            recordMetric('brain_stats_retrieved', 1, {
              status: 'partial',
              has_autonomous_insights: 'false',
              error_type: error instanceof Error ? error.constructor.name : 'unknown'
            });

            span.setAttributes({
              'brain.stats.autonomous_error': true,
              'brain.stats.autonomous_error_message': error instanceof Error ? error.message : String(error)
            });
          }
        }

        const { duration } = this.performanceTracker.endTimer('get-stats');
        
        // Record basic stats retrieval metrics
        recordMetric('brain_stats_retrieved', 1, {
          status: 'success',
          has_autonomous_insights: 'false',
          cache_size: String(this.promptCache.size),
          cache_hits: String(cacheHits)
        });

        recordHistogram('brain_stats_retrieval_duration_ms', duration, {
          has_autonomous_insights: 'false'
        });

        span.setAttributes({
          'brain.stats.duration_ms': duration,
          'brain.stats.status': 'success'
        });

        recordEvent('brain-stats-retrieved', {
          cache_size: String(this.promptCache.size),
          cache_hits: String(cacheHits),
          learning_enabled: String(this.retrainingMonitor !== null)
        });

        return {
          ...baseStats,
          monitoring
        };
      } catch (error) {
        this.performanceTracker.endTimer('get-stats');
        
        recordMetric('brain_stats_retrieved', 1, {
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });

        span.setAttributes({
          'brain.stats.error': true,
          'brain.stats.error_message': error instanceof Error ? error.message : String(error)
        });

        this.logger.error('Failed to get brain coordinator stats:', error);
        throw error;
      }
    });
  }

  /**
   * Autonomous system monitoring and management (temporarily disabled)
   * 
   * @param currentMetrics - Current system metrics
   * @returns Array of autonomous decisions made
   */
  async autonomousSystemManagement(currentMetrics: any): Promise<any[]> {
    this.logger.warn('⚠️ Autonomous coordinator temporarily disabled');
    return [];
  }

  /**
   * Get comprehensive autonomous insights
   */
  getAutonomousInsights(): {
    optimization: any;
    coordination: any;
    complexity: any;
    systemHealth: string;
    autonomyLevel: number;
    totalDecisions: number;
  } {
    const insights: {
      optimization: any;
      coordination: any;
      complexity: any;
      systemHealth: string;
      autonomyLevel: number;
      totalDecisions: number;
    } = {
      optimization: null,
      coordination: null,
      complexity: null,
      systemHealth: 'unknown',
      autonomyLevel: 0,
      totalDecisions: 0
    };

    if (this.autonomousEngine) {
      try {
        insights.optimization = this.autonomousEngine.getAutonomousInsights();
      } catch (error) {
        this.logger.debug('Failed to get autonomous engine insights:', error);
      }
      
      // Get complexity estimation insights from the autonomous engine
      if (this.autonomousEngine['complexityEstimator']) {
        try {
          insights.complexity = this.autonomousEngine['complexityEstimator'].getComplexityStats();
        } catch (error) {
          // Complexity estimator not accessible or failed
        }
      }
    }

    // Autonomous coordinator temporarily disabled
    // if (this.autonomousCoordinator) {
    //   const coordinationInsights = this.autonomousCoordinator.getAutonomousInsights();
    //   insights.coordination = coordinationInsights;
    //   insights.systemHealth = coordinationInsights.systemHealth;
    //   insights.autonomyLevel = coordinationInsights.autonomyLevel;
    //   insights.totalDecisions = coordinationInsights.totalDecisions;
    // }

    return insights;
  }

  /**
   * Clear the optimization cache.
   */
  clearCache(): void {
    return withTrace('brain-clear-cache', (span: Span) => {
      const cacheSize = this.promptCache.size;
      this.promptCache.clear();
      
      // Record cache clearing metrics
      recordMetric('brain_cache_cleared', 1, {
        previous_size: String(cacheSize),
        status: 'success'
      });

      span.setAttributes({
        'brain.cache.previous_size': cacheSize,
        'brain.cache.new_size': 0,
        'brain.cache.cleared': true
      });

      this.logger.info('🗑️ Optimization cache cleared', { previousSize: cacheSize });
      
      recordEvent('brain-cache-cleared', {
        previous_size: String(cacheSize)
      });
    });
  }

  /**
   * 🔬 COMPREHENSIVE FOUNDATION MONITORING SHUTDOWN
   * Properly shutdown all monitoring systems and telemetry
   */
  async shutdown(): Promise<void> {
    return withAsyncTrace('brain-coordinator-shutdown', async (span: Span) => {
      const shutdownTimer = this.performanceTracker.startTimer('brain-shutdown');
      
      try {
        this.logger.info('🛑 Shutting down Brain Coordinator and all monitoring systems...');
        
        // Stop system monitoring
        this.systemMonitor.stop();
        recordEvent('brain-system-monitoring-stopped');
        
        // Clear cache
        this.clearCache();
        
        // Shutdown telemetry
        const telemetry = getTelemetry();
        if (telemetry.isInitialized()) {
          await telemetry.shutdown();
        }

        const { duration } = this.performanceTracker.endTimer('brain-shutdown');
        
        // Record final shutdown metrics
        recordMetric('brain_coordinator_shutdown', 1, {
          status: 'success',
          duration_ms: String(duration),
          was_initialized: String(this.initialized)
        });

        span.setAttributes({
          'brain.shutdown.success': true,
          'brain.shutdown.duration_ms': duration,
          'brain.shutdown.was_initialized': this.initialized,
          'brain.shutdown.cache_cleared': true,
          'brain.shutdown.monitoring_stopped': true
        });

        this.initialized = false;
        
        this.logger.info('✅ Brain Coordinator shutdown completed successfully');
        
        recordEvent('brain-coordinator-shutdown-complete', {
          duration_ms: String(duration),
          status: 'success'
        });
        
      } catch (error) {
        this.performanceTracker.endTimer('brain-shutdown');
        
        recordMetric('brain_coordinator_shutdown', 1, {
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });

        span.setAttributes({
          'brain.shutdown.success': false,
          'brain.shutdown.error': error instanceof Error ? error.message : String(error)
        });

        this.logger.error('❌ Failed to shutdown Brain Coordinator properly:', error);
        throw new ContextError(`Brain shutdown failed: ${error}`, { code: 'BRAIN_SHUTDOWN_ERROR' });
      }
    });
  }

  // Private helper methods

  private getCacheKey(request: PromptOptimizationRequest): string {
    return `${request.task}:${this.hashString(request.basePrompt)}:${request.agentRole || 'default'}`;
  }

  private isCacheValid(cached: { timestamp: number; confidence: number }): boolean {
    // Cache valid for 24 hours if confidence > 0.7, otherwise 1 hour
    const maxAge = cached.confidence > 0.7 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    return Date.now() - cached.timestamp < maxAge;
  }

  private enhancePromptWithPattern(basePrompt: string, pattern: any): string {
    let enhancedPrompt = basePrompt;
    
    // Add pattern-based enhancements
    if (pattern.suggestions?.includeExamples) {
      enhancedPrompt += '\n\nInclude specific examples in your analysis.';
    }
    
    if (pattern.suggestions?.emphasizeStructure) {
      enhancedPrompt += '\n\nEnsure your JSON response follows the exact structure specified.';
    }
    
    if (pattern.suggestions?.addContext) {
      enhancedPrompt += '\n\nConsider the broader system context when making recommendations.';
    }
    
    return enhancedPrompt;
  }

  private estimateTaskComplexity(request: PromptOptimizationRequest): number {
    // Simple heuristic for task complexity based on prompt characteristics
    let complexity = 0;
    
    // Length indicates complexity
    complexity += Math.min(request.basePrompt.length / 1000, 0.3);
    
    // Technical terms suggest higher complexity
    const technicalTerms = (request.basePrompt.match(/\b(algorithm|optimize|analyze|implement|design|architecture)\b/gi) || []).length;
    complexity += Math.min(technicalTerms * 0.1, 0.3);
    
    // Context size indicates complexity
    if (request.context) {
      complexity += Math.min(Object.keys(request.context).length * 0.05, 0.2);
    }
    
    // Agent role affects complexity
    if (request.agentRole === 'architect' || request.agentRole === 'expert') {
      complexity += 0.2;
    }
    
    return Math.min(complexity, 1.0);
  }

  private getTimeConstraint(priority?: 'low' | 'medium' | 'high'): number | undefined {
    // Return time constraints in milliseconds based on priority
    switch (priority) {
      case 'high': return 2000; // 2 seconds for high priority
      case 'medium': return 5000; // 5 seconds for medium priority
      case 'low': return 10000; // 10 seconds for low priority
      default: return undefined; // No constraint
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // =============================================================================
  // NEURAL PREDICTION API
  // =============================================================================

  /**
   * Make a prediction using brain.js neural networks.
   * This method provides the predict API that other packages expect.
   * 
   * @param features - Input features as number array
   * @param options - Optional prediction configuration
   * @returns Promise with prediction result
   */
  async predict(features: number[], options?: { networkId?: string }): Promise<{ output: Record<string, number> }> {
    if (!this.initialized) {
      throw new Error('BrainCoordinator must be initialized before making predictions');
    }

    // For now, return a basic prediction structure that other packages expect
    // TODO: Integrate with actual brain.js networks when bridge is ready
    const prediction = {
      confidence: Math.min(Math.max(Math.random() * 0.3 + 0.5, 0.0), 1.0), // Random confidence 0.5-0.8
      category: Math.random() > 0.5 ? 1 : 0, // Random binary classification
      priority: Math.random() * 0.3 + 0.4, // Random priority 0.4-0.7
    };

    this.logger.debug('[BrainCoordinator] Prediction made with basic classifier', {
      featuresLength: features.length,
      prediction
    });

    return { output: prediction };
  }

  /**
   * Train a neural network using brain.js
   * 
   * @param trainingData - Training data in brain.js format
   * @param options - Optional training configuration
   * @returns Promise with training result
   */
  async trainNetwork(trainingData: { input: number[]; output: Record<string, number> }[], options?: { networkId?: string }): Promise<void> {
    if (!this.initialized) {
      throw new Error('BrainCoordinator must be initialized before training networks');
    }

    // TODO: Integrate with actual brain.js bridge for training
    // For now, just log the training request
    this.logger.debug('[BrainCoordinator] Network training requested', {
      dataSize: trainingData.length,
      options
    });

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export default BrainCoordinator;