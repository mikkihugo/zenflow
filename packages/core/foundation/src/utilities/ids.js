/**
 * @fileoverview ID Generation Utilities
 *
 * Consolidated ID generation utilities - UUIDs, nanoids, and custom IDs.
 * All ID generation functions unified in one location.
 *
 * @example UUID Generation
 * ```typescript
 * import { generateUUID, isUUID } from '@claude-zen/foundation/utilities/ids';
 *
 * const id = generateUUID();
 * console.log(isUUID(id)); // true
 * ```
 *
 * @example Short ID Generation
 * ```typescript
 * import { generateShortId, generateCustomId } from '@claude-zen/foundation/utilities/ids';
 *
 * const shortId = generateShortId(); // nanoid
 * const customId = generateCustomId(16); // hex-based
 * ```
 */
import { randomBytes, randomUUID } from "node:crypto";
import { customAlphabet, nanoid } from "nanoid";
// =============================================================================
// UUID UTILITIES - Standard RFC 4122 UUIDs
// =============================================================================
/**
 * Generate a cryptographically secure UUID v4.
 * Uses Node.js crypto.randomUUID() for maximum security.
 *
 * @returns UUID v4 string
 * @example
 * ```typescript
 * const id = generateUUID(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * ```
 */
export function generateUUID() {
    return randomUUID();
}
/**
 * Validate if a string is a proper UUID format.
 * Supports UUID v1, v3, v4, and v5.
 *
 * @param value - String to validate
 * @returns True if valid UUID format
 * @example
 * ```typescript
 * console.log(isUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")); // true
 * console.log(isUUID("not-a-uuid")); // false
 * ```
 */
export function isUUID(value) {
    return (typeof value === "string" &&
        /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value));
}
// =============================================================================
// SHORT ID UTILITIES - nanoid for URL-safe short IDs
// =============================================================================
/**
 * Generate a URL-safe short ID using nanoid.
 * Default 21 characters, cryptographically secure.
 *
 * @param size - Optional size (default: 21)
 * @returns URL-safe short ID
 * @example
 * ```typescript
 * const id = generateShortId(); // "V1StGXR8_Z5jdHi6B-myT"
 * const shortId = generateShortId(10); // "V1StGXR8_Z"
 * ```
 */
export function generateShortId(size) {
    return nanoid(size);
}
/**
 * Create a custom nanoid generator with specific alphabet.
 * Useful for creating IDs with specific character sets.
 *
 * @param alphabet - Characters to use for ID generation
 * @param size - Default size for generated IDs
 * @returns Custom ID generator function
 * @example
 * ```typescript
 * const generateNumericId = createCustomGenerator('0123456789', 8);
 * const id = generateNumericId(); // "84751249"
 * ```
 */
export function createCustomGenerator(alphabet, size = 21) {
    return customAlphabet(alphabet, size);
}
// =============================================================================
// CUSTOM ID UTILITIES - Hex-based and specialized IDs
// =============================================================================
/**
 * Generate a custom hex-based ID.
 * Uses crypto.randomBytes for security.
 *
 * @param bytes - Number of random bytes (default: 16)
 * @returns Hex string ID
 * @example
 * ```typescript
 * const id = generateCustomId(); // "a1b2c3d4e5f6789012345678"
 * const shortId = generateCustomId(8); // "a1b2c3d4e5f6"
 * ```
 */
export function generateCustomId(bytes = 16) {
    return randomBytes(bytes).toString("hex");
}
/**
 * Generate a timestamped ID with optional prefix.
 * Combines timestamp with random bytes for uniqueness.
 *
 * @param prefix - Optional prefix string
 * @param randomBytes - Number of random bytes to append (default: 4)
 * @returns Timestamped ID
 * @example
 * ```typescript
 * const id = generateTimestampId(); // "1640995200000-a1b2c3d4"
 * const prefixedId = generateTimestampId("user"); // "user-1640995200000-a1b2c3d4"
 * ```
 */
export function generateTimestampId(prefix, randomBytesCount = 4) {
    const timestamp = Date.now();
    const random = randomBytes(randomBytesCount).toString("hex");
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}
// =============================================================================
// SPECIALIZED ID UTILITIES
// =============================================================================
/**
 * Generate a session ID suitable for web sessions.
 * 32 bytes of randomness, hex-encoded (64 characters).
 *
 * @returns Secure session ID
 * @example
 * ```typescript
 * const sessionId = generateSessionId();
 * // "a1b2c3d4e5f67890123456789abcdef01234567890abcdef1234567890abcdef"
 * ```
 */
export function generateSessionId() {
    return randomBytes(32).toString("hex");
}
/**
 * Generate an API key with specified format.
 * Combines prefix with secure random data.
 *
 * @param prefix - API key prefix (e.g., "sk", "pk")
 * @param bytes - Random bytes for key data (default: 24)
 * @returns Formatted API key
 * @example
 * ```typescript
 * const apiKey = generateApiKey("sk"); // "sk_1a2b3c4d5e6f..."
 * const publicKey = generateApiKey("pk", 16); // "pk_1a2b3c4d..."
 * ```
 */
export function generateApiKey(prefix = "key", bytes = 24) {
    const keyData = randomBytes(bytes).toString("base64url");
    return `${prefix}_${keyData}`;
}
// =============================================================================
// RE-EXPORTS FOR COMPATIBILITY
// =============================================================================
// Re-export nanoid and customAlphabet for direct access
export { nanoid, customAlphabet };
// Alias for backward compatibility
export { generateUUID as generateSecureId };
export { generateCustomId as generateId }; // Replaces old helpers.ts version
