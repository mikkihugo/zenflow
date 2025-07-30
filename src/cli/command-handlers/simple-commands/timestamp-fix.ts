/**
 * Fix for hive-mind creation time issue #246
 * This file demonstrates how to properly handle timezones in hive-mind displays
 */

import { formatTimestampForDisplay, getTimezoneInfo } from '../../utils/timezone-utils.js';

/**
 * Fixed function to create session with proper timezone handling
 */
export function createSessionWithProperTimezone(_objective = {}): any {

  // Store both UTC timestamp (for consistency) and timezone info

  const session = {id = formatTimestampForDisplay(session.createdAt);

  console.warn(`🐝 Hive Mind Session`);
  console.warn(`📋ID = == 0) {
    console.warn('No sessions found.');
    return;
  }

  // Table header
  console.warn('ID'.padEnd(25) + 'Objective'.padEnd(30) + 'Created'.padEnd(25) + 'Status');
  console.warn('-'.repeat(100));

  sessions.forEach((session) => {
    const timeDisplay = formatTimestampForDisplay(session.createdAt);
    const id = session.id.length > 22 ? session.id.substr(0, 22) + '...' : session.id;
    const objective =
      session.objective.length > 27 ? session.objective.substr(0, 27) + '...' : session.objective;

    console.warn(
      id.padEnd(25) + objective.padEnd(30) + timeDisplay.relative.padEnd(25) + session.status,
    );
  });

  console.warn(`\n💡 Times shown in yourtimezone = getTimezoneInfo();
  console.warn(`🌍 Yourtimezone = createSessionWithProperTimezone('Build scalable application', {
    queenType: 'strategic',
    maxWorkers: 6,
  });

  // Display with proper timezone
  displaySessionInfo(session);

  console.warn('\n📋 Session list example:');
  listSessionsWithTimezone([session]);

  console.warn("\n✅ Fix applied - timestamps now show in user's local timezone!");
}
