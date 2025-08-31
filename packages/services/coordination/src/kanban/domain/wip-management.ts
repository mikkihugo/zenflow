/**
 * @fileoverview WIP Management Domain Service
 *
 * Pure domain logic for Work-in-Progress (WIP) limit management.
 * Enforces WIP limits, tracks violations, and provides optimization suggestions.
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

const logger = getLogger('WIPManagement');

/**
 * WIP limit configuration for each state
 */
export interface WIPLimits {
  [state: string]: number;
}

/**
 * WIP management configuration
 */
export interface WIPManagementConfig {
  initialLimits: WIPLimits;
  enableAutoAdjustment: boolean;
  violationThreshold: number; // percentage over limit to trigger warning
  enableAlerts: boolean;
}

/**
 * WIP violation information
 */
export interface WIPViolation {
  state: string;
  currentCount: number;
  limit: number;
  overageCount: number;
  overagePercentage: number;
  severity: 'warning' | 'critical';
  detectedAt: Date;
}

/**
 * WIP status for all states
 */
export interface WIPStatus {
  timestamp: Date;
  overallUtilization: number;
  violations: WIPViolation[];
  stateStatus: {
    [state: string]: {
      current: number;
      limit: number;
      utilization: number;
      status: 'healthy' | 'warning' | 'critical';
    };
  };
  recommendations: string[];
}

const DEFAULT_CONFIG: WIPManagementConfig = {
  initialLimits: {
    todo: 10,
    'in-progress': 5,
    review: 3,
    done: Infinity,
  },
  enableAutoAdjustment: false,
  violationThreshold: 0.1, // 10% over limit
  enableAlerts: true,
};

/**
 * Service for managing WIP limits and violations
 */
export class WIPManagementService {
  private config: WIPManagementConfig;
  private wipLimits: WIPLimits;
  private violationHistory: WIPViolation[] = [];

  constructor(config: Partial<WIPManagementConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.wipLimits = { ...this.config.initialLimits };
    logger.info('WIPManagementService initialized', this.config);
  }

  /**
   * Check WIP status across all states
   */
  async checkWIPStatus(allTasks: any[]): Promise<WIPStatus> {
    const timestamp = new Date();
    const violations: WIPViolation[] = [];
    const stateStatus: WIPStatus['stateStatus'] = {};

    // Group tasks by state
    const tasksByState = this.groupTasksByState(allTasks);

    // Check each state against its WIP limit
    for (const [state, limit] of Object.entries(this.wipLimits)) {
      const currentCount = tasksByState[state]?.length || 0;
      const utilization = limit === Infinity ? 0 : currentCount / limit;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check for violations
      if (currentCount > limit && limit !== Infinity) {
        const overageCount = currentCount - limit;
        const overagePercentage = overageCount / limit;
        const severity =
          overagePercentage > this.config.violationThreshold
            ? 'critical'
            : 'warning';

        status = severity;

        const violation: WIPViolation = {
          state,
          currentCount,
          limit,
          overageCount,
          overagePercentage,
          severity,
          detectedAt: timestamp,
        };

        violations.push(violation);
        this.violationHistory.push(violation);

        if (this.config.enableAlerts) {
          logger.warn(`WIP violation detected in ${state}"Fixed unterminated template" `Consider increasing WIP limits for high-utilization states: ${highUtilizationStates.join(', ')}"Fixed unterminated template"