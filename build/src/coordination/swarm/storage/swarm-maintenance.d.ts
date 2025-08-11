/**
 * @file Coordination system: swarm-maintenance.
 */
/**
 * Swarm Storage Maintenance System.
 *
 * Handles lifecycle management for hundreds of swarms:
 * - Automatic archival of inactive swarms
 * - Cleanup of deleted/failed swarms
 * - Storage optimization and compression.
 * - Health monitoring and repair.
 */
import { EventEmitter } from 'node:events';
export interface SwarmMeta {
    id: string;
    name: string;
    createdAt: Date;
    lastAccessedAt: Date;
    lastTaskAt?: Date;
    status: 'active' | 'idle' | 'archived' | 'deleted';
    sizeBytes: number;
    taskCount: number;
    agentCount: number;
}
export interface MaintenanceConfig {
    archiveAfterDays: number;
    deleteAfterDays: number;
    compressAfterMB: number;
    maintenanceIntervalHours: number;
}
export declare class SwarmMaintenanceManager extends EventEmitter {
    private config;
    private claudeZenPath;
    private swarmsPath;
    private registryPath;
    private maintenanceTimer?;
    constructor(claudeZenPath: string, config?: Partial<MaintenanceConfig>);
    /**
     * Initialize storage structure and start maintenance.
     */
    initialize(): Promise<void>;
    /**
     * Create swarm storage directory.
     *
     * @param swarmId
     * @param metadata
     */
    createSwarmStorage(swarmId: string, metadata: Partial<SwarmMeta>): Promise<string>;
    /**
     * Archive inactive swarms.
     */
    archiveInactiveSwarms(): Promise<number>;
    /**
     * Archive specific swarm.
     *
     * @param swarmId
     */
    archiveSwarm(swarmId: string): Promise<void>;
    /**
     * Delete old archived swarms.
     */
    cleanupOldArchives(): Promise<number>;
    /**
     * Get storage statistics.
     */
    getStorageStats(): Promise<{
        active: number;
        archived: number;
        totalSizeBytes: number;
        oldestActive: Date | null;
        newestActive: Date | null;
    }>;
    /**
     * Update swarm access time (for maintenance decisions).
     *
     * @param swarmId
     */
    touchSwarm(swarmId: string): Promise<void>;
    /**
     * Manual cleanup of specific swarm.
     *
     * @param swarmId
     */
    deleteSwarm(swarmId: string): Promise<boolean>;
    private ensureDirectories;
    private startMaintenance;
    private runMaintenance;
    private getArchiveMonth;
    /**
     * Shutdown maintenance system.
     */
    shutdown(): Promise<void>;
}
export default SwarmMaintenanceManager;
//# sourceMappingURL=swarm-maintenance.d.ts.map