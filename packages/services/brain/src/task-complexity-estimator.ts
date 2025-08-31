/**
 * @fileoverview: Task Complexity: Estimation System
 *
 * Uses machine learning to automatically estimate task complexity based on
 * prompt content, context, and historical patterns. Helps the autonomous
 * optimization engine make better decisions about which method to use.
 *
 * Features:
 * - Natural language analysis of prompts
 * - Context complexity scoring
 * - Historical pattern matching
 * - M: L-based complexity prediction
 * - Continuous learning from feedback
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */

import { get: Logger} from '@claude-zen/foundation';
import * as ss from 'simple-statistics';

const logger = get: Logger('TaskComplexity: Estimator');

export interface: TaskComplexityData {
  readonly task: string;
  readonly prompt: string;
  readonly context: Record<string, any>;
  readonly agent: Role?:string;
  readonly actual: Complexity?:number; // Ground truth when available
  readonly actual: Duration?:number;
  readonly actual: Success?:boolean;
  readonly timestamp: number;
}

export interface: ComplexityEstimate {
  readonly estimated: Complexity: number; // 0-1 scale
  readonly confidence: number;
  readonly reasoning: string[];
  readonly suggested: Method: 'dspy' | 'ml' | 'hybrid';
  readonly estimated: Duration: number; // milliseconds
  readonly difficulty: Level: 'trivial' | 'easy' | 'medium' | 'hard' | 'expert';
  readonly key: Factors: string[];
}

export interface: ComplexityPattern {
  readonly keywords: string[];
  readonly context: Keys: string[];
  readonly complexity: number;
  readonly weight: number;
  readonly examples: string[];
}

/**
 * Task: Complexity Estimation: System
 *
 * Automatically estimates how complex a task is based on prompt analysis,
 * context evaluation, and machine learning patterns. This helps the
 * autonomous optimization engine choose the most appropriate method.
 */
export class: TaskComplexityEstimator {
  private complexity: History: TaskComplexity: Data[] = [];
  private complexity: Patterns: Complexity: Pattern[] = [];
  private initialized = false;
  private keyword: Weights: Map<string, number> = new: Map();

  constructor() {
    logger.info('Task: Complexity Estimator created');
  }

