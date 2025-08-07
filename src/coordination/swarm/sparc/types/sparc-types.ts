/**
 * SPARC Methodology Core Types
 *
 * Comprehensive type definitions for the SPARC (Specification, Pseudocode,
 * Architecture, Refinement, Completion) development methodology system.
 */

// Core SPARC Phase Types
export type SPARCPhase =
  | 'specification'
  | 'pseudocode'
  | 'architecture'
  | 'refinement'
  | 'completion';

export type ProjectDomain =
  | 'swarm-coordination'
  | 'neural-networks'
  | 'wasm-integration'
  | 'rest-api'
  | 'memory-systems'
  | 'interfaces'
  | 'general';

export type ComplexityLevel = 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RefinementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Core SPARC Interfaces
export interface SPARCEngine {
  initializeProject(projectSpec: ProjectSpecification): Promise<SPARCProject>;
  executePhase(project: SPARCProject, phase: SPARCPhase): Promise<PhaseResult>;
  refineImplementation(
    project: SPARCProject,
    feedback: RefinementFeedback
  ): Promise<RefinementResult>;
  generateArtifacts(project: SPARCProject): Promise<ArtifactSet>;
  validateCompletion(project: SPARCProject): Promise<CompletionValidation>;
}

export interface SPARCProject {
  readonly id: string;
  readonly name: string;
  readonly domain: ProjectDomain;
  specification: DetailedSpecification;
  pseudocode: PseudocodeStructure;
  architecture: ArchitectureDesign;
  refinements: RefinementHistory[];
  implementation: ImplementationArtifacts;
  currentPhase: SPARCPhase;
  progress: PhaseProgress;
  metadata: ProjectMetadata;
}

export interface ProjectSpecification {
  name: string;
  domain: ProjectDomain;
  complexity: ComplexityLevel;
  requirements: string[];
  constraints?: string[];
  targetMetrics?: PerformanceTarget[];
}

export interface SPARCTemplate {
  readonly id: string;
  readonly name: string;
  readonly domain: ProjectDomain;
  readonly description: string;
  readonly version: string;
  readonly metadata: TemplateMetadata;
  readonly specification: DetailedSpecification;
  readonly pseudocode: PseudocodeStructure;
  readonly architecture: ArchitectureDesign;

  applyTo(projectSpec: ProjectSpecification): Promise<{
    specification: DetailedSpecification;
    pseudocode: PseudocodeStructure;
    architecture: ArchitectureDesign;
  }>;

  customizeSpecification(projectSpec: ProjectSpecification): DetailedSpecification;
  customizePseudocode(projectSpec: ProjectSpecification): PseudocodeStructure;
  customizeArchitecture(projectSpec: ProjectSpecification): ArchitectureDesign;

  validateCompatibility(projectSpec: ProjectSpecification): {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

export interface TemplateMetadata {
  author: string;
  createdAt: Date;
  tags: string[];
  complexity: ComplexityLevel;
  estimatedDevelopmentTime: string;
  targetPerformance: string;
}

export interface ProjectMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author?: string;
  tags: string[];
}

// Phase Management Types
export interface PhaseDefinition {
  readonly name: SPARCPhase;
  readonly description: string;
  requirements: PhaseRequirement[];
  deliverables: PhaseDeliverable[];
  validationCriteria: ValidationCriterion[];
  estimatedDuration: number; // in minutes
}

export interface PhaseRequirement {
  id: string;
  description: string;
  type: 'input' | 'process' | 'validation';
  mandatory: boolean;
}

export interface PhaseDeliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'code' | 'diagram' | 'analysis';
  format: string;
}

export interface ValidationCriterion {
  id: string;
  description: string;
  type: 'automated' | 'manual' | 'ai-assisted';
  threshold?: number;
}

export interface PhaseProgress {
  currentPhase: SPARCPhase;
  completedPhases: SPARCPhase[];
  phaseStatus: Record<SPARCPhase, PhaseStatus>;
  overallProgress: number; // 0-1
}

export interface PhaseStatus {
  status: 'not-started' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in minutes
  deliverables: string[];
  validationResults: ValidationResult[];
}

export interface PhaseResult {
  phase: SPARCPhase;
  success: boolean;
  deliverables: ArtifactReference[];
  metrics: PhaseMetrics;
  nextPhase?: SPARCPhase;
  recommendations?: string[];
}

