/**
 * @fileoverview Knowledge Package Error Classes
 *
 * Domain-specific error classes for FACT and RAG systems within the knowledge package.
 * These errors are specific to knowledge management operations and should be handled
 * within the knowledge domain.
 *
 * Uses foundation error patterns for consistency with the rest of the system.
 */
import { EnhancedError} from '@claude-zen/foundation';
/**
 * Base error context interface for knowledge operations
 */
export interface KnowledgeErrorContext {
  timestamp: number;
  operation?:string;
  correlationId?:string;
  metadata?:Record<string, unknown>;
}
/**
 * Base error class for knowledge domain operations
 */
export declare abstract class BaseKnowledgeError extends EnhancedError {
  readonly severity: 'low|medium|high|critical;
'  readonly category: string;
  readonly recoverable: boolean;
  constructor(): void { operation: 'dataProcessing', metadata:" + JSON.stringify(): void {
  readonly backend: string;
  readonly operation: string;
  constructor(): void {
  readonly processType: string;
  readonly dataId?:string|undefined;
  constructor(): void { operation: 'retrieval', metadata:" + JSON.stringify(): void {
  readonly operation: 'embed|search|index|delete;
'  readonly vectorDimension?:number|undefined;
  constructor(
    message: string,
    operation: 'embed|search|index|delete',    vectorDimension?:number|undefined,
    severity?:'low' | ' medium' | ' high' | ' critical;
}
/**
 * Error for RAG embedding operations.
 */
export declare class RAGEmbeddingError extends RAGError {
  readonly modelName: string;
  readonly textLength?:number|undefined;
  constructor(
    message: string,
    modelName: string,
    textLength?:number|undefined,
    severity?:'low' | ' medium' | ' high' | ' critical;
}
/**
 * Error for RAG retrieval operations.
 */
export declare class RAGRetrievalError extends RAGError {
  readonly query: string;
  readonly similarityThreshold?:number|undefined;
  constructor(
    message: string,
    query: string,
    similarityThreshold?:number|undefined,
    severity?:'low|medium|high|critical')low|medium|high|critical;
'/**
 * Creates a knowledge error with proper context wrapping.
 */
export declare function createKnowledgeError(
  message: string,
  category: 'FACT|RAG',  context?:Partial<KnowledgeErrorContext>,
  severity?:'low|medium|high|critical')):BaseKnowledgeError;
//# sourceMappingURL=errors.d.ts.map
