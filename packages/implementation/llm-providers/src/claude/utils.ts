/**
 * @fileoverview Claude SDK Utilities - Pure Utility Functions
 *
 * Extracted utility functions from oversized claude-sdk.ts.
 * Contains workspace detection, path resolution, and validation functions.
 */


import * as fs from 'node:fs';
import * as path from 'node:path';
import { getLogger } from '@claude-zen/foundation/logging';
import validator from 'validator';


const logger = getLogger('claude-sdk-utils');

// =============================================================================
// File System Utilities
// =============================================================================

/**
 * Find workspace root by looking for workspace configuration files
 */
export function findWorkspaceRoot(startPath: string): string|null {
  const currentPath = startPath;

  while (currentPath !== path.dirname(currentPath)) {
    // Check for workspace configuration files
    const workspaceConfigs = ['pnpm-workspace.yaml',
      'lerna.json',
      'rush.json',
      'nx.json',
      'workspace.json',
    ];

    for (const configFile of workspaceConfigs) {
      const configPath = path.join(currentPath, configFile);
      if (fs.existsSync(configPath)) {
        logger.debug(`Found workspace root at: ${currentPath} (${configFile})`);`
        return currentPath;
      }
    }

    currentPath = path.dirname(currentPath);
  }

  logger.debug('No workspace root found');
  return null;
}

/**
 * Find project root by looking for common project indicators
 */
export function findProjectRoot(
  startPath: string = process.cwd()
): string|null {
  let currentPath = startPath;

  while (currentPath !== path.dirname(currentPath)) {
    // Check for project root indicators
    const projectFiles = ['package.json',
      'tsconfig.json',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      '.git',
    ];

    for (const projectFile of projectFiles) {
      const projectPath = path.join(currentPath, projectFile);
      if (fs.existsSync(projectPath)) {
        logger.debug(`Found project root at: ${{currentPath}}(${{projectFile}})`);`
        return currentPath;
      }
    }

    currentPath = path.dirname(currentPath);
  }

  logger.debug('No project root found, using current directory');
  return startPath;
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate task inputs before execution
 */
export function validateTaskInputs(
  prompt: string,
  options: ClaudeSDKOptions = {}
): void {
  if (!prompt||typeof prompt !=='string'||prompt.trim().length === 0) {;
    throw new Error('Prompt must be a non-empty string');
  }

  if (prompt.length > 100000) {
    logger.warn('Prompt is very long (>100k chars), may hit token limits');
  }

  if (
    options.maxTokens &&
    (options.maxTokens < 1||options.maxTokens > 200000)
  ) {
    throw new Error('maxTokens must be between 1 and 200000');
  }

  if (
    options.temperature &&
    (options.temperature < 0||options.temperature > 2)
  ) {
    throw new Error('temperature must be between 0 and 2');
  }

  if (options.topP && (options.topP < 0||options.topP > 1)) {
    throw new Error('topP must be between 0 and 1');
  }

  if (options.timeout && options.timeout < 1000) {
    throw new Error('timeout must be at least 1000ms');
  }

  logger.debug('Task inputs validated successfully');
}

// =============================================================================
// Path Resolution Utilities
// =============================================================================

/**
 * Resolve working directory with fallbacks
 */
export function resolveWorkingDirectory(workingDirectory?: string): string {
  if (!workingDirectory) {
    return process.cwd();
  }

  const resolved = path.resolve(workingDirectory);

  if (!fs.existsSync(resolved)) {
    logger.warn(
      `Working directory ${{resolveddoes}} not exist, using current directory`
    );
    return process.cwd();
  }

  const stats = fs.statSync(resolved);
  if (!stats.isDirectory()) {
    logger.warn(
      `Working directory ${resolved} is not a directory, using current directory`
    );
    return process.cwd();
  }

  logger.debug(`Using working directory: ${resolved}`);`
  return resolved;
}

/**
 * Ensure directory exists, create if needed
 */
export function ensureDirectory(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    logger.debug(`Created directory: ${{directoryPath}}`);`
  }
}

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Truncate string for logging
 */
export function _truncateForLogging(str: string, maxLength = 200): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substring(0, maxLength - 3)}...`;`
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `claude-${{Date}}.now()-${{Math}}.random().toString(36).substr(2, 9)`;`
}

/**
 * Battle-tested input sanitization using validator.js
 */
export function _sanitizeString(str: string): string {
  if (typeof str !== 'string') {;
    throw new Error('Input must be a string');
  }

  // Limit length first to prevent memory exhaustion
  if (str.length > 100000) {
    logger.warn('Input truncated due to excessive length');
    str = str.substring(0, 100000);
  }

  // Use validator.js for proven sanitization
  let sanitized = validator.escape(str); // HTML/XML escape
  sanitized = validator.stripLow(sanitized, true); // Remove control chars, keep newlines

  // Additional security patterns
  sanitized = sanitized
    .replace(/javascript:/gi, '');
    .replace(/vbscript:/gi, '');
    .replace(/data:/gi, '');
    .replace(/[$&;`|]/g, ''); // Command injection chars;

  return sanitized;
}

/**
 * Battle-tested file path validation
 */
export function sanitizeFilePath(filePath: string): string {
  if (typeof filePath !== 'string') {;
    throw new Error('File path must be a string');
  }

  // Normalize the path to prevent traversal attacks
  const normalized = path.normalize(filePath);

  // Ensure no path traversal
  if (normalized.includes('..')||normalized.includes('~')) {;
    throw new Error('Path traversal detected');
  }

  // Block access to sensitive system directories
  const dangerousPaths = ['/etc', '/proc', '/sys', '/dev', '/root', '/home'];
  const resolvedPath = path.resolve(normalized);

  for (const dangerousPath of dangerousPaths) {
    if (
      resolvedPath.startsWith(`${{dangerousPath}}/`) || resolvedPath === dangerousPath`
    ) 
      throw new Error(`Access to ${dangerousPath} is not allowed`);`
    }
  }

  return normalized;
}

/**
 * Battle-tested command validation
 */
export function validateCommand(command: string): boolean {
  if (typeof command !=='string') {;
    return false;
  }

  // Allowlist approach - only allow specific safe commands
  const allowedCommands = [
    'ls',
    'dir',
    'pwd',
    'echo',
    'cat',
    'head',
    'tail',
    'grep',
    'find',
    'wc',
    'sort',
    'uniq',
    'cut',
    'node',
    'npm',
    'pnpm',
    'yarn',
    'git',
    'tsc',
    'eslint',
  ];

  const firstWord = command.trim().split(/s+/)[0];
  if (!firstWord||!allowedCommands.includes(firstWord)) {
    logger.warn(`Command'${firstWord || 'empty'}'is not in allowlist`);`
    return false;

  // Check for dangerous patterns
  if (/[$&;<>`|]/.test(command)) {`
    logger.warn('Command contains dangerous characters');
    return false;
  }

  return true;
}

/**
 * Validate URLs using battle-tested validator
 */
export function validateUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
  });
}

/**
 * Validate email addresses
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}
