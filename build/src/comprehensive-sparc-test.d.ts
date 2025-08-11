/**
 * @file Test suite for comprehensive-sparc-test.
 */
declare function runComprehensiveTest(): Promise<{
    coreEngine: boolean;
    cliIntegration: boolean;
    mcpIntegration: boolean;
    endToEndFlow: boolean;
    overallSuccess: boolean;
}>;
export { runComprehensiveTest };
//# sourceMappingURL=comprehensive-sparc-test.d.ts.map