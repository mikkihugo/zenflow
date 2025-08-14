import { VALIDATION_RULES } from './defaults.ts';
export class ConfigValidator {
    validate(config) {
        const errors = [];
        const warnings = [];
        try {
            this.validateStructure(config, errors);
            this.validateRules(config, errors, warnings);
            this.validateDependencies(config, errors, warnings);
            this.validateConstraints(config, errors, warnings);
        }
        catch (error) {
            errors.push(`Validation error: ${error}`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    validateStructure(config, errors) {
        const requiredSections = [
            'core',
            'interfaces',
            'storage',
            'coordination',
            'neural',
            'optimization',
        ];
        for (const section of requiredSections) {
            if (!config?.[section]) {
                errors.push(`Missing required configuration section: ${section}`);
            }
        }
        if (config?.core) {
            if (!config?.core?.logger) {
                errors.push('Missing core.logger configuration');
            }
            if (!config?.core?.performance) {
                errors.push('Missing core.performance configuration');
            }
            if (!config?.core?.security) {
                errors.push('Missing core.security configuration');
            }
        }
        if (config?.interfaces) {
            const requiredInterfaces = ['shared', 'terminal', 'web', 'mcp'];
            for (const iface of requiredInterfaces) {
                if (!config?.interfaces?.[iface]) {
                    errors.push(`Missing interfaces.${iface} configuration`);
                }
            }
        }
        if (config?.storage) {
            if (!config?.storage?.memory) {
                errors.push('Missing storage.memory configuration');
            }
            if (!config?.storage?.database) {
                errors.push('Missing storage.database configuration');
            }
        }
    }
    validateRules(config, errors, warnings) {
        for (const [path, rule] of Object.entries(VALIDATION_RULES)) {
            const value = this.getNestedValue(config, path);
            if (value === undefined) {
                warnings.push(`Optional configuration missing: ${path}`);
                continue;
            }
            if (rule.type === 'string' && typeof value !== 'string') {
                errors.push(`${path} must be a string, got ${typeof value}`);
                continue;
            }
            if (rule.type === 'number' && typeof value !== 'number') {
                errors.push(`${path} must be a number, got ${typeof value}`);
                continue;
            }
            if ('type' in rule &&
                rule.type &&
                rule.type === 'boolean' &&
                typeof value !== 'boolean') {
                errors.push(`${path} must be a boolean, got ${typeof value}`);
                continue;
            }
            if ('enum' in rule && rule.enum && Array.isArray(rule.enum)) {
                if (!rule.enum.includes(value)) {
                    errors.push(`${path} must be one of: ${rule.enum.join(', ')}, got ${value}`);
                }
            }
            if (rule.type === 'number' && typeof value === 'number') {
                if ('min' in rule && rule.min !== undefined && value < rule.min) {
                    errors.push(`${path} must be >= ${rule.min}, got ${value}`);
                }
                if ('max' in rule && rule.max !== undefined && value > rule.max) {
                    errors.push(`${path} must be <= ${rule.max}, got ${value}`);
                }
            }
        }
    }
    validateDependencies(config, errors, warnings) {
        if (config?.interfaces?.web?.enableHttps &&
            !config?.interfaces?.web?.corsOrigins) {
            warnings.push('HTTPS enabled but no CORS origins configured');
        }
        if (config?.neural?.enableCUDA && !config?.neural?.enableWASM) {
            warnings.push('CUDA enabled without WASM - may not be supported');
        }
        if (config?.storage?.memory?.backend === 'lancedb' &&
            !config?.storage?.database?.lancedb) {
            errors.push('LanceDB backend selected but lancedb configuration missing');
        }
        if (config?.interfaces?.mcp?.tools?.enableAll &&
            config?.interfaces?.mcp?.tools?.disabledTools?.length > 0) {
            warnings.push('enableAll is true but some tools are disabled');
        }
        if (!config?.core?.security?.enableSandbox &&
            config?.core?.security?.allowShellAccess) {
            warnings.push('Shell access enabled without sandbox - security risk');
        }
        if (config?.core?.performance?.enableProfiling &&
            !config?.core?.performance?.enableMetrics) {
            warnings.push('Profiling enabled without metrics - limited functionality');
        }
    }
    validateConstraints(config, errors, warnings) {
        const ports = [
            config?.interfaces?.web?.port,
            config?.interfaces?.mcp?.http?.port,
        ].filter(Boolean);
        const uniquePorts = new Set(ports);
        if (ports.length !== uniquePorts.size) {
            errors.push('Port conflicts detected - multiple services cannot use the same port');
        }
        if (config?.storage?.memory?.maxMemorySize &&
            config?.storage?.memory?.cacheSize) {
            if (config?.storage?.memory?.cacheSize >
                config?.storage?.memory?.maxMemorySize) {
                errors.push('Cache size cannot be larger than max memory size');
            }
        }
        if (config?.coordination?.maxAgents &&
            config?.coordination?.maxAgents > 1000) {
            warnings.push('Very high agent count may impact performance');
        }
        const timeouts = [
            config?.interfaces?.terminal?.timeout,
            config?.interfaces?.mcp?.http?.timeout,
            config?.coordination?.timeout,
        ].filter(Boolean);
        for (const timeout of timeouts) {
            if (timeout < 1000) {
                warnings.push(`Very low timeout value (${timeout}ms) may cause issues`);
            }
            if (timeout > 300000) {
                warnings.push(`Very high timeout value (${timeout}ms) may cause hangs`);
            }
        }
        const directories = [
            config?.storage?.memory?.directory,
            config?.storage?.database?.sqlite?.path,
            config?.storage?.database?.lancedb?.path,
            config?.neural?.modelPath,
        ].filter(Boolean);
        for (const dir of directories) {
            if (dir.includes('..')) {
                warnings.push(`Directory path contains '..' - potential security risk: ${dir}`);
            }
        }
    }
    getNestedValue(obj, path) {
        return path
            .split('.')
            .reduce((current, key) => current?.[key], obj);
    }
    validateSection(_config, section) {
        const errors = [];
        const warnings = [];
        const sectionRules = Object.entries(VALIDATION_RULES).filter(([path]) => path.startsWith(`${section}.`));
        for (const [_path, _rule] of sectionRules) {
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    validateEnhanced(config) {
        const basicResult = this.validate(config);
        const securityIssues = [];
        const portConflicts = [];
        const performanceWarnings = [];
        const failsafeApplied = [];
        if (!config?.core?.security?.enableSandbox &&
            config?.core?.security?.allowShellAccess) {
            securityIssues.push('Shell access enabled without sandbox protection');
        }
        if (config?.core?.security?.trustedHosts?.length === 0) {
            securityIssues.push('No trusted hosts configured for security');
        }
        const ports = [
            config?.interfaces?.web?.port,
            config?.interfaces?.mcp?.http?.port,
            config?.monitoring?.dashboard?.port,
        ].filter((port) => typeof port === 'number');
        const uniquePorts = new Set(ports);
        if (ports.length !== uniquePorts.size) {
            portConflicts.push('Multiple services configured to use the same port');
        }
        if (config?.coordination?.maxAgents &&
            config?.coordination?.maxAgents > 1000) {
            performanceWarnings.push('High agent count may impact performance');
        }
        if (config?.core?.logger?.level === 'debug') {
            performanceWarnings.push('Debug logging enabled - may impact performance');
        }
        const productionReady = basicResult?.valid &&
            securityIssues.length === 0 &&
            portConflicts.length === 0 &&
            config?.core?.security?.enableSandbox === true;
        const result = {
            valid: basicResult?.valid,
            errors: basicResult?.errors,
            warnings: basicResult?.warnings,
            productionReady,
            securityIssues,
            portConflicts,
            performanceWarnings,
            failsafeApplied,
        };
        return result;
    }
    getHealthReport(config) {
        const result = this.validateEnhanced(config);
        const recommendations = [];
        const structureScore = result?.errors.length === 0
            ? 100
            : Math.max(0, 100 - result?.errors.length * 10);
        const securityScore = result?.securityIssues.length === 0
            ? 100
            : Math.max(0, 100 - result?.securityIssues.length * 20);
        const performanceScore = result?.performanceWarnings.length === 0
            ? 100
            : Math.max(0, 100 - result?.performanceWarnings.length * 5);
        const productionScore = result?.productionReady ? 100 : 50;
        const overallScore = (structureScore + securityScore + performanceScore + productionScore) / 4;
        if (result?.errors.length > 0) {
            recommendations.push('Fix configuration errors before deployment');
        }
        if (result?.securityIssues.length > 0) {
            recommendations.push('Address security issues for production deployment');
        }
        if (result?.portConflicts.length > 0) {
            recommendations.push('Resolve port conflicts between services');
        }
        if (result?.performanceWarnings.length > 0) {
            recommendations.push('Review performance configuration for optimization');
        }
        const status = overallScore >= 90
            ? 'healthy'
            : overallScore >= 70
                ? 'warning'
                : 'critical';
        return {
            status,
            score: Math.round(overallScore),
            details: {
                structure: result?.errors.length === 0,
                security: result?.securityIssues.length === 0,
                performance: result?.performanceWarnings.length < 3,
                production: result?.productionReady,
            },
            recommendations,
        };
    }
}
//# sourceMappingURL=validator.js.map