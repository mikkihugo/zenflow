/**
 * @fileoverview Agent Monitoring System Interface Delegation
 *
 * Provides interface delegation to @claude-zen/agent-monitoring package following
 * the same architectural pattern as database and monitoring delegation.
 *
 * Runtime imports prevent circular dependencies while providing unified access
 * to comprehensive agent health monitoring, intelligence systems, and performance tracking through operations package.
 *
 * Delegates to:
 * - @claude-zen/agent-monitoring: Agent health monitoring, intelligence systems, performance tracking
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from "@claude-zen/foundation";

const logger = getLogger("operations-agent-monitoring");

/**
 * Custom error types for agent monitoring operations
 */
export class AgentMonitoringSystemError extends Error {
	public override cause?: Error;

	constructor(message: string, cause?: Error) {
		super(message);
		this.name = "AgentMonitoringSystemError";
		if (cause) {
			this.cause = cause;
		}
	}
}

export class AgentMonitoringSystemConnectionError extends AgentMonitoringSystemError {
	constructor(message: string, cause?: Error) {
		super(message, cause);
		this.name = "AgentMonitoringSystemConnectionError";
	}
}

interface IntelligenceSystem {
	initialize(): Promise<void>;
	trackBehavior(agentId: string, behavior: AgentBehavior): Promise<void>;
	getInsights(agentId: string): Promise<AgentInsights>;
}

interface IntelligenceFactory {
	createIntelligenceSystem(
		config?: AgentMonitoringSystemConfig,
	): Promise<IntelligenceSystem>;
	createBehaviorAnalyzer(
		config?: AgentMonitoringSystemConfig,
	): Promise<BehaviorAnalyzer>;
}

interface PerformanceTracker {
	initialize(): Promise<void>;
	trackPerformance(agentId: string, metrics: PerformanceMetrics): Promise<void>;
	getReport(agentId: string): Promise<PerformanceReport>;
}

interface TaskPredictor {
	initialize(): Promise<void>;
	predictDuration(task: TaskDescription): Promise<number>;
	updatePrediction(taskId: string, actualDuration: number): Promise<void>;
}

interface HealthStatus {
	agentId: string;
	status: "healthy|degraded|unhealthy";
	lastCheck: Date;
	metrics?: Record<string, any>;
}

interface AgentHealthMonitor {
	initialize(): Promise<void>;
	checkHealth(agentId: string): Promise<HealthStatus>;
	monitorContinuously(agentId: string, interval: number): Promise<void>;
}

interface BehaviorAnalyzer {
	analyzeBehavior(agentId: string): Promise<BehaviorAnalysis>;
	identifyPatterns(agentId: string): Promise<BehaviorPattern[]>;
}

interface AgentBehavior {
	timestamp: Date;
	action: string;
	context: Record<string, unknown>;
	outcome: "success|failure|partial";
}

interface AgentInsights {
	strengths: string[];
	weaknesses: string[];
	recommendations: string[];
	confidence: number;
}

interface PerformanceMetrics {
	timestamp: Date;
	responseTime: number;
	throughput: number;
	errorRate: number;
	resourceUsage: ResourceUsage;
}

interface ResourceUsage {
	cpu: number;
	memory: number;
	network: number;
}

interface PerformanceReport {
	agentId: string;
	timeRange: { start: Date; end: Date };
	averageResponseTime: number;
	totalThroughput: number;
	errorRate: number;
	trends: PerformanceTrend[];
}

interface PerformanceTrend {
	metric: string;
	direction: "improving|declining|stable";
	confidence: number;
}

interface TaskDescription {
	type: string;
	complexity: number;
	context: Record<string, unknown>;
}

interface BehaviorAnalysis {
	agentId: string;
	patterns: BehaviorPattern[];
	anomalies: BehaviorAnomaly[];
	recommendations: string[];
}

interface BehaviorPattern {
	id: string;
	description: string;
	frequency: number;
	confidence: number;
}

interface BehaviorAnomaly {
	id: string;
	description: string;
	severity: "low|medium|high";
	timestamp: Date;
}

/**
 * Agent monitoring module interface for accessing real agent monitoring backends.
 * @internal
 */
interface AgentMonitoringSystemModule {
	IntelligenceSystem: new (
		config?: AgentMonitoringSystemConfig,
	) => IntelligenceSystem;
	IntelligenceFactory: new (
		config?: AgentMonitoringSystemConfig,
	) => IntelligenceFactory;
	PerformanceTracker: new (
		config?: AgentMonitoringSystemConfig,
	) => PerformanceTracker;
	TaskPredictor: new (config?: AgentMonitoringSystemConfig) => TaskPredictor;
	AgentHealthMonitor: new (
		config?: AgentMonitoringSystemConfig,
	) => AgentHealthMonitor;
	createIntelligenceSystem?: (
		config?: AgentMonitoringSystemConfig,
	) => IntelligenceSystem;
	createIntelligenceFactory?: (
		config?: AgentMonitoringSystemConfig,
	) => IntelligenceFactory;
	createPerformanceTracker?: (
		config?: AgentMonitoringSystemConfig,
	) => PerformanceTracker;
}

