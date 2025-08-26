/**
 * Coordination Types
 *
 * Types for swarm coordination, agents, tasks, and teamwork.
 * Consolidated from: swarm-types.ts, agent-types.ts, task-types.ts, queen-types.ts, swarm-results.ts
 */

// ============================================================================
// Swarm Types
// ============================================================================

export interface ZenSwarm {
	id: string;
	name?: string;
	topology: SwarmTopology;
	agents: SwarmAgent[];
	status: SwarmStatus;
	config: SwarmConfig;
	created: Date;
	updated: Date;
}

export interface SwarmConfig {
	maxAgents: number;
	topology: SwarmTopology;
	strategy: CoordinationStrategy;
	enableMemory?: boolean;
	heartbeatInterval?: number;
	timeout?: number;
	failureThreshold?: number;
}

export type SwarmTopology =
	| "mesh"
	| "hierarchical"
	| "ring"
	| "star"
	| "custom";

export type SwarmStatus =
	| "initializing"
	| "active"
	| "paused"
	| "stopping"
	| "stopped"
	| "error"
	| "degraded";

export type CoordinationStrategy =
	| "consensus"
	| "leader-follower"
	| "democratic"
	| "hierarchical"
	| "competitive";

// ============================================================================
// Agent Types
// ============================================================================

export interface SwarmAgent {
	id: string;
	name: string;
	type: AgentType;
	role: AgentRole;
	status: AgentStatus;
	capabilities: AgentCapabilities;
	metrics: AgentMetrics;
	config: AgentConfig;
	metadata?: Record<string, unknown>;
	created: Date;
	updated: Date;
}

export type AgentType =
	| "coordinator"
	| "worker"
	| "specialist"
	| "monitor"
	| "proxy";

export type AgentRole = "queen" | "commander" | "cube" | "matron" | "drone";

export type AgentStatus =
	| "idle"
	| "busy"
	| "error"
	| "offline"
	| "starting"
	| "stopping";

export interface AgentCapabilities {
	processing: string[];
	communication: string[];
	specialization: string[];
	maxConcurrency: number;
	supportedFormats: string[];
}

export interface AgentMetrics {
	tasksCompleted: number;
	tasksInProgress: number;
	errorCount: number;
	averageResponseTime: number;
	cpuUsage: number;
	memoryUsage: number;
	lastActivity: Date;
}

export interface AgentConfig {
	maxTasks: number;
	timeout: number;
	retryAttempts: number;
	healthCheckInterval: number;
	enableLogging: boolean;
	logLevel: "error" | "warn" | "info" | "debug";
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
	id: string;
	type: TaskType;
	status: TaskStatus;
	priority: TaskPriority;
	payload: TaskPayload;
	result?: TaskResult;
	error?: TaskError;
	assignedAgent?: string;
	created: Date;
	updated: Date;
	completed?: Date;
	timeout?: Date;
}

export type TaskType =
	| "analysis"
	| "generation"
	| "coordination"
	| "validation"
	| "integration"
	| "custom";

export type TaskStatus =
	| "pending"
	| "assigned"
	| "running"
	| "completed"
	| "failed"
	| "cancelled"
	| "timeout";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskPayload {
	action: string;
	parameters: Record<string, unknown>;
	context?: Record<string, unknown>;
	requirements?: TaskRequirements;
}

export interface TaskRequirements {
	agentType?: AgentType;
	capabilities?: string[];
	resources?: ResourceRequirements;
	deadline?: Date;
}

export interface ResourceRequirements {
	memory?: number;
	cpu?: number;
	storage?: number;
	network?: boolean;
}

export interface TaskResult {
	success: boolean;
	data?: unknown;
	metrics?: TaskMetrics;
	artifacts?: TaskArtifact[];
}

export interface TaskMetrics {
	duration: number;
	resourceUsage: ResourceUsage;
	quality?: QualityMetrics;
}

export interface ResourceUsage {
	memory: number;
	cpu: number;
	network: number;
	storage: number;
}

export interface QualityMetrics {
	accuracy?: number;
	completeness?: number;
	relevance?: number;
	confidence?: number;
}

export interface TaskArtifact {
	type: string;
	content: unknown;
	metadata?: Record<string, unknown>;
}

export interface TaskError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
	recoverable: boolean;
}

// ============================================================================
// Coordination Results
// ============================================================================

export interface SwarmResult {
	swarmId: string;
	operation: string;
	success: boolean;
	results: TaskResult[];
	metrics: SwarmMetrics;
	duration: number;
	timestamp: Date;
}

export interface SwarmMetrics {
	totalTasks: number;
	completedTasks: number;
	failedTasks: number;
	averageResponseTime: number;
	throughput: number;
	efficiency: number;
	agentUtilization: Record<string, number>;
}

// ============================================================================
// Communication Types
// ============================================================================

export interface SwarmMessage {
	id: string;
	from: string;
	to?: string; // undefined means broadcast
	type: MessageType;
	payload: unknown;
	timestamp: Date;
	priority: MessagePriority;
}

export type MessageType =
	| "task"
	| "result"
	| "status"
	| "heartbeat"
	| "error"
	| "coordination";

export type MessagePriority = "low" | "medium" | "high" | "urgent";

export interface CommunicationChannel {
	id: string;
	type: "direct" | "broadcast" | "multicast";
	participants: string[];
	config: ChannelConfig;
}

export interface ChannelConfig {
	persistent: boolean;
	encrypted: boolean;
	maxRetries: number;
	timeout: number;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isZenSwarm(obj: unknown): obj is ZenSwarm {
	return (
		obj &&
		typeof obj.id === "string" &&
		typeof obj.topology === "string" &&
		Array.isArray(obj.agents)
	);
}

export function isSwarmAgent(obj: unknown): obj is SwarmAgent {
	return (
		obj &&
		typeof obj.id === "string" &&
		typeof obj.name === "string" &&
		typeof obj.type === "string"
	);
}

export function isTask(obj: unknown): obj is Task {
	return (
		obj &&
		typeof obj.id === "string" &&
		typeof obj.type === "string" &&
		typeof obj.status === "string"
	);
}

export function isSwarmMessage(obj: unknown): obj is SwarmMessage {
	return (
		obj &&
		typeof obj.id === "string" &&
		typeof obj.from === "string" &&
		typeof obj.type === "string"
	);
}
