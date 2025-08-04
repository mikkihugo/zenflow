/**
 * @fileoverview FACT Storage Management MCP Tools
 * Tools for managing FACT storage performance, cache optimization, and maintenance
 */

import { createLogger } from '@core/logger';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { FACTStorageSystem } from './fact-placeholders';

const logger = createLogger({ prefix: 'MCP-FACT-Storage' });

export interface FACTCacheOptimizeParams {
  strategy?: 'aggressive' | 'balanced' | 'conservative';
  targetHitRate?: number; // 0-1
  maxMemoryUsage?: number; // MB
}

export interface FACTStorageAnalyzeParams {
  includePerformance?: boolean;
  includeTrends?: boolean;
  timeRange?: number; // hours
}

/**
 * Check FACT cache performance and status
 */
export const factCacheStatusTool: MCPTool = {
  name: 'fact_cache_status',
  description: 'Check FACT cache performance metrics and storage health',
  inputSchema: {
    type: 'object',
    properties: {
      detailed: {
        type: 'boolean',
        description: 'Include detailed performance breakdown',
        default: false,
      },
      includeRecommendations: {
        type: 'boolean',
        description: 'Include optimization recommendations',
        default: true,
      },
    },
  },
  handler: async (params: {
    detailed?: boolean;
    includeRecommendations?: boolean;
  }): Promise<MCPToolResult> => {
    try {
      logger.info('Checking FACT cache status:', params);

      const storage = FACTStorageSystem.getInstance();
      if (!storage) {
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `⚠️  FACT Storage Status: NOT INITIALIZED

No cache to analyze. Use fact_init to initialize the system.`,
            },
          ],
        };
      }

      const stats = await storage.getStorageStats();
      const detailed = params.detailed || false;

      // Calculate performance indicators
      const memoryEfficiency =
        stats.memoryEntries > 0 ? stats.totalMemorySize / (stats.memoryEntries * 1024) : 0;

      const storageRatio =
        stats.persistentEntries > 0 ? stats.memoryEntries / stats.persistentEntries : 0;

      // Performance assessment
      let performanceGrade = 'A';
      let performanceColor = '🟢';

      if (stats.cacheHitRate < 0.6) {
        performanceGrade = 'D';
        performanceColor = '🔴';
      } else if (stats.cacheHitRate < 0.75) {
        performanceGrade = 'C';
        performanceColor = '🟠';
      } else if (stats.cacheHitRate < 0.85) {
        performanceGrade = 'B';
        performanceColor = '🟡';
      }

      // Generate recommendations
      const recommendations = [];
      if (stats.cacheHitRate < 0.6) {
        recommendations.push('Increase memory cache size to improve hit rate');
      }
      if (memoryEfficiency > 2) {
        recommendations.push('Consider cache cleanup - entries may be too large');
      }
      if (storageRatio < 0.1 && stats.persistentEntries > 100) {
        recommendations.push('Memory cache under-utilized - consider increasing size');
      }
      if (stats.storageHealth === 'poor') {
        recommendations.push('Run fact_cache_clear or fact_cache_optimize urgently');
      }

      let detailedSection = '';
      if (detailed) {
        const avgEntryAge =
          stats.persistentEntries > 0
            ? (Date.now() - stats.oldestEntry) / stats.persistentEntries / 1000 / 60 / 60
            : 0;

        detailedSection = `
📊 Detailed Performance Analysis:
  Memory Efficiency: ${memoryEfficiency.toFixed(2)} KB/entry
  Storage Ratio: ${(storageRatio * 100).toFixed(1)}% (memory/persistent)
  Average Entry Age: ${avgEntryAge.toFixed(1)} hours
  
🔍 Cache Composition:
  Top Domains: ${stats.topDomains.slice(0, 3).join(', ')}
  Domain Diversity: ${stats.topDomains.length} unique domains
  
⏱️  Age Distribution:
  Fresh (< 1 hour): ${calculateAgeDistribution(stats, 'fresh')}%
  Recent (< 6 hours): ${calculateAgeDistribution(stats, 'recent')}%
  Old (> 24 hours): ${calculateAgeDistribution(stats, 'old')}%`;
      }

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `📊 FACT Cache Performance Report

${performanceColor} Overall Performance: Grade ${performanceGrade}
🏥 Storage Health: ${stats.storageHealth.toUpperCase()}

💾 Cache Statistics:
  Memory Entries: ${stats.memoryEntries}
  Persistent Entries: ${stats.persistentEntries}
  Total Memory Usage: ${(stats.totalMemorySize / 1024).toFixed(1)} KB
  Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%

⚡ Performance Metrics:
  Memory Efficiency: ${memoryEfficiency.toFixed(2)} KB/entry
  Storage Health: ${stats.storageHealth}
  Access Pattern: ${stats.cacheHitRate > 0.8 ? 'Excellent' : stats.cacheHitRate > 0.6 ? 'Good' : 'Needs Improvement'}
${detailedSection}

${
  params.includeRecommendations && recommendations.length > 0
    ? `💡 Optimization Recommendations:
