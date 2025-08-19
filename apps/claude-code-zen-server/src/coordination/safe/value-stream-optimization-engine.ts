/**
 * @fileoverview Value Stream Optimization Engine - Lightweight facade for @claude-zen/safe-framework
 * 
 * This file provides a lightweight facade that delegates to the extracted
 * ValueStreamOptimizationEngine from @claude-zen/safe-framework package.
 * 
 * EXTRACTION: 1,331 → 32 lines (97.6% reduction) through package delegation
 * 
 * Delegates to:
 * - @claude-zen/safe-framework: ValueStreamOptimizationEngine for advanced optimization capabilities
 * 
 * REDUCTION: 1,331 → 32 lines (97.6% reduction) through package delegation
 */

// Re-export everything from the safe-framework package
export {
  ValueStreamOptimizationEngine,
  type OptimizationEngineConfig,
  type AdvancedBottleneckAnalysis,
  type AIOptimizationRecommendation,
  type AutomatedKaizenCycle,
  type ValueDeliveryPrediction,
  type OptimizationEngineState
} from '@claude-zen/safe-framework';

// Re-export supporting types
export type {
  ValueStreamFlowAnalysis,
  FlowBottleneck,
  FlowOptimizationRecommendation,
  ExpectedImpact,
  ContinuousImprovement,
  DateRange
} from '@claude-zen/safe-framework';

// Default export
export { ValueStreamOptimizationEngine as default } from '@claude-zen/safe-framework';