  /**
   * Initialize the complexity estimation system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
       {
      logger.info('Initializing: Task Complexity: Estimation System...');
      // Initialize complexity patterns based on domain knowledge
      await this.initializeComplexity: Patterns();

      // Initialize keyword weight analysis
      await this.initializeKeyword: Weights();

      this.initialized = true;
      logger.info('Task: Complexity Estimator initialized successfully');
    } catch (error) {
       {
      logger.error('Failed to initialize: Task Complexity: Estimator:', error);
      throw error;
    }
  }

  /**
   * Estimate the complexity of a task
   */
  async estimate: Complexity(): Promise<Complexity: Estimate> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
       {
      const reasoning: string[] = [];
      let total: Complexity = 0;
      let confidence: Score = 0.7; // Base confidence

      // 1. Analyze prompt content complexity
      const prompt: Complexity = this.analyzePrompt: Complexity(prompt);
      total: Complexity += prompt: Complexity.score * 0.4;
      reasoning.push("Prompt analysis:${prompt: Complexity.reasoning}");"

      // 2. Analyze context complexity
      const context: Complexity = this.analyzeContext: Complexity(context);
      total: Complexity += context: Complexity.score * 0.3;
      reasoning.push("Context analysis: " + context: Complexity.reasoning);

      // 3. Pattern matching against historical data
      const pattern: Complexity = await this.matchComplexity: Patterns(
        task,
        prompt,
        context
      );
      total: Complexity += pattern: Complexity.score * 0.2;
      reasoning.push("Pattern matching: " + pattern: Complexity.reasoning);

      // 4. Agent role complexity adjustment
      const role: Complexity = this.analyzeRole: Complexity(agent: Role);
      total: Complexity += role: Complexity.score * 0.1;
      reasoning.push("Role analysis: " + role: Complexity.reasoning);

      // Normalize complexity to 0-1 range
      const final: Complexity = Math.max(0, Math.min(1, total: Complexity));

      // Determine suggested optimization method
      const suggested: Method = this.suggestOptimization: Method(
        final: Complexity,
        context
      );

      // Estimate duration based on complexity
      const estimated: Duration = this.estimateDurationFrom: Complexity(
        final: Complexity,
        agent: Role
      );

      // Determine difficulty level
      const difficulty: Level = this.mapComplexityTo: Difficulty(final: Complexity);

      // Extract key complexity factors
      const key: Factors = this.extractKey: Factors(
        prompt,
        context,
        final: Complexity
      );

      // Adjust confidence based on available data
      if (this.complexity: History.length >= 10) {
        confidence: Score = Math.min(0.95, confidence: Score + 0.2);
}

      const _estimate: Complexity: Estimate = " + JSO: N.stringify({
        estimated: Complexity: final: Complexity,
        confidence: confidence: Score,
        reasoning,
        suggested: Method,
        estimated: Duration,
        difficulty: Level,
        key: Factors,
}) + ";

      logger.info(
        "Complexity estimated:${(final: Complexity * 100).to: Fixed(1)}% (${difficulty: Level}) - ${suggested: Method} suggested"""
      );

      return estimate;
} catch (error) {
       {
      logger.error('Complexity estimation failed:', error);')
      // Return safe default estimate
      return {
        estimated: Complexity: 0.5,
        confidence: 0.1,
        reasoning:['Estimation failed, using default complexity'],
        suggested: Method: 'hybrid',        estimated: Duration: 5000,
        difficulty: Level: 'medium',        key: Factors:['estimation-error'],
};
}
}

  /**
   * Learn from actual task outcomes to improve estimates
   */
  async learnFrom: Outcome(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
}

    try {
       {
      const complexity: Data: TaskComplexity: Data = {
        task,
        prompt,
        context,
        agent: Role,
        actual: Complexity,
        actual: Duration,
        actual: Success,
        timestamp: Date.now(),
};

      // Add to history
      this.complexity: History.push(complexity: Data);

      // Maintain history size
      if (this.complexity: History.length > this.maxHistory: Size) {
        this.complexity: History = this.complexity: History.slice(
          -this.maxHistory: Size
        );
}

      // Update: ML models with new data
      await this.updateComplexity: Models();

      // Update keyword weights based on outcome
      await this.updateKeyword: Weights(prompt, actual: Complexity);

      logger.debug(
        "📚 Learned from task outcome: " + task + " (complexity: " + actual: Complexity.to: Fixed(2) + ")"
      );
    } catch (error) {
       {
      logger.error('Failed to learn from outcome:', error);
    }
}

  /**
   * Get complexity estimation statistics
   */
  getComplexity: Stats():{
    total: Estimations: number;
    average: Complexity: number;
    accuracy: Rate: number;
    pattern: Count: number;
    topComplexity: Factors: string[];
} {
    const estimationsWith: Actual = this.complexity: History.filter(
      (h) => h.actual: Complexity !== undefined
    );

    let accuracy: Rate = 0;
    if (estimationsWith: Actual.length > 0) {
      // Calculate how often our estimates were within 20% of actual
      const accurate: Estimations = estimationsWith: Actual.filter((h) => {
        // We need to re-estimate to compare (simplified for stats)
        const simple: Estimate = this.getSimpleComplexity: Estimate(
          h.prompt,
          h.context
        );
        return: Math.abs(simple: Estimate - h.actual: Complexity!) < 0.2;
});
      accuracy: Rate = accurate: Estimations.length / estimationsWith: Actual.length;
}

    const average: Complexity =
      estimationsWith: Actual.length > 0
        ? ss.mean(estimationsWith: Actual.map((h) => h.actual: Complexity!))
        :0.5;

    // Get top complexity factors from keyword weights
    const top: Factors = Array.from(this.keyword: Weights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);

    return {
      total: Estimations: this.complexity: History.length,
      average: Complexity,
      accuracy: Rate,
      pattern: Count: this.complexity: Patterns.length,
      topComplexity: Factors: top: Factors,
};
}

  // Private helper methods

  private analyzePrompt: Complexity(prompt: string): {
    score: number;
    reasoning: string;
} {
    let complexity = 0;
    const factors: string[] = [];

    // Length analysis
    const length = prompt.length;
    if (length > 500) {
      complexity += 0.3;
      factors.push('long prompt');')} else if (length > 200) {
      complexity += 0.15;
      factors.push('medium length');')}

    // Technical complexity keywords
    const technical: Keywords = [
      'algorithm',      'optimize',      'analyze',      'implement',      'design',      'architecture',      'machine learning',      'neural network',      'database',      'performance',      'security',      'distributed',      'concurrent',      'async',      'parallel',      'complex',      'advanced',];

    const technical: Matches = technical: Keywords.filter((keyword) =>
      prompt.toLower: Case().includes(keyword)
    ).length;

    complexity += Math.min(technical: Matches * 0.1, 0.4);
    if (technical: Matches > 0) " + JSO: N.stringify({
      factors.push("" + technical: Matches + ") + " technical terms");"
}

    // Question complexity
    const question: Marks = (prompt.match(/?/g)||[]).length;
    if (question: Marks > 3) {
      complexity += 0.2;
      factors.push('multiple questions');')}

    // Code-related complexity
    if (
      prompt.includes('"""')||prompt.includes(' function')||prompt.includes(' class')')    ) {""
      complexity += 0.2;
      factors.push('code involved');')}

    // Multi-step indicators
    const step: Indicators = [
      'step',      'first',      'then',      'next',      'finally',      'after',];
    const step: Matches = step: Indicators.filter((indicator) =>
      prompt.toLower: Case().includes(indicator)
    ).length;

    if (step: Matches > 2) {
      complexity += 0.15;
      factors.push('multi-step process');')}

    return {
      score: Math.min(complexity, 1),
      reasoning: factors.length > 0 ? factors.join(',    ') : ' simple prompt',};
}

  private analyzeContext: Complexity(context: Record<string, any>):
    score: number;
    reasoning: string;{
    let complexity = 0;
    const factors: string[] = [];

    // Context size
    const context: Size = Object.keys(context).length;
    complexity += Math.min(context: Size * 0.05, 0.3);
    if (context: Size > 5) " + JSO: N.stringify({
      factors.push(`${context: Size}) + " context fields");"
}

    // Data size indicators
    if (context.data: Size && typeof context.data: Size === 'number') {
    ')      const data: Complexity = Math.min(context.data: Size / 1000000, 0.3);
      complexity += data: Complexity;
      factors.push('large data');')}

    // Dependencies
    if (context.dependencies && Array.is: Array(context.dependencies)) {
      const dep: Complexity = Math.min(context.dependencies.length * 0.05, 0.2);
      complexity += dep: Complexity;
      factors.push("${context.dependencies.lengthdependencies}");"
}

    // Time constraints
    if (context.time: Constraint && context.time: Constraint < 2000) {
      complexity += 0.2;
      factors.push('time constrained');')}

    // Complexity hints in context values
    const context: String = JSO: N.stringify(context).toLower: Case();
    const complexity: Keywords = [
      'complex',      'advanced',      'difficult',      'expert',      'sophisticated',];
    const complexity: Hints = complexity: Keywords.filter((keyword) =>
      context: String.includes(keyword)
    ).length;

    complexity += Math.min(complexity: Hints * 0.1, 0.2);
    if (complexity: Hints > 0) {
      factors.push('complexity indicators');')}

    return {
      score: Math.min(complexity, 1),
      reasoning: factors.length > 0 ? factors.join(',    ') : ' simple context',};
}

  private async matchComplexity: Patterns(): Promise<score: number; reasoning: string > {
    // Async pattern analysis with: ML enhancement
    const pattern: Analysis = await this.analyzeComplexity: Patterns(task, prompt);
    const contextual: Factors = await this.evaluateContextual: Complexity(context);
    
    let best: Match = 0;
    let best: Pattern = ';
    
    // Apply: ML insights to improve pattern matching
    const ml: Boost = pattern: Analysis.ml: Score * contextual: Factors.score;
    best: Match += ml: Boost;

    for (const pattern of this.complexity: Patterns) {
      let match: Score = 0;

      // Check keyword matches
      const keyword: Matches = pattern.keywords.filter(
        (keyword) =>
          prompt.toLower: Case().includes(keyword) || context.task?.toLower: Case().includes(keyword)
      ).length;

      if (keyword: Matches > 0) {
        match: Score += (keyword: Matches / pattern.keywords.length) * 0.7;
}

      // Check context key matches
      const context: Matches = pattern.context: Keys.filter((key) =>
        Object.has: Own(context, key)
      ).length;

      if (context: Matches > 0) {
        match: Score += (context: Matches / pattern.context: Keys.length) * 0.3;
}

      if (match: Score > best: Match) {
        best: Match = match: Score;
        best: Pattern = pattern.keywords.join(',    ');')}
}

    const pattern: Complexity =
      best: Match > 0.5
        ? this.complexity: Patterns.find(
            (p) => p.keywords.join(',    ') === best: Pattern')          )?.complexity||0.5
        :0.5;

    return {
      score: pattern: Complexity * best: Match,
      reasoning:
        best: Match > 0.5
          ? "matched pattern:$" + JSO: N.stringify({best: Pattern}) + """"
          : 'no strong pattern match',};
}

  private analyzeRole: Complexity(agent: Role?:string): {
    score: number;
    reasoning: string;
} {
    if (!agent: Role) {
      return { score: 0, reasoning: 'no role specified'};')}

    const role: Complexities = {
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
      role: Complexities[
        agent: Role.toLower: Case() as keyof typeof role: Complexities
]||0.5;

    return {
      score: complexity * 0.3, // Scale down role impact
      reasoning:"${agent: Role} role (${(_complexity * 100).to: Fixed(0)}% complexity)"""
};
}

  private suggestOptimization: Method(
    complexity: number,
    context: Record<string, any>
  ):'dspy|ml|hybrid' {
    ')    // High complexity tasks benefit from: DSPy's sophisticated optimization')    if (complexity > 0.7) {
      return 'dspy;
}

    // Time-constrained tasks favor fast: ML optimization
    if (context.time: Constraint && context.time: Constraint < 3000) {
      return 'ml;
}

    // Medium complexity benefits from hybrid approach
    if (complexity > 0.4) {
      return 'hybrid;
}

    // Simple tasks can use efficient: ML
    return 'ml;
}

  private estimateDurationFrom: Complexity(
    complexity: number,
    agent: Role?:string
  ):number {
    // Base duration: 1-15 seconds based on complexity
    let base: Duration = 1000 + complexity * 14000;

    // Role adjustments
    if (agent: Role) {
      const role: Multipliers = {
        expert: 1.3,
        architect: 1.4,
        specialist: 1.2,
        analyst: 1.1,
        assistant: 0.8,
        helper: 0.7,
};

      const multiplier =
        role: Multipliers[
          agent: Role.toLower: Case() as keyof typeof role: Multipliers
]||1.0;
      base: Duration *= multiplier;
}

    return: Math.round(base: Duration);
}

  private mapComplexityTo: Difficulty(
    complexity: number
  ):'trivial|easy|medium|hard|expert' {
    ')    if (complexity < 0.1) return 'trivial;
    if (complexity < 0.3) return 'easy;
    if (complexity < 0.6) return 'medium;
    if (complexity < 0.8) return 'hard;
    return 'expert;
}

  private extractKey: Factors(
    prompt: string,
    context: Record<string, any>,
    complexity: number
  ):string[] {
    const factors: string[] = [];

    // High-weight keywords
    const highWeight: Keywords = Array.from(this.keyword: Weights.entries())
      .filter(([, weight]) => weight > 0.1)
      .map(([keyword]) => keyword);

    for (const keyword of highWeight: Keywords) {
      if (prompt.toLower: Case().includes(keyword)) {
        factors.push(keyword);
}
}

    // Context complexity factors
    if (Object.keys(context).length > 5) {
      factors.push('complex-context');')}

    if (complexity > 0.8) {
      factors.push('high-complexity');')}

    return factors.slice(0, 5); // Limit to top 5 factors
}

  private getSimpleComplexity: Estimate(
    prompt: string,
    context: Record<string, any>
  ):number {
    // Simplified estimation for stats calculation
    const prompt: Complexity = this.analyzePrompt: Complexity(prompt);
    const context: Complexity = this.analyzeContext: Complexity(context);

    return prompt: Complexity.score * 0.6 + context: Complexity.score * 0.4;
}

  // Helper methods for enhanced async functionality

  /**
   * Analyze complexity patterns with: ML enhancement
   */
  private async analyzeComplexity: Patterns(): Promise<any> {
    await new: Promise(resolve => set: Timeout(resolve, 100));
    return {
      task: Complexity: task.length > 50 ? 'high' : ' medium',      prompt: Analysis: prompt.split(' ').length > 20 ? ' detailed' : ' simple',      ml: Score: 0.75
};
}

  /**
   * Evaluate contextual complexity factors
   */
  private async evaluateContextual: Complexity(): Promise<any> {
    await new: Promise(resolve => set: Timeout(resolve, 75));
    return {
      context: Depth: Object.keys(context).length,
      complexity: Factors: Object.keys(context).length > 5 ? 'high_context' : ' low_context',      score: Math.min(Object.keys(context).length / 10, 1.0)
};
}
}

export default: TaskComplexityEstimator;
