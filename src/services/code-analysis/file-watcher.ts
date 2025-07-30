/**
 * Real-time Code Analysis Watcher
 * Monitors file changes and triggers incremental analysis
 */

import { EventEmitter } from 'node:events';
import { stat } from 'node:fs/promises';
import path from 'node:path';

export class CodeAnalysisWatcher extends EventEmitter {
  constructor(_config = {}): any {
    super();
    
    this.config = {watchPaths = new Map();
    this.changeQueue = new Map();
    this.debounceTimers = new Map();
    this.isWatching = false;
    this.orchestrator = null;
  }

  /**
   * Start watching for file changes
   */
  async startWatching(orchestrator): any {
    if (this.isWatching) {
      console.warn('🔍 File watcher already running');
      return;
    }

    this.orchestrator = orchestrator;

    console.warn('🔍 Starting real-time code analysis watcher...');

    try {
      // Discover initial source files
      const sourceFiles = await this.discoverSourceFiles();
      
      // Set up watchers for directories
      const watchDirs = this.getWatchDirectories(sourceFiles);
      
      for(const dir of watchDirs) {
        await this.watchDirectory(dir);
      }
      
      this.isWatching = true;
      console.warn(`✅ Watching ${watchDirs.length} directories for changes`);
      
      // Emit start event
      this.emit('watcher = false;
    
    console.warn('✅ File watcher stopped');
    
    // Emit stop event
    this.emit('watcher = watch(dirPath, { recursive => {
        if(filename) {
          this.handleFileChange(eventType, path.join(dirPath, filename));
        }
      }
    )

    watcher.on('error', (error) => {
        console.error(`❌ Watcher error for ${dirPath}: ${error.message}`);
        this.emit('watcher = filePath;
    
    if (this.debounceTimers.has(fileKey)) {
      clearTimeout(this.debounceTimers.get(fileKey));
    }

    const timer = setTimeout(async () => {
      await this.processFileChange(eventType, filePath);
      this.debounceTimers.delete(fileKey);
    }, this.config.debounceMs);

    this.debounceTimers.set(fileKey, timer);
  }

  /**
   * Process a file change after debouncing
   */
  async processFileChange(eventType, filePath): any 
    try {
      console.warn(`📝 File ${eventType}: ${path.relative(process.cwd(), filePath)}`);

      // Check if file still exists (for 'change' events)
      let fileExists = false;
      let _fileStats = null;

      try {
        _fileStats = await stat(filePath);
        fileExists = true;
      } catch (_error) {
        // File was deleted or moved
        fileExists = false;
      }

      if (eventType === 'change' && fileExists) {
        // File was modified
        await this.analyzeChangedFile(filePath);
      } else if (eventType === 'rename') {
        if (fileExists) {
          // File was created or moved here
          await this.analyzeNewFile(filePath);
        } else {
          // File was deleted or moved away
          await this.handleDeletedFile(filePath);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing file change ${filePath}: ${error.message}`);
      this.emit('analysis = await this.orchestrator.analyzeFiles([filePath], {updateGraph = await this.orchestrator.analyzeFiles([filePath], {
        updateGraph = {newExports = results.exports.flatMap(exp => exp.exported_names);
    }

    // Check for high complexity functions
    if (results.functions) {
      const highComplexityFunctions = results.functions.filter(
        (f) => (f.cyclomatic_complexity || 0) > 10
      );

      if (highComplexityFunctions.length > 0) {
        changes.complexityChanges = highComplexityFunctions;
      }
    }

    // Check for import changes
    if (results.imports && results.imports.length > 0) {
      changes.dependencyChanges = results.imports.map((imp) => imp.module_name);
    }

    // Emit significant changes if any
    if (
      changes.newExports.length > 0 ||
      changes.complexityChanges.length > 0 ||
      changes.dependencyChanges.length > 0
    ) {
      this.emit('analysis = path.relative(process.cwd(), filePath);

      // Check file extension
      const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];
      if (!validExtensions.some((ext) => filePath.endsWith(ext))) {
        return false;
      }

      // Check ignore patterns
      for (const pattern of this.config.ignorePatterns) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        if (regex.test(relativePath)) {
          return false;
        }
      }

      return true;
    }

    /**
     * Discover source files in the project
     */
    async;
    discoverSourceFiles();
    {
      const files = await this.getAllFiles(process.cwd());

      return files.filter((file) => {
        const relativePath = path.relative(process.cwd(), file);
        return this.shouldAnalyzeFile(file) && relativePath.length > 0;
      });
    }

    /**
     * Get directories to watch based on source files
     */
    getWatchDirectories(sourceFiles);
    : any
    {
      const directories = new Set();

      for (const file of sourceFiles) {
        const dir = path.dirname(file);
        directories.add(dir);
      }

      // Also add common source directories
      const commonDirs = ['src', 'lib', 'app', 'components'];
      for (const dir of commonDirs) {
        const fullPath = path.join(process.cwd(), dir);
        try {
          // Only add if directory exists
          directories.add(fullPath);
        } catch (_error) {
          // Directory doesn't exist, skip
        }
      }

      return Array.from(directories);
    }

    /**
     * Get all files recursively
     */
    async;
    getAllFiles(dirPath);
    : any
    {
      const { readdir, stat } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const files = [];

      async function walk(currentPath): any {
        try {
          const entries = await readdir(currentPath);

          for (const entry of entries) {
            const fullPath = join(currentPath, entry);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
              // Skip common ignored directories
              if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
                await walk(fullPath);
              }
            } else {
              files.push(fullPath);
            }
          }
        } catch (_error) {
          // Skip directories we can't read
        }
      }

      await walk(dirPath);
      return files;
    }

    /**
     * Get current watching status
     */
    getStatus();
    return {isWatching = [filePaths];

    console.warn(`🔄 Manually triggering analysis for ${filePaths.length} files...`);

    for (const filePath of filePaths) {
      if (this.shouldAnalyzeFile(filePath)) {
        await this.analyzeChangedFile(filePath);
      }
    }
}

export default CodeAnalysisWatcher;
