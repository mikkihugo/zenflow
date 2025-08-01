/**
 * CLI Types Index
 *
 * This module re-exports all CLI type definitions for convenient importing.
 * Follows Google's TypeScript style guide with clear barrel exports.
 */

// Command-related types
export type {
  CommandConfig,
  CommandContext,
  CommandExecutionStats,
  CommandFlagConfig,
  CommandFlags,
  CommandHandler,
  CommandMetadata,
  CommandRegistry,
  CommandResult,
  CommandValidationResult,
} from './command';

// Configuration-related types
export type {
  AgentType,
  CliConfig,
  ConfigValidationError,
  ConfigValidationResult,
  ConfigValidationWarning,
  DatabaseConfig,
  LoggingConfig,
  LogOutput,
  PerformanceConfig,
  PluginConfig,
  SecurityConfig,
  SSLConfig,
  SwarmConfig,
  UIConfig,
} from './config';

// UI-related types
export type {
  FilterOption,
  FilterState,
  FormState,
  ModalState,
  NotificationAction,
  NotificationState,
  PaginationState,
  ScreenState,
  UIAnimationConfig,
  UIAnimations,
  UIBlurEvent,
  UIBorders,
  UIButtonStyles,
  UICardStyles,
  UIChangeEvent,
  UIClickEvent,
  UIColorPalette,
  UIComponent,
  UIComponentSize,
  UIComponentState,
  UIComponentStyles,
  UIComponentVariant,
  UIEventHandlers,
  UIFocusEvent,
  UIInputStyles,
  UIKeyboardEvent,
  UIModalStyles,
  UINavigationStyles,
  UIProgressStyles,
  UISpacing,
  UISubmitEvent,
  UITableStyles,
  UITheme,
  UITypography,
} from './ui';

/**
 * Common utility types used across the CLI system
 */

/**
 * Generic result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Generic async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Generic callback function type
 */
export type Callback<T = void> = (error?: Error, result?: T) => void;

/**
 * Generic event emitter type
 */
export type EventEmitter<T extends Record<string, unknown[]> = Record<string, unknown[]>> = {
  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void;
  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void;
  emit<K extends keyof T>(event: K, ...args: T[K]): void;
};

/**
 * Generic disposable resource type
 */
export interface Disposable {
  dispose(): void | Promise<void>;
}

/**
 * Generic cancelable operation type
 */
export interface Cancelable {
  cancel(): void;
  readonly isCanceled: boolean;
}

/**
 * Progress reporting interface
 */
export interface ProgressReporter {
  report(progress: ProgressInfo): void;
}

/**
 * Progress information
 */
export interface ProgressInfo {
  /** Current progress (0-100) */
  percentage: number;

  /** Progress message */
  message?: string;

  /** Current step */
  step?: number;

  /** Total steps */
  totalSteps?: number;

  /** Additional data */
  data?: unknown;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error message */
  message: string;

  /** Error code */
  code: string;

  /** Field path */
  path?: string;

  /** Expected value */
  expected?: unknown;

  /** Actual value */
  actual?: unknown;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning message */
  message: string;

  /** Warning code */
  code: string;

  /** Field path */
  path?: string;

  /** Suggested action */
  suggestion?: string;
}

/**
 * Timestamp type
 */
export type Timestamp = number | Date | string;

/**
 * Duration type (in milliseconds)
 */
export type Duration = number;

/**
 * URL type
 */
export type URL = string;

/**
 * File path type
 */
export type FilePath = string;

/**
 * Directory path type
 */
export type DirectoryPath = string;

/**
 * Semver version string type
 */
export type Version = string;

/**
 * UUID string type
 */
export type UUID = string;

/**
 * JSON-serializable value type
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Deep partial type utility
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly type utility
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Required keys type utility
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional keys type utility
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Non-empty array type utility
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Tuple to union type utility
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

/**
 * Exact type utility - prevents extra properties
 */
export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;
