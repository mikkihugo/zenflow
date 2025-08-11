/**
 * Swarm Backup & Recovery System.
 *
 * Provides automated daily backups and disaster recovery.
 * For hundreds of swarms with simple tar-based storage.
 */
/**
 * @file Backup management system.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import path from 'node:path';
export class SwarmBackupManager extends EventEmitter {
    config;
    claudeZenPath;
    backupsPath;
    dailyBackupTimer;
    constructor(claudeZenPath, config = {}) {
        super();
        this.claudeZenPath = claudeZenPath;
        this.backupsPath = path.join(claudeZenPath, 'backups');
        this.config = {
            dailyBackupHour: 2,
            keepDailyBackups: 7,
            compressionLevel: 6,
            useEncryption: false,
            enableRemoteSync: false,
            ...config,
        };
    }
    /**
     * Initialize backup system.
     */
    async initialize() {
        await fs.mkdir(this.backupsPath, { recursive: true });
        await fs.mkdir(path.join(this.backupsPath, 'daily'), { recursive: true });
        await fs.mkdir(path.join(this.backupsPath, 'metadata'), { recursive: true });
        this.startBackupSchedule();
        this.emit('initialized');
    }
    /**
     * Create daily backup of all active swarms.
     */
    async createDailyBackup() {
        const timestamp = new Date();
        const backupId = `daily-${timestamp.toISOString().split('T')[0]}`;
        const backupPath = path.join(this.backupsPath, 'daily', `${backupId}.tar.gz`);
        this.emit('backup:started', { type: 'daily', id: backupId });
        const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
        const swarmDirs = await fs.readdir(swarmsPath);
        // Create compressed archive
        await this.createCompressedArchive(swarmsPath, backupPath);
        // Calculate checksum
        const checksum = await this.calculateChecksum(backupPath);
        const stats = await fs.stat(backupPath);
        // Create metadata
        const metadata = {
            id: backupId,
            type: 'daily',
            timestamp,
            swarmIds: swarmDirs,
            sizeBytes: stats.size,
            checksum,
            compression: 'gzip',
            encrypted: this.config.useEncryption,
        };
        await this.saveMetadata(metadata);
        // Encrypt if enabled
        if (this.config.useEncryption) {
            await this.encryptBackup(backupPath);
        }
        // Sync to remote if enabled
        if (this.config.enableRemoteSync) {
            await this.syncToRemote(backupPath);
        }
        this.emit('backup:completed', { type: 'daily', id: backupId, sizeBytes: stats.size });
        return backupId;
    }
    /**
     * Restore swarm from backup.
     *
     * @param swarmId
     * @param backupId
     */
    async restoreSwarm(swarmId, backupId) {
        this.emit('restore:started', { swarmId, backupId });
        try {
            const backup = backupId
                ? await this.getBackupMetadata(backupId)
                : await this.getLatestBackup();
            if (!backup) {
                throw new Error(`No backup found for swarm ${swarmId}`);
            }
            // Restore from daily backup
            await this.restoreFromDailyBackup(swarmId, backup);
            this.emit('restore:completed', { swarmId, backupId: backup.id });
            return true;
        }
        catch (error) {
            this.emit('restore:failed', { swarmId, backupId, error });
            return false;
        }
    }
    /**
     * List available backups.
     */
    async listBackups() {
        const metadataPath = path.join(this.backupsPath, 'metadata');
        const files = await fs.readdir(metadataPath);
        const backups = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(metadataPath, file), 'utf8');
                backups.push(JSON.parse(content));
            }
        }
        return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Cleanup old backups according to retention policy.
     */
    async cleanupOldBackups() {
        const backups = await this.listBackups();
        const oldBackups = backups.slice(this.config.keepDailyBackups);
        let deletedCount = 0;
        for (const backup of oldBackups) {
            await this.deleteBackup(backup.id);
            deletedCount++;
        }
        this.emit('cleanup:completed', { deletedCount });
        return deletedCount;
    }
    /**
     * Get backup statistics.
     */
    async getBackupStats() {
        const backups = await this.listBackups();
        const totalSizeBytes = backups.reduce((sum, b) => sum + b.sizeBytes, 0);
        return {
            totalBackups: backups.length,
            totalSizeBytes,
            oldestBackup: backups.length > 0 ? backups[backups.length - 1]?.timestamp || null : null,
            newestBackup: backups.length > 0 ? backups[0]?.timestamp || null : null,
        };
    }
    async createCompressedArchive(sourcePath, outputPath) {
        return new Promise((resolve, reject) => {
            const tar = spawn('tar', [
                '-czf',
                outputPath,
                '-C',
                path.dirname(sourcePath),
                path.basename(sourcePath),
            ]);
            tar.on('close', (code) => {
                code === 0 ? resolve() : reject(new Error(`tar failed with code ${code}`));
            });
        });
    }
    async calculateChecksum(filePath) {
        const hash = createHash('sha256');
        const stream = require('node:fs').createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    async saveMetadata(metadata) {
        const metadataPath = path.join(this.backupsPath, 'metadata', `${metadata?.id}.json`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }
    async getLatestBackup() {
        const backups = await this.listBackups();
        return backups.length > 0 ? backups[0] || null : null;
    }
    async getBackupMetadata(backupId) {
        try {
            const metadataPath = path.join(this.backupsPath, 'metadata', `${backupId}.json`);
            const content = await fs.readFile(metadataPath, 'utf8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async restoreFromDailyBackup(swarmId, backup) {
        const backupPath = path.join(this.backupsPath, 'daily', `${backup.id}.tar.gz`);
        const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
        // Extract specific swarm
        return new Promise((resolve, reject) => {
            const tar = spawn('tar', ['-xzf', backupPath, '-C', swarmsPath, swarmId]);
            tar.on('close', (code) => {
                code === 0 ? resolve() : reject(new Error(`restore failed with code ${code}`));
            });
        });
    }
    async deleteBackup(backupId) {
        const metadata = await this.getBackupMetadata(backupId);
        if (!metadata)
            return;
        // Delete backup file
        const backupPath = path.join(this.backupsPath, 'daily', `${backupId}.tar.gz`);
        try {
            await fs.unlink(backupPath);
        }
        catch {
            // File might not exist
        }
        // Delete metadata
        const metadataPath = path.join(this.backupsPath, 'metadata', `${backupId}.json`);
        try {
            await fs.unlink(metadataPath);
        }
        catch {
            // File might not exist
        }
    }
    async encryptBackup(backupPath) {
        // TODO: Implement encryption using node crypto
        this.emit('encryption:skipped', { path: backupPath });
    }
    async syncToRemote(backupPath) {
        // TODO: Implement remote sync (S3, rsync, etc.)
        this.emit('remote_sync:skipped', { path: backupPath });
    }
    startBackupSchedule() {
        // Calculate time until next backup (daily at specified hour)
        const now = new Date();
        const nextBackup = new Date();
        nextBackup.setHours(this.config.dailyBackupHour, 0, 0, 0);
        if (nextBackup <= now) {
            nextBackup.setDate(nextBackup.getDate() + 1);
        }
        const timeUntilBackup = nextBackup.getTime() - now.getTime();
        // Schedule first backup
        setTimeout(() => {
            this.createDailyBackup().catch((error) => {
                this.emit('backup:error', { type: 'daily', error });
            });
            // Then schedule daily backups
            this.dailyBackupTimer = setInterval(() => {
                this.createDailyBackup().catch((error) => {
                    this.emit('backup:error', { type: 'daily', error });
                });
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilBackup);
    }
    /**
     * Shutdown backup system.
     */
    async shutdown() {
        if (this.dailyBackupTimer) {
            clearInterval(this.dailyBackupTimer);
            this.dailyBackupTimer = undefined;
        }
        this.emit('shutdown');
    }
}
export default SwarmBackupManager;
