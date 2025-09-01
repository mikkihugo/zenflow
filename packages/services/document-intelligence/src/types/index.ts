/**
 * @fileoverview Document Intelligence Types
 * 
 * Unified type system for document intelligence service including semantic analysis,
 * strategic vision, document processing, and swarm integration types.
 */


// Re-export types from core processing
export type * from '../core/document-driven-system';
export type * from '../core/document-processor';
export type * from '../core/document-workflow-system';
export type * from '../intelligence/segmentation-engine';
// Re-export types from intelligence modules
export type * from '../intelligence/semantic-classifier';
// Re-export types from scanning
export type * from '../scanning/enhanced-document-scanner';
// Re-export types from services
export type * from '../services/strategic-vision-service';

/**
 * Document intelligence service types
 */
export interface DocumentIntelligenceConfig {
 enableSemanticAnalysis?:boolean;
 enableStrategicVision?:boolean;
 enableWorkflowProcessing?:boolean;
 enableSwarmIntegration?:boolean;
 confidenceThreshold?:number;
 maxSegmentSize?:number;
 preserveAlgorithmBlocks?:boolean;
}

/**
 * Document analysis request options
 */
export interface DocumentAnalysisOptions {
 content:string;
 projectId?:string;
 enableSemanticAnalysis?:boolean;
 enableStrategicAnalysis?:boolean;
 enableScanning?:boolean;
 enableSegmentation?:boolean;
}

/**
 * Semantic analysis options
 */
export interface SemanticAnalysisOptions {
 content:string;
 enablePatternRecognition?:boolean;
 enableDensityAnalysis?:boolean;
 customPatterns?:any;
}

/**
 * Document segmentation options
 */
export interface DocumentSegmentationOptions {
 content:string;
 strategy?:string;
 preserveAlgorithmBlocks?:boolean;
 maxSegmentSize?:number;
}

/**
 * Strategic vision coordination options
 */
export interface VisionCoordinationOptions {
 projectId:string;
 includeTaskGeneration?:boolean;
 includeDocumentLinks?:boolean;
}

/**
 * Document processing options
 */
export interface DocumentProcessingOptions {
 path:string;
 enableWorkflow?:boolean;
 generateTasks?:boolean;
 saveToDatabase?:boolean;
}

/**
 * Pattern scanning options
 */
export interface PatternScanningOptions {
 rootPath:string;
 includePatterns?:string[];
 excludePatterns?:string[];
 enabledPatterns?:string[];
 generateSwarmTasks?:boolean;
}

/**
 * Service status information
 */
export interface ServiceStatus {
 initialized:boolean;
 enabledCapabilities:string[];
 componentStatus:Record<string, boolean>;
}

/**
 * Processing metrics
 */
export interface ProcessingMetrics {
 totalProcessingTime:number;
 confidenceScore:number;
 qualityScore:number;
}

/**
 * Document intelligence capability
 */
export type DocumentIntelligenceCapability =
 || 'semantic-analysis') || 'strategic-vision') || 'workflow-processing') || 'swarm-integration') || 'pattern-recognition') || 'intelligent-segmentation;

/**
 * Analysis result confidence levels
 */
export type ConfidenceLevel =
 || 'low') || 'medium') || 'high') || 'very-high;

/**
 * Document complexity metrics
 */
export interface DocumentComplexityMetrics {
 algorithmDensity:number;
 conceptComplexity:number;
 technicalDepth:number;
 structuralComplexity:number;
}

/**
 * Content analysis result
 */
export interface ContentAnalysisResult {
 documentType:string;
 confidence:number;
 complexity:DocumentComplexityMetrics;
 patterns:{
 detected:string[];
 confidence:Record<string, number>;
 weights:Record<string, number>;
};
 recommendedActions:string[];
}

/**
 * Document intelligence event types
 */
export type DocumentIntelligenceEvent =
 || 'initialized') || 'analysis_started') || 'analysis_complete') || 'classification_complete') || 'segmentation_complete') || 'scanning_complete') || 'processing_complete') || 'error') || 'shutdown;

/**
 * Event payload types
 */
export interface EventPayloads {
 initialized:{ config: DocumentIntelligenceConfig};
 analysis_started:{ options: DocumentAnalysisOptions};
 analysis_complete:{ result: any};
 classification_complete:{ classification: any};
 segmentation_complete:{ segmentation: any};
 scanning_complete:{ scanResults: any};
 processing_complete:{ processingResult: any};
 error:{ error: Error; context?: string};
 shutdown:{};
}

/**
 * Document intelligence error types
 */
export class DocumentIntelligenceError extends Error {
 constructor(
 message:string,
 public readonly code:string,
 public readonly context?:any
 ) {
 super(message);
 this.name = 'DocumentIntelligenceError';
}
}

/**
 * Service component types
 */
export type ServiceComponent =
 || 'semanticClassifier') || 'segmentationEngine') || 'visionService') || 'documentScanner') || 'documentProcessor;

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
 isValid:boolean;
 errors:string[];
 warnings:string[];
 suggestions:string[];
}