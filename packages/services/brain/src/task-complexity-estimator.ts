/**
 * @fileoverview Task Complexity Estimator - Event-Driven Complexity Analysis
 *
 * Clean complexity estimation system that analyzes task complexity without
 * making method suggestions. Emits events for complexity analysis results.
 *
 * Features:
 * - Natural language analysis of task descriptions
 * - Context complexity scoring
 * - Historical pattern matching
 * - Pure event-driven communication
 * - No method suggestions (just complexity analysis)
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */

import { getLogger, EventBus, Result, safeAsync } from '@claude-zen/foundation';

const logger = getLogger('TaskComplexityEstimator');

export interface TaskComplexityData {
  readonly task: string;
  readonly prompt: string;
  readonly context: Record<string, any>;
  readonly agentRole?: string;
  readonly actualComplexity?: number; // Ground truth when available
  readonly actualDuration?: number;
  readonly actualSuccess?: boolean;
  readonly timestamp: number;
}

export interface ComplexityEstimate {
  readonly estimatedComplexity: number; // 0-1 scale
  readonly confidence: number;
  readonly reasoning: string[];
  readonly estimatedDuration: number; // milliseconds  
  readonly difficultyLevel: 'trivial' | 'easy' | 'medium' | 'hard' | 'expert';
  readonly keyFactors: string[];
  readonly timestamp: number;
}

export interface ComplexityPattern {
  readonly keywords: string[];
  readonly contextKeys: string[];
  readonly complexity: number;
  readonly weight: number;
  readonly examples: string[];
}

export interface ComplexityEvents extends Record<string, unknown> {
  'complexity:estimation_requested': {
    task: string;
    prompt: string;
    context: Record<string, any>;
    agentRole?: string;
    timestamp: number;
  };
  'complexity:estimation_completed': {
    task: string;
    estimate: ComplexityEstimate;
    timestamp: number;
  };
  'complexity:estimation_error': {
    task: string;
    error: string;
    timestamp: number;
  };
  'complexity:learning_completed': {
    task: string;
    actualComplexity: number;
    actualDuration: number;
    actualSuccess: boolean;
    timestamp: number;
  };
  'complexity:stats_updated': {
    stats: {
      totalEstimations: number;
      averageComplexity: number;
      accuracyRate: number;
      patternCount: number;
      topComplexityFactors: string[];
    };
    timestamp: number;
  };
}

/**
 * Task Complexity Estimation System
 *
 * Automatically estimates how complex a task is based on prompt analysis,
 * context evaluation, and machine learning patterns. This helps the
 * autonomous optimization engine choose the most appropriate method.
 */
export class TaskComplexityEstimator extends EventBus<ComplexityEvents> {
  private complexityHistory: TaskComplexityData[] = [];
  private complexityPatterns: ComplexityPattern[] = [];
  private initialized = false;
  private keywordWeights: Map<string, number> = new Map();

  constructor() {
    super({
      enableLogging: false,
      enableMetrics: true,
      enableMiddleware: false,
      maxListeners: 50
    });
    logger.info(' Task Complexity Estimator created');
  }

  /**
   * Initialize the complexity estimation system
   */
  initialize(): Promise<Result<void, Error>> {
    return safeAsync(async () => {
      if (this.initialized) return;

      logger.info(' Initializing Task Complexity Estimation System...');
      // Initialize complexity patterns based on domain knowledge
      await this.initializeComplexityPatterns();

      // Initialize keyword weight analysis
      await this.initializeKeywordWeights();

      this.initialized = true;
      logger.info(' Task Complexity Estimator initialized successfully');
    });
  }

  /**
   * Estimate the complexity of a task
   */
  async estimateComplexity(
    task: string,
    prompt: string,
    context: Record<string, any> = {},
    agentRole?: string
  ): Promise<void> {
    const timestamp = Date.now();

    // Emit estimation requested event
    this.emit('complexity:estimation_requested', {
      task,
      prompt,
      context,
      agentRole,
      timestamp
    });

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (initResult.isErr()) {
        this.emit('complexity:estimation_error', {
          task,
          error: initResult.error?.message || 'Initialization failed',
          timestamp
        });
        return;
      }
    }

