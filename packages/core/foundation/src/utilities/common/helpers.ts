/**
 * Utility helper functions.
 */
/**
 * @file Helpers implementation.
 */

import { randomBytes} from "node:crypto";

/**
 * Generate a unique ID.
 *
 * @example
 */
export function generateId():string {
	return randomBytes(16).toString("hex");
}

/**
 * Sleep for specified milliseconds.
 *
 * @param ms
 * @example
 */
export function sleep(ms:number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff.
 *
 * @param fn
 * @param maxRetries
 * @param baseDelay
 * @example
 */
export async function retry<T>(
	fn:() => Promise<T>,
	maxRetries = 3,
	baseDelay = 1000,
):Promise<T> {
	let lastError:Error | undefined;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
} catch (error) {
			lastError = error as Error;
			if (i < maxRetries - 1) {
				await sleep(baseDelay * 2 ** i);
}
}
}

	throw lastError || new Error("All retry attempts failed");
}

/**
 * Deep clone an object.
 *
 * @param obj
 * @example
 */
export function deepClone<T>(obj:T): T {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty.
 *
 * @param value
 * @example
 */
export function isEmpty(value:unknown): boolean {
	if (value === null || value === undefined) {
		return true;
}
	if (typeof value === "string") {
		return value.length === 0;
}
	if (Array.isArray(value)) {
		return value.length === 0;
}
	if (typeof value === "object") {
		return Object.keys(value).length === 0;
}
	return false;
}
