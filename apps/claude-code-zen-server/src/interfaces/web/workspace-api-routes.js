/**
 * Workspace API Routes - Real project workspace management
 *
 * Provides file system operations, project management, and workspace functionality
 * for the command palette and file explorer.
 */
import { getLogger } from '../../config/logging-config';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
export class WorkspaceApiRoutes {
    logger = getLogger('WorkspaceAPI');
    workspaceRoot;
    constructor(workspaceRoot = process.cwd()) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * Setup workspace API routes
     */
    setupRoutes(app) {
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
    async listFiles(req, res) {
        try {
            const requestedPath = req.query.path || '';
            const fullPath = path.resolve(this.workspaceRoot, requestedPath);
            // Security check - ensure path is within workspace
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                const items = await fs.readdir(fullPath);
                const fileList = await Promise.all(items.map(async (item) => {
                    const itemPath = path.join(fullPath, item);
                    const itemStats = await fs.stat(itemPath).catch(() => null);
                    if (!itemStats)
                        return null;
                    return {
                        name: item,
                        path: path.relative(this.workspaceRoot, itemPath),
                        type: itemStats.isDirectory() ? 'directory' : 'file',
                        size: itemStats.size,
                        modified: itemStats.mtime,
                        extension: path.extname(item).slice(1),
                        isHidden: item.startsWith('.'),
                    };
                }));
                const filteredFiles = fileList.filter(Boolean);
                res.json({ files: filteredFiles, currentPath: requestedPath });
            }
            else {
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
        }
        catch (error) {
            this.logger.error('Failed to list files:', error);
            res.status(500).json({ error: 'Failed to list files' });
        }
    }
    /**
     * Get file content
     */
    async getFileContent(req, res) {
        try {
            const filePath = req.query.path;
            if (!filePath) {
                return res.status(400).json({ error: 'File path required' });
            }
            const fullPath = path.resolve(this.workspaceRoot, filePath);
            // Security check
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
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
        }
        catch (error) {
            this.logger.error('Failed to read file:', error);
            res.status(500).json({ error: 'Failed to read file' });
        }
    }
    /**
     * Create new file
     */
    async createFile(req, res) {
        try {
            const { path: filePath, content = '', template } = req.body;
            if (!filePath) {
                return res.status(400).json({ error: 'File path required' });
            }
            const fullPath = path.resolve(this.workspaceRoot, filePath);
            // Security check
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Ensure directory exists
            await fs.ensureDir(path.dirname(fullPath));
            // Use template if specified
            let fileContent = content;
            if (template) {
                fileContent = this.getFileTemplate(template, path.basename(filePath));
            }
            await fs.writeFile(fullPath, fileContent);
            this.logger.info(`Created file: ${filePath}`);
            res.json({
                success: true,
                path: filePath,
                message: `File created: ${path.basename(filePath)}`
            });
        }
        catch (error) {
            this.logger.error('Failed to create file:', error);
            res.status(500).json({ error: 'Failed to create file' });
        }
    }
    /**
     * Update file content
     */
    async updateFile(req, res) {
        try {
            const { path: filePath, content } = req.body;
            if (!filePath || content === undefined) {
                return res.status(400).json({ error: 'File path and content required' });
            }
            const fullPath = path.resolve(this.workspaceRoot, filePath);
            // Security check
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            await fs.writeFile(fullPath, content);
            this.logger.info(`Updated file: ${filePath}`);
            res.json({
                success: true,
                path: filePath,
                message: `File updated: ${path.basename(filePath)}`
            });
        }
        catch (error) {
            this.logger.error('Failed to update file:', error);
            res.status(500).json({ error: 'Failed to update file' });
        }
    }
    /**
     * Delete file
     */
    async deleteFile(req, res) {
        try {
            const filePath = req.query.path;
            if (!filePath) {
                return res.status(400).json({ error: 'File path required' });
            }
            const fullPath = path.resolve(this.workspaceRoot, filePath);
            // Security check
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            await fs.remove(fullPath);
            this.logger.info(`Deleted file: ${filePath}`);
            res.json({
                success: true,
                path: filePath,
                message: `File deleted: ${path.basename(filePath)}`
            });
        }
        catch (error) {
            this.logger.error('Failed to delete file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
    /**
     * Create directory
     */
    async createDirectory(req, res) {
        try {
            const { path: dirPath } = req.body;
            if (!dirPath) {
                return res.status(400).json({ error: 'Directory path required' });
            }
            const fullPath = path.resolve(this.workspaceRoot, dirPath);
            // Security check
            if (!fullPath.startsWith(this.workspaceRoot)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            await fs.ensureDir(fullPath);
            this.logger.info(`Created directory: ${dirPath}`);
            res.json({
                success: true,
                path: dirPath,
                message: `Directory created: ${path.basename(dirPath)}`
            });
        }
        catch (error) {
            this.logger.error('Failed to create directory:', error);
            res.status(500).json({ error: 'Failed to create directory' });
        }
    }
    /**
     * Search files by name
     */
    async searchFiles(req, res) {
        try {
            const query = req.query.q;
            const maxResults = parseInt(req.query.limit) || 50;
            if (!query) {
                return res.status(400).json({ error: 'Search query required' });
            }
            const results = await this.searchFilesByName(query, maxResults);
            res.json({ results, query, count: results.length });
        }
        catch (error) {
            this.logger.error('Failed to search files:', error);
            res.status(500).json({ error: 'Failed to search files' });
        }
    }
    /**
     * Get project information
     */
    async getProjectInfo(req, res) {
        try {
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            let projectInfo = {
                name: path.basename(this.workspaceRoot),
                type: 'generic',
                path: this.workspaceRoot,
                hasPackageJson: false,
                hasGit: false,
                scripts: [],
                dependencies: {},
                devDependencies: {},
            };
            // Check for package.json
            if (await fs.pathExists(packageJsonPath)) {
                try {
                    const packageJson = await fs.readJson(packageJsonPath);
                    projectInfo = {
                        ...projectInfo,
                        name: packageJson.name || projectInfo.name,
                        type: 'nodejs',
                        hasPackageJson: true,
                        scripts: Object.keys(packageJson.scripts || {}),
                        dependencies: packageJson.dependencies || {},
                        devDependencies: packageJson.devDependencies || {},
                    };
                }
                catch (error) {
                    this.logger.warn('Failed to parse package.json:', error);
                }
            }
            // Check for Git
            const gitPath = path.join(this.workspaceRoot, '.git');
            projectInfo.hasGit = await fs.pathExists(gitPath);
            res.json(projectInfo);
        }
        catch (error) {
            this.logger.error('Failed to get project info:', error);
            res.status(500).json({ error: 'Failed to get project info' });
        }
    }
    /**
     * Execute project command (npm scripts, etc.)
     */
    async executeProjectCommand(req, res) {
        try {
            const { command, args = [] } = req.body;
            if (!command) {
                return res.status(400).json({ error: 'Command required' });
            }
            // Execute command in workspace directory
            const child = spawn(command, args, {
                cwd: this.workspaceRoot,
                stdio: 'pipe',
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                res.json({
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
                if (!child.killed) {
                    child.kill();
                    res.status(408).json({ error: 'Command timeout' });
                }
            }, 30000); // 30 second timeout
        }
        catch (error) {
            this.logger.error('Failed to execute command:', error);
            res.status(500).json({ error: 'Failed to execute command' });
        }
    }
    /**
     * Get Git status
     */
    async getGitStatus(req, res) {
        try {
            const child = spawn('git', ['status', '--porcelain'], {
                cwd: this.workspaceRoot,
                stdio: 'pipe',
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    const files = stdout.split('\n')
                        .filter(line => line.trim())
                        .map(line => ({
                        status: line.substring(0, 2),
                        path: line.substring(3),
                    }));
                    res.json({ files, hasChanges: files.length > 0 });
                }
                else {
                    res.status(400).json({ error: 'Not a git repository or git error' });
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to get git status:', error);
            res.status(500).json({ error: 'Failed to get git status' });
        }
    }
    /**
     * Get recent files (mock implementation)
     */
    async getRecentFiles(req, res) {
        try {
            // Simple implementation - get recently modified files
            const recentFiles = await this.getRecentlyModifiedFiles(10);
            res.json({ files: recentFiles });
        }
        catch (error) {
            this.logger.error('Failed to get recent files:', error);
            res.status(500).json({ error: 'Failed to get recent files' });
        }
    }
    /**
     * Search files by name pattern
     */
    async searchFilesByName(query, maxResults) {
        const results = [];
        const searchPattern = query.toLowerCase();
        const searchDir = async (dirPath, depth = 0) => {
            if (depth > 5 || results.length >= maxResults)
                return; // Limit depth and results
            try {
                const items = await fs.readdir(dirPath);
                for (const item of items) {
                    if (results.length >= maxResults)
                        break;
                    const itemPath = path.join(dirPath, item);
                    const relativePath = path.relative(this.workspaceRoot, itemPath);
                    // Skip hidden files and node_modules
                    if (item.startsWith('.') || item === 'node_modules')
                        continue;
                    const stats = await fs.stat(itemPath).catch(() => null);
                    if (!stats)
                        continue;
                    // Check if name matches
                    if (item.toLowerCase().includes(searchPattern)) {
                        results.push({
                            name: item,
                            path: relativePath,
                            type: stats.isDirectory() ? 'directory' : 'file',
                            modified: stats.mtime,
                        });
                    }
                    // Recursively search subdirectories
                    if (stats.isDirectory()) {
                        await searchDir(itemPath, depth + 1);
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
            }
        };
        await searchDir(this.workspaceRoot);
        return results;
    }
    /**
     * Get recently modified files
     */
    async getRecentlyModifiedFiles(limit) {
        const files = [];
        const searchDir = async (dirPath, depth = 0) => {
            if (depth > 3)
                return; // Limit depth
            try {
                const items = await fs.readdir(dirPath);
                for (const item of items) {
                    const itemPath = path.join(dirPath, item);
                    const relativePath = path.relative(this.workspaceRoot, itemPath);
                    // Skip hidden files and node_modules
                    if (item.startsWith('.') || item === 'node_modules')
                        continue;
                    const stats = await fs.stat(itemPath).catch(() => null);
                    if (!stats)
                        continue;
                    if (stats.isFile()) {
                        files.push({
                            name: item,
                            path: relativePath,
                            type: 'file',
                            modified: stats.mtime,
                            size: stats.size,
                        });
                    }
                    else if (stats.isDirectory()) {
                        await searchDir(itemPath, depth + 1);
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
            }
        };
        await searchDir(this.workspaceRoot);
        // Sort by modification time and limit results
        return files
            .sort((a, b) => b.modified.getTime() - a.modified.getTime())
            .slice(0, limit);
    }
    /**
     * Get file template based on type
     */
    getFileTemplate(template, fileName) {
        const templates = {
            typescript: `/**
 * ${fileName}
 * 
 * Description: 
 */

export class ${path.basename(fileName, '')} {
  constructor() {
    // TODO: Implement constructor
  }
}
`,
            react: `import React from 'react';

interface ${path.basename(fileName, '.tsx')}Props {
  // TODO: Define props
}

export const ${path.basename(fileName, '.tsx')}: React.FC<${path.basename(fileName, '.tsx')}Props> = () => {
  return (
    <div>
      <h1>${path.basename(fileName, '.tsx')}</h1>
    </div>
  );
};
`,
            svelte: `<script lang="ts">
  // Component logic here
</script>

<div class="component">
  <h1>${path.basename(fileName, '.svelte')}</h1>
</div>

<style>
  .component {
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
        return templates[template] || '';
    }
}
//# sourceMappingURL=workspace-api-routes.js.map