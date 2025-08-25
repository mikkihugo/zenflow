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
 * Base error class for knowledge domain operations
 */
export class BaseKnowledgeError extends EnhancedError {
    severity;
    category;
    recoverable;
    constructor(message, category, severity = 'medium', context = {}, recoverable = true) {
        // EnhancedError expects context as Record<string, any> and handles timestamp internally
        super(message, {
            category,
            severity,
            recoverable,
            ...context
        });
        this.category = category;
        this.severity = severity;
        this.recoverable = recoverable;
        // Log error immediately using foundation logging
        this.logError();
    }
    logError() {
        const logLevel = this.severity === 'critical' ? 'error' :
            this.severity === 'high' ? 'warn' : 'info';
        logger[logLevel](`[${this.category}] ${this.message}`, {
            severity: this.severity,
            context: this.context,
            recoverable: this.recoverable
        });
    }
    toObject() {
        return {
            ...super.toObject(),
            category: this.category,
            severity: this.severity,
            recoverable: this.recoverable
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
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'FACT', severity, context);
        this.name = 'FACTError';
    }
}
/**
 * Error for FACT storage backend operations.
 */
export class FACTStorageError extends FACTError {
    backend;
    operation;
    constructor(message, backend, operation, severity = 'high') {
        super(message, severity, { operation, metadata: { backend } });
        this.backend = backend;
        this.operation = operation;
        this.name = 'FACTStorageError';
    }
}
/**
 * Error for FACT data gathering operations.
 */
export class FACTGatheringError extends FACTError {
    query;
    sources;
    constructor(message, query, sources, severity = 'medium') {
        super(message, severity, { metadata: { query, sources } });
        this.query = query;
        this.sources = sources;
        this.name = 'FACTGatheringError';
    }
}
/**
 * Error for FACT data processing operations.
 */
export class FACTProcessingError extends FACTError {
    processType;
    dataId;
    constructor(message, processType, dataId, severity = 'medium') {
        super(message, severity, { metadata: { processType, dataId } });
        this.processType = processType;
        this.dataId = dataId;
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
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'RAG', severity, context);
        this.name = 'RAGError';
    }
}
/**
 * Error for RAG vector operations.
 */
export class RAGVectorError extends RAGError {
    operation;
    vectorDimension;
    constructor(message, operation, vectorDimension, severity = 'high') {
        super(message, severity, { operation, metadata: { vectorDimension } });
        this.operation = operation;
        this.vectorDimension = vectorDimension;
        this.name = 'RAGVectorError';
    }
}
/**
 * Error for RAG embedding operations.
 */
export class RAGEmbeddingError extends RAGError {
    modelName;
    textLength;
    constructor(message, modelName, textLength, severity = 'high') {
        super(message, severity, { metadata: { modelName, textLength } });
        this.modelName = modelName;
        this.textLength = textLength;
        this.name = 'RAGEmbeddingError';
    }
}
/**
 * Error for RAG retrieval operations.
 */
export class RAGRetrievalError extends RAGError {
    query;
    similarityThreshold;
    constructor(message, query, similarityThreshold, severity = 'medium') {
        super(message, severity, { metadata: { query, similarityThreshold } });
        this.query = query;
        this.similarityThreshold = similarityThreshold;
        this.name = 'RAGRetrievalError';
    }
}
// ===============================
// Error Utilities
// ===============================
/**
 * Determines if a knowledge error is recoverable.
 */
export function isRecoverableKnowledgeError(error) {
    if (error instanceof BaseKnowledgeError) {
        return error.recoverable;
    }
    return true; // Default to recoverable for non-knowledge errors
}
/**
 * Gets the severity level of a knowledge error.
 */
export function getKnowledgeErrorSeverity(error) {
    if (error instanceof BaseKnowledgeError) {
        return error.severity;
    }
    return 'medium'; // Default severity
}
/**
 * Creates a knowledge error with proper context wrapping.
 */
export function createKnowledgeError(message, category, context = {}, severity = 'medium') {
    switch (category) {
        case 'FACT':
            return new FACTError(message, severity, context);
        case 'RAG':
            return new RAGError(message, severity, context);
        default:
            throw new Error(`Unknown knowledge error category: ${category}`);
    }
}