export interface PhaseMetrics {
  duration: number;
  qualityScore: number;
  completeness: number;
  complexityScore: number;
}

// Specification Phase Types
export interface SpecificationEngine {
  gatherRequirements(context: ProjectContext): Promise<RequirementSet>;
  analyzeConstraints(requirements: RequirementSet): Promise<ConstraintAnalysis>;
  defineAcceptanceCriteria(requirements: RequirementSet): Promise<AcceptanceCriterion[]>;
  generateSpecificationDocument(analysis: ConstraintAnalysis): Promise<SpecificationDocument>;
  validateSpecificationCompleteness(spec: SpecificationDocument): Promise<ValidationReport>;
}

export interface DetailedSpecification {
  id: string;
  domain: string;
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  constraints: SystemConstraint[];
  assumptions: ProjectAssumption[];
  dependencies: ExternalDependency[];
  acceptanceCriteria: AcceptanceCriterion[];
  riskAssessment: RiskAnalysis;
  successMetrics: SuccessMetric[];
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: Priority;
  testCriteria: string[];
  dependencies?: string[];
}

export interface NonFunctionalRequirement {
  id: string;
  title: string;
  description: string;
  metrics: Record<string, string>;
  priority: Priority;
}

export interface SystemConstraint {
  id: string;
  type: 'technical' | 'business' | 'regulatory' | 'performance';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ProjectAssumption {
  id: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  riskIfIncorrect: RiskLevel;
}

export interface ExternalDependency {
  id: string;
  name: string;
  type: 'library' | 'service' | 'api' | 'database' | 'infrastructure';
  version?: string;
  critical: boolean;
}

export interface AcceptanceCriterion {
  id: string;
  requirement: string;
  criteria: string[];
  testMethod: 'automated' | 'manual' | 'integration';
}

export interface RiskAnalysis {
  risks: ProjectRisk[];
  mitigationStrategies: MitigationStrategy[];
  overallRisk: RiskLevel;
}

export interface ProjectRisk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'technical' | 'business' | 'operational';
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  priority: Priority;
  effort: 'low' | 'medium' | 'high';
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  target: string;
  measurement: string;
}

// Pseudocode Phase Types
export interface PseudocodeEngine {
  generateAlgorithmPseudocode(spec: DetailedSpecification): Promise<AlgorithmPseudocode[]>;
  designDataStructures(requirements: FunctionalRequirement[]): Promise<DataStructureDesign[]>;
  mapControlFlows(algorithms: AlgorithmPseudocode[]): Promise<ControlFlowDiagram[]>;
  optimizeAlgorithmComplexity(pseudocode: AlgorithmPseudocode): Promise<OptimizationSuggestion[]>;
  validatePseudocodeLogic(pseudocode: AlgorithmPseudocode[]): Promise<LogicValidation>;
}

export interface PseudocodeStructure {
  id: string;
  algorithms: AlgorithmPseudocode[];
  coreAlgorithms: AlgorithmPseudocode[]; // Legacy property for backward compatibility
  dataStructures: DataStructureDesign[];
  controlFlows: ControlFlowDiagram[];
  optimizations: OptimizationOpportunity[];
  dependencies: AlgorithmDependency[];
  complexityAnalysis?: ComplexityAnalysis; // Overall complexity analysis
}

export interface AlgorithmPseudocode {
  readonly name: string;
  readonly purpose: string;
  inputs: ParameterDefinition[];
  outputs: ReturnDefinition[];
  steps: PseudocodeStep[];
  complexity: ComplexityAnalysis;
  optimizations: OptimizationOpportunity[];
}

export interface ParameterDefinition {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  constraints?: string[];
}

export interface ReturnDefinition {
  name: string;
  type: string;
  description: string;
}

export interface PseudocodeStep {
  stepNumber: number;
  description: string;
  pseudocode: string;
  complexity?: string;
  dependencies?: string[];
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  scalability: string;
  worstCase: string;
  averageCase?: string;
  bestCase?: string;
  scalabilityAnalysis?: string;
  bottlenecks?: string[];
}

export interface OptimizationOpportunity {
  id?: string;
  type:
    | 'performance'
    | 'memory'
    | 'readability'
    | 'maintainability'
    | 'algorithmic'
    | 'caching'
    | 'parallelization';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement?: string;
}

