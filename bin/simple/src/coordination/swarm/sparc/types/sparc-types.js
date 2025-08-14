export const ValidationReportFactory = {
    createDefault() {
        return {
            overall: true,
            score: 100,
            results: [],
            recommendations: [],
        };
    },
    create(options = {}) {
        return {
            overall: options?.overall ?? true,
            score: options?.score ?? 100,
            results: options?.results ?? [],
            recommendations: options?.recommendations ?? [],
            ...options,
        };
    },
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