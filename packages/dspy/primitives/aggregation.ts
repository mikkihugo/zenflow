/**
 * @fileoverview DSPy Aggregation Functions
 * 
 * Implementation of majority voting and other aggregation methods for
 * combining multiple predictions. Based on Stanford's DSPy aggregation.py
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { Prediction } from './prediction.js';
import type { Example } from '../interfaces/types.js';

/**
 * Generic aggregation function type
 */
export type AggregationFunction = (predictions: Prediction[], field?: string) => Prediction;

/**
 * Default text normalization function
 */
export function defaultNormalize(text: string): string | null {
  if (!text || typeof text !== 'string') return null;
  
  // Basic normalization: lowercase, trim, remove extra spaces
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  return normalized || null;
}

/**
 * Normalize text for comparison (exposed for customization)
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
}

/**
 * Majority voting function for aggregating multiple predictions
 * 
 * Returns the most common completion for the target field.
 * When normalize returns null, that completion is ignored.
 * In case of a tie, earlier completions are prioritized.
 * 
 * @param predictions - Array of predictions or completions
 * @param normalize - Normalization function for values
 * @param field - Target field name (defaults to last output field)
 * @returns Prediction with majority value
 */
export function majority<T = any>(
  predictions: Prediction[] | T[],
  normalize: (text: string) => string | null = defaultNormalize,
  field?: string
): Prediction {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error('Predictions array cannot be empty');
  }

  // Convert to predictions if needed
  let completions: Prediction[];
  if (predictions.every(p => p && typeof p === 'object' && 'outputs' in p)) {
    completions = predictions as Prediction[];
  } else {
    // Assume array of objects with field values
    completions = (predictions as T[]).map((item, index) => ({
      id: `completion-${index}`,
      outputs: item as Record<string, any>,
      metadata: {},
      trace: []
    }));
  }

  // Determine target field
  let targetField = field;
  if (!targetField && completions.length > 0) {
    const outputs = completions[0].outputs;
    if (outputs && typeof outputs === 'object') {
      const keys = Object.keys(outputs);
      targetField = keys[keys.length - 1]; // Last field
    }
  }

  if (!targetField) {
    throw new Error('No target field specified and cannot determine from completions');
  }

  // Extract and normalize values
  const values = completions.map(completion => {
    const value = completion.outputs?.[targetField];
    return typeof value === 'string' ? value : String(value || '');
  });

  const normalizedValues = values.map(normalize).filter(v => v !== null) as string[];
  
  if (normalizedValues.length === 0) {
    // Fallback to original values if all normalized to null
    normalizedValues.push(...values.filter(v => v));
  }

  // Count occurrences
  const valueCounts = new Map<string, number>();
  normalizedValues.forEach(value => {
    valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
  });

  if (valueCounts.size === 0) {
    throw new Error('No valid values found for majority voting');
  }

  // Find majority value
  let majorityValue = '';
  let maxCount = 0;
  
  for (const [value, count] of valueCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      majorityValue = value;
    }
  }

  // Find first completion with majority value
  let winningCompletion: Prediction | null = null;
  for (const completion of completions) {
    const value = completion.outputs?.[targetField];
    const normalizedValue = normalize(typeof value === 'string' ? value : String(value || ''));
    
    if (normalizedValue === majorityValue) {
      winningCompletion = completion;
      break;
    }
  }

  if (!winningCompletion) {
    // Fallback to first completion
    winningCompletion = completions[0];
  }

  return {
    id: `majority-${Date.now()}`,
    outputs: winningCompletion.outputs,
    metadata: {
      ...winningCompletion.metadata,
      aggregation: 'majority',
      total_completions: completions.length,
      majority_count: maxCount,
      majority_field: targetField
    },
    trace: winningCompletion.trace || []
  };
}

/**
 * Weighted majority voting with confidence scores
 */
