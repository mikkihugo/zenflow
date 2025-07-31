/**
 * Visionary Software Intelligence System - Main Entry Point
 * 
 * Comprehensive software intelligence and code analysis system with decomposed architecture.
 * This system provides advanced code analysis, pattern detection, quality assessment,
 * and refactoring recommendations through a modular, maintainable architecture.
 *
 * @fileoverview Main entry point for the Visionary Software Intelligence System
 * @version 2.0.0 - Decomposed Architecture
 */

export type { 
  CodeFileData,
  PipelineConfig,
  PipelineResult,
  ProcessingOptions 
} from './core/pipeline-orchestrator';

// Core Components
// export { PipelineOrchestrator } from './core/pipeline-orchestrator';

// export type { 
//   ASTNode,
//   ClassData,
//   CodeAnalysisResult,
//   CodeMetrics,
//   ComplexityAnalysis,
//   DependencyAnalysis,
//   FunctionData 
// } from './engines/code-analysis-engine-modular';

// Analysis Engines
// export { CodeAnalysisEngine } from './engines/code-analysis-engine-modular';
// export type { OptimizationResult } from './engines/optimization-engine';
// export { OptimizationEngine } from './engines/optimization-engine';

// export type { 
//   AntiPattern,
//   ArchitecturalPattern,
//   ArchitectureAnalysis,
//   CodeSmell,
//   DesignPattern,
//   LanguageIdiom,
//   PatternDetectionResult 
// } from './engines/pattern-detection-system';

// export { PatternDetectionSystem } from './engines/pattern-detection-system';

// export type { 
//   QualityAssessment,
//   QualityIssue,
//   ValidationResult 
// } from './engines/quality-assessment-engine';

// export { QualityAssessmentEngine } from './engines/quality-assessment-engine';

// export type { 
//   BestPracticeRecommendation,
//   MainRefactoring,
//   MicroRefactoring,
//   OptimizationRecommendation,
//   PerformanceEnhancement,
//   RefactoringRecommendations,
//   SecurityImprovement 
// } from './generators/refactoring-generator';

// Generators
// export { RefactoringGenerator } from './generators/refactoring-generator';

// export type { 
//   AnalysisReport,
//   AnalyticsData,
//   ReportingOptions 
// } from './reporting/analytics-reporter';

// Reporting
// export { AnalyticsReporter } from './reporting/analytics-reporter';

/**
 * Main Visionary Software Intelligence Processor
 * 
 * Unified interface for the complete software intelligence system.
 * This class orchestrates all components and provides a simple API
 * for comprehensive code analysis and improvement recommendations.
 */
// export class VisionarySoftwareIntelligenceProcessor {
//   private readonly orchestrator: PipelineOrchestrator;

//   /**
//    * Initialize the Visionary Software Intelligence Processor
//    * @param config - Configuration options for the system
//    */
//   constructor(config?: any) {
//     this.orchestrator = new PipelineOrchestrator(config);
//   }

//   /**
//    * Initialize all system components
//    * @returns Initialization status and capabilities
//    */
//   async initialize(): Promise<{ status: string, capabilities: string[] }> {
//     return this.orchestrator.initialize();
//   }

//   /**
//    * Process code files through the complete intelligence pipeline
//    * 
//    * This is the main entry point for code analysis. It orchestrates
//    * the complete pipeline including:
//    * - Code analysis and metrics calculation
//    * - Pattern detection (design patterns, anti-patterns, code smells)
//    * - Architecture analysis and SOLID principles evaluation
//    * - Quality assessment and scoring
//    * - Refactoring recommendations generation
//    * - Code optimization suggestions
//    * - Comprehensive reporting and analytics
//    * 
//    * @param codeFiles - Array of file paths to analyze
//    * @param options - Processing configuration options
//    * @returns Complete analysis results with insights and recommendations
//    */
//   async processCodeIntelligence(
//     codeFiles: string[],
//     options: Partial<ProcessingOptions> = {}
//   ): Promise<AnalysisReport> {
//     return this.orchestrator.processCodeIntelligence(codeFiles, options);
//   }

//   /**
//    * Get current analytics and performance metrics
//    * @returns Analytics data including processing metrics and quality trends
//    */
//   async getAnalytics(): Promise<AnalyticsData> {
//     return this.orchestrator.getAnalytics();
//   }

//   /**
//    * Close the processor and cleanup resources
//    */
//   async close(): Promise<void> {
//     return this.orchestrator.close();
//   }
// }

// Default export for backward compatibility
// export default VisionarySoftwareIntelligenceProcessor;

/**
 * Factory function for creating a configured processor instance
 * @param config - Configuration options
 * @returns Configured processor instance
 */
// export function createVisionaryProcessor(config?: any) {
//   return new VisionarySoftwareIntelligenceProcessor(config);
// }

/**
 * Quick analysis function for simple use cases
 * @param codeFiles - Files to analyze
 * @param language - Programming language
 * @returns Analysis results
 */
// export async function quickAnalysis(
//   codeFiles: string[],
//   language: string
// ): Promise<AnalysisReport> {
//   const processor = new VisionarySoftwareIntelligenceProcessor();

//   try {
//     await processor.initialize();
//     return await processor.processCodeIntelligence(codeFiles, {
//       language,
//       analysisDepth: 'basic'
//     });
//   } finally {
//     await processor.close();
//   }
// }

/**
 * Comprehensive analysis function for detailed insights
 * @param codeFiles - Files to analyze
 * @param language - Programming language
 * @returns Detailed analysis results
 */
// export async function comprehensiveAnalysis(
//   codeFiles: string[],
//   language: string
// ): Promise<AnalysisReport> {
//   const processor = new VisionarySoftwareIntelligenceProcessor({ enableAnalytics: true });

//   try {
//     await processor.initialize();
//     return await processor.processCodeIntelligence(codeFiles, {
//       language,
//       analysisDepth: 'comprehensive'
//     });
//   } finally {
//     await processor.close();
//   }
// }