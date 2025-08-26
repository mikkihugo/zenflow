/**
 * @fileoverview Typed Event Base Class - Foundation Layer
 *
 * Provides a standardized typed event system base class that all packages
 * should extend instead of using generic EventEmitter. This ensures type safety,
 * validation, and consistent event handling across the entire monorepo.
 *
 * @example Basic Usage
 * ```typescript
 * import { TypedEventBase } from '@claude-zen/foundation';
 *
 * interface MyEvents {
 *   'user-created': { userId: string; email: string; timestamp: Date };
 *   'user-updated': { userId: string; changes: Record<string, unknown>; timestamp: Date };
 *   'error': { error: Error; context: string; timestamp: Date };
 * }
 *
 * class UserService extends TypedEventBase<MyEvents> {
 *   createUser(email: string) {
 *     const userId = generateId();
 *     // Type-safe event emission
 *     this.emit('user-created', { userId, email, timestamp: new Date() });
 *     return userId;
 *   }
 * }
 * ```
 *
 * @example Event Listening
 * ```typescript
 * const userService = new UserService();
 *
 * // Type-safe event listening
 * userService.on('user-created', (data) => {
 *   // data is typed as { userId: string; email: string; timestamp: Date }
 *   console.log(`User ${data.userId} created at ${data.timestamp}`);
 * });
 * ```
 */

import { getLogger } from "../core/logging/index.js";
import type { UnknownRecord } from "../types/primitives";

const logger = getLogger("typed-event-base");

/**
 * Generic event listener function type that overrides Node.js EventListener.
 * Provides type safety for event data.
 */
type EventListener<T = unknown> = (data: T) => void;

/**
 * Configuration options for event validation and monitoring.
 * Controls behavior of the typed event system including validation and metrics.
 *
 * @interface EventConfig
 * @example
 * ```typescript
 * const config: EventConfig = {
 *   enableValidation: true,
 *   enableMetrics: true,
 *   enableHistory: false,
 *   maxListeners: 10,
 *   maxHistorySize: 1000
 * };
 * ```
 */
export interface EventConfig {
	enableValidation?: boolean;
	enableMetrics?: boolean;
	enableHistory?: boolean;
	maxListeners?: number;
	maxHistorySize?: number;
}

/**
 * Metadata attached to every event for tracking and debugging.
 * Provides contextual information for event tracing and correlation.
 *
 * @interface EventMetadata
 * @example
 * ```typescript
 * const metadata: EventMetadata = {
 *   timestamp: new Date(),
 *   source: 'UserService',
 *   correlationId: 'req-123',
 *   version: '1.0.0'
 * };
 * ```
 */
export interface EventMetadata {
	timestamp: Date;
	source?: string;
	correlationId?: string;
	version?: string;
}

/**
 * Internal event wrapper containing data, metadata, and listener information.
 * Used internally by the event system for tracking and processing.
 *
 * @interface InternalEvent
 * @template T - Type of the event data
 * @private
 */
interface InternalEvent<T = UnknownRecord> {
	eventName: string;
	data: T;
	metadata: EventMetadata;
	listeners: number;
}

/**
 * Comprehensive metrics for event system monitoring.
 * Provides insights into event frequency, performance, and health.
 *
 * @interface EventMetrics
 * @example
 * ```typescript
 * const metrics: EventMetrics = {
 *   totalEvents: 1500,
 *   eventsByType: { 'user-login': 800, 'user-logout': 700 },
 *   averageListeners: 2.5,
 *   lastEvent: new Date(),
 *   errorRate: 0.02
 * };
 * ```
 */
export interface EventMetrics {
	totalEvents: number;
	eventsByType: Record<string, number>;
	averageListeners: number;
	lastEvent?: Date;
	errorRate: number;
}

