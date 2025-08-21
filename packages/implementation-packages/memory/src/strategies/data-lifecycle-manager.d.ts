/**
 * Data Lifecycle Manager - Intelligent Data Management
 *
 * Manages data lifecycle across hot/warm/cold/archive stages with automatic
 * migration, intelligent promotion/demotion, and efficient cleanup.
 */
import { EventEmitter } from 'eventemitter3';
import type { LifecycleConfig, LifecycleEntry, LifecycleStage, StrategyMetrics } from './types';
interface StageStats {
    count: number;
    totalSize: number;
    averageAge: number;
    accessFrequency: number;
    utilizationRate: number;
}
export declare class DataLifecycleManager extends EventEmitter {
    private logger;
    private config;
    private telemetry;
    private entries;
    private stageData;
    private migrationTimer?;
    private cleanupTimer?;
    private metrics;
    private initialized;
    constructor(config: LifecycleConfig);
    initialize(): Promise<void>;
    store(key: string, value: unknown, options?: {
        stage?: LifecycleStage;
        priority?: number;
        tags?: string[];
        source?: string;
        size?: number;
    }): void;
    retrieve(key: string): {
        value: unknown;
        entry: LifecycleEntry;
    } | null;
    delete(key: string): boolean;
    private initializeMetrics;
    private initializeStages;
    private canAccommodateInStage;
    private getStageSize;
    private estimateSize;
    private updateAccessTracking;
    private considerPromotion;
    private startPeriodicMigration;
    private startPeriodicCleanup;
    private performPeriodicMigration;
    private assessMigrationNeed;
    private determineTargetStage;
    private migrate;
    private isPromotion;
    private isDemotion;
    private compressValue;
    private performStageCleanup;
    private performPeriodicCleanup;
    getStageStats(): Record<LifecycleStage, StageStats>;
    private getStageUtilization;
    getMetrics(): StrategyMetrics['lifecycle'];
    getEntryInfo(key: string): LifecycleEntry | null;
    listKeys(stage?: LifecycleStage): string[];
    forceMigration(key: string, targetStage: LifecycleStage, reason?: string): boolean;
    updateConfig(newConfig: Partial<LifecycleConfig>): void;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=data-lifecycle-manager.d.ts.map