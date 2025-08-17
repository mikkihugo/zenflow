/**
 * SPARC Methodology Core Types.
 *
 * Comprehensive type definitions for the SPARC (Specification, Pseudocode,
 * Architecture, Refinement, Completion) development methodology system.
 */
// ValidationReport Factory Functions
export const ValidationReportFactory = {
    /**
     * Creates a default ValidationReport with success defaults.
     */
    createDefault() {
        return {
            overall: true,
            score: 100,
            results: [],
            recommendations: [],
        };
    },
    /**
     * Creates a ValidationReport with custom values.
     *
     * @param options
     */
    create(options = {}) {
        return {
            overall: options?.overall ?? true,
            score: options?.score ?? 100,
            results: options?.results ?? [],
            recommendations: options?.recommendations ?? [],
            ...options, // Allow for optional aliases
        };
    },
    /**
     * Creates ValidationReport from legacy format with aliases.
     *
     * @param legacy
     * @param legacy.approved
     * @param legacy.overallScore
     * @param legacy.validationResults
     * @param legacy.recommendations
     */
    fromLegacyFormat(legacy) {
        return {
            overall: legacy.approved ?? true,
            approved: legacy.approved,
            score: legacy.overallScore ?? 100,
            overallScore: legacy.overallScore,
            results: legacy.validationResults ?? [],
            validationResults: legacy.validationResults,
            recommendations: legacy.recommendations ?? [],
        };
    },
};
//# sourceMappingURL=sparc-types.js.map