/**
 * Type-safe EventEmitter replacement with comprehensive monitoring.
 *
 * Direct drop-in replacement for Node.js EventEmitter featuring:
 * - Full TypeScript type safety for events and listeners
 * - Built-in validation and error handling
 * - Comprehensive event metrics and monitoring
 * - Event history tracking and correlation
 * - Performance monitoring and debugging support
 *
 * @class TypedEventBase
 * @template TEvents - Interface defining the event types and their data
 *
 * @example Basic Usage
 * ```typescript
 * interface Events {
 *   userLogin: { userId: string; timestamp: number };
 *   userLogout: { userId: string; reason: string };
 * }
 *
 * class UserService extends TypedEventBase<Events> {
 *   login(userId: string) {
 *     this.emit('userLogin', { userId, timestamp: Date.now() });
 *   }
 * }
 *
 * const service = new UserService();
 * service.on('userLogin', (data) => {
 *   console.log(`User ${data.userId} logged in`);
 * });
 * ```
 *
 * @example Advanced Configuration
 * ```typescript
 * const emitter = new TypedEventBase<Events>({
 *   enableValidation: true,
 *   enableMetrics: true,
 *   enableHistory: false,
 *   maxListeners: 20
 * });
 * ```
 * emitter.on('userLogin', (data) => {
 *   // data is fully typed as { userId: string; timestamp: number }
 *   console.log(`User ${data.userId} logged in`);
 * });
 * ```
 */
export class EventEmitter<
	TEvents extends Record<string, unknown> = Record<string, unknown>,
