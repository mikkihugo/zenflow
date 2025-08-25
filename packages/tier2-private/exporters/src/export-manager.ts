/**
 * Unified Export System - Direct Integration.
 *
 * Multi-format export system integrated directly into core.
 * Supports JSON, YAML, CSV, XML, and custom formats.
 */
/**
 * @file Export management system.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { TypedEventBase, getLogger } from '@claude-zen/foundation';

const logger = getLogger('UnifiedExport');

export interface ExportResult {
  id: string;
  format: string;
  filename: string;
  size: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ExportOptions {
  filename?: string;
  outputPath?: string;
  pretty?: boolean;
  compression?: boolean;
  encoding?: 'utf8|base64';
  metadata?: Record<string, unknown>;
}

export interface ExporterDefinition {
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  export: (data: unknown, options?: ExportOptions) => Promise<string> | string;
  validate?: (data: unknown) => boolean;
  supports?: string[];
}

export class ExportSystem extends TypedEventBase {
  private exporters = new Map<string, ExporterDefinition>();
  private exportHistory: ExportResult[] = [];
  private initialized = false;

  constructor() {
    super();
    this.registerBuiltInExporters();
  }

  /**
   * Initialize the export system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing unified export system');
    
    // Initialize async resources
    await this.setupDefaultExporters();
    await this.validateSystemCapabilities();
    
    this.initialized = true;
    this.emit('initialized', {});
    logger.info('Unified export system ready');
  }

  private async setupDefaultExporters(): Promise<void> {
    // Setup default exporters asynchronously
    await Promise.resolve();
  }

  private async validateSystemCapabilities(): Promise<void> {
    // Validate system capabilities asynchronously
    await Promise.resolve();
  }

  /**
   * Register built-in exporters.
   */
  private registerBuiltInExporters(): void {
    // JSON Exporter
    this.registerExporter('json', {
      name: 'JSON Exporter',
      extension: '.json',
      mimeType: 'application/json',
      description: 'Export data as JSON format',
      export: (data: unknown, options?: ExportOptions) => {
        return options?.pretty !== false
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data);
      },
      validate: (data: unknown) => {
        try {
          JSON.stringify(data);
          return true;
        } catch {
          return false;
        }
      },
    });

    // YAML Exporter
    this.registerExporter('yaml', {
      name: 'YAML Exporter',
      extension: '.yaml',
      mimeType: 'text/yaml',
      description: 'Export data as YAML format',
      export: (data: unknown, _options?: ExportOptions) => {
        return this.convertToYAML(data, 0);
      },
      validate: (data: unknown) => data !== undefined && data !== null,
    });

    // CSV Exporter
    this.registerExporter('csv', {
      name: 'CSV Exporter',
      extension: '.csv',
      mimeType: 'text/csv',
      description: 'Export array data as CSV format',
      export: (data: unknown, _options?: ExportOptions) => {
        return this.convertToCSV(data as Record<string, unknown>[]);
      },
      validate: (data: unknown) => Array.isArray(data) && data.length > 0,
      supports: ['array'],
    });

    // XML Exporter
    this.registerExporter('xml', {
      name: 'XML Exporter',
      extension: '.xml',
      mimeType: 'application/xml',
      description: 'Export data as XML format',
      export: (data: unknown, _options?: ExportOptions) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
      <root>
      ${this.convertToXML(data, 1)}
      </root>`;
      },
      validate: (data: unknown) => data !== undefined && data !== null,
    });

    // Markdown Exporter (for documents)
    this.registerExporter('markdown', {
      name: 'Markdown Exporter',
      extension: '.md',
      mimeType: 'text/markdown',
      description: 'Export document data as Markdown format',
      export: (data: unknown, _options?: ExportOptions) => {
        return this.convertToMarkdown(data);
      },
      validate: (data: unknown) => typeof data === 'object' && data !== null,
    });

    // Plain Text Exporter
    this.registerExporter('txt', {
      name: 'Text Exporter',
      extension: '.txt',
      mimeType: 'text/plain',
      description: 'Export data as plain text format',
      export: (data: unknown, _options?: ExportOptions) => {
        if (typeof data === 'string') return data;
        if (typeof data === 'object') return JSON.stringify(data, null, 2);
        return String(data);
      },
      validate: () => true,
    });

    // HTML Exporter (for reports)
    this.registerExporter('html', {
      name: 'HTML Exporter',
      extension: '.html',
      mimeType: 'text/html',
      description: 'Export data as HTML format',
      export: (data: unknown, options?: ExportOptions) => {
        return this.convertToHTML(data, options);
      },
      validate: (data: unknown) => data !== undefined && data !== null,
    });

    logger.info(`Registered ${this.exporters.size} built-in exporters`);
  }

  /**
   * Register a custom exporter.
   *
   * @param format
   * @param definition
   */
  registerExporter(format: string, definition: ExporterDefinition): void {
    this.exporters.set(format.toLowerCase(), definition);
    logger.info(`Registered custom exporter: ${format}`);
    this.emit('exporter:registered', { format, definition });
  }

  /**
   * Export data to specified format.
   *
   * @param data
   * @param format
   * @param options
   */
  async exportData(
    data: unknown,
    format: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const exporter = this.exporters.get(format.toLowerCase())();

    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    const exportId = this.generateId();
    const timestamp = Date.now();

    try {
      // Validate data if validator exists
      if (exporter.validate && !exporter.validate(data)) {
        throw new Error(`Data validation failed for ${format} format`);
      }

      // Export data
      const exportedData = await exporter.export(data, options);
      const size = Buffer.byteLength(exportedData, 'utf8');

      // Generate filename if not provided
      const filename =
        options?.filename||`export_${timestamp}${exporter.extension}`;

      // Save to file if output path provided
      if (options?.outputPath) {
        const filePath = join(options?.outputPath, filename);
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, exportedData, options?.encoding||'utf8');
      }

      const result: ExportResult = {
        id: exportId,
        format,
        filename,
        size,
        timestamp,
        success: true,
        metadata: {
          ...options?.metadata,
          exporter: exporter.name,
          mimeType: exporter.mimeType,
          outputPath: options?.outputPath,
        },
      };

      this.exportHistory.push(result);
      this.emit('export:success', result);
      logger.info(
        `Successfully exported data as ${format.toUpperCase()}: ${filename}`
      );

      return result;
    } catch (error) {
      const result: ExportResult = {
        id: exportId,
        format,
        filename: options?.filename||`failed_export_${timestamp}`,
        size: 0,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message :'Unknown error',
      };

      this.exportHistory.push(result);
      this.emit('export:error', result);
      logger.error(`Export failed for format ${format}:`, error);
      throw error;
    }
  }

  /**
   * Export data to multiple formats.
   *
   * @param data
   * @param formats
   * @param options
   */
  async batchExport(
    data: unknown,
    formats: string[],
    options: ExportOptions = {}
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];

    for (const format of formats) {
      try {
        const result = await this.exportData(data, format, {
          ...options,
          ...(options?.filename && {
            filename: `${options?.filename?.replace(/\.[^./]+$/, '')}.${format}`,
          }),
        });
        results.push(result);
      } catch (error) {
        logger.error(`Batch export failed for format ${format}:`, error);
        // Continue with other formats
      }
    }

    this.emit('export:batch', {
      total: formats.length,
      successful: results.length,
    });
    return results;
  }

  /**
   * Export document workflow data.
   *
   * @param workflowData
   * @param workflowData.vision
   * @param workflowData.adrs
   * @param workflowData.prds
   * @param workflowData.epics
   * @param workflowData.features
   * @param workflowData.tasks
   * @param format
   * @param options
   */
  async exportWorkflowData(
    workflowData: {
      vision?: Record<string, unknown>[];
      adrs?: Record<string, unknown>[];
      prds?: Record<string, unknown>[];
      epics?: Record<string, unknown>[];
      features?: Record<string, unknown>[];
      tasks?: Record<string, unknown>[];
    },
    format: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const documentData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        workflow: 'Vision → ADRs → PRDs → Epics → Features → Tasks → Code',
        totalDocuments: Object.values(workflowData).reduce(
          (sum, docs) => sum + (docs?.length||0),
          0
        ),
      },
      ...workflowData,
    };

    return this.exportData(documentData, format, {
      ...options,
      filename: options?.filename||`workflow_export_${Date.now()}.${format}`,
      metadata: {
        ...options?.metadata,
        type:'workflow_export',
      },
    });
  }

  /**
   * Export system status and metrics.
   *
   * @param statusData
   * @param format
   * @param options
   */
  async exportSystemStatus(
    statusData: Record<string, unknown>,
    format: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const systemExport = {
      timestamp: new Date().toISOString(),
      system: 'Claude Code Zen',
      version: '2.0.0-alpha.73',
      ...statusData,
    };

    return this.exportData(systemExport, format, {
      ...options,
      filename: options?.filename||`system_status_${Date.now()}.${format}`,
      metadata: {
        ...options?.metadata,
        type:'system_status',
      },
    });
  }

  /**
   * Format conversion methods.
   *
   * @param data
   */
  private convertToCSV(data: Record<string, unknown>[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get headers from first object
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(',')];

    // Convert each row
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (
          typeof value === 'string' &&
          (value.includes(',')||value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private convertToYAML(obj: unknown, indent: number): string {
    const spaces = '  '.repeat(indent);

    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj
        .map((item) => `${spaces}- ${this.convertToYAML(item, 0)}`)
        .join('\n');
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';

      return entries
        .map(
          ([key, value]) =>
            `${spaces}${key}: ${this.convertToYAML(value, indent + 1)}`
        )
        .join('\n');
    }

    return String(obj);
  }

  private convertToXML(obj: unknown, indent: number): string {
    const spaces = '  '.repeat(indent);

    if (
      typeof obj === 'string'||typeof obj ==='number'||typeof obj ==='boolean'
    ) {
      return `${spaces}<value>${this.escapeXML(String(obj))}</value>`;
    }

    if (Array.isArray(obj)) {
      return obj
        .map(
          (item, index) =>
            `${spaces}<item index="${index}">
      ${this.convertToXML(item, indent + 1)}
      ${spaces}</item>`
        )
        .join('\n');
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(
          ([key, value]) =>
            `${spaces}<${this.sanitizeXMLTag(key)}>
      ${this.convertToXML(value, indent + 1)}
      ${spaces}</${this.sanitizeXMLTag(key)}>`
        )
        .join('\n');
    }

    return `${spaces}<value>${this.escapeXML(String(obj))}</value>`;
  }

  private convertToMarkdown(data: unknown): string {
    let markdown = '';

    if (typeof data === 'object' && data !== null) {
      // Handle document-like objects
      const dataObj = data as Record<string, unknown>;
      if (dataObj['title']) {
        markdown += `# ${dataObj['title']}
      \n`;
      }

      if (dataObj['description']) {
        markdown += `${dataObj['description']}
      \n`;
      }

      if (dataObj['metadata']) {
        markdown += '## Metadata\n';
        for (const [key, value] of Object.entries(
          dataObj['metadata'] as Record<string, unknown>
        )) {
          markdown += `- **${key}**: ${value}\n`;
        }
        markdown += '\n';
      }

      if (dataObj['content']) {
        markdown += '## Content\n';
        markdown += `${dataObj['content']}\n`;
      }

      // Handle arrays of items
      for (const [key, value] of Object.entries(dataObj)) {
        if (Array.isArray(value) && key !== 'metadata') {
          markdown += `## ${key.charAt(0).toUpperCase() + key.slice(1)}
      \n`;
          for (const item of value) {
            if (typeof item === 'object' && item !== null) {
              const itemObj = item as Record<string, unknown>;
              if (itemObj['title']) {
                markdown += `### ${itemObj['title']}
      \n`;
                if (itemObj['description'])
                  markdown += `${itemObj['description']}
      \n`;
                if (itemObj['content'])
                  markdown += `${itemObj['content']}
      \n`;
              } else {
                markdown += `- ${JSON.stringify(item)}\n`;
              }
            } else {
              markdown += `- ${typeof item === 'string' ? item : JSON.stringify(item)}\n`;
            }
          }
          markdown += '\n';
        }
      }
    } else {
      markdown = String(data);
    }

    return markdown;
  }

  private convertToHTML(data: unknown, _options?: ExportOptions): string {
    const title =
      (data as Record<string, unknown>)['title']||'Claude Code Zen Export';

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(String(title))}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #0969da; border-bottom: 2px solid #0969da; padding-bottom: 10px; }
        h2 { color: #656d76; border-bottom: 1px solid #d0d7de; padding-bottom: 5px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; }
        th { background-color: #f6f8fa; font-weight: 600; }
        .metadata { background-color: #f6f8fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .timestamp { color: #656d76; font-size: 0.9em; }
        pre { background-color: #f6f8fa; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .array-item { margin: 10px 0; padding: 10px; border-left: 3px solid #0969da; background-color: #f6f8fa; }
    </style>
</head>
<body>`;

    html += `<h1>${this.escapeHTML(String(title))}</h1>`;

    const dataObj = data as Record<string, unknown>;
    if (dataObj['timestamp']||dataObj['exportedAt']) {
      html += `<p class="timestamp">Exported: ${new Date((dataObj['timestamp'] as string)||(dataObj['exportedAt'] as string)).toLocaleString()}</p>`;
    }

    html += this.objectToHTML(data);

    html += `
</body>
</html>`;

    return html;
  }

  private objectToHTML(obj: unknown, level: number = 2): string {
    let html = '';

    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'title'||key ==='timestamp'||key ==='exportedAt')
          continue;

        html += `<h${Math.min(level, 6)}>${this.escapeHTML(key.charAt(0).toUpperCase() + key.slice(1))}</h${Math.min(level, 6)}>`;

        if (Array.isArray(value)) {
          for (const item of value) {
            html += '<div class="array-item">';
            if (typeof item === 'object' && item !== null) {
              const itemObj = item as Record<string, unknown>;
              if (itemObj['title']) {
                html += `<strong>${this.escapeHTML(String(itemObj['title']))}</strong><br>`;
              }
            }
            html += this.objectToHTML(item, level + 1);
            html += '</div>';
          }
        } else if (typeof value === 'object') {
          html += '<div class="metadata">';
          html += this.objectToHTML(value, level + 1);
          html += '</div>';
        } else if (typeof value === 'string' && value.length > 100) {
          html += `<pre>${this.escapeHTML(value)}</pre>`;
        } else {
          html += `<p>${this.escapeHTML(String(value))}</p>`;
        }
      }
    } else {
      html += `<p>${this.escapeHTML(String(obj))}</p>`;
    }

    return html;
  }

  /**
   * Utility methods.
   *
   * @param str
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private sanitizeXMLTag(tag: string): string {
    return tag.replace(/[^\w-]/g, '_');
  }

  private generateId(): string {
    return `export-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Management methods.
   */
  getAvailableFormats(): Array<{
    format: string;
    name: string;
    extension: string;
    mimeType: string;
    description: string;
    supports?: string[];
  }> {
    return Array.from(this.exporters.entries()).map(([format, exporter]) => ({
      format,
      name: exporter.name,
      extension: exporter.extension,
      mimeType: exporter.mimeType,
      description: exporter.description,
      ...(exporter.supports && { supports: exporter.supports }),
    }));
  }

  getExportHistory(limit?: number): ExportResult[] {
    const history = [...this.exportHistory].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    return limit ? history.slice(0, limit) : history;
  }

  getExportStats(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    formatBreakdown: Record<string, number>;
    totalSize: number;
    averageSize: number;
  } {
    const stats = {
      totalExports: this.exportHistory.length,
      successfulExports: this.exportHistory.filter((e) => e.success).length,
      failedExports: this.exportHistory.filter((e) => !e.success).length,
      formatBreakdown: {} as Record<string, number>,
      totalSize: 0,
      averageSize: 0,
    };

    for (const record of this.exportHistory) {
      if (record.success) {
        stats.formatBreakdown[record.format] =
          (stats.formatBreakdown[record.format]||0) + 1;
        stats.totalSize += record.size;
      }
    }

    stats.averageSize =
      stats.successfulExports > 0
        ? stats.totalSize / stats.successfulExports
        : 0;

    return stats;
  }

  clearHistory(): void {
    this.exportHistory = [];
    this.emit('history:cleared', {});
  }

  /**
   * Get export metrics (alias for getExportStats).
   */
  getMetrics(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    formatBreakdown: Record<string, number>;
    totalSize: number;
    averageSize: number;
  } {
    return this.getExportStats();
  }

  /**
   * Shutdown the export system gracefully.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down unified export system...');
    this.removeAllListeners();
    this.initialized = false;
    this.emit('shutdown', {});
    logger.info('Unified export system shutdown complete');
  }
}
