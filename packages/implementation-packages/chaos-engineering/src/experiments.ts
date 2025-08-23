/**
 * @fileoverview Extended Chaos Experiments for production scenarios
 *
 * Additional chaos experiments beyond the basic built-ins. Includes
 * advanced failure scenarios, enterprise-grade testing, and specialized
 * resilience validation patterns.
 */

import type { ChaosExperiment } from "./main.js";

/**
 * Advanced database chaos experiments
 */
export function createDatabaseChaosExperiments(): Partial<ChaosExperiment>[] {
	return [
		{
			name: "database_connection_pool_exhaustion",
			description: "Test recovery from database connection pool exhaustion",
			category: "database",
			failureType: "connection_pool_exhaustion",
			parameters: {
				poolSize: 100,
				duration: 90000, // 1.5 minutes
				exhaustionPercent: 0.95, // Use 95% of pool
			},
			expectedRecovery: ["automatic", "connection_pool_scaling"],
			blastRadius: 0.4,
			duration: 180000, // 3 minutes
			safetyChecks: [
				"database_backup_available",
				"connection_monitoring_active",
			],
		},

		{
			name: "database_slow_query_injection",
			description: "Inject slow database queries to test timeout handling",
			category: "database",
			failureType: "slow_query_injection",
			parameters: {
				queryDelayMs: 30000, // 30 second delays
				affectedQueries: ["SELECT", "UPDATE"],
				intensity: 0.3, // Affect 30% of queries
			},
			expectedRecovery: ["query_timeout", "connection_retry"],
			blastRadius: 0.25,
			duration: 120000, // 2 minutes
			safetyChecks: ["database_performance_monitoring"],
		},
	];
}

/**
 * Advanced network chaos experiments
 */
export function createNetworkChaosExperiments(): Partial<ChaosExperiment>[] {
	return [
		{
			name: "network_partition_simulation",
			description: "Simulate network partitions between service components",
			category: "network",
			failureType: "network_partition",
			parameters: {
				partitionType: "split_brain", // or "isolated_node"
				duration: 60000,
				affectedServices: ["mcp-server", "database", "cache"],
			},
			expectedRecovery: ["leader_election", "service_discovery"],
			blastRadius: 0.6,
			duration: 150000, // 2.5 minutes
			safetyChecks: ["service_mesh_available", "load_balancer_healthy"],
		},

		{
			name: "network_latency_injection",
			description: "Inject variable network latency to test timeout resilience",
			category: "network",
			failureType: "network_latency",
			parameters: {
				baseLatencyMs: 100,
				spikeLatencyMs: 5000,
				spikeFrequency: 0.1, // 10% of requests get spikes
				jitterPercent: 0.2, // 20% jitter
			},
			expectedRecovery: ["circuit_breaker", "adaptive_timeout"],
			blastRadius: 0.3,
			duration: 180000, // 3 minutes
			safetyChecks: ["latency_monitoring_active"],
		},
	];
}

/**
 * Advanced system chaos experiments
 */
export function createSystemChaosExperiments(): Partial<ChaosExperiment>[] {
	return [
		{
			name: "disk_io_throttling",
			description: "Throttle disk I/O to test performance degradation recovery",
			category: "system",
			failureType: "disk_io_throttling",
			parameters: {
				throttlePercent: 0.1, // Reduce to 10% normal speed
				duration: 120000,
				affectedPaths: ["/tmp", "/var/log"],
			},
			expectedRecovery: ["io_queue_management", "temporary_storage_cleanup"],
			blastRadius: 0.2,
			duration: 180000, // 3 minutes
			safetyChecks: ["disk_space_available", "io_monitoring_active"],
		},

		{
			name: "file_descriptor_exhaustion",
			description: "Exhaust file descriptors to test resource limit handling",
			category: "system",
			failureType: "fd_exhaustion",
			parameters: {
				targetFdCount: 1000,
				exhaustionRate: 50, // Open 50 FDs per second
				duration: 60000,
			},
			expectedRecovery: ["fd_cleanup", "resource_limit_scaling"],
			blastRadius: 0.15,
			duration: 120000, // 2 minutes
			safetyChecks: ["fd_monitoring_active", "system_limits_configured"],
		},
	];
}

/**
 * Enterprise-grade application chaos experiments
 */
