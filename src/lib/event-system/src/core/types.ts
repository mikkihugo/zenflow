/**
 * @file Core Types for Event System
 * 
 * Standalone type definitions that don't depend on external modules
 */

/**
 * Basic domain enum for event system
 */
export enum Domain {
  SYSTEM = 'system',
  COORDINATION = 'coordination',
  INTERFACE = 'interface',
  MEMORY = 'memory',
  NEURAL = 'neural',
  WORKFLOW = 'workflow',
  DATABASE = 'database',
  KNOWLEDGE = 'knowledge',
  CORE = 'core',
  UNKNOWN = 'unknown'
}

/**
 * Result type for operations
 */
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

/**
 * Type schema definition
 */
export interface TypeSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * Domain metadata
 */
export interface DomainMetadata {
  name: string;
  version: string;
  description?: string;
  tags?: string[];
}

/**
 * Basic agent interface
 */
export interface Agent {
  id: string;
  type: string;
  status: string;
}

/**
 * Basic task interface
 */
export interface Task {
  id: string;
  type: string;
  status: string;
  agentId?: string;
}

/**
 * Workflow context
 */
export interface WorkflowContext {
  id: string;
  type: string;
  state: Record<string, unknown>;
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: unknown[];
}

/**
 * Workflow event
 */
export interface WorkflowEvent {
  id: string;
  type: string;
  workflowId: string;
  timestamp: Date;
}

/**
 * Error classes
 */
export class DomainValidationError extends Error {
  constructor(message: string, public domain: Domain) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export class ContractViolationError extends Error {
  constructor(message: string, public contract: string) {
    super(message);
    this.name = 'ContractViolationError';
  }
}

/**
 * Domain boundary validator interface
 */
export interface DomainBoundaryValidator {
  validate<T>(data: T, schema: TypeSchema): Result<T>;
  validateCrossDomain<T>(source: Domain, target: Domain, data: T): Result<T>;
}

/**
 * Basic event bus interface
 */
export interface EventBus {
  emit(event: string, ...args: unknown[]): boolean;
  on(event: string, listener: (...args: unknown[]) => void): this;
  off(event: string, listener: (...args: unknown[]) => void): this;
  removeAllListeners(event?: string): this;
}