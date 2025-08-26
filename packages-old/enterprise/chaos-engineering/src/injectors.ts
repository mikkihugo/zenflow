/**
 * @fileoverview Advanced Failure Injectors for Chaos Engineering
 *
 * Extended collection of failure injectors beyond the basic built-ins.
 * Includes sophisticated failure patterns for database, network, security,
 * and application-level chaos testing.
 */

import type { ExperimentParameters } from "./main";

export interface InjectionResult {
	type: string;
	duration: number;
	[key: string]: unknown;
}

export interface FailureInjector {
	inject: (params: ExperimentParameters) => Promise<InjectionResult>;
	cleanup?: (injectionResult: InjectionResult) => Promise<void>;
}

/**
 * Database failure injectors
 */
export class DatabaseFailureInjectors {
	static connectionPoolExhaustion(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const poolSize = params.poolSize || 100;
				const exhaustionPercent = params.exhaustionPercent || 0.9;
				const duration = params.duration || 60000;

				// Simulate connection pool exhaustion by creating many connections
				const targetConnections = Math.floor(poolSize * exhaustionPercent);
				const connections: Array<{ id: string; created: Date }> = [];

				// Simulate async connection creation with delays
				for (let i = 0; i < targetConnections; i++) {
					await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to simulate real connection
					connections.push({
						id: `exhaust-conn-${i}`,
						created: new Date(),
					});
				}

				return {
					type: "connection_pool_exhaustion",
					poolSize,
					exhaustionPercent,
					connectionsCreated: connections.length,
					duration,
					connections,
					cleanupTimer: setTimeout(() => {
						connections.length = 0; // Release connections
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				if (injectionResult.connections) {
					// Simulate async cleanup with small delay
					await new Promise((resolve) => setTimeout(resolve, 10));
					(injectionResult.connections as Array<unknown>).length = 0;
				}
			},
		};
	}

	static slowQueryInjection(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const queryDelayMs = params.queryDelayMs || 5000;
				const affectedQueries = params.affectedQueries || ["SELECT"];
				const intensity = params.intensity || 0.1;
				const duration = params.duration || 60000;

				// Simulate query delays by tracking affected operations
				const delayedQueries: Array<{
					type: string;
					delay: number;
					timestamp: Date;
				}> = [];

				// Simulate async setup with realistic initialization delay
				await new Promise((resolve) => setTimeout(resolve, 100));

				return {
					type: "slow_query_injection",
					queryDelayMs,
					affectedQueries,
					intensity,
					duration,
					delayedQueries,
					injectionActive: true,
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				injectionResult.injectionActive = false;
				// Simulate async cleanup operations
				await new Promise((resolve) => setTimeout(resolve, 50));
				if (injectionResult.delayedQueries) {
					(injectionResult.delayedQueries as Array<unknown>).length = 0;
				}
			},
		};
	}
}

/**
 * Network failure injectors
 */
export class NetworkFailureInjectors {
	static networkPartition(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const partitionType = params.partitionType || "split_brain";
				const affectedServices = params.affectedServices || [
					"service1",
					"service2",
				];
				const duration = params.duration || 60000;

				// Simulate network partition by blocking communication between services
				const partitions: Array<{
					from: string;
					to: string;
					blocked: boolean;
				}> = [];

				// Simulate async partition setup
				for (let i = 0; i < affectedServices.length; i++) {
					for (let j = i + 1; j < affectedServices.length; j++) {
						await new Promise((resolve) => setTimeout(resolve, 10));
						partitions.push({
							from: affectedServices[i] as string,
							to: affectedServices[j] as string,
							blocked: true,
						});
					}
				}

				return {
					type: "network_partition",
					partitionType,
					affectedServices,
					partitions,
					duration,
					cleanupTimer: setTimeout(() => {
						for (const p of partitions) {
							p.blocked = false;
						}
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				if (injectionResult.partitions) {
					// Simulate async network partition cleanup
					await new Promise((resolve) => setTimeout(resolve, 100));
					for (const p of (injectionResult.partitions as Array<{ blocked: boolean }>)) {
							p.blocked = false;
						}
					
				}
			},
		};
	}

	static networkLatencyInjection(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const baseLatencyMs = params.baseLatencyMs || 100;
				const spikeLatencyMs = params.spikeLatencyMs || 2000;
				const spikeFrequency = params.spikeFrequency || 0.1;
				const jitterPercent = params.jitterPercent || 0.1;
				const duration = params.duration || 60000;

				// Simulate async latency injection setup
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Track latency injection statistics
				const latencyStats = {
					requestsProcessed: 0,
					spikesInjected: 0,
					avgLatencyMs: baseLatencyMs,
					maxLatencyMs: baseLatencyMs,
				};

				return {
					type: "network_latency",
					baseLatencyMs,
					spikeLatencyMs,
					spikeFrequency,
					jitterPercent,
					duration,
					latencyStats,
					injectionActive: true,
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				// Simulate async latency cleanup with graceful shutdown
				await new Promise((resolve) => setTimeout(resolve, 75));
				injectionResult.injectionActive = false;
			},
		};
	}
}

