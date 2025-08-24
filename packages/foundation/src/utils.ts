/**
 * @fileoverview Utilities Entry Point
 *
 * Common utilities, validation, file operations, and helper functions.
 * Import this for general utility functions.
 */

// =============================================================================
// VALIDATION & SCHEMA UTILITIES
// =============================================================================
export {
  z,
  validateInput,
  createValidator,
  str,
  num,
  bool,
  port,
  url,
  email,
  json,
  host,
  createEnvValidator,
  getCommonEnv,
  commonEnvSchema,
} from './utilities';

export type {
  ZodSchema,
  ZodType,
  ZodError,
  Spec,
  CleanedEnv,
} from './utilities';

// =============================================================================
// COMMON UTILITIES - Battle-tested libraries
// =============================================================================
export { default as _ } from 'lodash';
export { default as lodash } from 'lodash';
export { Command, program } from 'commander';
export type { CommanderError, Help, Option } from 'commander';
export { nanoid, customAlphabet } from 'nanoid';
export { nanoid as generateNanoId } from 'nanoid';

// =============================================================================
// UUID UTILITIES
// =============================================================================
export {
  generateUUID,
  isUUID,
} from './types/core/primitives';

// =============================================================================
// DATE UTILITIES - date-fns re-exports
// =============================================================================
export * as dateFns from 'date-fns';
export {
  format,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  subDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

// =============================================================================
// FILE & JSON UTILITIES
// =============================================================================
export {
  parseJSON,
  stringifyJSON,
  parseJSONWithSchema,
  validateRequest,
  validateEnv,
  safeGet,
  readFile,
  writeFile,
  directoryExists,
  fileExists,
  safePath,
  readJSONFile,
  writeJSONFile,
} from './utilities';