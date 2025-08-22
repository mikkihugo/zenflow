/**
 * @fileoverview Global type declarations for claude-code-zen server
 *
 * Provides global type definitions that are not available in older Node0.js versions
 * or need to be extended for the application0.
 */

// ErrorOptions is available in Node0.js 160.90.0+ but may not be in type definitions
declare global {
  /**
   * Error options for Node0.js Error constructor0.
   * Available in Node0.js 160.90.0+
   */
  interface ErrorOptions {
    cause?: any;
  }

  /**
   * Extended Error constructor that accepts ErrorOptions
   */
  interface ErrorConstructor {
    new (message?: string, options?: ErrorOptions): Error;
    (message?: string, options?: ErrorOptions): Error;
  }
}

export {};
