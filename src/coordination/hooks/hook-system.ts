/**
 * Hook System - Core Infrastructure.
 * Provides safety validation, auto-assignment, performance tracking, and context loading.
 */
/**
 * @file Coordination system: hook-system.
 */

import type { AgentType } from '../types.ts';

// Hook Type Definitions
export type HookType =
  | 'command'
  | 'guidance'
  | 'validation'
  | 'assignment'
  | 'performance'
  | 'context';
export type HookTrigger =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PreCompact'
  | 'PostCompact'
  | 'OnError'
  | 'OnInit';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FileType =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'golang'
  | 'java'
  | 'cpp'
  | 'markdown'
  | 'json'
  | 'yaml'
  | 'sql'
  | 'unknown';

// Core Hook Interface
export interface Hook {
  readonly id: string;
  readonly type: HookType;
  readonly trigger: HookTrigger;
  readonly matcher?: string | RegExp;
  readonly validator?: SafetyValidator;
  readonly optimizer?: PerformanceOptimizer;
  readonly coordinator?: AgentCoordinator;
  readonly tracker?: MetricsTracker;
  readonly enabled: boolean;
  readonly priority: number;

  execute(context: HookContext): Promise<HookResult>;
}

// Hook Context
export interface HookContext {
  readonly operation: Operation;
  readonly tool: ToolInfo;
  readonly environment: EnvironmentInfo;
  readonly user?: UserInfo;
  readonly session: SessionInfo;
  readonly timestamp: Date;
}

export interface Operation {
  readonly id: string;
  readonly type: string;
  readonly description: string;
  readonly filePath?: string;
  readonly command?: string;
  readonly parameters: Record<string, any>;
  readonly metadata: Record<string, any>;
}

export interface ToolInfo {
  readonly name: string;
  readonly version: string;
  readonly input: Record<string, any>;
  readonly expectedOutput?: string;
}

export interface EnvironmentInfo {
  readonly workingDirectory: string;
  readonly nodeVersion: string;
  readonly platform: string;
  readonly availableMemory: number;
  readonly cpuUsage: number;
}

export interface UserInfo {
  readonly id: string;
  readonly preferences: Record<string, any>;
  readonly permissions: string[];
}

export interface SessionInfo {
  readonly id: string;
  readonly startTime: Date;
  readonly context: Record<string, any>;
  readonly history: OperationHistory[];
}

export interface OperationHistory {
  readonly operation: Operation;
  readonly result: HookResult;
  readonly timestamp: Date;
}

// Hook Result
export interface HookResult {
  readonly success: boolean;
  readonly allowed: boolean;
  readonly modified: boolean;
  readonly data?: any;
  readonly warnings: Warning[];
  readonly errors: HookError[];
  readonly suggestions: Suggestion[];
  readonly metrics: OperationMetrics;
  readonly nextActions?: NextAction[];
}

export interface Warning {
  readonly type: string;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly code?: string;
}

export interface HookError {
  readonly type: string;
  readonly message: string;
  readonly code?: string;
  readonly context?: Record<string, any>;
}

export interface Suggestion {
  readonly type: string;
  readonly message: string;
  readonly action?: string;
  readonly confidence: number;
}

export interface NextAction {
  readonly type: string;
  readonly description: string;
  readonly parameters: Record<string, any>;
  readonly priority: number;
}

// Safety Validation Interface
export interface SafetyValidator {
  validateCommand(command: string): Promise<ValidationResult>;
  validateFileOperation(operation: FileOperation): Promise<ValidationResult>;
  suggestSaferAlternative(command: string): Promise<string[]>;
  assessRiskLevel(operation: Operation): Promise<RiskLevel>;
}

export interface ValidationResult {
  readonly allowed: boolean;
  readonly riskLevel: RiskLevel;
  readonly risks: SecurityRisk[];
  readonly reason?: string;
  readonly requiresConfirmation?: boolean;
  readonly alternatives?: string[];
  readonly mitigations?: string[];
}

