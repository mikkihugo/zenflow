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
}

export interface SemanticAnalysis {
  variables: Array<{ name: string; type: string; scope: string }>;
  functions: Array<{ name: string; parameters: string[]; returnType: string }>;
  classes: Array<{ name: string; methods: string[]; properties: string[] }>;
  scopes: Array<{ type: string; name: string; depth: number }>;
  references: Array<{ symbol: string; locations: number[] }>;
  dataFlow: Record<string, string[]>;
  callGraph: Record<string, string[]>;
}

export interface CodeQualityMetrics {
  linesOfCode: number;
  physicalLinesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  duplicatedLines: number;
  testCoverage: number;
  documentation: number;
  codeSmells: string[];
  securityIssues: string[];
  vulnerabilities: string[];
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
  filePath: string;
  language: SupportedLanguage;
  analysisId: string;
  timestamp: number;
  ast: ASTAnalysis;
  semantics: SemanticAnalysis;
  quality: CodeQualityMetrics;
  aiInsights?: AICodeInsights;
  metadata: {
    fileSize: number;
    encoding: string;
    analysisTime: number;
  };
}

export interface LiveAnalysisSession {
  sessionId: string;
  repositoryPath: string;
  startTime: number;
  filesAnalyzed: number;
  totalAnalysisTime: number;
}

export interface CodeAnalysisOptions {
  enableAIRecommendations?: boolean;
  includeSemanticAnalysis?: boolean;
  includeQualityMetrics?: boolean;
  cacheable?: boolean;
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'cpp';

export interface EnhancedAnalysisOptions extends CodeAnalysisOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
}