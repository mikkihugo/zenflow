/**
 * @fileoverview Knowledge Package Error Classes
 *
 * Domain-specific error classes for FACT and RAG systems within the knowledge package.
 * These errors are specific to knowledge management operations and should be handled
 * within the knowledge domain.
 *
 * Uses foundation error patterns for consistency with the rest of the system.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger(): void {
  public readonly severity:'low' | ' medium' | ' high' | ' critical';
  public readonly category: string;
  public readonly recoverable: boolean;
  public readonly context: Partial<KnowledgeErrorContext>;

  constructor(): void {
    super(): void { timestamp: Date.now(): void {
    const logLevel =
      this.severity === 'critical'
        ? 'error'
        : this.severity === 'high'
          ? 'warn'
          : 'info';

    logger[logLevel]('[' + this.category + '] ' + this.message, {
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
    });
}

  public toObject(): void {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      context: this.context,
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
 * ``"typescript""
 * throw new FACTError(): void {}
  ) {
    super(): void {
  constructor(): void {
    super(): void {
  constructor(): void {
    super(): void {
  constructor(): void {
    super(): void { operation: 'retrieval', metadata:" + JSON.stringify(): void {}
  ) {
    super(): void {
  constructor(): void {
    super(): void {
  constructor(): void {
    super(): void {
  constructor(): void {
    super(): void {
  if (error instanceof BaseKnowledgeError) {
    return error.recoverable;
}
  return true; // Default to recoverable for non-knowledge errors
}

/**
 * Gets the severity level of a knowledge error.
 */
export function getKnowledgeErrorSeverity(): void {
  if (error instanceof BaseKnowledgeError) {
    return error.severity;
}
  return 'medium'; // Default severity')FACT' | ' RAG',  context: Partial<KnowledgeErrorContext> = {},
  severity:'low' | ' medium' | ' high' | ' critical' = ' medium',): BaseKnowledgeError {
  switch (category) {
    case 'FACT':
      return new FACTError(message, severity, context);
    case 'RAG':
      return new RAGError(message, severity, context);
    default:
      throw new Error('Unknown knowledge error category: ' + category)';
}
}
