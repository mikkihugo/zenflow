/**
 * Secure Plugin Worker
 * Sandboxed execution environment for plugins with security restrictions
 * This file runs in a Worker thread with limited access to system resources
 */

const { parentPort, workerData } = require('worker_threads');
const { createHash, randomUUID } = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

// Extract worker configuration
const { manifest, config, policy, allowedPaths, deniedPaths } = workerData;

class SecureEnvironment {
  constructor() {
    this.startTime = Date.now();
    this.operationCount = 0;
    this.memoryLimit = policy.maxMemoryUsage * 1024 * 1024; // Convert MB to bytes
    this.executionTimeLimit = policy.maxExecutionTime;
    this.networkRequestCount = 0;
    this.lastNetworkReset = Date.now();
    
    // Create restricted global context
    this.createRestrictedGlobals();
    
    // Set up security monitoring
    this.startSecurityMonitoring();
  }

  createRestrictedGlobals() {
    // Remove dangerous globals
    delete global.process;
    delete global.require;
    delete global.Buffer;
    delete global.__dirname;
    delete global.__filename;
    
    // Create safe alternatives
    global.secureRequire = this.createSecureRequire();
    global.secureFs = this.createSecureFileSystem();
    global.secureHttp = this.createSecureHttp();
    global.secureConsole = this.createSecureConsole();
    
    // Override eval and Function constructor
    global.eval = () => {
      throw new SecurityError('eval is not allowed in sandboxed environment');
    };
    
    global.Function = () => {
      throw new SecurityError('Function constructor is not allowed');
    };
  }

  createSecureRequire() {
    const allowedModules = new Set([
      'crypto', 'util', 'events', 'stream', 'url', 'querystring', 
      'path', 'os', 'zlib', 'buffer'
    ]);

    return (moduleName) => {
      // Check if module is allowed
      if (!allowedModules.has(moduleName)) {
        throw new SecurityError(`Module '${moduleName}' is not allowed in sandbox`);
      }

      // Check if operation is allowed by policy
      if (!this.isOperationAllowed(`require:${moduleName}`)) {
        throw new SecurityError(`Require operation for '${moduleName}' denied by security policy`);
      }

      this.incrementOperationCount();

      try {
        return require(moduleName);
      } catch (error) {
        this.reportSecurityViolation('require-failed', 'medium', {
          module: moduleName,
          error: error.message
        });
        throw error;
      }
    };
  }

