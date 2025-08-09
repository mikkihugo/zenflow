/**
 * @file Coordination system: swarm-maintenance
 */


import { getLogger } from '../config/logging-config';

const logger = getLogger('coordination-swarm-storage-swarm-maintenance');

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
import { promises as fs } from 'node:fs';
import path from 'node:path';

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
  // Archive swarms inactive for > archiveAfterDays
  archiveAfterDays: number; // default: 30

  // Delete archived swarms older than deleteAfterDays
  deleteAfterDays: number; // default: 90

  // Compress swarms with > compressAfterMB
  compressAfterMB: number; // default: 100

  // Cleanup interval
  maintenanceIntervalHours: number; // default: 24
}

export class SwarmMaintenanceManager extends EventEmitter {
  private config: MaintenanceConfig;
  private claudeZenPath: string;
  private swarmsPath: string;
  private registryPath: string;
  private maintenanceTimer?: NodeJS.Timeout | undefined;

  constructor(claudeZenPath: string, config: Partial<MaintenanceConfig> = {}) {
    super();
    this.claudeZenPath = claudeZenPath;
    this.swarmsPath = path.join(claudeZenPath, 'swarms');
    this.registryPath = path.join(this.swarmsPath, 'registry.db');

    this.config = {
      archiveAfterDays: 30,
      deleteAfterDays: 90,
      compressAfterMB: 100,
      maintenanceIntervalHours: 24,
      ...config,
    };
  }

