/**
 * @fileoverview Logging Configuration for SAFe Framework
 *
 * Provides standardized logging configuration for all SAFe Framework components.
 * Integrates with @claude-zen/foundation logging infrastructure.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// Re-export foundation logger functionality
import type { Logger } from '@claude-zen/foundation';
export { getLogger, type Logger } from '@claude-zen/foundation';

/**
 * SafeLogger is just an alias for the foundation Logger
 */
export type SafeLogger = Logger;
// getLogger is re-exported from foundation above
// No need to reimplement - foundation provides all necessary functionality
/**
 * Default logger configuration for SAFe Framework
 */
export const defaultLoggerConfig = {
  level: 'info' as const,
  format: 'json' as const,
  timestamp: true,
  colorize: false,
  component: 'SAFe',
};
