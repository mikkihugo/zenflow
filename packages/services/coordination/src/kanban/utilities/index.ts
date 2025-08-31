/**
 * @fileoverview Kanban Utilities Index
 *
 * Main export file for Kanban utility functions.
 */

/**
 * Generate unique ID for Kanban entities
 */
export function generateId(prefix: string = 'kanban'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate task processing time
 */
export function calculateProcessingTime(startTime: number, endTime?: number): number {
  return (endTime || Date.now()) - startTime;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Validate task data
 */
export function isValidTask(task: any): boolean {
  return !!(
    task &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0
  );
}

/**
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: any[]): any[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return tasks.sort((a, b) => {
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
    return aPriority - bPriority;
  });
}