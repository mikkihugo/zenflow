/**
 * @fileoverview Secure ID Generation Utilities
 *
 * Professional ID generation using nanoid library.
 * Focused on secure, collision-resistant identifiers.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { nanoid, customAlphabet } from 'nanoid';

/**
 * Professional secure ID generation utilities
 */
export class SecureIdGenerator {
  /**
   * Generate secure random ID
   */
  static generate(size: number = 21): string {
    return nanoid(size);
  }

  /**
   * Generate workflow-specific ID
   */
  static generateWorkflowId(): string {
    return `workflow-${nanoid(12)}`;`
  }

  /**
   * Generate step-specific ID
   */
  static generateStepId(): string {
    return `step-${nanoid(10)}`;`
  }

  /**
   * Generate execution ID
   */
  static generateExecutionId(): string {
    return `exec-${nanoid(8)}`;`
  }

  /**
   * Generate URL-safe ID
   */
  static generateUrlSafe(size: number = 21): string {
    const urlSafeAlphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_;
    return customAlphabet(urlSafeAlphabet, size)();
  }

  /**
   * Generate numeric-only ID
   */
  static generateNumeric(size: number = 12): string {
    return customAlphabet('0123456789', size)();'
  }
}
