/**
 * @fileoverview System Capability Data Providers - Foundation Data Layer Only
 *
 * Provides data access functions for system capability tracking. This module
 * contains ONLY data providers - no UI, no display logic, no Express routes.
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

import { facadeStatusManager, getSystemStatus } from './facade-status-manager';
import { getLogger } from './logging';
import type { JsonValue, JsonObject } from './types/primitives';

const logger = getLogger('system-capability-dashboard');

/**
 * Installation suggestion for missing packages
 */
export interface InstallationSuggestion {
  package: string;
  facade: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  features: string[];
}

/**
 * Facade summary for dashboard
 */
export interface FacadeSummary {
  name: string;
  capability: string;
  healthScore: number;
  availablePackages: number;
  totalPackages: number;
  missingPackages: string[];
  registeredServices: string[];
  features: string[];
}

/**
 * System capability data structure
 */
export interface SystemCapabilityData {
  overall: string;
  systemHealthScore: number;
  timestamp: string;
  facades: FacadeSummary[];
  totalPackages: number;
  availablePackages: number;
  registeredServices: number;
  installationSuggestions: InstallationSuggestion[];
}

/**
 * Get comprehensive system capability data
 */
export async function getSystemCapabilityData(): Promise<SystemCapabilityData> {
  const systemStatus = getSystemStatus();
  const suggestions = await getInstallationSuggestions();

  const facades: FacadeSummary[] = Object.entries(systemStatus.facades).map(
    ([name, status]) => ({
      name,
      capability: status.capability,
      healthScore: status.healthScore,
      availablePackages: Object.values(status.packages).filter(
        (pkg) => pkg.status === 'available' || pkg.status === 'registered'
      ).length,
      totalPackages: Object.keys(status.packages).length,
      missingPackages: status.missingPackages,
      registeredServices: status.registeredServices,
      features: status.features,
    })
  );

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
export async function getInstallationSuggestions(): Promise<
  InstallationSuggestion[]
> {
  const systemStatus = getSystemStatus();
  const suggestions: InstallationSuggestion[] = [];

  Object.entries(systemStatus.facades).forEach(([facadeName, facade]) => {
    facade.missingPackages.forEach((packageName) => {
      // Determine priority based on facade type
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (facadeName === 'infrastructure') {
        priority = 'high';
      }
      if (facadeName === 'intelligence' && packageName.includes('brain')) {
        priority = 'high';
      }
      if (facadeName === 'operations' && packageName.includes('monitoring')) {
        priority = 'high';
      }

      // Get features this package would enable
      const packageFeatures = getPackageFeatures(packageName, facade.features);

      suggestions.push({
        package: packageName,
        facade: facadeName,
        reason: `Enable ${packageFeatures.join(', ')} in ${facadeName} facade`,
        priority,
        features: packageFeatures,
      });
    });
  });

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  suggestions.sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
  );

  return suggestions;
}

/**
 * Get features a package would enable
 */