export interface DataStructureDesign {
  name: string;
  type: 'class' | 'interface' | 'enum' | 'type';
  properties: PropertyDefinition[];
  methods: MethodDefinition[];
  relationships: StructureRelationship[];
}

export interface PropertyDefinition {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  description: string;
  optional?: boolean;
}

export interface MethodDefinition {
  name: string;
  parameters: ParameterDefinition[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  description: string;
  complexity?: string;
}

export interface StructureRelationship {
  type: 'extends' | 'implements' | 'uses' | 'contains';
  target: string;
  description: string;
}

export interface ControlFlowDiagram {
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  cycles: boolean;
  complexity: number;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'loop';
  label: string;
  description?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  condition?: string;
  probability?: number;
}

// Architecture Phase Types
export interface ArchitectureEngine {
  designSystemArchitecture(
    spec: DetailedSpecification,
    pseudocode: AlgorithmPseudocode[]
  ): Promise<SystemArchitecture>;
  generateComponentDiagrams(architecture: SystemArchitecture): Promise<ComponentDiagram[]>;
  designDataFlow(components: Component[]): Promise<DataFlowDiagram>;
  planDeploymentArchitecture(system: SystemArchitecture): Promise<DeploymentPlan>;
  validateArchitecturalConsistency(
    architecture: SystemArchitecture
  ): Promise<ArchitecturalValidation>;
}

export interface ArchitectureDesign {
  id: string;
  systemArchitecture: SystemArchitecture;
  componentDiagrams: ComponentDiagram[];
  dataFlow: DataFlowDiagram;
  deploymentPlan: DeploymentPlan;
  deploymentStrategy?: string;
  validationResults: ArchitecturalValidation;
  components: Component[];
  relationships: ComponentRelationship[];
  patterns: ArchitecturalPattern[];
  securityRequirements: SecurityRequirement[];
  scalabilityRequirements: ScalabilityRequirement[];
  qualityAttributes: QualityAttribute[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemArchitecture {
  components: Component[];
  interfaces: InterfaceDefinition[];
  dataFlow: DataFlowConnection[];
  deploymentUnits: DeploymentUnit[];
  qualityAttributes: QualityAttribute[];
  architecturalPatterns: ArchitecturalPattern[];
  technologyStack: TechnologyChoice[];
}

export interface Component {
  id?: string;
  name: string;
  type: 'service' | 'library' | 'database' | 'gateway' | 'ui' | 'worker';
  description?: string;
  responsibilities: string[];
  interfaces: string[];
  dependencies: string[];
  qualityAttributes: Record<string, string | number>;
  performance: {
    expectedLatency: string;
    optimizations?: string[];
  };
}

export interface ComponentRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  description: string;
  sourceId?: string;
  targetId?: string;
  strength?: string;
  protocol?: string;
}

export interface InterfaceDefinition {
  name: string;
  description?: string;
  methods: InterfaceMethod[];
  contracts: string[];
  protocols?: string[];
}

export interface InterfaceMethod {
  name: string;
  signature: string;
  description: string;
  contracts?: string[];
}

export interface DataFlowConnection {
  from: string;
  to: string;
  data: string;
  protocol: string;
  frequency?: string;
}

export interface DeploymentUnit {
  name: string;
  components: string[];
  infrastructure: InfrastructureRequirement[];
  scaling: ScalingStrategy;
}

export interface InfrastructureRequirement {
  type: 'compute' | 'storage' | 'network' | 'memory';
  specification: string;
  constraints?: string[];
}

export interface ScalingStrategy {
  type: 'horizontal' | 'vertical' | 'auto' | 'manual';
  triggers: string[];
  limits: Record<string, number>;
}

export interface QualityAttribute {
  name: string;
  target: string | number;
  measurement: string;
  priority: Priority;
  type?: string;
  criteria: string[];
}

export interface SecurityRequirement {
  id: string;
  type: string;
  description: string;
  implementation: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ScalabilityRequirement {
  id: string;
  type: string;
  description: string;
  target: string;
  implementation: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  applicability: string[];
  applicableComponents?: string[];
  benefits: string[];
  tradeoffs: string[];
}

export interface TechnologyChoice {
  category: string;
  technology: string;
  version?: string;
  rationale: string;
  purpose?: string;
  alternatives: string[];
}

// Refinement Phase Types
export interface RefinementEngine {
  analyzeImplementationGaps(
    architecture: SystemArchitecture,
    currentImpl: Implementation
  ): Promise<GapAnalysis>;
  generateOptimizationSuggestions(performance: PerformanceMetrics): Promise<OptimizationPlan>;
  refineAlgorithms(feedback: PerformanceFeedback): Promise<AlgorithmRefinement[]>;
  updateArchitecture(refinements: ArchitecturalRefinement[]): Promise<UpdatedArchitecture>;
  validateRefinementImpact(changes: RefinementChange[]): Promise<ImpactAssessment>;

