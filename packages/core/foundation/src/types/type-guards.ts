/**
 * @fileoverview Foundation Type Guards
 * Runtime type checking utilities for foundation types.
 */

import type {
	Email,
	JsonArray,
	JsonObject,
	JsonValue,
	Timestamp,
	UUID,
} from "./primitives";

export function isUUID(value:unknown): value is UUID {
	return (
		typeof value === "string" &&
		/^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
			value,
		)
	);
}

export function isTimestamp(value:unknown): value is Timestamp {
	return typeof value === "number" && value > 0;
}

export function isEmail(value:unknown): value is Email {
	return typeof value === "string" && value.includes("@");
}

export function isString(value:unknown): value is string {
	return typeof value === "string";
}

export function isNumber(value:unknown): value is number {
	return typeof value === "number";
}

export function isObject(value:unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isArray(value:unknown): value is unknown[] {
	return Array.isArray(value);
}

export function isJsonValue(value:unknown): value is JsonValue {
	if (value === null) return true;
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	)
		return true;
	if (Array.isArray(value)) return value.every(isJsonValue);
	if (isObject(value)) return Object.values(value).every(isJsonValue);
	return false;
}

export function isJsonObject(value:unknown): value is JsonObject {
	return isObject(value) && isJsonValue(value);
}

export function isJsonArray(value:unknown): value is JsonArray {
	return Array.isArray(value) && value.every(isJsonValue);
}
