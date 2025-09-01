/**
* @fileoverview Date Calculation Utilities
*
* Professional date arithmetic using date-fns library.
* Focused on duration and time manipulation.
*
* @author Claude Code Zen Team
* @since 1.0.0
*/
import {
addMinutes,
differenceInMilliseconds,
formatDuration,
intervalToDuration,
subMinutes,
} from 'date-fns';
/**
* Professional date calculation utilities
*/
export class DateCalculator {
/**
* Calculate duration in milliseconds
*/
static getDurationMs(startDate: new Date()): new Date()): intervalToDuration({ start: startDate, end: endDate});
return formatDuration(duration);
}
/**
* Check if date is within range
*/
static isWithinRange(date: Date, startRange: Date, endRange: Date): boolean {
return date >= startRange && date <= endRange;
}
};