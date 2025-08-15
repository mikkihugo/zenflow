/**
 * Domain Types Stub
 * Compatibility stub for domain splitting tests
 */

export interface Domain {
  id: string;
  name: string;
  description: string;
  complexity: number;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface DomainAnalysisResult {
  domains: Domain[];
  complexity: number;
  confidence: number;
  suggestions: string[];
}

export interface DomainSplitOptions {
  maxComplexity?: number;
  minDomains?: number;
  maxDomains?: number;
  strategy?: 'balanced' | 'granular' | 'coarse';
}

export interface DomainValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}