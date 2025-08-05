/**
 * Swarm Backup & Recovery System
 * 
 * Provides automated backup, incremental sync, and disaster recovery
 * for hundreds of swarms with efficient storage and fast recovery.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { spawn } from 'child_process';

export interface BackupConfig {
  // Backup frequency
  fullBackupIntervalHours: number; // default: 24
  incrementalBackupIntervalHours: number; // default: 4
  
  // Retention policy
  keepFullBackups: number; // default: 7 (weekly)
  keepIncrementalBackups: number; // default: 72 (3 days * 24)
  
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
  type: 'full' | 'incremental';
  timestamp: Date;
  swarmIds: string[];
  sizeBytes: number;
  checksum: string;
  basedOn?: string; // For incrementals, reference full backup
  compression: string;
  encrypted: boolean;
}

export class SwarmBackupManager extends EventEmitter {
  private config: BackupConfig;
  private claudeZenPath: string;
  private backupsPath: string;
  private fullBackupTimer?: NodeJS.Timeout;
  private incrementalBackupTimer?: NodeJS.Timeout;

  constructor(claudeZenPath: string, config: Partial<BackupConfig> = {}) {
    super();
    this.claudeZenPath = claudeZenPath;
    this.backupsPath = path.join(claudeZenPath, 'backups');
    
    this.config = {
      fullBackupIntervalHours: 24,
      incrementalBackupIntervalHours: 4,
      keepFullBackups: 7,
      keepIncrementalBackups: 72,
      compressionLevel: 6,
      useEncryption: false,
      enableRemoteSync: false,
      ...config
    };
  }

  /**
   * Initialize backup system
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.backupsPath, { recursive: true });
    await fs.mkdir(path.join(this.backupsPath, 'full'), { recursive: true });
    await fs.mkdir(path.join(this.backupsPath, 'incremental'), { recursive: true });
    await fs.mkdir(path.join(this.backupsPath, 'metadata'), { recursive: true });
    
    this.startBackupSchedule();
    this.emit('initialized');
  }

  /**
   * Create full backup of all active swarms
   */
  async createFullBackup(): Promise<string> {
    const timestamp = new Date();
    const backupId = `full-${timestamp.toISOString().replace(/[:.]/g, '-')}`;
    const backupPath = path.join(this.backupsPath, 'full', `${backupId}.tar.gz`);
    
    this.emit('backup:started', { type: 'full', id: backupId });
    
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
      type: 'full',
      timestamp,
      swarmIds: swarmDirs,
      sizeBytes: stats.size,
      checksum,
      compression: 'gzip',
      encrypted: this.config.useEncryption
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
    
    this.emit('backup:completed', { type: 'full', id: backupId, sizeBytes: stats.size });
    return backupId;
  }

  /**
   * Create incremental backup (only changed swarms)
   */
  async createIncrementalBackup(): Promise<string> {
    const timestamp = new Date();
    const backupId = `inc-${timestamp.toISOString().replace(/[:.]/g, '-')}`;
    
    // Find latest full backup as base
    const latestFull = await this.getLatestFullBackup();
    if (!latestFull) {
      // No full backup exists, create one
      return await this.createFullBackup();
    }
    
    this.emit('backup:started', { type: 'incremental', id: backupId, basedOn: latestFull.id });
    
    // Find changed swarms since last backup
    const changedSwarms = await this.findChangedSwarms(latestFull.timestamp);
    
    if (changedSwarms.length === 0) {
      this.emit('backup:skipped', { reason: 'no-changes', since: latestFull.timestamp });
      return backupId;
    }
    
    const backupPath = path.join(this.backupsPath, 'incremental', `${backupId}.tar.gz`);
    
    // Create archive with only changed swarms
    await this.createSelectiveArchive(changedSwarms, backupPath);
    
    const checksum = await this.calculateChecksum(backupPath);
    const stats = await fs.stat(backupPath);
    
    const metadata: BackupMetadata = {
      id: backupId,
      type: 'incremental',
      timestamp,
      swarmIds: changedSwarms,
      sizeBytes: stats.size,
      checksum,
      basedOn: latestFull.id,
      compression: 'gzip',
      encrypted: this.config.useEncryption
    };
    
    await this.saveMetadata(metadata);
    
    if (this.config.useEncryption) {
      await this.encryptBackup(backupPath);
    }
    
    if (this.config.enableRemoteSync) {
      await this.syncToRemote(backupPath);
    }
    
    this.emit('backup:completed', { 
      type: 'incremental', 
      id: backupId, 
      changedSwarms: changedSwarms.length,
      sizeBytes: stats.size 
    });
    
    return backupId;
  }

  /**
   * Restore swarm from backup
   */
  async restoreSwarm(swarmId: string, backupId?: string): Promise<boolean> {
    this.emit('restore:started', { swarmId, backupId });
    
    try {
      const backup = backupId ? 
        await this.getBackupMetadata(backupId) : 
        await this.getLatestBackupContaining(swarmId);
      
      if (!backup) {
        throw new Error(`No backup found for swarm ${swarmId}`);
      }
      
      // Restore from backup chain if incremental
      if (backup.type === 'incremental') {
        await this.restoreFromIncrementalChain(swarmId, backup);
      } else {
        await this.restoreFromFullBackup(swarmId, backup);
      }
      
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
  async cleanupOldBackups(): Promise<{ deletedFull: number; deletedIncremental: number }> {
    const backups = await this.listBackups();
    
    const fullBackups = backups.filter(b => b.type === 'full').slice(this.config.keepFullBackups);
    const incrementalBackups = backups.filter(b => b.type === 'incremental').slice(this.config.keepIncrementalBackups);
    
    let deletedFull = 0;
    let deletedIncremental = 0;
    
    // Delete old full backups
    for (const backup of fullBackups) {
      await this.deleteBackup(backup.id);
      deletedFull++;
    }
    
    // Delete old incremental backups
    for (const backup of incrementalBackups) {
      await this.deleteBackup(backup.id);
      deletedIncremental++;
    }
    
    this.emit('cleanup:completed', { deletedFull, deletedIncremental });
    return { deletedFull, deletedIncremental };
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    fullBackups: number;
    incrementalBackups: number;
    totalSizeBytes: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    const backups = await this.listBackups();
    
    const fullBackups = backups.filter(b => b.type === 'full').length;
    const incrementalBackups = backups.filter(b => b.type === 'incremental').length;
    const totalSizeBytes = backups.reduce((sum, b) => sum + b.sizeBytes, 0);
    
    return {
      totalBackups: backups.length,
      fullBackups,
      incrementalBackups,
      totalSizeBytes,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].timestamp : null
    };
  }

  private async createCompressedArchive(sourcePath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', [
        '-czf', outputPath,
        '-C', path.dirname(sourcePath),
        path.basename(sourcePath)
      ]);
      
      tar.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`tar failed with code ${code}`));
      });
    });
  }

  private async createSelectiveArchive(swarmIds: string[], outputPath: string): Promise<void> {
    const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
    
    return new Promise((resolve, reject) => {
      const args = ['-czf', outputPath, '-C', swarmsPath];
      args.push(...swarmIds);
      
      const tar = spawn('tar', args);
      tar.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`tar failed with code ${code}`));
      });
    });
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const stream = require('fs').createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (data: Buffer) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async findChangedSwarms(since: Date): Promise<string[]> {
    const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
    const swarmDirs = await fs.readdir(swarmsPath);
    const changedSwarms: string[] = [];
    
    for (const swarmId of swarmDirs) {
      const swarmPath = path.join(swarmsPath, swarmId);
      const stats = await fs.stat(swarmPath);
      
      if (stats.mtime > since) {
        changedSwarms.push(swarmId);
      }
    }
    
    return changedSwarms;
  }

  private async saveMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupsPath, 'metadata', `${metadata.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async getLatestFullBackup(): Promise<BackupMetadata | null> {
    const backups = await this.listBackups();
    return backups.find(b => b.type === 'full') || null;
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

  private async getLatestBackupContaining(swarmId: string): Promise<BackupMetadata | null> {
    const backups = await this.listBackups();
    return backups.find(b => b.swarmIds.includes(swarmId)) || null;
  }

  private async restoreFromFullBackup(swarmId: string, backup: BackupMetadata): Promise<void> {
    const backupPath = path.join(this.backupsPath, 'full', `${backup.id}.tar.gz`);
    const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
    
    // Extract specific swarm
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', [
        '-xzf', backupPath,
        '-C', swarmsPath,
        swarmId
      ]);
      
      tar.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`restore failed with code ${code}`));
      });
    });
  }

  private async restoreFromIncrementalChain(swarmId: string, backup: BackupMetadata): Promise<void> {
    // First restore from base full backup
    if (backup.basedOn) {
      const fullBackup = await this.getBackupMetadata(backup.basedOn);
      if (fullBackup) {
        await this.restoreFromFullBackup(swarmId, fullBackup);
      }
    }
    
    // Then apply incremental changes
    const backupPath = path.join(this.backupsPath, 'incremental', `${backup.id}.tar.gz`);
    const swarmsPath = path.join(this.claudeZenPath, 'swarms', 'active');
    
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', [
        '-xzf', backupPath,
        '-C', swarmsPath,
        swarmId
      ]);
      
      tar.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`incremental restore failed with code ${code}`));
      });
    });
  }

  private async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) return;
    
    // Delete backup file
    const backupPath = path.join(
      this.backupsPath, 
      metadata.type, 
      `${backupId}.tar.gz`
    );
    
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
    // For now, just a placeholder
    this.emit('encryption:skipped', { path: backupPath });
  }

  private async syncToRemote(backupPath: string): Promise<void> {
    // TODO: Implement remote sync (S3, rsync, etc.)
    this.emit('remote_sync:skipped', { path: backupPath });
  }

  private startBackupSchedule(): void {
    // Full backup schedule
    const fullIntervalMs = this.config.fullBackupIntervalHours * 60 * 60 * 1000;
    this.fullBackupTimer = setInterval(() => {
      this.createFullBackup().catch(error => {
        this.emit('backup:error', { type: 'full', error });
      });
    }, fullIntervalMs);
    
    // Incremental backup schedule
    const incIntervalMs = this.config.incrementalBackupIntervalHours * 60 * 60 * 1000;
    this.incrementalBackupTimer = setInterval(() => {
      this.createIncrementalBackup().catch(error => {
        this.emit('backup:error', { type: 'incremental', error });
      });
    }, incIntervalMs);
    
    // Initial backup after 1 minute
    setTimeout(() => {
      this.createFullBackup().catch(error => {
        this.emit('backup:error', { type: 'initial', error });
      });
    }, 60000);
  }

  /**
   * Shutdown backup system
   */
  async shutdown(): Promise<void> {
    if (this.fullBackupTimer) {
      clearInterval(this.fullBackupTimer);
      this.fullBackupTimer = undefined;
    }
    
    if (this.incrementalBackupTimer) {
      clearInterval(this.incrementalBackupTimer);
      this.incrementalBackupTimer = undefined;
    }
    
    this.emit('shutdown');
  }
}

export default SwarmBackupManager;