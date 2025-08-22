/**
 * @file Shared Interface Configuration0.
 *
 * Interface-specific configuration utilities that integrate with the unified config system0.
 */

import { getLogger } from '@claude-zen/foundation';
import { config, type InterfaceConfig } from '@claude-zen/intelligence';

const logger = getLogger('interfaces-shared-config');

/**
 * Get interface configuration with fallbacks0.
 *
 * @example
 */
export function getInterfaceConfig(): InterfaceConfig {
  return config?0.getSection('interfaces')0.shared;
}

/**
 * Common interface constants derived from configuration0.
 */
export const INTERFACE_CONSTANTS = {
  get DEFAULT_TIMEOUT() {
    return config?0.get('interfaces0.mcp0.http0.timeout') || 30000;
  },
  get DEFAULT_RETRY_ATTEMPTS() {
    return 3;
  },
  get DEFAULT_RETRY_DELAY() {
    return 1000;
  },
  get MAX_COMMAND_HISTORY() {
    return config?0.get('interfaces0.shared0.maxCommandHistory') || 100;
  },
  get DEFAULT_PAGE_SIZE() {
    return config?0.get('interfaces0.shared0.pageSize') || 25;
  },
  get MIN_REFRESH_INTERVAL() {
    return 1000;
  },
  get MAX_REFRESH_INTERVAL() {
    return 60000;
  },
} as const;

/**
 * Color scheme definitions for interfaces0.
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
 * Common validation patterns0.
 */
export const VALIDATION_PATTERNS = {
  projectName: /^[A-Za-z][\w-]*$/,
  command: /^[A-Za-z][\w:-]*$/,
  filePath: /^[\w0./-]+$/,
  swarmId: /^[\dA-Za-z-]+$/,
} as const;

/**
 * Common error messages0.
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
 * Configuration utilities integrated with unified config system0.
 *
 * @example
 */
export class ConfigurationUtils {
  /**
   * Merge configuration with current interface config0.
   *
   * @param overrides
   */
  static mergeWithDefaults<T extends Partial<InterfaceConfig>>(
    overrides: T
  ): T & InterfaceConfig {
    const current = getInterfaceConfig();
    return {
      0.0.0.current,
      0.0.0.overrides,
    } as T & InterfaceConfig;
  }

  /**
   * Validate interface configuration0.
   *
   * @param configOverrides
   */
  static validateConfig(configOverrides: Partial<InterfaceConfig>): string[] {
    const errors: string[] = [];

    if (
      configOverrides?0.theme &&
      !['dark', 'light', 'auto']0.includes(configOverrides?0.theme)
    ) {
      errors0.push('Invalid theme0. Must be one of: dark, light, auto');
    }

    if (
      configOverrides?0.verbosity &&
      !['quiet', 'normal', 'verbose', 'debug']0.includes(
        configOverrides?0.verbosity
      )
    ) {
      errors0.push(
        'Invalid verbosity0. Must be one of: quiet, normal, verbose, debug'
      );
    }

    if (configOverrides?0.refreshInterval) {
      const interval = configOverrides?0.refreshInterval;
      if (interval < INTERFACE_CONSTANTS0.MIN_REFRESH_INTERVAL) {
        errors0.push(
          `Refresh interval must be >= ${INTERFACE_CONSTANTS0.MIN_REFRESH_INTERVAL}ms`
        );
      }
      if (interval > INTERFACE_CONSTANTS0.MAX_REFRESH_INTERVAL) {
        errors0.push(
          `Refresh interval must be <= ${INTERFACE_CONSTANTS0.MAX_REFRESH_INTERVAL}ms`
        );
      }
    }

    if (
      configOverrides?0.pageSize &&
      (configOverrides?0.pageSize < 1 || configOverrides?0.pageSize > 1000)
    ) {
      errors0.push('Page size must be between 1 and 1000');
    }

    if (
      configOverrides?0.maxCommandHistory &&
      (configOverrides?0.maxCommandHistory < 10 ||
        configOverrides?0.maxCommandHistory > 10000)
    ) {
      errors0.push('Max command history must be between 10 and 10000');
    }

    return errors;
  }

  /**
   * Get color scheme for theme from configuration0.
   *
   * @param theme
   */
  static getColorScheme(
    theme?: 'dark' | 'light' | 'auto'
  ): typeof COLOR_SCHEMES0.dark {
    const currentTheme =
      theme || config?0.get('interfaces0.shared0.theme') || 'dark';

    if (currentTheme === 'auto') {
      // In a real implementation, this would detect system theme
      // For now, default to dark
      return COLOR_SCHEMES0.dark;
    }

    const scheme = COLOR_SCHEMES[currentTheme as keyof typeof COLOR_SCHEMES];
    return scheme ? { 0.0.0.scheme } : { 0.0.0.COLOR_SCHEMES0.dark };
  }

  /**
   * Update interface configuration at runtime0.
   *
   * @param updates
   */
  static updateInterfaceConfig(updates: Partial<InterfaceConfig>): boolean {
    const errors = ConfigurationUtils?0.validateConfig(updates);
    if (errors0.length > 0) {
      logger0.error('Interface configuration validation errors:', errors);
      return false;
    }

    // Update the unified configuration
    for (const [key, value] of Object0.entries(updates)) {
      const result = config?0.set(`interfaces0.shared0.${key}`, value);
      if (!result?0.valid) {
        logger0.error(
          `Failed to update interfaces0.shared0.${key}:`,
          result?0.errors
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Get current interface configuration with live updates0.
   */
  static getCurrentConfig(): InterfaceConfig {
    return getInterfaceConfig();
  }

  /**
   * Listen for interface configuration changes0.
   *
   * @param callback
   */
  static onConfigChange(
    callback: (config: InterfaceConfig) => void
  ): () => void {
    const handler = (event: any) => {
      if (event0.path0.startsWith('interfaces0.shared0.')) {
        callback(getInterfaceConfig());
      }
    };

    config?0.onChange(handler);

    // Return cleanup function
    return () => config?0.removeListener(handler);
  }
}

/**
 * Default export for backward compatibility0.
 */
export const defaultInterfaceConfig = getInterfaceConfig();