export function createApplicationChaosExperiments(): Partial<ChaosExperiment>[] {
	return [
		{
			name: "cache_invalidation_storm",
			description:
				"Invalidate cache entries rapidly to test cache miss recovery",
			category: "application",
			failureType: "cache_invalidation_storm",
			parameters: {
				invalidationRate: 100, // Invalidations per second
				cacheKeys: ["user_sessions", "api_responses", "database_queries"],
				duration: 90000,
			},
			expectedRecovery: ["cache_warming", "database_fallback"],
			blastRadius: 0.35,
			duration: 150000, // 2.5 minutes
			safetyChecks: ["cache_monitoring_active", "database_ready"],
		},

		{
			name: "api_rate_limit_breach",
			description: "Exceed API rate limits to test throttling and backoff",
			category: "application",
			failureType: "api_rate_limit_breach",
			parameters: {
				requestsPerSecond: 1000,
				targetEndpoints: ["/api/v1/users", "/api/v1/data"],
				duration: 60000,
			},
			expectedRecovery: ["exponential_backoff", "request_queuing"],
			blastRadius: 0.25,
			duration: 120000, // 2 minutes
			safetyChecks: ["rate_limiting_configured", "api_monitoring_active"],
		},

		{
			name: "memory_fragmentation_induction",
			description: "Induce memory fragmentation to test garbage collection",
			category: "application",
			failureType: "memory_fragmentation",
			parameters: {
				fragmentationPattern: "alternating_alloc_free",
				allocationSizeBytes: 1024 * 1024, // 1MB chunks
				fragmentationCycles: 100,
				duration: 120000,
			},
			expectedRecovery: ["garbage_collection", "memory_compaction"],
			blastRadius: 0.2,
			duration: 180000, // 3 minutes
			safetyChecks: ["memory_monitoring_active", "gc_tuning_enabled"],
		},
	];
}

/**
 * Security-focused chaos experiments
 */
export function createSecurityChaosExperiments(): Partial<ChaosExperiment>[] {
	return [
		{
			name: "certificate_expiration_simulation",
			description: "Simulate certificate expiration to test renewal processes",
			category: "security",
			failureType: "certificate_expiration",
			parameters: {
				certificateTypes: ["tls", "client_auth", "jwt_signing"],
				expirationWindowHours: 1, // Expire in 1 hour
				duration: 30000, // Short test
			},
			expectedRecovery: ["certificate_renewal", "graceful_fallback"],
			blastRadius: 0.1,
			duration: 60000, // 1 minute
			safetyChecks: [
				"certificate_monitoring_active",
				"backup_certificates_available",
			],
		},

		{
			name: "authentication_service_degradation",
			description: "Degrade authentication service to test fallback mechanisms",
			category: "security",
			failureType: "auth_service_degradation",
			parameters: {
				degradationType: "high_latency", // or "intermittent_failures"
				latencyMs: 10000, // 10 second delays
				failureRate: 0.3, // 30% failure rate
				duration: 90000,
			},
			expectedRecovery: ["cached_auth", "secondary_auth_provider"],
			blastRadius: 0.4,
			duration: 150000, // 2.5 minutes
			safetyChecks: ["auth_monitoring_active", "emergency_auth_available"],
		},
	];
}

/**
 * Get all extended chaos experiments
 */
export function getAllExtendedExperiments(): Partial<ChaosExperiment>[] {
	return [
		...createDatabaseChaosExperiments(),
		...createNetworkChaosExperiments(),
		...createSystemChaosExperiments(),
		...createApplicationChaosExperiments(),
		...createSecurityChaosExperiments(),
	];
}

/**
 * Experiment categories for organization
 */
export const EXPERIMENT_CATEGORIES = {
	DATABASE: "database",
	NETWORK: "network",
	SYSTEM: "system",
	APPLICATION: "application",
	SECURITY: "security",
	INTEGRATION: "integration",
} as const;

/**
 * Common experiment parameters templates
 */
export const EXPERIMENT_PARAMETER_TEMPLATES = {
	DURATION_SHORT: { duration: 30000 }, // 30 seconds
	DURATION_MEDIUM: { duration: 120000 }, // 2 minutes
	DURATION_LONG: { duration: 300000 }, // 5 minutes

	BLAST_RADIUS_MINIMAL: { blastRadius: 0.1 }, // 10%
	BLAST_RADIUS_LOW: { blastRadius: 0.25 }, // 25%
	BLAST_RADIUS_MEDIUM: { blastRadius: 0.5 }, // 50%
	BLAST_RADIUS_HIGH: { blastRadius: 0.75 }, // 75%

	SAFETY_CHECKS_BASIC: {
		safetyChecks: ["memory_available", "cpu_available", "disk_space_available"],
	},
	SAFETY_CHECKS_NETWORK: {
		safetyChecks: [
			"connection_backup_available",
			"load_balancer_healthy",
			"service_discovery_active",
		],
	},
	SAFETY_CHECKS_DATABASE: {
		safetyChecks: [
			"database_backup_available",
			"replication_healthy",
			"connection_pool_healthy",
		],
	},
} as const;
