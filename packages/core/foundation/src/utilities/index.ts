/**
 * @fileoverview Utilities Module Exports
 *
 * Common utility functions organized by functional domain.
 */

// Export specific functions to avoid conflicts
// Temporary direct export to bypass module resolution issues
import { z } from 'zod';
export {
  concurrent,
  pTimeout,
  withRetry as retryAsync,
  withTimeout as timeoutPromise,
} from './async';
export * from './common/index.js';
// Export additional utilities with specific exports to avoid conflicts
export {
  customAlphabet,
  generateApiKey,
  generateCustomId,
  generateSessionId,
  generateShortId,
  generateTimestampId,
  generateUUID,
  nanoid,
} from './ids';
export {
  checkSystemRequirements,
  createSystemSummary,
  getArchitecture,
  getEnvironment,
  getPlatform,
  getProcessInfo,
  getSystemInfo,
  getWorkspaceDetector,
  isCI,
  isDevelopment,
  isDocker,
  isLinux,
  isMacOS,
  isProduction,
  isTest,
  isWindows,
  isWSL,
} from './system';

export {
  dateFromTimestamp,
  formatTimestamp,
  isoStringFromTimestamp,
  now,
  parseISO,
  timestampFromDate,
} from './time';
export const emailSchema = z.string().email();

// Temporarily comment out validation exports to fix circular import issue
// export {
// 	createValidator,
// 	// EmailSchema, // Exported directly above
// 	getValidationErrors,
// 	hasValidationError,
// 	isEmail,
// 	isISODateString,
// 	isNonEmptyArray,
// 	isPrimitive,
// 	isTimestamp,
// 	isURL,
// 	isUUID,
// 	isValidJSON,
// 	NonEmptyStringSchema,
// 	PositiveNumberSchema,
// 	URLSchema,
// 	UUIDSchema,
// 	validateInput,
// 	z,
//} from "./validation";

// Direct exports to bypass import issues
export { z } from 'zod';
export const nonEmptyStringSchema = z.string().min(1);
export const positiveNumberSchema = z.number().positive();
export const urlSchema = z.string().url();
export const uuidSchema = z.string().uuid();

// Simple validation functions without complex dependencies
export function isEmail(value: unknown): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isURL(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    // Use global URL constructor
    new globalThis.URL(value);
    return true;
  } catch {
    return false;
  }
}
