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
     * Create a new file
     */
    private createFile;
    /**
     * Update file content
     */
    private updateFile;
    /**
     * Delete a file
     */
    private deleteFile;
    /**
     * Create a directory
     */
    private createDirectory;
    /**
     * Get project information
     */
    private getProjectInfo;
    /**
     * Execute project command
     */
    private executeProjectCommand;
    /**
     * Search for files by name
     */
    private searchFiles;
    /**
     * Search file content
     */
    private searchContent;
    /**
     * Get Git status
     */
    private getGitStatus;
    /**
     * Execute Git command
     */
    private executeGitCommand;
    /**
     * Get recent files
     */
    private getRecentFiles;
}
//# sourceMappingURL=workspace.routes.d.ts.map