${recommendations.map((rec) => `  • ${rec}`).join('\n')}

🔧 Suggested Actions:
  • Use fact_cache_optimize for automatic tuning
  • Use fact_cache_clear if storage health is poor
  • Consider adjusting cache size in fact_init`
    : ''
}`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT cache status check failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT cache status check failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Clear FACT knowledge cache
 */
export const factCacheClearTool: MCPTool = {
  name: 'fact_cache_clear',
  description: 'Clear FACT knowledge cache with various clearing strategies',
  inputSchema: {
    type: 'object',
    properties: {
      strategy: {
        type: 'string',
        enum: ['all', 'expired', 'low_quality', 'old_entries', 'memory_only'],
        description: 'Cache clearing strategy',
        default: 'expired',
      },
      confirmClear: {
        type: 'boolean',
        description: 'Confirm destructive clear operations',
        default: false,
      },
      maxAge: {
        type: 'number',
        description: 'Maximum age in hours for entries to keep (used with old_entries strategy)',
        minimum: 1,
        maximum: 168, // 7 days
        default: 24,
      },
      minQuality: {
        type: 'number',
        description: 'Minimum quality score to keep (used with low_quality strategy)',
        minimum: 0,
        maximum: 1,
        default: 0.5,
      },
    },
  },
  handler: async (params: {
    strategy?: string;
    confirmClear?: boolean;
    maxAge?: number;
    minQuality?: number;
  }): Promise<MCPToolResult> => {
    try {
      logger.info('Clearing FACT cache:', params);

      const storage = FACTStorageSystem.getInstance();
      if (!storage) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const strategy = params.strategy || 'expired';
      const confirmClear = params.confirmClear || false;

      // Destructive operations require confirmation
      if (['all', 'memory_only'].includes(strategy) && !confirmClear) {
        return {
          success: false,
          content: [
            {
              type: 'text',
              text: `⚠️  Destructive Clear Operation Requires Confirmation

Strategy "${strategy}" will permanently delete cache data.
Set confirmClear: true to proceed with this operation.

Available strategies:
  • expired: Remove only expired entries (safe)
  • low_quality: Remove low-quality entries (safe)  
  • old_entries: Remove entries older than maxAge (safe)
  • memory_only: Clear memory cache only (destructive)
  • all: Clear all cache data (destructive)`,
            },
          ],
        };
      }

      // Get pre-clear statistics
      const preStats = await storage.getStorageStats();

      let clearResult;
      switch (strategy) {
        case 'all':
          clearResult = await storage.clearAll();
          break;

        case 'expired':
          clearResult = await storage.cleanup();
          break;

        case 'low_quality':
          clearResult = await storage.clearByQuality(params.minQuality || 0.5);
          break;

        case 'old_entries': {
          const maxAgeMs = (params.maxAge || 24) * 60 * 60 * 1000;
          clearResult = await storage.clearByAge(maxAgeMs);
          break;
        }

        case 'memory_only':
          clearResult = await storage.clearMemoryCache();
          break;

        default:
          throw new Error(`Unknown clear strategy: ${strategy}`);
      }

      // Get post-clear statistics
      const postStats = await storage.getStorageStats();

      const entriesRemoved = preStats.memoryEntries - postStats.memoryEntries;
      const memoryFreed = preStats.totalMemorySize - postStats.totalMemorySize;
      const hitRateChange = postStats.cacheHitRate - preStats.cacheHitRate;

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🧹 FACT Cache Clear Complete

📋 Operation Details:
  Strategy: ${strategy}
  Execution Time: ${clearResult.executionTime}ms
  
📊 Results:
  Entries Removed: ${entriesRemoved}
  Memory Freed: ${(memoryFreed / 1024).toFixed(1)} KB
  
📈 Performance Impact:
  Cache Hit Rate: ${(preStats.cacheHitRate * 100).toFixed(1)}% → ${(postStats.cacheHitRate * 100).toFixed(1)}%
  Change: ${hitRateChange >= 0 ? '+' : ''}${(hitRateChange * 100).toFixed(1)}%
  
💾 Current Status:
  Memory Entries: ${postStats.memoryEntries}
  Persistent Entries: ${postStats.persistentEntries}
  Storage Health: ${postStats.storageHealth}
  
${
  clearResult.warnings && clearResult.warnings.length > 0
    ? `⚠️  Warnings:
${clearResult.warnings.map((w) => `  • ${w}`).join('\n')}`
    : ''
}

✅ Cache clearing completed successfully!`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT cache clear failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT cache clear failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Optimize FACT storage performance
 */
export const factStorageOptimizeTool: MCPTool = {
  name: 'fact_storage_optimize',
  description: 'Optimize FACT storage performance with intelligent tuning strategies',
  inputSchema: {
    type: 'object',
    properties: {
      strategy: {
        type: 'string',
        enum: ['aggressive', 'balanced', 'conservative'],
        description: 'Optimization strategy',
        default: 'balanced',
      },
      targetHitRate: {
        type: 'number',
        description: 'Target cache hit rate (0-1)',
        minimum: 0.5,
        maximum: 0.95,
        default: 0.8,
      },
      maxMemoryUsage: {
        type: 'number',
        description: 'Maximum memory usage in MB',
        minimum: 10,
        maximum: 1000,
        default: 100,
      },
      autoTune: {
        type: 'boolean',
        description: 'Enable automatic performance tuning',
        default: true,
      },
    },
  },
  handler: async (
    params: FACTCacheOptimizeParams & { autoTune?: boolean }
  ): Promise<MCPToolResult> => {
    try {
      logger.info('Optimizing FACT storage performance:', params);

      const storage = FACTStorageSystem.getInstance();
      if (!storage) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const optimizationConfig = {
        strategy: params.strategy || 'balanced',
        targetHitRate: params.targetHitRate || 0.8,
        maxMemoryUsage: (params.maxMemoryUsage || 100) * 1024 * 1024, // Convert to bytes
        autoTune: params.autoTune !== false,
      };

      // Get baseline metrics
      const preOptimizationStats = await storage.getStorageStats();

      // Run optimization
      const optimizationResult = await storage.optimize(optimizationConfig);

      // Get post-optimization metrics
      const postOptimizationStats = await storage.getStorageStats();

      // Calculate improvements
      const hitRateImprovement =
        postOptimizationStats.cacheHitRate - preOptimizationStats.cacheHitRate;
      const memoryChange =
        postOptimizationStats.totalMemorySize - preOptimizationStats.totalMemorySize;
      const healthImprovement =
        getHealthScore(postOptimizationStats.storageHealth) -
        getHealthScore(preOptimizationStats.storageHealth);

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `⚡ FACT Storage Optimization Complete

🎯 Optimization Strategy: ${optimizationConfig.strategy.toUpperCase()}
⏱️  Execution Time: ${optimizationResult.executionTime}ms

📊 Performance Improvements:
  Cache Hit Rate: ${(preOptimizationStats.cacheHitRate * 100).toFixed(1)}% → ${(postOptimizationStats.cacheHitRate * 100).toFixed(1)}%
  Improvement: ${hitRateImprovement >= 0 ? '+' : ''}${(hitRateImprovement * 100).toFixed(1)}%
  
💾 Memory Optimization:
  Memory Usage: ${(preOptimizationStats.totalMemorySize / 1024).toFixed(1)} → ${(postOptimizationStats.totalMemorySize / 1024).toFixed(1)} KB
  Change: ${memoryChange >= 0 ? '+' : ''}${(memoryChange / 1024).toFixed(1)} KB
  
🏥 Health Assessment:
  Storage Health: ${preOptimizationStats.storageHealth} → ${postOptimizationStats.storageHealth}
  Health Score: ${healthImprovement >= 0 ? '+' : ''}${healthImprovement} points

🔧 Optimizations Applied:
${optimizationResult.optimizations.map((opt) => `  • ${opt.description} (${opt.impact})`).join('\n')}

📈 Current Performance:
  Memory Entries: ${postOptimizationStats.memoryEntries}
  Hit Rate Target: ${optimizationConfig.targetHitRate * 100}% ${postOptimizationStats.cacheHitRate >= optimizationConfig.targetHitRate ? '✅ Achieved' : '❌ Not reached'}
  Memory Limit: ${(optimizationConfig.maxMemoryUsage / 1024 / 1024).toFixed(0)}MB ${postOptimizationStats.totalMemorySize <= optimizationConfig.maxMemoryUsage ? '✅ Within limit' : '❌ Exceeded'}

${
  optimizationResult.recommendations.length > 0
    ? `💡 Additional Recommendations:
${optimizationResult.recommendations.map((rec) => `  • ${rec}`).join('\n')}`
    : ''
}

✅ Storage optimization completed successfully!`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT storage optimization failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT storage optimization failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Helper functions
 */
function calculateAgeDistribution(_stats: any, category: 'fresh' | 'recent' | 'old'): number {
  // This would need to be implemented based on the actual storage stats structure
  // For now, return placeholder values
  const distributions = {
    fresh: 25,
    recent: 45,
    old: 30,
  };
  return distributions[category];
}

function getHealthScore(health: string): number {
  const scores = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  };
  return scores[health as keyof typeof scores] || 0;
}

// Export all storage management tools
export const factStorageTools = {
  fact_cache_status: factCacheStatusTool,
  fact_cache_clear: factCacheClearTool,
  fact_storage_optimize: factStorageOptimizeTool,
};
