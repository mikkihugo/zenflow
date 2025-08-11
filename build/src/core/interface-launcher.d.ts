/**
 * Interface Launcher.
 *
 * Handles launching the appropriate interface (CLI/TUI/Web) based on environment.
 * And configuration. Integrates with all core systems directly without plugins.
 */
/**
 * @file Interface-launcher implementation.
 */
import { EventEmitter } from 'node:events';
import { type InterfaceMode, type ModeDetectionOptions } from './interface-mode-detector.ts';
export interface LaunchOptions extends ModeDetectionOptions {
    verbose?: boolean;
    silent?: boolean;
    config?: {
        theme?: 'dark' | 'light';
        realTime?: boolean;
        coreSystem?: Record<string, unknown>;
    };
}
export interface LaunchResult {
    mode: InterfaceMode;
    success: boolean;
    url?: string;
    error?: string;
    pid?: number;
}
export declare class InterfaceLauncher extends EventEmitter {
    private static instance;
    private activeInterface?;
    private constructor();
    /**
     * Get singleton instance.
     */
    static getInstance(): InterfaceLauncher;
    /**
     * Launch the appropriate interface based on options and environment.
     *
     * @param options
     */
    launch(options?: LaunchOptions): Promise<LaunchResult>;
    /**
     * Launch CLI interface (Unified Terminal Interface).
     *
     * @param options
     */
    private launchCLI;
    /**
     * Launch TUI interface using Unified Terminal Interface.
     *
     * @param options
     */
    private launchTUI;
    /**
     * Launch Web interface.
     *
     * @param options
     * @param port
     */
    private launchWeb;
    /**
     * Basic CLI fallback when TUI/Web interfaces aren't available.
     *
     * @param options
     */
    private launchBasicCLI;
    /**
     * Get current interface status.
     */
    getStatus(): {
        active: boolean;
        mode?: InterfaceMode;
        url?: string;
        pid?: number;
    };
    /**
     * Shutdown active interface.
     */
    shutdown(): Promise<void>;
    /**
     * Restart interface with new options.
     *
     * @param options
     */
    restart(options?: LaunchOptions): Promise<LaunchResult>;
    /**
     * Get interface recommendations for current environment.
     */
    getRecommendations(): {
        primary: InterfaceMode;
        alternatives: InterfaceMode[];
        explanation: string;
    };
    /**
     * Get environment information for debugging.
     */
    getEnvironmentInfo(): Record<string, any>;
    /**
     * Setup graceful shutdown handlers.
     */
    private setupShutdownHandlers;
}
export declare const launchInterface: (options?: LaunchOptions) => Promise<LaunchResult>;
export declare const getInterfaceStatus: () => {
    active: boolean;
    mode?: InterfaceMode;
    url?: string;
    pid?: number;
};
export declare const shutdownInterface: () => Promise<void>;
//# sourceMappingURL=interface-launcher.d.ts.map