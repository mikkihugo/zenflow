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
/**
 * Create a standardized logger for SAFe Framework components
 * @param componentName - Name of the component requesting the logger
 * @returns SafeLogger instance
 */
export function getLogger(componentName) {
    return {
        info: (message, ...args) => {
            console.info(`[${componentName}] ${message}`, ...args);
            `
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[$componentName];
            $message `, ...args);`;
        },
        error: (message, error, ...args) => {
            if (error instanceof Error) {
                console.error(`[${componentName}] ${message}`, `
          error.message,
          error.stack,
          ...args
        );
      } else if (error) {
        console.error(`[$], { componentName }, $message `, error, ...args);`);
            }
            else {
                console.error(`[${componentName}] ${message}`, ...args);
                `
      }
    },
    debug: (message: string, ...args: any[]) => {
      console.debug(`[$componentName];
                $message `, ...args);`;
            }
        }
    };
    /**
     * Default logger configuration for SAFe Framework
     */
    export const defaultLoggerConfig = {
        level: 'info',
        format: 'json',
        timestamp: true,
        colorize: false,
        component: 'safe-framework',
    };
}