export function weightedMajority<T = any>(
  predictions: Array<{ prediction: Prediction | T; weight: number }>,
  normalize: (text: string) => string | null = defaultNormalize,
  field?: string
): Prediction {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error('Predictions array cannot be empty');
  }

  // Convert to weighted completions
  const weightedCompletions = predictions.map((item, index) => {
    let completion: Prediction;
    if (item.prediction && typeof item.prediction === 'object' && 'outputs' in item.prediction) {
      completion = item.prediction as Prediction;
    } else {
      completion = {
        id: `completion-${index}`,
        outputs: item.prediction as Record<string, any>,
        metadata: {},
        trace: []
      };
    }
    return { completion, weight: item.weight };
  });

  // Determine target field
  let targetField = field;
  if (!targetField && weightedCompletions.length > 0) {
    const outputs = weightedCompletions[0].completion.outputs;
    if (outputs && typeof outputs === 'object') {
      const keys = Object.keys(outputs);
      targetField = keys[keys.length - 1];
    }
  }

  if (!targetField) {
    throw new Error('No target field specified and cannot determine from completions');
  }

  // Calculate weighted counts
  const weightedCounts = new Map<string, number>();
  let totalWeight = 0;

  for (const { completion, weight } of weightedCompletions) {
    const value = completion.outputs?.[targetField];
    const normalizedValue = normalize(typeof value === 'string' ? value : String(value || ''));
    
    if (normalizedValue !== null) {
      weightedCounts.set(normalizedValue, (weightedCounts.get(normalizedValue) || 0) + weight);
      totalWeight += weight;
    }
  }

  if (weightedCounts.size === 0) {
    throw new Error('No valid values found for weighted majority voting');
  }

  // Find weighted majority
  let majorityValue = '';
  let maxWeight = 0;
  
  for (const [value, weight] of weightedCounts.entries()) {
    if (weight > maxWeight) {
      maxWeight = weight;
      majorityValue = value;
    }
  }

  // Find first completion with majority value
  let winningCompletion: Prediction | null = null;
  for (const { completion } of weightedCompletions) {
    const value = completion.outputs?.[targetField];
    const normalizedValue = normalize(typeof value === 'string' ? value : String(value || ''));
    
    if (normalizedValue === majorityValue) {
      winningCompletion = completion;
      break;
    }
  }

  if (!winningCompletion) {
    winningCompletion = weightedCompletions[0].completion;
  }

  return {
    id: `weighted-majority-${Date.now()}`,
    outputs: winningCompletion.outputs,
    metadata: {
      ...winningCompletion.metadata,
      aggregation: 'weighted_majority',
      total_completions: weightedCompletions.length,
      total_weight: totalWeight,
      majority_weight: maxWeight,
      majority_field: targetField,
      confidence: maxWeight / totalWeight
    },
    trace: winningCompletion.trace || []
  };
}

/**
 * Consensus aggregation - requires agreement threshold
 */
export function consensus<T = any>(
  predictions: Prediction[] | T[],
  threshold: number = 0.5,
  normalize: (text: string) => string | null = defaultNormalize,
  field?: string
): Prediction | null {
  const majorityResult = majority(predictions, normalize, field);
  const totalCount = Array.isArray(predictions) ? predictions.length : 0;
  const majorityCount = majorityResult.metadata?.majority_count || 0;
  
  const agreement = majorityCount / totalCount;
  
  if (agreement >= threshold) {
    return {
      ...majorityResult,
      metadata: {
        ...majorityResult.metadata,
        aggregation: 'consensus',
        agreement_ratio: agreement,
        threshold_met: true
      }
    };
  }
  
  return null; // No consensus reached
}

/**
 * Aggregation utility functions
 */
export const AggregationUtils = {
  /**
   * Calculate agreement ratio between predictions
   */
  calculateAgreement(predictions: Prediction[], field?: string): number {
    if (predictions.length <= 1) return 1.0;
    
    const majorityResult = majority(predictions, defaultNormalize, field);
    const majorityCount = majorityResult.metadata?.majority_count || 0;
    
    return majorityCount / predictions.length;
  },

  /**
   * Get all unique values from predictions
   */
  getUniqueValues(predictions: Prediction[], field?: string): string[] {
    if (!field && predictions.length > 0) {
      const outputs = predictions[0].outputs;
      if (outputs && typeof outputs === 'object') {
        const keys = Object.keys(outputs);
        field = keys[keys.length - 1];
      }
    }
    
    if (!field) return [];
    
    const values = new Set<string>();
    for (const prediction of predictions) {
      const value = prediction.outputs?.[field];
      if (value) {
        values.add(typeof value === 'string' ? value : String(value));
      }
    }
    
    return Array.from(values);
  },

  /**
   * Calculate diversity score (1 - agreement)
   */
  calculateDiversity(predictions: Prediction[], field?: string): number {
    return 1.0 - this.calculateAgreement(predictions, field);
  }
};

/**
 * Factory functions for common aggregation patterns
 */
export const AggregationFactory = {
  /**
   * Create strict consensus aggregator (requires 100% agreement)
   */
  strictConsensus(field?: string) {
    return (predictions: Prediction[]) => consensus(predictions, 1.0, defaultNormalize, field);
  },

  /**
   * Create supermajority aggregator (requires 2/3 agreement)
   */
  supermajority(field?: string) {
    return (predictions: Prediction[]) => consensus(predictions, 2/3, defaultNormalize, field);
  },

  /**
   * Create simple majority aggregator
   */
  simpleMajority(field?: string) {
    return (predictions: Prediction[]) => majority(predictions, defaultNormalize, field);
  },

  /**
   * Create case-insensitive aggregator
   */
  caseInsensitive(field?: string) {
    const normalize = (text: string) => text?.toLowerCase().trim() || null;
    return (predictions: Prediction[]) => majority(predictions, normalize, field);
  }
};