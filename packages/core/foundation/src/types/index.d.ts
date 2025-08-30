/**
 * @fileoverview Foundation Types
 * Simple exports for all foundation types.
 */
export * from './errors';
export * from './patterns';
export * from './primitives';
export interface Timestamped {
    createdAt: number;
    updatedAt: number;
}
export interface Identifiable<T = string> {
    id: T;
}
export interface Entity extends Timestamped, Identifiable<string> {
    name: string;
    version: number;
    isActive: boolean;
}
export interface Paginated<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface SuccessResult<T> {
    success: true;
    data: T;
}
export interface ErrorResult<E> {
    success: false;
    error: E;
}
export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;
export type AsyncOperationResult<T, E = Error> = Promise<Result<T, E>>;
export interface QueryCriteria {
    filters?: Record<string, unknown>;
    sort?: {
        field: string;
        direction: 'asc|desc';
    }[];
    pagination?: PaginationOptions;
}
export interface AuditEntry extends Timestamped {
    id: string;
    entityId: string;
    entityType: string;
    action: string;
    changes: Record<string, unknown>;
    userId?: string;
    metadata?: Record<string, unknown>;
}
export type NonEmptyArray<T> = [T, ...T[]];
export type LogLevel = 'debug|info|warn|error|fatal';
/**
 * Advanced TypeScript utility types from type-fest library.
 * These utilities provide sophisticated type manipulation capabilities
 * that enhance the foundation type system for complex transformations.
 *
 * @example String Manipulation
 * ```typescript`
 * // Create union types with autocomplete support
 * type ModelName = LiteralUnion<'claude-3|gpt-4', string>;
 * const model:ModelName = 'claude-3'; // ✅ Autocomplete
 * const customModel:ModelName = 'custom-model'; // ✅ Also valid
 *
 * // Case conversions
 * type ApiKey = CamelCase<'api_key'>; // ' apiKey') * type UrlPath = KebabCase<'getUserProfile'>; // ' get-user-profile') * ```
 *
 * @example Object Manipulation
 * ```typescript`
 * interface User {
 *   id:string;
 *   name:string;
 *   email:string;
 *   metadata?:Record<string, unknown>;
 *}
 *
 * // Make specific properties optional
 * type UserInput = SetOptional<User, 'id|metadata'>;
 *
 * // Merge interfaces intelligently
 * type ExtendedUser = Merge<User, { lastLogin:Date; permissions: string[]}>;
 *
 * // Deep partial for nested objects
 * type UserUpdate = PartialDeep<User>;
 * ```
 *
 * @example Configuration Types
 * ```typescript`
 * // Type-safe package.json handling
 * import type { PackageJson} from '@claude-zen/foundation';
 *
 * function validatePackage(pkg:PackageJson): boolean {
 *   return typeof pkg.name === 'string' && typeof pkg.version === ' string';
 *}
 *
 * // Type-safe tsconfig.json
 * import type { TsConfigJson} from '@claude-zen/foundation';
 *
 * const config:TsConfigJson = {
 *   compilerOptions:{
 *     target: 'ES2022', *     module:'ESNext') *}
 *};
 * ```
 */
export type { AbstractConstructor, Asyncify, AsyncReturnType, CamelCase, ConditionalExcept, ConditionalKeys, ConditionalPick, DelimiterCase, EmptyObject, Entries, Except, Get, Includes, IsAny, IsEmptyObject, IsEqual, IsNever, IsUnknown, Join, KebabCase, LastArrayElement, LiteralUnion, Merge, MergeDeep, MergeExclusive, OmitDeep, Opaque, PackageJson, PartialDeep, PascalCase, Paths, PickDeep, Promisable, ReadonlyDeep, ReadonlyTuple, Replace, RequiredDeep, SetNonNullable, SetOptional, SetReadonly, SetRequired, Simplify, SnakeCase, Split, Trim, TsConfigJson, UnionToIntersection, UnionToTuple, Writable, } from 'type-fest';
/**
 * Additional TypeScript utility types.
 * These utilities extend type-fest with common patterns used in claude-code-zen.
 * All utilities now sourced from type-fest for consistency.
 *
 * @example Deep Type Operations (type-fest equivalents)
 * ```typescript`
 * interface Config {
 *   database:{ host: string; port: number;};
 *   api:{ baseUrl: string; timeout: number;};
 *}
 *
 * // type-fest provides these
 * type ConfigUpdate = PartialDeep<Config>; // Instead of DeepPartial
 * type ValidatedConfig = RequiredDeep<Config>; // Instead of DeepRequired
 * type ImmutableConfig = ReadonlyDeep<Config>; // Instead of DeepReadonly
 * ```
 */
export type DeepPartial<T> = import('type-fest').PartialDeep<T>;
export type DeepRequired<T> = import('type-fest').RequiredDeep<T>;
export type DeepReadonly<T> = import('type-fest').ReadonlyDeep<T>;
export type MarkOptional<T, K extends keyof T> = import('type-fest').SetOptional<T, K>;
export type MarkRequired<T, K extends keyof T> = import('type-fest').SetRequired<T, K>;
export type MarkReadonly<T, K extends keyof T> = import('type-fest').SetReadonly<T, K>;
export type StrictOmit<T, K extends keyof T> = import('type-fest').Except<T, K>;
export type NonNever<T> = T extends never ? never : T;
export type Primitive = string | number | boolean | symbol | null | undefined;
export type AsyncOrSync<T> = T | Promise<T>;
export type AsyncOrSyncType<T> = T extends Promise<infer U> ? U : T;
export type ValueOf<T> = T[keyof T];
export type Dictionary<T = unknown> = Record<string, T>;
export type SafeDictionary<T> = Record<string, T>;
export type Head<T extends readonly unknown[]> = T extends readonly [
    infer H,
    ...unknown[]
] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [
    unknown,
    ...infer Rest
] ? Rest : [];
export type ReadonlyKeys<T> = {
    [K in keyof T]: T[K] extends Readonly<T[K]> ? K : never;
}[keyof T];
export type WritableKeys<T> = {
    [K in keyof T]: T[K] extends Readonly<T[K]> ? never : K;
}[keyof T];
export type RequiredKeys<T> = {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
}[keyof T];
export type OptionalKeys<T> = {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T];
export type AnyFunction = (...args: unknown[]) => unknown;
export * from './errors';
export * from './patterns';
export * from './type-guards';
export { createError, createNetworkError, createResourceError, createSuccess, createSystemError, createValidationError, isBaseError, isError, isNetworkError, isResourceError, isRetryableError, isSuccess, isSystemError, isValidationError, } from './errors';
export { createErrorResult, createPaginated, createPaginationMetadata, createSuccessResult, isErrorResult, isSuccessResult, } from './patterns';
export { dateFromTimestamp, Environment as EnvironmentEnum, generateUUID, isEmail, isISODateString, isNonEmptyArray, isoStringFromTimestamp, isPrimitive, isTimestamp, isUUID, LogLevel as LogLevelEnum, now, Priority as PriorityEnum, Status as StatusEnum, timestampFromDate, } from './primitives';
//# sourceMappingURL=index.d.ts.map