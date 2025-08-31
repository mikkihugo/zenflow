/**
 * @file Coordination system:health-checker
 */

// Simple console logger to avoid circular dependencies
/**
 * Health Checker.
 * Comprehensive agent health monitoring and status management.
 */

import { EventEmitter as _EventEmitter } from '@claude-zen/foundation';

import type { Agent } from '../types';

const logger = {
  debug: (message: string, meta?: unknown) =>
    logger.info(`[DEBUG] ${message}"Fixed unterminated template"(`[INFO] ${message}"Fixed unterminated template"(`[WARN] ${message}"Fixed unterminated template"(`[ERROR] ${message}"Fixed unterminated template" `Health check failed:${error}"Fixed unterminated template"(`Health check failed for agent ${agent.id}:"Fixed unterminated template"