/**
 * System failure injectors
 */
export class SystemFailureInjectors {
	static diskIOThrottling(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const throttlePercent = params.throttlePercent || 0.1;
				const affectedPaths = params.affectedPaths || ["/tmp"];
				const duration = params.duration || 60000;

				// Simulate async disk I/O setup with path analysis
				await new Promise((resolve) => setTimeout(resolve, 150));

				// Simulate disk I/O throttling by tracking operations
				const throttledOperations: Array<{
					path: string;
					operation: string;
					delayMs: number;
				}> = [];

				return {
					type: "disk_io_throttling",
					throttlePercent,
					affectedPaths,
					duration,
					throttledOperations,
					injectionActive: true,
					cleanupTimer: setTimeout(() => {
						throttledOperations.length = 0;
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				injectionResult.injectionActive = false;
				if (injectionResult.throttledOperations) {
					(injectionResult.throttledOperations as Array<unknown>).length = 0;
				}
			},
		};
	}

	static fileDescriptorExhaustion(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const targetFdCount = params.targetFdCount || 500;
				const exhaustionRate = params.exhaustionRate || 10;
				const duration = params.duration || 60000;

				// Simulate FD exhaustion by tracking open descriptors
				const openDescriptors: Array<{
					fd: string;
					type: string;
					opened: Date;
				}> = [];

				const exhaustionInterval = setInterval(() => {
					for (let i = 0; i < exhaustionRate; i++) {
						if (openDescriptors.length < targetFdCount) {
							openDescriptors.push({
								fd: `fd-${Date.now()}-${i}`,
								type: "simulated",
								opened: new Date(),
							});
						}
					}
				}, 1000);

				return {
					type: "fd_exhaustion",
					targetFdCount,
					exhaustionRate,
					duration,
					openDescriptors,
					exhaustionInterval,
					cleanupTimer: setTimeout(() => {
						clearInterval(exhaustionInterval);
						openDescriptors.length = 0;
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.exhaustionInterval) {
					clearInterval(injectionResult.exhaustionInterval as NodeJS.Timeout);
				}
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				if (injectionResult.openDescriptors) {
					(injectionResult.openDescriptors as Array<unknown>).length = 0;
				}
			},
		};
	}
}

/**
 * Application failure injectors
 */
export class ApplicationFailureInjectors {
	static cacheInvalidationStorm(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const invalidationRate = params.invalidationRate || 50;
				const cacheKeys = params.cacheKeys || ["default"];
				const duration = params.duration || 60000;

				// Track cache invalidation activity
				const invalidations: Array<{ key: string; timestamp: Date }> = [];

				const invalidationInterval = setInterval(() => {
					for (let i = 0; i < invalidationRate; i++) {
						const key = cacheKeys[
							Math.floor(Math.random() * cacheKeys.length)
						] as string;
						invalidations.push({
							key: `${key}-${Date.now()}-${i}`,
							timestamp: new Date(),
						});
					}
				}, 1000);

				return {
					type: "cache_invalidation_storm",
					invalidationRate,
					cacheKeys,
					duration,
					invalidations,
					invalidationInterval,
					cleanupTimer: setTimeout(() => {
						clearInterval(invalidationInterval);
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.invalidationInterval) {
					clearInterval(injectionResult.invalidationInterval as NodeJS.Timeout);
				}
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				if (injectionResult.invalidations) {
					(injectionResult.invalidations as Array<unknown>).length = 0;
				}
			},
		};
	}