export interface SecurityRisk {
  readonly type: string;
  readonly pattern?: string;
  readonly command?: string;
  readonly severity: RiskLevel;
  readonly description: string;
  readonly mitigation?: string;
}

export interface FileOperation {
  readonly type: 'read' | 'write' | 'create' | 'delete' | 'move' | 'copy';
  readonly path: string;
  readonly newPath?: string;
  readonly content?: string;
  readonly permissions?: string;
}

// Agent Coordination Interface
export interface AgentCoordinator {
  assignOptimalAgent(context: OperationContext): Promise<AgentAssignment>;
  loadAgentContext(agent: AgentInfo): Promise<AgentContext>;
  updateAgentWorkload(agent: AgentInfo, operation: Operation): Promise<void>;
  balanceWorkload(agents: AgentInfo[]): Promise<WorkloadBalance>;
}

export interface OperationContext {
  readonly operation: Operation;
  readonly filePath?: string;
  readonly fileType?: FileType;
  readonly complexity: ComplexityLevel;
  readonly urgency: UrgencyLevel;
  readonly requiredSkills: string[];
  readonly estimatedDuration: number;
  readonly priority: number;
}

export interface AgentAssignment {
  readonly agent: AgentInfo;
  readonly confidence: number;
  readonly reasoning: string;
  readonly alternatives: AgentInfo[];
  readonly estimatedPerformance: PerformanceEstimate;
}

export interface AgentInfo {
  readonly id: string;
  readonly type: AgentType;
  readonly name: string;
  readonly capabilities: string[];
  readonly currentWorkload: number;
  readonly maxWorkload: number;
  readonly performance: AgentPerformance;
  readonly availability: boolean;
  readonly specialties: string[];
}

export interface AgentContext {
  readonly memory: Record<string, any>;
  readonly preferences: Record<string, any>;
  readonly learningData: LearningData[];
  readonly performanceHistory: PerformanceHistory[];
}

export interface AgentPerformance {
  readonly successRate: number;
  readonly averageExecutionTime: number;
  readonly qualityScore: number;
  readonly userSatisfaction: number;
  readonly reliability: number;
}

export interface WorkloadBalance {
  readonly balanced: boolean;
  readonly recommendations: WorkloadRecommendation[];
  readonly projectedEfficiency: number;
}

export interface WorkloadRecommendation {
  readonly agentId: string;
  readonly action: 'increase' | 'decrease' | 'redistribute';
  readonly reason: string;
  readonly impact: number;
}

// Performance Optimization Interface
export interface PerformanceOptimizer {
  optimizeOperation(operation: Operation): Promise<OptimizedOperation>;
  predictPerformance(operation: Operation): Promise<PerformanceEstimate>;
  suggestImprovements(metrics: OperationMetrics): Promise<Improvement[]>;
  analyzeBottlenecks(context: OperationContext): Promise<BottleneckAnalysis>;
}

export interface OptimizedOperation {
  readonly originalOperation: Operation;
  readonly optimizedParameters: Record<string, any>;
  readonly expectedImprovement: number;
  readonly optimizationStrategy: string;
  readonly estimatedSavings: ResourceSavings;
}

export interface PerformanceEstimate {
  readonly executionTime: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly confidence: number;
  readonly factors: PerformanceFactor[];
}

export interface PerformanceFactor {
  readonly name: string;
  readonly impact: number;
  readonly description: string;
}

export interface Improvement {
  readonly type: string;
  readonly description: string;
  readonly impact: number;
  readonly effort: number;
  readonly priority: number;
}

export interface BottleneckAnalysis {
  readonly bottlenecks: Bottleneck[];
  readonly recommendations: string[];
  readonly projectedImprovement: number;
}

export interface Bottleneck {
  readonly type: string;
  readonly location: string;
  readonly severity: number;
  readonly description: string;
  readonly solution?: string;
}

