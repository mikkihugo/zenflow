/**
 * @fileoverview Telemetry Strategic Facade - Clean Delegation Pattern
 */

export const getTelemetryManager = async () => {
  try {
    const { createTelemetryManager } = await import('@claude-zen/telemetry');
    return createTelemetryManager();
  } catch (error) {
    throw new Error(
      'Telemetry manager not available - @claude-zen/telemetry package required'
    );
  }
};

export const recordMetric = async (name: string, value?: number) => {
  try {
    const { recordMetric } = await import('@claude-zen/telemetry');
    return recordMetric(name, value);
  } catch (error) {
    throw new Error(
      'Telemetry not available - @claude-zen/telemetry package required'
    );
  }
};

// Type exports for external consumers
export type * from './types';
