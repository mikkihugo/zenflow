/**
 * Utility Types Stub
 * Compatibility stub for utility type tests
 */

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface Config {
  [key: string]: any;
}

export interface Metrics {
  timestamp: number;
  values: Record<string, number>;
}

export interface EventData {
  type: string;
  payload: any;
  timestamp: number;
}

export type AsyncResult<T> = Promise<Result<T>>;

export type Optional<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Disposable {
  dispose(): void | Promise<void>;
}