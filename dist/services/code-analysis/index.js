/**
 * Code Analysis Service
 * Professional code analysis tools integrated with Kuzu graph storage
 */

import ASTParser from './ast-parser.js';
import DependencyAnalyzer from './dependency-analyzer.js';
import DuplicateCodeDetector from './duplicate-detector.js';
import ComplexityAnalyzer from './complexity-analyzer.js';
import TreeSitterParser from './tree-sitter-parser.js';
import CodeAnalysisWatcher from './file-watcher.js';
import { CodeAnalysisOrchestrator } from './orchestrator.js';

export { ASTParser };
export { DependencyAnalyzer };
export { DuplicateCodeDetector };
export { ComplexityAnalyzer };
export { TreeSitterParser };
export { CodeAnalysisWatcher };
export { CodeAnalysisOrchestrator };

// Main service interface
export class CodeAnalysisService {
  constructor(config = {}) {
    this.orchestrator = new CodeAnalysisOrchestrator(config);
    this.watcher = new CodeAnalysisWatcher(config);
  }

  async initialize() {
    const result = await this.orchestrator.initialize();
    
    // Set up event listeners for real-time analysis
    this.watcher.on('analysis:updated', (event) => {
      console.log(`📊 Real-time analysis: ${event.type} - ${event.file}`);
    });
    
    this.watcher.on('analysis:significant_change', (event) => {
      console.log(`🚨 Significant change detected: ${event.file}`);
    });
    
    return result;
  }

  async analyzeCodebase(options = {}) {
    return await this.orchestrator.analyzeCodebase(options);
  }

  async analyzeFiles(filePaths, options = {}) {
    return await this.orchestrator.analyzeFiles(filePaths, options);
  }

  async startRealTimeAnalysis() {
    if (!this.orchestrator.isInitialized) {
      await this.initialize();
    }
    return await this.watcher.startWatching(this.orchestrator);
  }

  async stopRealTimeAnalysis() {
    return await this.watcher.stopWatching();
  }

  async query(query) {
    return await this.orchestrator.queryAnalysis(query);
  }

  async getStats() {
    const orchestratorStats = await this.orchestrator.getAnalysisStats();
    const watcherStatus = this.watcher.getStatus();
    
    return {
      ...orchestratorStats,
      realTimeAnalysis: watcherStatus
    };
  }

  async cleanup() {
    await this.watcher.stopWatching();
    return await this.orchestrator.cleanup();
  }
}

export default CodeAnalysisService;