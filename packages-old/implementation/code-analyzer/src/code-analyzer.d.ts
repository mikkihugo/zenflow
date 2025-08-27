/**
 * @fileoverview Live Code Analyzer - Core Implementation
 * Real-time code analysis using foundation utilities and strategic facades
 */
import { type Entity, type LiteralUnion, type Merge, type Priority, type Result } from '@claude-zen/foundation';
import type { CodeAnalysisOptions, LiveAnalysisSession, SupportedLanguage } from './types/code-analysis';
type AnalysisMode = LiteralUnion<'intelligent|fast|thorough|realtime', string>;
type AnalysisPriority = Priority;
interface BaseAnalysisConfig extends Partial<Entity> {
    analysisMode: AnalysisMode;
    realTimeAnalysis: boolean;
    enableWatching: boolean;
    enableAIRecommendations: boolean;
    maxFileSize: number;
    excludePatterns: string[];
    languages: SupportedLanguage[];
    batchSize: number;
    throttleMs: number;
    priority: AnalysisPriority;
}
type EnhancedAnalysisOptions = Merge<Partial<BaseAnalysisConfig>, Partial<CodeAnalysisOptions>>;
/**
 * Live Code Analyzer - Real-time code analysis with AI insights
 *
 * Uses strategic facades for comprehensive analysis:
 * - Foundation: Logging, error handling, type safety
 * - Intelligence: AI-powered analysis and recommendations
 * - Operations: Performance tracking and telemetry
 * - Infrastructure: Data persistence and event coordination
 */
export declare class CodeAnalyzer {
    private readonly repositoryPath;
    private readonly _project;
    private brainSystem?;
    private performanceTracker?;
    private databaseSystem?;
    private eventSystem?;
    constructor(repositoryPath: string);
    /**
     * Initialize all strategic facade systems
     */
    private initializeFacades;
    /**
     * Start live analysis session with real-time file watching
     */
    startLiveAnalysis(options?: Partial<EnhancedAnalysisOptions>): Promise<Result<LiveAnalysisSession, Error>>;
    result: any;
    suggestions: any;
    if(this: any, currentSession: any): void;
    logger: any;
    debug(: any, { ': filePath, absolutePath, language, analysisTime: result, analysisTime, }: {
        "": any;
        absolutePath: any;
        language: any;
        analysisTime: any;
    }): any;
}
export { $ };
//# sourceMappingURL=code-analyzer.d.ts.map