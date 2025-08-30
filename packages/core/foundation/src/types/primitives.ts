/**
 * @fileoverview Foundation Primitives
 * Basic types that everything else builds on.
 */

// Basic IDs
export type ID = string | number;
export type UUID = string & { __brand: 'UUID' };

// Time
export type Timestamp = number & { __brand: 'Timestamp' };
export type ISODateString = string & { __brand: 'ISODateString' };

// JSON types
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// Utility types
export type UnknownRecord = Record<string, unknown>;
export type Email = string & { __brand: 'Email' };

// Branded type helper
export type Branded<T, Brand> = T & { __brand: Brand };

// Enums
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

export enum Status {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked',
  REVIEW = 'review',
}

export enum LogLevel {
  EMERGENCY = 'emergency',
  ALERT = 'alert',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARN = 'warn',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Utility functions for branded types
export function brand<T, Brand>(value: T): Branded<T, Brand> {
  return value as Branded<T, Brand>;
}

export function unbrand<T, Brand>(value: Branded<T, Brand>): T {
  return value as T;
}

// Timestamp utilities
export function now(): Timestamp {
  return brand<number, 'Timestamp'>(Date.now());
}

export function timestampFromDate(date: Date): Timestamp {
  return brand<number, 'Timestamp'>(date.getTime());
}

export function dateFromTimestamp(timestamp: Timestamp): Date {
  return new Date(unbrand(timestamp));
}

export function isoStringFromTimestamp(timestamp: Timestamp): ISODateString {
  return brand<string, 'ISODateString'>(dateFromTimestamp(timestamp).toISOString());
}

// Type guards
export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && value > 0 && Number.isInteger(value);
}

export function isISODateString(value: unknown): value is ISODateString {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
}

export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isEmail(value: unknown): value is Email {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isPrimitive(value: unknown): value is JsonPrimitive {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

// UUID generation
export function generateUUID(): UUID {
  // Simple UUID v4 generation
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const uuid = template.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return brand<string, 'UUID'>(uuid);
}
