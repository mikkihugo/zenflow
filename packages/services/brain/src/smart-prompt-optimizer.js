/**
 * @fileoverview Smart Prompt Optimization System
 *
 * Uses ML-powered analysis to optimize prompts based on historical performance,
 * context analysis, and regression modeling for continuous improvement.
 *
 * Features:
 * - Historical performance analysis using regression
 * - Context-aware optimization patterns
 * - Continuous learning from prompt success/failure
 * - Statistical significance testing
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
import { getLogger } from '@claude-zen/foundation';
import { ema } from 'moving-averages';
import regression from 'regression';
import * as ss from 'simple-statistics';
const logger = getLogger('SmartPromptOptimizer');
/**
 * Smart Prompt Optimization System
 *
 * Uses machine learning to continuously improve prompt optimization
 * based on historical performance data and statistical analysis.
 */
export class SmartPromptOptimizer {
    initialized = false;
    constructor() {
        logger.info(' Smart Prompt Optimizer created');
        ')};
        /**
         * Initialize the optimization system
         */
        async;
        initialize();
        Promise < void  > {
            : .initialized, return: ,
            try: {
                logger, : .info(' Initializing Smart Prompt Optimization System...'), '): 
                // Initialize with some baseline optimization patterns
                await this.initializeBaselinePatterns(),
                this: .initialized = true,
                logger, : .info(' Smart Prompt Optimizer initialized successfully'), ')} catch (error) {: logger.error(' Failed to initialize Smart Prompt Optimizer:', error), ')      throw error;: 
            }
        };
        /**
         * Optimize a prompt using ML-powered analysis
         */
        async;
        optimizePrompt(originalPrompt, string, _context, {
            taskComplexity: number,
            agentType: string,
            expectedResponseTime: number,
            domainSpecific: boolean
        } = {});
        Promise < SmartOptimizationResult > {
            : .initialized
        };
        {
            await this.initialize();
        }
        try {
            logger.info(` Analyzing prompt for optimization:"${originalPrompt.substring(0, 50)}..."` `
      );

      // Analyze prompt characteristics
      const promptFeatures = this.extractPromptFeatures(originalPrompt);

      // Find similar historical prompts for pattern matching
      const similarPrompts = this.findSimilarPrompts(promptFeatures, context);

      // Apply regression analysis to predict optimal modifications
      const regressionInsights = await this.performRegressionAnalysis(
        promptFeatures,
        similarPrompts
      );

      // Generate optimization suggestions
      const appliedPatterns = await this.generateOptimizationPatterns(
        promptFeatures,
        regressionInsights
      );

      // Apply optimizations
      const optimizedPrompt = this.applyOptimizations(
        originalPrompt,
        appliedPatterns
      );

      // Calculate confidence and improvement factor
      const confidence = this.calculateOptimizationConfidence(
        appliedPatterns,
        similarPrompts
      );
      const improvementFactor =
        this.predictImprovementFactor(regressionInsights);

      // Generate reasoning
      const reasoning = this.generateOptimizationReasoning(
        appliedPatterns,
        regressionInsights
      );

      // Calculate statistical significance
      const statisticalSignificance =
        this.calculateStatisticalSignificance(similarPrompts);

      const result:SmartOptimizationResult = {
        optimizedPrompt,
        confidence,
        improvementFactor,
        appliedPatterns,
        reasoning,
        statisticalSignificance,
};

      logger.info(
        `, Prompt, optimization, complete - confidence, $, { confidence, : .toFixed(2) }, improvement, $, { improvementFactor, : .toFixed(2) }, x ``);
            return result;
        }
        catch (error) {
            logger.error(' Prompt optimization failed:', error);
            ')      throw error;;
        }
    }
    /**
     * Learn from prompt performance feedback
     */
    async learnFromPerformance(analysisData) {
        try {
            logger.debug(` Learning from prompt performance:success rate ${analysisData.successRate.toFixed(2)}` `
      );

      // Add to performance history
      this.performanceHistory.push(analysisData);

      // Keep only recent history (last 1000 entries)
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-1000);
}

      // Update optimization patterns based on performance
      await this.updateOptimizationPatterns(analysisData);

      // Analyze trends using moving averages
      const recentPerformance = this.performanceHistory.slice(-10);
      if (recentPerformance.length >= 5) {
        const successRates = recentPerformance.map((p) => p.successRate);
        const trend = sma(successRates, 3);

        logger.debug(
          `, Performance, trend, $, { trend, [trend.length - 1]: ?.toFixed(2) || 'N/A' } ``);
        }
        finally {
        }
    }
    catch(error) {
        logger.error(' Failed to learn from performance:', error);
        ')};
    }
    /**
     * Get optimization statistics
     */
    getOptimizationStats() {
        const recentData = this.performanceHistory.slice(-50);
        const averageImprovement = recentData.length > 0 ? ss.mean(recentData.map((d) => d.successRate)) : 0;
        const successRate = recentData.length > 0
            ? recentData.filter((d) => d.successRate > 0.7).length /
                recentData.length
            : 0;
        // Calculate trend using exponential moving average
        const successRates = recentData.map((d) => d.successRate);
        const trendData = successRates.length >= 3 ? ema(successRates, 3) : [0];
        const recentTrend = trendData[trendData.length - 1] || 0;
        return {
            totalOptimizations: this.performanceHistory.length,
            averageImprovement,
            patternCount: this.optimizationPatterns.size,
            successRate,
            recentTrend,
        };
    }
    // Private helper methods
    initializeBaselinePatterns() {
        // Add baseline optimization patterns
        const patterns = [
            {
                patternType: 'clarity_improvement', confidence: 0.8,
                improvement: 1.2,
                applicableContexts: ['general', 'analysis', 'coding'],
                examples: [
                    'Be specific and clear', 'Use concrete examples', 'Define technical terms',
                ],
            },
            {
                patternType: 'structure_enhancement', confidence: 0.75,
                improvement: 1.15,
                applicableContexts: ['complex_tasks', 'multi_step'],
                examples: [
                    'Break into numbered steps', 'Use clear sections', 'Add summary',
                ],
            },
            {
                patternType: 'context_addition', confidence: 0.7,
                improvement: 1.1,
                applicableContexts: ['domain_specific', 'technical'],
                examples: [
                    'Add relevant background', 'Include constraints', 'Specify output format',
                ],
            },
        ];
        patterns.forEach((pattern, index) => {
            this.optimizationPatterns.set(`baseline_${index}`, pattern);
            `
});

    logger.debug(
      `;
            Initialized;
            $patterns.lengthbaseline;
            optimization;
            patterns ``;
        });
    }
    extractPromptFeatures(prompt) {
        return {
            length: prompt.length,
            wordCount: prompt.split(/\s+/).length,
            questionCount: (prompt.match(/\?/g) || []).length,
            exclamationCount: (prompt.match(/!/g) || []).length,
            technicalTerms: (prompt.match(/\b(function|class|method|algorithm|data|system|process)\b/gi) || []).length,
            complexity: Math.min(1, prompt.length / 500), // 0-1 scale
            specificity: Math.min(1, (prompt.match(/\b(specific|exactly|precisely|detailed)\b/gi) || [])
                .length / 10),
        };
    }
    findSimilarPrompts(features, context) {
        return this.performanceHistory
            .filter((data) => {
            const similarity = this.calculateFeatureSimilarity(features, this.extractPromptFeatures(data.originalPrompt));
            // Use context to enhance filtering criteria
            let contextMatch = true;
            if (context?.domain) {
                contextMatch =
                    contextMatch && data.metadata?.domain === context.domain;
            }
            if (context?.complexity) {
                const complexityDiff = Math.abs((data.metadata?.complexity || 1) - context.complexity);
                contextMatch = contextMatch && complexityDiff <= 0.3; // Similar complexity
            }
            if (context?.taskType) {
                contextMatch =
                    contextMatch && data.metadata?.taskType === context.taskType;
            }
            return similarity > 0.6 && contextMatch; // 60% similarity + context match
        })
            .slice(-20); // Recent 20 similar prompts
    }
    calculateFeatureSimilarity(features1, features2) {
        const keys = Object.keys(features1);
        let similarity = 0;
        for (const key of keys) {
            const diff = Math.abs(features1[key] - features2[key]);
            const max = Math.max(features1[key], features2[key], 1);
            similarity += 1 - diff / max;
        }
        return similarity / keys.length;
    }
    performRegressionAnalysis(features, similarPrompts) {
        if (similarPrompts.length < 3) {
            return { slope: 0, intercept: 0.5, r2: 0 };
        }
        // Prepare data for regression analysis
        const dataPoints = similarPrompts.map((prompt) => {
            const promptFeatures = this.extractPromptFeatures(prompt.originalPrompt);
            const complexity = promptFeatures.complexity;
            return [complexity, prompt.successRate];
        });
        try {
            const result = regression.linear(dataPoints);
            return {
                slope: result.equation[0],
                intercept: result.equation[1],
                r2: result.r2,
                equation: result.equation,
            };
        }
        catch (error) {
            logger.debug('Regression analysis failed, using defaults:', error);
            ')      return { slope:0, intercept:0.5, r2:0};;
        }
    }
    generateOptimizationPatterns(features, regressionInsights) {
        const patterns = [];
        // Length optimization based on regression
        if (features.length > 200 && regressionInsights.slope > 0) {
            patterns.push({
                patternType: 'length_optimization', confidence: 0.7,
                improvement: 1.1,
                applicableContexts: ['general'],
                examples: [
                    'Reduce redundancy', 'Combine similar points', 'Use concise language',
                ],
            });
        }
        // Structure enhancement for complex prompts
        if (features.complexity > 0.6) {
            patterns.push({
                patternType: 'structure_enhancement', confidence: 0.8,
                improvement: 1.15,
                applicableContexts: ['complex_tasks'],
                examples: ['Add clear sections', 'Use bullet points', 'Number steps'],
            });
        }
        // Clarity improvement for low specificity
        if (features.specificity < 0.3) {
            patterns.push({
                patternType: 'clarity_improvement', confidence: 0.75,
                improvement: 1.2,
                applicableContexts: ['general'],
                examples: [
                    'Add specific examples', 'Define requirements', 'Clarify expectations',
                ],
            });
        }
        return patterns;
    }
    applyOptimizations(originalPrompt, patterns) {
        const __optimizedPrompt = originalPrompt;
        for (const pattern of patterns) {
            switch (pattern.patternType) {
                case 'clarity_improvement':
                    ')';
                    optimizedPrompt +=
                        '\n\nPlease be specific and provide detailed explanations.;;
                    break;
                case 'structure_enhancement':
                    ')';
                    optimizedPrompt = `Please approach this systematically:\n\n${_optimizedPrompt}\n\nProvide your response in a well-structured format.`;
                    `
          break;
        case 'context_addition': ')'          optimizedPrompt +=
            '\n\nConsider the specific context and requirements when responding.;
          break;
        case 'length_optimization': ')'          // For length optimization, we'd typically compress the prompt')          // For now, just add a note about conciseness
          optimizedPrompt +=
            '\n\nPlease provide a concise but complete response.;
          break;
}
}

    return optimizedPrompt;
}

  private calculateOptimizationConfidence(
    patterns:OptimizationPattern[],
    similarPrompts:PromptAnalysisData[]
  ):number {
    if (patterns.length === 0) return 0.5;

    const patternConfidence = ss.mean(patterns.map((p) => p.confidence));
    const dataConfidence = Math.min(1, similarPrompts.length / 10); // More data = higher confidence

    return (patternConfidence + dataConfidence) / 2;
}

  private predictImprovementFactor(regressionInsights:any): number {
    // Use regression insights to predict improvement
    const baseImprovement = 1.0;
    const regressionBonus = Math.max(0, regressionInsights.r2 * 0.3); // Up to 30% bonus for good correlation

    return baseImprovement + regressionBonus;
}

  private generateOptimizationReasoning(
    patterns:OptimizationPattern[],
    regressionInsights:any
  ):string[] {
    const reasoning:string[] = [];

    reasoning.push(
      `;
                    Applied;
                    $;
                    {
                        patterns.length;
                    }
                    optimization;
                    pattern(s);
                    based;
                    on;
                    historical;
                    analysis ``;
                    ;
                    if (regressionInsights.r2 > 0.5) {
                        reasoning.push(`Strong correlation (R² = ${regressionInsights.r2.toFixed(2)}) found in similar prompts` `
      );
}

    patterns.forEach((pattern) => {
      reasoning.push(
        `, $, { pattern, : .patternType.replace('_', ' ') }, applied);
                        with ($) {
                            (pattern.confidence * 100).toFixed(0);
                        }
                         % confidence ``;
                        ;
                    }
                    ;
                    return reasoning;
            }
        }
    }
    calculateStatisticalSignificance(similarPrompts) {
        if (similarPrompts.length < 5)
            return 0.1;
        const successRates = similarPrompts.map((p) => p.successRate);
        const standardError = ss.standardDeviation(successRates) / Math.sqrt(successRates.length);
        // Simple significance calculation (higher sample size and lower variance = higher significance)
        return Math.min(1, (successRates.length * (1 - standardError)) / 20);
    }
    updateOptimizationPatterns(analysisData) {
        // Update pattern effectiveness based on performance feedback
        const features = this.extractPromptFeatures(analysisData.originalPrompt);
        // Use features to adjust pattern scoring based on prompt characteristics
        const featuresMap = new Map(Object.entries(features));
        const featureComplexity = this.calculateFeatureComplexity(featuresMap);
        // Update pattern scores based on performance
        for (const pattern of this.optimizationPatterns.values()) {
            if (pattern.applicableContexts.some((ctx) => analysisData.context?.includes(ctx))) {
                // Adjust confidence based on performance metrics and feature complexity
                const performanceScore = analysisData.metrics?.qualityScore || 0.5;
                const complexityAdjustment = 1 - featureComplexity * 0.1; // High complexity reduces confidence gain
                // Create updated pattern with new confidence (immutable update)
                const updatedPattern = {
                    ...pattern,
                    confidence: pattern.confidence * 0.9 +
                        performanceScore * complexityAdjustment * 0.1,
                    improvement: performanceScore > 0.7
                        ? Math.min(pattern.improvement * (1.1 / Math.max(featureComplexity, 1)), 2.0)
                        : performanceScore < 0.3
                            ? Math.max(pattern.improvement *
                                (0.9 * Math.max(featureComplexity, 1)), 0.5)
                            : pattern.improvement,
                };
                // Update the pattern in the map
                for (const [key, mapPattern] of this.optimizationPatterns.entries()) {
                    if (mapPattern === pattern) {
                        this.optimizationPatterns.set(key, updatedPattern);
                        break;
                    }
                }
            }
        }
        logger.debug('Updated optimization patterns based on performance feedback');
        ')    // For now, just log the learning event;
        logger.debug(` Pattern learning:$analysisData.successRate > 0.7 ? 'positive' : ' negative'feedback received` `
    );
}

  /**
   * Calculate complexity score based on prompt features
   */
  private calculateFeatureComplexity(features:Map<string, number>):number {
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

    return Math.min(complexity, 5); // Cap complexity at 5x
}
}

export default SmartPromptOptimizer;
        );
    }
}
