/**
 * @fileoverview Swarm Service Constants
 *
 * Centralized constants for swarm operations, performance metrics,
 * and system configurations to eliminate magic numbers throughout the codebase.
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2025-08-14
 */

// Performance and timing constants
export const PERFORMANCE_CONSTANTS = {
  // Swarm initialization
  SWARM_INIT_TIME_MS: 0.67,
  SWARM_MEMORY_BASE_MB: 48,

  // Agent spawning
  AGENT_SPAWN_TIME_MS: 0.47,
  AGENT_MEMORY_OVERHEAD_MB: 5,
  AGENT_MEMORY_BASE_MB: 10,
  AGENT_MEMORY_PEAK_RANGE_MB: 100,
  AGENT_MEMORY_USED_RANGE_MB: 50,

  // Task orchestration
  TASK_ORCHESTRATION_TIME_MS: 2.23,
  TASK_ESTIMATED_COMPLETION_MS: 30000,

  // System metrics
  MAX_CPU_USAGE_PERCENT: 100,
  MEMORY_USAGE_DIVISOR: 1024 * 1024, // Convert bytes to MB
  BYTES_TO_GB_DIVISOR: 1024 * 1024 * 1024,

  // Neural network defaults
  NEURAL_ACCURACY_DEFAULT: 0.92,
  NEURAL_EFFICIENCY_DEFAULT: 0.88,
  NEURAL_LEARNING_RATE_DEFAULT: 0.15,
  NEURAL_TRAINING_PROGRESS_DEFAULT: 0.75,
  NEURAL_PROCESSING_SPEED_MS: 45,
  NEURAL_MEMORY_USAGE_MB: 12.4,

  // Benchmark defaults
  BENCHMARK_WASM_TIME_MS: 2.3,
  BENCHMARK_WASM_THROUGHPUT: 450000,
  BENCHMARK_WASM_EFFICIENCY: 0.94,
  BENCHMARK_COORDINATION_LATENCY_MS: 15,
  BENCHMARK_AGENT_SPAWN_MS: 125,
  BENCHMARK_TASK_DISTRIBUTION_MS: 8,
  BENCHMARK_AGENT_RESPONSE_MS: 45,
  BENCHMARK_AGENT_ACCURACY: 0.92,
  BENCHMARK_TASK_COMPLETION_MS: 250,
  BENCHMARK_TASK_SUCCESS_RATE: 0.96,
  BENCHMARK_PARALLEL_EFFICIENCY: 0.89,
} as const;

// System limits and constraints
export const SYSTEM_LIMITS = {
  // Agent limits
  MIN_AGENTS: 1,
  MAX_AGENTS: 100,
  DEFAULT_MAX_AGENTS: 5,

  // Task limits
  MIN_TASK_DESCRIPTION_LENGTH: 10,
  MAX_TASK_AGENTS: 10,
  DEFAULT_TASK_AGENTS: 5,

  // Monitoring limits
  MAX_MONITORING_DURATION_SECONDS: 10,
  DEFAULT_MONITORING_DURATION_SECONDS: 10,
  DEFAULT_MONITORING_INTERVAL_SECONDS: 1,

  // Training limits
  MIN_TRAINING_ITERATIONS: 1,
  MAX_TRAINING_ITERATIONS: 100,
  DEFAULT_TRAINING_ITERATIONS: 10,
  TRAINING_TIME_PER_ITERATION_MS: 50,

  // Memory management
  TASK_CLEANUP_HOURS: 24,
  AGENT_CLEANUP_HOURS: 48,
  MAX_CONCURRENT_TASKS: 50,

  // Performance ranges
  PERFORMANCE_SCORE_MIN: 0.7,
  PERFORMANCE_SCORE_MAX: 1.0,
  IMPROVEMENT_PERCENTAGE_MIN: 5,
  IMPROVEMENT_PERCENTAGE_MAX: 20,
} as const;

