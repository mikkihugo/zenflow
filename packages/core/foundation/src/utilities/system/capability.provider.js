/**
 * @fileoverview System Capability Data Providers - Foundation Data Layer Only
 *
 * Provides data access functions for system capability tracking. This module
 * contains ONLY data providers - no UI, no display logic, no Express routes.
 */
/**
 *
 * @example Get System Capability Data
 * ```typescript
 * import { getSystemCapabilityData } from '@claude-zen/foundation/system-capability-data-provider';
 *
 * const data = await getSystemCapabilityData();
 * // Use this data in web dashboard, CLI, or API
 * ```
 *
 * @example Get Installation Suggestions
 * ```typescript
 * import { getInstallationSuggestions } from '@claude-zen/foundation/system-capability-data-provider';
 *
 * const suggestions = await getInstallationSuggestions();
 * // Pass to web UI or CLI for display
 * ```
 */
import { getLogger } from "../../core/logging/index.js";
import { facadeStatusManager, getSystemStatus, } from "../../infrastructure/facades";
const logger = getLogger("system-capability-dashboard");
/**
 * Get comprehensive system capability data
 */
export async function getSystemCapabilityData() {
    const systemStatus = getSystemStatus();
    const suggestions = await getInstallationSuggestions();
    const facades = Object.entries(systemStatus.facades).map(([name, status]) => ({
        name,
        capability: status.capability,
        healthScore: status.healthScore,
        availablePackages: Object.values(status.packages).filter((pkg) => pkg.status === "available" || pkg.status === "registered").length,
        totalPackages: Object.keys(status.packages).length,
        missingPackages: status.missingPackages,
        registeredServices: status.registeredServices,
        features: status.features,
    }));
    return {
        overall: systemStatus.overall,
        systemHealthScore: systemStatus.healthScore,
        timestamp: new Date().toISOString(),
        facades,
        totalPackages: systemStatus.totalPackages,
        availablePackages: systemStatus.availablePackages,
        registeredServices: systemStatus.registeredServices,
        installationSuggestions: suggestions,
    };
}
/**
 * Get installation suggestions for missing packages
 */
export async function getInstallationSuggestions() {
    // Simulate async operation for future enhancement
    await Promise.resolve();
    const systemStatus = getSystemStatus();
    const suggestions = [];
    for (const [facadeName, facade] of Object.entries(systemStatus.facades)) {
        for (const packageName of facade.missingPackages) {
            // Determine priority based on facade type
            let priority = "medium";
            if (facadeName === "infrastructure") {
                priority = "high";
            }
            if (facadeName === "intelligence" && packageName.includes("brain")) {
                priority = "high";
            }
            if (facadeName === "operations" && packageName.includes("monitoring")) {
                priority = "high";
            }
            // Get features this package would enable
            const packageFeatures = getPackageFeatures(packageName, facade.features);
            suggestions.push({
                package: packageName,
                facade: facadeName,
                reason: `Enable ${packageFeatures.join(", ")} in ${facadeName} facade`,
                priority,
                features: packageFeatures,
            });
        }
    }
    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    return suggestions;
}
/**
 * Get features a package would enable
 */
function getPackageFeatures(packageName, allFeatures) {
    const packageKeywords = packageName.replace("@claude-zen/", "").split("-");
    return allFeatures
        .filter((feature) => packageKeywords.some((keyword) => feature.toLowerCase().includes(keyword.toLowerCase())))
        .slice(0, 3); // Limit to top 3 most relevant features
}
/**
 * Display system status in console with colors and emojis
 */
