/**
 * System Information and Memory Detection Utilities
 *
 * Provides reliable system memory detection and capacity reporting
 * for optimal adaptive configuration.
 */

export interface SystemInfo {
  totalMemoryGB: number;
  totalMemoryMB: number;
  availableMemoryGB: number;
  platform: string;
  cpuCores: number;
  recommendedConfig: {
    conservative: boolean;
    maxPortfolioStreams: number;
    maxProgramStreams: number;
    maxSwarmStreams: number;
  };
}

/**
 * Safely detect system memory with fallbacks
 */
export function detectSystemMemory(): number {
  try {
    const os = require('os');
    const totalBytes = os.totalmem();
    const totalGB = Math.round(totalBytes / (1024 * 1024 * 1024));

    // Validate reasonable range (1GB to 2TB)
    if (totalGB < 1 || totalGB > 2048) {
      console.warn(
        `⚠️ Unusual system memory detected: ${totalGB}GB, using 8GB default`
      );
      return 8;
    }

    return totalGB;
  } catch (error) {
    console.warn('⚠️ Could not detect system memory, using 8GB default:', error);
    return 8;
  }
}

/**
 * Get comprehensive system information
 */
export function getSystemInfo(): SystemInfo {
  const totalMemoryGB = detectSystemMemory();
  const totalMemoryMB = totalMemoryGB * 1024;

  let platform = 'unknown';
  let cpuCores = 1;

  try {
    const os = require('os');
    platform = os.platform();
    cpuCores = os.cpus().length;
  } catch (error) {
    console.warn('⚠️ Could not detect system platform/CPU info');
  }

  // Calculate safe available memory (reserve 50% for system)
  const availableMemoryGB = Math.floor(totalMemoryGB * 0.5);

  // Ultra-conservative stream recommendations
  const recommendedConfig = {
    conservative: totalMemoryGB <= 16, // Be extra conservative on <=16GB systems
    maxPortfolioStreams: Math.max(
      1,
      Math.min(16, Math.floor(totalMemoryGB * 0.25))
    ),
    maxProgramStreams: Math.max(
      2,
      Math.min(64, Math.floor(totalMemoryGB * 0.5))
    ),
    maxSwarmStreams: Math.max(
      4,
      Math.min(256, Math.floor(totalMemoryGB * 1.0))
    ),
  };

  return {
    totalMemoryGB,
    totalMemoryMB,
    availableMemoryGB,
    platform,
    cpuCores,
    recommendedConfig,
  };
}

/**
 * Log system information for debugging
 */
export function logSystemInfo(): void {
  const info = getSystemInfo();

  console.log('🖥️  System Information:');
  console.log(
    `   Total Memory: ${info.totalMemoryGB}GB (${info.totalMemoryMB}MB)`
  );
  console.log(
    `   Available Memory: ${info.availableMemoryGB}GB (conservative estimate)`
  );
  console.log(`   Platform: ${info.platform}`);
  console.log(`   CPU Cores: ${info.cpuCores}`);
  console.log('');
  console.log('🎯 Recommended Stream Limits (Ultra-Conservative):');
  console.log(
    `   Portfolio: ${info.recommendedConfig.maxPortfolioStreams} streams max`
  );
  console.log(
    `   Program: ${info.recommendedConfig.maxProgramStreams} streams max`
  );
  console.log(
    `   Swarm: ${info.recommendedConfig.maxSwarmStreams} streams max`
  );
  console.log(
    `   Conservative Mode: ${info.recommendedConfig.conservative ? 'YES' : 'NO'}`
  );
}

/**
 * Validate if a configuration is safe for the detected system
 */
export function validateConfigForSystem(config: {
  portfolio: number;
  program: number;
  swarm: number;
}): {
  safe: boolean;
  warnings: string[];
  systemInfo: SystemInfo;
} {
  const systemInfo = getSystemInfo();
  const warnings: string[] = [];

  // Check against ultra-conservative limits
  if (config.portfolio > systemInfo.recommendedConfig.maxPortfolioStreams) {
    warnings.push(
      `Portfolio streams (${config.portfolio}) exceeds safe limit (${systemInfo.recommendedConfig.maxPortfolioStreams}) for ${systemInfo.totalMemoryGB}GB system`
    );
  }

  if (config.program > systemInfo.recommendedConfig.maxProgramStreams) {
    warnings.push(
      `Program streams (${config.program}) exceeds safe limit (${systemInfo.recommendedConfig.maxProgramStreams}) for ${systemInfo.totalMemoryGB}GB system`
    );
  }

  if (config.swarm > systemInfo.recommendedConfig.maxSwarmStreams) {
    warnings.push(
      `Swarm streams (${config.swarm}) exceeds safe limit (${systemInfo.recommendedConfig.maxSwarmStreams}) for ${systemInfo.totalMemoryGB}GB system`
    );
  }

  // Estimate total memory usage
  const estimatedMemoryMB =
    config.portfolio * 128 + config.program * 32 + config.swarm * 8;
  const maxSafeMemoryMB = systemInfo.totalMemoryMB * 0.4; // Never use more than 40% of system memory

  if (estimatedMemoryMB > maxSafeMemoryMB) {
    warnings.push(
      `Configuration would use ${estimatedMemoryMB}MB but safe limit is ${maxSafeMemoryMB}MB`
    );
  }

  return {
    safe: warnings.length === 0,
    warnings,
    systemInfo,
  };
}

/**
 * Get memory-appropriate starting configuration
 */
export function getStartupConfig(): {
  portfolio: number;
  program: number;
  swarm: number;
  rationale: string;
} {
  const systemInfo = getSystemInfo();

  // Always start ultra-conservatively regardless of detected memory
  const startupConfig = {
    portfolio: Math.max(
      1,
      Math.min(4, Math.floor(systemInfo.totalMemoryGB * 0.125))
    ),
    program: Math.max(
      2,
      Math.min(8, Math.floor(systemInfo.totalMemoryGB * 0.25))
    ),
    swarm: Math.max(
      4,
      Math.min(16, Math.floor(systemInfo.totalMemoryGB * 0.5))
    ),
  };

  const estimatedUsageMB =
    startupConfig.portfolio * 128 +
    startupConfig.program * 32 +
    startupConfig.swarm * 8;
  const usagePercentage = (
    (estimatedUsageMB / systemInfo.totalMemoryMB) *
    100
  ).toFixed(1);

  const rationale = `Ultra-conservative startup for ${systemInfo.totalMemoryGB}GB system: ${estimatedUsageMB}MB usage (${usagePercentage}% of total). Will auto-scale based on performance.`;

  return {
    ...startupConfig,
    rationale,
  };
}

export default {
  detectSystemMemory,
  getSystemInfo,
  logSystemInfo,
  validateConfigForSystem,
  getStartupConfig,
};
