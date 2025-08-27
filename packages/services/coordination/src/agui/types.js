/**
 * @file Core AGUI types and interfaces
 *
 * Defines the fundamental types for the Autonomous Graphical User Interface library.
 * These types support rich human-in-the-loop interactions for autonomous systems.
 */
/**
 * AGUI adapter types
 */
export var AGUIType;
(function (AGUIType) {
    AGUIType["WEB"] = "web";
    AGUIType["HEADLESS"] = "headless";
})(AGUIType || (AGUIType = {}));
/** The user's response */ ';
response: string;
/** Response timestamp */
timestamp: Date;
/** Time taken to respond (ms) */
responseTime: number;
/** Source of the response */
source: 'user|system|timeout|default;;
/** Additional metadata */
metadata ?  : Record;
/**
 * Enhanced error types for AGUI operations
 */
export class AGUIError extends Error {
    code;
    context;
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'AGUIError;;
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
    timeoutMs;
    constructor(message, timeoutMs, context) {
        super(message, 'TIMEOUT', context);
        this.timeoutMs = timeoutMs;
        ';
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
    input;
    constructor(message, input, context) {
        super(message, 'VALIDATION', context);
        this.input = input;
        ';
        this.name = 'AGUIValidationError';
    }
}
