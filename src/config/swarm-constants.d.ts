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
export declare const PERFORMANCE_CONSTANTS: {
    readonly SWARM_INIT_TIME_MS: 0.67;
    readonly SWARM_MEMORY_BASE_MB: 48;
    readonly AGENT_SPAWN_TIME_MS: 0.47;
    readonly AGENT_MEMORY_OVERHEAD_MB: 5;
    readonly AGENT_MEMORY_BASE_MB: 10;
    readonly AGENT_MEMORY_PEAK_RANGE_MB: 100;
    readonly AGENT_MEMORY_USED_RANGE_MB: 50;
    readonly TASK_ORCHESTRATION_TIME_MS: 2.23;
    readonly TASK_ESTIMATED_COMPLETION_MS: 30000;
    readonly MAX_CPU_USAGE_PERCENT: 100;
    readonly MEMORY_USAGE_DIVISOR: number;
    readonly BYTES_TO_GB_DIVISOR: number;
    readonly NEURAL_ACCURACY_DEFAULT: 0.92;
    readonly NEURAL_EFFICIENCY_DEFAULT: 0.88;
    readonly NEURAL_LEARNING_RATE_DEFAULT: 0.15;
    readonly NEURAL_TRAINING_PROGRESS_DEFAULT: 0.75;
    readonly NEURAL_PROCESSING_SPEED_MS: 45;
    readonly NEURAL_MEMORY_USAGE_MB: 12.4;
    readonly BENCHMARK_WASM_TIME_MS: 2.3;
    readonly BENCHMARK_WASM_THROUGHPUT: 450000;
    readonly BENCHMARK_WASM_EFFICIENCY: 0.94;
    readonly BENCHMARK_COORDINATION_LATENCY_MS: 15;
    readonly BENCHMARK_AGENT_SPAWN_MS: 125;
    readonly BENCHMARK_TASK_DISTRIBUTION_MS: 8;
    readonly BENCHMARK_AGENT_RESPONSE_MS: 45;
    readonly BENCHMARK_AGENT_ACCURACY: 0.92;
    readonly BENCHMARK_TASK_COMPLETION_MS: 250;
    readonly BENCHMARK_TASK_SUCCESS_RATE: 0.96;
    readonly BENCHMARK_PARALLEL_EFFICIENCY: 0.89;
};
export declare const SYSTEM_LIMITS: {
    readonly MIN_AGENTS: 1;
    readonly MAX_AGENTS: 100;
    readonly DEFAULT_MAX_AGENTS: 5;
    readonly MIN_TASK_DESCRIPTION_LENGTH: 10;
    readonly MAX_TASK_AGENTS: 10;
    readonly DEFAULT_TASK_AGENTS: 5;
    readonly MAX_MONITORING_DURATION_SECONDS: 10;
    readonly DEFAULT_MONITORING_DURATION_SECONDS: 10;
    readonly DEFAULT_MONITORING_INTERVAL_SECONDS: 1;
    readonly MIN_TRAINING_ITERATIONS: 1;
    readonly MAX_TRAINING_ITERATIONS: 100;
    readonly DEFAULT_TRAINING_ITERATIONS: 10;
    readonly TRAINING_TIME_PER_ITERATION_MS: 50;
    readonly TASK_CLEANUP_HOURS: 24;
    readonly AGENT_CLEANUP_HOURS: 48;
    readonly MAX_CONCURRENT_TASKS: 50;
    readonly PERFORMANCE_SCORE_MIN: 0.7;
    readonly PERFORMANCE_SCORE_MAX: 1;
    readonly IMPROVEMENT_PERCENTAGE_MIN: 5;
    readonly IMPROVEMENT_PERCENTAGE_MAX: 20;
};
export declare const COGNITIVE_PATTERNS: {
    readonly convergent: {
        readonly description: "Focused problem-solving";
        readonly efficiency: 0.89;
        readonly usage: 0.65;
    };
    readonly divergent: {
        readonly description: "Creative exploration";
        readonly efficiency: 0.76;
        readonly usage: 0.23;
    };
    readonly lateral: {
        readonly description: "Alternative approaches";
        readonly efficiency: 0.82;
        readonly usage: 0.41;
    };
    readonly systems: {
        readonly description: "Holistic thinking";
        readonly efficiency: 0.91;
        readonly usage: 0.78;
    };
    readonly critical: {
        readonly description: "Analytical reasoning";
        readonly efficiency: 0.94;
        readonly usage: 0.85;
    };
    readonly abstract: {
        readonly description: "Conceptual modeling";
        readonly efficiency: 0.73;
        readonly usage: 0.32;
    };
};
export declare const FEATURE_CONSTANTS: {
    readonly WASM_AVAILABLE: true;
    readonly WASM_SIMD_SUPPORT: false;
    readonly WASM_THREADS_SUPPORT: false;
    readonly SIMD_AVAILABLE: false;
    readonly SIMD_INSTRUCTION_SETS: string[];
    readonly SIMD_PERFORMANCE_BOOST: 0;
    readonly MEMORY_MAX_HEAP_MB: 4096;
    readonly RECOMMENDATIONS: readonly ["WASM modules are available for neural acceleration", "Consider upgrading to enable SIMD support", "Sufficient memory available for large swarms"];
};
export declare const LLM_CONSTANTS: {
    readonly CLAUDE_CLI_RATE_LIMIT_COOLDOWN: 0;
    readonly CLAUDE_CLI_TEMPERATURE: 0.1;
    readonly CLAUDE_CLI_MAX_TOKENS: 200000;
    readonly SESSION_ID_PREFIX: "zen-swarm";
    readonly MIN_EXECUTION_TIME_FOR_REAL_WORK: 1000;
};
export declare const STATUS_CONSTANTS: {
    readonly AGENT_STATUS: {
        readonly DLE: "idle";
        readonly BUSY: "busy";
        readonly ACTIVE: "active";
    };
    readonly TASK_STATUS: {
        readonly PENDING: "pending";
        readonly RUNNING: "running";
        readonly COMPLETED: "completed";
        readonly FAILED: "failed";
        readonly CANCELLED: "cancelled";
    };
    readonly SWARM_STATUS: {
        readonly ACTIVE: "active";
        readonly NACTIVE: "inactive";
        readonly NITIALIZING: "initializing";
    };
    readonly PERFORMANCE_TREND: {
        readonly STABLE: "stable";
        readonly MPROVING: "improving";
        readonly DEGRADING: "degrading";
    };
};
export declare const ERROR_MESSAGES: {
    readonly SWARM_NOT_FOUND: (id: string) => string;
    readonly AGENT_NOT_FOUND: (id: string) => string;
    readonly TASK_NOT_FOUND: (id: string) => string;
    readonly NO_AVAILABLE_AGENTS: "No available agents for task orchestration";
    readonly INVALID_TASK_LENGTH: "Task description must be at least 10 characters";
    readonly INVALID_MAX_AGENTS: "maxAgents must be between 1 and 100";
    readonly INVALID_TRAINING_ITERATIONS: "Training iterations must be between 1 and 100";
};
export declare const isValidAgentStatus: (status: string) => status is keyof typeof STATUS_CONSTANTS.AGENT_STATUS;
export declare const isValidTaskStatus: (status: string) => status is keyof typeof STATUS_CONSTANTS.TASK_STATUS;
export declare const isValidCognitivePattern: (pattern: string) => pattern is keyof typeof COGNITIVE_PATTERNS;
//# sourceMappingURL=swarm-constants.d.ts.map