/**
 * @fileoverview Global type declarations for claude-code-zen server
 *
 * Provides global type definitions that are not available in older Node.js versions
 * or need to be extended for the application.
 */

// ErrorOptions is available in Node.js 16.9.0+ but may not be in type definitions
declare global { /** * Error options for Node.js Error constructor. * Available in Node.js 16.9.0+ */ interface ErrorOptions { cause?: any
} /** * Extended Error constructor that accepts ErrorOptions */ interface ErrorConstructor {
  new (message?: string,
  options?: ErrorOptions): Error;
  (message?: string,
  options?: ErrorOptions): Error

}
}

export {};
