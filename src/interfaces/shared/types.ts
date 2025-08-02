/**
 * Shared Interface Types
 *
 * Common types and interfaces used across different interface implementations.
 * This module provides shared abstractions to prevent cross-interface dependencies.
 */

/**
 * Project Configuration Types (Shared)
 */
export type ProjectType =
  | 'neural-ai'
  | 'swarm-coordination'
  | 'wasm-performance'
  | 'full-stack'
  | 'quantum-coordination';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'enterprise';

export type ProjectDomain =
  | 'neural'
  | 'swarm'
  | 'wasm'
  | 'real-time'
  | 'quantum'
  | 'blockchain'
  | 'iot';

export interface ProjectConfig {
  readonly name: string;
  readonly type: ProjectType;
  readonly complexity: ComplexityLevel;
  readonly domains: ProjectDomain[];
  readonly integrations: IntegrationConfig[];
  readonly aiFeatures: AIFeatureSet;
  readonly performance: PerformanceRequirements;
}

export interface IntegrationConfig {
  readonly type: string;
  readonly config: Record<string, any>;
  readonly enabled: boolean;
}

export interface AIFeatureSet {
  readonly enabled: boolean;
  readonly neuralNetworks?: boolean;
  readonly swarmIntelligence?: boolean;
  readonly quantumOptimization?: boolean;
  readonly autoCodeGeneration?: boolean;
}

export interface PerformanceRequirements {
  readonly targets: string[];
  readonly benchmarks?: Record<string, number>;
  readonly constraints?: Record<string, any>;
}

/**
 * Command Execution Types (Shared)
 */
export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: any;
  readonly duration?: number;
  readonly metrics?: Record<string, any>;
}

export interface CommandContext {
  readonly command: string;
  readonly args: string[];
  readonly options: Record<string, any>;
  readonly workingDirectory?: string;
}

/**
 * Configuration Types (Shared)
 */
export interface InterfaceConfig {
  readonly theme: 'dark' | 'light' | 'auto';
  readonly verbosity: 'quiet' | 'normal' | 'verbose' | 'debug';
  readonly autoCompletion: boolean;
  readonly realTimeUpdates: boolean;
}

/**
 * Status and Health Types (Shared)
 */
export interface ComponentStatus {
  readonly component: string;
  readonly state: 'healthy' | 'warning' | 'error' | 'unknown';
  readonly message: string;
  readonly metrics: Record<string, number>;
  readonly lastCheck: Date;
}

export interface SystemHealth {
  readonly overall: ComponentStatus;
  readonly components: ComponentStatus[];
  readonly summary: HealthSummary;
}

export interface HealthSummary {
  readonly healthy: number;
  readonly warnings: number;
  readonly errors: number;
  readonly total: number;
  readonly uptime: number;
}
