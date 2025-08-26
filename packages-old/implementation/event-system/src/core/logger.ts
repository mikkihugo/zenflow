/**
 * @file Event System Logger
 * 
 * Simple logger implementation for the event system.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';

/**
 * Get logger for event system components.
 */
export function getEventLogger(component: string): Logger {
  return getLogger(`EventSystem:${component}`);
}

/**
 * Default event system logger.
 */
export const eventLogger = getLogger('EventSystem');

export default eventLogger;