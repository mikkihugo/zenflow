/**
 * @fileoverview Shared TypeScript definitions for Claude Zen + ruv-FANN integration
 * @module shared-types
 */
export interface SwarmConfig {
    name?: string;
    maxAgents?: number;
    topology?: 'hierarchical' | 'mesh' | 'ring' | 'star';
    strategy?: 'adaptive' | 'parallel' | 'sequential';
    cognitive_diversity?: boolean;
    neural_networks?: boolean;
    persistence?: PersistenceConfig;
    performance?: PerformanceConfig;
}
export interface PersistenceConfig {
    enabled: boolean;
    database?: string;
    type?: 'sqlite' | 'postgresql' | 'memory';
    backup?: boolean;
    compression?: boolean;
}
export interface PerformanceConfig {
    gpu_acceleration?: boolean;
    simd_optimization?: boolean;
    memory_limit?: string;
    thread_pool_size?: number;
}
export interface AgentConfig {
    type: 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator' | 'architect';
    name?: string;
    capabilities?: string[];
    cognitive_pattern?: 'adaptive' | 'focused' | 'creative' | 'analytical';
    specialization?: string;
    memory_size?: number;
    learning_rate?: number;
}
export interface AgentStatus {
    id: string;
    name: string;
    type: string;
    status: 'idle' | 'busy' | 'learning' | 'coordinating';
    current_task?: string;
    performance_metrics: PerformanceMetrics;
    neural_state?: NeuralState;
}
export interface TaskConfig {
    description: string;
    strategy?: 'parallel' | 'sequential' | 'adaptive';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    maxAgents?: number;
    timeout?: number;
    dependencies?: string[];
    metadata?: Record<string, any>;
}
export interface TaskResult {
    taskId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    metrics: TaskMetrics;
    agents_involved: string[];
    created_at: string;
    completed_at?: string;
    error?: string;
}
export interface TaskMetrics {
    execution_time: number;
    coordination_overhead: number;
    agent_utilization: number;
    success_rate: number;
    quality_score?: number;
}
export interface NeuralState {
    model_version: string;
    training_iterations: number;
    accuracy: number;
    loss: number;
    learning_rate: number;
    last_training: string;
}
export interface PerformanceMetrics {
    tasks_completed: number;
    average_completion_time: number;
    success_rate: number;
    coordination_efficiency: number;
    memory_usage: MemoryUsage;
    cpu_usage: number;
    neural_performance?: NeuralPerformance;
}
export interface MemoryUsage {
    total: number;
    used: number;
    available: number;
    peak: number;
}
export interface NeuralPerformance {
    inference_time: number;
    training_time: number;
    model_accuracy: number;
    gpu_utilization?: number;
}
export interface ServiceConfig {
    name: string;
    path: string;
    type: string;
    technologies: string[];
    apis: ApiEndpoint[];
    databases: DatabaseConnection[];
    dependencies: string[];
    complexity: 'low' | 'medium' | 'high';
    swarm_config?: SwarmConfig;
}
export interface ApiEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    parameters?: Parameter[];
    responses?: Response[];
}
export interface Parameter {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}
export interface Response {
    status: number;
    description: string;
    schema?: any;
}
export interface DatabaseConnection {
    name: string;
    type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
    connection_string?: string;
    tables?: string[];
}
export interface GraphNode {
    id: string;
    type: 'service' | 'technology' | 'api' | 'database' | 'hive';
    properties: Record<string, any>;
    created_at: string;
    updated_at: string;
}
export interface GraphRelationship {
    id: string;
    type: 'depends_on' | 'uses_tech' | 'exposes_api' | 'uses_database' | 'coordinates_with';
    from: string;
    to: string;
    properties: Record<string, any>;
    strength?: 'weak' | 'medium' | 'strong';
}
export interface GraphQuery {
    nodes?: {
        type?: string;
        properties?: Record<string, any>;
    };
    relationships?: {
        type?: string;
        properties?: Record<string, any>;
    };
    limit?: number;
    offset?: number;
}
export interface CoordinationMessage {
    id: string;
    from: string;
    to: string;
    type: 'task_assignment' | 'status_update' | 'coordination_request' | 'neural_update';
    payload: any;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
}
export interface HiveCoordination {
    hive_id: string;
    service_name: string;
    coordination_protocol: 'gossip' | 'consensus' | 'event_driven';
    peer_hives: string[];
    shared_memory: Record<string, any>;
    last_sync: string;
}
export interface MonorepoAnalysis {
    services: ServiceConfig[];
    relationships: GraphRelationship[];
    patterns: ArchitecturePattern[];
    recommendations: Recommendation[];
    graph_data?: GraphExport;
}
export interface ArchitecturePattern {
    type: 'technology_adoption' | 'service_size_distribution' | 'dependency_pattern';
    description: string;
    affected_services: string[];
    confidence: number;
    impact: 'low' | 'medium' | 'high';
}
export interface Recommendation {
    type: 'standardization' | 'complexity' | 'api_standardization' | 'performance';
    priority: 'low' | 'medium' | 'high';
    message: string;
    services: string[];
    estimated_effort: number;
}
export interface GraphExport {
    nodes: GraphNode[];
    relationships: GraphRelationship[];
    statistics: {
        node_count: number;
        relationship_count: number;
        last_updated: string;
    };
}
export interface CliCommand {
    name: string;
    description: string;
    usage: string;
    examples: string[];
    handler: (args: string[], flags: any) => Promise<any>;
    aliases?: string[];
    hidden?: boolean;
}
export interface CommandResult {
    success: boolean;
    data?: any;
    error?: string;
    metrics?: CommandMetrics;
}
export interface CommandMetrics {
    execution_time: number;
    memory_used: number;
    swarms_involved?: number;
    agents_spawned?: number;
}
export interface VisionConfig {
    title: string;
    description: string;
    objectives: string[];
    timeline: string;
    success_criteria: string[];
    stakeholders: string[];
    constraints?: string[];
}
export interface VisionDecomposition {
    vision_id: string;
    strategic_objectives: StrategicObjective[];
    tactical_implementations: TacticalImplementation[];
    coordination_requirements: CoordinationRequirement[];
    gap_analysis: GapAnalysis[];
}
export interface StrategicObjective {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeline: string;
    dependencies: string[];
    success_metrics: string[];
}
export interface TacticalImplementation {
    id: string;
    objective_id: string;
    task_description: string;
    assigned_services: string[];
    coordination_pattern: string;
    estimated_effort: number;
    prerequisites: string[];
}
export interface CoordinationRequirement {
    services: string[];
    communication_type: 'synchronous' | 'asynchronous' | 'event_driven';
    frequency: 'real_time' | 'periodic' | 'on_demand';
    data_sharing: boolean;
    conflict_resolution: 'consensus' | 'priority' | 'merge';
}
export interface GapAnalysis {
    area: string;
    current_state: string;
    desired_state: string;
    gap_description: string;
    recommended_actions: string[];
    impact: 'low' | 'medium' | 'high';
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    metadata?: Record<string, any>;
}
export interface ConfigBase {
    version: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map