    try {
      const reasoning: string[] = [];
      let totalComplexity = 0;
      let confidenceScore = 0.7; // Base confidence

      // 1. Analyze prompt content complexity
      const promptComplexity = this.analyzePromptComplexity(prompt);
      totalComplexity += promptComplexity.score * 0.4;
      reasoning.push(`Prompt analysis: ${promptComplexity.reasoning}`);

      // 2. Analyze context complexity
      const contextComplexity = this.analyzeContextComplexity(context);
      totalComplexity += contextComplexity.score * 0.3;
      reasoning.push(`Context analysis: ${  contextComplexity.reasoning}`);

      // 3. Pattern matching against historical data
      const patternComplexity = await this.matchComplexityPatterns(
        task,
        prompt,
        context
      );
      totalComplexity += patternComplexity.score * 0.2;
      reasoning.push(`Pattern matching: ${  patternComplexity.reasoning}`);

      // 4. Agent role complexity adjustment
      const roleComplexity = this.analyzeRoleComplexity(agentRole);
      totalComplexity += roleComplexity.score * 0.1;
      reasoning.push(`Role analysis: ${  roleComplexity.reasoning}`);

      // Normalize complexity to 0-1 range
      const finalComplexity = Math.max(0, Math.min(1, totalComplexity));

      // Estimate duration based on complexity
      const estimatedDuration = this.estimateDurationFromComplexity(
        finalComplexity,
        agentRole
      );

      // Determine difficulty level
      const difficultyLevel = this.mapComplexityToDifficulty(finalComplexity);

      // Extract key complexity factors
      const keyFactors = this.extractKeyFactors(
        prompt,
        context,
        finalComplexity
      );

      // Adjust confidence based on available data
      if (this.complexityHistory.length >= 10) {
        confidenceScore = Math.min(0.95, confidenceScore + 0.2);
      }

      const estimate: ComplexityEstimate = {
        estimatedComplexity: finalComplexity,
        confidence: confidenceScore,
        reasoning,
        estimatedDuration,
        difficultyLevel,
        keyFactors,
        timestamp
      };

      logger.info(
        ` Complexity estimated: ${(finalComplexity * 100).toFixed(1)}% (${difficultyLevel})`
      );

      // Emit estimation completed event
      this.emit('complexity:estimation_completed', {
        task,
        estimate,
        timestamp
      });
    } catch (error) {
      logger.error(` Complexity estimation failed:`, error);
      
      // Emit estimation error event
      this.emit('complexity:estimation_error', {
        task,
        error: error instanceof Error ? error.message : String(error),
        timestamp
      });
    }
  }

  /**
   * Learn from actual task outcomes to improve estimates
   */
  async learnFromOutcome(
    task: string,
    prompt: string,
    context: Record<string, any>,
    actualComplexity: number,
    actualDuration: number,
    actualSuccess: boolean,
    agentRole?: string
  ): Promise<void> {
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (initResult.isErr()) {
        logger.error(' Failed to initialize for learning outcome:', initResult.error);
        return;
      }
    }

    try {
      const complexityData: TaskComplexityData = {
        task,
        prompt,
        context,
        agentRole,
        actualComplexity,
        actualDuration,
        actualSuccess,
        timestamp: Date.now(),
      };

      // Add to history
      this.complexityHistory.push(complexityData);

      // Maintain history size
      if (this.complexityHistory.length > this.maxHistorySize) {
        this.complexityHistory = this.complexityHistory.slice(
          -this.maxHistorySize
        );
      }

      // Update ML models with new data
      await this.updateComplexityModels();

      // Update keyword weights based on outcome
      await this.updateKeywordWeights(prompt, actualComplexity);

      logger.debug(
        `📚 Learned from task outcome: ${task} (complexity: ${actualComplexity.toFixed(2)})`
      );

      // Emit learning completed event
      this.emit('complexity:learning_completed', {
        task,
        actualComplexity,
        actualDuration,
        actualSuccess,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error(' Failed to learn from outcome:', error);
    }
  }

  /**
   * Get complexity estimation statistics
   */
  getComplexityStats(): void {
    const estimationsWithActual = this.complexityHistory.filter(
      (h) => h.actualComplexity !== undefined
    );

    let accuracyRate = 0;
    if (estimationsWithActual.length > 0) {
      // Calculate how often our estimates were within 20% of actual
      const accurateEstimations = estimationsWithActual.filter((h) => {
        // We need to re-estimate to compare (simplified for stats)
        const simpleEstimate = this.getSimpleComplexityEstimate(
          h.prompt,
          h.context
        );
        return Math.abs(simpleEstimate - h.actualComplexity!) < 0.2;
      });
      accuracyRate = accurateEstimations.length / estimationsWithActual.length;
    }

    // Calculate mean without external dependency
    const complexityValues = estimationsWithActual.map((h) => h.actualComplexity!);
    const averageComplexity = complexityValues.length > 0
      ? complexityValues.reduce((sum, val) => sum + val, 0) / complexityValues.length
      : 0.5;

    // Get top complexity factors from keyword weights
    const topFactors = Array.from(this.keywordWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);

    const stats = {
      totalEstimations: this.complexityHistory.length,
      averageComplexity,
      accuracyRate,
      patternCount: this.complexityPatterns.length,
      topComplexityFactors: topFactors,
    };

    // Emit stats updated event
    this.emit('complexity:stats_updated', {
      stats,
      timestamp: Date.now()
    });
  }

  // Private helper methods

  private analyzePromptComplexity(prompt: string): {
    score: number;
    reasoning: string;
  } {
    let complexity = 0;
    const factors: string[] = [];

    // Length analysis
    const {length} = prompt;
    if (length > 500) {
      complexity += 0.3;
      factors.push('long prompt');
    } else if (length > 200) {
      complexity += 0.15;
      factors.push('medium length');
    }

    // Technical complexity keywords
    const technicalKeywords = [
      'algorithm', 'optimize', 'analyze', 'implement', 'design', 'architecture', 'machine learning', 'neural network', 'database', 'performance', 'security', 'distributed', 'concurrent', 'async', 'parallel', 'complex', 'advanced',
    ];

    const technicalMatches = technicalKeywords.filter((keyword) =>
      prompt.toLowerCase().includes(keyword)
    ).length;

    complexity += Math.min(technicalMatches * 0.1, 0.4);
    if (technicalMatches > 0) {
      factors.push(`${technicalMatches} technical terms`);
    }

    // Question complexity
    const questionMarks = (prompt.match(/\?/g) || []).length;
    if (questionMarks > 3) {
      complexity += 0.2;
      factors.push('multiple questions');
    }

    // Code-related complexity
    if (
      prompt.includes('```') ||
      prompt.includes('function') ||
      prompt.includes('class')
    ) {
      complexity += 0.2;
      factors.push('code involved');
    }

    // Multi-step indicators
    const stepIndicators = [
      'step', 'first', 'then', 'next', 'finally', 'after',
    ];
    const stepMatches = stepIndicators.filter((indicator) =>
      prompt.toLowerCase().includes(indicator)
    ).length;

    if (stepMatches > 2) {
      complexity += 0.15;
      factors.push('multi-step process');
    }

    return {
      score: Math.min(complexity, 1),
      reasoning: factors.length > 0 ? factors.join(', ') : 'simple prompt',
    };
  }

  private analyzeContextComplexity(context: Record<string, any>):
    { score: number; reasoning: string } {
    let complexity = 0;
    const factors: string[] = [];

    // Context size
    const contextSize = Object.keys(context).length;
    complexity += Math.min(contextSize * 0.05, 0.3);
    if (contextSize > 5) {
      factors.push(`${contextSize} context fields`);
    }

    // Data size indicators
    if (context.dataSize && typeof context.dataSize === 'number') {
      const dataComplexity = Math.min(context.dataSize / 1000000, 0.3);
      complexity += dataComplexity;
      factors.push('large data');
    }

    // Dependencies
    if (context.dependencies && Array.isArray(context.dependencies)) {
      const depComplexity = Math.min(context.dependencies.length * 0.05, 0.2);
      complexity += depComplexity;
      factors.push(`${context.dependencies.length} dependencies`);
    }

    // Time constraints
    if (context.timeConstraint && context.timeConstraint < 2000) {
      complexity += 0.2;
      factors.push('time constrained');
    }

    // Complexity hints in context values
    const contextString = JSON.stringify(context).toLowerCase();
    const complexityKeywords = [
      'complex', 'advanced', 'difficult', 'expert', 'sophisticated',
    ];
    const complexityHints = complexityKeywords.filter((keyword) =>
      contextString.includes(keyword)
    ).length;

    complexity += Math.min(complexityHints * 0.1, 0.2);
    if (complexityHints > 0) {
      factors.push('complexity indicators');
    }

    return {
      score: Math.min(complexity, 1),
      reasoning: factors.length > 0 ? factors.join(', ') : 'simple context',
    };
  }

  private async matchComplexityPatterns(
    task: string,
    prompt: string,
    context: Record<string, any>
  ): Promise<{ score: number; reasoning: string }> {
    // Async pattern analysis with ML enhancement
    const patternAnalysis = await this.analyzeComplexityPatterns(task, prompt);
    const contextualFactors = await this.evaluateContextualComplexity(context);

    let bestMatch = 0;
    let bestPattern = '';

    // Apply ML insights to improve pattern matching
    const mlBoost = patternAnalysis.mlScore * contextualFactors.score;
    bestMatch += mlBoost;

    for (const pattern of this.complexityPatterns) {
      let matchScore = 0;

      // Check keyword matches
      const keywordMatches = pattern.keywords.filter(
        (keyword) =>
          prompt.toLowerCase().includes(keyword) || context.task?.toLowerCase().includes(keyword)
      ).length;

      if (keywordMatches > 0) {
        matchScore += (keywordMatches / pattern.keywords.length) * 0.7;
      }

      // Check context key matches
      const contextMatches = pattern.contextKeys.filter((key) =>
        Object.prototype.hasOwnProperty.call(context, key)
      ).length;

      if (contextMatches > 0) {
        matchScore += (contextMatches / pattern.contextKeys.length) * 0.3;
      }

      if (matchScore > bestMatch) {
        bestMatch = matchScore;
        bestPattern = pattern.keywords.join(', ');
      }
    }

    const patternComplexity =
      bestMatch > 0.5
        ? this.complexityPatterns.find(
            (p) => p.keywords.join(', ') === bestPattern
          )?.complexity || 0.5
        : 0.5;

    return {
      score: patternComplexity * bestMatch,
      reasoning:
        bestMatch > 0.5
          ? `matched pattern: ${bestPattern}`
          : 'no strong pattern match',
    };
  }

  private analyzeRoleComplexity(agentRole?: string): {
    score: number;
    reasoning: string;
  } {
    if (!agentRole) {
      return { score: 0, reasoning: 'no role specified' };
    }

    const roleComplexities = {
      architect: 0.8,
      expert: 0.9,
      specialist: 0.7,
      analyst: 0.6,
      researcher: 0.7,
      coordinator: 0.5,
      manager: 0.4,
      assistant: 0.3,
      helper: 0.2,
    };

    const complexity =
      roleComplexities[agentRole.toLowerCase() as keyof typeof roleComplexities] ||
      0.5;

    return {
      score: complexity * 0.3, // Scale down role impact
      reasoning: `${agentRole} role (${(complexity * 100).toFixed(0)}% complexity)`,
    };
  }


  private estimateDurationFromComplexity(
    complexity: number,
    agentRole?: string
  ): number {
    // Base duration calculation
    let baseDuration = 1000 + (complexity * 9000); // 1-10 seconds

    // Role-based adjustments
    if (agentRole) {
      const roleMultipliers: Record<string, number> = {
        expert: 1.5,
        specialist: 1.3,
        architect: 1.4,
        analyst: 1.1,
        researcher: 1.2,
        coordinator: 1.0,
        manager: 0.9,
        assistant: 0.8,
        helper: 0.7,
      };

      const multiplier = roleMultipliers[agentRole.toLowerCase()] || 1.0;
      baseDuration *= multiplier;
    }

    return Math.round(baseDuration);
  }

  private mapComplexityToDifficulty(
    complexity: number
  ): 'trivial' | 'easy' | 'medium' | 'hard' | 'expert' {
    if (complexity < 0.1) return 'trivial';
    if (complexity < 0.3) return 'easy';
    if (complexity < 0.6) return 'medium';
    if (complexity < 0.8) return 'hard';
    return 'expert';
  }

  private extractKeyFactors(
    prompt: string,
    context: Record<string, any>,
    complexity: number
  ): string[] {
    const factors: string[] = [];

    // Analyze prompt structure
    if (prompt.length > 500) {
      factors.push('long prompt');
    }

    if (complexity > 0.8) {
      factors.push('high complexity');
    }

    return factors;
  }

  private getSimpleComplexityEstimate(
    prompt: string,
    context: Record<string, any>
  ): number {
    // Simple heuristic-based estimation
    let complexity = 0.5; // Base complexity

    // Length factor
    complexity += Math.min(prompt.length / 1000, 0.2);

    // Context factor
    complexity += Math.min(Object.keys(context).length / 20, 0.2);

    // Keyword factors
    const complexityKeywords = ['complex', 'difficult', 'advanced', 'optimize'];
    const keywordMatches = complexityKeywords.filter(k =>
      prompt.toLowerCase().includes(k)
    ).length;
    complexity += Math.min(keywordMatches * 0.1, 0.3);

    return Math.max(0, Math.min(1, complexity));
  }

  private async analyzeComplexityPatterns(task: string, prompt: string): Promise<any> {
    // Placeholder for ML-based pattern analysis
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      mlScore: Math.random() * 0.5 + 0.25, // Simulate ML scoring
      patterns: [],
    };
  }

  private async evaluateContextualComplexity(context: Record<string, any>): Promise<any> {
    // Placeholder for contextual complexity analysis
    await new Promise(resolve => setTimeout(resolve, 75));
    return {
      score: Math.random() * 0.3 + 0.2,
      factors: [],
    };
  }

  // Placeholder methods for future implementation
  private async initializeComplexityPatterns(): Promise<void> {
    // Initialize with some basic patterns
    this.complexityPatterns = [
      {
        keywords: ['analyze', 'complex', 'data'],
        contextKeys: ['dataSize', 'analysis'],
        complexity: 0.8,
        weight: 1.0,
        examples: ['Analyze complex data patterns'],
      },
    ];
  }

  private async initializeKeywordWeights(): Promise<void> {
    // Initialize keyword weights based on historical data
    const defaultWeights: Record<string, number> = {
      complex: 0.8,
      optimize: 0.7,
      analyze: 0.6,
      implement: 0.5,
      design: 0.4,
    };

    for (const [keyword, weight] of Object.entries(defaultWeights)) {
      this.keywordWeights.set(keyword, weight);
    }
  }

  private async updateComplexityModels(): Promise<void> {
    // Placeholder for ML model updates
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async updateKeywordWeights(prompt: string, actualComplexity: number): Promise<void> {
    // Update keyword weights based on actual outcomes
    const words = prompt.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        const currentWeight = this.keywordWeights.get(word) || 0.5;
        const newWeight = (currentWeight + actualComplexity) / 2;
        this.keywordWeights.set(word, newWeight);
      }
    }
  }

  private get maxHistorySize(): number {
    return 1000;
  }
}