> {
	private eventListeners = new Map<string, Set<(data: unknown) => void>>();
	private onceListeners = new Map<string, Set<(data: unknown) => void>>();
	private eventHistory: InternalEvent[] = [];
	private config: Required<EventConfig>;
	private metrics: EventMetrics = {
		totalEvents: 0,
		eventsByType: {},
		averageListeners: 0,
		lastEvent: undefined,
		errorRate: 0,
	};

	constructor(config: EventConfig = {}) {
		this.config = {
			enableValidation: config.enableValidation ?? true,
			enableMetrics: config.enableMetrics ?? true,
			enableHistory: config.enableHistory ?? false,
			maxListeners: config.maxListeners ?? 100,
			maxHistorySize: config.maxHistorySize ?? 1000,
		};
	}

	/**
	 * Emit a typed event
	 */
	public emit<K extends keyof TEvents>(
		eventName: K,
		data: TEvents[K],
	): boolean {
		try {
			if (this.config.enableValidation) {
				this.validateEvent(eventName, data);
			}

			const key = String(eventName);
			const listeners = this.getEventListeners(key);

			if (!this.hasListeners(listeners)) {
				return false;
			}

			const metadata = this.createEventMetadata();
			const totalListenerCount = this.getTotalListenerCount(listeners);

			this.recordEventIfEnabled(key, data, metadata, totalListenerCount);
			this.callEventListeners(listeners, data, eventName);
			this.cleanupOnceListeners(key);

			return totalListenerCount > 0;
		} catch (error) {
			logger.error(`Error emitting event ${String(eventName)}:`, error);
			return false;
		}
	}

	private getEventListeners(key: string) {
		return {
			regular: this.eventListeners.get(key),
			once: this.onceListeners.get(key),
		};
	}

	private hasListeners(listeners: {
		regular?: Set<EventListener<unknown>>;
		once?: Set<EventListener<unknown>>;
	}) {
		return (
			(listeners.regular?.size || 0) > 0 || (listeners.once?.size || 0) > 0
		);
	}

	private createEventMetadata(): EventMetadata {
		return {
			timestamp: new Date(),
			source: this.constructor.name,
			correlationId: this.generateCorrelationId(),
		};
	}

	private getTotalListenerCount(listeners: {
		regular?: Set<EventListener<unknown>>;
		once?: Set<EventListener<unknown>>;
	}) {
		return (listeners.regular?.size || 0) + (listeners.once?.size || 0);
	}

	private recordEventIfEnabled<K extends keyof TEvents>(
		key: string,
		data: TEvents[K],
		metadata: EventMetadata,
		totalListenerCount: number,
	) {
		if (this.config.enableHistory) {
			this.addToHistory(
				key,
				data as UnknownRecord,
				metadata,
				totalListenerCount,
			);
		}

		if (this.config.enableMetrics) {
			this.updateMetrics(key, totalListenerCount);
		}
	}

	private callEventListeners<K extends keyof TEvents>(
		listeners: {
			regular?: Set<EventListener<unknown>>;
			once?: Set<EventListener<unknown>>;
		},
		data: TEvents[K],
		eventName: K,
	) {
		this.callRegularListeners(listeners.regular, data, eventName);
		this.callOnceListeners(listeners.once, data, eventName);
	}

	private callRegularListeners<K extends keyof TEvents>(
		eventListeners: Set<EventListener<unknown>> | undefined,
		data: TEvents[K],
		eventName: K,
	) {
		if (!eventListeners) return;

		for (const listener of eventListeners) {
			this.safeCallListener(listener, data, eventName);
		}
	}

	private callOnceListeners<K extends keyof TEvents>(
		onceEventListeners: Set<EventListener<unknown>> | undefined,
		data: TEvents[K],
		eventName: K,
	) {
		if (!onceEventListeners) return;

		for (const listener of onceEventListeners) {
			this.safeCallListener(listener, data, eventName);
		}
	}

	private safeCallListener<K extends keyof TEvents>(
		listener: EventListener<unknown>,
		data: TEvents[K],
		eventName: K,
	) {
		try {
			listener(data);
		} catch (error) {
			logger.error(`Error in event listener for ${String(eventName)}:`, error);
			if (this.config.enableMetrics) {
				this.metrics.errorRate++;
			}
		}
	}

	private cleanupOnceListeners(key: string) {
		this.onceListeners.delete(key);
	}

	/**
	 * Add a typed event listener
	 */
	public on<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		const key = String(eventName);
		if (!this.eventListeners.has(key)) {
			this.eventListeners.set(key, new Set());
		}

		const eventListeners = this.eventListeners.get(key);
		if (!eventListeners) {
			throw new Error(`Event listeners not found for: ${key}`);
		}

		// Check max listeners limit
		if (eventListeners.size >= this.config.maxListeners) {
			logger.warn(
				`Max listeners (${this.config.maxListeners}) reached for event ${String(eventName)}`,
			);
			return this;
		}

		eventListeners.add(listener as (data: unknown) => void);
		return this;
	}

	/**
	 * Add a one-time typed event listener
	 */
	public once<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		const key = String(eventName);
		if (!this.onceListeners.has(key)) {
			this.onceListeners.set(key, new Set());
		}

		const onceEventListeners = this.onceListeners.get(key);
		if (!onceEventListeners) {
			throw new Error(`Once event listeners not found for: ${key}`);
		}

		// Check max listeners limit
		if (onceEventListeners.size >= this.config.maxListeners) {
			logger.warn(
				`Max once listeners (${this.config.maxListeners}) reached for event ${String(eventName)}`,
			);
			return this;
		}

		onceEventListeners.add(listener as (data: unknown) => void);
		return this;
	}

	/**
	 * Remove a typed event listener
	 */
	public off<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		const key = String(eventName);
		const eventListeners = this.eventListeners.get(key);
		if (eventListeners) {
			eventListeners.delete(listener as (data: unknown) => void);
			if (eventListeners.size === 0) {
				this.eventListeners.delete(key);
			}
		}

		const onceEventListeners = this.onceListeners.get(key);
		if (onceEventListeners) {
			onceEventListeners.delete(listener as (data: unknown) => void);
			if (onceEventListeners.size === 0) {
				this.onceListeners.delete(key);
			}
		}

		return this;
	}

	/**
	 * Remove all listeners for an event or all events
	 */
	public removeAllListeners<K extends keyof TEvents>(eventName?: K): this {
		if (eventName) {
			const key = String(eventName);
			this.eventListeners.delete(key);
			this.onceListeners.delete(key);
		} else {
			this.eventListeners.clear();
			this.onceListeners.clear();
		}
		return this;
	}

	/**
	 * Get listener count for an event
	 */
	public listenerCount<K extends keyof TEvents>(eventName: K): number {
		const key = String(eventName);
		const regularCount = this.eventListeners.get(key)?.size || 0;
		const onceCount = this.onceListeners.get(key)?.size || 0;
		return regularCount + onceCount;
	}

	/**
	 * Get all event names that have listeners
	 */
	public eventNames(): string[] {
		const regularEvents = Array.from(this.eventListeners.keys());
		const onceEvents = Array.from(this.onceListeners.keys());
		return [...new Set([...regularEvents, ...onceEvents])];
	}

	// =============================================================================
	// FORCING PATTERN - No Node.js EventEmitter compatibility, use type-safe version
	// =============================================================================

	/**
	 * EventEmitter-compatible addListener alias
	 */
	public addListener<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		return this.on(eventName, listener);
	}

	/**
	 * EventEmitter-compatible removeListener alias
	 */
	public removeListener<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		return this.off(eventName, listener);
	}

	/**
	 * EventEmitter-compatible setMaxListeners
	 */
	public setMaxListeners(n: number): this {
		this.config.maxListeners = n;
		return this;
	}

	/**
	 * EventEmitter-compatible getMaxListeners
	 */
	public getMaxListeners(): number {
		return this.config.maxListeners;
	}

	/**
	 * EventEmitter-compatible listeners method
	 */
	public listeners<K extends keyof TEvents>(
		eventName: K,
	): Array<(data: TEvents[K]) => void> {
		const key = String(eventName);
		const regularListeners = Array.from(this.eventListeners.get(key) || []);
		const onceListeners = Array.from(this.onceListeners.get(key) || []);
		return [...regularListeners, ...onceListeners];
	}

	/**
	 * EventEmitter-compatible rawListeners method
	 */
	public rawListeners<K extends keyof TEvents>(
		eventName: K,
	): Array<(data: TEvents[K]) => void> {
		return this.listeners(eventName);
	}

	/**
	 * EventEmitter-compatible prependListener method
	 */
	public prependListener<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		// Implement proper prepending by adding to the beginning of the listener set
		const eventKey = eventName as string;
		const listeners = this.eventListeners.get(eventKey) || new Set();

		// Convert to array, prepend, and convert back to Set to maintain order
		const listenersArray = Array.from(listeners);
		listenersArray.unshift(listener as (data: unknown) => void);

		this.eventListeners.set(eventKey, new Set(listenersArray));
		return this;
	}

	/**
	 * EventEmitter-compatible prependOnceListener method
	 */
	public prependOnceListener<K extends keyof TEvents>(
		eventName: K,
		listener: (data: TEvents[K]) => void,
	): this {
		// Implement proper prepending for once listeners
		const eventKey = eventName as string;
		const onceListeners = this.onceListeners.get(eventKey) || new Set();

		// Convert to array, prepend, and convert back to Set to maintain order
		const listenersArray = Array.from(onceListeners);
		listenersArray.unshift(listener as (data: unknown) => void);

		this.onceListeners.set(eventKey, new Set(listenersArray));
		return this;
	}

	/**
	 * Get event metrics (if enabled)
	 */
	public getMetrics(): EventMetrics | null {
		return this.config.enableMetrics ? { ...this.metrics } : null;
	}

	/**
	 * Get event history (if enabled)
	 */
	public getEventHistory(): InternalEvent[] | null {
		return this.config.enableHistory ? [...this.eventHistory] : null;
	}

	/**
	 * Clear event history
	 */
	public clearEventHistory(): void {
		this.eventHistory = [];
	}

	/**
	 * Validate event data (override in subclasses for custom validation)
	 */
	protected validateEvent<K extends keyof TEvents>(
		eventName: K,
		data: TEvents[K],
	): void {
		if (data === null || data === undefined) {
			throw new Error(
				`Event data cannot be null or undefined for event: ${String(eventName)}`,
			);
		}

		// Basic type validation - ensure data is an object
		if (typeof data !== "object") {
			throw new Error(
				`Event data must be an object for event: ${String(eventName)}`,
			);
		}
	}

	/**
	 * Generate correlation ID for event tracking
	 */
	private generateCorrelationId(): string {
		return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Add event to history
	 */
	private addToHistory(
		eventName: string,
		data: UnknownRecord,
		metadata: EventMetadata,
		listenerCount: number,
	): void {
		this.eventHistory.push({
			eventName,
			data,
			metadata,
			listeners: listenerCount,
		});

		// Trim history if too large
		if (this.eventHistory.length > this.config.maxHistorySize) {
			this.eventHistory = this.eventHistory.slice(-this.config.maxHistorySize);
		}
	}

	/**
	 * Update event metrics
	 */
	private updateMetrics(eventName: string, listenerCount: number): void {
		this.metrics.totalEvents++;
		this.metrics.eventsByType[eventName] =
			(this.metrics.eventsByType[eventName] || 0) + 1;
		this.metrics.lastEvent = new Date();

		// Update average listeners using actual listener count
		const eventCounts = Object.values(this.metrics.eventsByType);
		const totalEventCount = eventCounts.reduce((sum, count) => sum + count, 0);
		const eventTypeCount = Object.keys(this.metrics.eventsByType).length;

		// Calculate average listeners per event type, weighted by listener activity
		this.metrics.averageListeners =
			eventTypeCount > 0
				? (this.metrics.averageListeners * (totalEventCount - 1) +
						listenerCount) /
					totalEventCount
				: listenerCount;
	}
}

