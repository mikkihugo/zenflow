/**
 * @fileoverview Claude Code Model Strategy
 *
 * Defines when to use Opus vs Sonnet based on task complexity and type.
 * Strategy: Opus for planning/strategy, Sonnet for everything else.
 */

export type ModelType = 'opus' | 'sonnet';

export interface TaskContext {
  type: 'planning' | 'analysis' | 'generation' | 'processing' | 'coordination';
  complexity: 'low' | 'medium' | 'high';
  domain?: 'architecture' | 'strategy' | 'operations' | 'development';
  requiresReasoning: boolean;
}

/**
 * Determine optimal Claude model based on task characteristics
 */
export function selectOptimalModel(context: TaskContext): ModelType {
  // OPUS FOR PLANNING - Strategic tasks requiring deep reasoning
  if (context.type === 'planning') {
    return 'opus';
  }

  // OPUS FOR COMPLEX STRATEGY - High complexity strategic work
  if (
    context.complexity === 'high' &&
    (context.domain === 'architecture' || context.domain === 'strategy')
  ) {
    return 'opus';
  }

  // OPUS FOR COMPLEX REASONING - Multi-step decision making
  if (context.requiresReasoning && context.complexity === 'high') {
    return 'opus';
  }

  // SONNET FOR EVERYTHING ELSE - Efficient for standard tasks
  return 'sonnet';
}

/**
 * Pre-configured model assignments for common task types
 */
export const MODEL_ASSIGNMENTS = {
  // OPUS TASKS - Complex planning and strategy
  ARCHITECTURE_STRATEGY: 'opus' as ModelType,
  ROADMAP_PLANNING: 'opus' as ModelType,
  STRATEGIC_DECISIONS: 'opus' as ModelType,
  COMPLEX_ANALYSIS: 'opus' as ModelType,
  SYSTEM_DESIGN: 'opus' as ModelType,
  RISK_ASSESSMENT: 'opus' as ModelType,

  // SONNET TASKS - Standard operations
  CODE_ANALYSIS: 'sonnet' as ModelType,
  DATA_PROCESSING: 'sonnet' as ModelType,
  DOCUMENTATION: 'sonnet' as ModelType,
  SIMPLE_COORDINATION: 'sonnet' as ModelType,
  METRICS_ANALYSIS: 'sonnet' as ModelType,
  ROUTINE_OPERATIONS: 'sonnet' as ModelType,
  TEXT_GENERATION: 'sonnet' as ModelType,
  BASIC_REASONING: 'sonnet' as ModelType,
} as const;

/**
 * Model selection for specific system components
 */
export const COMPONENT_MODELS = {
  // Cubes - Strategic domain leadership (OPUS)
  'dev-cube-matron': 'opus' as ModelType,
  'ops-cube-matron': 'opus' as ModelType,

  // Planning Systems (OPUS)
  'predictive-analytics': 'opus' as ModelType,
  'strategic-planner': 'opus' as ModelType,
  'roadmap-generator': 'opus' as ModelType,

  // Intelligence Systems (SONNET - efficient processing)
  'agent-learning': 'sonnet' as ModelType,
  'task-predictor': 'sonnet' as ModelType,
  'health-monitor': 'sonnet' as ModelType,
  'performance-tracker': 'sonnet' as ModelType,

  // Coordination (SONNET - fast responses)
  'swarm-coordinator': 'sonnet' as ModelType,
  'workflow-engine': 'sonnet' as ModelType,
  'batch-processor': 'sonnet' as ModelType,

  // Analysis (SONNET unless complex)
  'code-analyzer': 'sonnet' as ModelType,
  'metrics-processor': 'sonnet' as ModelType,
  'data-transformer': 'sonnet' as ModelType,
} as const;

/**
 * Get model for a specific component
 */
export function getComponentModel(componentName: string): ModelType {
  return (
    COMPONENT_MODELS[componentName as keyof typeof COMPONENT_MODELS] || 'sonnet'
  );
}

/**
 * Model configuration with fallback strategy
 */
export interface ModelConfig {
  primary: ModelType;
  fallback: ModelType;
  rationale: string;
}

export function getModelConfig(context: TaskContext): ModelConfig {
  const primary = selectOptimalModel(context);

  return {
    primary,
    fallback: primary === 'opus' ? 'sonnet' : 'sonnet', // Always fallback to Sonnet
    rationale: generateRationale(context, primary),
  };
}

function generateRationale(
  context: TaskContext,
  selectedModel: ModelType
): string {
  if (selectedModel === 'opus') {
    return `Using Opus for ${context.type} task requiring strategic reasoning and planning`;
  }
  return `Using Sonnet for efficient ${context.type} processing and analysis`;
}

/**
 * Quick model selection helpers
 */
export const Models = {
  forPlanning: () => 'opus' as ModelType,
  forStrategy: () => 'opus' as ModelType,
  forAnalysis: () => 'sonnet' as ModelType,
  forProcessing: () => 'sonnet' as ModelType,
  forCoordination: () => 'sonnet' as ModelType,
  forComponent: (name: string) => getComponentModel(name),
} as const;