function getPackageFeatures(
  packageName: string,
  allFeatures: string[]
): string[] {
  const packageKeywords = packageName.replace('@claude-zen/', '').split('-');

  return allFeatures
    .filter((feature) =>
      packageKeywords.some((keyword) =>
        feature.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    .slice(0, 3); // Limit to top 3 most relevant features
}

/**
 * Display system status in console with colors and emojis
 */
export async function displaySystemStatus(): Promise<void> {
  const dashboard = await getSystemCapabilityData();

  console.log('\n🐝 claude-code-zen System Status Dashboard');
  console.log('='.repeat(50));

  // Overall status
  const statusEmoji =
    dashboard.overall === 'full'
      ? '✅'
      : dashboard.overall === 'partial'
        ? '⚠️'
        : '❌';
  console.log(
    `${statusEmoji} Overall: ${dashboard.overall.toUpperCase()} (${dashboard.systemHealthScore}% health)`
  );
  console.log(
    `📦 Packages: ${dashboard.availablePackages}/${dashboard.totalPackages} available`
  );
  console.log(
    `🔧 Services: ${dashboard.registeredServices} registered in Awilix`
  );

  // Facade breakdown
  console.log('\n📊 Facade Status:');
  dashboard.facades.forEach((facade) => {
    const facadeEmoji =
      facade.capability === 'full'
        ? '✅'
        : facade.capability === 'partial'
          ? '⚠️'
          : '❌';
    console.log(
      `  ${facadeEmoji} ${facade.name}: ${facade.capability} (${facade.healthScore}%)`
    );

    if (facade.missingPackages.length > 0) {
      console.log(`    Missing: ${facade.missingPackages.join(', ')}`);
    }

    if (facade.registeredServices.length > 0) {
      console.log(`    Services: ${facade.registeredServices.join(', ')}`);
    }
  });

  // Installation suggestions
  if (dashboard.installationSuggestions.length > 0) {
    console.log('\n💡 Installation Suggestions:');
    dashboard.installationSuggestions.slice(0, 5).forEach((suggestion) => {
      const priorityEmoji =
        suggestion.priority === 'high'
          ? '🔥'
          : suggestion.priority === 'medium'
            ? '⭐'
            : '💡';
      console.log(`  ${priorityEmoji} pnpm add ${suggestion.package}`);
      console.log(`    └─ ${suggestion.reason}`);
    });
  }

  console.log(`\n📅 Last Updated: ${dashboard.timestamp}`);
  console.log('='.repeat(50));
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

    getDetailedData: async () => {
      return await getSystemCapabilityData();
    },
  };
}

/**
 * Monitor system status changes and log important events
 */
export function startSystemMonitoring(): void {
  facadeStatusManager.on(
    'packageStatusChanged',
    (packageName: string, packageInfo: JsonValue) => {
      if (
        packageInfo &&
        typeof packageInfo === 'object' &&
        !Array.isArray(packageInfo)
      ) {
        const info = packageInfo as JsonObject;
        if (info['status'] === 'registered') {
          logger.info(`📦 Package ${packageName} registered successfully`, {
            serviceName: info['serviceName'] || 'unknown',
            loadTime: info['loadTime'] || 'unknown',
          });
        } else if (info['status'] === 'unavailable') {
          logger.warn(`⚠️ Package ${packageName} unavailable`, {
            error: info['error'] || 'unknown error',
          });
        }
      }
    }
  );

  facadeStatusManager.on(
    'facadeRegistered',
    (facadeName: string, facadeStatus: JsonValue) => {
      if (
        facadeStatus &&
        typeof facadeStatus === 'object' &&
        !Array.isArray(facadeStatus)
      ) {
        const status = facadeStatus as JsonObject;
        logger.info(`🏗️ Facade ${facadeName} registered`, {
          capability: status['capability'] || 'unknown',
          healthScore: status['healthScore'] || 0,
          registeredServices: Array.isArray(status['registeredServices'])
            ? status['registeredServices'].length
            : 0,
        });
      }
    }
  );

  facadeStatusManager.on(
    'systemStatusUpdated',
    async (systemStatus: JsonValue) => {
      if (
        systemStatus &&
        typeof systemStatus === 'object' &&
        !Array.isArray(systemStatus)
      ) {
        const status = systemStatus as JsonObject;
        logger.debug('📊 System status updated', {
          overall: status['overall'] || 'unknown',
          healthScore: status['healthScore'] || 0,
          availablePackages: status['availablePackages'] || 0,
          totalPackages: status['totalPackages'] || 0,
        });
      }
    }
  );

  logger.info('🔍 System monitoring started');
}

/**
 * Get capability score for specific areas
 */
export async function getCapabilityScores(): Promise<Record<string, number>> {
  const systemStatus = getSystemStatus();
  const scores: Record<string, number> = {};

  Object.entries(systemStatus.facades).forEach(([name, status]) => {
    scores[name] = status.healthScore;
  });

  return scores;
}
