/**
 * @file Coordination system: session-example.
 */
/**
 * Example 1: Basic Session Usage.
 *
 * @example
 */
declare function basicSessionExample(): Promise<string>;
/**
 * Example 2: Session Recovery and Restoration.
 *
 * @param existingSessionId
 * @example
 */
declare function sessionRecoveryExample(existingSessionId: string): Promise<void>;
/**
 * Example 3: Session Lifecycle Management.
 *
 * @example
 */
declare function sessionLifecycleExample(): Promise<string>;
/**
 * Example 4: Session Health Monitoring and Recovery.
 *
 * @example
 */
declare function sessionHealthExample(): Promise<void>;
/**
 * Example 5: Advanced Session Operations.
 *
 * @example
 */
declare function advancedSessionExample(): Promise<void>;
/**
 * Main execution function.
 *
 * @example
 */
declare function runAllExamples(): Promise<void>;
/**
 * Extension method for SessionEnabledSwarm to export session data.
 */
declare module './session-integration.js' {
    interface SessionEnabledSwarm {
        exportSession(): Promise<string>;
    }
}
export { basicSessionExample, sessionRecoveryExample, sessionLifecycleExample, sessionHealthExample, advancedSessionExample, runAllExamples, };
//# sourceMappingURL=session-example.d.ts.map