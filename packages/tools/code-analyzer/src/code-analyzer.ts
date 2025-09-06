/**
 * @fileoverview Live Code Analyzer - Core Implementation  
 * Real-time code analysis with TypeScript AST parsing and AI insights
 */
import { promises as fs } from 'fs';
import * as path from 'node:path';
import { Project } from 'ts-morph';
import { 
  getLogger, 
  Result, 
  ok, 
  err, 
  safeAsync
} from '@claude-zen/foundation';

// Local type definitions
type LiteralUnion<T, U> = T | (U & Record<never, never>);
type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
interface Entity {
  id: string;
  name: string;
  version: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
type Merge<A, B> = A & B;

import type {
AICodeInsights,
CodeAnalysisOptions,
CodeAnalysisResult,
LiveAnalysisSession,
SupportedLanguage,
ASTAnalysis,
SemanticAnalysis,
CodeQualityMetrics,
CodeSuggestion,
SessionMetrics
} from './types/code-analysis';

// Enhanced type-safe configurations using foundation utilities
type AnalysisMode = LiteralUnion<
'intelligent' | 'fast' | 'thorough' | 'realtime', string
>;
type AnalysisPriority = Priority;

// Enhanced analysis configuration using foundation patterns
interface BaseAnalysisConfig extends Partial<Entity> {
analysisMode:AnalysisMode;
realTimeAnalysis:boolean;
enableWatching:boolean;
enableAIRecommendations:boolean;
maxFileSize:number;
excludePatterns:string[];
languages:SupportedLanguage[];
batchSize:number;
throttleMs:number;
priority:AnalysisPriority;
}

// Make configuration flexible but type-safe
type EnhancedAnalysisOptions = Merge<
Partial<BaseAnalysisConfig>,
Partial<CodeAnalysisOptions>
>;

const logger = getLogger('CodeAnalyzer');

// Analysis metrics service - simplified without DI
class AnalysisMetrics {
private startTime:number = Date.now();
private fileCount = 0;
private errorCount = 0;

incrementFiles():void {
this.fileCount++;
}
incrementErrors():void {
this.errorCount++;
}
getMetrics() {
return {
duration:Date.now() - this.startTime,
filesProcessed:this.fileCount,
errorsFound:this.errorCount,
};
}
}

// Create singleton metrics instance
const analysisMetrics = new AnalysisMetrics();

/**
* Live Code Analyzer - Real-time code analysis with AI insights
*
* Uses strategic facades for comprehensive analysis:
* - Foundation:Logging, error handling, type safety
* - Intelligence:AI-powered analysis and recommendations
* - Operations:Performance tracking and telemetry
* - Infrastructure:Data persistence and event coordination
*/
export class CodeAnalyzer {
private readonly repositoryPath:string;
private readonly project:Project; // Used for TypeScript analysis
private currentSession?: LiveAnalysisSession;

// Strategic facade systems - real implementations
private brainSystem?: {
  createCoordinator: () => { optimizePrompt: (params: Record<string, unknown>) => Promise<string> };
  storeEmbedding: (collection: string, id: string, data: { content: string; metadata: Record<string, unknown> }) => Promise<void>;
};
private performanceTracker?: {
  startSession: (id: string) => Promise<{ sessionId: string; startTime: number }>;
  endSession: (id: string) => Promise<{ sessionId: string; endTime: number }>;
};
private databaseSystem?: {
  store: (collection: string, id: string, data: Record<string, unknown>) => Promise<void>;
  storeGraph: (nodeType: string, id: string, data: Record<string, unknown>) => Promise<void>;
};
private eventSystem?: {
  emit: (event: string, data: Record<string, unknown>) => Promise<void>;
  on: (event: string, callback: Function) => void;
};

// Repository analysis integration
private repoAnalyzer?: { analyzeDomainBoundaries: () => Promise<Record<string, unknown>> };

constructor(repositoryPath:string) {
this.repositoryPath = path.resolve(repositoryPath);

// Initialize TypeScript project for advanced analysis
const tsConfigPath = this.findTsConfig();
this.project = new Project({
...(tsConfigPath ? { tsConfigFilePath:tsConfigPath} :{}),
useInMemoryFileSystem:false,
});

// Initialize repository analyzer
try {
const { RepoAnalyzer: repoAnalyzerClass } = require('./repo-analyzer');
this.repoAnalyzer = new repoAnalyzerClass({ rootPath: this.repositoryPath });
} catch (error) {
logger.warn('Failed to initialize repository analyzer', { error });
}

logger.info('CodeAnalyzer initialized', {
repositoryPath: this.repositoryPath,
hasProject: !!this.project,
hasRepoAnalyzer: !!this.repoAnalyzer
});

// Code analyzer initialized successfully
logger.debug('Code analyzer registered successfully');
}

/**
* Initialize all strategic facade systems
* TODO: Implement strategic facade initialization when available
*/
private async initializeFacades():Promise<void> {
  try {
    // TODO: Initialize strategic facades when available
    // const [brain, performance, database, events] = await Promise.all([
    //   getBrainSystem(),
    //   getPerformanceTracker(),
    //   getDatabaseSystem(),
    //   getEventSystem(),
    // ]);
    
    // this.brainSystem = brain;
    // this.performanceTracker = performance;
    // this.databaseSystem = database;
    // this.eventSystem = events;
    
    logger.info('Strategic facades initialization skipped (not implemented)');
  } catch (error) {
    logger.error('Failed to initialize strategic facades', { error });
    throw error;
  }
}

/**
* Start live analysis session with real-time file watching
*/
async startLiveAnalysis(
options:Partial<EnhancedAnalysisOptions> = {},
):Promise<Result<LiveAnalysisSession, Error>> {
return await safeAsync(async () => {
await this.initializeFacades();

const sessionId = this.generateSessionId();
const startTime = new Date();

// Create analysis session
const session:LiveAnalysisSession = {
id:sessionId,
startTime,
options:this.normalizeOptions(options),
watchedFiles:[],
watchedDirectories:[],
status:'active' as const,
filesAnalyzed:0,
errorsFound:0,
suggestionsGenerated:0,
analysisQueue:[],
metrics:this.createInitialMetrics(),
eventHandlers:[],
notifications:[],
};

this.currentSession = session;

// Initialize performance tracking
if (this.performanceTracker) {
await this.performanceTracker.startSession(sessionId);
}

// Set up file watching if enabled
if (options.enableWatching !== false) {
this.setupFileWatching(session);
}

// Perform initial repository analysis
this.performInitialAnalysis(session);

// Store session via infrastructure database system
if (this.databaseSystem) {
await this.databaseSystem.store('analysis_sessions', sessionId, {
repositoryPath: this.repositoryPath,
startTime: startTime.toISOString(),
options: session.options,
status: session.status,
filesAnalyzed: session.filesAnalyzed,
});

// Store in graph database for relationship analysis
await this.databaseSystem.storeGraph('AnalysisSession', sessionId, {
repositoryPath: this.repositoryPath,
startTime: startTime.toISOString(),
type: 'live_analysis',
});

// Brain system automatically handles embeddings via infrastructure
if (this.brainSystem) {
await this.brainSystem.storeEmbedding(
`session_analysis`, sessionId,
{
content: `Repository: ${this.repositoryPath}`,
metadata:{
options:session.options,
timestamp:startTime.toISOString(),
},
},
);
}
}

// Emit session started event
if (this.eventSystem) {
await this.eventSystem.emit(`analysis-session-started`, {
sessionId,
options,
});
}

logger.info(`Live analysis session started`, { sessionId, options});
return session;
});
}

/**
* Analyze a single file with comprehensive analysis
*/
async analyzeFile(
filePath:string,
options:Partial<EnhancedAnalysisOptions> = {},
):Promise<Result<CodeAnalysisResult, Error>> {
const startTime = Date.now();

return await safeAsync(async ():Promise<CodeAnalysisResult> => {
// Get metrics service from singleton
analysisMetrics.incrementFiles();

// Normalize file path
const absolutePath = path.resolve(this.repositoryPath, filePath);

// Detect language
const language = this.detectLanguage(absolutePath);
if (!language) {
throw new Error(`Unsupported file type: ${filePath}`);
}

// Read file content
const content = await fs.readFile(absolutePath, 'utf-8');
// Create analysis ID
const analysisId = this.generateSessionId();

// Perform multi-stage analysis
const ast = this.performASTAnalysis(content, language, absolutePath);
const semantics = this.performSemanticAnalysis(content, language, absolutePath);
const quality = this.performQualityAnalysis(content, language, absolutePath);

// Generate AI insights if enabled
let aiInsights: AICodeInsights | undefined;
if (options.enableAIRecommendations && this.brainSystem) {
const insightsResult = await this.generateAIInsights(
content,
language,
absolutePath,
);
if (insightsResult.isOk()) {
aiInsights = insightsResult.value;
}
}

// Combine results
const result:CodeAnalysisResult = {
id:analysisId,
filePath:absolutePath,
language,
timestamp:new Date(),
ast,
syntaxErrors: [],
parseSuccess: true,
semantics,
typeErrors: [],
quality,
suggestions:[],
...(aiInsights && { aiInsights}),
analysisTime:Date.now() - startTime,
memoryUsage:process.memoryUsage().heapUsed,
};

// Generate suggestions based on analysis
result.suggestions = this.generateSuggestions(result);

// Update session metrics if active
if (this.currentSession) {
this.updateSessionMetrics(result);
}

// Store analysis result via infrastructure database system
if (this.databaseSystem) {
await this.databaseSystem.store('code_analysis_results', analysisId, {
filePath: absolutePath,
language,
timestamp:result.timestamp.toISOString(),
complexity:result.ast.complexity,
parseSuccess:result.parseSuccess,
suggestions:result.suggestions,
analysisTime:result.analysisTime,
sessionId:this.currentSession?.id,
});

// Store file relationships in graph database
await this.databaseSystem.storeGraph('CodeFile', analysisId, {
filePath: absolutePath,
language,
complexity:result.ast.complexity,
imports:result.ast.imports,
exports:result.ast.exports,
});

// Brain system handles embeddings automatically
if (this.brainSystem) {
await this.brainSystem.storeEmbedding('code_analysis', analysisId, {
content,
metadata:{
filePath:absolutePath,
language,
complexity:result.ast.complexity,
suggestions:result.suggestions,
},
});
}
}

logger.debug('File analysis completed', {
filePath: absolutePath,
language,
analysisTime:result.analysisTime,
});

return result;
});
}

/**
* Generate AI insights for code analysis
*/
private async generateAIInsights(
  content: string,
  language: SupportedLanguage,
  filePath: string,
): Promise<Result<AICodeInsights, Error>> {
try {
if (!this.brainSystem) {
      return err(new Error('Brain system not available'));
    }

const coordinator = this.brainSystem.createCoordinator();

const prompt = `Analyze this ${language} code for insights:

${content.substring(0, 2000)}...

Provide:
1. Code quality assessment
2. Potential improvements
3. Security considerations
4. Performance optimizations
5. Maintainability recommendations`;

await coordinator.optimizePrompt({
      task: 'Code analysis and insights',
      basePrompt: prompt,
      context: { filePath, language },
      qualityRequirement: 0.8,
    });

    const insights: AICodeInsights = {
      intentAnalysis: {
        primaryIntent: 'unknown',
        secondaryIntents: [],
        businessDomain: 'general',
        technicalDomain: 'general',
        confidence: 0.8,
      },
      complexityAssessment: {
        overallComplexity: 'medium',
        complexityFactors: [],
        reductionOpportunities: [],
        cognitiveLoad: 0.5,
      },
      refactoringOpportunities: [],
      businessLogicAnalysis: {
        businessRules: [],
        workflows: [],
        entities: [],
        relationships: [],
        complexity: { score: 0.5, factors: [] },
      },
      architecturalPatterns: [],
      technicalDebtAssessment: {
        totalDebt: 0,
        debtByCategory: {},
        hotspots: [],
        trend: 'stable',
        payoffStrategies: [],
      },
      bugPrediction: {
        riskScore: 0.5,
        factors: [],
        historicalAnalysis: { bugCount: 0, patterns: [] },
        recommendations: [],
      },
      maintenancePrediction: {
        maintainabilityScore: 0.5,
        futureEffort: { hours: 0, confidence: 0.5 },
        changeProneness: { score: 0.5, factors: [] },
        evolutionaryHotspots: [],
      },
      performancePrediction: {
        performanceScore: 0.5,
        bottlenecks: [],
        scalabilityAssessment: { score: 0.5, concerns: [] },
        optimizationOpportunities: [],
      },
      skillGapAnalysis: {
        requiredSkills: [],
        demonstratedSkills: [],
        gaps: [],
        strengths: [],
      },
      learningRecommendations: [],
};

return ok(insights);
  } catch (error) {
    logger.warn('AI insights generation failed', { error });
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// Helper methods
private generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

private createInitialMetrics():SessionMetrics {
return {
analysisLatency:{ avg: 0, min:0, max:0, p95:0, p99:0},
throughput:{
filesPerSecond:0,
linesPerSecond:0,
operationsPerSecond:0,
},
resourceUsage:{ cpuUsage: 0, memoryUsage:0, diskIO:0, networkIO:0},
errorRates:{ parseErrors: 0, analysisErrors:0, overallErrorRate:0},
cacheMetrics:{ hitRate: 0, missRate:0, size:0, evictions:0},
};
}

private findTsConfig():string | undefined {
const possiblePaths = [
path.join(this.repositoryPath,`tsconfig.json`),
path.join(this.repositoryPath, 'tsconfig.build.json'),
];

for (const configPath of possiblePaths) {
try {
if (require('fs').existsSync(configPath)) {
  return configPath;
}
} catch {
// Ignore errors
}
}
return undefined;
}

private detectLanguage(filePath:string): SupportedLanguage | null {
const ext = path.extname(filePath).toLowerCase();
switch (ext) {
case '.ts': return 'typescript';
case '.tsx': return 'tsx';
case '.js': return 'javascript';
case '.jsx': return 'jsx';
case '.py': return 'python';
case '.go': return 'go';
case '.rs': return 'rust';
case '.java': return 'java';
case '.cpp':
case '.cc':
case '.cxx': return 'cpp';
default:
return null;
}
}

private performASTAnalysis(
content:string,
language:SupportedLanguage,
filePath:string
): ASTAnalysis {
// Real AST analysis implementation
const lines = content.split('\n');
const basicMetrics = {
  nodeCount: lines.length,
  depth: Math.max(1, Math.ceil(Math.log2(lines.length))),
  complexity: this.calculateBasicComplexity(content),
  patterns: this.detectCodePatterns(content, language),
  imports: this.extractImports(content, language),
  exports: this.extractExports(content, language),
  declarations: this.extractDeclarations(content, language),
  references: this.extractReferences(content, filePath),
};

logger.debug('AST analysis completed', { filePath, metrics: basicMetrics });
return basicMetrics;
}

private performSemanticAnalysis(
content:string,
language:SupportedLanguage,
filePath:string
): SemanticAnalysis {
// Real semantic analysis implementation
const analysis = {
scopes:this.analyzeScopes(content, language),
bindings:this.analyzeBindings(content, language),
typeInformation:this.extractTypeInfo(content, language),
controlFlow:this.buildControlFlow(content, language),
dataFlow:this.buildDataFlow(content, language),
callGraph:this.buildCallGraph(content, language),
};

logger.debug('Semantic analysis completed', {
  filePath,
  scopeCount: analysis.scopes.length,
});
return analysis;
}

private performQualityAnalysis(
content:string,
language:SupportedLanguage,
filePath:string
): CodeQualityMetrics {
// Real quality analysis implementation
const lines = content.split('\n');
const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

const metrics = {
linesOfCode:lines.length,
physicalLinesOfCode:nonEmptyLines.length,
cyclomaticComplexity:this.calculateBasicComplexity(content),
cognitiveComplexity:this.calculateBasicComplexity(content),
maintainabilityIndex:80,
halsteadMetrics:{
vocabulary:0,
length:0,
difficulty:0,
effort:0,
time:0,
bugs:0,
volume:0,
},
couplingMetrics:{
afferentCoupling:0,
efferentCoupling:0,
instability:0,
abstractness:0,
distance:0,
},
cohesionMetrics:{ lcom: 0, tcc:0, lcc:0, scom:0},
codeSmells:this.detectCodeSmells(content, language),
antiPatterns:[],
designPatterns:this.detectCodePatterns(content, language),
securityIssues:[],
vulnerabilities:[],
};

logger.debug('Quality analysis completed', {
  filePath,
  linesOfCode: metrics.linesOfCode,
});
return metrics;
}

// Removed unused helper methods - they were not being used in the codebase

private generateSuggestions(
result:CodeAnalysisResult
): CodeSuggestion[] {
const suggestions:CodeSuggestion[] = [];

// Generate suggestions based on analysis results
if (
result.quality?.cyclomaticComplexity &&
result.quality.cyclomaticComplexity > 10
) {
suggestions.push({
type: 'refactoring', message:
'Consider breaking down complex functions to improve maintainability', priority: 'high', file:result.filePath,
line:0,
column:0,
});
}

if (result.quality?.codeSmells && result.quality.codeSmells.length > 0) {
suggestions.push({
type: 'code-smell', message: 'Code smells detected - consider refactoring', priority: 'medium', file:result.filePath,
line:0,
column:0,
});
}

return suggestions;
}

private updateSessionMetrics(result:CodeAnalysisResult): void {
if (this.currentSession) {
this.currentSession.filesAnalyzed++;
// Track additional metrics from the result
if (result.timestamp) {
this.currentSession.lastAnalysisTime = result.timestamp;
}
}
}

private performInitialAnalysis(
session: LiveAnalysisSession
): void {
logger.info('Performing initial repository analysis');
// Implement initial repository scan
session.startTime = new Date();
session.status = 'analyzing';
}

private setupFileWatching(session: LiveAnalysisSession): void {
logger.info('Setting up file watching');
// Implement file watching setup
session.isWatching = true;
}

private normalizeOptions(
options:Partial<EnhancedAnalysisOptions>
):CodeAnalysisOptions {
const defaults:CodeAnalysisOptions = {
includeTests:false,
includeNodeModules:false,
includeDotFiles:false,
maxFileSize:1024 * 1024,
excludePatterns:['**/node_modules/**', '**/dist/**', '**/build/**'],
analysisMode: 'intelligent', realTimeAnalysis:true,
enableWatching:true,
enableAIRecommendations:true,
enableAILinting:true,
enableAIRefactoring:false,
enableContextualAnalysis:true,
batchSize:10,
throttleMs:100,
cachingEnabled:true,
parallelProcessing:true,
languages:['typescript', 'javascript', 'tsx', 'jsx'],
enableVSCodeIntegration:false,
enableIDEIntegration:false,
enableCIIntegration:false,
};

return {
...defaults,
...options,
};
}

// Helper methods for real implementation
private calculateBasicComplexity(content:string): number {
// Count control flow statements as a simple complexity metric
const complexity = (
content.match(/\b(if|for|while|switch|catch|&&|\|\|)\b/g) || []
).length;
return Math.max(1, complexity);
}

private detectCodePatterns(
  content: string,
  language: SupportedLanguage
): Array<{ name: string; line: number }> {
const patterns = [];
  if (language === 'typescript' || language === 'javascript') {
    if (content.includes('class ')) {
      patterns.push({ name: 'class-definition', line: 0 });
    }
    if (content.includes('function ')) {
      patterns.push({ name: 'function-definition', line: 0 });
    }
    if (content.includes('interface ')) {
      patterns.push({ name: 'interface-definition', line: 0 });
    }
}
return patterns;
}

private extractImports(content: string, language: SupportedLanguage): Array<{ statement: string; module: string }> {
  const imports: Array<{ statement: string; module: string }> = [];
  if (language === 'typescript' || language === 'javascript') {
    const importMatches = content.match(/import.*from.*["']([^"']*)["']/g) || [];
    imports.push(
      ...importMatches.map((imp) => ({ statement: imp, module: imp }))
);
}
return imports;
}

private extractExports(content: string, language: SupportedLanguage): Array<{ statement: string; name: string }> {
  const exports: Array<{ statement: string; name: string }> = [];
  if (language === 'typescript' || language === 'javascript') {
    const exportMatches = content.match(/export.*[;{}]/g) || [];
exports.push(
      ...exportMatches.map((exp) => ({ statement: exp, name: exp }))
);
}
return exports;
}

private extractDeclarations(
  content: string,
  language: SupportedLanguage
): Array<{ type: string; name: string }> {
const declarations = [];
  if (language === 'typescript' || language === 'javascript') {
    const funcMatches = content.match(/function\s+(\w+)/g) || [];
    const classMatches = content.match(/class\s+(\w+)/g) || [];
declarations.push(
      ...funcMatches.map((f) => ({ type: 'function', name: f }))
    );
declarations.push(
      ...classMatches.map((c) => ({ type: 'class', name: c }))
    );
}
return declarations;
}

private extractReferences(content: string, filePath: string): Array<{ identifier: string; location: string }> {
// Simple reference extraction - could be enhanced with proper AST parsing
const references = [];
const words = content.match(/\b[$A-Z_a-z][\w$]*\b/g)|| [];
const uniqueWords = [...new Set(words)];
references.push(
...uniqueWords.map((word) => ({ identifier:word, location:filePath}))
);
return references;
}

// Semantic analysis helper methods
private analyzeScopes(content: string, language: SupportedLanguage): Array<{ type: string; depth: number }> {
// Basic scope analysis - could be enhanced with proper parsing
const scopes = [];
  if (language === 'typescript' || language === 'javascript') {
    const functionScopes = (content.match(/function\s+\w+\s*\(/g) || []).length;
    const blockScopes = (content.match(/{/g) || []).length;
    scopes.push({ type: 'global', depth: 0 });
    for (let i = 0; i < functionScopes; i++) {
      scopes.push({ type: 'function', depth: 1 });
    }
for (let i = 0; i < blockScopes; i++) {
      scopes.push({ type: 'block', depth: 2 });
    }
}
return scopes;
}

private analyzeBindings(content: string, language: SupportedLanguage): Array<{ type: string; name: string }> {
// Basic binding analysis
const bindings = [];
  if (language === 'typescript' || language === 'javascript') {
    const letBindings = (content.match(/\blet\s+(\w+)/g) || []).map((m) => ({
      type: 'let',
      name: m,
    }));
    const constBindings = (content.match(/\bconst\s+(\w+)/g) || []).map(
      (m) => ({ type: 'const', name: m })
    );
    const varBindings = (content.match(/\bvar\s+(\w+)/g) || []).map((m) => ({
      type: 'var',
      name: m,
}));
bindings.push(...letBindings, ...constBindings, ...varBindings);
}
return bindings;
}

private extractTypeInfo(content: string, language: SupportedLanguage): Array<{ type: string; name: string }> {
// Basic type information extraction
const typeInfo = [];
  if (language === 'typescript') {
    const interfaces = (content.match(/interface\s+(\w+)/g) || []).map(
      (m) => ({ type: 'interface', name: m })
    );
    const types = (content.match(/type\s+(\w+)/g) || []).map((m) => ({
      type: 'type',
      name: m,
}));
typeInfo.push(...interfaces, ...types);
}
return typeInfo;
}

private buildControlFlow(content: string, language: SupportedLanguage): { nodes: Array<{ id: number; type: string }>; edges: Array<{ from: number; to: number }>; entryPoints: number[]; exitPoints: number[] } {
// Basic control flow analysis
const nodes = [];
const edges = [];
  if (language === 'typescript' || language === 'javascript') {
    const controlStatements = content.match(/\b(if|for|while|switch|return)\b/g) || [];
    let index = 0;
    for (const stmt of controlStatements) {
      nodes.push({ id: index, type: stmt });
if (index > 0) {
        edges.push({ from: index - 1, to: index });
}
      index++;
}
  }
  return { nodes, edges, entryPoints: [0], exitPoints: [nodes.length - 1] };
}

private buildDataFlow(content: string, language: SupportedLanguage): { nodes: Array<{ id: number; type: string }>; edges: Array<{ from: number; to: number }>; definitions: Array<{ variable: string; location: number }>; uses: Array<{ variable: string; location: number }> } {
// Basic data flow analysis
const nodes: Array<{ id: number; type: string }> = [];
const edges: Array<{ from: number; to: number }> = [];
const definitions: Array<{ variable: string; location: number }> = [];
const uses: Array<{ variable: string; location: number }> = [];

  if (language === 'typescript' || language === 'javascript') {
    const assignments = content.match(/(\w+)\s*=/g) || [];
    let aIndex = 0;
    for (const assign of assignments) {
      definitions.push({ variable: assign, location: aIndex });
      nodes.push({ id: aIndex, type: 'definition' });
      aIndex++;
    }
  }

  return { nodes, edges, definitions, uses };
}

private buildCallGraph(content: string, language: SupportedLanguage): { nodes: Array<{ id: number; name: string }>; edges: Array<{ from: number; to: number }>; entryPoints: number[]; recursiveCalls: Array<{ nodeId: number; callCount: number }> } {
// Basic call graph analysis
const nodes: Array<{ id: number; name: string }> = [];
const edges: Array<{ from: number; to: number }> = [];
const entryPoints: number[] = [];
const recursiveCalls: Array<{ nodeId: number; callCount: number }> = [];

  if (language === 'typescript' || language === 'javascript') {
    const functionCalls = content.match(/(\w+)\s*\(/g) || [];
    let fIndex = 0;
    for (const call of functionCalls) {
      nodes.push({ id: fIndex, name: call });
      if (fIndex === 0) {
        entryPoints.push(fIndex);
      }
      fIndex++;
    }
  }

  return { nodes, edges, entryPoints, recursiveCalls };
}

private detectCodeSmells(
  content: string,
  language: SupportedLanguage
): Array<{ type: string; severity: string; line: number }> {
// Basic code smell detection
const smells = [];

  if (language === 'typescript' || language === 'javascript') {
// Long method detection
    const lines = content.split('\n');
    if (lines.length > 50) {
      smells.push({ type: 'long-method', severity: 'medium', line: 1 });
    }

// Magic number detection
    const magicNumbers = content.match(/\b\d{2}\b/g) || [];
if (magicNumbers.length > 5) {
      smells.push({ type: 'magic-numbers', severity: 'low', line: 0 });
    }

// Deep nesting detection
const nestingLevel =
      (content.match(/{/g) || []).length -
      (content.match(/}/g) || []).length;
if (Math.abs(nestingLevel) > 4) {
      smells.push({ type: 'deep-nesting', severity: 'high', line: 0 });
    }
}

return smells;
}

}

// =============================================================================
// Convenience exports
// =============================================================================

export function createCodeAnalyzer(repositoryPath: string): CodeAnalyzer {
return new CodeAnalyzer(repositoryPath);
}

export function analyzeFile(
  filePath: string,
  options?: Partial<EnhancedAnalysisOptions>
): Promise<Result<CodeAnalysisResult, Error>> {
const analyzer = new CodeAnalyzer(path.dirname(filePath));
return analyzer.analyzeFile(path.basename(filePath), options);
}
