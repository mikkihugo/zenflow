/**
 * @file Interface-mode-detector implementation.
 */
export type InterfaceMode = 'cli' | 'tui' | 'web';
export interface ModeDetectionOptions {
    /** Force a specific mode regardless of environment */
    forceMode?: InterfaceMode;
    /** Enable web mode on specified port */
    webPort?: number;
    /** Enable daemon mode for web interface */
    daemon?: boolean;
    /** Prefer TUI over CLI in interactive environments */
    preferTui?: boolean;
}
export interface ModeDetectionResult {
    mode: InterfaceMode;
    reason: string;
    config: {
        port?: number;
        daemon?: boolean;
        interactive: boolean;
        hasTerminal: boolean;
        isCI: boolean;
    };
}
export declare class InterfaceModeDetector {
    /**
     * Detect the appropriate interface mode based on environment.
     *
     * @param options
     */
    static detect(options?: ModeDetectionOptions): ModeDetectionResult;
    /**
     * Get environment information for debugging.
     */
    static getEnvironmentInfo(): Record<string, any>;
    /**
     * Validate if a mode is supported in the current environment.
     *
     * @param mode
     */
    static validateMode(mode: InterfaceMode): {
        valid: boolean;
        reason?: string;
    };
    /**
     * Get recommended mode based on current environment.
     */
    static getRecommendation(): {
        primary: InterfaceMode;
        alternatives: InterfaceMode[];
        explanation: string;
    };
}
//# sourceMappingURL=interface-mode-detector.d.ts.map