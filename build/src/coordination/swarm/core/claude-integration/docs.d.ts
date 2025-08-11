/**
 * @file Coordination system: docs.
 */
interface DocsGeneratorOptions {
    workingDir?: string;
    [key: string]: any;
}
interface GenerateOptions {
    force?: boolean;
    merge?: boolean;
    backup?: boolean;
    noBackup?: boolean;
    interactive?: boolean;
}
declare class ClaudeDocsGenerator {
    private workingDir;
    private advancedGenerator;
    constructor(options?: DocsGeneratorOptions);
    /**
     * Generate main claude.md configuration file with protection.
     *
     * @param options
     */
    generateClaudeMd(options?: GenerateOptions): Promise<{
        file: string;
        success: boolean;
        action: string;
    }>;
    /**
     * Generate command documentation files in organized subdirectories.
     */
    generateCommandDocs(): Promise<{
        files: string[];
        success: boolean;
    }>;
    /**
     * Generate settings.json with hook configurations.
     */
    generateSettingsJson(): Promise<{
        file: string;
        success: boolean;
    }>;
    /**
     * Check if file exists.
     *
     * @param filePath
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Create backup of existing file.
     *
     * @param filePath
     */
    createBackup(filePath: string): Promise<string>;
    /**
     * Clean up old backup files (keep last 5).
     *
     * @param filePath.
     * @param filePath
     */
    cleanupOldBackups(filePath: string): Promise<void>;
    /**
     * Prompt user for action when CLAUDE.md exists.
     *
     * @param _filePath
     */
    promptUserAction(_filePath: string): Promise<unknown>;
    /**
     * Merge Claude Zen content with existing CLAUDE.md.
     *
     * @param filePath
     * @param noBackup
     */
    mergeClaudeMd(filePath: string, noBackup?: boolean): Promise<{
        file: string;
        success: boolean;
        action: string;
    }>;
    /**
     * Get the Claude Zen specific content (full content from generateClaudeMd).
     */
    getClaudeZenContent(): string;
    /**
     * Intelligently combine Claude Zen content with existing content.
     *
     * @param existingContent
     * @param claudeZenContent
     */
    intelligentMerge(existingContent: string, claudeZenContent: string): string;
    /**
     * Find existing Claude Zen section in content.
     *
     * @param lines
     */
    findClaudeZenSection(lines: string[]): number;
    /**
     * Intelligently insert new content based on context.
     *
     * @param existingLines
     * @param newLines
     */
    intelligentInsert(existingLines: string[], newLines: string[]): string;
    /**
     * Find the end of a markdown section.
     *
     * @param lines
     * @param startIndex
     */
    findSectionEnd(lines: string[], startIndex: number): number;
    /**
     * Generate all documentation files.
     *
     * @param options
     */
    generateAll(options?: GenerateOptions): Promise<any>;
}
export { ClaudeDocsGenerator };
//# sourceMappingURL=docs.d.ts.map