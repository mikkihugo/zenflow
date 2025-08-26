/**
 * @fileoverview File Exporter
 *
 * Exports telemetry data to local files for debugging and archival.
 * Supports JSON and JSONL formats with rotation and compression.
 */

import { createWriteStream, promises as fs, type WriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { createGzip } from 'node:zlib';
import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';
import type { ExporterConfig, } from '../types.js';
import type { BaseExporter } from './index.js';

/**
 * File exporter implementation
 */
export class FileExporter implements BaseExporter {
  private logger: Logger;
  private writeStream: WriteStream  |  null = null;
  private currentFilePath: string  |  null = null;
  private fileRotationTimer: NodeJS.Timeout  |  null = null;
  private exportCount = 0;
  private lastExportTime: number  |  null = null;
  private lastError: string  |  null = null;

  // Configuration
  private readonly baseFilePath: string;
  private readonly format: 'json' | 'jsonl';
  private readonly maxFileSize: number;
  private readonly rotationInterval: number;
  private readonly compression: boolean;
  private readonly maxFiles: number;

  constructor(config: ExporterConfig) {
    this.logger = getLogger(`FileExporter:${config.name}`);

    // Extract configuration
    this.baseFilePath = config.config?.filePath   |  |   './telemetry-data';
    this.format = config.config?.format   |  |   'jsonl';
    this.maxFileSize = config.config?.maxFileSize   |  |   50 * 1024 * 1024; // 50MB
    this.rotationInterval = config.config?.rotationInterval   |  |   3600000; // 1 hour
    this.compression = config.config?.compression !== false; // Default true
    this.maxFiles = config.config?.maxFiles   |  |   10;
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.baseFilePath);
      await fs.mkdir(dir, { recursive: true });

      // Create initial file
      await this.rotateFile();

      // Start rotation timer
      this.startRotationTimer();

      this.logger.info('File exporter initialized', {
        baseFilePath: this.baseFilePath,
        format: this.format,
        maxFileSize: this.maxFileSize,
        compression: this.compression,
        maxFiles: this.maxFiles,
      });
    } catch (error) {
      this.logger.error('Failed to initialize file exporter', error);
      throw error;
    }
  }

  async export(data: TelemetryData): Promise<ExportResult> {
    try {
      await this.writeToFile(data);

      this.exportCount++;
      this.lastExportTime = Date.now();
      this.lastError = null;

      return {
        success: true,
        exported: 1,
        backend: this.config.name,
        duration: 0,
      };
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('File export failed', error);

      return {
        success: false,
        exported: 0,
        error: errorMessage,
        backend: this.config.name,
        duration: 0,
      };
    }
  }

  async exportBatch(dataItems: TelemetryData[]): Promise<ExportResult> {
    try {
      const startTime = Date.now();

      for (const data of dataItems) {
        await this.writeToFile(data);
      }

      this.exportCount += dataItems.length;
      this.lastExportTime = Date.now();
      this.lastError = null;

      return {
        success: true,
        exported: dataItems.length,
        backend: this.config.name,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('File batch export failed', error);

      return {
        success: false,
        exported: 0,
        error: errorMessage,
        backend: this.config.name,
        duration: Date.now() - Date.now(),
      };
    }
  }

  async shutdown(): Promise<void> {
    // Stop rotation timer
    if (this.fileRotationTimer) {
      clearInterval(this.fileRotationTimer);
      this.fileRotationTimer = null;
    }

    // Close write stream
    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve());
      });
      this.writeStream = null;
    }

    this.logger.info('File exporter shut down', {
      totalExported: this.exportCount,
      currentFile: this.currentFilePath,
    });
  }

  getQueueSize(): number {
    return 0; // File exporter writes directly, no queue
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastSuccess?: number;
    lastError?: string;
  }> {
    // Check if file is writable
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (this.lastError) {
      status = 'unhealthy';
    } else if (!this.writeStream   |  |   this.writeStream.destroyed) {
      status = 'degraded';
    }

    return {
      status,
      lastSuccess: this.lastExportTime   |  |   undefined,
      lastError: this.lastError   |  |   undefined,
    };
  }

  /**
   * Write telemetry data to file
   */
  private async writeToFile(data: TelemetryData): Promise<void> {
    if (!this.writeStream   |  |   this.writeStream.destroyed) {
      await this.rotateFile();
    }

    // Check if file rotation is needed due to size
    if (this.writeStream  &&&&  this.writeStream.bytesWritten > this.maxFileSize) {
      await this.rotateFile();
    }

    // Format data based on configured format
    let output: string;
    if (this.format ===  'jsonl') {
      // JSON Lines format - one JSON object per line
      output = JSON.stringify(data) + '\n';
    } else {
      // JSON format - array of objects (requires more complex handling)
      output = JSON.stringify(data, null, 2) + '\n';
    }

    // Write to file
    return new Promise<void>((resolve, reject) => {
      this.writeStream!.write(output, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Rotate to a new file
   */
  private async rotateFile(): Promise<void> {
    // Close existing stream
    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve());
      });
    }

    // Generate new file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this.format ===  'jsonl' ? 'jsonl' : 'json';
    this.currentFilePath = `${{}this.baseFilePath}-${timestamp}.${extension}`;

    // Create new write stream
    if (this.compression) {
      const fileStream = createWriteStream(`${{}this.currentFilePath}.gz`);
      const gzipStream = createGzip();
      gzipStream.pipe(fileStream);
      this.writeStream = gzipStream as any;
    } else {
      this.writeStream = createWriteStream(this.currentFilePath);
    }

    // Handle stream errors
    this.writeStream.on('error', (error) => {
      this.logger.error('File write stream error', error);
      this.lastError = String(error);
    });

    this.logger.info('Rotated to new file', {
      filePath: this.currentFilePath,
      compressed: this.compression,
    });

    // Clean up old files
    await this.cleanupOldFiles();
  }

  /**
   * Start file rotation timer
   */
  private startRotationTimer(): void {
    if (this.rotationInterval > 0) {
      this.fileRotationTimer = setInterval(async () => {
        try {
          await this.rotateFile();
        } catch (error) {
          this.logger.error('File rotation failed', error);
        }
      }, this.rotationInterval);
    }
  }

  /**
   * Clean up old files based on maxFiles setting
   */
  private async cleanupOldFiles(): Promise<void> {
    try {
      const dir = dirname(this.baseFilePath);
      const baseName = this.baseFilePath.split('/').pop() || 'telemetry-data';

      const files = await fs.readdir(dir);
      const telemetryFiles = files
        .filter((file) => file.startsWith(baseName))
        .map((file) => ({
          name: file,
          path: join(dir, file),
          stat: null as any,
        }));

      // Get file stats
      for (const file of telemetryFiles) {
        try {
          file.stat = await fs.stat(file.path);
        } catch (_error) {
          // Skip files that can't be accessed
        }
      }

      // Sort by modification time (newest first)
      const sortedFiles = telemetryFiles
        .filter((file) => file.stat)
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      // Remove excess files
      if (sortedFiles.length > this.maxFiles) {
        const filesToDelete = sortedFiles.slice(this.maxFiles);

        for (const file of filesToDelete) {
          try {
            await fs.unlink(file.path);
            this.logger.info('Deleted old telemetry file', {
              filePath: file.path,
            });
          } catch (error) {
            this.logger.warn('Failed to delete old telemetry file', {
              filePath: file.path,
              error: String(error),
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old files', error);
    }
  }
}