  // Additional methods used by RefinementPhaseEngine
  applyRefinements(
    architecture: ArchitectureDesign,
    feedback: RefinementFeedback
  ): Promise<RefinementResult>;
  validateRefinement(refinement: RefinementResult): Promise<RefinementValidation>;
}

export interface RefinementHistory {
  iteration: number;
  timestamp: Date;
  strategy: RefinementStrategy;
  changes: RefinementChange[];
  results: RefinementResult;
}

export interface RefinementStrategy {
  readonly type: 'performance' | 'security' | 'maintainability' | 'scalability';
  priority: RefinementPriority;
  changes: RefinementChange[];
  expectedImpact: ImpactPrediction;
  riskAssessment: RiskLevel;
  implementationPlan: ImplementationStep[];
}

export interface RefinementChange {
  component: string;
  modification: string;
  rationale: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  risk: RiskLevel;
}

export interface ImpactPrediction {
  performanceGain: number;
  resourceReduction: number;
  scalabilityIncrease: number;
  maintainabilityImprovement: number;
}

export interface ImplementationStep {
  id: string;
  description: string;
  duration: number;
  dependencies: string[];
  risks: string[];
}

// Completion Phase Types
export interface CompletionEngine {
  generateProductionCode(
    architecture: SystemArchitecture,
    refinements: RefinementStrategy[]
  ): Promise<CodeArtifacts>;
  createTestSuites(requirements: DetailedSpecification): Promise<TestSuite[]>;
  generateDocumentation(project: SPARCProject): Promise<DocumentationSet>;
  validateProductionReadiness(implementation: Implementation): Promise<ProductionReadinessReport>;
  deployToProduction(artifacts: CodeArtifacts, config: DeploymentConfig): Promise<DeploymentResult>;
}

export interface ImplementationArtifacts {
  sourceCode: SourceCodeArtifact[];
  testSuites: TestSuite[];
  documentation: DocumentationArtifact[];
  configurationFiles: ConfigurationArtifact[];
  deploymentScripts: DeploymentScript[];
  monitoringDashboards: MonitoringDashboard[];
  securityConfigurations: SecurityConfiguration[];
  documentationGeneration: DocumentationGeneration;
  productionReadinessChecks: ProductionReadinessCheck[];
  codeGeneration: CodeGeneration;
  testGeneration: TestGeneration;
}

export interface SourceCodeArtifact {
  id?: string;
  name?: string;
  path: string;
  content: string;
  language: string;
  type: 'implementation' | 'test' | 'configuration' | 'documentation';
  dependencies: string[];
  estimatedLines?: number;
  tests?: string[];
}

export interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  tests: TestCase[];
  coverage: CoverageReport;
}

export interface TestCase {
  name: string;
  description: string;
  steps: TestStep[];
  assertions: TestAssertion[];
  requirements: string[];
}

export interface TestStep {
  action: string;
  parameters: Record<string, unknown>;
  expectedResult?: string;
}

export interface TestAssertion {
  description: string;
  assertion: string;
  critical: boolean;
}

export interface CoverageReport {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

// Utility Types
export interface ArtifactSet {
  artifacts: ArtifactReference[];
  metadata: ArtifactMetadata;
  relationships: ArtifactRelationship[];
}

export interface ArtifactReference {
  id: string;
  name: string;
  type: string;
  path: string;
  checksum: string;
  createdAt: Date;
}

export interface ArtifactMetadata {
  totalSize: number;
  lastModified: Date;
  version: string;
  author: string;
}

export interface ArtifactRelationship {
  source: string;
  target: string;
  type: 'depends-on' | 'generates' | 'validates' | 'implements';
}

export interface ValidationResult {
  criterion: string;
  passed: boolean;
  score: number;
  details?: string;
  suggestions?: string[];
  feedback?: string;
}

export interface ValidationReport {
  overall: boolean;
  approved?: boolean; // Alias for overall
  score: number;
  overallScore?: number; // Alias for score
  results: ValidationResult[];
  recommendations: string[];
  validationResults?: ValidationResult[]; // Alias for results
}

export interface CompletionValidation {
  readyForProduction: boolean;
  score: number;
  validations: ValidationResult[];
  blockers: string[];
  warnings: string[];
  overallScore: number;
  validationResults: ValidationResult[];
  recommendations: string[];
  approved: boolean;
  productionReady: boolean;
}

// Context and Configuration Types
export interface ProjectContext {
  domain: ProjectDomain;
  existingCodebase?: string;
  teamSize?: number;
  timeline?: number;
  budget?: number;
  constraints?: string[];
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  unit: string;
  priority: Priority;
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  resourceUsage: Record<string, number>;
  errorRate: number;
}

export interface PerformanceFeedback {
  id?: string;
  metrics: PerformanceMetrics;
  targets: PerformanceTarget[];
  bottlenecks: string[];
  recommendations: string[];

