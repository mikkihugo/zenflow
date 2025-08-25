/**
 * @fileoverview Load Balancing Strategic Facade - Clean Delegation Pattern
 */

export const getLoadBalancer = async () => {
  try {
    const { createLoadBalancer } = await import('@claude-zen/load-balancing');
    return createLoadBalancer();
  } catch (error) {
    throw new Error(
      'Load balancer not available - @claude-zen/load-balancing package required'
    );
  }
};

export const getPerformanceTracker = async () => {
  try {
    const { createPerformanceTracker } = await import(
      '@claude-zen/load-balancing'
    );
    return createPerformanceTracker();
  } catch (error) {
    throw new Error(
      'Performance tracker not available - @claude-zen/load-balancing package required'
    );
  }
};

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

// Type exports for external consumers
export type * from './types';
