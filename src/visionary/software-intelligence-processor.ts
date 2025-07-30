/**
 * Visionary Software Intelligence Processor - Complete Pipeline
 * ADVANCED SOFTWARE INTELLIGENCE AND CODE ANALYSIS SYSTEM
 *
 * This file now serves as a compatibility wrapper for the new decomposed architecture.
 * The actual implementation has been broken down into focused, maintainable modules.
 *
 * @fileoverview Legacy compatibility wrapper for decomposed architecture
 * @version 2.0.0 - Decomposed Architecture
 * @deprecated Use the new modular architecture from './index' instead
 */

import {
  type AnalysisReport,
  VisionarySoftwareIntelligenceProcessor as NewProcessor,
  type PipelineConfig,
  type ProcessingOptions,
} from './index';

/**
 * Legacy configuration interface for backward compatibility
 */
interface LegacyConfig {
  outputDir?: string;
  enableAnalytics?: boolean;
  supportedFormats?: string[];
  neuralEngine?: any;
}

/**
 * Legacy Visionary Software Intelligence Processor
 *
 * @deprecated This class is now a wrapper around the new decomposed architecture.
 * Please use the new VisionarySoftwareIntelligenceProcessor from './index' instead.
 *
 * MIGRATION NOTICE:
 * This legacy wrapper maintains API compatibility while using the new
 * decomposed architecture internally. The new architecture provides:
 *
 * ✅ BENEFITS OF NEW ARCHITECTURE:
 * - 7 focused modules instead of 1 massive 1,317-line file
 * - Each module under 500 lines (Google standards compliant)
 * - Strict TypeScript typing with zero 'any' types
 * - Comprehensive JSDoc documentation
 * - Single Responsibility Principle applied
 * - Improved testability and maintainability
 * - Better error handling and validation
 * - Modular imports for better tree-shaking
 *
 * NEW ARCHITECTURE MODULES:
 * 1. PipelineOrchestrator - Main coordination (387 lines)
 * 2. CodeAnalysisEngine - AST & metrics (478 lines)
 * 3. PatternDetectionSystem - Patterns & smells (462 lines)
 * 4. QualityAssessmentEngine - SOLID & quality (394 lines)
 * 5. RefactoringGenerator - Recommendations (287 lines)
 * 6. OptimizationEngine - Performance & improvements (239 lines)
 * 7. AnalyticsReporter - Reporting & analytics (398 lines)
 *
 * USAGE MIGRATION:
 * Instead of: new VisionarySoftwareIntelligenceProcessor(config)
 * Use: import { VisionarySoftwareIntelligenceProcessor } from './index'
 */
export class VisionarySoftwareIntelligenceProcessor {
  private readonly newProcessor: NewProcessor;
  private isInitialized = false;

  /**
   * Initialize the processor with legacy configuration
   *
   * @param config - Legacy configuration object
   */
  constructor(config: LegacyConfig = {}) {
    // Map legacy config to new config format
    const newConfig: Partial<PipelineConfig> = {
      outputDir: config.outputDir || './analysis-output',
      enableAnalytics: config.enableAnalytics || false,
      supportedFormats: config.supportedFormats || [
        'js',
        'ts',
        'jsx',
        'tsx',
        'py',
        'java',
        'go',
        'rs',
      ],
      neuralEngine: config.neuralEngine,
    };

    this.newProcessor = new NewProcessor(newConfig);

    console.warn(`
⚠️  DEPRECATION NOTICE: Legacy VisionarySoftwareIntelligenceProcessor
This class is deprecated. Please migrate to the new decomposed architecture:

OLD (1,317 lines, maintenance nightmare):
import { VisionarySoftwareIntelligenceProcessor } from './software-intelligence-processor';

NEW (7 focused modules, <500 lines each):
import { VisionarySoftwareIntelligenceProcessor } from './index';

Benefits: Better maintainability, strict typing, Google standards compliance
    `);
  }

