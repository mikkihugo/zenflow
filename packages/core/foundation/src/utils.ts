/**
 * @fileoverview Utilities Entry Point
 *
 * Common utilities, validation, file operations, and helper functions.
 * Import this for general utility functions.
 */

// Foundation re-exports commander - use internal import to avoid circular dependency
import {
  Command as CommanderCommand,
  program as commanderProgram,
} from 'commander';
// =============================================================================
// DATE UTILITIES - Foundation re-exports date-fns internally
// =============================================================================
import * as dateFnsLib from 'date-fns';
import {
  addDays as dateFnsAddDays,
  addHours as dateFnsAddHours,
  addMinutes as dateFnsAddMinutes,
  differenceInDays as dateFnsDifferenceInDays,
  differenceInHours as dateFnsDifferenceInHours,
  differenceInMinutes as dateFnsDifferenceInMinutes,
  endOfDay as dateFnsEndOfDay,
  endOfMonth as dateFnsEndOfMonth,
  endOfWeek as dateFnsEndOfWeek,
  format as dateFnsFormat,
  isAfter as dateFnsIsAfter,
  isBefore as dateFnsIsBefore,
  isEqual as dateFnsIsEqual,
  parseISO as dateFnsParseISO,
  startOfDay as dateFnsStartOfDay,
  startOfMonth as dateFnsStartOfMonth,
  startOfWeek as dateFnsStartOfWeek,
  subDays as dateFnsSubDays,
} from 'date-fns';
// =============================================================================
// COMMON UTILITIES - Foundation re-exports utilities internally
// =============================================================================
import lodashLib from 'lodash';
import {
  customAlphabet as nanoidCustomAlphabet,
  nanoid as nanoidGenerator,
} from 'nanoid';
export type { CommanderError, Help, Option } from 'commander';
export { CommanderCommand as Command, commanderProgram as program };

