/**
 * Real-time Code Analysis Watcher
 * Monitors file changes and triggers incremental analysis
 */

import { watch } from 'fs';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class CodeAnalysisWatcher extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      watchPaths: ['src/**/*.{js,jsx,ts,tsx}'],
      ignorePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '**/*.min.js',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '.hive-mind/**'
      ],
      debounceMs: 1000, // Debounce file change events
      batchSize: 10,     // Process changes in batches
      ...config
    };

    this.watchers = new Map();
    this.changeQueue = new Map();
    this.debounceTimers = new Map();
    this.isWatching = false;
    this.orchestrator = null;
  }

  /**
   * Start watching for file changes
   */
  async startWatching(orchestrator) {
    if (this.isWatching) {
      console.log('🔍 File watcher already running');
      return;
    }

    this.orchestrator = orchestrator;
    
    console.log('🔍 Starting real-time code analysis watcher...');
    
    try {
      // Discover initial source files
      const sourceFiles = await this.discoverSourceFiles();
      
      // Set up watchers for directories
      const watchDirs = this.getWatchDirectories(sourceFiles);
      
      for (const dir of watchDirs) {
        await this.watchDirectory(dir);
      }
      
      this.isWatching = true;
      console.log(`✅ Watching ${watchDirs.length} directories for changes`);
      
      // Emit start event
      this.emit('watcher:started', {
        directories: watchDirs.length,
        files: sourceFiles.length
      });
      
    } catch (error) {
      console.error(`❌ Failed to start file watcher: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop watching for file changes
   */
  async stopWatching() {
    if (!this.isWatching) {
      return;
    }

    console.log('🛑 Stopping file watcher...');
    
    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close();
      } catch (error) {
        console.warn(`⚠️ Error closing watcher for ${path}: ${error.message}`);
      }
    }
    
    // Clear timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    
    this.watchers.clear();
    this.changeQueue.clear();
    this.debounceTimers.clear();
    this.isWatching = false;
    
    console.log('✅ File watcher stopped');
    
    // Emit stop event
    this.emit('watcher:stopped');
  }

  /**
   * Watch a specific directory
   */
  async watchDirectory(dirPath) {
    if (this.watchers.has(dirPath)) {
      return;
    }

    try {
      const watcher = watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          this.handleFileChange(eventType, path.join(dirPath, filename));
        }
      });

      watcher.on('error', (error) => {
        console.error(`❌ Watcher error for ${dirPath}: ${error.message}`);
        this.emit('watcher:error', { directory: dirPath, error });
      });

      this.watchers.set(dirPath, watcher);
      
    } catch (error) {
      console.warn(`⚠️ Could not watch directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Handle file change events
   */
  handleFileChange(eventType, filePath) {
    // Filter out ignored files
    if (!this.shouldAnalyzeFile(filePath)) {
      return;
    }

    // Debounce rapid changes to the same file
    const fileKey = filePath;
    
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
  async processFileChange(eventType, filePath) {
    try {
      console.log(`📝 File ${eventType}: ${path.relative(process.cwd(), filePath)}`);
      
      // Check if file still exists (for 'change' events)
      let fileExists = false;
      let fileStats = null;
      
      try {
        fileStats = await stat(filePath);
        fileExists = true;
      } catch (error) {
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
      this.emit('analysis:error', { file: filePath, error });
    }
  }

  /**
   * Analyze a modified file
   */
  async analyzeChangedFile(filePath) {
    if (!this.orchestrator) {
      console.warn('No orchestrator available for analysis');
      return;
    }

    try {
      console.log(`🔄 Re-analyzing modified file: ${path.basename(filePath)}`);
      
      const results = await this.orchestrator.analyzeFiles([filePath], {
        updateGraph: true
      });
      
      // Emit analysis results
      this.emit('analysis:updated', {
        type: 'file_modified',
        file: filePath,
        results
      });
      
      // Check for significant changes
      await this.detectSignificantChanges(filePath, results);
      
    } catch (error) {
      console.error(`❌ Failed to analyze modified file ${filePath}: ${error.message}`);
      this.emit('analysis:error', { file: filePath, error });
    }
  }

  /**
   * Analyze a new file
   */
  async analyzeNewFile(filePath) {
    if (!this.orchestrator) {
      console.warn('No orchestrator available for analysis');
      return;
    }

    try {
      console.log(`➕ Analyzing new file: ${path.basename(filePath)}`);
      
      const results = await this.orchestrator.analyzeFiles([filePath], {
        updateGraph: true
      });
      
      // Emit analysis results
      this.emit('analysis:updated', {
        type: 'file_added',
        file: filePath,
        results
      });
      
    } catch (error) {
      console.error(`❌ Failed to analyze new file ${filePath}: ${error.message}`);
      this.emit('analysis:error', { file: filePath, error });
    }
  }

  /**
   * Handle deleted file
   */
  async handleDeletedFile(filePath) {
    console.log(`➖ File deleted: ${path.basename(filePath)}`);
    
    // Emit deletion event
    this.emit('analysis:updated', {
      type: 'file_deleted',
      file: filePath
    });
    
    // TODO: Remove from graph database if needed
    // This would require Kuzu DELETE operations
  }

  /**
   * Detect significant changes that might affect other files
   */
  async detectSignificantChanges(filePath, results) {
    try {
      const changes = {
        newExports: [],
        removedExports: [],
        complexityChanges: [],
        dependencyChanges: []
      };

      // Check for export changes
      if (results.exports && results.exports.length > 0) {
        // This would require comparing with previous state
        // For now, we'll just emit that exports might have changed
        changes.newExports = results.exports.map(exp => exp.exported_names).flat();
      }

      // Check for high complexity functions
      if (results.functions) {
        const highComplexityFunctions = results.functions.filter(f => 
          (f.cyclomatic_complexity || 0) > 10
        );
        
        if (highComplexityFunctions.length > 0) {
          changes.complexityChanges = highComplexityFunctions;
        }
      }

      // Check for import changes
      if (results.imports && results.imports.length > 0) {
        changes.dependencyChanges = results.imports.map(imp => imp.module_name);
      }

      // Emit significant changes if any
      if (changes.newExports.length > 0 || 
          changes.complexityChanges.length > 0 || 
          changes.dependencyChanges.length > 0) {
        
        this.emit('analysis:significant_change', {
          file: filePath,
          changes
        });
      }
      
    } catch (error) {
      console.warn(`⚠️ Error detecting significant changes: ${error.message}`);
    }
  }

  /**
   * Check if file should be analyzed
   */
  shouldAnalyzeFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check file extension
    const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    if (!validExtensions.some(ext => filePath.endsWith(ext))) {
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
  async discoverSourceFiles() {
    const files = await this.getAllFiles(process.cwd());
    
    return files.filter(file => {
      const relativePath = path.relative(process.cwd(), file);
      return this.shouldAnalyzeFile(file) && relativePath.length > 0;
    });
  }

  /**
   * Get directories to watch based on source files
   */
  getWatchDirectories(sourceFiles) {
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
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    return Array.from(directories);
  }

  /**
   * Get all files recursively
   */
  async getAllFiles(dirPath) {
    const { readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = [];
    
    async function walk(currentPath) {
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
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    await walk(dirPath);
    return files;
  }

  /**
   * Get current watching status
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      watchedDirectories: Array.from(this.watchers.keys()),
      queuedChanges: this.changeQueue.size,
      pendingTimers: this.debounceTimers.size
    };
  }

  /**
   * Manually trigger analysis for specific files
   */
  async triggerAnalysis(filePaths) {
    if (!Array.isArray(filePaths)) {
      filePaths = [filePaths];
    }

    console.log(`🔄 Manually triggering analysis for ${filePaths.length} files...`);
    
    for (const filePath of filePaths) {
      if (this.shouldAnalyzeFile(filePath)) {
        await this.analyzeChangedFile(filePath);
      }
    }
  }
}

export default CodeAnalysisWatcher;