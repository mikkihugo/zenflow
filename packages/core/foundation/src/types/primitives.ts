/**
 * @fileoverview Foundation Primitives
 * Basic types that everything else builds on.
 */

// Basic IDs
export type ID = string | number;
export type UUID = string & { __brand: "UUID" };

// Time
export type Timestamp = number & { __brand: "Timestamp" };
export type ISODateString = string & { __brand: "ISODateString" };

// JSON types
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// Utility types
export type UnknownRecord = Record<string, unknown>;
export type Email = string & { __brand: "Email" };

// Enums
export enum Priority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
}

export enum Status {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	FAILED = "failed",
}

export enum LogLevel {
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	DEBUG = "debug",
}

export enum Environment {
	DEVELOPMENT = "development",
	PRODUCTION = "production",
	TEST = "test",
}

// Type guards
export function isUUID(value: unknown): value is UUID {
	return (
		typeof value === "string" &&
		/^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
			value,
		)
	);
}

export function isTimestamp(value: unknown): value is Timestamp {
	return typeof value === "number" && value > 0;
}

export function isISODateString(value: unknown): value is ISODateString {
	return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function isEmail(value: unknown): value is Email {
	return typeof value === "string" && value.includes("@");
}

export function isPrimitive(value: unknown): boolean {
	return (
		value === null ||
		["string", "number", "boolean", "undefined"].includes(typeof value)
	);
}

export function isNonEmptyArray<T>(arr: T[]): boolean {
	return Array.isArray(arr) && arr.length > 0;
}

// Utility functions
export function generateUUID(): UUID {
	if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
		return globalThis.crypto.randomUUID() as UUID;
	}
	// Fallback UUID v4 generation for Node.js environments without crypto.randomUUID
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	}) as UUID;
}

export function now(): Timestamp {
	return Date.now() as Timestamp;
}

export function timestampFromDate(date: Date): Timestamp {
	return date.getTime() as Timestamp;
}

export function dateFromTimestamp(timestamp: Timestamp): Date {
	return new Date(timestamp);
}

export function isoStringFromTimestamp(timestamp: Timestamp): ISODateString {
	return new Date(timestamp).toISOString() as ISODateString;
}
