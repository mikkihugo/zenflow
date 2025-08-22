/**
 * @fileoverview Comprehensive Type Definitions for Swarm Service Results
 *
 * This file defines all the return types for SwarmService methods to replace
 * the `any` types and provide proper type safety throughout the codebase.
 *
 * @author Claude Code Zen Team
 * @version 1..0
 * @since 2025-08-14
 */

// Base interfaces for common structures
export interface PerformanceMetrics { accuracy: number; processing_speed_ms: number; memory_usage_mb: number; efficiency?: number; learning_rate?: number;
}

export interface SwarmPerformanceMetrics { initialization_time_ms: number; memory_usage_mb: number; spawn_time_ms?: number; memory_overhead_mb?: number; orchestration_time_ms?: number; estimated_completion_ms?: number; actual_completion_ms?: number; claude_execution_time?: number;
}

export interface SystemInfo { cpu_cores: number; memory_gb: number; node_version: string; v8_version?: string; os?: string; arch?: string;
}

// Neural network related interfaces
export interface NeuralAgentInfo { id: string; exists: boolean; neural_network_active: boolean; cognitive_pattern: string; training_progress: number;
}

export interface NeuralSystemInfo { total_agents: number; neural_enabled: number; average_performance: number;
}

export interface NeuralStatusResult { agent?: NeuralAgentInfo; system?: NeuralSystemInfo; performance: PerformanceMetrics; capabilities?: string[];
}

// Training related interfaces
export interface TrainingResults { accuracy_before: number; accuracy_after: number; convergence_achieved: boolean; patterns_learned: string[];
}

export interface NeuralTrainingResult { training: { agent_id: string; iterations_completed: number; duration_ms: number; improvement_percentage: number; }; results: TrainingResults;
}

// Cognitive patterns
export interface CognitivePattern { description: string; efficiency: number; usage: number;
}

export interface CognitivePatternsResult { patterns?: Record<string, CognitivePattern>; pattern?: CognitivePattern | null; active_pattern?: string; pattern_switching_enabled?: boolean;
}

// Memory usage interfaces
export interface SystemMemoryUsage { rss: number; heap_used: number; heap_total: number; external: number;
}

export interface SwarmMemoryInfo { active_swarms: number; total_agents: number; active_tasks: number;
}

export interface AgentMemoryInfo { id: string; memory_mb: number; neural_model_size_mb: number;
}

export interface MemoryUsageResult { system: SystemMemoryUsage; swarm: SwarmMemoryInfo; agents?: AgentMemoryInfo[];
}

// Benchmark interfaces
export interface BenchmarkMetrics { wasm?: { avg_time_ms: number; throughput_ops_sec: number; efficiency: number; }; swarm?: { coordination_latency_ms: number; agent_spawn_time_ms: number; task_distribution_ms: number; }; agent?: { response_time_ms: number; decision_accuracy: number; learning_rate: number; }; task?: { completion_time_ms: number; success_rate: number; parallel_efficiency: number; };
}

export interface BenchmarkResult { benchmark: { type: string; iterations: number; duration_ms: number; timestamp: string; }; results: BenchmarkMetrics; system_info: SystemInfo;
}

// Feature detection interfaces
export interface FeatureCapabilities { wasm?: { available: boolean; simd_support: boolean; threads_support: boolean; }; simd?: { available: boolean; instruction_sets: string[]; performance_boost: number; }; memory?: { max_heap_mb: number; shared_array_buffer: boolean; }; platform?: { os: string; arch: string; node_version: string; v8_version: string; };
}

export interface FeatureDetectionResult { detection: { category: string; timestamp: string; capabilities_detected: number; }; features: FeatureCapabilities; recommendations: string[];
}

// Monitoring interfaces
export interface MonitoringSnapshot { timestamp: string; active_swarms: number; total_agents: number; active_tasks: number; memory_usage_mb: number; cpu_usage: number;
}

export interface MonitoringSummary { avg_memory_mb: number; avg_cpu_usage: number; stable_agents: boolean; performance_trend: 'stable  |improving || degrad'i''n'g');
}

export interface SwarmMonitorResult { monitoring: { duration_seconds: number; interval_seconds: number; snapshots_taken: number; monitoring_time_ms: number; }; snapshots: MonitoringSnapshot[]; summary: MonitoringSummary;
}

// Agent listing interfaces
export interface AgentInfo { id: string; name: string; type: string; status: string; swarm_id: string; current_task?: string; capabilities: string[]; created: string; neural_network_active: boolean; cognitive_pattern: string;
}

export interface AgentSummary { by_status: { idle: number; busy: number; }; by_type: Record<string, number>;
}

export interface AgentListResult { filter: string; total_agents: number; filtered_count: number; agents: AgentInfo[]; summary: AgentSummary;
}

// Agent metrics interfaces
export interface IndividualAgentMetrics { cpu: { usage_percent: number; avg_response_time_ms: number; }; memory: { used_mb: number; peak_mb: number; }; tasks: { completed: number; failed: number; success_rate: number; }; performance: { accuracy: number; efficiency: number; learning_rate: number; };
}

export interface AggregateAgentMetrics { avg_cpu_usage: number; total_memory_mb: number; total_tasks_completed: number; avg_success_rate: number; system_efficiency: number;
}

export interface TopPerformer { id: string; type: string; performance_score: number;
}

export interface AgentMetricsResult { agent_id?: string; metric: string; timestamp: string; metrics?: IndividualAgentMetrics | Partial<IndividualAgentMetrics>; status?: string; uptime_seconds?: number; total_agents?: number; aggregate_metrics?: AggregateAgentMetrics; top_performers?: TopPerformer[];
}

// Task results interfaces
export interface TaskExecutionDetails { claude_cli_used: boolean; file_operations: boolean; structured_output: boolean; execution_time_ms?: number;
}

export interface BaseTaskResult { task_id: string; status: string; description: string; created: string; completed?: string; assigned_agents: string[]; progress: number;
}

export interface TaskResultsDetailed extends BaseTaskResult { actual_work?: boolean; results?: any; provider?: string; performance?: SwarmPerformanceMetrics; error?: string; output_file?: string; execution_details: TaskExecutionDetails;
}

export interface TaskResultsSummary extends BaseTaskResult { success: boolean; provider_used: string; has_results: boolean; execution_time_ms?: number; error_message?: string;
}

export interface TaskResultsRaw extends BaseTaskResult { actual_work?: boolean; results?: any; provider?: string; performance?: SwarmPerformanceMetrics; error?: string; output_file?: string; raw_data: any;
}

export type TaskResultsResult = 'TaskResultsSummary | TaskResultsDetailed | TaskResultsRaw';`