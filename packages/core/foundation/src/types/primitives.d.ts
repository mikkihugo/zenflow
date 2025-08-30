/**
 * @fileoverview Foundation Primitives
 * Basic types that everything else builds on.
 */
export type ID = string | number;
export type UUID = string & {
    __brand: 'UUID';
};
export type Timestamp = number & {
    __brand: 'Timestamp';
};
export type ISODateString = string & {
    __brand: 'ISODateString';
};
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = {
    [key: string]: JsonValue;
};
export type JsonArray = JsonValue[];
export type UnknownRecord = Record<string, unknown>;
export type Email = string & {
    __brand: 'Email';
};
export declare enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum Status {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare enum Environment {
    DEVELOPMENT = "development",
    PRODUCTION = "production",
    TEST = "test"
}
export declare function isUUID(value: unknown): value is UUID;
export declare function isTimestamp(value: unknown): value is Timestamp;
export declare function isISODateString(value: unknown): value is ISODateString;
export declare function isEmail(value: unknown): value is Email;
export declare function isPrimitive(value: unknown): boolean;
export declare function isNonEmptyArray<T>(arr: T[]): boolean;
export declare function generateUUID(): UUID;
export declare function now(): Timestamp;
export declare function timestampFromDate(date: Date): Timestamp;
export declare function dateFromTimestamp(timestamp: Timestamp): Date;
export declare function isoStringFromTimestamp(timestamp: Timestamp): ISODateString;
//# sourceMappingURL=primitives.d.ts.map