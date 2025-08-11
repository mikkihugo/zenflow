/**
 * Interface Manager - User Interface Management.
 *
 * Clean, focused interface manager that handles different user interfaces (CLI, TUI, Web)
 * without bloated "unified" architecture.
 *
 * @example
 * ```typescript
 * const interfaceManager = new InterfaceManager({
 *   defaultMode: 'auto',
 *   webPort: 3456,
 *   coreSystem: coreSystem
 * });
 *
 * await interfaceManager.initialize();
 * await interfaceManager.launch();
 * ```
 */
/**
 * @file Interface management system.
 */
import { EventEmitter } from 'node:events';
/**
 * Interface mode types.
 */
export type InterfaceMode = 'auto' | 'cli' | 'tui' | 'web';
/**
 * Interface manager configuration.
 *
 * @example
 */
export interface InterfaceManagerConfig {
    /** Default interface mode */
    defaultMode?: InterfaceMode;
    /** Web interface port */
    webPort?: number;
    /** TUI theme */
    theme?: 'dark' | 'light';
    /** Enable real-time updates */
    enableRealTime?: boolean;
    /** Reference to core system */
    coreSystem?: any;
}
/**
 * Interface statistics.
 *
 * @example
 */
export interface InterfaceStats {
    /** Current active mode */
    currentMode: InterfaceMode;
    /** Whether interface is active */
    isActive: boolean;
    /** Number of active connections (for web mode) */
    activeConnections: number;
}
/**
 * Clean interface manager for user interface handling.
 *
 * @example
 */
export declare class InterfaceManager extends EventEmitter {
    private config;
    private currentMode;
    private isActive;
    private initialized;
    constructor(userConfig?: InterfaceManagerConfig);
    initialize(): Promise<void>;
    launch(): Promise<void>;
    getStats(): Promise<InterfaceStats>;
    shutdown(): Promise<void>;
    private detectInterfaceMode;
    private launchCLI;
    private launchTUI;
    private launchWeb;
    private ensureInitialized;
}
//# sourceMappingURL=interface-manager.d.ts.map