/**
 * @fileoverview Utilities Module Exports
 *
 * Common utility functions organized by functional domain.
 */

export {
	concurrent,
	pTimeout,
	withRetry as retryAsync,
	withTimeout as timeoutPromise,
} from "./async";
export * from "./common/index.js";
// Export additional utilities with specific exports to avoid conflicts
export {
	customAlphabet,
	generateApiKey,
	generateCustomId,
	generateSessionId,
	generateShortId,
	generateTimestampId,
	generateUUID,
	nanoid,
} from "./ids";
export {
	checkSystemRequirements,
	createSystemSummary,
	getArchitecture,
	getEnvironment,
	getPlatform,
	getProcessInfo,
	getSystemInfo,
	getWorkspaceDetector,
	isCI,
	isDevelopment,
	isDocker,
	isLinux,
	isMacOS,
	isProduction,
	isTest,
	isWindows,
	isWSL,
	startMonitoring,
} from "./system";

export {
	dateFromTimestamp,
	formatTimestamp,
	isoStringFromTimestamp,
	now,
	parseISO,
	timestampFromDate,
} from "./time";
// Export specific functions to avoid conflicts
// Temporary direct export to bypass module resolution issues
import { z } from "zod";
export const EmailSchema = z.string().email();

// Temporarily comment out validation exports to fix circular import issue
// export {
// 	createValidator,
// 	// EmailSchema, // Exported directly above
// 	getValidationErrors,
// 	hasValidationError,
// 	isEmail,
// 	isISODateString,
// 	isNonEmptyArray,
// 	isPrimitive,
// 	isTimestamp,
// 	isURL,
// 	isUUID,
// 	isValidJSON,
// 	NonEmptyStringSchema,
// 	PositiveNumberSchema,
// 	URLSchema,
// 	UUIDSchema,
// 	validateInput,
// 	z,
// } from "./validation";

// Direct exports to bypass import issues
export { z } from "zod";
export const NonEmptyStringSchema = z.string().min(1);
export const PositiveNumberSchema = z.number().positive();
export const URLSchema = z.string().url();
export const UUIDSchema = z.string().uuid();

// Simple validation functions without complex dependencies
export function isEmail(value: unknown): boolean {
	return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isURL(value: unknown): boolean {
	if (typeof value !== "string") return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}
