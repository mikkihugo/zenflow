/**
 * @fileoverview Knowledge Package Error Classes
 *
 * Domain-specific error classes for FACT and RAG systems within the knowledge package.
 * These errors are specific to knowledge management operations and should be handled
 * within the knowledge domain.
 *
 * Uses foundation error patterns for consistency with the rest of the system.
 */

import { getLogger, EnhancedError } from '@claude-zen/foundation';

const logger = getLogger('KnowledgeErrors');

/**
 * Base error context interface for knowledge operations
 */
export interface KnowledgeErrorContext {
  timestamp: number;
  operation?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base error class for knowledge domain operations
 */
export abstract class BaseKnowledgeError extends EnhancedError {
  public readonly severity: 'low|medium|high|critical';
  public readonly category: string;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    category: string,
    severity: 'low|medium|high|critical' = 'medium',
    context: Partial<KnowledgeErrorContext> = {},
    recoverable: boolean = true
  ) {
    // EnhancedError expects context as Record<string, any> and handles timestamp internally
    super(message, {
      category,
      severity,
      recoverable,
      ...context,
    });

    this.category = category;
    this.severity = severity;
    this.recoverable = recoverable;

    // Log error immediately using foundation logging
    this.logError();
  }

  private logError(): void {
    const logLevel =
      this.severity === 'critical'
        ? 'error'
        : this.severity === 'high'
          ? 'warn'
          : 'info';

    logger[logLevel](`[${this.category}] ${this.message}`, {
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
    });
  }

  public override toObject(): Record<string, any> {
    return {
      ...super.toObject(),
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
    };
  }
}

// ===============================
// FACT System Errors
// ===============================

/**
 * Base error class for FACT (Flexible AI Context Transfer) system failures.
 *
 * @example
 * ```typescript
 * throw new FACTError(
 *   'Failed to process FACT data',
 *   'high',
 *   { operation: 'dataProcessing', metadata: { factId: 'fact-123' } }
 * );
 * ```
 */
export class FACTError extends BaseKnowledgeError {
  constructor(
    message: string,
    severity: 'low|medium|high|critical' = 'medium',
    context: Partial<KnowledgeErrorContext> = {}
  ) {
    super(message, 'FACT', severity, context);
    this.name = 'FACTError';
  }
}

/**
 * Error for FACT storage backend operations.
 */
export class FACTStorageError extends FACTError {
  constructor(
    message: string,
    public readonly backend: string,
    public readonly operation: string,
    severity: 'low|medium|high|critical' = 'high'
  ) {
    super(message, severity, { operation, metadata: { backend } });
    this.name = 'FACTStorageError';
  }
}

/**
 * Error for FACT data gathering operations.
 */
export class FACTGatheringError extends FACTError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly sources: string[],
    severity: 'low|medium|high|critical' = 'medium'
  ) {
    super(message, severity, { metadata: { query, sources } });
    this.name = 'FACTGatheringError';
  }
}

/**
 * Error for FACT data processing operations.
 */
export class FACTProcessingError extends FACTError {
  constructor(
    message: string,
    public readonly processType: string,
    public readonly dataId?: string,
    severity: 'low|medium|high|critical' = 'medium'
  ) {
    super(message, severity, { metadata: { processType, dataId } });
    this.name = 'FACTProcessingError';
  }
}

// ===============================
// RAG System Errors
// ===============================

/**
 * Base error class for RAG (Retrieval Augmented Generation) system failures.
 *
 * @example
 * ```typescript
 * throw new RAGError(
 *   'RAG processing failed',
 *   'high',
 *   { operation: 'retrieval', metadata: { queryId: 'query-456' } }
 * );
 * ```
 */
export class RAGError extends BaseKnowledgeError {
  constructor(
    message: string,
    severity: 'low|medium|high|critical' = 'medium',
    context: Partial<KnowledgeErrorContext> = {}
  ) {
    super(message, 'RAG', severity, context);
    this.name = 'RAGError';
  }
}

/**
 * Error for RAG vector operations.
 */
export class RAGVectorError extends RAGError {
  constructor(
    message: string,
    public readonly operation: 'embed|search|index|delete',
    public readonly vectorDimension?: number,
    severity: 'low|medium|high|critical' = 'high'
  ) {
    super(message, severity, { operation, metadata: { vectorDimension } });
    this.name = 'RAGVectorError';
  }
}

/**
 * Error for RAG embedding operations.
 */
export class RAGEmbeddingError extends RAGError {
  constructor(
    message: string,
    public readonly modelName: string,
    public readonly textLength?: number,
    severity: 'low|medium|high|critical' = 'high'
  ) {
    super(message, severity, { metadata: { modelName, textLength } });
    this.name = 'RAGEmbeddingError';
  }
}

/**
 * Error for RAG retrieval operations.
 */
export class RAGRetrievalError extends RAGError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly similarityThreshold?: number,
    severity: 'low|medium|high|critical' = 'medium'
  ) {
    super(message, severity, { metadata: { query, similarityThreshold } });
    this.name = 'RAGRetrievalError';
  }
}

// ===============================
// Error Utilities
// ===============================

/**
 * Determines if a knowledge error is recoverable.
 */
export function isRecoverableKnowledgeError(error: Error): boolean {
  if (error instanceof BaseKnowledgeError) {
    return error.recoverable;
  }
  return true; // Default to recoverable for non-knowledge errors
}

/**
 * Gets the severity level of a knowledge error.
 */
export function getKnowledgeErrorSeverity(
  error: Error
): 'low|medium|high|critical' {
  if (error instanceof BaseKnowledgeError) {
    return error.severity;
  }
  return 'medium'; // Default severity
}

/**
 * Creates a knowledge error with proper context wrapping.
 */
export function createKnowledgeError(
  message: string,
  category: 'FACT|RAG'',
  context: Partial<KnowledgeErrorContext> = {},
  severity: 'low|medium|high|critical' = 'medium'
): BaseKnowledgeError {
  switch (category) {
    case 'FACT':
      return new FACTError(message, severity, context);
    case 'RAG':
      return new RAGError(message, severity, context);
    default:
      throw new Error(`Unknown knowledge error category: ${category}`);
  }
}
