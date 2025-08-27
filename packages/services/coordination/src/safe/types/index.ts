/**
 * @fileoverview Main types index - Re-exports all type definitions
 *
 * Centralized export for all TypeScript type definitions used throughout
 * the SAFe framework package.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Core types
export type Logger = import('@claude-zen/foundation').Logger;
export type Result<T, E = Error> = import('@claude-zen/foundation').Result<T, E>;
export type UUID = import('@claude-zen/foundation').UUID;

// Event system types from foundation
export type TypedEventBase = import('@claude-zen/foundation').TypedEventBase;
export type TypeSafeEventBus = any; // Placeholder - will use foundation event bus

// Memory system integration
export interface MemorySystem {
  store: (key: string, data: any) => Promise<void>;
  retrieve: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
}

// Helper functions for event creation and logging
export function createEvent(type: string, data: any, priority = EventPriority.NORMAL) {
  return { type, data, priority, timestamp: Date.now() };
}

export enum EventPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export function getLogger(name: string): Logger {
  return { 
    debug: (msg: string, meta?: any) => console.debug(`[${name}] ${msg}`, meta),
    info: (msg: string, meta?: any) => console.info(`[${name}] ${msg}`, meta),
    warn: (msg: string, meta?: any) => console.warn(`[${name}] ${msg}`, meta),
    error: (msg: string, meta?: any) => console.error(`[${name}] ${msg}`, meta)
  } as Logger;
}

// Portfolio Epic type
export interface PortfolioEpic {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly businessValue: number;
  readonly priority: number;
  readonly status: 'analyzing|implementing|done|backlog;
}

// Value Stream type
export interface ValueStream {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps?: ValueStreamStep[];
}

export interface ValueStreamStep {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly type: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;
}

// Multi-level orchestration manager placeholder
export interface MultiLevelOrchestrationManager {
  readonly id: string;
  readonly name: string;
}

// Re-export from devsecops manager - Security and Compliance types
export interface ComplianceFramework {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly validationRules: ValidationRule[];
  readonly evidenceRequirements: EvidenceRequirement[];
  readonly requirements: ComplianceRequirement[];
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly priority: 'low|medium|high|critical;
  readonly assessmentFrequency?: number; // days
  readonly validationRules: ValidationRule[];
  readonly evidenceRequirements: EvidenceRequirement[];
}

export interface ValidationRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ruleType: 'automated' | 'manual' | 'hybrid';
  readonly severity: 'low|medium|high|critical;
  readonly category: string;
}

export interface EvidenceRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'document|artifact|screenshot|log|report;
  readonly required: boolean;
}

export interface SecurityAssessment {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly assessmentType: SecurityAssessmentType;
  readonly findings: SecurityFinding[];
  readonly overallRisk: 'low|medium|high|critical;
}

export type SecurityAssessmentType =|'vulnerability_scan|penetration_test|code_review|compliance_audit|risk_assessment;

export interface SecurityFinding {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: SecuritySeverity;
  readonly category: string;
  readonly status: 'open|in_progress|resolved|false_positive;
  readonly cwe?: string;
  readonly cvssScore?: CVSSScore;
  readonly location?: {
    readonly filePath: string;
    readonly lineNumber: number;
    readonly columnNumber: number;
    readonly snippet: string;
  };
  readonly impact?: {
    readonly confidentiality: string;
    readonly integrity: string;
    readonly availability: string;
    readonly businessImpact: string;
  };
  readonly remediation?: string;
  readonly references?: string[];
  readonly toolId?: string;
  readonly discoveredDate?: Date;
  readonly lastSeenDate?: Date;
  readonly falsePositive?: boolean;
}

export interface SecurityTool {
  readonly id: string;
  readonly name: string;
  readonly type: 'static|dynamic|interactive|manual;
  readonly capabilities: string[];
}

export interface SecurityStandard {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly requirements: string[];
}

export type SecuritySeverity = 'low|medium|high|critical';

export interface CVSSScore {
  readonly version: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;
  readonly baseScore: number;
  readonly temporalScore?: number;
  readonly environmentalScore?: number;
  readonly vector: string;
}

// Note: Selective re-export from epic-management to avoid QualityGate conflict
export type {
  EpicBlocker,
  EpicLifecycleStage,
  EpicOwnerManagerConfig,
  GateCriterion,
  PortfolioKanbanState,
  WSJFScore,
} from './epic-management';
export * from './integration-bridge';
// Re-export from specific type modules
export * from './product-management';
