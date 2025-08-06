/**
 * Swarm Backup & Recovery System
 *
 * Provides automated daily backups and disaster recovery
 * for hundreds of swarms with simple tar-based storage.
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface BackupConfig {
  // Backup frequency
  dailyBackupHour: number; // default: 2 (2 AM daily)

  // Retention policy
  keepDailyBackups: number; // default: 7 (one week)

  // Compression and storage
  compressionLevel: number; // default: 6 (1-9)
  useEncryption: boolean; // default: false
  encryptionKey?: string;

  // Remote backup
  remoteBackupPath?: string; // S3, rsync, etc.
  enableRemoteSync: boolean; // default: false
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

export class SwarmBackupManager extends EventEmitter {
  private config: BackupConfig;
  private claudeZenPath: string;
  private backupsPath: string;
  private dailyBackupTimer?: NodeJS.Timeout;

  constructor(claudeZenPath: string, config: Partial<BackupConfig> = {}) {
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
   * Initialize backup system
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.backupsPath, { recursive: true });
    await fs.mkdir(path.join(this.backupsPath, 'daily'), { recursive: true });
    await fs.mkdir(path.join(this.backupsPath, 'metadata'), { recursive: true });

    this.startBackupSchedule();
    this.emit('initialized');
  }

  /**
   * Create daily backup of all active swarms
   */
  async createDailyBackup(): Promise<string> {
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
    const metadata: BackupMetadata = {
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
   * Restore swarm from backup
   *
   * @param swarmId
   * @param backupId
   */
  async restoreSwarm(swarmId: string, backupId?: string): Promise<boolean> {
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
    } catch (error) {
      this.emit('restore:failed', { swarmId, backupId, error });
      return false;
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const metadataPath = path.join(this.backupsPath, 'metadata');
    const files = await fs.readdir(metadataPath);

    const backups: BackupMetadata[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(metadataPath, file), 'utf8');
        backups.push(JSON.parse(content));
      }
    }

    return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Cleanup old backups according to retention policy
   */
  async cleanupOldBackups(): Promise<number> {
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
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSizeBytes: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    const backups = await this.listBackups();

    const totalSizeBytes = backups.reduce((sum, b) => sum + b.sizeBytes, 0);

    return {
      totalBackups: backups.length,
      totalSizeBytes,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].timestamp : null,
    };
  }

  private async createCompressedArchive(sourcePath: string, outputPath: string): Promise<void> {
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

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const stream = require('node:fs').createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data: Buffer) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async saveMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupsPath, 'metadata', `${metadata.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async getLatestBackup(): Promise<BackupMetadata | null> {
    const backups = await this.listBackups();
    return backups.length > 0 ? backups[0] : null;
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = path.join(this.backupsPath, 'metadata', `${backupId}.json`);
      const content = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async restoreFromDailyBackup(swarmId: string, backup: BackupMetadata): Promise<void> {
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

  private async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) return;

    // Delete backup file
    const backupPath = path.join(this.backupsPath, 'daily', `${backupId}.tar.gz`);
    try {
      await fs.unlink(backupPath);
    } catch {
      // File might not exist
    }

    // Delete metadata
    const metadataPath = path.join(this.backupsPath, 'metadata', `${backupId}.json`);
    try {
      await fs.unlink(metadataPath);
    } catch {
      // File might not exist
    }
  }

  private async encryptBackup(backupPath: string): Promise<void> {
    // TODO: Implement encryption using node crypto
    this.emit('encryption:skipped', { path: backupPath });
  }

  private async syncToRemote(backupPath: string): Promise<void> {
    // TODO: Implement remote sync (S3, rsync, etc.)
    this.emit('remote_sync:skipped', { path: backupPath });
  }

  private startBackupSchedule(): void {
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
      this.dailyBackupTimer = setInterval(
        () => {
          this.createDailyBackup().catch((error) => {
            this.emit('backup:error', { type: 'daily', error });
          });
        },
        24 * 60 * 60 * 1000
      ); // 24 hours
    }, timeUntilBackup);
  }

  /**
   * Shutdown backup system
   */
  async shutdown(): Promise<void> {
    if (this.dailyBackupTimer) {
      clearInterval(this.dailyBackupTimer);
      this.dailyBackupTimer = undefined;
    }

    this.emit('shutdown');
  }
}

export default SwarmBackupManager;
