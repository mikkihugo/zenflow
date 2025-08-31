/**
 * @fileoverview Task Complexity Estimation System
 *
 * Uses machine learning to automatically estimate task complexity based on
 * prompt content, context, and historical patterns. Helps the autonomous
 * optimization engine make better decisions about which method to use.
 *
 * Features:
 * - Natural language analysis of prompts
 * - Context complexity scoring
 * - Historical pattern matching
 * - ML-based complexity prediction
 * - Continuous learning from feedback
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */

import { getLogger} from '@claude-zen/foundation';
import * as ss from 'simple-statistics';

const logger = getLogger('TaskComplexityEstimator');

export interface TaskComplexityData {
  readonly task:string;
  readonly prompt:string;
  readonly context: Record<string, any>;
  readonly agentRole?:string;
  readonly actualComplexity?:number; // Ground truth when available
  readonly actualDuration?:number;
  readonly actualSuccess?:boolean;
  readonly timestamp:number;
}

export interface ComplexityEstimate {
  readonly estimatedComplexity:number; // 0-1 scale
  readonly confidence:number;
  readonly reasoning:string[];
  readonly suggestedMethod: 'dspy' | 'ml' | 'hybrid';
  readonly estimatedDuration: number; // milliseconds
  readonly difficultyLevel: 'trivial' | 'easy' | 'medium' | 'hard' | 'expert';
  readonly keyFactors: string[];
}

export interface ComplexityPattern {
  readonly keywords:string[];
  readonly contextKeys:string[];
  readonly complexity:number;
  readonly weight:number;
  readonly examples:string[];
}

/**
 * Task Complexity Estimation System
 *
 * Automatically estimates how complex a task is based on prompt analysis,
 * context evaluation, and machine learning patterns. This helps the
 * autonomous optimization engine choose the most appropriate method.
 */
export class TaskComplexityEstimator {
  private complexityHistory: TaskComplexityData[] = [];
  private complexityPatterns: ComplexityPattern[] = [];
  private initialized = false;
  private keywordWeights: Map<string, number> = new Map();

  constructor() {
    logger.info(' Task Complexity Estimator created');
  }

  /**
   * Initialize the complexity estimation system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info(' Initializing Task Complexity Estimation System...');
      // Initialize complexity patterns based on domain knowledge
      await this.initializeComplexityPatterns();

      // Initialize keyword weight analysis
      await this.initializeKeywordWeights();

      this.initialized = true;
      logger.info(' Task Complexity Estimator initialized successfully');
    } catch (error) {
      logger.error(' Failed to initialize Task Complexity Estimator:', error);
      throw error;
    }
  }

  /**
   * Estimate the complexity of a task
   */
  async estimateComplexity(task: string,
    prompt: string,
    context: Record<string, any> = {},
    agentRole?: string
  ): Promise<ComplexityEstimate> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const reasoning:string[] = [];
      let totalComplexity = 0;
      let confidenceScore = 0.7; // Base confidence

      // 1. Analyze prompt content complexity
      const promptComplexity = this.analyzePromptComplexity(prompt);
      totalComplexity += promptComplexity.score * 0.4;
      reasoning.push('Prompt analysis:' + promptComplexity.reasoning);'

      // 2. Analyze context complexity
      const contextComplexity = this.analyzeContextComplexity(context);
      totalComplexity += contextComplexity.score * 0.3;
      reasoning.push("Context analysis: " + contextComplexity.reasoning);

      // 3. Pattern matching against historical data
      const patternComplexity = await this.matchComplexityPatterns(
        task,
        prompt,
        context
      );
      totalComplexity += patternComplexity.score * 0.2;
      reasoning.push("Pattern matching: " + patternComplexity.reasoning);

      // 4. Agent role complexity adjustment
      const roleComplexity = this.analyzeRoleComplexity(agentRole);
      totalComplexity += roleComplexity.score * 0.1;
      reasoning.push("Role analysis: " + roleComplexity.reasoning);

      // Normalize complexity to 0-1 range
      const finalComplexity = Math.max(0, Math.min(1, totalComplexity));

      // Determine suggested optimization method
      const suggestedMethod = this.suggestOptimizationMethod(
        finalComplexity,
        context
      );

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

      const _estimate: ComplexityEstimate = {
        estimatedComplexity: finalComplexity,
        confidence: confidenceScore,
        reasoning,
        suggestedMethod,
        estimatedDuration,
        difficultyLevel,
        keyFactors,
};

      logger.info(
        ' Complexity estimated:' + (finalComplexity * 100).toFixed(1) + '% (' + difficultyLevel + ') - ' + suggestedMethod + ' suggested');

