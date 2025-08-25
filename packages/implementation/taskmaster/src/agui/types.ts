/**
 * @file Core AGUI types and interfaces
 *
 * Defines the fundamental types for the Autonomous Graphical User Interface library.
 * These types support rich human-in-the-loop interactions for autonomous systems.
 */

/**
 * Priority levels for questions and interactions
 */
export type Priority = 'critical|high|medium|low';

/**
 * Message types for display formatting
 */
export type MessageType = 'info|warning|error|success|debug';

/**
 * Question types for different interaction patterns
 */
export type QuestionType =|'approval'// Yes/No approval questions|'choice'// Multiple choice selection|'input'// Free text input|'confirmation'// Confirmation dialogs|'review'// Review and feedback|'validation'// Data validation|'checkpoint'// Workflow checkpoints|'emergency'// Emergency escalation|'custom'// Custom question types|'relevance'// Relevance validation|'boundary'// Boundary validation|'relationship'// Relationship validation|'naming'// Naming validation|'priority'; // Priority validation'

/**
 * AGUI adapter types
 */
export enum AGUIType {
  WEB = 'web',
  HEADLESS = 'headless',
}

/**
 * Rich context information for questions
 */
export interface QuestionContext {
  /** Unique identifier for correlation */
  correlationId?: string;

  /** Source system or component */
  source?: string;

  /** Business impact level */
  businessImpact?: 'low|medium|high|critical;

  /** Stakeholders involved */
  stakeholders?: string[];

  /** Dependencies or related items */
  dependencies?: Array<{
    id: string;
    type: string;
    description: string;
  }>;

  /** Deadline information */
  deadline?: Date;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Comprehensive validation question interface
 */
export interface ValidationQuestion {
  /** Unique identifier for the question */
  id: string;

  /** Type of question for appropriate handling */
  type: QuestionType;

  /** The actual question text */
  question: string;

  /** Rich context information */
  context?: QuestionContext;

  /** Available options for choice questions */
  options?: string[];

  /** Allow custom/free-form input */
  allowCustom?: boolean;

  /** Default value or pre-selected option */
  defaultValue?: string;

  /** Confidence level in the question (0-1) */
  confidence: number;

  /** Priority level for handling */
  priority?: Priority;

  /** Validation reason or explanation */
  validationReason?: string;

  /** Expected impact of the decision */
  expectedImpact?: number;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Help text or additional information */
  helpText?: string;

  /** Validation function for input */
  validator?: (input: string) => boolean|string;
}

/**
 * Progress information for operations
 */
export interface ProgressInfo {
  /** Current step or operation */
  current: number;

  /** Total steps or operations */
  total: number;

  /** Progress percentage (0-100) */
  percentage: number;

  /** Current operation description */
  description: string;

  /** Estimated time remaining (ms) */
  estimatedRemaining?: number;

  /** Additional status information */
  status?: string;

  /** Metadata for rich progress display */
  metadata?: Record<string, unknown>;
}

/**
 * Response from AGUI interactions
 */
export interface AGUIResponse {
  /** The user's response */'
  response: string;

  /** Response timestamp */
  timestamp: Date;

  /** Time taken to respond (ms) */
  responseTime: number;

  /** Source of the response */
  source: 'user|system|timeout|default;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Batch question processing results
 */
export interface BatchQuestionResult {
  /** Question ID */
  questionId: string;

  /** Response to the question */
  response: string;

  /** Success status */
  success: boolean;

  /** Error if failed */
  error?: Error;

  /** Response time */
  responseTime: number;
}

/**
 * Configuration for AGUI adapters
 */
export interface AGUIConfig {
  /** Enable rich formatting and colors */
  enableRichFormatting?: boolean;

  /** Enable progress indicators */
  enableProgress?: boolean;

  /** Enable context display */
  enableContextDisplay?: boolean;

  /** Default timeout for questions (ms) */
  defaultTimeout?: number;

  /** Enable logging */
  enableLogging?: boolean;

  /** Logger instance */
  logger?: any;

