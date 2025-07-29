/**
 * Timeout Protection Utilities
 * Prevents hooks and commands from hanging indefinitely
 * Based on upstream commits 43ab723d + 3dfd2ee1
 */

export class TimeoutProtection {
  static DEFAULT_TIMEOUT = 3000; // 3 seconds default

  /**
   * Wrap a promise with timeout protection
   * @param {Promise} promise - The promise to protect
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} operation - Description of the operation
   * @returns {Promise} Promise that resolves or rejects with timeout
   */
  static withTimeout(promise, timeout = TimeoutProtection.DEFAULT_TIMEOUT, operation = 'operation') {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout: ${operation} exceeded ${timeout}ms`));
        }, timeout);
        
        // Clear timeout if the original promise resolves/rejects first
        promise.finally(() => clearTimeout(timeoutId));
      })
    ]);
  }

  /**
   * Force process exit with timeout (for stubborn processes)
   * @param {number} timeout - Time to wait before force exit
   */
  static forceExit(timeout = 1000) {
    setTimeout(() => {
      console.log('🚨 Force exiting process to prevent hanging...');
      process.exit(0);
    }, timeout);
  }

  /**
   * Check if ruv-swarm is available with timeout protection
   * @returns {Promise<boolean>} Whether ruv-swarm is available
   */
  static async checkRuvSwarmAvailableWithTimeout() {
    try {
      const checkPromise = import('../cli/utils.js').then(utils => utils.checkRuvSwarmAvailable());
      return await TimeoutProtection.withTimeout(
        checkPromise, 
        3000, 
        'ruv-swarm availability check'
      );
    } catch (error) {
      console.log(`⚠️ ruv-swarm check timed out: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute ruv-swarm hook with timeout protection
   * @param {string} hookName - Name of the hook
   * @param {Object} params - Hook parameters
   * @returns {Promise<Object>} Hook result or timeout error
   */
  static async execRuvSwarmHookWithTimeout(hookName, params = {}) {
    try {
      const execPromise = import('../cli/utils.js').then(utils => 
        utils.execRuvSwarmHook(hookName, params)
      );
      
      return await TimeoutProtection.withTimeout(
        execPromise,
        10000, // 10 seconds for hook execution
        `ruv-swarm hook ${hookName}`
      );
    } catch (error) {
      console.log(`⚠️ ruv-swarm hook ${hookName} timed out: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timedOut: true
      };
    }
  }

  /**
   * Cleanup database connections with timeout
   * @param {Object} store - Database store instance
   */
  static async cleanupDatabaseWithTimeout(store) {
    if (!store || typeof store.close !== 'function') {
      return;
    }

    try {
      await TimeoutProtection.withTimeout(
        store.close(),
        2000,
        'database connection cleanup'
      );
    } catch (error) {
      console.log(`⚠️ Database cleanup timed out: ${error.message}`);
      // Force close if available
      if (typeof store.forceClose === 'function') {
        store.forceClose();
      }
    }
  }

  /**
   * Safe process exit handler that prevents hanging
   */
  static setupSafeExit() {
    const exitHandler = (signal) => {
      console.log(`\n🔄 Received ${signal}, performing safe exit...`);
      
      // Set a maximum time for cleanup
      TimeoutProtection.forceExit(3000);
      
      // Perform any necessary cleanup here
      process.exit(0);
    };

    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
    process.on('SIGQUIT', exitHandler);
  }
}

export default TimeoutProtection;