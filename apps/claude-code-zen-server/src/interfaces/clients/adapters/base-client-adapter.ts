/**
 * @fileoverview Provides foundational interfaces and abstract classes for client adapters
 * within the Universal Abstraction and Client Layer (UACL).
 * Ensures consistent client management and interoperability across the system.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('interfaces-clients-adapters-base-client-adapter');

/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter.
 *
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */

/**
 * Represents the result of a client operation.
 *
 * @interface ClientResult
 * @template T The type of the data returned by the operation.
 * @property {string} operationId - Unique identifier for this operation.
 * @property {boolean} success - Operation success status.
 * @property {T} [data] - Result data (if successful).
 * @property {object} [error] - Error information (if failed).
 * @property {string} [error.code] - Error code.
 * @property {string} [error.message] - Error message.
 * @property {any} [error.details] - Optional additional error details.
 * @property {object} metadata - Operation metadata.
 * @property {number} metadata.duration - Duration of the operation in milliseconds.
 * @property {string} metadata.timestamp - Timestamp when operation started.
 * @property {boolean} [metadata.cached] - Whether result came from cache.
 * @property {any} [metadata.additional] - Additional operation-specific metadata.
 * @example
 */