	static memoryFragmentation(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const fragmentationPattern =
					params.fragmentationPattern || "alternating_alloc_free";
				const allocationSizeBytes = params.allocationSizeBytes || 1024 * 1024;
				const fragmentationCycles = params.fragmentationCycles || 50;
				const duration = params.duration || 60000;

				// Create memory fragmentation by alternating allocations
				const allocations: Array<{
					id: string;
					size: number;
					data: Buffer | null;
				}> = [];

				for (let cycle = 0; cycle < fragmentationCycles; cycle++) {
					if (fragmentationPattern === "alternating_alloc_free") {
						// Allocate
						const allocation = {
							id: `alloc-${cycle}`,
							size: allocationSizeBytes as number,
							data: Buffer.alloc(allocationSizeBytes as number),
						};
						allocations.push(allocation);

						// Free every other allocation to create fragmentation
						if (cycle % 2 === 1 && allocations.length >= 2) {
							const toFree = allocations[allocations.length - 2];
							if (toFree) {
								toFree.data = null;
							}
						}
					}
				}

				return {
					type: "memory_fragmentation",
					fragmentationPattern,
					allocationSizeBytes,
					fragmentationCycles,
					duration,
					allocations,
					cleanupTimer: setTimeout(() => {
						for (const alloc of allocations) {
							alloc.data = null;
						}
						allocations.length = 0;
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				if (injectionResult.allocations) {
					for (const alloc of (injectionResult.allocations as Array<{ data: Buffer | null }>)) {
						alloc.data = null;
					}
					(injectionResult.allocations as Array<unknown>).length = 0;
				}
			},
		};
	}
}

/**
 * Security failure injectors
 */
export class SecurityFailureInjectors {
	static certificateExpiration(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const certificateTypes = params.certificateTypes || ["tls"];
				const expirationWindowHours = params.expirationWindowHours || 24;
				const duration = params.duration || 30000;

				// Simulate certificate expiration tracking
				const expiredCertificates: Array<{
					type: string;
					expiredAt: Date;
					gracePeriodMs: number;
				}> = [];

				for (const type of certificateTypes) {
					expiredCertificates.push({
						type: type as string,
						expiredAt: new Date(
							Date.now() + (expirationWindowHours as number) * 60 * 60 * 1000,
						),
						gracePeriodMs: 3600000, // 1 hour grace period
					});
				}

				return {
					type: "certificate_expiration",
					certificateTypes,
					expirationWindowHours,
					duration,
					expiredCertificates,
					injectionActive: true,
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				injectionResult.injectionActive = false;
				if (injectionResult.expiredCertificates) {
					(injectionResult.expiredCertificates as Array<unknown>).length = 0;
				}
			},
		};
	}

	static authServiceDegradation(): FailureInjector {
		return {
			inject: async (params: ExperimentParameters) => {
				const degradationType = params.degradationType || "high_latency";
				const latencyMs = params.latencyMs || 5000;
				const failureRate = params.failureRate || 0.1;
				const duration = params.duration || 60000;

				// Track authentication service degradation
				const authAttempts: Array<{
					timestamp: Date;
					latencyMs: number;
					success: boolean;
					degradationType: string;
				}> = [];

				return {
					type: "auth_service_degradation",
					degradationType,
					latencyMs,
					failureRate,
					duration,
					authAttempts,
					injectionActive: true,
					cleanupTimer: setTimeout(() => {
						authAttempts.length = 0;
					}, duration),
				};
			},

			cleanup: async (injectionResult: InjectionResult) => {
				if (injectionResult.cleanupTimer) {
					clearTimeout(injectionResult.cleanupTimer as NodeJS.Timeout);
				}
				injectionResult.injectionActive = false;
				if (injectionResult.authAttempts) {
					(injectionResult.authAttempts as Array<unknown>).length = 0;
				}
			},
		};
	}
}

/**
 * Get all advanced failure injectors
 */
export function getAllAdvancedInjectors(): Record<string, FailureInjector> {
	return {
		// Database injectors
		connection_pool_exhaustion:
			DatabaseFailureInjectors.connectionPoolExhaustion(),
		slow_query_injection: DatabaseFailureInjectors.slowQueryInjection(),

		// Network injectors
		network_partition: NetworkFailureInjectors.networkPartition(),
		network_latency: NetworkFailureInjectors.networkLatencyInjection(),

		// System injectors
		disk_io_throttling: SystemFailureInjectors.diskIOThrottling(),
		fd_exhaustion: SystemFailureInjectors.fileDescriptorExhaustion(),

		// Application injectors
		cache_invalidation_storm:
			ApplicationFailureInjectors.cacheInvalidationStorm(),
		memory_fragmentation: ApplicationFailureInjectors.memoryFragmentation(),

		// Security injectors
		certificate_expiration: SecurityFailureInjectors.certificateExpiration(),
		auth_service_degradation: SecurityFailureInjectors.authServiceDegradation(),
	};
}
