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
/**
 * SAFe date formatting utilities
 */
export declare class SafeDateUtils {
    /**
     * Format date for SAFe reporting (ISO string)
     */
    static formatISOString(date?: Date): string;
    /**
     * Format date for SAFe milestone display
     */
    static formatMilestone(date: Date): string;
    /**
     * Format PI planning date range
     */
    static formatPIDateRange(startDate: Date, endDate: Date): string;
}
/**
 * SAFe calendar utilities for enterprise planning
 */
export declare class SafeCalendarUtils {
    /**
     * Get current PI number based on company start date
     */
    static getCurrentPINumber(companyStartDate: Date): number;
    /**
     * Calculate next PI planning event dates
     */
    static getNextPIPlanningDates(currentDate?: Date): {
        planningStart: Date;
        planningEnd: Date;
        piExecutionStart: Date;
    };
    /**
     * Generate ART synchronization dates
     */
    static generateARTSyncDates(piStart: Date, numberOfARTs: number): Array<{
        artId: string;
        syncDate: Date;
        sprintDemoDates: Date[];
    }>;
}
//# sourceMappingURL=safe-date-utils.d.ts.map