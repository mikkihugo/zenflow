/**
 * @fileoverview Batch Processor
 *
 * Batches telemetry data to optimize export performance.
 * Collects data over time or until batch size is reached.
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { Logger } from '@claude-zen/foundation';

import type { BaseProcessor } from './index.js';
import type { TelemetryData, ProcessorConfig } from '../types.js';

/**
 * Batch processor implementation
 */
export class BatchProcessor implements BaseProcessor {
  private config: ProcessorConfig;
  private logger: Logger;
  private batch: TelemetryData[] = [];
  private batchTimer: NodeJS.Timeout|null = null;
  private processedCount = 0;
  private lastProcessedTime = 0;
  private lastError: string|null = null;
  private isShuttingDown = false;

  // Configuration
  private readonly maxBatchSize: number;
  private readonly batchTimeout: number;
  private readonly flushOnShutdown: boolean;

  constructor(config: ProcessorConfig) {
    this.config = config;
    this.logger = getLogger(`BatchProcessor:${config.name}`);

    // Extract configuration
    this.maxBatchSize = config.config?.maxBatchSize||100;
    this.batchTimeout = config.config?.batchTimeout||5000; // 5 seconds
    this.flushOnShutdown = config.config?.flushOnShutdown !== false;
  }

  async initialize(): Promise<void> {
    // Start batch timer
    this.startBatchTimer();

    this.logger.info('Batch processor initialized', {
      maxBatchSize: this.maxBatchSize,
      batchTimeout: this.batchTimeout,
      flushOnShutdown: this.flushOnShutdown,
    });
  }

  async process(data: TelemetryData): Promise<TelemetryData|null> {
    if (this.isShuttingDown) {
      return data;
    }

    try {
      // Add to batch
      this.batch.push(data);

      // Check if batch is full
      if (this.batch.length >= this.maxBatchSize) {
        await this.flushBatch();
      }

      this.processedCount++;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      // Return null to indicate data is held in batch
      return null;
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Batch processing failed', error);

      // Return original data on error
      return data;
    }
  }

  async processBatch(dataItems: TelemetryData[]): Promise<TelemetryData[]> {
    if (this.isShuttingDown) {
      return dataItems;
    }

    try {
      // Add all items to batch
      this.batch.push(...dataItems);

      // Check if we need to flush
      if (this.batch.length >= this.maxBatchSize) {
        await this.flushBatch();
      }

      this.processedCount += dataItems.length;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      // Return empty array since data is held in batch
      return [];
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Batch processing failed', error);

      // Return original data on error
      return dataItems;
    }
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Stop batch timer
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Flush remaining batch if configured to do so
    if (this.flushOnShutdown && this.batch.length > 0) {
      this.logger.info(
        `Flushing ${this.batch.length} remaining items before shutdown`
      );
      await this.flushBatch();
    }

    this.logger.info('Batch processor shut down', {
      totalProcessed: this.processedCount,
      remainingInBatch: this.batch.length,
    });
  }

  async getHealthStatus(): Promise<{
    status: 'healthy|degraded|unhealthy';
    lastProcessed?: number;
    lastError?: string;
  }> {
    const batchUtilization = this.batch.length / this.maxBatchSize;

    let status: 'healthy|degraded|unhealthy' = 'healthy';

    if (this.lastError) {
      status = 'unhealthy';
    } else if (batchUtilization > 0.9) {
      // Batch is getting very full
      status = 'degraded';
    }

    return {
      status,
      lastProcessed: this.lastProcessedTime||undefined,
      lastError: this.lastError||undefined,
    };
  }

  /**
   * Get current batch size
   */
  getBatchSize(): number {
    return this.batch.length;
  }

  /**
   * Force flush current batch
   */
  async forceBatch(): Promise<void> {
    await this.flushBatch();
  }

  /**
   * Start batch timer for periodic flushing
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(async () => {
      if (this.batch.length > 0 && !this.isShuttingDown) {
        await this.flushBatch();
      }
    }, this.batchTimeout);
  }

  /**
   * Flush the current batch
   */
  private async flushBatch(): Promise<void> {
    if (this.batch.length === 0) return;

    const batchToFlush = [...this.batch];
    this.batch = [];

    try {
      // In a real implementation, this would trigger the next stage
      // For now, we just log the batch flush
      this.logger.debug(`Flushing batch of ${batchToFlush.length} items`);

      // Emit batch ready event (would be caught by collector)
      // this.emit('batchReady', batchToFlush);
    } catch (error) {
      this.logger.error('Failed to flush batch', error);

      // Re-add items to batch on failure
      this.batch.unshift(...batchToFlush);
      throw error;
    }
  }
}
