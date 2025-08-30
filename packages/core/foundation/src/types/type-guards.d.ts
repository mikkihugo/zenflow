/**
 * @fileoverview Foundation Type Guards
 * Runtime type checking utilities for foundation types.
 */
import type { Email, JsonArray, JsonObject, JsonValue, Timestamp, UUID } from './primitives';
export declare function isUUID(value: unknown): value is UUID;
export declare function isTimestamp(value: unknown): value is Timestamp;
export declare function isEmail(value: unknown): value is Email;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isObject(value: unknown): value is Record<string, unknown>;
export declare function isArray(value: unknown): value is unknown[];
export declare function isJsonValue(value: unknown): value is JsonValue;
export declare function isJsonObject(value: unknown): value is JsonObject;
export declare function isJsonArray(value: unknown): value is JsonArray;
//# sourceMappingURL=type-guards.d.ts.map