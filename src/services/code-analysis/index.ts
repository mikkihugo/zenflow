/**
 * Code Analysis Service
 * Professional code analysis tools integrated with Kuzu graph storage
 */

import ASTParser from './ast-parser.js';
import ComplexityAnalyzer from './complexity-analyzer.js';
import DependencyAnalyzer from './dependency-analyzer.js';
import DuplicateCodeDetector from './duplicate-detector.js';
import CodeAnalysisWatcher from './file-watcher.js';
import { CodeAnalysisOrchestrator } from './orchestrator.js';
import TreeSitterParser from './tree-sitter-parser.js';

export { ASTParser };
export { DependencyAnalyzer };
export { DuplicateCodeDetector };
export { ComplexityAnalyzer };
export { TreeSitterParser };
export { CodeAnalysisWatcher };
export { CodeAnalysisOrchestrator };

// Main service interface
export class CodeAnalysisService {
  constructor(config = {}): any {
    this.orchestrator = new CodeAnalysisOrchestrator(config);
    this.watcher = new CodeAnalysisWatcher(config);
  }

  async initialize() {
    // Set up event listeners for real-time analysis
    this.watcher.on('analysis => {
      console.warn(`📊 Real-time analysis => {
      console.warn(`🚨 Significant change detected = {}): any {
    return await this.orchestrator.analyzeCodebase(options);
  }

  async analyzeFiles(filePaths, options = {}): any {
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

  async query(query): any {
    return await this.orchestrator.queryAnalysis(query);
  }

  async getStats() {
    const orchestratorStats = await this.orchestrator.getAnalysisStats();
    const watcherStatus = this.watcher.getStatus();

    return {
      ...orchestratorStats,
      realTimeAnalysis: watcherStatus,
    };
  }

  async cleanup() {
    await this.watcher.stopWatching();
    return await this.orchestrator.cleanup();
  }
}

export default CodeAnalysisService;
