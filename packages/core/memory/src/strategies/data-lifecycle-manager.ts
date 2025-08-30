/**
 * Data Lifecycle Manager - Intelligent Data Management
 *
 * Manages data lifecycle across hot/warm/cold/archive stages with automatic
 * migration, intelligent promotion/demotion, and efficient cleanup.
 */

import {
  EventEmitter,
  getLogger,
  recordMetric,
  TelemetryManager,
  withTrace,
} from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

import type {
  LifecycleConfig,
  LifecycleEntry,
  LifecycleStage,
  StrategyMetrics,
} from './types';

interface LifecycleAction {
  type: 'promote|demote|migrate|cleanup|archive';
  key: string;
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  reason: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

interface StageStats {
  count: number;
  totalSize: number;
  averageAge: number;
  accessFrequency: number;
  utilizationRate: number;
}

export class DataLifecycleManager extends EventEmitter {
  private logger: Logger;
  private config: LifecycleConfig;
  private telemetry: TelemetryManager;
  private entries = new Map<string, LifecycleEntry>();
  private stageData = new Map<LifecycleStage, Map<string, unknown>>();
  private migrationTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private metrics: StrategyMetrics['lifecycle'];
  private initialized = false;

  constructor(config: LifecycleConfig) {
    super();
    this.config = config;
    this.logger = getLogger('DataLifecycleManager');
    this.telemetry = new TelemetryManager({
      serviceName: 'data-lifecycle',
      enableTracing: true,
      enableMetrics: true,
    });
    this.initializeMetrics();
    this.initializeStages();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await withTrace('data-lifecycle-init', async () => {
        await this.telemetry.initialize();

        // Start periodic migration and cleanup
        if (this.configuration.enabled) {
          this.startPeriodicMigration();
          this.startPeriodicCleanup();
        }

        this.initialized = true;
        this.logger.info('Data lifecycle manager initialized', {
          stages: Object.keys(this.configuration.stages),
          enabled: this.configuration.enabled,
        });
        recordMetric('data_lifecycle_initialized', 1);
      });
    } catch (error) {
      this.logger.error('Failed to initialize data lifecycle manager: ', error);
      throw error;
    }
  }

  store(
    key: string,
    value: unknown,
    options: {
      stage?: LifecycleStage;
      priority?: number;
      tags?: string[];
      source?: string;
      size?: number;
    } = {}
  ): void {
    if (!this.configuration.enabled) {
      return;
    }

    const now = Date.now();
    const stage = options.stage || 'hot';
    const size = options.size || this.estimateSize(value);

    // Check stage capacity
    if (!this.canAccommodateInStage(stage, size)) {
      this.performStageCleanup(stage);
    }

    // Create lifecycle entry
    const entry: LifecycleEntry = {
      key,
      stage,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      accessFrequency: 1,
      size,
      migrationHistory: [],
      metadata: {
        priority: options.priority || 1,
        tags: options.tags || [],
        source: options.source || 'unknown',
      },
    };

    // Store data and entry
    this.stageData.get(stage)?.set(key, value);
    this.entries.set(key, entry);

    this.emit('dataStored', { key, stage, entry });
    recordMetric('data_lifecycle_stored', 1, { stage });

    this.logger.debug(`Data stored in ${stage} stage:${key}`);
  }

  retrieve(key: string): { value: unknown; entry: LifecycleEntry } | null {
    if (!this.configuration.enabled) {
      return null;
    }

    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    // Check if data exists in current stage
    const stageMap = this.stageData.get(entry.stage);
    if (!stageMap?.has(key)) {
      // Data may have been migrated or expired
      this.entries.delete(key);
      return null;
    }

    const value = stageMap.get(key);

    // Update access tracking
    this.updateAccessTracking(entry);

    // Consider promoting to hotter stage if access frequency is high
    if (this.configuration.migration.autoPromote) {
      this.considerPromotion(entry);
    }

    recordMetric('data_lifecycle_retrieved', 1, { stage: entry.stage });
    return { value, entry };
  }

  delete(key: string): boolean {
    if (!this.configuration.enabled) {
      return false;
    }

    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    // Remove from stage data
    this.stageData.get(entry.stage)?.delete(key);
    this.entries.delete(key);

    this.emit('dataDeleted', { key, stage: entry.stage });
    recordMetric('data_lifecycle_deleted', 1, { stage: entry.stage });

    return true;
  }

  private initializeMetrics(): void {
    this.metrics = {
      promotions: 0,
      demotions: 0,
      migrations: 0,
      cleanupOperations: 0,
    };
  }

