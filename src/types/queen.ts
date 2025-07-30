/**
 * Queen System Types
 * Multi-Queen hive architecture with distributed decision-making
 */

import { Identifiable, JSONObject, TypedEventEmitter, OperationResult, ErrorDetails, ValidationResult, UUID } from './core.js';

// =============================================================================
// QUEEN CORE TYPES
// =============================================================================

export type QueenType = 
  | 'code-queen'        // Code generation and optimization
  | 'debug-queen'       // Debugging and error analysis
  | 'architect-queen'   // System architecture and design
  | 'vision-queen'      // Visual processing and design conversion
  | 'neural-queen'      // Neural network operations (Rust-based)
  | 'hive-queen'        // Hive coordination and management
  | 'memory-queen'      // Memory and persistence management
  | 'security-queen'    // Security analysis and enforcement
  | 'performance-queen' // Performance analysis and optimization
  | 'test-queen';       // Testing and quality assurance

export type QueenStatus = 'initializing' | 'active' | 'busy' | 'idle' | 'overloaded' | 'offline' | 'error';

export type TaskType = 
  | 'code-generation'
  | 'bug-detection'
  | 'refactoring'
  | 'test-generation'
  | 'documentation'
  | 'architecture-review'
  | 'performance-analysis'
  | 'security-audit'
  | 'vision-processing'
  | 'neural-training'
  | 'memory-optimization'
  | 'coordination';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ConsensusMethod = 'majority' | 'weighted' | 'expert' | 'unanimous';

// =============================================================================
// TASK DEFINITIONS
// =============================================================================

export interface Task extends Identifiable {
  type: TaskType;
  name: string;
  description: string;
  prompt: string;
  priority: Priority;
  deadline?: Date;
  
  // Context and requirements
  context: {
    code?: string;
    language?: string;
    framework?: string;
    testType?: string;
    fileType?: string;
    previousResults?: TaskResult[];
    dependencies?: string[];
    constraints?: string[];
  };
  
  // Execution tracking
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  assignedQueens: UUID[];
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  retryCount: number;
  maxRetries: number;
  
  // Metadata
  metadata: JSONObject;
  tags: string[];
}

export interface TaskResult extends Identifiable {
  taskId: UUID;
  queenId: UUID;
  queenName: string;
  
  // Result content
  recommendation: string;
  confidence: number; // 0-1
  reasoning: string;
  alternatives?: string[];
  
  // Performance metrics
  processingTime: number;
  resourcesUsed: {
    memory: number;
    cpu: number;
    tokens?: number;
  };
  
  // Quality metrics
  quality: {
    accuracy?: number;
    completeness?: number;
    relevance?: number;
    clarity?: number;
  };
  
  // Metadata
  metadata: JSONObject;
  evidence?: JSONObject[];
  citations?: string[];
}

// =============================================================================
// CONSENSUS SYSTEM
// =============================================================================

export interface Consensus extends Identifiable {
  taskId: UUID;
  decision: string;
  confidence: number;
  participants: number;
  method: ConsensusMethod;
  
  // Consensus details
  reasoning: string;
  dissenting?: TaskResult[];
  supporting: TaskResult[];
  processingTime: number;
  
  // Voting breakdown
  votes: {
    queenId: UUID;
    queenName: string;
    vote: string;
    weight: number;
    reasoning: string;
  }[];
  
  // Quality assurance
  validated: boolean;
  validationScore?: number;
  validationNotes?: string[];
  
  // Metadata
  metadata: JSONObject;
}

// =============================================================================
// QUEEN DEFINITION
// =============================================================================

export interface QueenCapabilities {
  taskTypes: TaskType[];
  specializations: string[];
  maxConcurrentTasks: number;
  averageProcessingTime: number;
  supportedLanguages: string[];
  supportedFrameworks: string[];
  requiresGPU: boolean;
  requiresNetwork: boolean;
  memoryRequirements: number; // MB
  cpuRequirements: number;    // cores
}