  // Additional properties used by refinement engine
  performanceIssues?: string[];
  securityConcerns?: string[];
  scalabilityRequirements?: string[];
  codeQualityIssues?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// AI Integration Types
export interface AISPARCAssistant {
  enhanceSpecification(draft: Partial<DetailedSpecification>): Promise<DetailedSpecification>;
  generateOptimalPseudocode(spec: DetailedSpecification): Promise<AlgorithmPseudocode[]>;
  suggestArchitecturalPatterns(requirements: RequirementSet): Promise<PatternRecommendation[]>;
  optimizeRefinementStrategy(
    current: Implementation,
    targets: PerformanceTarget[]
  ): Promise<RefinementPlan>;
  validateCompletionReadiness(artifacts: ArtifactReference[]): Promise<ReadinessAssessment>;
}

export interface PatternRecommendation {
  pattern: ArchitecturalPattern;
  applicability: number;
  benefits: string[];
  implementationComplexity: 'low' | 'medium' | 'high';
}

export interface RefinementPlan {
  strategies: RefinementStrategy[];
  prioritization: string[];
  timeline: number;
  risks: ProjectRisk[];
}

export interface ReadinessAssessment {
  score: number;
  readyForProduction: boolean;
  criticalIssues: string[];
  recommendations: string[];
  estimatedEffort: number;
}

// Export commonly used type unions
export type RequirementSet = (FunctionalRequirement | NonFunctionalRequirement)[];
export type ConstraintAnalysis = SystemConstraint[] & ProjectAssumption[];
export type SpecificationDocument = DetailedSpecification;
export type LogicValidation = ValidationResult[];
export type AlgorithmDependency = StructureRelationship;
export type ComponentDiagram = Component[];
export type DataFlowDiagram = DataFlowConnection[];
export type DeploymentPlan = DeploymentUnit[];
export type ArchitecturalValidation = ValidationReport;
export type GapAnalysis = RefinementChange[];
export type OptimizationPlan = RefinementStrategy[];
export type AlgorithmRefinement = RefinementChange;
export type UpdatedArchitecture = SystemArchitecture;
export type ImpactAssessment = ImpactPrediction;
export interface RefinementResult {
  id: string;
  architectureId: string;
  feedbackId: string;
  optimizationStrategies: OptimizationStrategy[];
  performanceOptimizations: PerformanceOptimization[];
  securityOptimizations: SecurityOptimization[];
  scalabilityOptimizations: ScalabilityOptimization[];
  codeQualityOptimizations: CodeQualityOptimization[];
  refinedArchitecture: ArchitectureDesign;
  benchmarkResults: BenchmarkResult[];
  improvementMetrics: ImprovementMetric[];
  refactoringOpportunities: RefactoringOpportunity[];
  technicalDebtAnalysis: TechnicalDebtAnalysis;
  recommendedNextSteps: string[];
  // Additional metrics for MCP tools
  performanceGain: number;
  resourceReduction: number;
  scalabilityIncrease: number;
  maintainabilityImprovement: number;
  createdAt: Date;
  updatedAt: Date;
}
export type CodeArtifacts = SourceCodeArtifact[];
export type DocumentationSet = DocumentationArtifact[];
export type ProductionReadinessReport = CompletionValidation;
export type DeploymentConfig = Record<string, unknown>;
export type DeploymentResult = { success: boolean; details: string };
export type Implementation = ImplementationArtifacts;

// Additional interfaces for completion engine
export interface DocumentationGeneration {
  artifacts: DocumentationArtifact[];
  coverage: number;
  quality: number;
}

export interface ProductionReadinessCheck {
  name: string;
  type: 'security' | 'performance' | 'reliability' | 'monitoring';
  passed: boolean;
  score: number;
  details: string;
  recommendations: string[];
}
export type RefinementFeedback = PerformanceFeedback;
export type DocumentationArtifact = ArtifactReference;
export type ConfigurationArtifact = ArtifactReference;
export type DeploymentScript = ArtifactReference;
export type MonitoringDashboard = ArtifactReference;
export type SecurityConfiguration = ArtifactReference;
export type DeploymentArtifact = ArtifactReference;
export type TestArtifact = TestCase;
export type DeploymentArtifacts = DeploymentScript[];

// Additional completion engine types
export interface CodeGeneration {
  artifacts: SourceCodeArtifact[];
  quality: number;
  coverage: number;
  estimatedMaintainability: number;
}

export interface TestGeneration {
  testSuites: TestSuite[];
  coverage: CoverageReport;
  automationLevel: number;
  estimatedReliability: number;
}

export interface ComplianceCheck {
  name: string;
  type: 'security' | 'performance' | 'accessibility' | 'regulatory';
  passed: boolean;
  score: number;
  details: string;
  recommendations: string[];
}
export type OptimizationSuggestion = OptimizationOpportunity;
export type ArchitecturalRefinement = RefinementChange;

// Additional exports required by refinement-engine.ts
export interface PerformanceOptimization {
  id: string;
  targetComponent: string;
  type: 'algorithm' | 'database' | 'caching' | 'network';
  description: string;
  currentPerformance: string;
  targetPerformance: string;
  techniques: string[];
  estimatedGain: string;
  implementationCost: 'Low' | 'Medium' | 'High';
}

export interface RefactoringOpportunity {
  id: string;
  targetComponent: string;
  type: 'extraction' | 'pattern-application' | 'simplification';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  effort: 'Low' | 'Medium' | 'High';
  benefits: string[];
  risks: string[];
  estimatedImpact: 'Low' | 'Medium' | 'High';
}

export interface RefinementValidation {
  overallScore: number;
  validationResults: ValidationResult[];
  recommendations: string[];
  approved: boolean;
}

export interface ScalabilityOptimization {
  id: string;
  targetComponent: string;
  type: 'horizontal' | 'vertical' | 'database' | 'caching';
  description: string;
  currentCapacity: string;
  targetCapacity: string;
  bottlenecks: string[];
  solutions: string[];
  scalingFactor: string;
  implementationCost: 'Low' | 'Medium' | 'High';
}

export interface SecurityOptimization {
  id: string;
  targetComponent: string;
  type: 'authentication' | 'encryption' | 'access-control';
  description: string;
  currentSecurity: string;
  targetSecurity: string;
  vulnerabilities: string[];
  mitigations: string[];
  complianceStandards: string[];
  implementationCost: 'Low' | 'Medium' | 'High';
}

export interface TechnicalDebtAnalysis {
  id: string;
  architectureId: string;
  totalDebtScore: number;
  debtCategories: {
    category: string;
    score: number;
    description: string;
    items: string[];
  }[];
  remediationPlan: {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    estimatedEffort: string;
    impact: 'Low' | 'Medium' | 'High';
  }[];
}

// Additional supporting types for refinement engine
export interface OptimizationStrategy {
  id: string;
  type: 'performance' | 'security' | 'scalability' | 'code-quality';
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedImpact: 'Low' | 'Medium' | 'High';
  implementationEffort: 'Low' | 'Medium' | 'High';
  targets: string[];
  techniques: string[];
  successCriteria: string[];
}

export interface CodeQualityOptimization {
  id: string;
  targetComponent: string;
  type: 'structure' | 'documentation' | 'testing';
  description: string;
  currentQuality: string;
  targetQuality: string;
  issues: string[];
  improvements: string[];
  metrics: Record<string, string>;
  implementationCost: 'Low' | 'Medium' | 'High';
}

export interface BenchmarkResult {
  id: string;
  metric: string;
  category: string;
  originalValue: string;
  refinedValue: string;
  improvement: string;
  measurementMethod: string;
}

export interface ImprovementMetric {
  id: string;
  name: string;
  category: string;
  beforeValue: string;
  afterValue: string;
  value?: string;
  improvementPercentage: number;
  confidenceLevel: number;
  measurementAccuracy: string;
}

// Missing exports required by pseudocode engine
export type ComplexityClass =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)';

export interface CoreAlgorithm {
  id: string;
  name: string;
  description: string;
  inputs: ParameterDefinition[];
  outputs: ReturnDefinition[];
  steps: PseudocodeStep[];
  complexity: ComplexityAnalysis;
  optimizations: OptimizationOpportunity[];
}

export interface DataStructureSpec {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: PropertyDefinition[];
  methods: MethodDefinition[];
  memoryComplexity: string;
  accessPatterns: string[];
  relationships: StructureRelationship[];
  keyType?: string;
  valueType?: string;
  expectedSize?: number;
  performance?: Record<string, string>;
}

export interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  conditions: FlowCondition[];
  parallelExecution: boolean;
}

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  duration?: number;
  algorithm?: string;
  inputs?: string[];
  outputs?: string[];
}

export interface FlowCondition {
  id: string;
  condition: string;
  trueNext: string;
  falseNext: string;
}

export interface PseudocodeValidation {
  id: string;
  algorithmId: string;
  validationResults: ValidationResult[];
  logicErrors: string[];
  optimizationSuggestions: string[];
  complexityVerification: boolean;
  overallScore: number; // Overall validation score (0-1)
  recommendations: string[];
  approved: boolean;
}

// Implementation Plan Types
export interface ImplementationPlan {
  id: string;
  phases: ImplementationPhase[];
  timeline: ProjectTimeline;
  resourceRequirements: ResourceRequirement[];
  riskAssessment: RiskAssessment;
  createdAt: Date;
}

export interface ImplementationTask {
  id: string;
  name: string;
  description: string;
  type: 'implementation' | 'infrastructure' | 'testing' | 'documentation';
  priority: Priority;
  estimatedEffort: string;
  dependencies: string[];
  acceptanceCriteria: string[];
}

export interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  tasks: ImplementationTask[];
  duration: string;
  prerequisites: string[];
}

