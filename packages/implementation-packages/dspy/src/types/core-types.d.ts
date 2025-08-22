/**
 * @fileoverview Standalone Types for DSPy Engine
 *
 * Self-contained type definitions to eliminate external dependencies
 */
export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}
export interface PluginContext {
  config: PluginConfig;
  logger?: Logger;
  storage?: StorageProvider;
}
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  dependencies?: string[];
}
export interface SwarmCoordinator {
  id: string;
  type: 'mesh|hierarchical|ring|star';
  agents: SwarmAgent[];
  status: 'active|inactive|error';
  metadata?: Record<string, unknown>;
}
export interface SwarmAgent {
  id: string;
  type: string;
  status: 'active|inactive|busy|error';
  capabilities: string[];
  metadata?: Record<string, unknown>;
}
export interface NeuralEngine {
  id: string;
  type: string;
  status: 'initialized|training|ready|error';
  metrics?: NeuralMetrics;
  train(data: unknown[]): Promise<void>;
  predict(input: unknown): Promise<unknown>;
}
export interface NeuralMetrics {
  accuracy: number;
  latency: number;
  memoryUsage: number;
  trainingTime: number;
}
export interface LLMIntegrationService {
  analyze(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse>;
  optimize(request: LLMOptimizationRequest): Promise<LLMOptimizationResponse>;
}
export interface LLMAnalysisRequest {
  task: string;
  requiresFileOperations: boolean;
  data: unknown;
  context?: Record<string, unknown>;
}
export interface LLMAnalysisResponse {
  result: unknown;
  confidence: number;
  metadata?: Record<string, unknown>;
}
export interface LLMOptimizationRequest {
  prompt: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
  metrics?: string[];
}
export interface LLMOptimizationResponse {
  optimizedPrompt: string;
  improvements: string[];
  confidence: number;
  metrics?: Record<string, number>;
}
export interface DatabaseProvider {
  type: 'sqlite|lancedb|kuzu';
  connection: unknown;
  isConnected(): boolean;
  query(sql: string, params?: unknown[]): Promise<unknown>;
  close(): Promise<void>;
}
export interface StorageProvider {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  list(prefix?: string): Promise<string[]>;
}
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
export declare class FoundationLLMIntegrationService
  implements LLMIntegrationService
{
  analyze(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse>;
  optimize(request: LLMOptimizationRequest): Promise<LLMOptimizationResponse>;
  private extractOptimizedPrompt;
  private extractImprovements;
  private calculateTokenReduction;
}
export declare class FoundationDatabaseProvider implements DatabaseProvider {
  private dbAccess;
  type: 'sqlite|lancedb|kuzu';
  get connection(): any;
  isConnected(): boolean;
  query(sql: string, params?: unknown[]): Promise<unknown>;
  close(): Promise<void>;
}
export declare class FoundationLogger implements Logger {
  private logger;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
export declare abstract class BasePlugin {
  protected config: PluginConfig;
  protected logger: Logger;
  constructor(config: PluginConfig, logger?: Logger);
  abstract initialize(context: PluginContext): Promise<void>;
  abstract cleanup(): Promise<void>;
  get name(): string;
  get version(): string;
  get enabled(): boolean;
}
//# sourceMappingURL=core-types.d.ts.map