export interface QueenMetrics {
  // Task performance
  tasksProcessed: number;
  tasksSuccessful: number;
  tasksFailed: number;
  averageConfidence: number;
  averageProcessingTime: number;
  averageQuality: number;
  
  // Specialization metrics
  successRate: number;
  specialtyMatch: number;
  efficiencyScore: number;
  
  // Collaboration metrics
  collaborations: number;
  consensusReached: number;
  consensusInfluence: number;
  peerRating: number;
  
  // Resource utilization
  memoryUtilization: number;
  cpuUtilization: number;
  networkUtilization: number;
  
  // Quality metrics
  codeQuality?: number;
  testCoverage?: number;
  bugDetectionRate?: number;
  securityScore?: number;
  performanceScore?: number;
  
  // Learning and adaptation
  learningRate: number;
  adaptationScore: number;
  knowledgeRetention: number;
  improvementTrend: number;
  
  // Time-based metrics
  uptime: number;
  lastActive: Date;
  peakPerformanceTime: Date;
  downtimeEvents: number;
}

export interface QueenState {
  workload: number;        // 0-1
  health: number;          // 0-1
  energy: number;          // 0-1 (for neural queens)
  temperature: number;     // 0-1 (performance state)
  learningMode: boolean;
  debugMode: boolean;
  maintenanceMode: boolean;
  
  // Current activity
  activeTasks: Set<UUID>;
  queuedTasks: UUID[];
  lastTaskCompleted?: Date;
  currentFocus?: string;
  
  // Resource state
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkActivity: number;
  
  // Learning state
  knowledgeBase: JSONObject;
  learnedPatterns: string[];
  recentExperiences: JSONObject[];
  adaptationHistory: JSONObject[];
}

// =============================================================================
// QUEEN EVENTS
// =============================================================================

export interface QueenEvents {
  'task-assigned': (task: Task) => void;
  'task-started': (taskId: UUID) => void;
  'task-progress': (taskId: UUID, progress: number) => void;
  'task-completed': (taskId: UUID, result: TaskResult) => void;
  'task-failed': (taskId: UUID, error: ErrorDetails) => void;
  'collaboration-request': (task: Task, requestingQueen: UUID) => void;
  'collaboration-response': (taskId: UUID, result: TaskResult) => void;
  'consensus-reached': (consensus: Consensus) => void;
  'learning-update': (pattern: string, confidence: number) => void;
  'metrics-updated': (metrics: QueenMetrics) => void;
  'state-changed': (oldState: QueenState, newState: QueenState) => void;
  'health-warning': (issue: string, severity: 'low' | 'medium' | 'high') => void;
  'shutdown': () => void;
  'error': (error: ErrorDetails) => void;
  [event: string]: (...args: any[]) => void;
}

// =============================================================================
// QUEEN INTERFACE
// =============================================================================

export interface Queen extends TypedEventEmitter<QueenEvents>, Identifiable {
  // Basic properties
  readonly name: string;
  readonly type: QueenType;
  readonly capabilities: QueenCapabilities;
  readonly status: QueenStatus;
  readonly metrics: QueenMetrics;
  readonly state: QueenState;
  
  // Core methods
  initialize(config?: JSONObject): Promise<void>;
  shutdown(): Promise<void>;
  
  // Task processing
  canAcceptTask(task: Task): Promise<boolean>;
  calculateSuitability(task: Task): Promise<number>;
  assignTask(task: Task): Promise<void>;
  process(task: Task): Promise<TaskResult>;
  cancelTask(taskId: UUID): Promise<void>;
  
  // Collaboration
  collaborate(task: Task, otherQueens: Queen[]): Promise<Consensus>;
  consultPeer(task: Task, peerQueen: Queen): Promise<TaskResult>;
  shareKnowledge(pattern: string, data: JSONObject): Promise<void>;
  requestAssistance(task: Task, expertise: string[]): Promise<Queen[]>;
  
