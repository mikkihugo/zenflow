/**
 * Code Analysis Service
 * Professional code analysis tools integrated with Kuzu graph storage
 */

import ASTParser from './ast-parser.js';
import DependencyAnalyzer from './dependency-analyzer.js';
import DuplicateCodeDetector from './duplicate-detector.js';
import { CodeAnalysisOrchestrator } from './orchestrator.js';

export { ASTParser };
export { DependencyAnalyzer };
export { DuplicateCodeDetector };
export { CodeAnalysisOrchestrator };

// Main service interface
export class CodeAnalysisService {
  constructor(config = {}) {
    this.orchestrator = new CodeAnalysisOrchestrator(config);
  }

  async initialize() {
    return await this.orchestrator.initialize();
  }

  async analyzeCodebase(options = {}) {
    return await this.orchestrator.analyzeCodebase(options);
  }

  async analyzeFiles(filePaths, options = {}) {
    return await this.orchestrator.analyzeFiles(filePaths, options);
  }

  async query(query) {
    return await this.orchestrator.queryAnalysis(query);
  }

  async getStats() {
    return await this.orchestrator.getAnalysisStats();
  }

  async cleanup() {
    return await this.orchestrator.cleanup();
  }
}

export default CodeAnalysisService;