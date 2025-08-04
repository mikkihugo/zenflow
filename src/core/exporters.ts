/**
 * Export System
 * Handles exporting data and configurations in various formats
 * Migrated from plugins to utils domain
 */

import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

export interface ExportResult {
  success: boolean;
  filePath?: string;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface ExportConfig {
  format: 'json' | 'csv' | 'yaml' | 'xml' | 'markdown';
  outputPath?: string;
  fileName?: string;
  options?: Record<string, any>;
}

export class ExportSystem {
  private exporters = new Map<string, any>();
  private exportHistory: ExportResult[] = [];

  constructor() {
    this.setupExporters();
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
      mimeType: 'application/x-yaml',
      export: (data: any) => this.convertToYAML(data),
    });

    // XML exporter
    this.exporters.set('xml', {
      name: 'XML Exporter',
      extension: '.xml',
      mimeType: 'application/xml',
      export: (data: any) => this.convertToXML(data),
    });

    // Markdown exporter
    this.exporters.set('markdown', {
      name: 'Markdown Exporter',
      extension: '.md',
      mimeType: 'text/markdown',
      export: (data: any) => this.convertToMarkdown(data),
    });
  }

  async exportData(data: any, config: ExportConfig): Promise<ExportResult> {
    const timestamp = Date.now();

    try {
      const exporter = this.exporters.get(config.format);
      if (!exporter) {
        throw new Error(`Unsupported export format: ${config.format}`);
      }

      const exportedData = exporter.export(data);

      if (config.outputPath && config.fileName) {
        const filePath = path.join(config.outputPath, config.fileName + exporter.extension);

        // Ensure directory exists
        await mkdir(path.dirname(filePath), { recursive: true });

        // Write file
        await writeFile(filePath, exportedData, 'utf8');

        const result: ExportResult = {
          success: true,
          filePath,
          timestamp,
        };

        this.exportHistory.push(result);
        return result;
      } else {
        const result: ExportResult = {
          success: true,
          data: exportedData,
          timestamp,
        };

        this.exportHistory.push(result);
        return result;
      }
    } catch (error) {
      const result: ExportResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
      };

      this.exportHistory.push(result);
      return result;
    }
  }

  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() || '';
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private convertToYAML(data: any): string {
    // Simple YAML conversion - in production, use a proper YAML library
    const yamlify = (obj: any, indent = 0): string => {
      const spaces = '  '.repeat(indent);

      if (obj === null || obj === undefined) {
        return 'null';
      }

      if (typeof obj === 'string') {
        return obj.includes('\n') ? `|\n${spaces}  ${obj.replace(/\n/g, `\n${spaces}  `)}` : obj;
      }

      if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj.toString();
      }

      if (Array.isArray(obj)) {
        return obj
          .map((item) => `${spaces}- ${yamlify(item, indent + 1).replace(/^\s+/, '')}`)
          .join('\n');
      }

      if (typeof obj === 'object') {
        return Object.entries(obj)
          .map(
            ([key, value]) => `${spaces}${key}: ${yamlify(value, indent + 1).replace(/^\s+/, '')}`
          )
          .join('\n');
      }

      return obj.toString();
    };

    return yamlify(data);
  }

  private convertToXML(data: any): string {
    const xmlify = (obj: any, name = 'root'): string => {
      if (obj === null || obj === undefined) {
        return `<${name}></${name}>`;
      }

      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return `<${name}>${obj}</${name}>`;
      }

      if (Array.isArray(obj)) {
        return `<${name}>${obj.map((item) => xmlify(item, 'item')).join('')}</${name}>`;
      }

      if (typeof obj === 'object') {
        const content = Object.entries(obj)
          .map(([key, value]) => xmlify(value, key))
          .join('');
        return `<${name}>${content}</${name}>`;
      }

      return `<${name}>${obj}</${name}>`;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
      ${xmlify(data)}`;
  }

  private convertToMarkdown(data: any): string {
    const mdify = (obj: any, level = 1): string => {
      if (obj === null || obj === undefined) {
        return '';
      }

      if (typeof obj === 'string') {
        return obj;
      }

      if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj.toString();
      }

      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && !Array.isArray(obj[0])) {
          // Convert array of objects to table
          const headers = Object.keys(obj[0]);
          const headerRow = `| ${headers.join(' | ')} |`;
          const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
          const dataRows = obj.map(
            (item) => `| ${headers.map((header) => item[header]?.toString() || '').join(' | ')} |`
          );
          return [headerRow, separatorRow, ...dataRows].join('\n');
        } else {
          // Convert to list
          return obj.map((item) => `- ${mdify(item, level + 1)}`).join('\n');
        }
      }

      if (typeof obj === 'object') {
        return Object.entries(obj)
          .map(([key, value]) => {
            const heading = '#'.repeat(level);
            return `${heading} ${key}
      \n${mdify(value, level + 1)}`;
          })
          .join('\n');
      }

      return obj.toString();
    };

    return mdify(data);
  }

  getExportHistory(): ExportResult[] {
    return [...this.exportHistory];
  }

  clearHistory(): void {
    this.exportHistory = [];
  }

  getSupportedFormats(): string[] {
    return Array.from(this.exporters.keys());
  }

  getExporterInfo(format: string): any {
    return this.exporters.get(format);
  }
}

// Utility functions for direct export
export const ExportUtils = {
  /**
   * Quick JSON export
   */
  toJSON: (data: any): string => JSON.stringify(data, null, 2),

  /**
   * Quick CSV export for arrays
   */
  toCSV: (data: any[]): string => {
    const system = new ExportSystem();
    return system.convertToCSV(data);
  },

  /**
   * Quick YAML export
   */
  toYAML: (data: any): string => {
    const system = new ExportSystem();
    return system.convertToYAML(data);
  },

  /**
   * Quick XML export
   */
  toXML: (data: any): string => {
    const system = new ExportSystem();
    return system.convertToXML(data);
  },

  /**
   * Quick Markdown export
   */
  toMarkdown: (data: any): string => {
    const system = new ExportSystem();
    return system.convertToMarkdown(data);
  },
};

export default ExportSystem;
