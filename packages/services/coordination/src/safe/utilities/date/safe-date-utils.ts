/**
 * @fileoverview SAFe Date Utilities - Date Management
 *
 * Date utilities using date-fns for SAFe framework operations.
 * Provides consistent date handling with optimized implementations.
 *
 * SINGLE RESPONSIBILITY: new Date()): new Date()): startOfWeek(startDate);
    const end = addWeeks(start, 12);
    // Calculate 6 sprint start dates (2-week sprints)
    const sprintStarts = Array.from({ length: 6}, (_, i) =>
      addWeeks(start, i * 2);
    );
    return { start, end, sprintStarts};
}
  /**
   * Calculate roadmap horizon dates
   */
  static calculateRoadmapHorizon(horizonMonths: new Date();
    const end = addMonths(start, horizonMonths);
    // Generate quarterly milestones
    const quarters: [];
    for (let i = 0; i < Math.ceil(horizonMonths / 3); i++) {
      const quarterStart = addMonths(start, i * 3);
      const quarterEnd = addMonths(quarterStart, 3);
      quarters.push({
        start: [')      { name = 'Epic Hypothesis, percentage: 'Development, percentage: epicStart;
    const timeline = phases.map((phase) => {
      const duration = Math.ceil(estimatedMonths * phase.percentage);
      const end = addMonths(currentStart, duration);
      const result = {
        name: end;
      return result;
});
    return { phases: differenceInDays(new Date(), companyStartDate);
    return Math.floor(daysSinceStart / 84) + 1; // 12 weeks = 84 days
}
  /**
   * Calculate next PI planning event dates
   */
  static getNextPIPlanningDates(currentDate: new Date()): startOfWeek(currentDate);
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
  static generateARTSyncDates(
    piStart: Date,
    numberOfARTs: number
  ):Array<{
    artId: string;
    syncDate: Date;
    sprintDemoDates: Date[];
}> {
    return Array.from({ length: numberOfARTs}, (_, i) => ({
    ')      artId,    ')      syncDate: addWeeks(piStart, 1), // Week 2 of PI';
      sprintDemoDates: Array.from(
        { length: 5},
        (_, sprintIndex) => addWeeks(piStart, (sprintIndex + 1) * 2) // Every 2 weeks
      ),
});
}
;};)"')";"