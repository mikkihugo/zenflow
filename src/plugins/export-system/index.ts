/**
 * Export System Plugin
 * Handles exporting data and configurations in various formats
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginConfig, PluginContext, PluginManifest } from '../types.js';

export class ExportSystemPlugin extends BasePlugin {
  private exporters = new Map();
  private exportHistory: any[] = [];

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Export System Plugin initialized');
    this.setupExporters();
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Export System Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Export System Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  private setupExporters(): void {
    // JSON exporter
    this.exporters.set('json', {
      name: 'JSON Exporter',
      extension: '.json',
      mimeType: 'application/json',
      export: (data: any) => JSON.stringify(data, null, 2),
    });

    // CSV exporter
    this.exporters.set('csv', {
      name: 'CSV Exporter',
      extension: '.csv',
      mimeType: 'text/csv',
      export: (data: any[]) => this.convertToCSV(data),
    });

    // YAML exporter
    this.exporters.set('yaml', {
      name: 'YAML Exporter',
      extension: '.yaml',
      mimeType: 'text/yaml',
      export: (data: any) => this.convertToYAML(data),
    });

    // XML exporter
    this.exporters.set('xml', {
      name: 'XML Exporter',
      extension: '.xml',
      mimeType: 'application/xml',
      export: (data: any) => this.convertToXML(data),
    });
  }

  /**
   * Export data in specified format
   */
  async exportData(data: any, format: string, options: any = {}): Promise<any> {
    const exporter = this.exporters.get(format.toLowerCase());

    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    try {
      const exportedData = exporter.export(data);
      const exportRecord = {
        id: this.generateId(),
        format,
        timestamp: new Date(),
        size: exportedData.length,
        filename: options.filename || `export_${Date.now()}${exporter.extension}`,
        success: true,
      };

      this.exportHistory.push(exportRecord);
      this.context.logger.info(`Successfully exported data as ${format.toUpperCase()}`);

      return {
        data: exportedData,
        metadata: exportRecord,
        mimeType: exporter.mimeType,
      };
    } catch (error) {
      const errorRecord = {
        id: this.generateId(),
        format,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };

      this.exportHistory.push(errorRecord);
      this.context.logger.error(`Export failed for format ${format}`, error);
      throw error;
    }
  }

  /**
   * Export multiple datasets
   */
  async batchExport(
    datasets: Array<{ data: any; format: string; filename?: string }>
  ): Promise<any[]> {
    const results: any[] = [];

    for (const dataset of datasets) {
      try {
        const result = await this.exportData(dataset.data, dataset.format, {
          filename: dataset.filename,
        });
        results.push(result);
      } catch (error) {
        results.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          format: dataset.format,
          filename: dataset.filename,
        });
      }
    }

    return results;
  }

  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Convert each row
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private convertToYAML(data: any): string {
    // Simple YAML conversion (in real implementation, would use yaml library)
    return this.objectToYAML(data, 0);
  }

  private objectToYAML(obj: any, indent: number): string {
    const spaces = '  '.repeat(indent);

    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;

    if (Array.isArray(obj)) {
      return obj.map((item) => `${spaces}- ${this.objectToYAML(item, 0)}`).join('\n');
    }

    if (typeof obj === 'object') {
      return Object.entries(obj)
        .map(([key, value]) => `${spaces}${key}: ${this.objectToYAML(value, indent + 1)}`)
        .join('\n');
    }

    return String(obj);
  }

  private convertToXML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${this.objectToXML(data, 1)}\n</root>`;
  }

  private objectToXML(obj: any, indent: number): string {
    const spaces = '  '.repeat(indent);

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return `${spaces}<value>${obj}</value>`;
    }

    if (Array.isArray(obj)) {
      return obj
        .map(
          (item, index) =>
            `${spaces}<item index="${index}">\n${this.objectToXML(item, indent + 1)}\n${spaces}</item>`
        )
        .join('\n');
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(
          ([key, value]) =>
            `${spaces}<${key}>\n${this.objectToXML(value, indent + 1)}\n${spaces}</${key}>`
        )
        .join('\n');
    }

    return `${spaces}<value>${String(obj)}</value>`;
  }

  /**
   * Get export history
   */
  getExportHistory(): any[] {
    return [...this.exportHistory];
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): any[] {
    return Array.from(this.exporters.entries()).map(([key, exporter]) => ({
      format: key,
      name: exporter.name,
      extension: exporter.extension,
      mimeType: exporter.mimeType,
    }));
  }

  /**
   * Register custom exporter
   */
  registerExporter(format: string, exporter: any): void {
    this.exporters.set(format, exporter);
    this.context.logger.info(`Registered custom exporter: ${format}`);
  }

  /**
   * Get export statistics
   */
  getExportStats(): any {
    const stats = {
      totalExports: this.exportHistory.length,
      successfulExports: this.exportHistory.filter((e) => e.success).length,
      failedExports: this.exportHistory.filter((e) => !e.success).length,
      formatBreakdown: {} as any,
      totalSize: 0,
    };

    for (const record of this.exportHistory) {
      if (record.success) {
        stats.formatBreakdown[record.format] = (stats.formatBreakdown[record.format] || 0) + 1;
        stats.totalSize += record.size || 0;
      }
    }

    return stats;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async cleanup(): Promise<void> {
    this.exporters.clear();
    this.exportHistory.length = 0;
    this.context.logger.info('Export System Plugin cleaned up');
  }
}

export default ExportSystemPlugin;