  createSecureFileSystem() {
    return {
      readFile: async (filePath, options) => {
        const resolvedPath = path.resolve(filePath);
        
        // Check path permissions
        if (!this.isPathAllowed(resolvedPath, 'read')) {
          throw new SecurityError(`File read access denied: ${filePath}`);
        }

        if (!this.isOperationAllowed('fs:read')) {
          throw new SecurityError('File system read operations are not allowed');
        }

        this.incrementOperationCount();

        try {
          const startTime = performance.now();
          const result = await fs.readFile(resolvedPath, options);
          const duration = performance.now() - startTime;
          
          this.reportOperation('fs-read', { path: filePath, size: result.length, duration });
          return result;
        } catch (error) {
          this.reportSecurityViolation('fs-read-failed', 'low', {
            path: filePath,
            error: error.message
          });
          throw error;
        }
      },

      writeFile: async (filePath, data, options) => {
        const resolvedPath = path.resolve(filePath);
        
        // Check path permissions
        if (!this.isPathAllowed(resolvedPath, 'write')) {
          throw new SecurityError(`File write access denied: ${filePath}`);
        }

        if (!this.isOperationAllowed('fs:write')) {
          throw new SecurityError('File system write operations are not allowed');
        }

        this.incrementOperationCount();

        try {
          const startTime = performance.now();
          await fs.writeFile(resolvedPath, data, options);
          const duration = performance.now() - startTime;
          
          this.reportOperation('fs-write', { 
            path: filePath, 
            size: typeof data === 'string' ? data.length : data.byteLength,
            duration 
          });
        } catch (error) {
          this.reportSecurityViolation('fs-write-failed', 'medium', {
            path: filePath,
            error: error.message
          });
          throw error;
        }
      },

      mkdir: async (dirPath, options) => {
        const resolvedPath = path.resolve(dirPath);
        
        if (!this.isPathAllowed(resolvedPath, 'write')) {
          throw new SecurityError(`Directory creation access denied: ${dirPath}`);
        }

        if (!this.isOperationAllowed('fs:write')) {
          throw new SecurityError('Directory creation is not allowed');
        }

        this.incrementOperationCount();

        try {
          await fs.mkdir(resolvedPath, options);
          this.reportOperation('fs-mkdir', { path: dirPath });
        } catch (error) {
          this.reportSecurityViolation('fs-mkdir-failed', 'medium', {
            path: dirPath,
            error: error.message
          });
          throw error;
        }
      },

      readdir: async (dirPath, options) => {
        const resolvedPath = path.resolve(dirPath);
        
        if (!this.isPathAllowed(resolvedPath, 'read')) {
          throw new SecurityError(`Directory read access denied: ${dirPath}`);
        }

        if (!this.isOperationAllowed('fs:read')) {
          throw new SecurityError('Directory read operations are not allowed');
        }

        this.incrementOperationCount();

        try {
          const result = await fs.readdir(resolvedPath, options);
          this.reportOperation('fs-readdir', { path: dirPath, count: result.length });
          return result;
        } catch (error) {
          this.reportSecurityViolation('fs-readdir-failed', 'low', {
            path: dirPath,
            error: error.message
          });
          throw error;
        }
      }
    };
  }

  createSecureHttp() {
    return {
      fetch: async (url, options = {}) => {
        // Check network permissions
        if (!this.isOperationAllowed('net:external')) {
          throw new SecurityError('Network operations are not allowed');
        }

        // Check URL against allowed/denied domains
        const urlObj = new URL(url);
        if (!this.isDomainAllowed(urlObj.hostname)) {
          throw new SecurityError(`Domain access denied: ${urlObj.hostname}`);
        }

        // Check rate limits
        if (!this.checkNetworkRateLimit()) {
          throw new SecurityError('Network rate limit exceeded');
        }

        this.incrementOperationCount();
        this.networkRequestCount++;

        try {
          const startTime = performance.now();
          
          // Use a restricted fetch implementation
          const response = await this.restrictedFetch(url, options);
          
          const duration = performance.now() - startTime;
          this.reportOperation('http-request', {
            url: urlObj.origin,
            method: options.method || 'GET',
            status: response.status,
            duration
          });

          return response;
        } catch (error) {
          this.reportSecurityViolation('http-request-failed', 'medium', {
            url: urlObj.origin,
            error: error.message
          });
          throw error;
        }
      }
    };
  }

