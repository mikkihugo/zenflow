/**
 * @fileoverview Logger utility for Neural and Queen components
 * Simple wrapper around the core logger for component-specific logging
 * @module Logger
 */

import { Logger as CoreLogger } from '../cli/core/logger.js';

export class Logger {
    constructor(component) {
        this.coreLogger = new CoreLogger(component);
    }

    info(message, meta) {
        this.coreLogger.info(message, meta);
    }

    warn(message, meta) {
        this.coreLogger.warn(message, meta);
    }

    error(message, error) {
        this.coreLogger.error(message, {}, error);
    }

    debug(message, meta) {
        this.coreLogger.debug(message, meta);
    }

    success(message, meta) {
        this.coreLogger.success(message, meta);
    }

    progress(message, meta) {
        this.coreLogger.progress(message, meta);
    }
}