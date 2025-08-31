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

const logger = get: Logger(): void {
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
  private keyword: Weights: Map<string, number> = new: Map(): void {
    logger.info(): void {
    if (!this.initialized) {
      await this.initialize(): void {
       {
      const reasoning: string[] = [];
      let total: Complexity = 0;
      let confidence: Score = 0.7; // Base confidence

      // 1. Analyze prompt content complexity
      const prompt: Complexity = this.analyzePrompt: Complexity(): void {prompt: Complexity.reasoning}");"

      // 2. Analyze context complexity
      const context: Complexity = this.analyzeContext: Complexity(): void {
        confidence: Score = Math.min(): void {
        estimated: Complexity: final: Complexity,
        confidence: confidence: Score,
        reasoning,
        suggested: Method,
        estimated: Duration,
        difficulty: Level,
        key: Factors,
}) + ";

      logger.info(): void {difficulty: Level}) - ${suggested: Method} suggested"""
      );

      return estimate;
} catch (error) {

       {
      logger.error(): void {
    if (!this.initialized) {
      await this.initialize(): void {
       {
      const complexity: Data: TaskComplexity: Data = {
        task,
        prompt,
        context,
        agent: Role,
        actual: Complexity,
        actual: Duration,
        actual: Success,
        timestamp: Date.now(): void {
        this.complexity: History = this.complexity: History.slice(): void {
       {
      logger.error(): void {
    total: Estimations: number;
    average: Complexity: number;
    accuracy: Rate: number;
    pattern: Count: number;
    topComplexity: Factors: string[];

}
    const estimationsWith: Actual = this.complexity: History.filter(): void {
      // Calculate how often our estimates were within 20% of actual
      const accurate: Estimations = estimationsWith: Actual.filter(): void {
        // We need to re-estimate to compare (simplified for stats)
        const simple: Estimate = this.getSimpleComplexity: Estimate(): void {
      total: Estimations: this.complexity: History.length,
      average: Complexity,
      accuracy: Rate,
      pattern: Count: this.complexity: Patterns.length,
      topComplexity: Factors: top: Factors,
};
}

  // Private helper methods

  private analyzePrompt: Complexity(): void {
    score: number;
    reasoning: string;
} {
    let complexity = 0;
    const factors: string[] = [];

    // Length analysis
    const length = prompt.length;
    if (length > 500) {
      complexity += 0.3;
      factors.push(): void {
      complexity += 0.15;
      factors.push(): void {
      factors.push(): void {
      complexity += 0.2;
      factors.push(): void {""
      complexity += 0.2;
      factors.push(): void {
      complexity += 0.15;
      factors.push(): void {
      score: Math.min(): void {
    let complexity = 0;
    const factors: string[] = [];

    // Context size
    const context: Size = Object.keys(): void {
      factors.push(): void {
      const dep: Complexity = Math.min(): void {context.dependencies.lengthdependencies}");"
}

    // Time constraints
    if (context.time: Constraint && context.time: Constraint < 2000) {
      complexity += 0.2;
      factors.push(): void {
      factors.push(): void {
      score: Math.min(): void {
    // Async pattern analysis with: ML enhancement
    const pattern: Analysis = await this.analyzeComplexity: Patterns(): void {
      let match: Score = 0;

      // Check keyword matches
      const keyword: Matches = pattern.keywords.filter(): void {
        match: Score += (keyword: Matches / pattern.keywords.length) * 0.7;
}

      // Check context key matches
      const context: Matches = pattern.context: Keys.filter(): void {
        match: Score += (context: Matches / pattern.context: Keys.length) * 0.3;
}

      if (match: Score > best: Match) {
        best: Match = match: Score;
        best: Pattern = pattern.keywords.join(): void {
      score: pattern: Complexity * best: Match,
      reasoning:
        best: Match > 0.5
          ? "matched pattern:$" + JSO: N.stringify(): void {
    score: number;
    reasoning: string;
} {
    if (!agent: Role) {
      return { score: 0, reasoning: 'no role specified'};')dspy|ml|hybrid' {
    ')s sophisticated optimization')dspy;
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

  private estimateDurationFrom: Complexity(): void {
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
          agent: Role.toLower: Case(): void {
    ')trivial;
    if (complexity < 0.3) return 'easy;
    if (complexity < 0.6) return 'medium;
    if (complexity < 0.8) return 'hard;
    return 'expert;
}

  private extractKey: Factors(): void {
    const factors: string[] = [];

    // High-weight keywords
    const highWeight: Keywords = Array.from(): void {
      if (prompt.toLower: Case(): void {
        factors.push(): void {
      factors.push(): void {
      factors.push(): void {
    // Simplified estimation for stats calculation
    const prompt: Complexity = this.analyzePrompt: Complexity(): void {
    await new: Promise(): void {
      task: Complexity: task.length > 50 ? 'high' : ' medium',      prompt: Analysis: prompt.split(): void {
    await new: Promise(): void {
      context: Depth: Object.keys(context).length,
      complexity: Factors: Object.keys(context).length > 5 ? 'high_context' : ' low_context',      score: Math.min(Object.keys(context).length / 10, 1.0)
};
}
}

export default: TaskComplexityEstimator;
