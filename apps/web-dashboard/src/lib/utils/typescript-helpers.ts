/**
 * Enterprise TypeScript utilities for Claude Code Zen
 * Provides type-safe utilities and enhanced TypeScript support
 */

// ===== TYPE UTILITIES =====

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys from T that have values of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Create a type with only the properties of T that have values of type U
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Create a type with all properties of T except those that have values of type U
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Make specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// ===== RESULT TYPE FOR ERROR HANDLING =====

export type Result<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

export const Ok = <T>(data: T): Result<T> => ({ success: true, data });
export const Err = <E = Error>(error: E): Result<never, E> => ({ success: false, error });

/**
 * Type-safe result handler
 */
export const match = <T, E, R1, R2>(
  result: Result<T, E>,
  handlers: {
    ok: (data: T) => R1;
    err: (error: E) => R2;
  }
): R1 | R2 => result.success ? handlers.ok(result.data) : handlers.err(result.error);

// ===== BRANDED TYPES FOR TYPE SAFETY =====

declare const __brand: unique symbol;

export type Brand<T, U> = T & { [__brand]: U };

export type UserId = Brand<string, 'UserId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type Timestamp = Brand<number, 'Timestamp'>;

/**
 * Create branded type instances
 */
export const createUserId = (id: string): UserId => id as UserId;
export const createAgentId = (id: string): AgentId => id as AgentId;
export const createTaskId = (id: string): TaskId => id as TaskId;
export const createTimestamp = (ts: number): Timestamp => ts as Timestamp;

// ===== VALIDATION UTILITIES =====

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  required(message = 'This field is required'): this {
    return this.addRule({
      validate: (value: T) => value != null && value !== '',
      message,
    });
  }

  minLength(length: number, message?: string): this {
    return this.addRule({
      validate: (value: T) => 
        typeof value === 'string' && value.length >= length,
      message: message || `Minimum length is ${length}`,
    });
  }

  maxLength(length: number, message?: string): this {
    return this.addRule({
      validate: (value: T) => 
        typeof value === 'string' && value.length <= length,
      message: message || `Maximum length is ${length}`,
    });
  }

  pattern(regex: RegExp, message: string): this {
    return this.addRule({
      validate: (value: T) => 
        typeof value === 'string' && regex.test(value),
      message,
    });
  }

  validate(value: T): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ===== ASYNC UTILITIES =====

/**
 * Type-safe async result wrapper
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const data = await asyncFn();
    return Ok(data);
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Retry utility with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed - this should never be reached');
};

// ===== OBJECT UTILITIES =====

/**
 * Type-safe object key checker
 */
export const hasKey = <T extends object>(
  obj: T,
  key: string | number | symbol
): key is keyof T => key in obj;

/**
 * Type-safe object property getter
 */
export const getProperty = <T, K extends keyof T>(
  obj: T,
  key: K
): T[K] => obj[key];

/**
 * Deep clone utility with type preservation
 */
export const deepClone = <T>(obj: T): T => {
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
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

/**
 * Safe JSON parsing with type checking
 */
export const safeJsonParse = <T>(
  json: string,
  validator?: (obj: unknown) => obj is T
): Result<T, Error> => {
  try {
    const parsed = JSON.parse(json);
    
    if (validator && !validator(parsed)) {
      return Err(new Error('Parsed JSON does not match expected type'));
    }
    
    return Ok(parsed);
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
};

// ===== ARRAY UTILITIES =====

/**
 * Type-safe array grouping
 */
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);

/**
 * Remove duplicates from array with custom equality
 */
export const uniqueBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] => {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// ===== TYPE GUARDS =====

export const isString = (value: unknown): value is string => 
  typeof value === 'string';

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

export const isBoolean = (value: unknown): value is boolean => 
  typeof value === 'boolean';

export const isObject = (value: unknown): value is object => 
  value !== null && typeof value === 'object';

export const isArray = <T>(value: unknown): value is T[] => 
  Array.isArray(value);

export const isFunction = (value: unknown): value is Function => 
  typeof value === 'function';

export const isDefined = <T>(value: T | undefined | null): value is T => 
  value !== undefined && value !== null;

// ===== ENTERPRISE-SPECIFIC TYPES =====

export interface AgentStatus {
  id: AgentId;
  type: string;
  status: 'active' | 'idle' | 'error' | 'stopped';
  lastSeen: Timestamp;
  capabilities: string[];
  metadata?: Record<string, unknown>;
}

export interface TaskDefinition {
  id: TaskId;
  title: string;
  description: string;
  assignedAgentId?: AgentId;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  components: {
    database: 'healthy' | 'degraded' | 'down';
    eventBus: 'healthy' | 'degraded' | 'down';
    neural: 'healthy' | 'degraded' | 'down';
    agents: 'healthy' | 'degraded' | 'down';
  };
  lastCheck: Timestamp;
  uptime: number;
}

// ===== CONFIGURATION TYPES =====

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  enableTelemetry: boolean;
  enableErrorReporting: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxRetries: number;
  retryDelay: number;
  theme: 'light' | 'dark' | 'auto';
}

export const defaultAppConfig: AppConfig = {
  apiUrl: '/api',
  wsUrl: '/ws',
  enableTelemetry: true,
  enableErrorReporting: true,
  logLevel: 'info',
  maxRetries: 3,
  retryDelay: 1000,
  theme: 'auto',
};

/**
 * Type-safe configuration merger
 */
export const mergeConfig = <T extends Record<string, unknown>>(
  defaultConfig: T,
  userConfig: DeepPartial<T>
): T => ({ ...defaultConfig, ...userConfig } as T);