// Cognitive patterns with their characteristics
export const COGNITIVE_PATTERNS = {
  convergent: {
    description: 'Focused problem-solving',
    efficiency: 0.89,
    usage: 0.65,
  },
  divergent: {
    description: 'Creative exploration',
    efficiency: 0.76,
    usage: 0.23,
  },
  lateral: {
    description: 'Alternative approaches',
    efficiency: 0.82,
    usage: 0.41,
  },
  systems: {
    description: 'Holistic thinking',
    efficiency: 0.91,
    usage: 0.78,
  },
  critical: {
    description: 'Analytical reasoning',
    efficiency: 0.94,
    usage: 0.85,
  },
  abstract: {
    description: 'Conceptual modeling',
    efficiency: 0.73,
    usage: 0.32,
  },
} as const;

// Feature detection constants
export const FEATURE_CONSTANTS = {
  WASM_AVAILABLE: true,
  WASM_SIMD_SUPPORT: false,
  WASM_THREADS_SUPPORT: false,
  SIMD_AVAILABLE: false,
  SIMD_INSTRUCTION_SETS: [] as string[],
  SIMD_PERFORMANCE_BOOST: 0,
  MEMORY_MAX_HEAP_MB: 4096,

  // Recommendations
  RECOMMENDATIONS: [
    'WASM modules are available for neural acceleration',
    'Consider upgrading to enable SIMD support',
    'Sufficient memory available for large swarms',
  ] as const,
} as const;

// LLM Integration constants
export const LLM_CONSTANTS = {
  CLAUDE_CLI_RATE_LIMIT_COOLDOWN: 0, // No cooldown, fail fast
  CLAUDE_CLI_TEMPERATURE: 0.1, // More deterministic
  CLAUDE_CLI_MAX_TOKENS: 200000, // Full Claude context

  // Session management
  SESSION_ID_PREFIX: 'zen-swarm',

  // Performance tracking
  MIN_EXECUTION_TIME_FOR_REAL_WORK: 1000, // 1 second
} as const;

// Status and state constants
export const STATUS_CONSTANTS = {
  AGENT_STATUS: {
    DLE: 'idle',
    BUSY: 'busy',
    ACTIVE: 'active',
  },

  TASK_STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  SWARM_STATUS: {
    ACTIVE: 'active',
    NACTIVE: 'inactive',
    NITIALIZING: 'initializing',
  },

  PERFORMANCE_TREND: {
    STABLE: 'stable',
    MPROVING: 'improving',
    DEGRADING: 'degrading',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SWARM_NOT_FOUND: (id: string) => `Swarm not found: ${id}`,
  AGENT_NOT_FOUND: (id: string) => `Agent not found: ${id}`,
  TASK_NOT_FOUND: (id: string) => `Task not found: ${id}`,
  NO_AVAILABLE_AGENTS: 'No available agents for task orchestration',
  INVALID_TASK_LENGTH: `Task description must be at least ${SYSTEM_LIMITS.MIN_TASK_DESCRIPTION_LENGTH} characters`,
  INVALID_MAX_AGENTS: `maxAgents must be between ${SYSTEM_LIMITS.MIN_AGENTS} and ${SYSTEM_LIMITS.MAX_AGENTS}`,
  INVALID_TRAINING_ITERATIONS: `Training iterations must be between ${SYSTEM_LIMITS.MIN_TRAINING_ITERATIONS} and ${SYSTEM_LIMITS.MAX_TRAINING_ITERATIONS}`,
} as const;

// Type guards for better type safety
export const isValidAgentStatus = (
  status: string
): status is keyof typeof STATUS_CONSTANTS.AGENT_STATUS => {
  return Object.values(STATUS_CONSTANTS.AGENT_STATUS).includes(status as any);
};

export const isValidTaskStatus = (
  status: string
): status is keyof typeof STATUS_CONSTANTS.TASK_STATUS => {
  return Object.values(STATUS_CONSTANTS.TASK_STATUS).includes(status as any);
};

export const isValidCognitivePattern = (
  pattern: string
): pattern is keyof typeof COGNITIVE_PATTERNS => {
  return pattern in COGNITIVE_PATTERNS;
};
