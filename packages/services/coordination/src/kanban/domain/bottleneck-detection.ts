/**
 * @fileoverview Bottleneck Detection Domain Service
 *
 * Pure domain logic for workflow bottleneck detection and analysis.
 * Identifies capacity constraints, process issues, and flow impediments.
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

const logger = getLogger('BottleneckDetection');

/**
 * Bottleneck detection configuration
 */
export interface BottleneckDetectionConfig {
  /** Utilization threshold for capacity bottlenecks */
  capacityThreshold: number;
  /** Minimum dwelling time to trigger bottleneck alert */
  dwellingTimeThreshold: number;
  /** Flow rate drop percentage threshold */
  flowRateThreshold: number;
  /** Confidence threshold for bottleneck reporting */
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: BottleneckDetectionConfig = {
  capacityThreshold: 0.8,
  dwellingTimeThreshold: 24, // hours
  flowRateThreshold: 0.3, // 30% drop
  confidenceThreshold: 0.7,
};

/**
 * Service for detecting workflow bottlenecks
 */
export class BottleneckDetectionService {
  private config: BottleneckDetectionConfig;
  private detectionHistory: any[] = [];

  constructor(config: Partial<BottleneckDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('BottleneckDetectionService initialized', this.config);
  }

  /**
   * Detect current bottlenecks in the workflow
   */
  async detectBottlenecks(
    allTasks: any[],
    wipLimits: Record<string, number>
  ): Promise<any> {
    const bottlenecks: any[] = [];
    logger.debug('Starting bottleneck detection', {
      totalTasks: allTasks.length,
    });

    const capacityBottlenecks = await this.detectCapacityBottlenecks(
      allTasks,
      wipLimits
    );
    const dwellingBottlenecks = await this.detectDwellingBottlenecks(allTasks);
    const flowRateBottlenecks = await this.detectFlowRateBottlenecks(allTasks);
    const dependencyBottlenecks =
      await this.detectDependencyBottlenecks(allTasks);

    // Combine all detected bottlenecks
    bottlenecks.push(
      ...capacityBottlenecks,
      ...dwellingBottlenecks,
      ...flowRateBottlenecks,
      ...dependencyBottlenecks
    );

    // Filter by confidence threshold and deduplicate
    const filteredBottlenecks =
      this.filterAndPrioritizeBottlenecks(bottlenecks);

    // Store in history for trend analysis
    this.detectionHistory.push(...filteredBottlenecks);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory = this.detectionHistory.slice(-100); // Keep last 100 detections
    }

    const timestamp = new Date();
    const reportId = `bottleneck-${Date.now()}"Fixed unterminated template" `Bottleneck detection complete: ${filteredBottlenecks.length} bottlenecks found"Fixed unterminated template"