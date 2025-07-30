/**
 * Security utilities for input validation and sanitization
 * Provides secure input handling for process operations and user inputs
 */

/**
 * Validates and sanitizes process ID input
 * @param pid - Process ID to validate
 * @returns Validated PID or null if invalid
 */
export function validatePID(pid: string | number): number | null {
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
 * @param args - Array of command arguments
 * @returns Validated arguments or null if invalid
 */
export function validateCommandArgs(args: unknown): string[] | null {
  if (!Array.isArray(args)) {
    return null;
  }
  
  const validatedArgs: string[] = [];
  
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
 * @param input - Input string to check
 * @returns True if dangerous patterns found
 */
function containsDangerousPatterns(input: string): boolean {
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
 * @param filePath - File path to sanitize
 * @returns Sanitized path or null if invalid
 */
export function sanitizeFilePath(filePath: unknown): string | null {
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
 * @param pattern - Regex pattern string
 * @param flags - Regex flags
 * @returns Safe regex with global flag removed to prevent infinite loops
 */
export function createSafeRegex(pattern: string, flags: string = ''): RegExp {
  // Remove global flag to prevent infinite loops in while loops
  const safeFlags = flags.replace(/g/g, '');
  return new RegExp(pattern, safeFlags);
}

/**
 * Safe regex execution with iteration limit
 * @param regex - Regex to execute (should not have global flag)
 * @param content - Content to search
 * @param maxIterations - Maximum iterations to prevent ReDoS
 * @returns Array of matches
 */
export function safeRegexExec(regex: RegExp, content: string, maxIterations: number = 1000): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  // Ensure global flag is set correctly (avoid duplicate 'g')
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  const globalRegex = new RegExp(regex.source, flags);
  let iterations = 0;
  let match: RegExpExecArray | null;
  
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
 * @param url - URL to validate
 * @returns True if URL is safe to process
 */
export function validateURL(url: unknown): boolean {
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
 * Rate limiter configuration interface
 */
export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limiter to prevent abuse
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly requests: Map<string, number[]>;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  /**
   * Check if a request is allowed for the given identifier
   * @param identifier - Unique identifier for the requester
   * @returns True if the request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }

  /**
   * Get the current request count for an identifier
   * @param identifier - Unique identifier for the requester
   * @returns Current request count within the window
   */
  getCurrentCount(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return 0;
    }
    
    const userRequests = this.requests.get(identifier)!;
    return userRequests.filter(time => time > windowStart).length;
  }

  /**
   * Get time until the next request is allowed
   * @param identifier - Unique identifier for the requester
   * @returns Milliseconds until next request is allowed, or 0 if allowed now
   */
  getTimeUntilReset(identifier: string): number {
    if (!this.requests.has(identifier)) {
      return 0;
    }
    
    const userRequests = this.requests.get(identifier)!;
    if (userRequests.length < this.maxRequests) {
      return 0;
    }
    
    const oldestRequest = Math.min(...userRequests);
    const resetTime = oldestRequest + this.windowMs;
    const now = Date.now();
    
    return Math.max(0, resetTime - now);
  }

  /**
   * Clear all rate limit data for an identifier
   * @param identifier - Unique identifier for the requester
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data
   */
  resetAll(): void {
    this.requests.clear();
  }
}