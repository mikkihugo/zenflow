/**
 * CLI interface for GitHub Project Import
 */

import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { GitHubProjectImporter, ImportOptions } from './github-project-importer.js';
// Using simple console logging for now to avoid complex dependencies
const createLogger = (name: string) => ({
  info: (msg: string, ...args: any[]) => console.log(`[${name}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[${name}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[${name}] ${msg}`, ...args),
});

const logger = createLogger('GitHubImportCLI');

export interface CLIOptions {
  token: string;
  owner: string;
  repo: string;
  projectNumber?: number;
  todoFiles?: string[];
  roadmapFiles?: string[];
  docsPath?: string;
  createIssues?: boolean;
  addToProject?: boolean;
  onlyIncomplete?: boolean;
  labelPrefix?: string;
  dryRun?: boolean;
}

export class GitHubImportCLI {
  /**
   * Run the import process with CLI options
   */
  static async run(options: CLIOptions): Promise<void> {
    try {
      const importer = new GitHubProjectImporter({
        token: options.token,
        owner: options.owner,
        repo: options.repo,
        projectNumber: options.projectNumber,
      });

      // Auto-discover files if not specified
      const todoFiles = options.todoFiles || await this.discoverTodoFiles(options.docsPath);
      const roadmapFiles = options.roadmapFiles || await this.discoverRoadmapFiles(options.docsPath);

      console.log(`📝 Found ${todoFiles.length} TODO files and ${roadmapFiles.length} roadmap files`);
      
      if (todoFiles.length === 0 && roadmapFiles.length === 0) {
        console.log('❌ No TODO or roadmap files found to import');
        return;
      }

      // Show files being processed
      if (todoFiles.length > 0) {
        console.log('\n📋 TODO files:');
        todoFiles.forEach(file => console.log(`  - ${file}`));
      }
      
      if (roadmapFiles.length > 0) {
        console.log('\n🗺️  Roadmap files:');
        roadmapFiles.forEach(file => console.log(`  - ${file}`));
      }

      const importOptions: ImportOptions = {
        createIssues: options.createIssues ?? true,
        addToProject: options.addToProject ?? false,
        onlyIncomplete: options.onlyIncomplete ?? true,
        labelPrefix: options.labelPrefix,
        dryRun: options.dryRun ?? false,
      };

      if (importOptions.dryRun) {
        console.log('\n🏃 Running in DRY RUN mode - no issues will be created');
      }

      console.log('\n🚀 Starting import...');
      
      const results = await importer.importFromFiles(todoFiles, roadmapFiles, importOptions);

      // Report results
      console.log('\n📊 Import Results:');
      console.log(`\n📋 TODO Items:`);
      console.log(`  ✅ Successfully processed: ${results.todoResults.filter(r => !r.error).length}`);
      console.log(`  ❌ Failed: ${results.todoResults.filter(r => r.error).length}`);
      
      console.log(`\n🗺️  Roadmap Items:`);
      console.log(`  ✅ Successfully processed: ${results.roadmapResults.filter(r => !r.error).length}`);
      console.log(`  ❌ Failed: ${results.roadmapResults.filter(r => r.error).length}`);

      // Show created issues
      const createdIssues = [
        ...results.todoResults.filter(r => r.issueUrl && !r.issueUrl.includes('[DRY RUN]')),
        ...results.roadmapResults.filter(r => r.issueUrl && !r.issueUrl.includes('[DRY RUN]'))
      ];

      if (createdIssues.length > 0) {
        console.log(`\n🔗 Created Issues:`);
        createdIssues.forEach(result => {
          console.log(`  - ${result.item.title}: ${result.issueUrl}`);
        });
      }

      // Show errors if any
      const errors = [
        ...results.todoResults.filter(r => r.error),
        ...results.roadmapResults.filter(r => r.error)
      ];

      if (errors.length > 0) {
        console.log(`\n❌ Errors:`);
        errors.forEach(result => {
          console.log(`  - ${result.item.title}: ${result.error}`);
        });
      }

      console.log('\n✅ Import completed!');
    } catch (error) {
      logger.error('CLI execution failed:', error);
      console.error('❌ Import failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  /**
   * Auto-discover TODO files in the docs directory
   */
  private static async discoverTodoFiles(docsPath = './docs'): Promise<string[]> {
    try {
      const files: string[] = [];
      
      // Common TODO file patterns
      const todoPatterns = [
        'TODO.md',
        'todo.md',
        'TODOS.md',
        'todos.md',
      ];
      
      // Check root docs directory
      for (const pattern of todoPatterns) {
        try {
          const filePath = resolve(join(docsPath, pattern));
          const fs = await import('node:fs/promises');
          await fs.access(filePath);
          files.push(filePath);
        } catch {
          // File doesn't exist, continue
        }
      }
      
      // Look for TODO sections in other files
      const docFiles = await this.findMarkdownFiles(docsPath);
      for (const file of docFiles) {
        if (file.toLowerCase().includes('todo') && !files.includes(file)) {
          try {
            const fs = await import('node:fs/promises');
            await fs.access(file);
            files.push(file);
          } catch {
            // File doesn't exist, continue
          }
        }
      }
      
      return files;
    } catch (error) {
      logger.warn('Failed to discover TODO files:', error);
      return [];
    }
  }

  /**
   * Auto-discover roadmap files in the docs directory
   */
  private static async discoverRoadmapFiles(docsPath = './docs'): Promise<string[]> {
    try {
      const files: string[] = [];
      
      // Common roadmap file patterns
      const roadmapPatterns = [
        'ROADMAP.md',
        'roadmap.md',
        'ROADMAPS.md',
        'roadmaps.md',
        'AI_ROADMAP.md',
        'PROJECT_STATUS.md',
      ];
      
      // Check root docs directory
      for (const pattern of roadmapPatterns) {
        try {
          const filePath = resolve(join(docsPath, pattern));
          const fs = await import('node:fs/promises');
          await fs.access(filePath);
          files.push(filePath);
        } catch {
          // File doesn't exist, continue
        }
      }
      
      // Check archive directory
      const archivePath = join(docsPath, 'archive');
      for (const pattern of roadmapPatterns) {
        try {
          const filePath = resolve(join(archivePath, pattern));
          const fs = await import('node:fs/promises');
          await fs.access(filePath);
          files.push(filePath);
        } catch {
          // File doesn't exist, continue
        }
      }
      
      // Look for roadmap sections in other files
      const docFiles = await this.findMarkdownFiles(docsPath);
      for (const file of docFiles) {
        if ((file.toLowerCase().includes('roadmap') || file.toLowerCase().includes('status')) && !files.includes(file)) {
          try {
            const fs = await import('node:fs/promises');
            await fs.access(file);
            files.push(file);
          } catch {
            // File doesn't exist, continue
          }
        }
      }
      
      return files;
    } catch (error) {
      logger.warn('Failed to discover roadmap files:', error);
      return [];
    }
  }

  /**
   * Find all markdown files in a directory recursively
   */
  private static async findMarkdownFiles(dirPath: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(resolve(fullPath));
        }
      }
      
      return files;
    } catch (error) {
      logger.warn(`Failed to read directory ${dirPath}:`, error);
      return [];
    }
  }
}