export interface ResourceSavings {
  readonly timeSeconds: number;
  readonly memoryMB: number;
  readonly cpuPercent: number;
  readonly estimatedCost: number;
}

// Metrics Tracking Interface
export interface MetricsTracker {
  trackOperation(operation: Operation, result: OperationResult): Promise<void>;
  generatePerformanceReport(timeframe: TimeFrame): Promise<PerformanceReport>;
  getMetrics(filter: MetricsFilter): Promise<OperationMetrics[]>;
  analyzePerformanceTrends(timeframe: TimeFrame): Promise<TrendAnalysis>;
}

export interface OperationResult {
  readonly success: boolean;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly agent?: AgentInfo;
  readonly agentMetrics?: AgentPerformanceSnapshot;
  readonly error?: HookError;
  readonly output?: any;
  readonly resourceUsage: ResourceUsage;
}

export interface OperationMetrics {
  readonly operationId: string;
  readonly type: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly success: boolean;
  readonly errorType?: string;
  readonly resourceUsage: ResourceUsage;
  readonly agentPerformance?: AgentPerformanceSnapshot;
  readonly qualityScore?: number;
  readonly userSatisfaction?: number;
}

export interface ResourceUsage {
  readonly memoryMB: number;
  readonly cpuPercent: number;
  readonly diskIO: number;
  readonly networkIO: number;
  readonly peakMemory: number;
}

export interface AgentPerformanceSnapshot {
  readonly agentId: string;
  readonly executionTime: number;
  readonly memoryUsed: number;
  readonly cpuUsed: number;
  readonly qualityMetrics: QualityMetrics;
}

export interface QualityMetrics {
  readonly codeQuality?: number;
  readonly testCoverage?: number;
  readonly documentation?: number;
  readonly userSatisfaction?: number;
}

export interface PerformanceReport {
  readonly timeframe: TimeFrame;
  readonly totalOperations: number;
  readonly averageDuration: number;
  readonly successRate: number;
  readonly bottlenecks: Bottleneck[];
  readonly trends: TrendData[];
  readonly recommendations: string[];
  readonly agentPerformance: AgentPerformanceSummary[];
}

export interface TimeFrame {
  readonly start: Date;
  readonly end: Date;
  readonly granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface MetricsFilter {
  readonly operationType?: string;
  readonly agentType?: AgentType;
  readonly timeframe?: TimeFrame;
  readonly successOnly?: boolean;
  readonly minimumDuration?: number;
}

export interface TrendAnalysis {
  readonly trends: TrendData[];
  readonly predictions: Prediction[];
  readonly insights: string[];
}

export interface TrendData {
  readonly metric: string;
  readonly direction: 'improving' | 'degrading' | 'stable';
  readonly change: number;
  readonly confidence: number;
}

export interface Prediction {
  readonly metric: string;
  readonly predictedValue: number;
  readonly timeframe: string;
  readonly confidence: number;
}

export interface AgentPerformanceSummary {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly operationsCount: number;
  readonly averagePerformance: AgentPerformance;
  readonly improvements: string[];
}

// Utility Types
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'expert';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical';

export interface LearningData {
  readonly operation: string;
  readonly outcome: string;
  readonly feedback: number;
  readonly timestamp: Date;
}

export interface PerformanceHistory {
  readonly operation: string;
  readonly duration: number;
  readonly success: boolean;
  readonly timestamp: Date;
  readonly context: Record<string, any>;
}

// Hook System Manager Interface
export interface HookManager {
  registerHook(hook: Hook): Promise<void>;
  unregisterHook(hookId: string): Promise<void>;
  executeHooks(trigger: HookTrigger, context: HookContext): Promise<HookResult[]>;
  getHooks(trigger?: HookTrigger): Promise<Hook[]>;
  enableHook(hookId: string): Promise<void>;
  disableHook(hookId: string): Promise<void>;
}