  private initializeStages(): void {
    this.stageData.set('hot', new Map())();
    this.stageData.set('warm', new Map())();
    this.stageData.set('cold', new Map())();
    this.stageData.set('archive', new Map())();
    this.stageData.set('expired', new Map())();
  }

  private canAccommodateInStage(stage: LifecycleStage, size: number): boolean {
    if (stage === 'expired') return true;

    const stageConfig =
      this.configuration.stages[
        stage as keyof typeof this.configuration.stages
      ];
    if (!stageConfig) return false;

    const currentSize = this.getStageSize(stage);
    return currentSize + size <= stageConfig.maxSize;
  }

  private getStageSize(stage: LifecycleStage): number {
    const stageMap = this.stageData.get(stage);
    if (!stageMap) return 0;

    let totalSize = 0;
    for (const key of stageMap.keys()) {
      const entry = this.entries.get(key);
      if (entry) {
        totalSize += entry.size;
      }
    }
    return totalSize;
  }

  private estimateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2; // Rough UTF-16 estimate
    } catch {
      return 1000; // Default for unstringifiable values
    }
  }

  private updateAccessTracking(entry: LifecycleEntry): void {
    const now = Date.now();
    const timeSinceLastAccess = now - entry.lastAccessed;

    entry.lastAccessed = now;
    entry.accessCount++;

    // Calculate frequency as accesses per hour
    const ageInHours = (now - entry.createdAt) / (1000 * 60 * 60);
    entry.accessFrequency = entry.accessCount / Math.max(ageInHours, 0.1);
  }

  private considerPromotion(entry: LifecycleEntry): void {
    const now = Date.now();

    // Promotion rules based on access patterns
    if (entry.stage === 'warm' || entry.stage === ' cold') {
      const timeSinceLastAccess = now - entry.lastAccessed;
      const hotThreshold = this.configuration.stages.hot.accessThreshold;

      if (entry.accessFrequency > hotThreshold && timeSinceLastAccess < 60000) {
        // Less than 1 minute
        this.migrate(entry.key, 'hot', 'High access frequency');
      }
    }

    if (entry.stage === 'cold') {
      const warmThreshold = this.configuration.stages.warm.accessThreshold;

      if (entry.accessFrequency > warmThreshold) {
        this.migrate(entry.key, 'warm', 'Moderate access frequency');
      }
    }
  }

  private startPeriodicMigration(): void {
    this.migrationTimer = setInterval(() => {
      this.performPeriodicMigration();
    }, this.configuration.migration.interval);
  }

  private startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performPeriodicCleanup();
    }, this.configuration.cleanup.interval);
  }

  private async performPeriodicMigration(): Promise<void> {
    if (!this.configuration.enabled) return;

    try {
      await withTrace('data-lifecycle-migration', async () => {
        const now = Date.now();
        const entries = Array.from(this.entries.values())();
        let migrated = 0;

        for (const entry of entries) {
          if (migrated >= this.configuration.migration.batchSize) {
            break;
          }

          const migrationNeeded = this.assessMigrationNeed(entry, now);
          if (migrationNeeded) {
            const targetStage = this.determineTargetStage(entry, now);
            if (targetStage !== entry.stage) {
              this.migrate(entry.key, targetStage, 'Periodic migration');
              migrated++;
            }
          }
        }

        if (migrated > 0) {
          this.logger.debug(
            `Periodic migration completed:${migrated} entries migrated`
          );
          recordMetric('data_lifecycle_periodic_migration', migrated);
        }
      });
    } catch (error) {
      this.logger.error('Periodic migration failed: ', error);
    }
  }

  private assessMigrationNeed(entry: LifecycleEntry, now: number): boolean {
    const age = now - entry.createdAt;
    const timeSinceAccess = now - entry.lastAccessed;

    // Check if entry should be demoted
    const stageConfig =
      this.configuration.stages[
        entry.stage as keyof typeof this.configuration.stages
      ];
    if (!stageConfig) return false;

    // Demote if not accessed recently and exceeds stage duration
    if (
      timeSinceAccess > stageConfig.duration ||
      age > stageConfig.duration * 2
    ) {
      return true;
    }

    // Promote if access frequency is high for current stage
    if (
      this.configuration.migration.autoPromote &&
      entry.accessFrequency > stageConfig.accessThreshold * 2
    ) {
      return true;
    }

    return false;
  }

  private determineTargetStage(
    entry: LifecycleEntry,
    now: number
  ): LifecycleStage {
    const age = now - entry.createdAt;
    const timeSinceAccess = now - entry.lastAccessed;

    // Promotion logic (if auto-promote enabled)
    if (this.configuration.migration.autoPromote) {
      const hotThreshold = this.configuration.stages.hot.accessThreshold;
      const warmThreshold = this.configuration.stages.warm.accessThreshold;

      if (entry.accessFrequency > hotThreshold && timeSinceAccess < 300000) {
        // 5 minutes
        return 'hot';
      }

      if (entry.accessFrequency > warmThreshold && timeSinceAccess < 3600000) {
        // 1 hour
        return 'warm';
      }
    }

    // Demotion logic
    if (entry.stage === 'hot') {
      const hotDuration = this.configuration.stages.hot.duration;
      if (timeSinceAccess > hotDuration || age > hotDuration * 2) {
        return 'warm';
      }
    }

    if (entry.stage === 'warm') {
      const warmDuration = this.configuration.stages.warm.duration;
      if (timeSinceAccess > warmDuration || age > warmDuration * 2) {
        return 'cold';
      }
    }

    if (entry.stage === 'cold') {
      const coldDuration = this.configuration.stages.cold.duration;
      if (timeSinceAccess > coldDuration || age > coldDuration * 2) {
        return this.configuration.stages.archive.enabled
          ? 'archive'
          : 'expired';
      }
    }

    if (entry.stage === 'archive') {
      const archiveDuration = this.configuration.stages.archive.duration;
      if (age > archiveDuration) {
        return 'expired';
      }
    }

    return entry.stage;
  }

  private migrate(
    key: string,
    targetStage: LifecycleStage,
    reason: string
  ): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    const currentStage = entry.stage;
    const currentValue = this.stageData.get(currentStage)?.get(key);

    if (!currentValue) return false;

    // Check if target stage can accommodate
    if (!this.canAccommodateInStage(targetStage, entry.size)) {
      this.performStageCleanup(targetStage);

      // Check again after cleanup
      if (!this.canAccommodateInStage(targetStage, entry.size)) {
        return false;
      }
    }

    // Perform migration
    this.stageData.get(currentStage)?.delete(key);

    // Handle archival compression
    let finalValue = currentValue;
    if (
      targetStage === 'archive' &&
      this.configuration.stages.archive.enabled
    ) {
      finalValue = this.compressValue(currentValue);
    }

    this.stageData.get(targetStage)?.set(key, finalValue);

    // Update entry
    entry.stage = targetStage;
    entry.migrationHistory.push({
      from: currentStage,
      to: targetStage,
      timestamp: Date.now(),
      reason,
    });

    // Update metrics
    if (this.isPromotion(currentStage, targetStage)) {
      this.metrics.promotions++;
    } else if (this.isDemotion(currentStage, targetStage)) {
      this.metrics.demotions++;
    }
    this.metrics.migrations++;

    this.emit('dataMigrated', {
      key,
      fromStage: currentStage,
      toStage: targetStage,
      reason,
      entry,
    });

    recordMetric('data_lifecycle_migrated', 1, {
      fromStage: currentStage,
      toStage: targetStage,
      reason,
    });

    this.logger.debug(
      `Data migrated:${key} from ${currentStage} to ${targetStage} (${reason})`
    );
    return true;
  }

  private isPromotion(from: LifecycleStage, to: LifecycleStage): boolean {
    const stageOrder: LifecycleStage[] = ['cold', 'warm', 'hot'];
    return stageOrder.indexOf(to) > stageOrder.indexOf(from);
  }

  private isDemotion(from: LifecycleStage, to: LifecycleStage): boolean {
    const stageOrder: LifecycleStage[] = [
      'hot',
      'warm',
      'cold',
      'archive',
      'expired',
    ];
    return stageOrder.indexOf(to) > stageOrder.indexOf(from);
  }

  private compressValue(value: unknown): unknown {
    // Mock compression - in real implementation, would use actual compression
    if (typeof value === 'string') {
      return { compressed: true, data: value };
    }
    return { compressed: true, data: JSON.stringify(value) };
  }

  private performStageCleanup(stage: LifecycleStage): void {
    const stageMap = this.stageData.get(stage);
    if (!stageMap) return;

    const entries = Array.from(stageMap.keys())
      .map((key) => this.entries.get(key))
      .filter((entry) => entry !== undefined)
      .sort((a, b) => a!.lastAccessed - b!.lastAccessed); // Oldest first

    const cleanupCount = Math.min(
      entries.length,
      Math.ceil(entries.length * 0.1)
    ); // Clean 10%

    for (let i = 0; i < cleanupCount; i++) {
      const entry = entries[i];
      if (entry) {
        const nextStage = this.determineTargetStage(entry, Date.now())();
        if (nextStage !== entry.stage) {
          this.migrate(entry.key, nextStage, 'Stage cleanup');
        }
      }
    }
  }

  private async performPeriodicCleanup(): Promise<void> {
    if (!this.configuration.enabled) return;

    try {
      await withTrace('data-lifecycle-cleanup', async () => {
        const now = Date.now();
        let cleaned = 0;

        // Clean expired data
        const expiredMap = this.stageData.get('expired');
        if (expiredMap) {
          const expiredKeys = Array.from(expiredMap.keys())();
          for (const key of expiredKeys) {
            this.delete(key);
            cleaned++;
          }
        }

        // Clean truly expired entries based on thresholds
        for (const [key, entry] of this.entries) {
          const age = now - entry.createdAt;
          const timeSinceAccess = now - entry.lastAccessed;

          if (
            timeSinceAccess > this.configuration.cleanup.unusedDataThreshold ||
            age > this.configuration.cleanup.expiredDataThreshold
          ) {
            this.delete(key);
            cleaned++;
          }
        }

        this.metrics.cleanupOperations++;

        if (cleaned > 0) {
          this.logger.debug(
            `Periodic cleanup completed:${cleaned} entries removed`
          );
          recordMetric('data_lifecycle_periodic_cleanup', cleaned);
        }
      });
    } catch (error) {
      this.logger.error('Periodic cleanup failed: ', error);
    }
  }

  // Public methods

  getStageStats(): Record<LifecycleStage, StageStats> {
    const stats: Record<string, StageStats> = {};

    for (const stage of [
      'hot',
      'warm',
      'cold',
      'archive',
      'expired',
    ] as LifecycleStage[]) {
      const stageEntries = Array.from(this.entries.values()).filter(
        (e) => e.stage === stage
      );
      const now = Date.now();

      stats[stage] = {
        count: stageEntries.length,
        totalSize: stageEntries.reduce((sum, e) => sum + e.size, 0),
        averageAge:
          stageEntries.length > 0
            ? stageEntries.reduce((sum, e) => sum + (now - e.createdAt), 0) /
              stageEntries.length
            : 0,
        accessFrequency:
          stageEntries.length > 0
            ? stageEntries.reduce((sum, e) => sum + e.accessFrequency, 0) /
              stageEntries.length
            : 0,
        utilizationRate: this.getStageUtilization(stage),
      };
    }

    return stats as Record<LifecycleStage, StageStats>;
  }

  private getStageUtilization(stage: LifecycleStage): number {
    if (stage === 'expired') return 0;

    const stageConfig =
      this.configuration.stages[
        stage as keyof typeof this.configuration.stages
      ];
    if (!stageConfig) return 0;

    const currentSize = this.getStageSize(stage);
    return currentSize / stageConfig.maxSize;
  }

  getMetrics(): StrategyMetrics['lifecycle'] {
    return { ...this.metrics };
  }

  getEntryInfo(key: string): LifecycleEntry | null {
    return this.entries.get(key) || null;
  }

  listKeys(stage?: LifecycleStage): string[] {
    if (stage) {
      return Array.from(this.entries.values())
        .filter((entry) => entry.stage === stage)
        .map((entry) => entry.key);
    }
    return Array.from(this.entries.keys());
  }

  forceMigration(
    key: string,
    targetStage: LifecycleStage,
    reason = 'Manual migration'
  ): boolean {
    return this.migrate(key, targetStage, reason);
  }

  updateConfig(newConfig: Partial<LifecycleConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart timers if intervals changed
    if (newConfig.migration?.interval !== undefined) {
      if (this.migrationTimer) {
        clearInterval(this.migrationTimer);
      }
      if (this.configuration.enabled) {
        this.startPeriodicMigration();
      }
    }

    if (newConfig.cleanup?.interval !== undefined) {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
      }
      if (this.configuration.enabled) {
        this.startPeriodicCleanup();
      }
    }

    this.logger.info('Data lifecycle configuration updated', newConfig);
  }

  async shutdown(): Promise<void> {
    if (this.migrationTimer) {
      clearInterval(this.migrationTimer);
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.entries.clear();
    this.stageData.clear();
    this.initializeStages();

    this.initialized = false;
    this.logger.info('Data lifecycle manager shut down');
  }
}
