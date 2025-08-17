/**
 * Workspace API Routes - Real project workspace management
 *
 * Provides file system operations, project management, and workspace functionality
 * for the command palette and file explorer.
 */
import type { Express } from 'express';
export declare class WorkspaceApiRoutes {
    private logger;
    private workspaceRoot;
    constructor(workspaceRoot?: string);
    /**
     * Setup workspace API routes
     */
    setupRoutes(app: Express): void;
    /**
     * List files and directories in a path
     */
    private listFiles;
    /**
     * Get file content
     */
    private getFileContent;
    /**
     * Create new file
     */
    private createFile;
    /**
     * Update file content
     */
    private updateFile;
    /**
     * Delete file
     */
    private deleteFile;
    /**
     * Create directory
     */
    private createDirectory;
    /**
     * Search files by name
     */
    private searchFiles;
    /**
     * Get project information
     */
    private getProjectInfo;
    /**
     * Execute project command (npm scripts, etc.)
     */
    private executeProjectCommand;
    /**
     * Get Git status
     */
    private getGitStatus;
    /**
     * Get recent files (mock implementation)
     */
    private getRecentFiles;
    /**
     * Search files by name pattern
     */
    private searchFilesByName;
    /**
     * Get recently modified files
     */
    private getRecentlyModifiedFiles;
    /**
     * Get file template based on type
     */
    private getFileTemplate;
}
//# sourceMappingURL=workspace-api-routes.d.ts.map