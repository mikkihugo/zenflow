/**
 * Unified Export System - Direct Integration.
 *
 * Multi-format export system integrated directly into core.
 * Supports JSON, YAML, CSV, XML, and custom formats.
 */

import { getLogger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

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
 encoding?: 'utf8' | 'base64';
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

export class ExportSystem extends EventEmitter {
 private exporters = new Map<string, ExporterDefinition>();
 private exportHistory: ExportResult[] = [];
 private initialized = false;

 constructor() {
 super();
 this.registerBuiltInExporters();
 }

 async initialize(): Promise<void> {
 if (this.initialized) return;

 logger.info('Initializing unified export system');

 await this.setupDefaultExporters();
 await this.validateSystemCapabilities();

 this.initialized = true;
 this.emit('initialized', {});
 logger.info('Unified export system ready');
 }

 private async setupDefaultExporters(): Promise<void> {
 await Promise.resolve();
 }

 private async validateSystemCapabilities(): Promise<void> {
 await Promise.resolve();
 }

 private registerBuiltInExporters(): void {
 // JSON Exporter
 this.registerExporter('json', {
 name: 'JSON Exporter',
 extension: '.json',
 mimeType: 'application/json',
 description: 'Export data as JSON format',
 export: (data: unknown, options?: ExportOptions) =>
 options?.pretty !== false
 ? JSON.stringify(data, null, 2)
 : JSON.stringify(data),
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
 export: (data: unknown) => this.convertToYAML(data, 0),
 validate: (data: unknown) => data !== undefined && data !== null,
 });

 // CSV Exporter
 this.registerExporter('csv', {
 name: 'CSV Exporter',
 extension: '.csv',
 mimeType: 'text/csv',
 description: 'Export array data as CSV format',
 export: (data: unknown) =>
 this.convertToCSV(data as Record<string, unknown>[]),
 validate: (data: unknown) => Array.isArray(data) && data.length > 0,
 supports: ['array'],
 });

 // XML Exporter
 this.registerExporter('xml', {
 name: 'XML Exporter',
 extension: '.xml',
 mimeType: 'application/xml',
 description: 'Export data as XML format',
 export: (data: unknown) =>
 `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${this.convertToXML(data, 1)}\n</root>`,
 validate: (data: unknown) => data !== undefined && data !== null,
 });

 // Markdown Exporter
 this.registerExporter('markdown', {
 name: 'Markdown Exporter',
 extension: '.md',
 mimeType: 'text/markdown',
 description: 'Export document data as Markdown format',
 export: (data: unknown) => this.convertToMarkdown(data),
 validate: (data: unknown) => typeof data === 'object' && data !== null,
 });

 // Plain Text Exporter
 this.registerExporter('txt', {
 name: 'Text Exporter',
 extension: '.txt',
 mimeType: 'text/plain',
 description: 'Export data as plain text format',
 export: (data: unknown) => {
 if (typeof data === 'string') return data;
 if (typeof data === 'object') return JSON.stringify(data, null, 2);
 return String(data);
 },
 validate: () => true,
 });

 // HTML Exporter
 this.registerExporter('html', {
 name: 'HTML Exporter',
 extension: '.html',
 mimeType: 'text/html',
 description: 'Export data as HTML format',
 export: (data: unknown) => this.convertToHTML(data),
 validate: (data: unknown) => data !== undefined && data !== null,
 });

 logger.info(`Registered ${this.exporters.size} built-in exporters`);
 }

 registerExporter(format: string, definition: ExporterDefinition): void {
 this.exporters.set(format.toLowerCase(), definition);
 logger.info(`Registered custom exporter: ${format}`);
 this.emit('exporter:registered', { format, definition });
 }

 async exportData(
 data: unknown,
 format: string,
 options: ExportOptions = {}
 ): Promise<ExportResult> {
 const exporter = this.exporters.get(format.toLowerCase());

 if (!exporter) {
 throw new Error(`Unsupported export format: ${format}`);
 }

 const exportId = this.generateId();
 const timestamp = Date.now();

 try {
 if (exporter.validate && !exporter.validate(data)) {
 throw new Error(`Data validation failed for ${format} format`)
 }

 const exportedData = await exporter.export(data, options);
 const size = Buffer.byteLength(exportedData, 'utf8');

 const filename =
 options?.filename || `export_${timestamp}${exporter.extension}`

 if (options?.outputPath) {
 const filePath = join(options?.outputPath, filename);
 await mkdir(dirname(filePath), { recursive: true });
 await writeFile(filePath, exportedData, options?.encoding || 'utf8');
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
 `Successfully exported data as ${format.toUpperCase()}:${filename}`
 );

 return result;
 } catch (error) {
 const result: ExportResult = {
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

 private convertToCSV(data: Record<string, unknown>[]): string {
 if (!Array.isArray(data) || data.length === 0) {
 return '';
 }

 const headers = Object.keys(data[0] || {});
 const csvRows = [headers.join(', ')];

 for (const row of data) {
 const values = headers.map((header) => {
 const value = row[header];
 if (
 typeof value === 'string' &&
 (value.includes(', ') || value.includes('"'))
 ) {
 return `"${value.replace(/"/g, '""')}"`
 }
 return value;
 });
 csvRows.push(values.join(', '));
 }

 return csvRows.join('\n');
 }

 private convertToYAML(obj: unknown, indent: number): string {
 const spaces = ' '.repeat(indent);

 if (obj === null) return 'null';
 if (typeof obj === 'boolean') return obj.toString();
 if (typeof obj === 'number') return obj.toString();
 if (typeof obj === 'string') return `"${obj.replace(/"/g, '"')}"`

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
 const spaces = ' '.repeat(indent);

 if (
 typeof obj === 'string' ||
 typeof obj === 'number' ||
 typeof obj === 'boolean'
 ) {
 return `${spaces}<value>${this.escapeXML(String(obj))}</value>`
 }

 if (Array.isArray(obj)) {
 return obj
 .map(
 (item, index) =>
 `${spaces}<item index="${index}">\n${this.convertToXML(item, indent + 1)}\n${spaces}</item>`
 )
 .join('\n');
 }

 if (typeof obj === 'object' && obj !== null) {
 return Object.entries(obj)
 .map(
 ([key, value]) =>
 `${spaces}<${this.sanitizeXMLTag(key)}>\n${this.convertToXML(value, indent + 1)}\n${spaces}</${this.sanitizeXMLTag(key)}>`
 )
 .join('\n');
 }

 return `${spaces}<value>${this.escapeXML(String(obj))}</value>`
 }

 private convertToMarkdown(data: unknown): string {
 let markdown = '';

 if (typeof data === 'object' && data !== null) {
 const dataObj = data as Record<string, unknown>;
 if (dataObj['title']) {
 markdown += `# ${String(dataObj['title'])}\n\n`
 }

 if (dataObj['description']) {
 markdown += `${String(dataObj['description'])}\n\n`
 }

 if (dataObj['content']) {
 markdown += `## Content\n${String(dataObj['content'])}\n`
 }
 } else {
 markdown = String(data);
 }

 return markdown;
 }

 private convertToHTML(data: unknown): string {
 const title =
 (data as Record<string, unknown>)?.['title'] || 'Claude Code Zen Export';

 let html = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>${this.escapeHTML(String(title))}</title>
</head>
<body>`

 html += `<h1>${this.escapeHTML(String(title))}</h1>`
 html += this.objectToHTML(data);
 html += `</body></html>`

 return html;
 }

 private objectToHTML(obj: unknown): string {
 let html = '';

 if (typeof obj === 'object' && obj !== null) {
 for (const [key, value] of Object.entries(obj)) {
 if (key === 'title') continue;

 html += `<h2>${this.escapeHTML(key.charAt(0).toUpperCase() + key.slice(1))}</h2>`

 html +=
 typeof value === 'string'
 ? `<p>${this.escapeHTML(value)}</p>`
 : `<p>${this.escapeHTML(String(value))}</p>`
 }
 } else {
 html += `<p>${this.escapeHTML(String(obj))}</p>`
 }

 return html;
 }

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
 return `export-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
 }

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

 clearHistory(): void {
 this.exportHistory = [];
 this.emit('history:cleared', {});
 }

 shutdown(): void {
 logger.info('Shutting down unified export system...');
 this.removeAllListeners();
 this.initialized = false;
 this.emit('shutdown', {});
 logger.info('Unified export system shutdown complete');
 }
}
