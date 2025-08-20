/**
 * @fileoverview Value Stream Optimization Engine - Lightweight facade for @claude-zen/enterprise
 * 
 * This file provides a lightweight facade that delegates to the extracted
 * ValueStreamOptimizationEngine from @claude-zen/enterprise package.
 * 
 * EXTRACTION: 1,331 → 32 lines (97.6% reduction) through package delegation
 * 
 * Delegates to:
 * - @claude-zen/enterprise: ValueStreamOptimizationEngine for advanced optimization capabilities
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
} from '@claude-zen/enterprise';

// Re-export supporting types
export type {
  ValueStreamFlowAnalysis,
  FlowBottleneck,
  FlowOptimizationRecommendation,
  ExpectedImpact,
  ContinuousImprovement,
  DateRange
} from '@claude-zen/enterprise';

// Default export
export { ValueStreamOptimizationEngine as default } from '@claude-zen/enterprise';