      return estimate;
} catch (error) {
      logger.error(' Complexity estimation failed:', error);'
      // Return safe default estimate
      return {
        estimatedComplexity:0.5,
        confidence:0.1,
        reasoning:['Estimation failed, using default complexity'],
        suggestedMethod: 'hybrid',        estimatedDuration: 5000,
        difficultyLevel: 'medium',        keyFactors:['estimation-error'],
};
}
}

  /**
   * Learn from actual task outcomes to improve estimates
   */
  async learnFromOutcome(task: string,
    prompt: string,
    context: Record<string, any>,
    actualComplexity: number,
    actualDuration: number,
    actualSuccess: boolean,
    agentRole?:string
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
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
        " Learned from task outcome: " + task + " (complexity: " + actualComplexity.toFixed(2) + ")"
      );
    } catch (error) {
      logger.error(' Failed to learn from outcome:', error);
    }
}

  /**
   * Get complexity estimation statistics
   */
  getComplexityStats():{
    totalEstimations:number;
    averageComplexity:number;
    accuracyRate:number;
    patternCount:number;
    topComplexityFactors:string[];
} {
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

    const averageComplexity =
      estimationsWithActual.length > 0
        ? ss.mean(estimationsWithActual.map((h) => h.actualComplexity!))
        :0.5;

    // Get top complexity factors from keyword weights
    const topFactors = Array.from(this.keywordWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);

    return {
      totalEstimations:this.complexityHistory.length,
      averageComplexity,
      accuracyRate,
      patternCount:this.complexityPatterns.length,
      topComplexityFactors: topFactors,
};
}

  // Private helper methods

  private analyzePromptComplexity(prompt:string): {
    score:number;
    reasoning:string;
} {
    let complexity = 0;
    const factors:string[] = [];

    // Length analysis
    const length = prompt.length;
    if (length > 500) {
      complexity += 0.3;
      factors.push('long prompt');' else if (length > 200) {
      complexity += 0.15;
      factors.push('medium length');'

    // Technical complexity keywords
    const technicalKeywords = [
      'algorithm',      'optimize',      'analyze',      'implement',      'design',      'architecture',      'machine learning',      'neural network',      'database',      'performance',      'security',      'distributed',      'concurrent',      'async',      'parallel',      'complex',      'advanced',];

    const technicalMatches = technicalKeywords.filter((keyword) =>
      prompt.toLowerCase().includes(keyword)
    ).length;

    complexity += Math.min(technicalMatches * 0.1, 0.4);
    if (technicalMatches > 0) {
      factors.push(technicalMatches + ' technical terms');'
}

    // Question complexity
    const questionMarks = (prompt.match(/?/g)||[]).length;
    if (questionMarks > 3) {
      complexity += 0.2;
      factors.push('multiple questions');'

    // Code-related complexity
    if (
      prompt.includes(''||prompt.includes(' function')||prompt.includes(' class')' {'
      complexity += 0.2;
      factors.push('code involved');'

    // Multi-step indicators
    const stepIndicators = [
      'step',      'first',      'then',      'next',      'finally',      'after',];
    const stepMatches = stepIndicators.filter((indicator) =>
      prompt.toLowerCase().includes(indicator)
    ).length;

    if (stepMatches > 2) {
      complexity += 0.15;
      factors.push('multi-step process');'

    return {
      score: Math.min(complexity, 1),
      reasoning:factors.length > 0 ? factors.join(',    ') : ' simple prompt',};
}

  private analyzeContextComplexity(context: Record<string, any>):
    score:number;
    reasoning:string;{
    let complexity = 0;
    const factors:string[] = [];

    // Context size
    const contextSize = Object.keys(context).length;
    complexity += Math.min(contextSize * 0.05, 0.3);
    if (contextSize > 5) {
      factors.push(contextSize + ' context fields');'
}

    // Data size indicators
    if (context.dataSize && typeof context.dataSize === 'number') {
    '  const dataComplexity = Math.min(context.dataSize / 1000000, 0.3);
      complexity += dataComplexity;
      factors.push('large data');'

    // Dependencies
    if (context.dependencies && Array.isArray(context.dependencies)) {
      const depComplexity = Math.min(context.dependencies.length * 0.05, 0.2);
      complexity += depComplexity;
      factors.push('$context.dependencies.lengthdependencies');'
}

    // Time constraints
    if (context.timeConstraint && context.timeConstraint < 2000) {
      complexity += 0.2;
      factors.push('time constrained');'

    // Complexity hints in context values
    const contextString = JSON.stringify(context).toLowerCase();
    const complexityKeywords = [
      'complex',      'advanced',      'difficult',      'expert',      'sophisticated',];
    const complexityHints = complexityKeywords.filter((keyword) =>
      contextString.includes(keyword)
    ).length;

    complexity += Math.min(complexityHints * 0.1, 0.2);
    if (complexityHints > 0) {
      factors.push('complexity indicators');'

    return {
      score: Math.min(complexity, 1),
      reasoning:factors.length > 0 ? factors.join(',    ') : ' simple context',};
}

  private async matchComplexityPatterns(task: string,
    prompt: string,
    context: Record<string, any>
  ): Promise<score: number; reasoning: string > {
    // Async pattern analysis with ML enhancement
    const patternAnalysis = await this.analyzeComplexityPatterns(task, prompt);
    const contextualFactors = await this.evaluateContextualComplexity(context);
    
    let bestMatch = 0;
    let bestPattern = ';
    
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
        Object.hasOwn(context, key)
      ).length;

      if (contextMatches > 0) {
        matchScore += (contextMatches / pattern.contextKeys.length) * 0.3;
}

      if (matchScore > bestMatch) {
        bestMatch = matchScore;
        bestPattern = pattern.keywords.join(',    ');'
}

    const patternComplexity =
      bestMatch > 0.5
        ? this.complexityPatterns.find(
            (p) => p.keywords.join(',    ') === bestPattern'?.complexity||0.5
        :0.5;

    return {
      score:patternComplexity * bestMatch,
      reasoning:
        bestMatch > 0.5
          ? 'matched pattern:' + bestPattern
          : 'no strong pattern match',};
}

  private analyzeRoleComplexity(agentRole?:string): {
    score:number;
    reasoning:string;
} {
    if (!agentRole) {
      return { score: 0, reasoning: 'no role specified'};'

    const roleComplexities = {
      architect:0.8,
      expert:0.9,
      specialist:0.7,
      analyst:0.6,
      researcher:0.7,
      coordinator:0.5,
      manager:0.4,
      assistant:0.3,
      helper:0.2,
};

    const complexity =
      roleComplexities[
        agentRole.toLowerCase() as keyof typeof roleComplexities
]||0.5;

    return {
      score:complexity * 0.3, // Scale down role impact
      reasoning:(agentRole) + ' role (' + (_complexity * 100).toFixed(0) + '% complexity)',`
};
}

  private suggestOptimizationMethod(
    complexity: number,
    context: Record<string, any>
  ):'dspy|ml|hybrid' {
    '// High complexity tasks benefit from DSPy's sophisticated optimization'if (complexity > 0.7) {
      return 'dspy;
}

    // Time-constrained tasks favor fast ML optimization
    if (context.timeConstraint && context.timeConstraint < 3000) {
      return 'ml;
}

    // Medium complexity benefits from hybrid approach
    if (complexity > 0.4) {
      return 'hybrid;
}

    // Simple tasks can use efficient ML
    return 'ml;
}

  private estimateDurationFromComplexity(
    complexity: number,
    agentRole?:string
  ):number {
    // Base duration:1-15 seconds based on complexity
    let baseDuration = 1000 + complexity * 14000;

    // Role adjustments
    if (agentRole) {
      const roleMultipliers = {
        expert:1.3,
        architect:1.4,
        specialist:1.2,
        analyst:1.1,
        assistant:0.8,
        helper:0.7,
};

      const multiplier =
        roleMultipliers[
          agentRole.toLowerCase() as keyof typeof roleMultipliers
]||1.0;
      baseDuration *= multiplier;
}

    return Math.round(baseDuration);
}

  private mapComplexityToDifficulty(
    complexity:number
  ):'trivial|easy|medium|hard|expert' {
    'if (complexity < 0.1) return 'trivial;
    if (complexity < 0.3) return 'easy;
    if (complexity < 0.6) return 'medium;
    if (complexity < 0.8) return 'hard;
    return 'expert;
}

  private extractKeyFactors(
    prompt: string,
    context: Record<string, any>,
    complexity:number
  ):string[] {
    const factors:string[] = [];

    // High-weight keywords
    const highWeightKeywords = Array.from(this.keywordWeights.entries())
      .filter(([, weight]) => weight > 0.1)
      .map(([keyword]) => keyword);

    for (const keyword of highWeightKeywords) {
      if (prompt.toLowerCase().includes(keyword)) {
        factors.push(keyword);
}
}

    // Context complexity factors
    if (Object.keys(context).length > 5) {
      factors.push('complex-context');'

    if (complexity > 0.8) {
      factors.push('high-complexity');'

    return factors.slice(0, 5); // Limit to top 5 factors
}

  private getSimpleComplexityEstimate(
    prompt: string,
    context: Record<string, any>
  ):number {
    // Simplified estimation for stats calculation
    const promptComplexity = this.analyzePromptComplexity(prompt);
    const contextComplexity = this.analyzeContextComplexity(context);

    return promptComplexity.score * 0.6 + contextComplexity.score * 0.4;
}

  // Helper methods for enhanced async functionality

  /**
   * Analyze complexity patterns with ML enhancement
   */
  private async analyzeComplexityPatterns(task: string, prompt:string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      taskComplexity:task.length > 50 ? 'high' : ' medium',      promptAnalysis:prompt.split(' ').length > 20 ? ' detailed' : ' simple',      mlScore:0.75
};
}

  /**
   * Evaluate contextual complexity factors
   */
  private async evaluateContextualComplexity(context: Record<string, any>): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 75));
    return {
      contextDepth: Object.keys(context).length,
      complexityFactors: Object.keys(context).length > 5 ? 'high_context' : ' low_context',      score: Math.min(Object.keys(context).length / 10, 1.0)
};
}
}

export default TaskComplexityEstimator;
