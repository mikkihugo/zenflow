/**
 * Swarm Backup & Recovery System.
 *
 * Provides automated daily backups and disaster recovery.
 * For hundreds of swarms with simple tar-based storage.
 */
/**
 * @file Backup management system.
 */
import { EventEmitter } from 'node:events';
export interface BackupConfig {
    dailyBackupHour: number;
    keepDailyBackups: number;
    compressionLevel: number;
    useEncryption: boolean;
    encryptionKey?: string;
    remoteBackupPath?: string;
    enableRemoteSync: boolean;
}
export interface BackupMetadata {
    id: string;
    type: 'daily';
    timestamp: Date;
    swarmIds: string[];
    sizeBytes: number;
    checksum: string;
    compression: string;
    encrypted: boolean;
}
export declare class SwarmBackupManager extends EventEmitter {
    private config;
    private claudeZenPath;
    private backupsPath;
    private dailyBackupTimer?;
    constructor(claudeZenPath: string, config?: Partial<BackupConfig>);
    /**
     * Initialize backup system.
     */
    initialize(): Promise<void>;
    /**
     * Create daily backup of all active swarms.
     */
    createDailyBackup(): Promise<string>;
    /**
     * Restore swarm from backup.
     *
     * @param swarmId
     * @param backupId
     */
    restoreSwarm(swarmId: string, backupId?: string): Promise<boolean>;
    /**
     * List available backups.
     */
    listBackups(): Promise<BackupMetadata[]>;
    /**
     * Cleanup old backups according to retention policy.
     */
    cleanupOldBackups(): Promise<number>;
    /**
     * Get backup statistics.
     */
    getBackupStats(): Promise<{
        totalBackups: number;
        totalSizeBytes: number;
        oldestBackup: Date | null;
        newestBackup: Date | null;
    }>;
    private createCompressedArchive;
    private calculateChecksum;
    private saveMetadata;
    private getLatestBackup;
    private getBackupMetadata;
    private restoreFromDailyBackup;
    private deleteBackup;
    private encryptBackup;
    private syncToRemote;
    private startBackupSchedule;
    /**
     * Shutdown backup system.
     */
    shutdown(): Promise<void>;
}
export default SwarmBackupManager;
//# sourceMappingURL=backup-manager.d.ts.map