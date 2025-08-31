/**
 * @fileoverview Enhanced Model Types - Rich Metadata Preservation
 *
 * Unified interfaces that preserve provider-specific rich metadata
 * while providing clean, standardized access patterns.
 */

import type { GitHubCopilotModelMetadata} from '../api/github-copilot-db';
import type { GitHubModelMetadata} from '../api/github-models-db';

/**
 * Base model interface - common fields across all providers
 */
export interface BaseModelInfo {
  // Identity
  id:string;
  name:string;
  provider:string;
  family?:string;
  version?:string;

  // Core capabilities
  contextWindow:number;
  maxTokens:number;

  // Basic features
  supportsStreaming:boolean;
  supportsVision:boolean;
  supportsToolCalls:boolean;

  // Metadata
  available:boolean;
  lastUpdated:Date;

  // Pricing (if available)
  pricing?:{
    inputTokens:number;
    outputTokens:number;
    currency:string;
};
}

/**
 * Rich model interface - preserves ALL provider-specific metadata
 */
export interface RichModelInfo extends BaseModelInfo {
  // Provider-specific rich metadata (preserved as-is)
  providerMetadata:
    | GitHubCopilotModelMetadata
    | GitHubModelMetadata
    | Record<string, unknown>;

  // Provider type for type-safe access
  providerType:
    | 'github-copilot' | 'github-models' | 'anthropic' | 'openai' | string;
}

/**
 * Query interface for finding models by capabilities
 */
export interface ModelQuery {
  // Basic filters
  provider?:string;
  family?:string;
  minContextWindow?:number;
  maxCost?:number;

  // Feature requirements
  requiresVision?:boolean;
  requiresToolCalls?:boolean;
  requiresStreaming?:boolean;

  // Advanced requirements
  customFilter?:(model: RichModelInfo) => boolean;

  // Sorting
  sortBy?:'contextWindow' | ' cost' | ' performance' | ' updated';
  sortOrder?:'asc' | ' desc';

  // Limits
  limit?:number;
}

/**
 * Provider-specific database interface
 */
export interface ProviderDatabase<T = unknown> {
  // Basic operations
  getAllModels():T[];
  getModel(id:string): T | undefined;

  // Provider-specific queries
  getModelsByCategory?(category:string): T[];
  getModelsByCapability?(capability:string): T[];

  // Metadata access
  getProviderType():string;
  getLastUpdated():Date;

  // Update operations
  updateModels():Promise<void>;

  // Rich metadata conversion
  toRichModelInfo(model:T): RichModelInfo;
  toBaseModelInfo(model:T): BaseModelInfo;
}

/**
 * Type-safe provider metadata access
 */
export type ProviderMetadata<P extends string> = P extends 'github-copilot' ? GitHubCopilotModelMetadata
  : P extends 'github-models' ? GitHubModelMetadata
    : Record<string, unknown>;

/**
 * Advanced model comparison interface
 */
export interface ModelComparison {
  models:RichModelInfo[];

  // Comparison metrics
  contextWindowComparison:Record<string, number>;
  costComparison:Record<string, number>;
  featureMatrix:Record<string, Record<string, boolean>>;

  // Recommendations
  bestForTask:{
    coding:string;
    vision:string;
    longContext:string;
    costEffective:string;
};
}

/**
 * Model selection recommendations
 */
export interface ModelRecommendation {
  modelId:string;
  confidence:number;
  reasoning:string[];
  alternatives:Array<{
    modelId:string;
    reason:string;
    tradeoff:string;
}>;
}
