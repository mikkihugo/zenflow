export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex?: number;
}

export interface ASTAnalysis {
  nodeCount: number;
  depth: number;
  complexity: number;
  patterns: Array<{ name: string; line: number }>;
  imports: Array<{ statement: string; module: string }>;
  exports: Array<{ statement: string; name: string }>;
  declarations: Array<{ type: string; name: string }>;
  references: Array<{ identifier: string; location: string }>;
}

export interface SemanticAnalysis {
  scopes: Array<{ type: string; depth: number }>;
  bindings: Array<{ type: string; name: string }>;
  typeInformation: Array<{ type: string; name: string }>;
  controlFlow: { 
    nodes: Array<{ id: number; type: string }>;
    edges: Array<{ from: number; to: number }>;
    entryPoints: number[];
    exitPoints: number[];
  };
  dataFlow: {
    nodes: Array<{ id: number; type: string }>;
    edges: Array<{ from: number; to: number }>;
    definitions: Array<{ variable: string; location: number }>;
    uses: Array<{ variable: string; location: number }>;
  };
  callGraph: {
    nodes: Array<{ id: number; name: string }>;
    edges: Array<{ from: number; to: number }>;
    entryPoints: number[];
    recursiveCalls: Array<{ nodeId: number; callCount: number }>;
  };
}

export interface CodeQualityMetrics {
  linesOfCode: number;
  physicalLinesOfCode?: number;
  cyclomaticComplexity: number;
  cognitiveComplexity?: number;
  maintainabilityIndex: number;
  halsteadMetrics?: {
    vocabulary: number;
    length: number;
    difficulty: number;
    effort: number;
    time: number;
    bugs: number;
    volume: number;
  };
  couplingMetrics?: {
    afferentCoupling: number;
    efferentCoupling: number;
    instability: number;
    abstractness: number;
    distance: number;
  };
  cohesionMetrics?: {
    lcom: number;
    tcc: number;
    lcc: number;
    scom: number;
  };
  codeSmells: Array<{ type: string; severity: string; line: number }>;
  antiPatterns?: Array<{ name: string; line: number }>;
  designPatterns?: Array<{ name: string; line: number }>;
  securityIssues: Array<{ type: string; severity: string; line: number }>;
  vulnerabilities: Array<{ type: string; severity: string; line: number }>;
}

export interface AICodeInsights {
  intentAnalysis: {
    primaryIntent: string;
    secondaryIntents: string[];
    businessDomain: string;
    technicalDomain: string;
    confidence: number;
  };
  complexityAssessment: {
    overallComplexity: string;
    complexityFactors: string[];
    reductionOpportunities: string[];
    cognitiveLoad: number;
  };
  refactoringOpportunities: string[];
  businessLogicAnalysis: {
    businessRules: string[];
    workflows: string[];
    entities: string[];
    relationships: string[];
    complexity: { score: number; factors: string[] };
  };
  architecturalPatterns: string[];
  technicalDebtAssessment: {
    totalDebt: number;
    debtByCategory: Record<string, number>;
    hotspots: string[];
    trend: string;
    payoffStrategies: string[];
  };
  bugPrediction: {
    riskScore: number;
    factors: string[];
    historicalAnalysis: { bugCount: number; patterns: string[] };
    recommendations: string[];
  };
  maintenancePrediction: {
    maintainabilityScore: number;
    futureEffort: { hours: number; confidence: number };
    changeProneness: { score: number; factors: string[] };
    evolutionaryHotspots: string[];
  };
  performancePrediction: {
    performanceScore: number;
    bottlenecks: string[];
    scalabilityAssessment: { score: number; concerns: string[] };
    optimizationOpportunities: string[];
  };
  skillGapAnalysis: {
    requiredSkills: string[];
    demonstratedSkills: string[];
    gaps: string[];
    strengths: string[];
  };
  learningRecommendations: string[];
}

export interface CodeAnalysisResult {
  id: string;
  filePath: string;
  language: SupportedLanguage;
  timestamp: Date;
  ast: ASTAnalysis;
  syntaxErrors: Array<{ message: string; line: number; column: number }>;
  parseSuccess: boolean;
  semantics: SemanticAnalysis;
  typeErrors: Array<{ message: string; line: number; column: number }>;
  quality: CodeQualityMetrics;
  suggestions: Array<CodeSuggestion>;
  aiInsights?: AICodeInsights;
  analysisTime: number;
  memoryUsage: number;
}

export interface LiveAnalysisSession {
  id: string;
  startTime: Date;
  options: CodeAnalysisOptions;
  watchedFiles: string[];
  watchedDirectories: string[];
  status: 'active' | 'inactive' | 'analyzing';
  filesAnalyzed: number;
  errorsFound: number;
  suggestionsGenerated: number;
  analysisQueue: string[];
  metrics: SessionMetrics;
  eventHandlers: Array<{ event: string; handler: Function }>;
  notifications: Array<{ message: string; level: string; timestamp: Date }>;
  isWatching?: boolean;
  lastAnalysisTime?: Date;
}

export interface CodeAnalysisOptions {
  includeTests?: boolean;
  includeNodeModules?: boolean;
  includeDotFiles?: boolean;
  maxFileSize?: number;
  excludePatterns?: string[];
  analysisMode?: string;
  realTimeAnalysis?: boolean;
  enableWatching?: boolean;
  enableAIRecommendations?: boolean;
  enableAILinting?: boolean;
  enableAIRefactoring?: boolean;
  enableContextualAnalysis?: boolean;
  batchSize?: number;
  throttleMs?: number;
  cachingEnabled?: boolean;
  parallelProcessing?: boolean;
  languages?: SupportedLanguage[];
  enableVSCodeIntegration?: boolean;
  enableIDEIntegration?: boolean;
  enableCIIntegration?: boolean;
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'python' | 'go' | 'rust' | 'java' | 'cpp';

export interface EnhancedAnalysisOptions extends CodeAnalysisOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
}

// Additional types needed by the code analyzer
export interface CodeSuggestion {
  type: string;
  message: string;
  priority: string;
  file: string;
  line: number;
  column: number;
}

export interface SessionMetrics {
  analysisLatency: { avg: number; min: number; max: number; p95: number; p99: number };
  throughput: {
    filesPerSecond: number;
    linesPerSecond: number;
    operationsPerSecond: number;
  };
  resourceUsage: { cpuUsage: number; memoryUsage: number; diskIO: number; networkIO: number };
  errorRates: { parseErrors: number; analysisErrors: number; overallErrorRate: number };
  cacheMetrics: { hitRate: number; missRate: number; size: number; evictions: number };
}