  /** Custom theme or styling */
  theme?: Record<string, unknown>;

  /** Adapter-specific configuration */
  adapterConfig?: Record<string, unknown>;
}

/**
 * Core AGUI interface that all adapters must implement
 */
export interface AGUIInterface {
  /**
   * Ask a single question and get response
   */
  askQuestion(question: ValidationQuestion): Promise<string>;

  /**
   * Ask multiple questions in batch
   */
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;

  /**
   * Show progress information
   */
  showProgress(progress: ProgressInfo): Promise<void>;

  /**
   * Display a message to the user
   */
  showMessage(message: string, type?: MessageType): Promise<void>;

  /**
   * Show structured information
   */
  showInfo(title: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Clear the display/interface
   */
  clear?(): Promise<void>;

  /**
   * Close/cleanup the interface
   */
  close?(): Promise<void>;

  /**
   * Get configuration
   */
  getConfig?(): AGUIConfig;

  /**
   * Update configuration
   */
  updateConfig?(config: Partial<AGUIConfig>): Promise<void>;
}

/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
  /** Enable event emission */
  enableEvents?: boolean;

  /** Event emitter instance */
  eventEmitter?: any;

  /** Event prefix for namespacing */
  eventPrefix?: string;
}

/**
 * Factory function type for creating AGUI instances
 */
export type AGUIFactory<T extends AGUIInterface = AGUIInterface> = (
  config?: AGUIConfig
) => T|Promise<T>;

/**
 * Registry of AGUI factories
 */
export interface AGUIRegistry {
  register<T extends AGUIInterface>(
    type: string,
    factory: AGUIFactory<T>
  ): void;

  create<T extends AGUIInterface>(
    type: string,
    config?: AGUIConfig
  ): T|Promise<T>;

  getAvailableTypes(): string[];
}

/**
 * Enhanced error types for AGUI operations
 */
export class AGUIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name ='AGUIError;
  }
}

/**
 * Specialized error class for timeout-related failures in AGUI operations.
 *
 * This error is thrown when an AGUI operation exceeds its configured timeout period,
 * such as when waiting for user input or response. It extends the base AGUIError
 * with timeout-specific information.
 *
 * @example
 * ```typescript`
 * try {
 *   const response = await agui.askQuestion({
 *     id: 'approval',
 *     type: 'approval',
 *     question: 'Do you approve this action?',
 *     timeout: 5000,
 *     confidence: 0.8
 *   });
 * } catch (error) {
 *   if (error instanceof AGUITimeoutError) {
 *     console.log(`Operation timed out after ${error.timeoutMs}ms`);`
 *   }
 * }
 * ````
 *
 * @public
 * @extends AGUIError
 */
export class AGUITimeoutError extends AGUIError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT', context);'
    this.name = 'AGUITimeoutError';
  }
}

/**
 * Specialized error class for input validation failures in AGUI operations.
 *
 * This error is thrown when user input fails validation checks, such as when
 * the input doesn't match expected patterns, contains invalid characters, or'
 * fails custom validation logic. It extends the base AGUIError with validation-specific
 * information, including the invalid input that caused the error.
 *
 * @example
 * ```typescript`
 * const emailValidator = (input: string) => {
 *   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 *   if (!emailRegex.test(input)) {
 *     throw new AGUIValidationError(
 *       'Invalid email format',
 *       input,
 *       { expectedFormat: 'email' }'
 *     );
 *   }
 *   return true;
 * };
 *
 * try {
 *   await agui.askQuestion({
 *     id: 'email',
 *     type: 'input',
 *     question: 'Enter your email address:',
 *     validator: emailValidator,
 *     confidence: 0.9
 *   });
 * } catch (error) {
 *   if (error instanceof AGUIValidationError) {
 *     console.log(`Invalid input: ${error.input}`);`
 *   }
 * }
 * ````
 *
 * @public
 * @extends AGUIError
 */
export class AGUIValidationError extends AGUIError {
  constructor(
    message: string,
    public readonly input: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION', context);'
    this.name = 'AGUIValidationError';
  }
}
