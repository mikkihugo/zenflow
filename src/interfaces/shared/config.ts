/**
 * @file Shared Interface Configuration.
 *
 * Interface-specific configuration utilities that integrate with the unified config system.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-shared-config');

import { config, type InterfaceConfig } from '../config';

/**
 * Get interface configuration with fallbacks.
 *
 * @example
 */
export function getInterfaceConfig(): InterfaceConfig {
  return config?.getSection('interfaces').shared;
}

/**
 * Common interface constants derived from configuration.
 */
export const INTERFACE_CONSTANTS = {
  get DEFAULT_TIMEOUT() {
    return config?.get('interfaces.mcp.http.timeout') || 30000;
  },
  get DEFAULT_RETRY_ATTEMPTS() {
    return 3;
  },
  get DEFAULT_RETRY_DELAY() {
    return 1000;
  },
  get MAX_COMMAND_HISTORY() {
    return config?.get('interfaces.shared.maxCommandHistory') || 100;
  },
  get DEFAULT_PAGE_SIZE() {
    return config?.get('interfaces.shared.pageSize') || 25;
  },
  get MIN_REFRESH_INTERVAL() {
    return 1000;
  },
  get MAX_REFRESH_INTERVAL() {
    return 60000;
  },
} as const;

/**
 * Color scheme definitions for interfaces.
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
 * Common validation patterns.
 */
export const VALIDATION_PATTERNS = {
  projectName: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
  command: /^[a-zA-Z][a-zA-Z0-9-_:]*$/,
  filePath: /^[a-zA-Z0-9._/-]+$/,
  swarmId: /^[a-zA-Z0-9-]+$/,
} as const;

/**
 * Common error messages.
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
 * Configuration utilities integrated with unified config system.
 *
 * @example
 */
export class ConfigurationUtils {
  /**
   * Merge configuration with current interface config.
   *
   * @param overrides
   */
  static mergeWithDefaults<T extends Partial<InterfaceConfig>>(overrides: T): T & InterfaceConfig {
    const current = getInterfaceConfig();
    return {
      ...current,
      ...overrides,
    } as T & InterfaceConfig;
  }

  /**
   * Validate interface configuration.
   *
   * @param configOverrides
   */
  static validateConfig(configOverrides: Partial<InterfaceConfig>): string[] {
    const errors: string[] = [];

    if (configOverrides?.theme && !['dark', 'light', 'auto'].includes(configOverrides?.theme)) {
      errors.push('Invalid theme. Must be one of: dark, light, auto');
    }

    if (
      configOverrides?.verbosity &&
      !['quiet', 'normal', 'verbose', 'debug'].includes(configOverrides?.verbosity)
    ) {
      errors.push('Invalid verbosity. Must be one of: quiet, normal, verbose, debug');
    }

    if (configOverrides?.refreshInterval) {
      const interval = configOverrides?.refreshInterval;
      if (interval < INTERFACE_CONSTANTS.MIN_REFRESH_INTERVAL) {
        errors.push(`Refresh interval must be >= ${INTERFACE_CONSTANTS.MIN_REFRESH_INTERVAL}ms`);
      }
      if (interval > INTERFACE_CONSTANTS.MAX_REFRESH_INTERVAL) {
        errors.push(`Refresh interval must be <= ${INTERFACE_CONSTANTS.MAX_REFRESH_INTERVAL}ms`);
      }
    }

    if (
      configOverrides?.pageSize &&
      (configOverrides?.pageSize < 1 || configOverrides?.pageSize > 1000)
    ) {
      errors.push('Page size must be between 1 and 1000');
    }

    if (
      configOverrides?.maxCommandHistory &&
      (configOverrides?.maxCommandHistory < 10 || configOverrides?.maxCommandHistory > 10000)
    ) {
      errors.push('Max command history must be between 10 and 10000');
    }

    return errors;
  }

  /**
   * Get color scheme for theme from configuration.
   *
   * @param theme
   */
  static getColorScheme(theme?: 'dark' | 'light' | 'auto'): typeof COLOR_SCHEMES.dark {
    const currentTheme = theme || config?.get('interfaces.shared.theme') || 'dark';

    if (currentTheme === 'auto') {
      // In a real implementation, this would detect system theme
      // For now, default to dark
      return COLOR_SCHEMES.dark;
    }

    const scheme = COLOR_SCHEMES[currentTheme as keyof typeof COLOR_SCHEMES];
    return scheme ? { ...scheme } : { ...COLOR_SCHEMES.dark };
  }

  /**
   * Update interface configuration at runtime.
   *
   * @param updates
   */
  static updateInterfaceConfig(updates: Partial<InterfaceConfig>): boolean {
    const errors = ConfigurationUtils?.validateConfig(updates);
    if (errors.length > 0) {
      logger.error('Interface configuration validation errors:', errors);
      return false;
    }

    // Update the unified configuration
    for (const [key, value] of Object.entries(updates)) {
      const result = config?.set(`interfaces.shared.${key}`, value);
      if (!result?.valid) {
        logger.error(`Failed to update interfaces.shared.${key}:`, result?.errors);
        return false;
      }
    }

    return true;
  }

  /**
   * Get current interface configuration with live updates.
   */
  static getCurrentConfig(): InterfaceConfig {
    return getInterfaceConfig();
  }

  /**
   * Listen for interface configuration changes.
   *
   * @param callback
   */
  static onConfigChange(callback: (config: InterfaceConfig) => void): () => void {
    const handler = (event: any) => {
      if (event.path.startsWith('interfaces.shared.')) {
        callback(getInterfaceConfig());
      }
    };

    config?.onChange(handler);

    // Return cleanup function
    return () => config?.removeListener(handler);
  }
}

/**
 * Default export for backward compatibility.
 */
export const defaultInterfaceConfig = getInterfaceConfig();