  createSecureConsole() {
    return {
      log: (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        this.reportOperation('console-log', { message: message.substring(0, 200) });
        
        // Send to parent for logging
        parentPort.postMessage({
          type: 'console-log',
          pluginName: manifest.name,
          level: 'info',
          message,
          timestamp: new Date().toISOString()
        });
      },

      error: (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        this.reportOperation('console-error', { message: message.substring(0, 200) });
        
        parentPort.postMessage({
          type: 'console-log',
          pluginName: manifest.name,
          level: 'error',
          message,
          timestamp: new Date().toISOString()
        });
      },

      warn: (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        this.reportOperation('console-warn', { message: message.substring(0, 200) });
        
        parentPort.postMessage({
          type: 'console-log',
          pluginName: manifest.name,
          level: 'warn',
          message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  // Security validation methods
  isOperationAllowed(operation) {
    if (policy.deniedOperations.includes(operation)) {
      return false;
    }
    
    if (policy.allowedOperations.length > 0) {
      return policy.allowedOperations.some(allowed => 
        operation.startsWith(allowed.replace('*', ''))
      );
    }
    
    return true;
  }

  isPathAllowed(filePath, operation) {
    const normalizedPath = path.normalize(filePath);
    
    // Check against denied paths
    for (const deniedPath of deniedPaths) {
      if (normalizedPath.startsWith(path.normalize(deniedPath))) {
        return false;
      }
    }
    
    // Check against allowed paths
    if (allowedPaths.length > 0) {
      return allowedPaths.some(allowedPath => 
        normalizedPath.startsWith(path.normalize(allowedPath))
      );
    }
    
    return true;
  }

  isDomainAllowed(hostname) {
    // Check denied domains first
    if (policy.deniedDomains.includes(hostname)) {
      return false;
    }
    
    // Check allowed domains
    if (policy.allowedDomains.length > 0) {
      return policy.allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
    }
    
    return true;
  }

  checkNetworkRateLimit() {
    const now = Date.now();
    const minutesPassed = (now - this.lastNetworkReset) / 60000;
    
    if (minutesPassed >= 1) {
      this.networkRequestCount = 0;
      this.lastNetworkReset = now;
      return true;
    }
    
    return this.networkRequestCount < policy.maxNetworkRequests;
  }

  async restrictedFetch(url, options) {
    // This would implement a restricted fetch with timeout and size limits
    // For now, using a placeholder that simulates the fetch API
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Resource monitoring
  startSecurityMonitoring() {
    // Monitor memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > this.memoryLimit) {
        this.reportSecurityViolation('memory-limit-exceeded', 'critical', {
          current: memUsage.heapUsed,
          limit: this.memoryLimit
        });
      }
    }, 5000);

    // Monitor execution time
    setInterval(() => {
      const executionTime = Date.now() - this.startTime;
      if (executionTime > this.executionTimeLimit) {
        this.reportSecurityViolation('execution-time-exceeded', 'critical', {
          current: executionTime,
          limit: this.executionTimeLimit
        });
      }
    }, 10000);
  }

  incrementOperationCount() {
    this.operationCount++;
    
    // Check for excessive operations (potential DoS)
    if (this.operationCount > 10000) {
      this.reportSecurityViolation('excessive-operations', 'high', {
        count: this.operationCount
      });
    }
  }

  reportOperation(type, details) {
    parentPort.postMessage({
      type: 'operation-report',
      pluginName: manifest.name,
      operation: type,
      details,
      timestamp: new Date().toISOString()
    });
  }

  reportSecurityViolation(violation, severity, details) {
    parentPort.postMessage({
      type: 'security-violation',
      pluginName: manifest.name,
      violation,
      severity,
      details,
      timestamp: new Date().toISOString()
    });

    // For critical violations, terminate immediately
    if (severity === 'critical') {
      process.exit(1);
    }
  }
}

// Custom security error
class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SecurityError';
  }
}

// Initialize secure environment
const secureEnv = new SecureEnvironment();

// Plugin execution context
let plugin = null;
let isInitialized = false;

// Message handler for plugin operations
parentPort.on('message', async (message) => {
  try {
    switch (message.type) {
      case 'init':
        await initializePlugin(message.pluginCode);
        break;
        
      case 'execute':
        await executePlugin(message.method, message.args);
        break;
        
      case 'healthCheck':
        await performHealthCheck();
        break;
        
      case 'suspend':
        suspendPlugin();
        break;
        
      case 'resume':
        resumePlugin();
        break;
        
      case 'cleanup':
        await cleanupPlugin();
        break;
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
});

async function initializePlugin(pluginCode) {
  try {
    // Create isolated execution context
    const context = {
      global: global,
      require: global.secureRequire,
      fs: global.secureFs,
      http: global.secureHttp,
      console: global.secureConsole,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      JSON,
      Date,
      Math,
      Error,
      SecurityError
    };

    // Execute plugin code in restricted context
    const pluginFunction = new Function(
      ...Object.keys(context),
      `
        "use strict";
        return (function() {
          ${pluginCode}
        })();
      `
    );

    plugin = pluginFunction(...Object.values(context));
    
    // Initialize plugin if it has an init method
    if (plugin && typeof plugin.initialize === 'function') {
      await plugin.initialize();
    }
    
    isInitialized = true;
    
    parentPort.postMessage({
      type: 'initialized',
      success: true
    });
    
  } catch (error) {
    secureEnv.reportSecurityViolation('plugin-initialization-failed', 'high', {
      error: error.message
    });
    throw error;
  }
}

async function executePlugin(method, args) {
  if (!isInitialized || !plugin) {
    throw new Error('Plugin not initialized');
  }

  if (typeof plugin[method] !== 'function') {
    throw new Error(`Method '${method}' not found in plugin`);
  }

  const startTime = performance.now();
  
  try {
    const result = await plugin[method](...args);
    const duration = performance.now() - startTime;
    
    secureEnv.reportOperation('plugin-execution', {
      method,
      duration,
      success: true
    });
    
    parentPort.postMessage({
      type: 'execution-result',
      success: true,
      result,
      duration
    });
    
  } catch (error) {
    const duration = performance.now() - startTime;
    
    secureEnv.reportOperation('plugin-execution', {
      method,
      duration,
      success: false,
      error: error.message
    });
    
    throw error;
  }
}

async function performHealthCheck() {
  const memUsage = process.memoryUsage();
  const executionTime = Date.now() - secureEnv.startTime;
  
  const health = {
    status: 'healthy',
    score: 100,
    issues: [],
    metrics: {
      memoryUsage: memUsage,
      executionTime,
      operationCount: secureEnv.operationCount,
      networkRequests: secureEnv.networkRequestCount
    },
    lastCheck: new Date()
  };

  // Check for issues
  if (memUsage.heapUsed > secureEnv.memoryLimit * 0.8) {
    health.issues.push({
      severity: 'medium',
      message: 'High memory usage',
      component: 'memory'
    });
    health.score -= 20;
  }

  if (executionTime > secureEnv.executionTimeLimit * 0.8) {
    health.issues.push({
      severity: 'medium',
      message: 'Long execution time',
      component: 'execution'
    });
    health.score -= 15;
  }

  if (secureEnv.operationCount > 5000) {
    health.issues.push({
      severity: 'low',
      message: 'High operation count',
      component: 'performance'
    });
    health.score -= 5;
  }

  if (health.score < 70) {
    health.status = 'degraded';
  }
  if (health.score < 40) {
    health.status = 'unhealthy';
  }

  parentPort.postMessage({
    type: 'health-result',
    health
  });
}

function suspendPlugin() {
  // Implement plugin suspension logic
  parentPort.postMessage({
    type: 'suspended',
    success: true
  });
}

function resumePlugin() {
  // Implement plugin resume logic
  parentPort.postMessage({
    type: 'resumed',
    success: true
  });
}

async function cleanupPlugin() {
  try {
    if (plugin && typeof plugin.cleanup === 'function') {
      await plugin.cleanup();
    }
    
    plugin = null;
    isInitialized = false;
    
    parentPort.postMessage({
      type: 'cleaned-up',
      success: true
    });
    
  } catch (error) {
    secureEnv.reportSecurityViolation('plugin-cleanup-failed', 'medium', {
      error: error.message
    });
    throw error;
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  secureEnv.reportSecurityViolation('uncaught-exception', 'critical', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  secureEnv.reportSecurityViolation('unhandled-rejection', 'high', {
    reason: String(reason),
    promise: promise.toString()
  });
});

// Send ready signal
parentPort.postMessage({
  type: 'worker-ready',
  pluginName: manifest.name,
  workerId: require('worker_threads').threadId
});