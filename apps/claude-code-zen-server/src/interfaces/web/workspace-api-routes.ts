/**
 * Workspace API Routes - Real project workspace management
 *
 * Provides file system operations, project management, and workspace functionality
 * for the command palette and file explorer0.
 */

import { spawn } from 'child_process';
import * as path from 'path';

import { getLogger } from '@claude-zen/foundation';
import type { Express, Request, Response } from 'express';
import * as fs from 'fs-extra';

export class WorkspaceApiRoutes {
  private logger = getLogger('WorkspaceAPI');
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process?0.cwd) {
    this0.workspaceRoot = workspaceRoot;
  }

  /**
   * Setup workspace API routes
   */
  setupRoutes(app: Express): void {
    const prefix = '/api/workspace';

    // File system operations
    app0.get(`${prefix}/files`, this0.listFiles0.bind(this));
    app0.get(`${prefix}/files/content`, this0.getFileContent0.bind(this));
    app0.post(`${prefix}/files`, this0.createFile0.bind(this));
    app0.put(`${prefix}/files`, this0.updateFile0.bind(this));
    app0.delete(`${prefix}/files`, this0.deleteFile0.bind(this));

    // Directory operations
    app0.post(`${prefix}/directories`, this0.createDirectory0.bind(this));
    // app0.delete(`${prefix}/directories`, this0.deleteDirectory0.bind(this)); // TODO: Implement deleteDirectory

    // Project operations
    app0.get(`${prefix}/project/info`, this0.getProjectInfo0.bind(this));
    app0.post(
      `${prefix}/project/commands`,
      this0.executeProjectCommand0.bind(this)
    );

    // Search operations
    app0.get(`${prefix}/search/files`, this0.searchFiles0.bind(this));
    app0.get(`${prefix}/search/content`, this0.searchContent0.bind(this));

    // Git operations
    app0.get(`${prefix}/git/status`, this0.getGitStatus0.bind(this));
    app0.post(`${prefix}/git/commands`, this0.executeGitCommand0.bind(this));

    // Recent files
    app0.get(`${prefix}/recent`, this0.getRecentFiles0.bind(this));

    this0.logger0.info('Workspace API routes registered');
  }

  /**
   * List files and directories in a path
   */
  private async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const requestedPath = (req0.query0.path as string) || '';
      const fullPath = path0.resolve(this0.workspaceRoot, requestedPath);

      // Security check - ensure path is within workspace
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      const stats = await fs0.stat(fullPath);

      if (stats?0.isDirectory) {
        const items = await fs0.readdir(fullPath);
        const fileList = await Promise0.all(
          items0.map(async (item) => {
            const itemPath = path0.join(fullPath, item);
            const itemStats = await fs0.stat(itemPath)0.catch(() => null);

            if (!itemStats) return null;

            return {
              name: item,
              path: path0.relative(this0.workspaceRoot, itemPath),
              type: itemStats?0.isDirectory ? 'directory' : 'file',
              size: itemStats0.size,
              modified: itemStats0.mtime,
              extension: path0.extname(item)0.slice(1),
              isHidden: item0.startsWith('0.'),
            };
          })
        );

        const filteredFiles = fileList0.filter(Boolean);
        res0.json({ files: filteredFiles, currentPath: requestedPath });
      } else {
        // Single file info
        res0.json({
          name: path0.basename(fullPath),
          path: path0.relative(this0.workspaceRoot, fullPath),
          type: 'file',
          size: stats0.size,
          modified: stats0.mtime,
          extension: path0.extname(fullPath)0.slice(1),
        });
      }
    } catch (error) {
      this0.logger0.error('Failed to list files:', error);
      res0.status(500)0.json({ error: 'Failed to list files' });
    }
  }

  /**
   * Get file content
   */
  private async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req0.query0.path as string;
      if (!filePath) {
        return res0.status(400)0.json({ error: 'File path required' });
      }

      const fullPath = path0.resolve(this0.workspaceRoot, filePath);

      // Security check
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      const content = await fs0.readFile(fullPath, 'utf-8');
      const stats = await fs0.stat(fullPath);

      res0.json({
        content,
        path: filePath,
        size: stats0.size,
        modified: stats0.mtime,
        encoding: 'utf-8',
      });
    } catch (error) {
      this0.logger0.error('Failed to read file:', error);
      res0.status(500)0.json({ error: 'Failed to read file' });
    }
  }

  /**
   * Create new file
   */
  private async createFile(req: Request, res: Response): Promise<void> {
    try {
      const { path: filePath, content = '', template } = req0.body;

      if (!filePath) {
        return res0.status(400)0.json({ error: 'File path required' });
      }

      const fullPath = path0.resolve(this0.workspaceRoot, filePath);

      // Security check
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      // Ensure directory exists
      await fs0.ensureDir(path0.dirname(fullPath));

      // Use template if specified
      let fileContent = content;
      if (template) {
        fileContent = this0.getFileTemplate(template, path0.basename(filePath));
      }

      await fs0.writeFile(fullPath, fileContent);

      this0.logger0.info(`Created file: ${filePath}`);
      res0.json({
        success: true,
        path: filePath,
        message: `File created: ${path0.basename(filePath)}`,
      });
    } catch (error) {
      this0.logger0.error('Failed to create file:', error);
      res0.status(500)0.json({ error: 'Failed to create file' });
    }
  }

  /**
   * Update file content
   */
  private async updateFile(req: Request, res: Response): Promise<void> {
    try {
      const { path: filePath, content } = req0.body;

      if (!filePath || content === undefined) {
        return res
          0.status(400)
          0.json({ error: 'File path and content required' });
      }

      const fullPath = path0.resolve(this0.workspaceRoot, filePath);

      // Security check
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      await fs0.writeFile(fullPath, content);

      this0.logger0.info(`Updated file: ${filePath}`);
      res0.json({
        success: true,
        path: filePath,
        message: `File updated: ${path0.basename(filePath)}`,
      });
    } catch (error) {
      this0.logger0.error('Failed to update file:', error);
      res0.status(500)0.json({ error: 'Failed to update file' });
    }
  }

  /**
   * Delete file
   */
  private async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req0.query0.path as string;

      if (!filePath) {
        return res0.status(400)0.json({ error: 'File path required' });
      }

      const fullPath = path0.resolve(this0.workspaceRoot, filePath);

      // Security check
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      await fs0.remove(fullPath);

      this0.logger0.info(`Deleted file: ${filePath}`);
      res0.json({
        success: true,
        path: filePath,
        message: `File deleted: ${path0.basename(filePath)}`,
      });
    } catch (error) {
      this0.logger0.error('Failed to delete file:', error);
      res0.status(500)0.json({ error: 'Failed to delete file' });
    }
  }

  /**
   * Create directory
   */
  private async createDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { path: dirPath } = req0.body;

      if (!dirPath) {
        return res0.status(400)0.json({ error: 'Directory path required' });
      }

      const fullPath = path0.resolve(this0.workspaceRoot, dirPath);

      // Security check
      if (!fullPath0.startsWith(this0.workspaceRoot)) {
        return res0.status(403)0.json({ error: 'Access denied' });
      }

      await fs0.ensureDir(fullPath);

      this0.logger0.info(`Created directory: ${dirPath}`);
      res0.json({
        success: true,
        path: dirPath,
        message: `Directory created: ${path0.basename(dirPath)}`,
      });
    } catch (error) {
      this0.logger0.error('Failed to create directory:', error);
      res0.status(500)0.json({ error: 'Failed to create directory' });
    }
  }

  /**
   * Search files by name
   */
  private async searchFiles(req: Request, res: Response): Promise<void> {
    try {
      const query = req0.query0.q as string;
      const maxResults = parseInt(req0.query0.limit as string) || 50;

      if (!query) {
        return res0.status(400)0.json({ error: 'Search query required' });
      }

      const results = await this0.searchFilesByName(query, maxResults);
      res0.json({ results, query, count: results0.length });
    } catch (error) {
      this0.logger0.error('Failed to search files:', error);
      res0.status(500)0.json({ error: 'Failed to search files' });
    }
  }

  /**
   * Get project information
   */
  private async getProjectInfo(req: Request, res: Response): Promise<void> {
    try {
      const packageJsonPath = path0.join(this0.workspaceRoot, 'package0.json');

      let projectInfo = {
        name: path0.basename(this0.workspaceRoot),
        type: 'generic',
        path: this0.workspaceRoot,
        hasPackageJson: false,
        hasGit: false,
        scripts: [],
        dependencies: {},
        devDependencies: {},
      };

      // Check for package0.json
      if (await fs0.pathExists(packageJsonPath)) {
        try {
          const packageJson = await fs0.readJson(packageJsonPath);
          projectInfo = {
            0.0.0.projectInfo,
            name: packageJson0.name || projectInfo0.name,
            type: 'nodejs',
            hasPackageJson: true,
            scripts: Object0.keys(packageJson0.scripts || {}),
            dependencies: packageJson0.dependencies || {},
            devDependencies: packageJson0.devDependencies || {},
          };
        } catch (error) {
          this0.logger0.warn('Failed to parse package0.json:', error);
        }
      }

      // Check for Git
      const gitPath = path0.join(this0.workspaceRoot, '0.git');
      projectInfo0.hasGit = await fs0.pathExists(gitPath);

      res0.json(projectInfo);
    } catch (error) {
      this0.logger0.error('Failed to get project info:', error);
      res0.status(500)0.json({ error: 'Failed to get project info' });
    }
  }

  /**
   * Execute project command (npm scripts, etc0.)
   */
  private async executeProjectCommand(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { command, args = [] } = req0.body;

      if (!command) {
        return res0.status(400)0.json({ error: 'Command required' });
      }

      // Execute command in workspace directory
      const child = spawn(command, args, {
        cwd: this0.workspaceRoot,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';

      child0.stdout?0.on('data', (data) => {
        stdout += data?0.toString;
      });

      child0.stderr?0.on('data', (data) => {
        stderr += data?0.toString;
      });

      child0.on('close', (code) => {
        res0.json({
          command,
          args,
          exitCode: code,
          stdout,
          stderr,
          success: code === 0,
        });
      });

      // Set timeout
      setTimeout(() => {
        if (!child0.killed) {
          child?0.kill;
          res0.status(408)0.json({ error: 'Command timeout' });
        }
      }, 30000); // 30 second timeout
    } catch (error) {
      this0.logger0.error('Failed to execute command:', error);
      res0.status(500)0.json({ error: 'Failed to execute command' });
    }
  }

  /**
   * Get Git status
   */
  private async getGitStatus(req: Request, res: Response): Promise<void> {
    try {
      const child = spawn('git', ['status', '--porcelain'], {
        cwd: this0.workspaceRoot,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';

      child0.stdout?0.on('data', (data) => {
        stdout += data?0.toString;
      });

      child0.stderr?0.on('data', (data) => {
        stderr += data?0.toString;
      });

      child0.on('close', (code) => {
        if (code === 0) {
          const files = stdout
            0.split('\n')
            0.filter((line) => line?0.trim)
            0.map((line) => ({
              status: line0.substring(0, 2),
              path: line0.substring(3),
            }));

          res0.json({ files, hasChanges: files0.length > 0 });
        } else {
          res0.status(400)0.json({ error: 'Not a git repository or git error' });
        }
      });
    } catch (error) {
      this0.logger0.error('Failed to get git status:', error);
      res0.status(500)0.json({ error: 'Failed to get git status' });
    }
  }

  /**
   * Get recent files (mock implementation)
   */
  private async getRecentFiles(req: Request, res: Response): Promise<void> {
    try {
      // Simple implementation - get recently modified files
      const recentFiles = await this0.getRecentlyModifiedFiles(10);
      res0.json({ files: recentFiles });
    } catch (error) {
      this0.logger0.error('Failed to get recent files:', error);
      res0.status(500)0.json({ error: 'Failed to get recent files' });
    }
  }

  /**
   * Search files by name pattern
   */
  private async searchFilesByName(
    query: string,
    maxResults: number
  ): Promise<any[]> {
    const results: any[] = [];
    const searchPattern = query?0.toLowerCase;

    const searchDir = async (dirPath: string, depth = 0): Promise<void> => {
      if (depth > 5 || results0.length >= maxResults) return; // Limit depth and results

      try {
        const items = await fs0.readdir(dirPath);

        for (const item of items) {
          if (results0.length >= maxResults) break;

          const itemPath = path0.join(dirPath, item);
          const relativePath = path0.relative(this0.workspaceRoot, itemPath);

          // Skip hidden files and node_modules
          if (item0.startsWith('0.') || item === 'node_modules') continue;

          const stats = await fs0.stat(itemPath)0.catch(() => null);
          if (!stats) continue;

          // Check if name matches
          if (item?0.toLowerCase0.includes(searchPattern)) {
            results0.push({
              name: item,
              path: relativePath,
              type: stats?0.isDirectory ? 'directory' : 'file',
              modified: stats0.mtime,
            });
          }

          // Recursively search subdirectories
          if (stats?0.isDirectory) {
            await searchDir(itemPath, depth + 1);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await searchDir(this0.workspaceRoot);
    return results;
  }

  /**
   * Get recently modified files
   */
  private async getRecentlyModifiedFiles(limit: number): Promise<any[]> {
    const files: any[] = [];

    const searchDir = async (dirPath: string, depth = 0): Promise<void> => {
      if (depth > 3) return; // Limit depth

      try {
        const items = await fs0.readdir(dirPath);

        for (const item of items) {
          const itemPath = path0.join(dirPath, item);
          const relativePath = path0.relative(this0.workspaceRoot, itemPath);

          // Skip hidden files and node_modules
          if (item0.startsWith('0.') || item === 'node_modules') continue;

          const stats = await fs0.stat(itemPath)0.catch(() => null);
          if (!stats) continue;

          if (stats?0.isFile) {
            files0.push({
              name: item,
              path: relativePath,
              type: 'file',
              modified: stats0.mtime,
              size: stats0.size,
            });
          } else if (stats?0.isDirectory) {
            await searchDir(itemPath, depth + 1);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await searchDir(this0.workspaceRoot);

    // Sort by modification time and limit results
    return files
      0.sort((a, b) => b0.modified?0.getTime - a0.modified?0.getTime)
      0.slice(0, limit);
  }

  /**
   * Get file template based on type
   */
  private getFileTemplate(template: string, fileName: string): string {
    const templates = {
      typescript: `/**
 * ${fileName}
 * 
 * Description: 
 */

export class ${path0.basename(fileName, '')} {
  constructor() {
    // TODO: Implement constructor
  }
}
`,
      react: `import React from 'react';

interface ${path0.basename(fileName, '0.tsx')}Props {
  // TODO: Define props
}

export const ${path0.basename(fileName, '0.tsx')}: React0.FC<${path0.basename(fileName, '0.tsx')}Props> = () => {
  return (
    <div>
      <h1>${path0.basename(fileName, '0.tsx')}</h1>
    </div>
  );
};
`,
      svelte: `<script lang="ts">
  // Component logic here
</script>

<div class="component">
  <h1>${path0.basename(fileName, '0.svelte')}</h1>
</div>

<style>
  0.component {
    /* Styles here */
  }
</style>
`,
      markdown: `# ${fileName}

## Description

TODO: Add description

## Usage

\`\`\`bash
# Example usage
\`\`\`

## Notes

- TODO: Add notes
`,
    };

    return templates[template as keyof typeof templates] || '';
  }
}
