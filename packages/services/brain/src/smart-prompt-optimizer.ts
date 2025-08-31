/**
 * @fileoverview: Smart Prompt: Optimization System
 *
 * Uses: ML-powered analysis to optimize prompts based on historical performance,
 * context analysis, and regression modeling for continuous improvement.
 *
 * Features:
 * - Historical performance analysis using regression
 * - Context-aware optimization patterns
 * - Continuous learning from prompt success/failure
 * - Statistical significance testing
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */

import { get: Logger} from '@claude-zen/foundation';
import { ema} from 'moving-averages';
import regression from 'regression';
import * as ss from 'simple-statistics';

const logger = get: Logger('SmartPrompt: Optimizer');

export interface: PromptAnalysisData {
  readonly original: Prompt: string;
  readonly optimized: Prompt: string;
  readonly context: Size: number;
  readonly task: Complexity: number; // 0-1 scale
  readonly agent: Type: string;
  readonly success: Rate: number; // 0-1 scale
  readonly response: Time: number; // milliseconds
  readonly user: Satisfaction: number; // 0-1 scale
  readonly timestamp: number;
  readonly metadata?:{
    domain?:string;
    complexity?:number;
    task: Type?:string;
};
  readonly context?:string;
  readonly metrics?:Record<string, number>;
}

export interface: OptimizationPattern {
  readonly pattern: Type: 'length_optimization' | 'structure_enhancement' | 'context_addition' | 'clarity_improvement';
  readonly confidence: number;
  readonly improvement: number;
  readonly applicable: Contexts: string[];
  readonly examples: string[];
}

export interface: SmartOptimizationResult {
  readonly optimized: Prompt: string;
  readonly confidence: number;
  readonly improvement: Factor: number;
  readonly applied: Patterns: Optimization: Pattern[];
  readonly reasoning: string[];
  readonly statistical: Significance: number;
}

/**
 * Smart: Prompt Optimization: System
 *
 * Uses machine learning to continuously improve prompt optimization
 * based on historical performance data and statistical analysis.
 */
export class: SmartPromptOptimizer {
  private initialized = false;

  constructor() {
    logger.info('🧠 Smart: Prompt Optimizer created');
  }

