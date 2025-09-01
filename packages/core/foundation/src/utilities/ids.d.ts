/**
 * @fileoverview ID Generation Utilities
 *
 * Consolidated ID generation utilities - UUIDs, nanoids, and custom IDs.
 * All ID generation functions unified in one location.
 *
 * @example UUID Generation
 * '''typescript'
 * import { generateUUID, isUUID} from '@claude-zen/foundation/utilities/ids';
 *
 * const id = generateUUID();
 * logger.info(isUUID(id)); // true
 * '
 *
 * @example Short ID Generation
 * '''typescript'
 * import { generateShortId, generateCustomId} from '@claude-zen/foundation/utilities/ids';
 *
 * const shortId = generateShortId(); // nanoid
 * const customId = generateCustomId(16); // hex-based
 * '
 */
import { customAlphabet, nanoid } from 'nanoid';
import type { UUID } from '../types/primitives';
/**
 * Generate a cryptographically secure UUID v4.
 * Uses Node.js crypto.randomUUID() for maximum security.
 *
 * @returns UUID v4 string
 * @example
 * '''typescript'
 * const id = generateUUID(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * '
 */
export declare function generateUUID(): UUID;
/**
 * Validate if a string is a proper UUID format.
 * Supports UUID v1, v3, v4, and v5.
 *
 * @param value - String to validate
 * @returns True if valid UUID format
 * @example
 * '''typescript'
 * logger.info(isUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")); // true
 * logger.info(isUUID("not-a-uuid")); // false
 * '
 */
export declare function isUUID(value: unknown): value is UUID;
/**
 * Generate a URL-safe short ID using nanoid.
 * Default 21 characters, cryptographically secure.
 *
 * @param size - Optional size (default:21)
 * @returns URL-safe short ID
 * @example
 * '''typescript'
 * const id = generateShortId(); // "V1StGXR8_Z5jdHi6B-myT"
 * const shortId = generateShortId(10); // "V1StGXR8_Z"
 * '
 */
export declare function generateShortId(size?: number): string;
/**
 * Create a custom nanoid generator with specific alphabet.
 * Useful for creating IDs with specific character sets.
 *
 * @param alphabet - Characters to use for ID generation
 * @param size - Default size for generated IDs
 * @returns Custom ID generator function
 * @example
 * '''typescript'
 * const generateNumericId = createCustomGenerator('0123456789', 8);
 * const id = generateNumericId(); // "84751249"
 * '
 */
export declare function createCustomGenerator(alphabet: string, size?: number): (size?: number) => string;
/**
 * Generate a custom hex-based ID.
 * Uses crypto.randomBytes for security.
 *
 * @param bytes - Number of random bytes (default:16)
 * @returns Hex string ID
 * @example
 * '''typescript'
 * const id = generateCustomId(); // "a1b2c3d4e5f6789012345678"
 * const shortId = generateCustomId(8); // "a1b2c3d4e5f6"
 * '
 */
export declare function generateCustomId(bytes?: number): string;
/**
 * Generate a timestamped ID with optional prefix.
 * Combines timestamp with random bytes for uniqueness.
 *
 * @param prefix - Optional prefix string
 * @param randomBytes - Number of random bytes to append (default:4)
 * @returns Timestamped ID
 * @example
 * '''typescript'
 * const id = generateTimestampId(); // "1640995200000-a1b2c3d4"
 * const prefixedId = generateTimestampId("user"); // "user-1640995200000-a1b2c3d4"
 * '
 */
export declare function generateTimestampId(prefix?: string, randomBytesCount?: number): string;
/**
 * Generate a session ID suitable for web sessions.
 * 32 bytes of randomness, hex-encoded (64 characters).
 *
 * @returns Secure session ID
 * @example
 * '''typescript'
 * const sessionId = generateSessionId();
 * // "a1b2c3d4e5f67890123456789abcdef01234567890abcdef1234567890abcdef"
 * '
 */
export declare function generateSessionId(): string;
/**
 * Generate an API key with specified format.
 * Combines prefix with secure random data.
 *
 * @param prefix - API key prefix (e.g., "sk", "pk")
 * @param bytes - Random bytes for key data (default:24)
 * @returns Formatted API key
 * @example
 * '''typescript'
 * const apiKey = generateApiKey("sk"); // "sk_1a2b3c4d5e6f..."
 * const publicKey = generateApiKey("pk", 16); // "pk_1a2b3c4d..."
 * '
 */
export declare function generateApiKey(prefix?: string, bytes?: number): string;
export { nanoid, customAlphabet };
export { generateUUID as generateSecureId };
export { generateCustomId as generateId };
//# sourceMappingURL=ids.d.ts.map