  /**
   * Initialize storage structure and start maintenance.
   */
  async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.startMaintenance();
    this.emit('initialized');
  }

  /**
   * Create swarm storage directory.
   *
   * @param swarmId
   * @param metadata
   */
  async createSwarmStorage(swarmId: string, metadata: Partial<SwarmMeta>): Promise<string> {
    const swarmDir = path.join(this.swarmsPath, 'active', swarmId);
    await fs.mkdir(swarmDir, { recursive: true });

    // Create metadata file
    const meta: SwarmMeta = {
      id: swarmId,
      name: metadata?.name || swarmId,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      status: 'active',
      sizeBytes: 0,
      taskCount: 0,
      agentCount: 0,
      ...metadata,
    };

    await fs.writeFile(path.join(swarmDir, 'meta.json'), JSON.stringify(meta, null, 2));

    this.emit('swarm:created', { swarmId, path: swarmDir });
    return swarmDir;
  }

  /**
   * Archive inactive swarms.
   */
  async archiveInactiveSwarms(): Promise<number> {
    const activeDir = path.join(this.swarmsPath, 'active');
    const swarmDirs = await fs.readdir(activeDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.archiveAfterDays);

    let archivedCount = 0;

    for (const swarmId of swarmDirs) {
      const swarmDir = path.join(activeDir, swarmId);
      const metaPath = path.join(swarmDir, 'meta.json');

      try {
        const metaData = JSON.parse(await fs.readFile(metaPath, 'utf8'));
        const lastAccessed = new Date(metaData?.lastAccessedAt);

        if (lastAccessed < cutoffDate && metaData?.status === 'active') {
          await this.archiveSwarm(swarmId);
          archivedCount++;
        }
      } catch (error) {
        logger.warn(`Failed to process swarm ${swarmId}:`, error);
      }
    }

    this.emit('maintenance:archived', { count: archivedCount });
    return archivedCount;
  }

  /**
   * Archive specific swarm.
   *
   * @param swarmId
   */
  async archiveSwarm(swarmId: string): Promise<void> {
    const activeDir = path.join(this.swarmsPath, 'active', swarmId);
    const archiveDir = path.join(this.swarmsPath, 'archived', this.getArchiveMonth());

    await fs.mkdir(archiveDir, { recursive: true });

    // Compress and move
    const archivePath = path.join(archiveDir, `${swarmId}.tar.gz`);

    // Use tar compression
    const { spawn } = require('node:child_process');
    await new Promise((resolve, reject) => {
      const tar = spawn('tar', ['-czf', archivePath, '-C', path.dirname(activeDir), swarmId]);
      tar.on('close', (code) =>
        code === 0 ? resolve(void 0) : reject(new Error(`tar failed: ${code}`))
      );
    });

    // Remove original
    await fs.rm(activeDir, { recursive: true });

    this.emit('swarm:archived', { swarmId, archivePath });
  }

  /**
   * Delete old archived swarms.
   */
  async cleanupOldArchives(): Promise<number> {
    const archivedDir = path.join(this.swarmsPath, 'archived');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.deleteAfterDays);

    let deletedCount = 0;

    try {
      const monthDirs = await fs.readdir(archivedDir);

      for (const monthDir of monthDirs) {
        const monthPath = path.join(archivedDir, monthDir);
        const splitResult = monthDir.split('-');
        const yearStr = splitResult?.[0];
        const monthStr = splitResult?.[1];

        if (!yearStr || !monthStr) {
          logger.warn(`Invalid month directory format: ${monthDir}`);
          continue;
        }

        const monthDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1);

        if (monthDate < cutoffDate) {
          const archives = await fs.readdir(monthPath);
          deletedCount += archives.length;
          await fs.rm(monthPath, { recursive: true });
          this.emit('archives:deleted', { month: monthDir, count: archives.length });
        }
      }
    } catch (error) {
      logger.warn('Failed to cleanup archives:', error);
    }

    return deletedCount;
  }

  /**
   * Get storage statistics.
   */
  async getStorageStats(): Promise<{
    active: number;
    archived: number;
    totalSizeBytes: number;
    oldestActive: Date | null;
    newestActive: Date | null;
  }> {
    const activeDir = path.join(this.swarmsPath, 'active');
    const archivedDir = path.join(this.swarmsPath, 'archived');

    const activeCount = (await fs.readdir(activeDir)).length;

    let archivedCount = 0;
    try {
      const monthDirs = await fs.readdir(archivedDir);
      for (const monthDir of monthDirs) {
        const archives = await fs.readdir(path.join(archivedDir, monthDir));
        archivedCount += archives.length;
      }
    } catch (_error) {
      // Archived dir might not exist
    }

    // Calculate total size (simplified)
    const { spawn } = require('node:child_process');
    const sizeResult = await new Promise<string>((resolve, reject) => {
      const du = spawn('du', ['-sb', this.swarmsPath]);
      let output = '';
      du.stdout.on('data', (data) => {
        output += data;
      });
      du.on('close', (code) =>
        code === 0 ? resolve(output) : reject(new Error(`du failed: ${code}`))
      );
    });

    const sizeStr = sizeResult?.split('\t')[0];
    const totalSizeBytes = sizeStr ? parseInt(sizeStr) : 0;

    return {
      active: activeCount,
      archived: archivedCount,
      totalSizeBytes,
      oldestActive: null, // TODO: Calculate from metadata
      newestActive: null, // TODO: Calculate from metadata
    };
  }

  /**
   * Update swarm access time (for maintenance decisions).
   *
   * @param swarmId
   */
  async touchSwarm(swarmId: string): Promise<void> {
    const metaPath = path.join(this.swarmsPath, 'active', swarmId, 'meta.json');

    try {
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      meta.lastAccessedAt = new Date().toISOString();
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
    } catch (error) {
      logger.warn(`Failed to touch swarm ${swarmId}:`, error);
    }
  }

  /**
   * Manual cleanup of specific swarm.
   *
   * @param swarmId
   */
  async deleteSwarm(swarmId: string): Promise<boolean> {
    const activeDir = path.join(this.swarmsPath, 'active', swarmId);

    try {
      await fs.rm(activeDir, { recursive: true });
      this.emit('swarm:deleted', { swarmId });
      return true;
    } catch (error) {
      logger.error(`Failed to delete swarm ${swarmId}:`, error);
      return false;
    }
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      path.join(this.swarmsPath, 'active'),
      path.join(this.swarmsPath, 'archived'),
      path.join(this.swarmsPath, 'templates'),
      path.join(this.claudeZenPath, 'coordination'),
      path.join(this.claudeZenPath, 'system'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async startMaintenance(): Promise<void> {
    const intervalMs = this.config.maintenanceIntervalHours * 60 * 60 * 1000;

    this.maintenanceTimer = setInterval(async () => {
      try {
        await this.runMaintenance();
      } catch (error) {
        logger.error('Maintenance failed:', error);
        this.emit('maintenance:error', error);
      }
    }, intervalMs);

    // Run initial maintenance
    setTimeout(() => this.runMaintenance(), 5000);
  }

  private async runMaintenance(): Promise<void> {
    this.emit('maintenance:started');

    const archived = await this.archiveInactiveSwarms();
    const deleted = await this.cleanupOldArchives();

    const stats = await this.getStorageStats();

    this.emit('maintenance:completed', {
      archived,
      deleted,
      stats,
    });
  }

  private getArchiveMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Shutdown maintenance system.
   */
  async shutdown(): Promise<void> {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = undefined;
    }
    this.emit('shutdown');
  }
}

export default SwarmMaintenanceManager;
