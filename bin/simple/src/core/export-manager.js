import { EventEmitter } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('UnifiedExport');
export class ExportSystem extends EventEmitter {
    exporters = new Map();
    exportHistory = [];
    initialized = false;
    constructor() {
        super();
        this.registerBuiltInExporters();
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing unified export system');
        this.initialized = true;
        this.emit('initialized');
        logger.info('Unified export system ready');
    }
    registerBuiltInExporters() {
        this.registerExporter('json', {
            name: 'JSON Exporter',
            extension: '.json',
            mimeType: 'application/json',
            description: 'Export data as JSON format',
            export: (data, options) => {
                return options?.pretty !== false
                    ? JSON.stringify(data, null, 2)
                    : JSON.stringify(data);
            },
            validate: (data) => {
                try {
                    JSON.stringify(data);
                    return true;
                }
                catch {
                    return false;
                }
            },
        });
        this.registerExporter('yaml', {
            name: 'YAML Exporter',
            extension: '.yaml',
            mimeType: 'text/yaml',
            description: 'Export data as YAML format',
            export: (data, _options) => {
                return this.convertToYAML(data, 0);
            },
            validate: (data) => data !== undefined && data !== null,
        });
        this.registerExporter('csv', {
            name: 'CSV Exporter',
            extension: '.csv',
            mimeType: 'text/csv',
            description: 'Export array data as CSV format',
            export: (data, _options) => {
                return this.convertToCSV(data);
            },
            validate: (data) => Array.isArray(data) && data.length > 0,
            supports: ['array'],
        });
        this.registerExporter('xml', {
            name: 'XML Exporter',
            extension: '.xml',
            mimeType: 'application/xml',
            description: 'Export data as XML format',
            export: (data, _options) => {
                return `<?xml version="1.0" encoding="UTF-8"?>
      <root>
      ${this.convertToXML(data, 1)}
      </root>`;
            },
            validate: (data) => data !== undefined && data !== null,
        });
        this.registerExporter('markdown', {
            name: 'Markdown Exporter',
            extension: '.md',
            mimeType: 'text/markdown',
            description: 'Export document data as Markdown format',
            export: (data, _options) => {
                return this.convertToMarkdown(data);
            },
            validate: (data) => typeof data === 'object' && data !== null,
        });
        this.registerExporter('txt', {
            name: 'Text Exporter',
            extension: '.txt',
            mimeType: 'text/plain',
            description: 'Export data as plain text format',
            export: (data, _options) => {
                if (typeof data === 'string')
                    return data;
                if (typeof data === 'object')
                    return JSON.stringify(data, null, 2);
                return String(data);
            },
            validate: () => true,
        });
        this.registerExporter('html', {
            name: 'HTML Exporter',
            extension: '.html',
            mimeType: 'text/html',
            description: 'Export data as HTML format',
            export: (data, options) => {
                return this.convertToHTML(data, options);
            },
            validate: (data) => data !== undefined && data !== null,
        });
        logger.info(`Registered ${this.exporters.size} built-in exporters`);
    }
    registerExporter(format, definition) {
        this.exporters.set(format.toLowerCase(), definition);
        logger.info(`Registered custom exporter: ${format}`);
        this.emit('exporter:registered', { format, definition });
    }
    async exportData(data, format, options = {}) {
        const exporter = this.exporters.get(format.toLowerCase());
        if (!exporter) {
            throw new Error(`Unsupported export format: ${format}`);
        }
        const exportId = this.generateId();
        const timestamp = Date.now();
        try {
            if (exporter.validate && !exporter.validate(data)) {
                throw new Error(`Data validation failed for ${format} format`);
            }
            const exportedData = await exporter.export(data, options);
            const size = Buffer.byteLength(exportedData, 'utf8');
            const filename = options?.filename || `export_${timestamp}${exporter.extension}`;
            if (options?.outputPath) {
                const filePath = join(options?.outputPath, filename);
                await mkdir(dirname(filePath), { recursive: true });
                await writeFile(filePath, exportedData, options?.encoding || 'utf8');
            }
            const result = {
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
            logger.info(`Successfully exported data as ${format.toUpperCase()}: ${filename}`);
            return result;
        }
        catch (error) {
            const result = {
                id: exportId,
                format,
                filename: options?.filename || `failed_export_${timestamp}`,
                size: 0,
                timestamp,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            this.exportHistory.push(result);
            this.emit('export:error', result);
            logger.error(`Export failed for format ${format}:`, error);
            throw error;
        }
    }
    async batchExport(data, formats, options = {}) {
        const results = [];
        for (const format of formats) {
            try {
                const result = await this.exportData(data, format, {
                    ...options,
                    ...(options?.filename && {
                        filename: `${options?.filename?.replace(/\.[^/.]+$/, '')}.${format}`,
                    }),
                });
                results.push(result);
            }
            catch (error) {
                logger.error(`Batch export failed for format ${format}:`, error);
            }
        }
        this.emit('export:batch', {
            total: formats.length,
            successful: results.length,
        });
        return results;
    }
    async exportWorkflowData(workflowData, format, options = {}) {
        const documentData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                workflow: 'Vision → ADRs → PRDs → Epics → Features → Tasks → Code',
                totalDocuments: Object.values(workflowData).reduce((sum, docs) => sum + (docs?.length || 0), 0),
            },
            ...workflowData,
        };
        return this.exportData(documentData, format, {
            ...options,
            filename: options?.filename || `workflow_export_${Date.now()}.${format}`,
            metadata: {
                ...options?.metadata,
                type: 'workflow_export',
            },
        });
    }
    async exportSystemStatus(statusData, format, options = {}) {
        const systemExport = {
            timestamp: new Date().toISOString(),
            system: 'Claude Code Zen',
            version: '2.0.0-alpha.73',
            ...statusData,
        };
        return this.exportData(systemExport, format, {
            ...options,
            filename: options?.filename || `system_status_${Date.now()}.${format}`,
            metadata: {
                ...options?.metadata,
                type: 'system_status',
            },
        });
    }
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        const headers = Object.keys(data[0] || {});
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map((header) => {
                const value = row[header];
                if (typeof value === 'string' &&
                    (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    }
    convertToYAML(obj, indent) {
        const spaces = '  '.repeat(indent);
        if (obj === null)
            return 'null';
        if (typeof obj === 'boolean')
            return obj.toString();
        if (typeof obj === 'number')
            return obj.toString();
        if (typeof obj === 'string')
            return `"${obj.replace(/"/g, '\\"')}"`;
        if (Array.isArray(obj)) {
            if (obj.length === 0)
                return '[]';
            return obj
                .map((item) => `${spaces}- ${this.convertToYAML(item, 0)}`)
                .join('\n');
        }
        if (typeof obj === 'object') {
            const entries = Object.entries(obj);
            if (entries.length === 0)
                return '{}';
            return entries
                .map(([key, value]) => `${spaces}${key}: ${this.convertToYAML(value, indent + 1)}`)
                .join('\n');
        }
        return String(obj);
    }
    convertToXML(obj, indent) {
        const spaces = '  '.repeat(indent);
        if (typeof obj === 'string' ||
            typeof obj === 'number' ||
            typeof obj === 'boolean') {
            return `${spaces}<value>${this.escapeXML(String(obj))}</value>`;
        }
        if (Array.isArray(obj)) {
            return obj
                .map((item, index) => `${spaces}<item index="${index}">
      ${this.convertToXML(item, indent + 1)}
      ${spaces}</item>`)
                .join('\n');
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj)
                .map(([key, value]) => `${spaces}<${this.sanitizeXMLTag(key)}>
      ${this.convertToXML(value, indent + 1)}
      ${spaces}</${this.sanitizeXMLTag(key)}>`)
                .join('\n');
        }
        return `${spaces}<value>${this.escapeXML(String(obj))}</value>`;
    }
    convertToMarkdown(data) {
        let markdown = '';
        if (typeof data === 'object' && data !== null) {
            const dataObj = data;
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
                for (const [key, value] of Object.entries(dataObj['metadata'])) {
                    markdown += `- **${key}**: ${value}\n`;
                }
                markdown += '\n';
            }
            if (dataObj['content']) {
                markdown += '## Content\n';
                markdown += `${dataObj['content']}\n`;
            }
            for (const [key, value] of Object.entries(dataObj)) {
                if (Array.isArray(value) && key !== 'metadata') {
                    markdown += `## ${key.charAt(0).toUpperCase() + key.slice(1)}
      \n`;
                    for (const item of value) {
                        if (typeof item === 'object' && item !== null) {
                            const itemObj = item;
                            if (itemObj['title']) {
                                markdown += `### ${itemObj['title']}
      \n`;
                                if (itemObj['description'])
                                    markdown += `${itemObj['description']}
      \n`;
                                if (itemObj['content'])
                                    markdown += `${itemObj['content']}
      \n`;
                            }
                            else {
                                markdown += `- ${JSON.stringify(item)}\n`;
                            }
                        }
                        else {
                            markdown += `- ${typeof item === 'string' ? item : JSON.stringify(item)}\n`;
                        }
                    }
                    markdown += '\n';
                }
            }
        }
        else {
            markdown = String(data);
        }
        return markdown;
    }
    convertToHTML(data, _options) {
        const title = data['title'] || 'Claude Code Zen Export';
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
        const dataObj = data;
        if (dataObj['timestamp'] || dataObj['exportedAt']) {
            html += `<p class="timestamp">Exported: ${new Date(dataObj['timestamp'] || dataObj['exportedAt']).toLocaleString()}</p>`;
        }
        html += this.objectToHTML(data);
        html += `
</body>
</html>`;
        return html;
    }
    objectToHTML(obj, level = 2) {
        let html = '';
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (key === 'title' || key === 'timestamp' || key === 'exportedAt')
                    continue;
                html += `<h${Math.min(level, 6)}>${this.escapeHTML(key.charAt(0).toUpperCase() + key.slice(1))}</h${Math.min(level, 6)}>`;
                if (Array.isArray(value)) {
                    for (const item of value) {
                        html += '<div class="array-item">';
                        if (typeof item === 'object' && item !== null) {
                            const itemObj = item;
                            if (itemObj['title']) {
                                html += `<strong>${this.escapeHTML(String(itemObj['title']))}</strong><br>`;
                            }
                        }
                        html += this.objectToHTML(item, level + 1);
                        html += '</div>';
                    }
                }
                else if (typeof value === 'object') {
                    html += '<div class="metadata">';
                    html += this.objectToHTML(value, level + 1);
                    html += '</div>';
                }
                else if (typeof value === 'string' && value.length > 100) {
                    html += `<pre>${this.escapeHTML(value)}</pre>`;
                }
                else {
                    html += `<p>${this.escapeHTML(String(value))}</p>`;
                }
            }
        }
        else {
            html += `<p>${this.escapeHTML(String(obj))}</p>`;
        }
        return html;
    }
    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    sanitizeXMLTag(tag) {
        return tag.replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    generateId() {
        return `export-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    getAvailableFormats() {
        return Array.from(this.exporters.entries()).map(([format, exporter]) => ({
            format,
            name: exporter.name,
            extension: exporter.extension,
            mimeType: exporter.mimeType,
            description: exporter.description,
            ...(exporter.supports && { supports: exporter.supports }),
        }));
    }
    getExportHistory(limit) {
        const history = [...this.exportHistory].sort((a, b) => b.timestamp - a.timestamp);
        return limit ? history.slice(0, limit) : history;
    }
    getExportStats() {
        const stats = {
            totalExports: this.exportHistory.length,
            successfulExports: this.exportHistory.filter((e) => e.success).length,
            failedExports: this.exportHistory.filter((e) => !e.success).length,
            formatBreakdown: {},
            totalSize: 0,
            averageSize: 0,
        };
        for (const record of this.exportHistory) {
            if (record.success) {
                stats.formatBreakdown[record.format] =
                    (stats.formatBreakdown[record.format] || 0) + 1;
                stats.totalSize += record.size;
            }
        }
        stats.averageSize =
            stats.successfulExports > 0
                ? stats.totalSize / stats.successfulExports
                : 0;
        return stats;
    }
    clearHistory() {
        this.exportHistory = [];
        this.emit('history:cleared');
    }
    getMetrics() {
        return this.getExportStats();
    }
    async shutdown() {
        logger.info('Shutting down unified export system...');
        this.removeAllListeners();
        this.initialized = false;
        this.emit('shutdown');
        logger.info('Unified export system shutdown complete');
    }
}
//# sourceMappingURL=export-manager.js.map