/**
 * @fileoverview Task Analyzer - Simplified Task Analysis System
 *
 * Clean task analysis system that identifies task types and requirements
 * without forcing artificial method selection. Emits events for other
 * systems to handle appropriately.
 *
 * Features:
 * - Task type identification (prompt, ml, coordination, computation)
 * - Complexity estimation and analysis
 * - Pure event-driven communication
 * - No forced method selection
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */

import { getLogger, EventBus, Result, ok, err } from '@claude-zen/foundation';

const logger = getLogger('TaskAnalyzer');

export interface TaskAnalysisRequest {
  readonly taskId: string;
  readonly task: string;
  readonly description?: string;
  readonly context?: Record<string, any>;
  readonly requirements?: {
    needsFastResponse?: boolean;
    needsHighAccuracy?: boolean;
    involvesLLM?: boolean;
    requiresMultipleAgents?: boolean;
  };
}

export interface TaskAnalysisResult {
  readonly taskId: string;
  readonly taskType: 'prompt' | 'ml' | 'coordination' | 'computation';
  readonly complexity: number; // 0-1 scale
  readonly confidence: number;
  readonly reasoning: string[];
  readonly suggestedTools?: string[];
  readonly estimatedDuration?: number;
  readonly keyFactors: string[];
}

export interface TaskAnalysisEvents extends Record<string, unknown> {
  'task:analysis_requested': { request: TaskAnalysisRequest };
  'task:analysis_completed': { result: TaskAnalysisResult };
  'task:analysis_error': { taskId: string; error: string };
  'task:complexity_estimated': { taskId: string; complexity: number };
  'task:type_identified': { taskId: string; taskType: 'prompt' | 'ml' | 'coordination' | 'computation' };
}

/**
 * Simple Task Analyzer - Clean Task Analysis System
 *
 * Focuses purely on analyzing task types and complexity without forcing
 * method selection. Emits events for other systems to handle appropriately.
 *
 * Features:
 * - Task type identification (prompt, ml, coordination, computation)
 * - Complexity estimation (0-1 scale)
 * - Event-driven communication
 * - Clean, focused responsibility
 */
export class TaskAnalyzer extends EventBus<TaskAnalysisEvents> {
  private initialized = false;

  constructor() {
    super();
    logger.info('TaskAnalyzer created');
  }

  /**
   * Initialize the task analyzer
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.initialized) return ok(undefined);

    try {
      logger.info('Initializing TaskAnalyzer...');
      this.initialized = true;
      logger.info('TaskAnalyzer initialized successfully');
      return ok(undefined);
    } catch (error) {
      logger.error('Failed to initialize TaskAnalyzer:', error);
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Analyze a task to determine its type and complexity
   */
  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    if (!this.initialized) {
      throw new Error('TaskAnalyzer not initialized');
    }

    const startTime = Date.now();

