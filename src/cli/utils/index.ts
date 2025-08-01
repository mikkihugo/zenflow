/**
 * CLI Utilities Index
 * 
 * This module re-exports all CLI utility functions for convenient importing.
 * Provides common utilities for logging, file operations, validation, and formatting.
 */

// Logging utilities
export {
  createLogger,
  LogLevel,
  type Logger,
  type LoggerConfig,
  formatMessage,
  colorize,
  Colors,
} from './logger';

// File system utilities
export {
  readFile,
  writeFile,
  fileExists,
  directoryExists,
  createDirectory,
  ensureDirectory,
  copyFile,
  moveFile,
  deleteFile,
  deleteDirectory,
  listFiles,
  listDirectories,
  getFileStats,
  isFile,
  isDirectory,
  getFileExtension,
  getFileName,
  getDirectoryName,
  joinPath,
  resolvePath,
  relativePath,
  type FileStats,
  type DirectoryListing,
} from './file-system';

// Validation utilities
export {
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateUrl,
  validateEmail,
  validateFilePath,
  validateDirectoryPath,
  validatePort,
  validateVersion,
  validateUuid,
  isValidJson,
  parseJson,
  validateJsonSchema,
  type ValidationRule,
  type ValidationContext,
  type ValidatorFunction,
} from './validation';

// Formatting utilities
export {
  formatTable,
  formatList,
  formatJson,
  formatYaml,
  formatMarkdown,
  formatProgress,
  formatDuration,
  formatBytes,
  formatDate,
  formatRelativeTime,
  truncateText,
  padText,
  wrapText,
  alignText,
  stripAnsi,
  getTerminalWidth,
  type TableOptions,
  type ListOptions,
  type ProgressOptions,
  type FormattingOptions,
  type TextAlignment,
} from './formatting';

/**
 * Common utility functions
 */

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>): void => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Generate a random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    
    return cloned;
  }
  
  return obj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T>(...objects: Partial<T>[]): T {
  const result = {} as T;
  
  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = deepMerge(result[key] || {} as any, value);
        } else {
          result[key] = value as T[Extract<keyof T, string>];
        }
      }
    }
  }
  
  return result;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Sanitize a string for use as a filename
 */
export function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse command line arguments into key-value pairs
 */
export function parseArgs(args: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        result[key] = nextArg;
        i++; // Skip next argument as it's the value
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      result[key] = true;
    }
  }
  
  return result;
}