/**
 * Agent monitoring access interface
 */
interface AgentMonitoringSystemAccess {
	/**
	 * Create a new intelligence system
	 */
	createIntelligenceSystem(
		config?: AgentMonitoringSystemConfig,
	): Promise<IntelligenceSystem>;

	/**
	 * Create a new intelligence factory
	 */
	createIntelligenceFactory(
		config?: AgentMonitoringSystemConfig,
	): Promise<IntelligenceFactory>;

	/**
	 * Create a new performance tracker
	 */
	createPerformanceTracker(
		config?: AgentMonitoringSystemConfig,
	): Promise<PerformanceTracker>;

	/**
	 * Create a new task predictor
	 */
	createTaskPredictor(
		config?: AgentMonitoringSystemConfig,
	): Promise<TaskPredictor>;

	/**
	 * Create an agent health monitor
	 */
	createAgentHealthMonitor(
		config?: AgentMonitoringSystemConfig,
	): Promise<AgentHealthMonitor>;
}

/**
 * Agent monitoring configuration interface
 */
interface AgentMonitoringSystemConfig {
	enableIntelligenceTracking?: boolean;
	enablePerformanceMonitoring?: boolean;
	enableHealthMonitoring?: boolean;
	enableTaskPrediction?: boolean;
	monitoringInterval?: number;
	healthThreshold?: number;
	performanceMetrics?: string[];
}

/**
 * Implementation of agent monitoring access via runtime delegation
 */
class AgentMonitoringSystemAccessImpl implements AgentMonitoringSystemAccess {
	private agentMonitoringModule: AgentMonitoringSystemModule | null = null;

	private async getAgentMonitoringModule(): Promise<AgentMonitoringSystemModule> {
		if (!this.agentMonitoringModule) {
			try {
				// Import the agent-monitoring package at runtime (matches database pattern)
				// Use dynamic import with string to avoid TypeScript compile-time checking
				const packageName = "@claude-zen/agent-monitoring";
				this.agentMonitoringModule = (await import(
					packageName
				)) as AgentMonitoringSystemModule;
				logger.debug("Agent monitoring module loaded successfully");
			} catch (error) {
				throw new AgentMonitoringSystemConnectionError(
					"Agent monitoring package not available. Operations requires @claude-zen/agent-monitoring for monitoring operations.",
					error instanceof Error ? error : undefined,
				);
			}
		}
		return this.agentMonitoringModule;
	}

	async createIntelligenceSystem(
		config?: AgentMonitoringSystemConfig,
	): Promise<IntelligenceSystem> {
		const module = await this.getAgentMonitoringModule();
		logger.debug("Creating intelligence system via operations delegation", {
			config,
		});
		return module.createIntelligenceSystem
			? module.createIntelligenceSystem(config)
			: new module.IntelligenceSystem(config);
	}

	async createIntelligenceFactory(
		config?: AgentMonitoringSystemConfig,
	): Promise<IntelligenceFactory> {
		const module = await this.getAgentMonitoringModule();
		logger.debug("Creating intelligence factory via operations delegation", {
			config,
		});
		return module.createIntelligenceFactory
			? module.createIntelligenceFactory(config)
			: new module.IntelligenceFactory(config);
	}

	async createPerformanceTracker(
		config?: AgentMonitoringSystemConfig,
	): Promise<PerformanceTracker> {
		const module = await this.getAgentMonitoringModule();
		logger.debug("Creating performance tracker via operations delegation", {
			config,
		});
		return module.createPerformanceTracker
			? module.createPerformanceTracker(config)
			: new module.PerformanceTracker(config);
	}

	async createTaskPredictor(
		config?: AgentMonitoringSystemConfig,
	): Promise<TaskPredictor> {
		const module = await this.getAgentMonitoringModule();
		logger.debug("Creating task predictor via operations delegation", {
			config,
		});
		return new module.TaskPredictor(config);
	}

	async createAgentHealthMonitor(
		config?: AgentMonitoringSystemConfig,
	): Promise<AgentHealthMonitor> {
		const module = await this.getAgentMonitoringModule();
		logger.debug("Creating agent health monitor via operations delegation", {
			config,
		});
		return new module.AgentHealthMonitor(config);
	}
}

// Global singleton instance
let globalAgentMonitoringSystemAccess: AgentMonitoringSystemAccess | null =
	null;

