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
    AGUIType["TERMINAL"] = "terminal";
    AGUIType["WEB"] = "web";
    AGUIType["MOCK"] = "mock";
    AGUIType["HEADLESS"] = "headless";
})(AGUIType || (AGUIType = {}));
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
        this.name = 'AGUIError';
    }
}
export class AGUITimeoutError extends AGUIError {
    timeoutMs;
    constructor(message, timeoutMs, context) {
        super(message, 'TIMEOUT', context);
        this.timeoutMs = timeoutMs;
        this.name = 'AGUITimeoutError';
    }
}
export class AGUIValidationError extends AGUIError {
    input;
    constructor(message, input, context) {
        super(message, 'VALIDATION', context);
        this.input = input;
        this.name = 'AGUIValidationError';
    }
}