    try {
      logger.info(`Analyzing task: "${request.task}"`);

      // Emit analysis requested event
      this.emit('task:analysis_requested', { request });

      // Identify task type
      const taskType = this.identifyTaskType(request.task, request.context);
      this.emit('task:type_identified', { taskId: request.taskId, taskType });

      // Estimate complexity
      const complexity = this.estimateComplexity(request.task, request.context);
      this.emit('task:complexity_estimated', { taskId: request.taskId, complexity });

      // Build analysis result
      const result: TaskAnalysisResult = {
        taskId: request.taskId,
        taskType,
        complexity,
        confidence: this.calculateConfidence(request.task, taskType, complexity),
        reasoning: this.generateReasoning(request.task, taskType, complexity, request.context),
        suggestedTools: this.suggestTools(taskType, complexity),
        estimatedDuration: this.estimateDuration(taskType, complexity),
        keyFactors: this.identifyKeyFactors(request.task, request.context, request.requirements),
      };

      // Emit completion event
      this.emit('task:analysis_completed', { result });

      const processingTime = Date.now() - startTime;
      logger.info(
        `Task analysis complete: type=${taskType}, complexity=${(complexity * 100).toFixed(1)}%, confidence=${result.confidence.toFixed(2)}, time=${processingTime}ms`
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Task analysis failed for ${request.taskId}:`, error);
      
      // Emit error event
      this.emit('task:analysis_error', { taskId: request.taskId, error: errorMessage });
      
      throw error;
    }
  }

  /**
   * Identify the type of task based on its content and context
   */
  identifyTaskType(task: string, context?: any): 'prompt' | 'ml' | 'coordination' | 'computation' {
    const taskLower = task.toLowerCase();

    // ML-related keywords
    const mlKeywords = [
      'train', 'model', 'predict', 'classify', 'regression', 'neural', 'machine learning',
      'dataset', 'features', 'optimize', 'dspy', 'teleprompter', 'bootstrap', 'ensemble'
    ];

    // Coordination-related keywords
    const coordinationKeywords = [
      'coordinate', 'agents', 'workflow', 'orchestrate', 'manage', 'schedule',
      'teamwork', 'collaborate', 'distribute', 'assign', 'delegate', 'safe', 'sparc'
    ];

    // Computation-related keywords
    const computationKeywords = [
      'calculate', 'compute', 'algorithm', 'process', 'analyze', 'transform',
      'parse', 'execute', 'run', 'build', 'compile', 'test'
    ];

    // Check context for additional hints
    const hasMLContext = context?.involvesLLM || context?.needsOptimization || context?.requiresTraining;
    const hasCoordinationContext = context?.requiresMultipleAgents || context?.isWorkflow;
    const hasComputationContext = context?.isCodeExecution || context?.needsProcessing;

    // Count keyword matches
    const mlMatches = mlKeywords.filter(keyword => taskLower.includes(keyword)).length;
    const coordinationMatches = coordinationKeywords.filter(keyword => taskLower.includes(keyword)).length;
    const computationMatches = computationKeywords.filter(keyword => taskLower.includes(keyword)).length;

    // Apply context bonuses
    const mlScore = mlMatches + (hasMLContext ? 2 : 0);
    const coordinationScore = coordinationMatches + (hasCoordinationContext ? 2 : 0);
    const computationScore = computationMatches + (hasComputationContext ? 2 : 0);

    // Determine task type based on highest score
    if (mlScore > coordinationScore && mlScore > computationScore && mlScore > 0) {
      return 'ml';
    } else if (coordinationScore > computationScore && coordinationScore > 0) {
      return 'coordination';
    } else if (computationScore > 0) {
      return 'computation';
    } else {
      // Default to prompt for natural language tasks
      return 'prompt';
    }
  }

  /**
   * Estimate the complexity of a task (0-1 scale)
   */
  estimateComplexity(task: string, context?: any): number {
    let complexity = 0.3; // Base complexity

    // Task length factor
    const taskLength = task.length;
    if (taskLength > 500) complexity += 0.2;
    else if (taskLength > 200) complexity += 0.1;

    // Keyword-based complexity indicators
    const complexityIndicators = [
      'complex', 'advanced', 'sophisticated', 'multi-step', 'comprehensive',
      'optimize', 'analyze', 'coordinate', 'integrate', 'orchestrate'
    ];

    const taskLower = task.toLowerCase();
    const indicatorMatches = complexityIndicators.filter(indicator => 
      taskLower.includes(indicator)
    ).length;
    complexity += indicatorMatches * 0.1;

    // Context-based complexity
    if (context) {
      if (context.needsHighAccuracy) complexity += 0.15;
      if (context.requiresMultipleAgents) complexity += 0.2;
      if (context.involvesLLM) complexity += 0.1;
      if (context.needsOptimization) complexity += 0.15;
    }

    // Multiple sentence complexity
    const sentences = task.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) complexity += 0.1;

    // Cap complexity at 1.0
    return Math.min(1.0, complexity);
  }

  /**
   * Calculate confidence in the analysis
   */
  private calculateConfidence(task: string, taskType: string, complexity: number): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence for clearer task types
    const taskLower = task.toLowerCase();
    const typeKeywords = {
      'ml': ['model', 'train', 'predict', 'dspy', 'optimize'],
      'coordination': ['coordinate', 'agents', 'workflow', 'manage'],
      'computation': ['calculate', 'compute', 'process', 'execute'],
      'prompt': ['write', 'generate', 'create', 'explain']
    };

    const relevantKeywords = typeKeywords[taskType as keyof typeof typeKeywords] || [];
    const keywordMatches = relevantKeywords.filter(keyword => taskLower.includes(keyword)).length;
    
    confidence += keywordMatches * 0.1;

    // Complexity confidence adjustment
    if (complexity > 0.8 || complexity < 0.2) {
      confidence -= 0.1; // Less confident in extreme complexity estimates
    }

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Generate reasoning for the analysis
   */
  private generateReasoning(task: string, taskType: string, complexity: number, context?: any): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Identified as ${taskType} task based on content analysis`);
    reasoning.push(`Estimated complexity: ${(complexity * 100).toFixed(1)}% (${this.getComplexityLabel(complexity)})`);

    if (context?.needsHighAccuracy) {
      reasoning.push('High accuracy requirement increases complexity');
    }

    if (context?.requiresMultipleAgents) {
      reasoning.push('Multiple agent coordination detected');
    }

    if (task.length > 300) {
      reasoning.push('Long task description suggests higher complexity');
    }

    return reasoning;
  }