  // Learning and adaptation
  learn(experience: JSONObject): Promise<void>;
  adapt(feedback: JSONObject): Promise<void>;
  forgetPattern(pattern: string): Promise<void>;
  exportKnowledge(): Promise<JSONObject>;
  importKnowledge(knowledge: JSONObject): Promise<void>;
  
  // Health and monitoring
  getHealth(): Promise<HealthStatus>;
  getDetailedMetrics(): Promise<DetailedQueenMetrics>;
  performSelfDiagnostic(): Promise<DiagnosticResult>;
  optimizePerformance(): Promise<void>;
  
  // Configuration
  updateConfig(config: JSONObject): Promise<void>;
  getConfig(): JSONObject;
  validateConfig(config: JSONObject): ValidationResult[];
}

// =============================================================================
// SPECIALIZED QUEEN TYPES
// =============================================================================

export interface CodeQueen extends Queen {
  generateCode(spec: CodeGenerationSpec): Promise<CodeResult>;
  refactorCode(code: string, options: RefactoringOptions): Promise<CodeResult>;
  optimizeCode(code: string, target: OptimizationTarget): Promise<CodeResult>;
  analyzeCodeQuality(code: string): Promise<QualityAnalysis>;
}

export interface DebugQueen extends Queen {
  analyzeBug(error: ErrorDetails, context: JSONObject): Promise<BugAnalysis>;
  suggestFix(bug: BugAnalysis): Promise<FixSuggestion>;
  generateDebugScript(issue: string): Promise<string>;
  validateFix(originalCode: string, fixedCode: string): Promise<ValidationResult>;
}

export interface ArchitectQueen extends Queen {
  analyzeArchitecture(codebase: string[]): Promise<ArchitectureAnalysis>;
  suggestImprovement(analysis: ArchitectureAnalysis): Promise<ArchitectureRecommendation>;
  generateADR(decision: ArchitecturalDecision): Promise<string>;
  validateDesignPattern(pattern: string, context: JSONObject): Promise<PatternValidation>;
}

export interface VisionQueen extends Queen {
  processImage(imageData: Buffer, context: VisionContext): Promise<VisionResult>;
  generateCode(visionResult: VisionResult): Promise<CodeResult>;
  analyzeDesign(imageData: Buffer): Promise<DesignAnalysis>;
  compareDesigns(design1: Buffer, design2: Buffer): Promise<ComparisonResult>;
}

export interface NeuralQueen extends Queen {
  trainModel(data: TrainingData): Promise<ModelResult>;
  inferenceModel(input: JSONObject): Promise<InferenceResult>;
  optimizeHyperparameters(model: string): Promise<OptimizationResult>;
  exportModel(modelId: string): Promise<Buffer>;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    [component: string]: {
      status: 'healthy' | 'degraded' | 'critical';
      message?: string;
      metrics?: JSONObject;
    };
  };
  recommendations?: string[];
  lastCheck: Date;
}

export interface DetailedQueenMetrics extends QueenMetrics {
  timeSeriesData: {
    timestamp: Date;
    metrics: Partial<QueenMetrics>;
  }[];
  distributionData: {
    taskTypeDistribution: Record<TaskType, number>;
    processingTimeDistribution: number[];
    confidenceDistribution: number[];
    qualityDistribution: number[];
  };
  comparisonData: {
    peerComparison: Record<string, number>;
    historicalComparison: Record<string, number>;
    benchmarkComparison: Record<string, number>;
  };
}

export interface DiagnosticResult {
  overall: 'pass' | 'warn' | 'fail';
  tests: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
    details?: JSONObject;
  }[];
  recommendations: string[];
  estimatedFixTime?: number;
  autoFixAvailable?: boolean;
}

// Code generation types
export interface CodeGenerationSpec {
  language: string;
  framework?: string;
  description: string;
  requirements: string[];
  constraints: string[];
  examples?: string[];
  style?: JSONObject;
}

