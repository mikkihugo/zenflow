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
} from './types/primitives';

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

// =============================================================================
// NODE.JS FORCING PATTERNS - Replace dangerous built-ins with safe alternatives
// =============================================================================

// FORCE: Promise-based timers instead of callback-based
export { setTimeout as delay, setInterval as recurring } from 'node:timers/promises';

// FORCE: Type-safe path operations with validation
export {
  join as joinPath,
  resolve as resolvePath,
  dirname as getDirectory,
  basename as getFilename,
  extname as getExtension,
} from 'node:path';

// FORCE: Safe URL handling with validation
export { fileURLToPath, pathToFileURL } from 'node:url';

// FORCE: Environment access with better naming
export const {env} = process;
export const {cwd} = process;
export const {platform} = process;
export const {version: nodeVersion} = process;

// FORCE: Safe Buffer operations with clear naming
export { Buffer as BinaryData } from 'node:buffer';

// FORCE: OS utilities with consistent naming
export {
  homedir as getHomeDirectory,
  tmpdir as getTempDirectory,
  hostname as getHostname,
  cpus as getCPUs,
  totalmem as getTotalMemory,
  freemem as getFreeMemory,
} from 'node:os';

// FORCE: Process lifecycle - foundation handles graceful shutdown
// Note: onExit and pTimeout would be imported from process lifecycle utilities

// FORCE: Better console patterns (use getLogger instead)
export const console = {
  error: () => {
    throw new Error('Use getLogger().error() instead of console.error()');
  },
  log: () => {
    throw new Error('Use getLogger().info() instead of console.log()');
  },
  warn: () => {
    throw new Error('Use getLogger().warn() instead of console.warn()');
  },
  debug: () => {
    throw new Error('Use getLogger().debug() instead of console.debug()');
  },
};

// FORCE: Crypto with better naming and safety
export {
  randomUUID as generateSecureId,
  randomBytes as generateSecureBytes,
  createHash as hash,
  createHmac as hmac,
} from 'node:crypto';

// FORCE: Better error patterns (no throwing, use Result)
export const throwError = (): never => {
  throw new Error('Use err(new Error()) and Result pattern instead of throwing');
};

// =============================================================================
// CRITICAL FOOTGUN PREVENTION - Block the most dangerous Node.js patterns
// =============================================================================

// FORCE: Block synchronous file operations (thread-blocking footguns)
export const readFileSync = (): never => {
  throw new Error('Use async readFile() from foundation - sync file ops block the event loop');
};
export const writeFileSync = (): never => {
  throw new Error('Use async writeFile() from foundation - sync file ops block the event loop');
};

// FORCE: Block process.exit (crashes without cleanup)
export const exit = (): never => {
  throw new Error('Use onExit() from foundation for graceful shutdown');
};

// FORCE: Block setImmediate/nextTick (event loop footguns)
export const setImmediate = (): never => {
  throw new Error('Use delay(0) from foundation for better async patterns');
};
export const nextTick = (): never => {
  throw new Error('Use delay(0) or await from foundation - avoid nextTick footguns');
};

// FORCE: Block eval and Function constructor (security footguns)
export const safeEval = (): never => {
  throw new Error('eval() is dangerous - use safe parsing with parseJSON() from foundation');
};
export const createFunction = (): never => {
  throw new Error('Function constructor is dangerous - use static imports or safe factories');
};

// FORCE: Block global pollution
export const global = new Proxy({}, {
  set: () => {
    throw new Error('Avoid global pollution - use dependency injection from foundation');
  },
  get: () => {
    throw new Error('Avoid global access - use explicit imports and DI');
  },
});

// FORCE: Block require() in ESM (module system confusion)
export const require = (): never => {
  throw new Error('Use import statements - mixing require/import causes module system issues');
};
