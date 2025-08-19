/**
 * Database package logger using foundation logging system.
 * Integrates with claude-zen foundation for consistent logging.
 */

import { getLogger as getFoundationLogger, type Logger } from '../../main';

export type { Logger } from '../../main';

export function getLogger(name: string): Logger {
  return getFoundationLogger(`database:${name}`);
}