export const dateFns = dateFnsLib;
export {
  dateFnsAddDays as addDays,
  dateFnsAddHours as addHours,
  dateFnsAddMinutes as addMinutes,
  dateFnsDifferenceInDays as differenceInDays,
  dateFnsDifferenceInHours as differenceInHours,
  dateFnsDifferenceInMinutes as differenceInMinutes,
  dateFnsEndOfDay as endOfDay,
  dateFnsEndOfMonth as endOfMonth,
  dateFnsEndOfWeek as endOfWeek,
  dateFnsFormat as format,
  dateFnsIsAfter as isAfter,
  dateFnsIsBefore as isBefore,
  dateFnsIsEqual as isEqual,
  dateFnsParseISO as parseISO,
  dateFnsStartOfDay as startOfDay,
  dateFnsStartOfMonth as startOfMonth,
  dateFnsStartOfWeek as startOfWeek,
  dateFnsSubDays as subDays,
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _ = lodashLib;
export const lodash = lodashLib;
export const customAlphabet = nanoidCustomAlphabet;
export const nanoid = nanoidGenerator;
export const generateNanoId = nanoidGenerator;

// =============================================================================
// UUID UTILITIES
// =============================================================================
export { generateUUID, isUUID } from './types/primitives';
export type {
  CleanedEnv,
  Spec,
  ZodError,
  ZodSchema,
  ZodType,
} from './utilities';
// =============================================================================
// VALIDATION & SCHEMA UTILITIES
// =============================================================================
// =============================================================================
// FILE & JSON UTILITIES
// =============================================================================
export {
  bool,
  commonEnvSchema,
  createEnvValidator,
  createValidator,
  directoryExists,
  email,
  fileExists,
  getCommonEnv,
  host,
  json,
  num,
  parseJSON,
  parseJSONWithSchema,
  port,
  readFile,
  readJSONFile,
  safeGet,
  safePath,
  str,
  stringifyJSON,
  url,
  validateEnv,
  validateInput,
  validateRequest,
  writeFile,
  writeJSONFile,
  z,
} from './utilities';

// =============================================================================
// NODE.JS FORCING PATTERNS - Replace dangerous built-ins with safe alternatives
// =============================================================================

// FORCE:Type-safe path operations with validation
export {
  basename as getFilename,
  dirname as getDirectory,
  extname as getExtension,
  join as joinPath,
  resolve as resolvePath,
} from 'node:path';
// FORCE:Promise-based timers instead of callback-based
export {
  setInterval as recurring,
  setTimeout as delay,
} from 'node:timers/promises';

// FORCE:Safe URL handling with validation
export { fileURLToPath, pathToFileURL } from 'node:url';

// FORCE:Environment access with better naming
export const { env } = process;
export const { cwd } = process;
export const { platform } = process;
export const { version: nodeVersion } = process;

// FORCE:Safe Buffer operations with clear naming
export { Buffer as BinaryData } from 'node:buffer';

// FORCE:OS utilities with consistent naming
export {
  cpus as getCPUs,
  freemem as getFreeMemory,
  homedir as getHomeDirectory,
  hostname as getHostname,
  tmpdir as getTempDirectory,
  totalmem as getTotalMemory,
} from 'node:os';

// FORCE:Process lifecycle - foundation handles graceful shutdown
// Note:onExit and pTimeout would be imported from process lifecycle utilities

// FORCE:Better console patterns (use getLogger instead)
export const console = {
  error: () => {
    throw new Error('Use getLogger().error() instead of logger.error()');
  },
  log: () => {
    throw new Error('Use getLogger().info() instead of logger.info()');
  },
  warn: () => {
    throw new Error('Use getLogger().warn() instead of logger.warn()');
  },
  debug: () => {
    throw new Error('Use getLogger().debug() instead of console.debug()');
  },
};

// FORCE:Crypto with better naming and safety
export {
  createHash as hash,
  createHmac as hmac,
  randomBytes as generateSecureBytes,
  randomUUID as generateSecureId,
} from 'node:crypto';

// FORCE:Better error patterns (no throwing, use Result)
export const throwError = (): never => {
  throw new Error(
    'Use err(new Error()) and Result pattern instead of throwing'
  );
};

// =============================================================================
// CRITICAL FOOTGUN PREVENTION - Block the most dangerous Node.js patterns
// =============================================================================

// FORCE:Block synchronous file operations (thread-blocking footguns)
export const readFileSync = (): never => {
  throw new Error(
    'Use async readFile() from foundation - sync file ops block the event loop'
  );
};
export const writeFileSync = (): never => {
  throw new Error(
    'Use async writeFile() from foundation - sync file ops block the event loop'
  );
};

// FORCE:Block process.exit (crashes without cleanup)
export const exit = (): never => {
  throw new Error('Use onExit() from foundation for graceful shutdown');
};

// FORCE:Block setImmediate/nextTick (event loop footguns)
export const setImmediate = (): never => {
  throw new Error('Use delay(0) from foundation for better async patterns');
};
export const nextTick = (): never => {
  throw new Error(
    'Use delay(0) or await from foundation - avoid nextTick footguns'
  );
};

// FORCE:Block eval and Function constructor (security footguns)
export const safeEval = (): never => {
  throw new Error(
    'eval() is dangerous - use safe parsing with parseJSON() from foundation'
  );
};
export const createFunction = (): never => {
  throw new Error(
    'Function constructor is dangerous - use static imports or safe factories'
  );
};

// FORCE:Block global pollution
export const global = new Proxy(
  {},
  {
    set: () => {
      throw new Error(
        'Avoid global pollution - use dependency injection from foundation'
      );
    },
    get: () => {
      throw new Error('Avoid global access - use explicit imports and DI');
    },
  }
);

// FORCE:Block require() in ESM (module system confusion)
export const require = (): never => {
  throw new Error(
    'Use import statements - mixing require/import causes module system issues'
  );
};
