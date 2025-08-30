/**
 * Swarm Knowledge Extractor - Pre-deletion Intelligence Extraction
 *
 * Extracts valuable patterns and insights from swarm sessions before memory deletion,
 * leveraging ML tools from Brain, Neural-ML, and SPARC packages for intelligent
 * pattern recognition and knowledge preservation.
 */
import { EventEmitter } from '@claude-zen/foundation';
interface ExtractionConfig {
    enabled: boolean;
    minSessionDuration: number;
    minImportanceThreshold: number;
    mlEnabled: boolean;
    brainEnabled: boolean;
    sparcEnabled: boolean;
    extractionTimeout: number;
    preserveRawData: boolean;
}
export declare class SwarmKnowledgeExtractor extends EventEmitter {
    private logger;
    private config;
    private telemetry;
    private lifecycleManager?;
    private brainCoordinator?;
    private mlCoordinator?;
    private patternRecognizer?;
    private sparcEngine?;
    private initialized;
    constructor(config: ExtractionConfig);
    initialize(): Promise<void>;
    private recordExtractionMetrics;
    /**
     * Extract knowledge before lifecycle deletion
     */
    extractBeforeDeletion(entryId: string, entryData: unknown): Promise<void>;
    private initializeMLTools;
    private initializeBrainTools;
    private initializeSPARCTools;
    private shouldExtract;
    private shouldExtractFromEntry;
    private parseSessionData;
    private extractSuccessPatterns;
    private extractPerformanceMetrics;
    private extractLearningOutcomes;
    private extractFailurePatterns;
    private extractSPARCInsights;
    private calculateImportance;
    private calculateConfidence;
    getExtractionStats(): {
        initialized: boolean;
        mlEnabled: any;
        brainEnabled: any;
        sparcEnabled: any;
        minSessionDuration: any;
        minImportanceThreshold: any;
    };
    updateConfig(newConfig: Partial<ExtractionConfig>): void;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=swarm-knowledge-extractor.d.ts.map