/**
 * Memory Domain REST API Controller.
 * Provides comprehensive REST endpoints for memory management.
 *
 * @file Memory-controller.ts.
 * @description Enhanced memory controller with DI integration for Issue #63.
 */
const __esDecorate =
	(this && this.__esDecorate) ||
	((
		ctor,
		descriptorIn,
		decorators,
		contextIn,
		initializers,
		extraInitializers,
	) => {
		function accept(f) {
			if (f !== void 0 && typeof f !== "function")
				throw new TypeError("Function expected");
			return f;
		}
		const kind = contextIn.kind,
			key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
		const target =
			!descriptorIn && ctor ? (contextIn.static ? ctor : ctor.prototype) : null;
		const descriptor =
			descriptorIn ||
			(target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
		let _,
			done = false;
		for (let i = decorators.length - 1; i >= 0; i--) {
			const context = {};
			for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
			for (var p in contextIn.access) context.access[p] = contextIn.access[p];
			context.addInitializer = (f) => {
				if (done)
					throw new TypeError(
						"Cannot add initializers after decoration has completed",
					);
				extraInitializers.push(accept(f || null));
			};
			const result = (0, decorators[i])(
				kind === "accessor"
					? { get: descriptor.get, set: descriptor.set }
					: descriptor[key],
				context,
			);
			if (kind === "accessor") {
				if (result === void 0) continue;
				if (result === null || typeof result !== "object")
					throw new TypeError("Object expected");
				if ((_ = accept(result.get))) descriptor.get = _;
				if ((_ = accept(result.set))) descriptor.set = _;
				if ((_ = accept(result.init))) initializers.unshift(_);
			} else if ((_ = accept(result))) {
				if (kind === "field") initializers.unshift(_);
				else descriptor[key] = _;
			}
		}
		if (target) Object.defineProperty(target, contextIn.name, descriptor);
		done = true;
	});
const __runInitializers =
	(this && this.__runInitializers) ||
	((thisArg, initializers, value) => {
		const useValue = arguments.length > 2;
		for (let i = 0; i < initializers.length; i++) {
			value = useValue
				? initializers[i].call(thisArg, value)
				: initializers[i].call(thisArg);
		}
		return useValue ? value : void 0;
	});

import { injectable } from "../di/decorators/injectable";

/**
 * Memory REST API Controller.
 * Provides comprehensive memory management through REST endpoints.
 *
 * @example
 */
const MemoryController = (() => {
	const _classDecorators = [injectable];
	let _classDescriptor;
	const _classExtraInitializers = [];
	let _classThis;
	var MemoryController = class {
		static {
			_classThis = this;
		}
		static {
			const _metadata =
				typeof Symbol === "function" && Symbol.metadata
					? Object.create(null)
					: void 0;
			__esDecorate(
				null,
				(_classDescriptor = { value: _classThis }),
				_classDecorators,
				{ kind: "class", name: _classThis.name, metadata: _metadata },
				null,
				_classExtraInitializers,
			);
			MemoryController = _classThis = _classDescriptor.value;
			if (_metadata)
				Object.defineProperty(_classThis, Symbol.metadata, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: _metadata,
				});
			__runInitializers(_classThis, _classExtraInitializers);
		}
		_factory;
		_config;
		_logger;
		backend;
		performanceMetrics = {
			operationCount: 0,
			totalResponseTime: 0,
			errorCount: 0,
			startTime: Date.now(),
		};
		constructor(_factory, _config, _logger) {
			this._factory = _factory;
			this._config = _config;
			this._logger = _logger;
			this.initializeBackend();
		}
		/**
		 * GET /api/memory/status.
		 * Get memory system status and health information.
		 */
		async getMemoryStatus() {
			const startTime = Date.now();
			try {
				this._logger.debug("Getting memory system status");
				const [size, isHealthy] = await Promise.all([
					this.backend.size(),
					this.backend.health(),
				]);
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				return {
					success: true,
					data: {
						status: isHealthy ? "healthy" : "unhealthy",
						totalKeys: size,
						backend: this._config.type,
						uptime: Math.floor(
							(Date.now() - this.performanceMetrics.startTime) / 1000,
						),
						configuration: {
							type: this._config.type,
							maxSize: this._config.maxSize || -1,
							ttl: this._config.ttl || 0,
							compression: this._config.compression,
						},
					},
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Failed to get memory status: ${error}`);
				return {
					success: false,
					error: `Failed to get memory status: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * POST /api/memory/store.
		 * Store data in memory with optional TTL and compression.
		 *
		 * @param request
		 */
		async storeMemory(request) {
			const startTime = Date.now();
			try {
				this._logger.debug(`Storing memory key: ${request.key}`);
				if (!request.key) {
					throw new Error("Key is required for store operation");
				}
				if (request.value === undefined) {
					throw new Error("Value is required for store operation");
				}
				// Process value with options (TTL, compression, etc.)
				const processedValue = this.processValueForStorage(
					request.value,
					request.options,
				);
				await this.backend.store(request.key, processedValue);
				const size = await this.backend.size();
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				this._logger.debug(`Successfully stored key: ${request.key}`);
				return {
					success: true,
					data: {
						key: request.key,
						stored: true,
						compressed: request.options?.compress,
						ttl: request.options?.ttl || 0,
					},
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(
					`Failed to store memory key ${request.key}: ${error}`,
				);
				return {
					success: false,
					error: `Failed to store memory: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * GET /api/memory/retrieve/:key.
		 * Retrieve data from memory by key.
		 *
		 * @param key
		 */
		async retrieveMemory(key) {
			const startTime = Date.now();
			try {
				this._logger.debug(`Retrieving memory key: ${key}`);
				if (!key) {
					throw new Error("Key is required for retrieve operation");
				}
				const rawValue = await this.backend.retrieve(key);
				const processedValue = this.processValueFromStorage(rawValue);
				const size = await this.backend.size();
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				this._logger.debug(`Successfully retrieved key: ${key}`);
				return {
					success: true,
					data: {
						key,
						value: processedValue?.value,
						exists: rawValue !== undefined,
						metadata: processedValue?.metadata || {},
						retrieved: true,
					},
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Failed to retrieve memory key ${key}: ${error}`);
				return {
					success: false,
					error: `Failed to retrieve memory: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * DELETE /api/memory/delete/:key.
		 * Delete data from memory by key.
		 *
		 * @param key
		 */
		async deleteMemory(key) {
			const startTime = Date.now();
			try {
				this._logger.debug(`Deleting memory key: ${key}`);
				if (!key) {
					throw new Error("Key is required for delete operation");
				}
				await this.backend.delete(key);
				const size = await this.backend.size();
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				this._logger.debug(`Successfully deleted key: ${key}`);
				return {
					success: true,
					data: {
						key,
						deleted: true,
					},
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Failed to delete memory key ${key}: ${error}`);
				return {
					success: false,
					error: `Failed to delete memory: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * POST /api/memory/clear.
		 * Clear all memory data.
		 */
		async clearMemory() {
			const startTime = Date.now();
			try {
				this._logger.info("Clearing all memory data");
				await this.backend.clear();
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				this._logger.info("Successfully cleared all memory data");
				return {
					success: true,
					data: {
						cleared: true,
						totalKeys: 0,
					},
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Failed to clear memory: ${error}`);
				return {
					success: false,
					error: `Failed to clear memory: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * POST /api/memory/batch.
		 * Perform multiple memory operations in a single request.
		 *
		 * @param request
		 */
		async batchOperations(request) {
			const startTime = Date.now();
			try {
				this._logger.debug(
					`Executing batch operations: ${request.operations.length} operations`,
				);
				const results = [];
				let errorCount = 0;
				for (const operation of request.operations) {
					try {
						let result;
						switch (operation.type) {
							case "store":
								result = await this.storeMemory({
									key: operation.key,
									value: operation.value,
									options: operation.options,
								});
								break;
							case "retrieve":
								result = await this.retrieveMemory(operation.key);
								break;
							case "delete":
								result = await this.deleteMemory(operation.key);
								break;
							default:
								throw new Error(
									`Unsupported operation type: ${operation.type}`,
								);
						}
						results.push({
							operation: operation.type,
							key: operation.key,
							success: result?.success,
							data: result?.data,
							error: result?.error,
						});
						if (!result?.success) {
							errorCount++;
							if (!request.continueOnError) {
								break;
							}
						}
					} catch (error) {
						errorCount++;
						results.push({
							operation: operation.type,
							key: operation.key,
							success: false,
							error: error instanceof Error ? error.message : "Unknown error",
						});
						if (!request.continueOnError) {
							break;
						}
					}
				}
				const size = await this.backend.size();
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, errorCount === 0);
				this._logger.debug(
					`Batch operations completed: ${results.length} operations, ${errorCount} errors`,
				);
				return {
					success: errorCount === 0,
					data: {
						results,
						totalOperations: request.operations.length,
						successfulOperations: results.length - errorCount,
						failedOperations: errorCount,
					},
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Batch operations failed: ${error}`);
				return {
					success: false,
					error: `Batch operations failed: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * GET /api/memory/analytics.
		 * Get comprehensive memory analytics and performance metrics.
		 */
		async getMemoryAnalytics() {
			const startTime = Date.now();
			try {
				this._logger.debug("Getting memory analytics");
				const size = await this.backend.size();
				const isHealthy = await this.backend.health();
				const analytics = {
					totalKeys: size,
					backend: this._config.type,
					performance: {
						averageResponseTime:
							this.performanceMetrics.operationCount > 0
								? this.performanceMetrics.totalResponseTime /
									this.performanceMetrics.operationCount
								: 0,
						successRate:
							this.performanceMetrics.operationCount > 0
								? ((this.performanceMetrics.operationCount -
										this.performanceMetrics.errorCount) /
										this.performanceMetrics.operationCount) *
									100
								: 100,
						errorRate:
							this.performanceMetrics.operationCount > 0
								? (this.performanceMetrics.errorCount /
										this.performanceMetrics.operationCount) *
									100
								: 0,
						operationsPerSecond: this.calculateOperationsPerSecond(),
					},
					usage: {
						memoryUsed: process.memoryUsage().heapUsed,
						maxMemory: this._config.maxSize || -1,
						utilizationPercent: this._config.maxSize
							? (size / this._config.maxSize) * 100
							: 0,
					},
					health: {
						status: isHealthy ? "healthy" : "critical",
						uptime: Math.floor(
							(Date.now() - this.performanceMetrics.startTime) / 1000,
						),
						lastHealthCheck: Date.now(),
					},
				};
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, true);
				return {
					success: true,
					data: analytics,
					metadata: {
						size,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			} catch (error) {
				const executionTime = Date.now() - startTime;
				this.updateMetrics(executionTime, false);
				this._logger.error(`Failed to get analytics: ${error}`);
				return {
					success: false,
					error: `Failed to get analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
					metadata: {
						size: 0,
						timestamp: Date.now(),
						executionTime,
						backend: this._config.type,
					},
				};
			}
		}
		/**
		 * Initialize the memory backend.
		 */
		initializeBackend() {
			try {
				this.backend = this._factory.createProvider(this._config);
				this._logger.info(
					`Memory controller initialized with ${this._config.type} backend`,
				);
			} catch (error) {
				this._logger.error(`Failed to initialize memory backend: ${error}`);
				throw error;
			}
		}
		/**
		 * Process value for storage (add metadata, compression, etc.).
		 *
		 * @param value
		 * @param options
		 */
		processValueForStorage(value, options) {
			const processed = {
				value,
				metadata: {
					storedAt: Date.now(),
					ttl: options?.ttl || 0,
					compressed: options?.compress,
					originalSize: 0, // Will be set below if compression is enabled
					...options?.metadata,
				},
			};
			// Add compression logic here if needed
			if (options?.compress) {
				// Compression implementation would go here
				processed.metadata.originalSize = JSON.stringify(value).length;
			}
			return processed;
		}
		/**
		 * Process value from storage (decompress, check TTL, etc.).
		 *
		 * @param rawValue
		 */
		processValueFromStorage(rawValue) {
			if (!rawValue || typeof rawValue !== "object") {
				return { value: rawValue, metadata: {} };
			}
			// Check TTL expiration
			if (rawValue.metadata?.ttl && rawValue.metadata?.storedAt) {
				const now = Date.now();
				const expiration = rawValue.metadata.storedAt + rawValue.metadata.ttl;
				if (now > expiration) {
					return { value: undefined, metadata: { expired: true } };
				}
			}
			// Add decompression logic here if needed
			if (rawValue.metadata?.compressed) {
				// Decompression implementation would go here
			}
			return rawValue;
		}
		/**
		 * Update performance metrics.
		 *
		 * @param responseTime
		 * @param success
		 */
		updateMetrics(responseTime, success) {
			this.performanceMetrics.operationCount++;
			this.performanceMetrics.totalResponseTime += responseTime;
			if (!success) {
				this.performanceMetrics.errorCount++;
			}
		}
		/**
		 * Calculate operations per second.
		 */
		calculateOperationsPerSecond() {
			const uptimeSeconds =
				(Date.now() - this.performanceMetrics.startTime) / 1000;
			return uptimeSeconds > 0
				? this.performanceMetrics.operationCount / uptimeSeconds
				: 0;
		}
	};
	return (MemoryController = _classThis);
})();
export { MemoryController };
