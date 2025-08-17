/**
 * Export System
 * Handles exporting data and configurations in various formats.
 * Migrated from plugins to utils domain.
 */
/**
 * @file Exporters implementation.
 */
type ExporterFunction = {
    name: string;
    extension: string;
    mimeType: string;
    export: (data: unknown) => string;
};
export interface ExportResult {
    success: boolean;
    filePath?: string;
    data?: unknown;
    error?: string;
    timestamp: number;
}
export interface ExportConfig {
    format: 'json' | 'csv' | 'yaml' | 'xml' | 'markdown';
    outputPath?: string;
    fileName?: string;
    options?: Record<string, unknown>;
}
export declare class ExportSystem {
    private exporters;
    private exportHistory;
    constructor();
    private setupExporters;
    exportData(data: unknown, config: ExportConfig): Promise<ExportResult>;
    convertToCSV(data: unknown[]): string;
    convertToYAML(data: unknown): string;
    convertToXML(data: unknown): string;
    convertToMarkdown(data: unknown): string;
    getExportHistory(): ExportResult[];
    clearHistory(): void;
    getSupportedFormats(): string[];
    getExporterInfo(format: string): ExporterFunction | undefined;
}
export declare const ExportUtils: {
    /**
     * Quick JSON export.
     *
     * @param data
     */
    toJSON: (data: unknown) => string;
    /**
     * Quick CSV export for arrays.
     *
     * @param data
     */
    toCSV: (data: unknown[]) => string;
    /**
     * Quick YAML export.
     *
     * @param data
     */
    toYAML: (data: unknown) => string;
    /**
     * Quick XML export.
     *
     * @param data
     */
    toXML: (data: unknown) => string;
    /**
     * Quick Markdown export.
     *
     * @param data
     */
    toMarkdown: (data: unknown) => string;
};
export default ExportSystem;
//# sourceMappingURL=exporters.d.ts.map