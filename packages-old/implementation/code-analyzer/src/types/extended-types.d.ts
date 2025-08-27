/**
 * Extended Types for Code Analysis
 * Comprehensive type definitions for advanced analysis features
 */
export interface ImportSpecifier {
    name: string;
    alias?: string;
    kind: 'named' | 'default' | 'namespace;;
}
export interface TypeProperty {
    name: string;
    type: string;
    optional: boolean;
    readonly: boolean;
}
export interface TypeMethod {
    name: string;
    parameters: TypeProperty[];
    returnType: string;
    accessibility: 'public' | 'private' | 'protected;;
}
export interface ControlFlowNode {
    id: string;
    type: 'entry' | 'exit' | 'statement' | 'condition' | 'loop;;
    statement?: string;
    location: CodeLocation;
}
export interface ControlFlowEdge {
    from: string;
    to: string;
    condition?: string;
    label?: string;
}
export interface DataFlowNode {
    id: string;
    variable: string;
    type: 'definition' | 'use' | 'kill;;
    location: CodeLocation;
}
export interface DataFlowEdge {
    from: string;
    to: string;
    variable: string;
    flowType: 'def-use' | 'use-def' | 'def-def;;
}
export interface Definition {
    variable: string;
    location: CodeLocation;
    type: string;
    scope: string;
}
export interface Use {
    variable: string;
    location: CodeLocation;
    scope: string;
}
export interface CallGraphNode {
    id: string;
    name: string;
    type: 'function' | 'method' | 'constructor' | 'external;;
    location?: CodeLocation;
    signature?: string;
}
export interface CallGraphEdge {
    from: string;
    to: string;
    callType: 'direct' | 'indirect' | 'virtual' | 'dynamic;;
    location: CodeLocation;
}
export interface RecursiveCall {
    function: string;
    depth: number;
    location: CodeLocation;
}
export interface ComplexityFactor {
    type: 'cyclomatic' | 'cognitive' | 'nesting' | 'coupling' | 'cohesion;;
    value: number;
    impact: 'low' | 'medium' | 'high' | 'critical;;
    description: string;
}
export interface ComplexityReduction {
    type: 'extract-method' | 'extract-class' | 'simplify-condition' | 'reduce-nesting;;
    effort: 'low' | 'medium' | 'high;;
    impact: 'low' | 'medium' | 'high;;
    description: string;
}
export interface RefactoringStep {
    id: string;
    type: 'extract' | 'inline' | 'move' | 'rename' | 'simplify;;
    description: string;
    effort: number;
    risk: 'low' | 'medium' | 'high;;
    benefits: string[];
    prerequisites: string[];
}
export interface BusinessRule {
    id: string;
    name: string;
    description: string;
    conditions: string[];
    actions: string[];
    priority: 'low' | 'medium' | 'high' | 'critical;;
}
export interface Workflow {
    id: string;
    name: string;
    steps: WorkflowStep[];
    inputs: WorkflowData[];
    outputs: WorkflowData[];
}
export interface WorkflowStep {
    id: string;
    name: string;
    type: 'process' | 'decision' | 'data' | 'external;;
    description: string;
}
export interface WorkflowData {
    name: string;
    type: string;
    required: boolean;
    validation?: string;
}
export interface BusinessEntity {
    name: string;
    attributes: EntityAttribute[];
    relationships: BusinessRelationship[];
    operations: EntityOperation[];
}
export interface EntityAttribute {
    name: string;
    type: string;
    required: boolean;
    constraints: string[];
}
export interface EntityOperation {
    name: string;
    type: 'create' | 'read' | 'update' | 'delete' | 'business;;
    parameters: EntityAttribute[];
    returns: string;
}
export interface BusinessRelationship {
    type: 'one-to-one' | 'one-to-many' | 'many-to-many;;
    target: string;
    description: string;
    constraints: string[];
}
export interface BusinessComplexity {
    score: number;
    factors: ComplexityFactor[];
}
export interface PatternViolation {
    pattern: string;
    violation: string;
    severity: 'info' | 'warning' | 'error' | 'critical;;
    location: CodeLocation;
    suggestion: string;
}
export interface TechnicalDebtHotspot {
    file: string;
    debt: number;
    category: 'maintainability' | 'reliability' | 'security' | 'performance;;
    issues: string[];
    priority: 'low' | 'medium' | 'high' | 'critical;;
}
export interface PayoffStrategy {
    name: string;
    effort: number;
    payoff: number;
    risk: 'low' | 'medium' | 'high;;
    timeline: string;
    steps: string[];
}
export interface RiskFactor {
    type: 'complexity' | 'change-frequency' | 'developer-experience' | 'test-coverage;;
    value: number;
    weight: number;
    description: string;
}
export interface HistoricalBugData {
    bugCount: number;
    patterns: BugPattern[];
    trends: BugTrend[];
}
export interface BugPattern {
    pattern: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high' | 'critical;;
    locations: CodeLocation[];
}
export interface BugTrend {
    period: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical;;
}
export interface BugPreventionRecommendation {
    type: 'testing' | 'review' | 'refactoring' | 'monitoring;;
    description: string;
    effort: 'low' | 'medium' | 'high;;
    impact: 'low' | 'medium' | 'high;;
}
export interface EffortPrediction {
    hours: number;
    confidence: number;
    factors: string[];
    assumptions: string[];
}
export interface ChangeProneness {
    score: number;
    factors: string[];
    frequency: ChangeFrequency;
}
export interface ChangeFrequency {
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'increasing' | 'improving' | 'stable' | 'declining' | 'decreasing;;
}
export interface EvolutionaryHotspot {
    file: string;
    changeFrequency: number;
    complexity: number;
    riskScore: number;
    recommendations: string[];
}
export interface PerformanceBottleneck {
    type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm;;
    location: CodeLocation;
    impact: 'low' | 'medium' | 'high' | 'critical;;
    description: string;
    suggestions: string[];
}
export interface ScalabilityAssessment {
    score: number;
    concerns: ScalabilityConcern[];
    recommendations: string[];
}
export interface ScalabilityConcern {
    type: 'throughput' | 'latency' | 'memory' | 'storage' | 'concurrency;;
    severity: 'low' | 'medium' | 'high' | 'critical;;
    description: string;
    impact: string;
}
export interface OptimizationOpportunity {
    type: 'algorithm' | 'data-structure' | 'caching' | 'parallel' | 'lazy-loading;;
    location: CodeLocation;
    effort: 'low' | 'medium' | 'high;;
    impact: 'low' | 'medium' | 'high;;
    description: string;
}
export interface Skill {
    name: string;
    category: 'language' | 'framework' | 'tool' | 'pattern' | 'domain;;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert;;
    confidence: number;
}
export interface SkillGap {
    skill: string;
    required: 'beginner' | 'intermediate' | 'advanced' | 'expert;;
    current: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'none;;
    priority: 'low' | 'medium' | 'high' | 'critical;;
}
export interface LearningResource {
    type: 'documentation' | 'tutorial' | 'course' | 'book' | 'practice;;
    title: string;
    url?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced;;
    estimatedTime: string;
    skills: string[];
}
export interface CodeLocation {
    start: {
        line: number;
        column: number;
        offset?: number;
    };
    end: {
        line: number;
        column: number;
        offset?: number;
    };
}
//# sourceMappingURL=extended-types.d.ts.map