// Export a default EventEmitter instance for convenience
export const eventEmitter = new EventEmitter();

/**
 * Create a typed EventEmitter instance.
 *
 * Factory function for creating type-safe EventEmitter instances
 * with specific event type constraints.
 *
 * @param config - Configuration options for the EventEmitter
 * @returns New EventEmitter instance with type safety
 */
export function createTypedEventBase<
	TEvents extends Record<string, UnknownRecord>,
>(config?: EventConfig): EventEmitter<TEvents> {
	return new (class extends EventEmitter<TEvents> {})(config);
}

// =============================================================================
// EVENTEMITTER FORCING STRATEGY - No Node.js EventEmitter allowed!
// =============================================================================

// Use EventEmitter directly - no backwards compatibility aliases needed

// Default export
export default EventEmitter;

/**
 * Common event patterns that packages can extend
 */
export interface CommonEvents {
	error: { error: Error; context: string; timestamp: Date };
	warning: { message: string; context: string; timestamp: Date };
	info: { message: string; context: string; timestamp: Date };
	debug: { message: string; data?: UnknownRecord; timestamp: Date };
}

/**
 * Service event patterns
 */
export interface ServiceEvents extends CommonEvents {
	"service-started": { serviceName: string; timestamp: Date };
	"service-stopped": { serviceName: string; timestamp: Date };
	"service-error": { serviceName: string; error: Error; timestamp: Date };
	"health-check": { serviceName: string; healthy: boolean; timestamp: Date };
	[key: string]: unknown;
}

/**
 * Registry event patterns
 */
export interface RegistryEvents extends CommonEvents {
	"item-registered": { id: string; type: string; timestamp: Date };
	"item-unregistered": { id: string; type: string; timestamp: Date };
	"registry-cleared": { itemCount: number; timestamp: Date };
}

/**
 * Coordination event patterns
 */
export interface CoordinationEvents extends CommonEvents {
	"task-started": { taskId: string; type: string; timestamp: Date };
	"task-completed": { taskId: string; result: UnknownRecord; timestamp: Date };
	"task-failed": { taskId: string; error: Error; timestamp: Date };
	"coordination-update": {
		status: string;
		details: UnknownRecord;
		timestamp: Date;
	};
}