export interface CodeResult {
  code: string;
  explanation: string;
  tests?: string;
  documentation?: string;
  dependencies?: string[];
  confidence: number;
  quality: QualityAnalysis;
}

export interface RefactoringOptions {
  target: 'readability' | 'performance' | 'maintainability' | 'testability';
  preserveBehavior: boolean;
  modernize: boolean;
  addComments: boolean;
  addTypes: boolean;
}

export interface OptimizationTarget {
  type: 'speed' | 'memory' | 'size' | 'readability';
  constraints: string[];
  acceptableTradeoffs: string[];
}

export interface QualityAnalysis {
  score: number;
  metrics: {
    complexity: number;
    maintainability: number;
    readability: number;
    testability: number;
    performance: number;
    security: number;
  };
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    line?: number;
    suggestion?: string;
  }[];
  recommendations: string[];
}

// Bug analysis types
export interface BugAnalysis {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  root_cause: string;
  impact: string;
  affected_components: string[];
  reproduction_steps: string[];
  evidence: JSONObject[];
  confidence: number;
}

export interface FixSuggestion {
  approach: string;
  changes: {
    file: string;
    line?: number;
    oldCode?: string;
    newCode: string;
    explanation: string;
  }[];
  tests: string[];
  validation_steps: string[];
  risk_assessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
  confidence: number;
}

// Architecture types
export interface ArchitectureAnalysis {
  overview: string;
  patterns: string[];
  antipatterns: string[];
  dependencies: {
    internal: string[];
    external: string[];
    circular: string[];
  };
  metrics: {
    complexity: number;
    coupling: number;
    cohesion: number;
    maintainability: number;
  };
  recommendations: string[];
}

export interface ArchitectureRecommendation {
  priority: Priority;
  category: string;
  recommendation: string;
  rationale: string;
  implementation_steps: string[];
  estimated_effort: string;
  benefits: string[];
  risks: string[];
  alternatives: string[];
}

export interface ArchitecturalDecision {
  title: string;
  context: string;
  decision: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated';
  consequences: string[];
  alternatives: string[];
  assumptions: string[];
  constraints: string[];
}

export interface PatternValidation {
  valid: boolean;
  pattern: string;
  compliance: number;
  violations: string[];
  recommendations: string[];
  examples: string[];
}

// Vision processing types
export interface VisionContext {
  type: 'ui-mockup' | 'diagram' | 'screenshot' | 'design' | 'chart';
  target_platform: string;
  style_preferences: JSONObject;
  constraints: string[];
}

export interface VisionResult {
  interpretation: string;
  components: {
    type: string;
    properties: JSONObject;
    children?: VisionResult['components'];
  }[];
  layout: JSONObject;
  styling: JSONObject;
  confidence: number;
  suggestions: string[];
}

export interface DesignAnalysis {
  style: {
    colors: string[];
    fonts: string[];
    spacing: JSONObject;
    layout_type: string;
  };
  components: {
    type: string;
    count: number;
    variations: string[];
  }[];
  patterns: string[];
  accessibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  responsive: {
    breakpoints: number[];
    behavior: string[];
  };
}

export interface ComparisonResult {
  similarity: number;
  differences: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
}

// Neural network types
export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
  validation_split: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  metadata: JSONObject;
}

export interface ModelResult {
  model_id: string;
  accuracy: number;
  loss: number;
  training_time: number;
  parameters: number;
  size: number;
  metrics: JSONObject;
  hyperparameters: JSONObject;
}

export interface InferenceResult {
  prediction: number[] | JSONObject;
  confidence: number;
  processing_time: number;
  model_version: string;
  metadata: JSONObject;
}

export interface OptimizationResult {
  best_params: JSONObject;
  best_score: number;
  optimization_history: {
    params: JSONObject;
    score: number;
    iteration: number;
  }[];
  time_taken: number;
}