/**
 * Workspace API Routes - Real project workspace management
 *
 * Provides file system operations, project management, and workspace functionality
 * for the command palette and file explorer.
 */

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { getLogger } from '@claude-zen/foundation';
import type { Express, Request, Response } from 'express';

// Constants to avoid string duplication
const WORKSPACE_ERROR_MESSAGES = {
  accessDenied: 'Access denied',
  fileNotFound: 'File not found',
  operationFailed: 'Operation failed',
  filePathRequired: 'File path is required',
} as const;

import * as fs from 'fs-extra';

const WORKSPACE_PATHS = {
  basePath: '/workspace',
} as const;

export class WorkspaceApiRoutes {
  private logger = getLogger('WorkspaceAPI');
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Setup workspace API routes
   */
  setupRoutes(app: Express): void {
    const prefix = `/api${  WORKSPACE_PATHS.basePath}`;

    // File system operations
    app.get(`${prefix  }/files`, this.listFiles.bind(this));
    app.get(`${prefix  }/files/content`, this.getFileContent.bind(this));
    app.post(`${prefix  }/files`, this.createFile.bind(this));
    app.put(`${prefix  }/files`, this.updateFile.bind(this));
    app.delete(`${prefix  }/files`, this.deleteFile.bind(this));

    // Directory operations
    app.post(`${prefix  }/directories`, this.createDirectory.bind(this));
    app.delete(`${prefix  }/directories`, this.deleteDirectory.bind(this));

    // Project operations
    app.get(`${prefix  }/project/info`, this.getProjectInfo.bind(this));
    app.post(
      `${prefix  }/project/commands`,
      this.executeProjectCommand.bind(this)
    );

    // Search operations
    app.get(`${prefix  }/search/files`, this.searchFiles.bind(this));
    app.get(`${prefix  }/search/content`, this.searchContent.bind(this));

    // Git operations
    app.get(`${prefix  }/git/status`, this.getGitStatus.bind(this));
    app.post(`${prefix  }/git/commands`, this.executeGitCommand.bind(this));

    // Recent files
    app.get(`${prefix  }/recent`, this.getRecentFiles.bind(this));

    this.logger.info('Workspace API routes registered');
  }

  /**
   * List files and directories in a path
   */
  private async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const requestedPath = (req.query.path as string) || '';
      const fullPath = path.resolve(this.workspaceRoot, requestedPath);

      // Security check - ensure path is within workspace
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const items = await fs.readdir(fullPath);
        const fileList = await Promise.all(
          items.map(async (item) => {
            const itemPath = path.join(fullPath, item);
            const itemStats = await fs.stat(itemPath).catch(() => null);
            if (!itemStats) return null;

            return {
              name: item,
              path: path.relative(this.workspaceRoot, itemPath),
              type: itemStats.isDirectory() ? 'directory' : ' file',
              size: itemStats.size,
              modified: itemStats.mtime,
              extension: path.extname(item).slice(1),
              isHidden: item.startsWith('.'),
            };
          })
        );

