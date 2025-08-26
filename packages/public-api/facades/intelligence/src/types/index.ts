/**
 * @fileoverview Intelligence Package Types
 *
 * Centralized type exports for the Intelligence strategic interface delegation package.
 * Provides type safety for AI, Neural, ML, and Safety systems.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

// Local type definitions for intelligence strategic facade
// Note: Strategic facades provide fallback types when implementation packages aren't available

// Brain System Types - local definitions with fallback compatibility
export interface BrainSystemConfig {
	autonomous?: {
		enabled?: boolean;
		learningRate?: number;
		adaptationThreshold?: number;
	};
	enableMetrics?: boolean;
	enableGPU?: boolean;
	neuralNetworkType?: "feedforward|recurrent|transformer";
	maxConcurrentTasks?: number;
}

// AI Safety System Types - local definitions with fallback compatibility
export interface AISafetySystemConfig {
	enableDeceptionDetection?: boolean;
	enableNeuralSafety?: boolean;
	enableLogAnalysis?: boolean;
	safetyThreshold?: number;
	detectionSensitivity?: "low|medium|high|critical";
}

// Fact System Types - local definitions with fallback compatibility
export interface FactSystemConfig {
	enableReasoning?: boolean;
	enableWasmTools?: boolean;
	enableKnowledgeGraph?: boolean;
	reasoningDepth?: number;
	confidenceThreshold?: number;
	maxFacts?: number;
}

export interface FactSearchQuery {
	question: string;
	context?: string;
	maxResults?: number;
	confidenceThreshold?: number;
}

export interface FactSearchResult {
	facts: Array<{
		id: string;
		content: string;
		confidence: number;
		source?: string;
	}>;
	query: string;
	totalResults: number;
	processingTime: number;
}

// Note: neural-ml and dspy types are not exposed here
// They are internal dependencies of the brain package only

/**
 * Unified Intelligence System Configuration
 * Combines all AI/Neural/ML system configurations
 */
export interface IntelligenceSystemConfig {
	brain?: {
		autonomous?: {
			enabled?: boolean;
			learningRate?: number;
			adaptationThreshold?: number;
		};
		enableMetrics?: boolean;
		enableGPU?: boolean;
		neuralNetworkType?: "feedforward|recurrent|transformer";
		maxConcurrentTasks?: number;
	};

	safety?: {
		enableDeceptionDetection?: boolean;
		enableNeuralSafety?: boolean;
		enableLogAnalysis?: boolean;
		safetyThreshold?: number;
		detectionSensitivity?: "low|medium|high|critical";
	};

	// Note: neuralML and dspy configs are handled internally by brain package

	factSystem?: {
		enableReasoning?: boolean;
		enableWasmTools?: boolean;
		enableKnowledgeGraph?: boolean;
		reasoningDepth?: number;
		confidenceThreshold?: number;
		maxFacts?: number;
	};
}

/**
 * Intelligence System Status
 */
export interface IntelligenceSystemStatus {
	brain: {
		isConnected: boolean;
		isInitialized: boolean;
		activeTasks: number;
		performanceMetrics?: {
			averageResponseTime: number;
			successRate: number;
			memoryUsage: number;
		};
	};

	safety: {
		isConnected: boolean;
		isMonitoring: boolean;
		threatLevel: "low|medium|high|critical";
		detectionsCount: number;
	};

	// Note: neuralML and dspy status are handled internally by brain package

	factSystem: {
		isConnected: boolean;
		factsCount: number;
		reasoningActive: boolean;
		knowledgeGraphSize?: number;
	};
}

/**
 * Intelligence System Metrics
 */
export interface IntelligenceSystemMetrics {
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	averageResponseTime: number;

	brainMetrics: {
		coordinationTasks: number;
		neuralProcessingTime: number;
		autonomousDecisions: number;
	};

	safetyMetrics: {
		threatsDetected: number;
		falsePositives: number;
		safetyScore: number;
	};

	// Note: mlMetrics and dspyMetrics are handled internally by brain package

	factMetrics: {
		factsProcessed: number;
		reasoningOperations: number;
		knowledgeQueries: number;
	};
}

// Document Type exports
export type DocumentType =
	"text|markdown|json|xml|html|code|configuration|unknown";