/**
 * Get agent monitoring access interface (singleton pattern)
 */
export function getAgentMonitoringSystemAccess(): AgentMonitoringSystemAccess {
	if (!globalAgentMonitoringSystemAccess) {
		globalAgentMonitoringSystemAccess = new AgentMonitoringSystemAccessImpl();
		logger.info("Initialized global agent monitoring access");
	}
	return globalAgentMonitoringSystemAccess;
}

/**
 * Create an intelligence system through operations delegation
 * @param config - Intelligence system configuration
 */
export async function getIntelligenceSystem(
	config?: AgentMonitoringSystemConfig,
): Promise<IntelligenceSystem> {
	const monitoringSystem = getAgentMonitoringSystemAccess();
	return monitoringSystem.createIntelligenceSystem(config);
}

/**
 * Create an intelligence factory through operations delegation
 * @param config - Intelligence factory configuration
 */
export async function getIntelligenceFactory(
	config?: AgentMonitoringSystemConfig,
): Promise<IntelligenceFactory> {
	const monitoringSystem = getAgentMonitoringSystemAccess();
	return await Promise.resolve(
		monitoringSystem.createIntelligenceFactory(config),
	);
}

/**
 * Create a performance tracker through operations delegation
 * @param config - Performance tracker configuration
 */
export async function getPerformanceTracker(
	config?: AgentMonitoringSystemConfig,
): Promise<PerformanceTracker> {
	const monitoringSystem = getAgentMonitoringSystemAccess();
	return await Promise.resolve(
		monitoringSystem.createPerformanceTracker(config),
	);
}

/**
 * Create a task predictor through operations delegation
 * @param config - Task predictor configuration
 */
export async function getTaskPredictor(
	config?: AgentMonitoringSystemConfig,
): Promise<TaskPredictor> {
	const monitoringSystem = getAgentMonitoringSystemAccess();
	return await Promise.resolve(monitoringSystem.createTaskPredictor(config));
}

/**
 * Create an agent health monitor through operations delegation
 * @param config - Agent health monitor configuration
 */
export async function getAgentHealthMonitor(
	config?: AgentMonitoringSystemConfig,
): Promise<AgentHealthMonitor> {
	const monitoringSystem = getAgentMonitoringSystemAccess();
	return await Promise.resolve(
		monitoringSystem.createAgentHealthMonitor(config),
	);
}

interface LLMCompletionOptions {
	maxTokens?: number;
	temperature?: number;
	stopSequences?: string[];
}

interface LLMMessage {
	role: "user|assistant|system";
	content: string;
}

interface LLMProvider {
	complete(prompt: string, options?: LLMCompletionOptions): Promise<string>;
	chat(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<string>;
}

interface LLMProviderConfig {
	model?: string;
	apiKey?: string;
	baseUrl?: string;
}

/**
 * Get LLM provider through operations delegation (fallback implementation)
 * @param config - LLM provider configuration
 */
export async function getLLMProvider(
	config?: LLMProviderConfig,
): Promise<LLMProvider> {
	logger.debug("Creating LLM provider via operations facade (fallback mode)", {
		config,
	});

	// Simple fallback LLM provider
	return await Promise.resolve({
		complete: async (prompt: string, options: LLMCompletionOptions = {}) => {
			logger.debug("LLM completion request (fallback mode)", {
				promptLength: prompt.length,
				options,
			});
			return await Promise.resolve(
				`LLM response for: ${prompt.substring(0, 50)}...`,
			);
		},
		chat: async (
			messages: LLMMessage[],
			options: LLMCompletionOptions = {},
		) => {
			logger.debug("LLM chat request (fallback mode)", {
				messageCount: messages.length,
				options,
			});
			return await Promise.resolve(
				`Chat response for ${messages.length} messages`,
			);
		},
	});
}

interface TrackingResult {
	agentId?: string;
	timestamp: Date;
	metrics?: Record<string, unknown>;
}

// Simple AgentMonitor class for compatibility
export class AgentMonitor {
	async track(): Promise<TrackingResult> {
		return await Promise.resolve({
			timestamp: new Date(),
			metrics: {},
		});
	}
}

export function createAgentMonitor() {
	return new AgentMonitor();
}

// Professional agent monitoring object with proper naming (matches Storage/Telemetry patterns)
export const agentMonitoringSystem = {
	getAccess: getAgentMonitoringSystemAccess,
	getIntelligenceSystem,
	getIntelligenceFactory,
	getPerformanceTracker,
	getTaskPredictor,
	getHealthMonitor: getAgentHealthMonitor,
};

// Type exports for external consumers
export type { AgentMonitoringSystemAccess, AgentMonitoringSystemConfig };