export interface ProjectTimeline {
  totalDuration: string;
  phases: {
    name: string;
    startDate?: Date;
    endDate?: Date;
    duration: string;
  }[];
  criticalPath: string[];
}

export interface ResourceRequirement {
  type: 'developer' | 'infrastructure' | 'tools' | 'budget';
  description: string;
  quantity: number;
  duration: string;
}

export interface RiskAssessment {
  risks: ProjectRisk[];
  overallRisk: RiskLevel;
  mitigationPlans: string[];
}

// ValidationReport Factory Functions
export const ValidationReportFactory = {
  /**
   * Creates a default ValidationReport with success defaults
   */
  createDefault(): ValidationReport {
    return {
      overall: true,
      score: 100,
      results: [],
      recommendations: [],
    };
  },

  /**
   * Creates a ValidationReport with custom values
   */
  create(options: Partial<ValidationReport> = {}): ValidationReport {
    return {
      overall: options.overall ?? true,
      score: options.score ?? 100,
      results: options.results ?? [],
      recommendations: options.recommendations ?? [],
      ...options, // Allow for optional aliases
    };
  },

  /**
   * Creates ValidationReport from legacy format with aliases
   */
  fromLegacyFormat(legacy: {
    approved?: boolean;
    overallScore?: number;
    validationResults?: ValidationResult[];
    recommendations?: string[];
  }): ValidationReport {
    return {
      overall: legacy.approved ?? true,
      approved: legacy.approved,
      score: legacy.overallScore ?? 100,
      overallScore: legacy.overallScore,
      results: legacy.validationResults ?? [],
      validationResults: legacy.validationResults,
      recommendations: legacy.recommendations ?? [],
    };
  },
};