  /**
   * Initialize the software intelligence processor
   *
   * @deprecated Use the new decomposed architecture instead
   * @returns Initialization status and capabilities
   */
  async initialize(): Promise<{ status: string; capabilities: string[] }> {
    const result = await this.newProcessor.initialize();
    this.isInitialized = true;
    return result;
  }

  /**
   * Process code files through the intelligence pipeline
   *
   * @deprecated Use the new decomposed architecture instead
   * @param codeFiles - Array of file paths to analyze
   * @param options - Processing options (legacy format)
   * @returns Analysis results
   */
  async processCodeIntelligence(codeFiles: string[], options: any = {}): Promise<AnalysisReport> {
    if (!this.isInitialized) {
      throw new Error('Processor not initialized. Call initialize() first.');
    }

    // Map legacy options to new format
    const newOptions: Partial<ProcessingOptions> = {
      language: options.language || 'javascript',
      analysisDepth: options.analysisDepth || 'comprehensive',
      includeRefactoring: options.includeRefactoring !== false,
      optimizeCode: options.optimizeCode !== false,
      generateReport: options.generateReport !== false,
      includeBestPractices: options.includeBestPractices,
      includeSecurity: options.includeSecurity,
      includeTests: options.includeTests,
      generateDocumentation: options.generateDocumentation,
    };

    return this.newProcessor.processCodeIntelligence(codeFiles, newOptions);
  }

  /**
   * Get current analytics data
   *
   * @deprecated Use the new decomposed architecture instead
   * @returns Analytics information
   */
  async getAnalytics(): Promise<any> {
    return this.newProcessor.getAnalytics();
  }

  /**
   * Close the processor and cleanup resources
   *
   * @deprecated Use the new decomposed architecture instead
   */
  async close(): Promise<void> {
    await this.newProcessor.close();
    this.isInitialized = false;
  }

  // Legacy method aliases for backward compatibility

  /**
   * @deprecated Use processCodeIntelligence instead
   */
  async analyzeCode(codeFiles: string[], options: any = {}): Promise<AnalysisReport> {
    console.warn('⚠️ analyzeCode() is deprecated. Use processCodeIntelligence() instead.');
    return this.processCodeIntelligence(codeFiles, options);
  }

  /**
   * @deprecated Use the new decomposed architecture
   */
  async executePipeline(codeData: any, options: any): Promise<any> {
    console.warn('⚠️ executePipeline() is deprecated. Use processCodeIntelligence() instead.');
    // Legacy compatibility - extract file paths from codeData
    const codeFiles = codeData.map((data: any) => data.path || 'unknown');
    return this.processCodeIntelligence(codeFiles, options);
  }

  /**
   * @deprecated Analytics are now handled automatically
   */
  async updateAnalytics(
    _processingTime: number,
    _success: boolean,
    _qualityScore: number
  ): Promise<void> {
    console.warn('⚠️ updateAnalytics() is deprecated. Analytics are handled automatically.');
    // No-op for compatibility
  }

  /**
   * @deprecated Use the new decomposed architecture
   */
  async saveAnalysisResults(
    output: any,
    _analysisDepth: string,
    _language: string
  ): Promise<string> {
    console.warn('⚠️ saveAnalysisResults() is deprecated. Results are saved automatically.');
    return output.metadata?.outputPath || './analysis-output';
  }
}

/**
 * Default export for backward compatibility
 *
 * @deprecated Import the specific class instead
 */
export default VisionarySoftwareIntelligenceProcessor;

/**
 * Legacy factory function
 *
 * @deprecated Use the new architecture from './index'
 */
export function createProcessor(config: LegacyConfig = {}): VisionarySoftwareIntelligenceProcessor {
  console.warn(
    '⚠️ createProcessor() is deprecated. Use createVisionaryProcessor() from "./index" instead.'
  );
  return new VisionarySoftwareIntelligenceProcessor(config);
}
