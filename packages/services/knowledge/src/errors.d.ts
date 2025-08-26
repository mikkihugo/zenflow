/**
 * @fileoverview Knowledge Package Error Classes
 *
 * Domain-specific error classes for FACT and RAG systems within the knowledge package.
 * These errors are specific to knowledge management operations and should be handled
 * within the knowledge domain.
 *
 * Uses foundation error patterns for consistency with the rest of the system.
 */
import { EnhancedError } from '@claude-zen/foundation';
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
export declare abstract class BaseKnowledgeError extends EnhancedError {
  readonly severity: 'low|medium|high|critical;
  readonly category: string;
  readonly recoverable: boolean;
  constructor(
    message: string,
    category: string,
    severity?: 'low|medium|high|critical',
    context?: Partial<KnowledgeErrorContext>,
    recoverable?: boolean
  );
  private logError;
  toObject(): Record<string, any>;
}
/**
 * Base error class for FACT (Flexible AI Context Transfer) system failures.
 *
 * @example
 * ```typescript`
 * throw new FACTError(
 *   'Failed to process FACT data',
 *   'high',
 *   { operation: 'dataProcessing', metadata: { factId: 'fact-123' } }'
 * );
 * ````
 */
export declare class FACTError extends BaseKnowledgeError {
  constructor(
    message: string,
    severity?: 'low|medium|high|critical',
    context?: Partial<KnowledgeErrorContext>
  );
}
/**
 * Error for FACT storage backend operations.
 */
export declare class FACTStorageError extends FACTError {
  readonly backend: string;
  readonly operation: string;
  constructor(
    message: string,
    backend: string,
    operation: string,
    severity?: 'low|medium|high|critical''
  );
}
/**
 * Error for FACT data gathering operations.
 */
export declare class FACTGatheringError extends FACTError {
  readonly query: string;
  readonly sources: string[];
  constructor(
    message: string,
    query: string,
    sources: string[],
    severity?: 'low' | 'medium' | 'high' | 'critical;
}
/**
 * Error for FACT data processing operations.
 */
export declare class FACTProcessingError extends FACTError {
  readonly processType: string;
  readonly dataId?: string|undefined;
  constructor(
    message: string,
    processType: string,
    dataId?: string|undefined,
    severity?:'low|medium|high|critical''
  );
}
/**
 * Base error class for RAG (Retrieval Augmented Generation) system failures.
 *
 * @example
 * ```typescript`
 * throw new RAGError(
 *   'RAG processing failed',
 *   'high',
 *   { operation: 'retrieval', metadata: { queryId: 'query-456' } }'
 * );
 * ````
 */
export declare class RAGError extends BaseKnowledgeError {
  constructor(
    message: string,
    severity?: 'low|medium|high|critical',
    context?: Partial<KnowledgeErrorContext>
  );
}
/**
 * Error for RAG vector operations.
 */
export declare class RAGVectorError extends RAGError {
  readonly operation: 'embed|search|index|delete;
  readonly vectorDimension?: number|undefined;
  constructor(
    message: string,
    operation:'embed|search|index|delete',
    vectorDimension?: number|undefined,
    severity?:'low' | 'medium' | 'high' | 'critical;
}
/**
 * Error for RAG embedding operations.
 */
export declare class RAGEmbeddingError extends RAGError {
  readonly modelName: string;
  readonly textLength?: number|undefined;
  constructor(
    message: string,
    modelName: string,
    textLength?: number|undefined,
    severity?:'low' | 'medium' | 'high' | 'critical;
}
/**
 * Error for RAG retrieval operations.
 */
export declare class RAGRetrievalError extends RAGError {
  readonly query: string;
  readonly similarityThreshold?: number|undefined;
  constructor(
    message: string,
    query: string,
    similarityThreshold?: number|undefined,
    severity?:'low|medium|high|critical''
  );
}
/**
 * Determines if a knowledge error is recoverable.
 */
export declare function isRecoverableKnowledgeError(error: Error): boolean;
/**
 * Gets the severity level of a knowledge error.
 */
export declare function getKnowledgeErrorSeverity(
  error: Error
): 'low|medium|high|critical;
/**
 * Creates a knowledge error with proper context wrapping.
 */
export declare function createKnowledgeError(
  message: string,
  category: 'FACT|RAG'',
  context?: Partial<KnowledgeErrorContext>,
  severity?: 'low|medium|high|critical''
): BaseKnowledgeError;
//# sourceMappingURL=errors.d.ts.map
