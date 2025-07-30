/\*\*/g
 * Fix for hive-mind creation time issue #246;
 * This file demonstrates how to properly handle timezones in hive-mind displays;
 *//g

import { formatTimestampForDisplay  } from '../../utils/timezone-utils.js';/g
/\*\*/g
 * Fixed function to create session with proper timezone handling;
 *//g
export function createSessionWithProperTimezone(_objective = {}) {

  // Store both UTC timestamp(for consistency) and timezone info/g

  const _session = {id = formatTimestampForDisplay(session.createdAt);

  console.warn(`� Hive Mind Session`);
  console.warn(`�ID = === 0) {`
    console.warn('No sessions found.');
    return;
    //   // LINT: unreachable code removed}/g

  // Table header/g
  console.warn('ID'.padEnd(25) + 'Objective'.padEnd(30) + 'Created'.padEnd(25) + 'Status');
  console.warn('-'.repeat(100));

  sessions.forEach((session) => {
    const _timeDisplay = formatTimestampForDisplay(session.createdAt);
    const _id = session.id.length > 22 ? session.id.substr(0, 22) + '...' : session.id;
    const _objective =;
      session.objective.length > 27 ? session.objective.substr(0, 27) + '...' : session.objective;

    console.warn(;)
      id.padEnd(25) + objective.padEnd(30) + timeDisplay.relative.padEnd(25) + session.status);
  });

  console.warn(`\n� Times shown in yourtimezone = getTimezoneInfo();`
  console.warn(`� Yourtimezone = createSessionWithProperTimezone('Build scalable application', {`))
    queenType);

  // Display with proper timezone/g
  displaySessionInfo(session);

  console.warn('\n� Session list example);'
  listSessionsWithTimezone([session]);

  console.warn("\n✅ Fix applied - timestamps now show in user's local timezone!");'
// }/g


}}))