/**
 * Shared Interface Configuration
 *
 * Common configuration values and utilities used across interfaces.
 */

import type { InterfaceConfig } from './types';

/**
 * Default configuration for all interfaces
 */
export const defaultInterfaceConfig: InterfaceConfig = {
  theme: 'dark',
  verbosity: 'normal',
  autoCompletion: true,
  realTimeUpdates: true,
};

/**
 * Common interface constants
 */
export const INTERFACE_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000,
  MAX_COMMAND_HISTORY: 100,
  DEFAULT_PAGE_SIZE: 25,
  MIN_REFRESH_INTERVAL: 1000,
  MAX_REFRESH_INTERVAL: 60000,
} as const;

/**
 * Color scheme definitions for interfaces
 */
export const COLOR_SCHEMES = {
  dark: {
    primary: '#00D9FF',
    secondary: '#FF6B35',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
  },
  light: {
    primary: '#007BFF',
    secondary: '#6C757D',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
  },
} as const;

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  projectName: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
  command: /^[a-zA-Z][a-zA-Z0-9-_:]*$/,
  filePath: /^[a-zA-Z0-9._/-]+$/,
  swarmId: /^[a-zA-Z0-9-]+$/,
} as const;

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  INVALID_PROJECT_NAME:
    'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores',
  INVALID_COMMAND:
    'Command must start with a letter and contain only letters, numbers, hyphens, underscores, and colons',
  INVALID_FILE_PATH: 'File path contains invalid characters',
  INVALID_SWARM_ID: 'Swarm ID must contain only letters, numbers, and hyphens',
  COMMAND_NOT_FOUND: 'Command not found',
  OPERATION_TIMEOUT: 'Operation timed out',
  OPERATION_FAILED: 'Operation failed',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
} as const;

/**
 * Configuration utilities
 */
export class ConfigurationUtils {
  /**
   * Merge configuration with defaults
   */
  static mergeWithDefaults<T extends Partial<InterfaceConfig>>(config: T): T & InterfaceConfig {
    return {
      ...defaultInterfaceConfig,
      ...config,
    } as T & InterfaceConfig;
  }

  /**
   * Validate configuration
   */
  static validateConfig(config: Partial<InterfaceConfig>): string[] {
    const errors: string[] = [];

    if (config.theme && !['dark', 'light', 'auto'].includes(config.theme)) {
      errors.push('Invalid theme. Must be one of: dark, light, auto');
    }

    if (config.verbosity && !['quiet', 'normal', 'verbose', 'debug'].includes(config.verbosity)) {
      errors.push('Invalid verbosity. Must be one of: quiet, normal, verbose, debug');
    }

    return errors;
  }

  /**
   * Get color scheme for theme
   */
  static getColorScheme(theme: 'dark' | 'light' | 'auto'): typeof COLOR_SCHEMES.dark {
    if (theme === 'auto') {
      // In a real implementation, this would detect system theme
      return COLOR_SCHEMES.dark;
    }
    return COLOR_SCHEMES[theme];
  }
}
