/**
 * @fileoverview Shared utilities for Claude Zen + ruv-FANN integration
 * @module shared-utils
 */

import chalk from 'chalk';
import { nanoid } from 'nanoid';
import { LogLevel, LogEntry } from '@shared/types';

// ==================== LOGGING UTILITIES ====================

export class Logger {
  private module: string;
  private logLevel: LogLevel;

  constructor(module: string, logLevel: LogLevel = 'info') {
    this.module = module;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    const moduleTag = chalk.blue(`[${this.module}]`);
    const levelTag = this.getLevelTag(level);
    
    let formatted = `${timestamp} ${levelTag} ${moduleTag} ${message}`;
    
    if (metadata) {
      formatted += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return formatted;
  }

  private getLevelTag(level: LogLevel): string {
    switch (level) {
      case 'debug': return chalk.gray('DEBUG');
      case 'info': return chalk.green('INFO ');
      case 'warn': return chalk.yellow('WARN ');
      case 'error': return chalk.red('ERROR');
      default: return chalk.white('     ');
    }
  }

  debug(message: string, metadata?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, metadata));
    }
  }

  info(message: string, metadata?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, metadata));
    }
  }

  warn(message: string, metadata?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, metadata));
    }
  }

  error(message: string, metadata?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, metadata));
    }
  }

  createLogEntry(level: LogLevel, message: string, metadata?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      metadata
    };
  }
}

// ==================== ID GENERATION ====================

export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}-${id}` : id;
}

export function generateSwarmId(serviceName: string): string {
  return generateId(`swarm-${serviceName}`);
}

export function generateAgentId(agentType: string): string {
  return generateId(`agent-${agentType}`);
}

export function generateTaskId(): string {
  return generateId('task');
}

// ==================== PERFORMANCE UTILITIES ====================

export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;
  private markers: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  mark(label: string): void {
    this.markers.set(label, performance.now());
  }

  end(): number {
    this.endTime = performance.now();
    return this.getDuration();
  }

  getDuration(): number {
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  getMarkerDuration(label: string): number {
    const markerTime = this.markers.get(label);
    if (!markerTime) {
      throw new Error(`Marker '${label}' not found`);
    }
    return markerTime - this.startTime;
  }

  getAllMarkers(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [label, time] of this.markers) {
      result[label] = time - this.startTime;
    }
    return result;
  }
}

export function measureAsync<T>(
  fn: () => Promise<T>, 
  logger?: Logger
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const timer = new PerformanceTimer();
    
    try {
      const result = await fn();
      const duration = timer.end();
      
      if (logger) {
        logger.debug(`Operation completed in ${duration.toFixed(2)}ms`);
      }
      
      resolve({ result, duration });
    } catch (error) {
      const duration = timer.end();
      
      if (logger) {
        logger.error(`Operation failed after ${duration.toFixed(2)}ms`, { error });
      }
      
      reject(error);
    }
  });
}

// ==================== FORMAT UTILITIES ====================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

// ==================== VALIDATION UTILITIES ====================

export function validateServiceName(name: string): boolean {
  return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 2 && name.length <= 50;
}

export function validateSwarmConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.maxAgents && (config.maxAgents < 1 || config.maxAgents > 100)) {
    errors.push('maxAgents must be between 1 and 100');
  }
  
  if (config.topology && !['hierarchical', 'mesh', 'ring', 'star'].includes(config.topology)) {
    errors.push('topology must be one of: hierarchical, mesh, ring, star');
  }
  
  if (config.strategy && !['adaptive', 'parallel', 'sequential'].includes(config.strategy)) {
    errors.push('strategy must be one of: adaptive, parallel, sequential');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ==================== RETRY UTILITIES ====================

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'linear',
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      const waitTime = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt;
        
      await sleep(waitTime);
    }
  }

  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== CONCURRENCY UTILITIES ====================

export class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++;
        
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      if (this.running < this.limit) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.limit) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  getStats(): { running: number; queued: number; limit: number } {
    return {
      running: this.running,
      queued: this.queue.length,
      limit: this.limit
    };
  }
}

// ==================== MEMORY UTILITIES ====================

export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  const memUsage = process.memoryUsage();
  const used = memUsage.heapUsed;
  const total = memUsage.heapTotal;
  
  return {
    used,
    total,
    percentage: (used / total) * 100
  };
}

export function formatMemoryUsage(): string {
  const usage = getMemoryUsage();
  return `${formatBytes(usage.used)} / ${formatBytes(usage.total)} (${usage.percentage.toFixed(1)}%)`;
}

// ==================== CONFIGURATION UTILITIES ====================

export function mergeConfigs<T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base };
  
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key as keyof T] = mergeConfigs(
          result[key as keyof T] as any,
          value
        );
      } else {
        result[key as keyof T] = value;
      }
    }
  }
  
  return result;
}

// ==================== EXPORT ALL ====================

export const utils = {
  Logger,
  generateId,
  generateSwarmId,
  generateAgentId,
  generateTaskId,
  PerformanceTimer,
  measureAsync,
  formatBytes,
  formatDuration,
  formatPercentage,
  validateServiceName,
  validateSwarmConfig,
  retry,
  sleep,
  ConcurrencyLimiter,
  getMemoryUsage,
  formatMemoryUsage,
  mergeConfigs
};

export default utils;