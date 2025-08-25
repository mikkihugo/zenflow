/**
 * Database package logger using foundation logging system.
 * Integrates with claude-zen foundation for consistent logging.
 */

import {
  getLogger as getFoundationLogger,
  type Logger,
} from '@claude-zen/foundation';

export type { Logger } from '@claude-zen/foundation';

export function getLogger(name: string): Logger {
  return getFoundationLogger(`database:${name}`);`
}
