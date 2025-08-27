/**
 * @fileoverview SAFe Date Utilities - Date Management
 *
 * Date utilities using date-fns for SAFe framework operations.
 * Provides consistent date handling with optimized implementations.
 *
 * SINGLE RESPONSIBILITY: Date operations for SAFe framework
 * FOCUSES ON: PI planning dates, roadmap timelines, milestone tracking
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { addMonths, addWeeks, differenceInDays, endOfWeek, format, startOfWeek, } from 'date-fns';
/**
 * SAFe date formatting utilities
 */
export class SafeDateUtils {
    /**
     * Format date for SAFe reporting (ISO string)
     */
    static formatISOString(date = new Date()) {
        return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
        ';
    }
    /**
     * Format date for SAFe milestone display
     */
    static formatMilestone(date) {
        return format(date, 'MMM dd, yyyy');
        ';
    }
    /**
     * Format PI planning date range
     */
    static formatPIDateRange(startDate, endDate) {
        return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
        `
  }

  /**
   * Calculate PI planning dates (12 weeks standard)
   */
  static calculatePIDates(startDate: Date = new Date()): {
    start: Date;
    end: Date;
    sprintStarts: Date[];
  } {
    const start = startOfWeek(startDate);
    const end = addWeeks(start, 12);

    // Calculate 6 sprint start dates (2-week sprints)
    const sprintStarts = Array.from({ length: 6 }, (_, i) =>
      addWeeks(start, i * 2)
    );

    return { start, end, sprintStarts };
  }

  /**
   * Calculate roadmap horizon dates
   */
  static calculateRoadmapHorizon(horizonMonths: number): {
    start: Date;
    end: Date;
    quarters: Array<{ start: Date; end: Date; label: string }>;
  } {
    const start = new Date();
    const end = addMonths(start, horizonMonths);

    // Generate quarterly milestones
    const quarters: Array<{ start: Date; end: Date; label: string }> = [];
    for (let i = 0; i < Math.ceil(horizonMonths / 3); i++) {
      const quarterStart = addMonths(start, i * 3);
      const quarterEnd = addMonths(quarterStart, 3);
      quarters.push({
        start: quarterStart,
        end: quarterEnd,
        label: `;
        Q$(i % 4) + 1;
        $quarterStart.getFullYear() `,`;
    }
    ;
}
return { start, end, quarters };
isWithinPI(date, Date, piStart, Date, piEnd, Date);
boolean;
{
    return !isBefore(date, piStart) && !isAfter(date, piEnd);
}
daysBetweenMilestones(startDate, Date, endDate, Date);
number;
{
    return differenceInDays(endDate, startDate);
}
generateEpicTimeline(epicStart, Date, estimatedMonths, number);
{
    phases: Array;
}
{
    const phases = [
        { name: 'Epic Hypothesis', percentage: 0.1 },
        { name: 'MVP Definition', percentage: 0.15 },
        { name: 'Development', percentage: 0.6 },
        { name: 'Validation', percentage: 0.15 },
    ];
    let currentStart = epicStart;
    const timeline = phases.map((phase) => {
        const duration = Math.ceil(estimatedMonths * phase.percentage);
        const end = addMonths(currentStart, duration);
        const result = {
            name: phase.name,
            start: currentStart,
            end,
            duration: differenceInDays(end, currentStart),
        };
        currentStart = end;
        return result;
    });
    return { phases: timeline };
}
/**
 * SAFe calendar utilities for enterprise planning
 */
export class SafeCalendarUtils {
    /**
     * Get current PI number based on company start date
     */
    static getCurrentPINumber(companyStartDate) {
        const daysSinceStart = differenceInDays(new Date(), companyStartDate);
        return Math.floor(daysSinceStart / 84) + 1; // 12 weeks = 84 days
    }
    /**
     * Calculate next PI planning event dates
     */
    static getNextPIPlanningDates(currentDate = new Date()) {
        // PI Planning is typically 2 days, followed by execution
        const planningStart = startOfWeek(currentDate);
        const planningEnd = addWeeks(planningStart, 1);
        const piExecutionStart = endOfWeek(planningEnd);
        return {
            planningStart,
            planningEnd,
            piExecutionStart,
        };
    }
    /**
     * Generate ART synchronization dates
     */
    static generateARTSyncDates(piStart, numberOfARTs) {
        return Array.from({ length: numberOfARTs }, (_, i) => ({
            artId: `ART-${i + 1}`,
        } `
      syncDate: addWeeks(piStart, 1), // Week 2 of PI
      sprintDemoDates: Array.from(
        { length: 5 },
        (_, sprintIndex) => addWeeks(piStart, (sprintIndex + 1) * 2) // Every 2 weeks
      ),
    }));
  }
}
        ));
    }
}