  /**
   * Suggest appropriate tools for the task type
   */
  private suggestTools(taskType: string, complexity: number): string[] {
    const tools: string[] = [];

    switch (taskType) {
      case 'ml':
        tools.push('DSPy', 'Neural ML', 'Model Training');
        if (complexity > 0.7) tools.push('Advanced Optimizers');
        break;
      case 'coordination':
        tools.push('Workflow Engine', 'Agent Registry', 'Event System');
        if (complexity > 0.6) tools.push('Multi-Agent Orchestrator');
        break;
      case 'computation':
        tools.push('Code Analyzer', 'Execution Engine');
        if (complexity > 0.5) tools.push('Advanced Processing');
        break;
      case 'prompt':
        tools.push('LLM Provider', 'Prompt Optimizer');
        if (complexity > 0.6) tools.push('Context Enhancement');
        break;
    }

    return tools;
  }

  /**
   * Estimate task duration in milliseconds
   */
  private estimateDuration(taskType: string, complexity: number): number {
    const baseDurations = {
      'prompt': 2000,
      'ml': 5000,
      'coordination': 3000,
      'computation': 4000,
    };

    const baseDuration = baseDurations[taskType as keyof typeof baseDurations] || 3000;
    const complexityMultiplier = 1 + complexity; // 1x to 2x based on complexity

    return Math.round(baseDuration * complexityMultiplier);
  }

  /**
   * Identify key factors that influenced the analysis
   */
  private identifyKeyFactors(task: string, context?: any, requirements?: any): string[] {
    const factors: string[] = [];

    factors.push(`Task length: ${task.length} characters`);

    if (context) {
      if (context.involvesLLM) factors.push('Involves LLM processing');
      if (context.requiresMultipleAgents) factors.push('Requires multi-agent coordination');
    }

    if (requirements) {
      if (requirements.needsFastResponse) factors.push('Fast response required');
      if (requirements.needsHighAccuracy) factors.push('High accuracy required');
    }

    return factors;
  }

  /**
   * Get human-readable complexity label
   */
  private getComplexityLabel(complexity: number): string {
    if (complexity < 0.3) return 'Low';
    if (complexity < 0.6) return 'Medium';
    if (complexity < 0.8) return 'High';
    return 'Very High';
  }
}
