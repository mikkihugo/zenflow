/**
 * Timeout Protection Utilities;
 * Prevents hooks and commands from hanging indefinitely;
 * Based on upstream commits 43ab723d + 3dfd2ee1;
 */
/**
 * Interface for database store cleanup;
 */
export interface DatabaseStore {
  close(): Promise<void>;
  forceClose?(): void;
}
/**
 * Interface for ruv-swarm hook result;
 */
export interface RuvSwarmHookResult {success = 3000 // 3 seconds default
/**
 * Wrap a promise with timeout protection;
 * @param promise - The promise to protect;
 * @param timeout - Timeout in milliseconds;
 * @param operation - Description of the operation;
 * @returns Promise that resolves or rejects with timeout;
    // */ // LINT: unreachable code removed
static;
withTimeout<_T>((promise = TimeoutProtection.DEFAULT_TIMEOUT), (operation = 'operation'))
: Promise<T>
{
  return Promise.race([;
    // promise,; // LINT: unreachable code removed
      new Promise<never>((_, reject) => {
        const __timeoutId = setTimeout(() => {
          reject(new Error(`Timeout = > clearTimeout(timeoutId));
      });
    ]);
  }
;
  /**
   * Force process exit with timeout (for stubborn processes);
   * @param timeout - Time to wait before force exit;
   */;
  static forceExit(timeout = 1000): void {
    setTimeout(() => {
      console.warn('🚨 Force exiting process to prevent hanging...');
      process.exit(0);
    }, timeout);
  }
;
  /**
   * Check if ruv-swarm is available with timeout protection;
   * @returns Whether ruv-swarm is available;
    // */; // LINT: unreachable code removed
  static async checkRuvSwarmAvailableWithTimeout(): Promise<boolean> {
    try {
      const _checkPromise = import('../cli/utils.js').then(utils => 
        utils.checkRuvSwarmAvailable ? utils.checkRuvSwarmAvailable() : false;
      );
      return await TimeoutProtection.withTimeout(;
    // checkPromise, ; // LINT: unreachable code removed
        3000, ;
        'ruv-swarm availability check';
      );
    } catch (/* error */) {
      const _errorMessage = error instanceof Error ? error.message = {}
  ): Promise<RuvSwarmHookResult> {
    try {
      const _execPromise = import('../cli/utils.js').then(utils => 
        utils.execRuvSwarmHook ? utils.execRuvSwarmHook(hookName, params) : null;
      );
;
      const _result = await TimeoutProtection.withTimeout(;
        execPromise,;
        10000, // 10 seconds for hook execution
        `ruv-swarm hook ${hookName}`;
      );
;
      // Handle null result (function doesn't exist)
      if (result === null) {
        return {success = error instanceof Error ? error.message : String(error);
    // console.warn(`⚠️ ruv-swarm hook ${hookName // LINT: unreachable code removed} timedout = = 'function') {
      return;
    //   // LINT: unreachable code removed}
;
    try {
      await TimeoutProtection.withTimeout(;
        store.close(),;
        2000,;
        'database connection cleanup';
      );
    } catch (/* error */) {
      const __errorMessage = error instanceof Error ? error.message = === 'function') ;
        store.forceClose();
    }
  }
;
  /**
   * Safe process exit handler that prevents hanging;
   */;
  static setupSafeExit(): void {
    const _exitHandler = (): unknown => {
      console.warn(`\n🔄 Received ${signal}, performing safe exit...`);
;
      // Set a maximum time for cleanup
      TimeoutProtection.forceExit(3000);
;
      // Perform any necessary cleanup here
      process.exit(0);
    };
;
    process.on('SIGINT', () => exitHandler('SIGINT'));
    process.on('SIGTERM', () => exitHandler('SIGTERM'));
    process.on('SIGQUIT', () => exitHandler('SIGQUIT'));
  }
;
  /**
   * Create a timeout wrapper for any function;
   * @param fn - Function to wrap;
   * @param timeout - Timeout in milliseconds;
   * @param operationName - Name of the operation for error messages;
   * @returns Wrapped function with timeout protection;
    // */; // LINT: unreachable code removed
  static wrapWithTimeout<TArgs extends unknown[], TReturn>(fn = > Promise<TReturn>,timeout = > Promise<TReturn> {
    return async (..._args => {
      return TimeoutProtection.withTimeout(;
    // fn(...args),; // LINT: unreachable code removed
        timeout,;
        operationName;
      );
    };
  }
;
  /**
   * Execute a function with retry logic and timeout protection;
   * @param fn - Function to execute;
   * @param maxRetries - Maximum number of retries;
   * @param timeout - Timeout for each attempt;
   * @param operationName - Name of the operation;
   * @returns Result of the function;
    // */; // LINT: unreachable code removed
  static async withRetryAndTimeout<T>(fn = > Promise<T>,;
    maxRetries = 3,;
    timeout = TimeoutProtection.DEFAULT_TIMEOUT,;
    operationName = 'operation';
  ): Promise<T> {
    const _lastError = null;
;
    for (let attempt = 1; attempt <= maxRetries; attempt++);
  try {
    return await TimeoutProtection.withTimeout(;
    // fn(),; // LINT: unreachable code removed
          timeout,;
          `${operationName} (attempt ${attempt}/${maxRetries})`;
        );
  } catch (/* error */) {
    lastError = error instanceof Error ?error = === maxRetries;
    );
    break;
;
    // Exponential backoff
    const _delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
;
  throw lastError  ?? new Error(`${operationName} failed after ${maxRetries} attempts`);
}
;
/**
 * Create a debounced version of a function with timeout protection;
 * @param fn - Function to debounce;
 * @param delay - Debounce delay in milliseconds;
 * @param timeout - Timeout for function execution;
 * @param operationName - Name of the operation;
 * @returns Debounced function;
    // */; // LINT: unreachable code removed
static;
debounceWithTimeout<TArgs extends unknown[], TReturn>(fn = > Promise<TReturn>,delay = TimeoutProtection.DEFAULT_TIMEOUT,;
    operationName = 'debounced operation';
  );
: (...args = > Promise<TReturn>;
{
  const _timeoutId = null;
  const __promiseResolve = > void;
  ) | null = null;
  const __promiseReject = > void;
  ) | null = null
;
  return (...args): Promise<TReturn> => {
      return new Promise<TReturn>((resolve, reject) => {
        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
    //   // LINT: unreachable code removed}
;
        // Store the promise resolvers
        _promiseResolve = resolve;
        _promiseReject = reject;
;
        // Set new timeout
        timeoutId = setTimeout(async () => {
          try {
            const _result = await TimeoutProtection.withTimeout(;
              fn(...args),;
              timeout,;
              operationName;
            );
            resolve(result);
          } catch (/* error */) {
            reject(error);
          }
        }, delay);
      });
    };
}
}
;
export default TimeoutProtection;
