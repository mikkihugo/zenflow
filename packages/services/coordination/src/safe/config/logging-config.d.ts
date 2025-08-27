/**
 * @fileoverview Logging Configuration for SAFe Framework
 *
 * Provides standardized logging configuration for all SAFe Framework components.
 * Integrates with @claude-zen/foundation logging infrastructure.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
/**
 * Logger interface for SAFe Framework components
 */
export interface SafeLogger extends Logger {
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, error?: any, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
/**
 * Create a standardized logger for SAFe Framework components
 * @param componentName - Name of the component requesting the logger
 * @returns SafeLogger instance
 */
export declare function getLogger(componentName: string): SafeLogger;
//# sourceMappingURL=logging-config.d.ts.map