        const filteredFiles = fileList.filter(Boolean);
        res.json({
          files: filteredFiles,
          currentPath: requestedPath,
        });
      } else {
        // Single file info
        res.json({
          name: path.basename(fullPath),
          path: path.relative(this.workspaceRoot, fullPath),
          type: 'file',
          size: stats.size,
          modified: stats.mtime,
          extension: path.extname(fullPath).slice(1),
        });
      }
    } catch (error) {
      this.logger.error('Failed to list files: ', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  }

  /**
   * Get file content
   */
  private async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string;
      if (!filePath) {
        res
          .status(400)
          .json({ error: WORKSPACE_ERROR_MESSAGES.filePathRequired });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);

      res.json({
        content,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        encoding: 'utf-8',
      });
    } catch (error) {
      this.logger.error('Failed to get file content: ', error);
      res.status(500).json({ error: 'Failed to get file content' });
    }
  }

  /**
   * Create a new file
   */
  private async createFile(req: Request, res: Response): Promise<void> {
    try {
      const { path: filePath, content = '' } = req.body;
      if (!filePath) {
        res
          .status(400)
          .json({ error: WORKSPACE_ERROR_MESSAGES.filePathRequired });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf-8');

      const stats = await fs.stat(fullPath);
      res.json({
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        created: true,
      });
    } catch (error) {
      this.logger.error('Failed to create file: ', error);
      res.status(500).json({ error: 'Failed to create file' });
    }
  }

  /**
   * Update file content
   */
  private async updateFile(req: Request, res: Response): Promise<void> {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath || content === undefined) {
        res.status(400).json({ error: 'File path and content required' });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      await fs.writeFile(fullPath, content, 'utf-8');
      const stats = await fs.stat(fullPath);

      res.json({
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        updated: true,
      });
    } catch (error) {
      this.logger.error('Failed to update file: ', error);
      res.status(500).json({ error: 'Failed to update file' });
    }
  }

  /**
   * Delete a file
   */
  private async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string;
      if (!filePath) {
        res
          .status(400)
          .json({ error: WORKSPACE_ERROR_MESSAGES.filePathRequired });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      await fs.remove(fullPath);
      res.json({ deleted: true, path: filePath });
    } catch (error) {
      this.logger.error('Failed to delete file: ', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  /**
   * Create a directory
   */
  private async createDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { path: dirPath } = req.body;
      if (!dirPath) {
        res.status(400).json({ error: 'Directory path required' });
      }

      const fullPath = path.resolve(this.workspaceRoot, dirPath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
      }

      await fs.ensureDir(fullPath);
      res.json({ created: true, path: dirPath });
    } catch (error) {
      this.logger.error('Failed to create directory: ', error);
      res.status(500).json({ error: 'Failed to create directory' });
    }
  }

  /**
   * Delete a directory (production implementation)
   */
  private async deleteDirectory(req: Request, res: Response): Promise<void> {
    try {
      const dirPath = req.query.path as string;
      if (!dirPath) {
        res.status(400).json({ error: 'Directory path required' });
        return;
      }

      const fullPath = path.resolve(this.workspaceRoot, dirPath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: WORKSPACE_ERROR_MESSAGES.accessDenied });
        return;
      }

      // Safety check - ensure it's actually a directory
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        res.status(400).json({ error: 'Path is not a directory' });
        return;
      }

      // Additional safety check - don't allow deletion of workspace root or critical directories
      const relativePath = path.relative(this.workspaceRoot, fullPath);
      const protectedPaths = ['', '.', 'node_modules', '.git'];
      if (protectedPaths.includes(relativePath)) {
        res.status(403).json({ error: 'Cannot delete protected directory' });
        return;
      }

      // Check if directory is empty (optional - remove this if you want to allow non-empty deletion)
      const isEmpty = await this.isDirectoryEmpty(fullPath);
      if (!isEmpty) {
        const force = req.query.force === 'true';
        if (!force) {
          res.status(400).json({ 
            error: 'Directory is not empty. Use force=true to delete non-empty directories.',
            requiresForce: true 
          });
          return;
        }
      }

      await fs.remove(fullPath);
      res.json({ deleted: true, path: dirPath });
    } catch (error) {
      this.logger.error('Failed to delete directory: ', error);
      res.status(500).json({ error: 'Failed to delete directory' });
    }
  }

  /**
   * Check if directory is empty (helper method)
   */
  private async isDirectoryEmpty(dirPath: string): Promise<boolean> {
    try {
      const files = await fs.readdir(dirPath);
      return files.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get project information
   */
  private async getProjectInfo(req: Request, res: Response): Promise<void> {
    try {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      let packageInfo = null;

      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
        packageInfo = JSON.parse(packageContent);
      } catch {
        // package.json not found or invalid
      }

      res.json({
        name: packageInfo?.name || path.basename(this.workspaceRoot),
        version: packageInfo?.version || '0.0.0',
        description: packageInfo?.description || '',
        root: this.workspaceRoot,
        hasPackageJson: Boolean(packageInfo),
      });
    } catch (error) {
      this.logger.error('Failed to get project info: ', error);
      res.status(500).json({ error: 'Failed to get project info' });
    }
  }

  /**
   * Execute project command
   */
  private executeProjectCommand(req: Request, res: Response): void {
    try {
      const { command, args = [] } = req.body;
      if (!command) {
        res.status(400).json({ error: 'Command required' });
      }

      const child = spawn(command, args, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (_data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (_data) => {
        error += data.toString();
      });

      child.on('close', (_code) => {
        res.json({
          exitCode: code,
          stdout: output,
          stderr: error,
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        res.status(408).json({ error: 'Command timeout' });
      }, 30000);
    } catch (error) {
      this.logger.error('Failed to execute command: ', error);
      res.status(500).json({ error: 'Failed to execute command' });
    }
  }

  /**
   * Search for files by name
   */
  private async searchFiles(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query required' });
      }

      // Simple file search implementation
      const results: Array<{ name: string; path: string; type: string }> = [];

      const searchDir = async (dir: string, depth = 0): Promise<void> => {
        if (depth > 5) return; // Limit search depth

        const items = await fs.readdir(dir).catch(() => []);
        for (const item of items) {
          if (item.startsWith('.')) continue; // Skip hidden files

          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath).catch(() => null);
          if (!stats) continue;

          if (item.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              name: item,
              path: path.relative(this.workspaceRoot, itemPath),
              type: stats.isDirectory() ? 'directory' : ' file',
            });
          }

          if (stats.isDirectory() && results.length < 100) {
            await searchDir(itemPath, depth + 1);
          }
        }
      };

      await searchDir(this.workspaceRoot);
      res.json({ results: results.slice(0, 100) });
    } catch (error) {
      this.logger.error('Failed to search files: ', error);
      res.status(500).json({ error: 'Failed to search files' });
    }
  }

  /**
   * Search file content (production implementation)
   */
  private async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const fileTypes = (req.query.types as string)?.split(',') || ['.ts', '.js', '.json', '.md', '.txt'];
      const maxResults = parseInt(req.query.limit as string) || 50;

      if (!query) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const results: Array<{
        file: string;
        line: number;
        content: string;
        match: string;
      }> = [];

      const searchInFile = async (filePath: string): Promise<void> => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          
          for (const [index, line] of lines.entries()) {
            if (line.toLowerCase().includes(query.toLowerCase()) && results.length < maxResults) {
              results.push({
                file: path.relative(this.workspaceRoot, filePath),
                line: index + 1,
                content: line.trim(),
                match: query,
              });
            }
          }
        } catch {
          // Skip files that can't be read as text
        }
      };

      const searchDir = async (dir: string, depth = 0): Promise<void> => {
        if (depth > 10 || results.length >= maxResults) return; // Limit search depth and results

        try {
          const items = await fs.readdir(dir);
          for (const item of items) {
            if (item.startsWith('.') || item === 'node_modules') continue; // Skip hidden and node_modules

            const itemPath = path.join(dir, item);
            const stats = await fs.stat(itemPath).catch(() => null);
            if (!stats) continue;

            if (stats.isDirectory()) {
              await searchDir(itemPath, depth + 1);
            } else if (stats.isFile()) {
              const ext = path.extname(item);
              if (fileTypes.includes(ext) || fileTypes.includes('*')) {
                await searchInFile(itemPath);
              }
            }

            if (results.length >= maxResults) break;
          }
        } catch {
          // Skip directories that can't be read
        }
      };

      await searchDir(this.workspaceRoot);
      
      res.json({ 
        results: results.slice(0, maxResults),
        query,
        total: results.length,
        truncated: results.length >= maxResults,
      });
    } catch (error) {
      this.logger.error('Failed to search content: ', error);
      res.status(500).json({ error: 'Failed to search content' });
    }
  }

  /**
   * Get Git status
   */
  private getGitStatus(req: Request, res: Response): void {
    try {
      const child = spawn('git', [' status', '--porcelain'], {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });

      let output = '';
      child.stdout?.on('data', (_data) => {
        output += data.toString();
      });

      child.on('close', (_code) => {
        if (code === 0) {
          const files = output
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => {
              const status = line.substring(0, 2);
              const filename = line.substring(3);
              return { status, filename };
            });

          res.json({ files });
        } else {
          res
            .status(500)
            .json({ error: 'Git not available or not a git repository' });
        }
      });
    } catch (error) {
      this.logger.error('Failed to get git status: ', error);
      res.status(500).json({ error: 'Failed to get git status' });
    }
  }

  /**
   * Execute Git command
   */
  private executeGitCommand(req: Request, res: Response): void {
    try {
      const { args = [] } = req.body;
      if (!Array.isArray(args) || args.length === 0) {
        res.status(400).json({ error: 'Git arguments required' });
      }

      const child = spawn('git', args, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (_data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (_data) => {
        error += data.toString();
      });

      child.on('close', (_code) => {
        res.json({
          exitCode: code,
          stdout: output,
          stderr: error,
        });
      });
    } catch (error) {
      this.logger.error('Failed to execute git command: ', error);
      res.status(500).json({ error: 'Failed to execute git command' });
    }
  }

  /**
   * Get recent files (production implementation with actual tracking)
   */
  private async getRecentFiles(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentFiles: Array<{
        name: string;
        path: string;
        type: string;
        modified: Date;
        size: number;
      }> = [];

      // Get recently modified files by scanning the workspace
      const scanForRecentFiles = async (dir: string, depth = 0): Promise<void> => {
        if (depth > 5) return; // Limit depth to avoid deep recursion

        try {
          const items = await fs.readdir(dir);
          for (const item of items) {
            if (item.startsWith('.') || item === 'node_modules') continue;

            const itemPath = path.join(dir, item);
            const stats = await fs.stat(itemPath).catch(() => null);
            if (!stats) continue;

            if (stats.isFile()) {
              recentFiles.push({
                name: item,
                path: path.relative(this.workspaceRoot, itemPath),
                type: 'file',
                modified: stats.mtime,
                size: stats.size,
              });
            } else if (stats.isDirectory()) {
              await scanForRecentFiles(itemPath, depth + 1);
            }
          }
        } catch {
          // Skip directories that can't be read
        }
      };

      await scanForRecentFiles(this.workspaceRoot);

      // Sort by modification time and take the most recent
      const sortedFiles = recentFiles
        .sort((a, b) => b.modified.getTime() - a.modified.getTime())
        .slice(0, limit);

      res.json({ 
        files: sortedFiles,
        total: sortedFiles.length,
        lastScanned: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to get recent files: ', error);
      res.status(500).json({ error: 'Failed to get recent files' });
    }
  }
}
