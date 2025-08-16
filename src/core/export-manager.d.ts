/**
 * Unified Export System - Direct Integration.
 *
 * Multi-format export system integrated directly into core.
 * Supports JSON, YAML, CSV, XML, and custom formats.
 */
/**
 * @file Export management system.
 */
import { EventEmitter } from 'node:events';
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
export declare class ExportSystem extends EventEmitter {
    private exporters;
    private exportHistory;
    private initialized;
    constructor();
    /**
     * Initialize the export system.
     */
    initialize(): Promise<void>;
    /**
     * Register built-in exporters.
     */
    private registerBuiltInExporters;
    /**
     * Register a custom exporter.
     *
     * @param format
     * @param definition
     */
    registerExporter(format: string, definition: ExporterDefinition): void;
    /**
     * Export data to specified format.
     *
     * @param data
     * @param format
     * @param options
     */
    exportData(data: unknown, format: string, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Export data to multiple formats.
     *
     * @param data
     * @param formats
     * @param options
     */
    batchExport(data: unknown, formats: string[], options?: ExportOptions): Promise<ExportResult[]>;
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
    exportWorkflowData(workflowData: {
        vision?: Record<string, unknown>[];
        adrs?: Record<string, unknown>[];
        prds?: Record<string, unknown>[];
        epics?: Record<string, unknown>[];
        features?: Record<string, unknown>[];
        tasks?: Record<string, unknown>[];
    }, format: string, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Export system status and metrics.
     *
     * @param statusData
     * @param format
     * @param options
     */
    exportSystemStatus(statusData: Record<string, unknown>, format: string, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Format conversion methods.
     *
     * @param data
     */
    private convertToCSV;
    private convertToYAML;
    private convertToXML;
    private convertToMarkdown;
    private convertToHTML;
    private objectToHTML;
    /**
     * Utility methods.
     *
     * @param str
     */
    private escapeXML;
    private escapeHTML;
    private sanitizeXMLTag;
    private generateId;
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
    }>;
    getExportHistory(limit?: number): ExportResult[];
    getExportStats(): {
        totalExports: number;
        successfulExports: number;
        failedExports: number;
        formatBreakdown: Record<string, number>;
        totalSize: number;
        averageSize: number;
    };
    clearHistory(): void;
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
    };
    /**
     * Shutdown the export system gracefully.
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=export-manager.d.ts.map