export async function displaySystemStatus() {
    const dashboard = await getSystemCapabilityData();
    logger.info("\n🐝 claude-code-zen System Status Dashboard");
    logger.info("=".repeat(50));
    // Overall status
    const statusEmoji = dashboard.overall === "full"
        ? "✅"
        : dashboard.overall === "partial"
            ? "⚠️"
            : "❌";
    logger.info(`${statusEmoji} Overall: ${dashboard.overall.toUpperCase()} (${dashboard.systemHealthScore}% health)`);
    logger.info(`📦 Packages: ${dashboard.availablePackages}/${dashboard.totalPackages} available`);
    logger.info(`🔧 Services: ${dashboard.registeredServices} registered in Awilix`);
    // Facade breakdown
    logger.info("\n📊 Facade Status:");
    for (const facade of dashboard.facades) {
        const facadeEmoji = facade.capability === "full"
            ? "✅"
            : facade.capability === "partial"
                ? "⚠️"
                : "❌";
        logger.info(`  ${facadeEmoji} ${facade.name}: ${facade.capability} (${facade.healthScore}%)`);
        if (facade.missingPackages.length > 0) {
            logger.info(`    Missing: ${facade.missingPackages.join(", ")}`);
        }
        if (facade.registeredServices.length > 0) {
            logger.info(`    Services: ${facade.registeredServices.join(", ")}`);
        }
    }
    // Installation suggestions
    if (dashboard.installationSuggestions.length > 0) {
        logger.info("\n💡 Installation Suggestions:");
        for (const suggestion of dashboard.installationSuggestions.slice(0, 5)) {
            const priorityEmoji = suggestion.priority === "high"
                ? "🔥"
                : suggestion.priority === "medium"
                    ? "⭐"
                    : "💡";
            logger.info(`  ${priorityEmoji} pnpm add ${suggestion.package}`);
            logger.info(`    └─ ${suggestion.reason}`);
        }
    }
    logger.info(`\n📅 Last Updated: ${dashboard.timestamp}`);
    logger.info("=".repeat(50));
}
/**
 * Create health check data providers (data only, no Express routing)
 */
export function createHealthDataProviders() {
    return {
        getStatusData: async () => {
            const data = await getSystemCapabilityData();
            return {
                status: data.overall,
                healthScore: data.systemHealthScore,
                timestamp: data.timestamp,
                summary: {
                    facades: data.facades.length,
                    packages: `${data.availablePackages}/${data.totalPackages}`,
                    services: data.registeredServices,
                },
            };
        },
        getFacadesData: async () => {
            const data = await getSystemCapabilityData();
            return {
                facades: data.facades.map((facade) => ({
                    name: facade.name,
                    capability: facade.capability,
                    healthScore: facade.healthScore,
                    packages: `${facade.availablePackages}/${facade.totalPackages}`,
                    missingPackages: facade.missingPackages,
                    features: facade.features.slice(0, 3), // Top 3 features
                })),
            };
        },
        getSuggestionsData: async () => {
            const suggestions = await getInstallationSuggestions();
            return {
                suggestions: suggestions.map((s) => ({
                    package: s.package,
                    facade: s.facade,
                    priority: s.priority,
                    reason: s.reason,
                    installCommand: `pnpm add ${s.package}`,
                })),
            };
        },
        getDetailedData: async () => await getSystemCapabilityData(),
    };
}
/**
 * Monitor system status changes and log important events
 */
export function startSystemMonitoring() {
    facadeStatusManager.on("package-loaded", (...args) => {
        const data = args[0];
        logger.info(`📦 Package ${data.packageName} loaded successfully`, {
            version: data.version || "unknown",
            timestamp: data.timestamp.toISOString(),
        });
    });
    facadeStatusManager.on("facade-registered", (...args) => {
        const data = args[0];
        logger.info(`🏗️ Facade ${data.facadeName} registered`, {
            timestamp: data.timestamp.toISOString(),
        });
    });
    facadeStatusManager.on("system-status-changed", (...args) => {
        const data = args[0];
        logger.debug("📊 System status updated", {
            overall: data.status,
            healthScore: data.healthScore,
            timestamp: data.timestamp.toISOString(),
        });
    });
    logger.info("🔍 System monitoring started");
}
/**
 * Get capability score for specific areas
 */
export async function getCapabilityScores() {
    // Simulate async operation for future enhancement
    await Promise.resolve();
    const systemStatus = getSystemStatus();
    const scores = {};
    for (const [name, status] of Object.entries(systemStatus.facades)) {
        scores[name] = status.healthScore;
    }
    return scores;
}
