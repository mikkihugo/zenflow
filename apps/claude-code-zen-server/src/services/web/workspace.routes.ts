/**
 * Workspace API Routes - Real project workspace management
 *
 * Provides file system operations, project management, and workspace functionality
 * for the command palette and file explorer.
 */

import { spawn } from 'child_process';
import * as path from 'path';

import { getLogger } from '@claude-zen/foundation';
import type {
  Express,
  Request,
  Response
} from 'express';
import * as fs from 'fs-extra';

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
    const prefix = '/api/workspace';

    // File system operations
    app.get(`${prefix}/files`, this.listFiles.bind(this));
    app.get(`${prefix}/files/content`, this.getFileContent.bind(this));
    app.post(`${prefix}/files`, this.createFile.bind(this));
    app.put(`${prefix}/files`, this.updateFile.bind(this));
    app.delete(`${prefix}/files`, this.deleteFile.bind(this));

    // Directory operations
    app.post(`${prefix}/directories`, this.createDirectory.bind(this));
    // app.delete(`${prefix}/directories`, this.deleteDirectory.bind(this)); // TODO: Implement deleteDirectory

    // Project operations
    app.get(`${prefix}/project/info`, this.getProjectInfo.bind(this));
    app.post(`${prefix}/project/commands`, this.executeProjectCommand.bind(this));

    // Search operations
    app.get(`${prefix}/search/files`, this.searchFiles.bind(this));
    app.get(`${prefix}/search/content`, this.searchContent.bind(this));

    // Git operations
    app.get(`${prefix}/git/status`, this.getGitStatus.bind(this));
    app.post(`${prefix}/git/commands`, this.executeGitCommand.bind(this));

    // Recent files
    app.get(`${prefix}/recent`, this.getRecentFiles.bind(this));

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
        res.status(403).json({ error: 'Access denied' });
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
              type: itemStats.isDirectory() ? 'directory' : 'file',
              size: itemStats.size,
              modified: itemStats.mtime,
              extension: path.extname(item).slice(1),
              isHidden: item.startsWith('.')
            };
          })
        );

        const filteredFiles = fileList.filter(Boolean);
        res.json({
          files: filteredFiles,
          currentPath: requestedPath
        });
      } else {
        // Single file info
        res.json({
          name: path.basename(fullPath),
          path: path.relative(this.workspaceRoot, fullPath),
          type: 'file',
          size: stats.size,
          modified: stats.mtime,
          extension: path.extname(fullPath).slice(1)
        });
      }
    } catch (error) {
      this.logger.error('Failed to list files:', error);
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
        res.status(400).json({ error: 'File path required' });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: 'Access denied' });
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);

      res.json({
        content,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        encoding: 'utf-8'
      });
    } catch (error) {
      this.logger.error('Failed to get file content:', error);
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
        res.status(400).json({ error: 'File path required' });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: 'Access denied' });
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf-8');

      const stats = await fs.stat(fullPath);
      res.json({
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        created: true
      });
    } catch (error) {
      this.logger.error('Failed to create file:', error);
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
        res.status(403).json({ error: 'Access denied' });
      }

      await fs.writeFile(fullPath, content, 'utf-8');
      const stats = await fs.stat(fullPath);

      res.json({
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        updated: true
      });
    } catch (error) {
      this.logger.error('Failed to update file:', error);
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
        res.status(400).json({ error: 'File path required' });
      }

      const fullPath = path.resolve(this.workspaceRoot, filePath);

      // Security check
      if (!fullPath.startsWith(this.workspaceRoot)) {
        res.status(403).json({ error: 'Access denied' });
      }

      await fs.remove(fullPath);
      res.json({ deleted: true, path: filePath });
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
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
        res.status(403).json({ error: 'Access denied' });
      }

      await fs.ensureDir(fullPath);
      res.json({ created: true, path: dirPath });
    } catch (error) {
      this.logger.error('Failed to create directory:', error);
      res.status(500).json({ error: 'Failed to create directory' });
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
        hasPackageJson: Boolean(packageInfo)
      });
    } catch (error) {
      this.logger.error('Failed to get project info:', error);
      res.status(500).json({ error: 'Failed to get project info' });
    }
  }

  /**
   * Execute project command
   */
  private async executeProjectCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command, args = [] } = req.body;
      if (!command) {
        res.status(400).json({ error: 'Command required' });
      }

      const child = spawn(command, args, {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        res.json({
          exitCode: code,
          stdout: output,
          stderr: error
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        res.status(408).json({ error: 'Command timeout' });
      }, 30000);
    } catch (error) {
      this.logger.error('Failed to execute command:', error);
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
      const results: any[] = [];
      
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
              type: stats.isDirectory() ? 'directory' : 'file'
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
      this.logger.error('Failed to search files:', error);
      res.status(500).json({ error: 'Failed to search files' });
    }
  }

  /**
   * Search file content
   */
  private async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query required' });
      }

      // Basic content search - in a real implementation you'd use grep or similar
      res.json({ message: 'Content search not yet implemented' });
    } catch (error) {
      this.logger.error('Failed to search content:', error);
      res.status(500).json({ error: 'Failed to search content' });
    }
  }

  /**
   * Get Git status
   */
  private async getGitStatus(req: Request, res: Response): Promise<void> {
    try {
      const child = spawn('git', ['status', '--porcelain'], {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });

      let output = '';
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const files = output
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              const status = line.substring(0, 2);
              const filename = line.substring(3);
              return { status, filename };
            });
          
          res.json({ files });
        } else {
          res.status(500).json({ error: 'Git not available or not a git repository' });
        }
      });
    } catch (error) {
      this.logger.error('Failed to get git status:', error);
      res.status(500).json({ error: 'Failed to get git status' });
    }
  }

  /**
   * Execute Git command
   */
  private async executeGitCommand(req: Request, res: Response): Promise<void> {
    try {
      const { args = [] } = req.body;
      if (!Array.isArray(args) || args.length === 0) {
        res.status(400).json({ error: 'Git arguments required' });
      }

      const child = spawn('git', args, {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        res.json({
          exitCode: code,
          stdout: output,
          stderr: error
        });
      });
    } catch (error) {
      this.logger.error('Failed to execute git command:', error);
      res.status(500).json({ error: 'Failed to execute git command' });
    }
  }

  /**
   * Get recent files
   */
  private async getRecentFiles(req: Request, res: Response): Promise<void> {
    try {
      // Simple implementation - could be enhanced with actual recent file tracking
      res.json({ files: [] });
    } catch (error) {
      this.logger.error('Failed to get recent files:', error);
      res.status(500).json({ error: 'Failed to get recent files' });
    }
  }
}