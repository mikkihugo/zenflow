/**
 * @fileoverview Utilities Module Exports
 *
 * Common utility functions organized by functional domain.
 */

// Export specific functions to avoid conflicts
export {
  validateInput,
  createValidator,
  z,
  isEmail,
  isURL,
  isUUID,
  isTimestamp,
  isISODateString,
  isPrimitive,
  isNonEmptyArray,
  isValidJSON,
  UUIDSchema,
  EmailSchema,
  URLSchema,
  NonEmptyStringSchema,
  PositiveNumberSchema,
  hasValidationError,
  getValidationErrors,
} from './validation';

export {
  isDevelopment,
  isProduction,
  isTest,
  getEnvironment,
  getSystemInfo,
  getProcessInfo,
  getPlatform,
  getArchitecture,
  isWindows,
  isMacOS,
  isLinux,
  isCI,
  isDocker,
  isWSL,
  getWorkspaceDetector,
  startMonitoring,
  createSystemSummary,
  checkSystemRequirements,
} from './system';

export * from './common';

// Export additional utilities with specific exports to avoid conflicts
export {
  generateUUID,
  generateShortId,
  generateCustomId,
  generateTimestampId,
  generateSessionId,
  generateApiKey,
  nanoid,
  customAlphabet,
} from './ids';

export {
  now,
  timestampFromDate,
  dateFromTimestamp,
  isoStringFromTimestamp,
  formatTimestamp,
  parseISO,
} from './time';

export {
  pTimeout,
  withRetry as retryAsync,
  concurrent,
  withTimeout as timeoutPromise,
} from './async';