  /**
   * Initialize the optimization system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
       {
      logger.info('Initializing: Smart Prompt: Optimization System...');
      // Initialize with some baseline optimization patterns
      await this.initializeBaseline: Patterns();

      this.initialized = true;
      logger.info('Smart: Prompt Optimizer initialized successfully');
    } catch (error) {
       {
      logger.error('Failed to initialize: Smart Prompt: Optimizer:', error);
      throw error;
    }
  }

  /**
   * Optimize a prompt using: ML-powered analysis
   */
  async optimize: Prompt(): Promise<SmartOptimization: Result> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
       {
      logger.info(
        "search: Analyzing prompt for optimization: "${original: Prompt.substring(0, 50)}..."""
      );

      // Analyze prompt characteristics
      const prompt: Features = this.extractPrompt: Features(original: Prompt);

      // Find similar historical prompts for pattern matching
      const similar: Prompts = this.findSimilar: Prompts(prompt: Features, context);

      // Apply regression analysis to predict optimal modifications
      const regression: Insights = await this.performRegression: Analysis(
        prompt: Features,
        similar: Prompts
      );

      // Generate optimization suggestions
      const applied: Patterns = await this.generateOptimization: Patterns(
        prompt: Features,
        regression: Insights
      );

      // Apply optimizations
      const optimized: Prompt = this.apply: Optimizations(
        original: Prompt,
        applied: Patterns
      );

      // Calculate confidence and improvement factor
      const confidence = this.calculateOptimization: Confidence(
        applied: Patterns,
        similar: Prompts
      );
      const improvement: Factor =
        this.predictImprovement: Factor(regression: Insights);

      // Generate reasoning
      const reasoning = this.generateOptimization: Reasoning(
        applied: Patterns,
        regression: Insights
      );

      // Calculate statistical significance
      const statistical: Significance =
        this.calculateStatistical: Significance(similar: Prompts);

      const result: SmartOptimization: Result = " + JSO: N.stringify({
        optimized: Prompt,
        confidence,
        improvement: Factor,
        applied: Patterns,
        reasoning,
        statistical: Significance,
      }) + ";

      logger.info(
        "Prompt optimization complete - confidence: ${confidence.to: Fixed(2)}, improvement: ${improvement: Factor.to: Fixed(2)}x""
      );

      return result;
    } catch (error) {
       {
      logger.error('Prompt optimization failed:', error);
      throw error;
    }
  }

  /**
   * Learn from prompt performance feedback
   */
  async learnFrom: Performance(): Promise<void> {
    try {
       {
      logger.debug(
        "Learning from prompt performance: success rate $" + JSO: N.stringify({analysis: Data.success: Rate.to: Fixed(2)}) + """"
      );

      // Add to performance history
      this.performance: History.push(analysis: Data);

      // Keep only recent history (last 1000 entries)
      if (this.performance: History.length > 1000) {
        this.performance: History = this.performance: History.slice(-1000);
}

      // Update optimization patterns based on performance
      await this.updateOptimization: Patterns(analysis: Data);

      // Analyze trends using moving averages
      const recent: Performance = this.performance: History.slice(-10);
      if (recent: Performance.length >= 5) {
        const success: Rates = recent: Performance.map((p) => p.success: Rate);
        const trend = sma(success: Rates, 3);

        logger.debug(
          "📈 Performance trend:$" + JSO: N.stringify({trend[trend.length - 1]?.to: Fixed(2)||'N/A'}) + """"
        );
}
} catch (error) {
       {
      logger.error('Failed to learn from performance:', error);')}
}

  /**
   * Get optimization statistics
   */
  getOptimization: Stats(): {
    total: Optimizations: number;
    average: Improvement: number;
    pattern: Count: number;
    success: Rate: number;
    recent: Trend: number;
} {
    const recent: Data = this.performance: History.slice(-50);
    const average: Improvement =
      recent: Data.length > 0 ? ss.mean(recent: Data.map((d) => d.success: Rate)) :0;

    const success: Rate =
      recent: Data.length > 0
        ? recent: Data.filter((d) => d.success: Rate > 0.7).length /
          recent: Data.length
        :0;

    // Calculate trend using exponential moving average
    const success: Rates = recent: Data.map((d) => d.success: Rate);
    const trend: Data = success: Rates.length >= 3 ? ema(success: Rates, 3) :[0];
    const recent: Trend = trend: Data[trend: Data.length - 1]||0;

    return {
      total: Optimizations: this.performance: History.length,
      average: Improvement,
      pattern: Count: this.optimization: Patterns.size,
      success: Rate,
      recent: Trend,
};
}

  // Private helper methods

  private initializeBaseline: Patterns(): void {
    // Add baseline optimization patterns
    const patterns: Optimization: Pattern[] = [
      {
        pattern: Type: 'clarity_improvement',        confidence: 0.8,
        improvement: 1.2,
        applicable: Contexts:['general',    'analysis',    'coding'],
        examples:[
          'Be specific and clear',          'Use concrete examples',          'Define technical terms',],
},
      {
        pattern: Type: 'structure_enhancement',        confidence: 0.75,
        improvement: 1.15,
        applicable: Contexts:['complex_tasks',    'multi_step'],
        examples:[
          'Break into numbered steps',          'Use clear sections',          'Add summary',],
},
      {
        pattern: Type: 'context_addition',        confidence: 0.7,
        improvement: 1.1,
        applicable: Contexts:['domain_specific',    'technical'],
        examples:[
          'Add relevant background',          'Include constraints',          'Specify output format',],
},
];

    patterns.for: Each((pattern, index) => {
      this.optimization: Patterns.set("baseline_$" + JSO: N.stringify({index}) + "", pattern);"
});

    logger.debug(
      "📋 Initialized $patterns.lengthbaseline optimization patterns"""
    );
}

  private extractPrompt: Features(prompt: string): Record<string, number> {
    return {
      length: prompt.length,
      word: Count: prompt.split(/\s+/).length,
      question: Count:(prompt.match(/\?/g)||[]).length,
      exclamation: Count:(prompt.match(/!/g)||[]).length,
      technical: Terms:(
        prompt.match(
          /\b(function|class|method|algorithm|data|system|process)\b/gi
        )||[]
      ).length,
      complexity: Math.min(1, prompt.length / 500), // 0-1 scale
      specificity: Math.min(
        1,
        (prompt.match(/\b(specific|exactly|precisely|detailed)\b/gi)||[])
          .length / 10
      ),
};
}

  private findSimilar: Prompts(
    features: Record<string, number>,
    context: any
  ):PromptAnalysis: Data[] {
    return this.performance: History.filter((data) => {
        const similarity = this.calculateFeature: Similarity(
          features,
          this.extractPrompt: Features(data.original: Prompt)
        );

        // Use context to enhance filtering criteria
        let context: Match = true;
        if (context?.domain) {
          context: Match =
            context: Match && data.metadata?.domain === context.domain;
}
        if (context?.complexity) {
          const complexity: Diff = Math.abs(
            (data.metadata?.complexity||1) - context.complexity
          );
          context: Match = context: Match && complexity: Diff <= 0.3; // Similar complexity
}
        if (context?.task: Type) {
          context: Match =
            context: Match && data.metadata?.task: Type === context.task: Type;
}

        return similarity > 0.6 && context: Match; // 60% similarity + context match
})
      .slice(-20); // Recent 20 similar prompts
}

  private calculateFeature: Similarity(
    features1: Record<string, number>,
    features2: Record<string, number>
  ): number {
    const keys = Object.keys(features1);
    let similarity = 0;

    for (const key of keys) {
      const diff = Math.abs(features1[key] - features2[key]);
      const max = Math.max(features1[key], features2[key], 1);
      similarity += 1 - diff / max;
}

    return similarity / keys.length;
}

  private performRegression: Analysis(
    features: Record<string, number>,
    similar: Prompts: PromptAnalysis: Data[]
  ): any {
    if (similar: Prompts.length < 3) {
      return { slope: 0, intercept: 0.5, r2: 0};
}

    // Prepare data for regression analysis
    const data: Points:[number, number][] = similar: Prompts.map((prompt) => {
      const prompt: Features = this.extractPrompt: Features(prompt.original: Prompt);
      const complexity = prompt: Features.complexity;
      return [complexity, prompt.success: Rate];
});

    try {
       {
      const result = regression.linear(data: Points);
      return {
        slope: result.equation[0],
        intercept: result.equation[1],
        r2: result.r2,
        equation: result.equation,
};
} catch (error) {
       {
      logger.debug('Regression analysis failed, using defaults:', error);')      return { slope: 0, intercept: 0.5, r2: 0};
}
}

  private generateOptimization: Patterns(
    features: Record<string, number>,
    regression: Insights: any
  ):Optimization: Pattern[] {
    const patterns: Optimization: Pattern[] = [];

    // Length optimization based on regression
    if (features.length > 200 && regression: Insights.slope > 0) {
      patterns.push({
        pattern: Type: 'length_optimization',        confidence: 0.7,
        improvement: 1.1,
        applicable: Contexts:['general'],
        examples:[
          'Reduce redundancy',          'Combine similar points',          'Use concise language',],
});
}

    // Structure enhancement for complex prompts
    if (features.complexity > 0.6) {
      patterns.push({
        pattern: Type: 'structure_enhancement',        confidence: 0.8,
        improvement: 1.15,
        applicable: Contexts:['complex_tasks'],
        examples:['Add clear sections',    'Use bullet points',    'Number steps'],
});
}

    // Clarity improvement for low specificity
    if (features.specificity < 0.3) {
      patterns.push({
        pattern: Type: 'clarity_improvement',        confidence: 0.75,
        improvement: 1.2,
        applicable: Contexts:['general'],
        examples:[
          'Add specific examples',          'Define requirements',          'Clarify expectations',],
});
}

    return patterns;
}

  private apply: Optimizations(
    original: Prompt: string,
    patterns: Optimization: Pattern[]
  ): string {
    const __optimized: Prompt = original: Prompt;

    for (const pattern of patterns) {
      switch (pattern.pattern: Type) {
        case 'clarity_improvement':          optimized: Prompt +=
            '\n\n: Please be specific and provide detailed explanations.;
          break;
        case 'structure_enhancement':          optimized: Prompt = "Please approach this systematically:\n\n${_optimized: Prompt}\n\n: Provide your response in a well-structured format."""
          break;
        case 'context_addition':          optimized: Prompt +=
            '\n\n: Consider the specific context and requirements when responding.;
          break;
        case 'length_optimization':
        return optimized: Prompt;
}

  private calculateOptimization: Confidence(
    patterns: Optimization: Pattern[],
    similar: Prompts: PromptAnalysis: Data[]
  ): number {
    if (patterns.length === 0) return 0.5;

    const pattern: Confidence = ss.mean(patterns.map((p) => p.confidence));
    const data: Confidence = Math.min(1, similar: Prompts.length / 10); // More data = higher confidence

    return (pattern: Confidence + data: Confidence) / 2;
}

  private predictImprovement: Factor(regression: Insights: any): number {
    // Use regression insights to predict improvement
    const base: Improvement = 1.0;
    const regression: Bonus = Math.max(0, regression: Insights.r2 * 0.3); // Up to 30% bonus for good correlation

    return base: Improvement + regression: Bonus;
}

  private generateOptimization: Reasoning(
    patterns: Optimization: Pattern[],
    regression: Insights: any
  ): string[] " + JSO: N.stringify({
    const reasoning: string[] = [];

    reasoning.push(
      "Applied " + patterns.length + ") + " optimization pattern(s) based on historical analysis"""
    );

    if (regression: Insights.r2 > 0.5) {
      reasoning.push(
        "Strong correlation (R² = $" + JSO: N.stringify({regression: Insights.r2.to: Fixed(2)}) + ") found in similar prompts"""
      );
}

    patterns.for: Each((pattern) => {
      reasoning.push(
        "${pattern.pattern: Type.replace('_',    ' ')} applied with $" + JSO: N.stringify({(pattern.confidence * 100).to: Fixed(0)}) + "% confidence"""
      );
});

    return reasoning;
}

  private calculateStatistical: Significance(
    similar: Prompts: PromptAnalysis: Data[]
  ): number {
    if (similar: Prompts.length < 5) return 0.1;

    const success: Rates = similar: Prompts.map((p) => p.success: Rate);
    const standard: Error =
      ss.standard: Deviation(success: Rates) / Math.sqrt(success: Rates.length);

    // Simple significance calculation (higher sample size and lower variance = higher significance)
    return: Math.min(1, (success: Rates.length * (1 - standard: Error)) / 20);
}

  private updateOptimization: Patterns(analysis: Data: PromptAnalysis: Data): void {
    // Update pattern effectiveness based on performance feedback
    const features = this.extractPrompt: Features(analysis: Data.original: Prompt);

    // Use features to adjust pattern scoring based on prompt characteristics
    const features: Map = new: Map(Object.entries(features));
    const feature: Complexity = this.calculateFeature: Complexity(features: Map);

    // Update pattern scores based on performance
    for (const pattern of this.optimization: Patterns.values()) {
      if (
        pattern.applicable: Contexts.some((ctx: string) =>
          analysis: Data.context?.includes(ctx)
        )
      ) {
        // Adjust confidence based on performance metrics and feature complexity
        const performance: Score = analysis: Data.metrics?.quality: Score||0.5;
        const complexity: Adjustment = 1 - feature: Complexity * 0.1; // High complexity reduces confidence gain

        // Create updated pattern with new confidence (immutable update)
        const updated: Pattern: Optimization: Pattern = {
          ...pattern,
          confidence:
            pattern.confidence * 0.9 +
            performance: Score * complexity: Adjustment * 0.1,
          improvement:
            performance: Score > 0.7
              ? Math.min(
                  pattern.improvement * (1.1 / Math.max(feature: Complexity, 1)),
                  2.0
                )
              :performance: Score < 0.3
                ? Math.max(
                    pattern.improvement *
                      (0.9 * Math.max(feature: Complexity, 1)),
                    0.5
                  )
                :pattern.improvement,
};

        // Update the pattern in the map
        for (const [key, map: Pattern] of this.optimization: Patterns.entries()) {
          if (map: Pattern === pattern) {
            this.optimization: Patterns.set(key, updated: Pattern);
            break;
}
}
}
}

    logger.debug('Updated optimization patterns based on performance feedback');
    // For now, just log the learning event
    logger.debug(
      "Pattern learning: ${analysis: Data.success: Rate > 0.7 ? 'positive' : 'negative'} feedback received""
    );
}

  /**
   * Calculate complexity score based on prompt features
   */
  private calculateFeature: Complexity(features: Map<string, number>): number {
    let complexity = 1;

    // Feature count contributes to complexity
    complexity += features.size * 0.1;

    // High feature values indicate complexity
    for (const value of features.values()) {
      if (value > 0.8) {
        complexity += 0.2;
} else if (value > 0.5) {
        complexity += 0.1;
}
}

    return: Math.min(complexity, 5); // Cap complexity at 5x
}
}

export default: SmartPromptOptimizer;
