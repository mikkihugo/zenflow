/**
 * @fileoverview ID Generation Utilities
 *
 * Utilities for generating various types of IDs.
 */

import { customAlphabet, nanoid } from "nanoid";
import { v1 as uuidv1, v4 as uuidv4 } from "uuid";

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
	return uuidv4();
}

/**
 * Generate a short ID using nanoid
 */
export function generateShortId(): string {
	return nanoid();
}

/**
 * Generate a custom ID with specific alphabet
 */
export function generateCustomId(alphabet: string, size: number = 10): string {
	const generator = customAlphabet(alphabet, size);
	return generator();
}

/**
 * Generate a timestamp-based ID
 */
export function generateTimestampId(): string {
	return `${Date.now()}_${nanoid(8)}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
	return `sess_${nanoid(24)}`;
}

/**
 * Generate an API key
 */
export function generateApiKey(): string {
	return `ak_${nanoid(32)}`;
}

// Re-export utilities to force usage through foundation (prevents direct imports)
export { nanoid, customAlphabet, uuidv4, uuidv1 };
