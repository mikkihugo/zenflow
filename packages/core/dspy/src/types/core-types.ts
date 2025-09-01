/**
* @fileoverview DSPy Core Types - Pure DSPy Logic Only
*
* Core type definitions for DSPy optimization engine.
* This package provides pure DSPy functionality - all LLM/database
* access is handled by the brain package through bridge pattern.
*
* @version 1.0.0
* @author Claude Code Zen Team
*/

// =============================================================================
// CORE DSPY INTERFACES - Pure DSPy optimization types
// =============================================================================

export interface LLMAnalysisRequest {
task: string;
context?: string;
}

export interface LLMAnalysisResponse {
result: any;
confidence: number;
metadata?: Record<string, any>;
}

export interface LLMOptimizationRequest {
prompt: string;
}

export interface LLMOptimizationResponse {
optimizedPrompt: string;
improvements: string[];
metadata?: Record<string, any>;
}

export interface LLMIntegrationService {
analyze(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse>;
optimize(request: LLMOptimizationRequest): Promise<LLMOptimizationResponse>;
}

export interface DatabaseProvider {
type: 'sqlite' | 'lancedb' | 'kuzu';
connection: any;
query(sql: string, params?: any[]): Promise<any[]>;
execute(sql: string, params?: any[]): Promise<any>;
}

export interface PluginConfig {
name: string;
version: string;
enabled: boolean;
}

export interface PluginContext {
[key: string]: any;
}

// =============================================================================
// DSPy OPTIMIZATION TYPES - Core DSPy functionality
// =============================================================================

/**
* DSPy teleprompter types and configurations
*/
export type TeleprompterType =
| 'BootstrapFewShot'
| 'COPRO'
| 'MIPRO'
| 'Ensemble'
| 'MIPROv2';

/**
* DSPy optimization configuration
*/
export interface DSPyConfig {
teleprompter: TeleprompterType;
optimizationSteps: number;
maxTokens: number;
temperature: number;
hybridMode?: boolean;
}

/**
* DSPy optimization result
*/
export interface DSPyResult {
optimizedPrompt: string;
strategy: string;
confidence: number;
metrics: {
executionTime: number;
tokensUsed: number;
};
}

// Note:LLM and database integration removed - handled by brain package
// dspy provides pure DSPy optimization logic only
