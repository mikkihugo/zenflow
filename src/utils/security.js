/**
 * Security utilities for input validation and sanitization
 * Provides secure input handling for process operations and user inputs
 */

/**
 * Validates and sanitizes process ID input
 * @param {string|number} pid - Process ID to validate
 * @returns {number|null} - Validated PID or null if invalid
 */
export function validatePID(pid) {
  // Convert to string for validation
  const pidStr = String(pid).trim();
  
  // Check if it's a valid positive integer
  if (!/^\d+$/.test(pidStr)) {
    return null;
  }
  
  const pidNum = parseInt(pidStr, 10);
  
  // Validate PID range (typical systems use 1-65535, but allow up to 4194304 for modern systems)
  if (pidNum <= 0 || pidNum > 4194304) {
    return null;
  }
  
  return pidNum;
}

/**
 * Validates command arguments for process execution
 * @param {string[]} args - Array of command arguments
 * @returns {string[]|null} - Validated arguments or null if invalid
 */
export function validateCommandArgs(args) {
  if (!Array.isArray(args)) {
    return null;
  }
  
  const validatedArgs = [];
  
  for (const arg of args) {
    const argStr = String(arg).trim();
    
    // Reject dangerous characters and patterns
    if (containsDangerousPatterns(argStr)) {
      return null;
    }
    
    validatedArgs.push(argStr);
  }
  
  return validatedArgs;
}

/**
 * Checks for dangerous patterns in command arguments
 * @param {string} input - Input string to check
 * @returns {boolean} - True if dangerous patterns found
 */
function containsDangerousPatterns(input) {
  const dangerousPatterns = [
    /[;&|`$(){}[\]]/,  // Shell metacharacters
    /\.\.\//,          // Directory traversal
    /\\/,              // Backslashes (Windows path injection)
    /\s*(rm|del|format|mkfs|dd)\s/i,  // Dangerous commands
    /\s*(sudo|su|chmod|chown)\s/i,    // Privilege escalation
    /[<>]/             // Redirection operators
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes file path input
 * @param {string} filePath - File path to sanitize
 * @returns {string|null} - Sanitized path or null if invalid
 */
export function sanitizeFilePath(filePath) {
  if (typeof filePath !== 'string') {
    return null;
  }
  
  const path = filePath.trim();
  
  // Reject paths with directory traversal or null bytes
  if (path.includes('../') || path.includes('..\\') || path.includes('\0')) {
    return null;
  }
  
  // Reject absolute paths to system directories
  const dangerousStartPaths = ['/etc/', '/bin/', '/sbin/', '/usr/bin/', '/usr/sbin/', 'C:\\Windows\\', 'C:\\System32\\'];
  if (dangerousStartPaths.some(dangerous => path.startsWith(dangerous))) {
    return null;
  }
  
  return path;
}

/**
 * Creates safe regex patterns with bounded execution
 * @param {string} pattern - Regex pattern string
 * @param {string} flags - Regex flags
 * @returns {RegExp} - Safe regex with global flag removed to prevent infinite loops
 */
export function createSafeRegex(pattern, flags = '') {
  // Remove global flag to prevent infinite loops in while loops
  const safeFlags = flags.replace(/g/g, '');
  return new RegExp(pattern, safeFlags);
}

/**
 * Safe regex execution with iteration limit
 * @param {RegExp} regex - Regex to execute (should not have global flag)
 * @param {string} content - Content to search
 * @param {number} maxIterations - Maximum iterations to prevent ReDoS
 * @returns {Array} - Array of matches
 */
export function safeRegexExec(regex, content, maxIterations = 1000) {
  const matches = [];
  const globalRegex = new RegExp(regex.source, regex.flags + 'g');
  let iterations = 0;
  let match;
  
  while ((match = globalRegex.exec(content)) !== null && iterations < maxIterations) {
    matches.push(match);
    iterations++;
    
    // Prevent infinite loops on zero-length matches
    if (match.index === globalRegex.lastIndex) {
      globalRegex.lastIndex++;
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn(`Regex execution stopped at ${maxIterations} iterations to prevent ReDoS`);
  }
  
  return matches;
}

/**
 * Validates URL input for link checking
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is safe to process
 */
export function validateURL(url) {
  if (typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Reject localhost/private IP addresses for external URLs
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limiter to prevent abuse
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }
}