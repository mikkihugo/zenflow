/**
 * @file Hierarchy FACT Validation System
 * Validates that all hierarchy levels have proper shared FACT access.
 * 
 * This system ensures the SHARED FACT principle is maintained:
 * ALL hierarchy levels (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 * use the SAME CollectiveFACTSystem instance.
 */

import { getLogger } from '../config/logging-config.ts';
import { validateUniversalFACTAccess, getUniversalFACTAccess } from './shared-fact-access.ts';
import { getDSPySharedFACTSystem } from './shared-fact-integration.ts';

const logger = getLogger('Hierarchy-FACT-Validation');

/**
 * Validation result for a hierarchy level.
 */
export interface HierarchyLevelValidation {
  level: string;
  hasAccess: boolean;
  canSearch: boolean;
  canStore: boolean;
  sharedInstance: boolean;
  dspyIntegration: boolean;
  error?: string;
  performance: {
    searchTime: number;
    storeTime: number;
  };
}

/**
 * Overall system validation result.
 */
export interface SystemValidationResult {
  success: boolean;
  timestamp: number;
  hierarchyLevels: HierarchyLevelValidation[];
  sharedFACTSystemActive: boolean;
  dspyIntegrationActive: boolean;
  universalAccessValidated: boolean;
  performanceMetrics: {
    averageSearchTime: number;
    averageStoreTime: number;
    totalValidationTime: number;
  };
  recommendations: string[];
  criticalIssues: string[];
}

/**
 * Comprehensive hierarchy FACT validation system.
 */
export class HierarchyFACTValidator {
  /**
   * Run complete validation of shared FACT system across all hierarchy levels.
   */
  public async validateCompleteHierarchy(): Promise<SystemValidationResult> {
    const startTime = Date.now();
    logger.info('🔍 Starting comprehensive hierarchy FACT system validation');

    const result: SystemValidationResult = {
      success: false,
      timestamp: startTime,
      hierarchyLevels: [],
      sharedFACTSystemActive: false,
      dspyIntegrationActive: false,
      universalAccessValidated: false,
      performanceMetrics: {
        averageSearchTime: 0,
        averageStoreTime: 0,
        totalValidationTime: 0,
      },
      recommendations: [],
      criticalIssues: [],
    };

    try {
      // 1. Validate universal access across all levels
      logger.info('🔍 Step 1: Validating universal FACT access');
      const universalValidation = await validateUniversalFACTAccess();
      result.universalAccessValidated = universalValidation.success;

      if (!universalValidation.success) {
        result.criticalIssues.push('Universal FACT access validation failed');
      }

      // 2. Test each hierarchy level individually
      logger.info('🔍 Step 2: Testing individual hierarchy levels');
      const hierarchyLevels = ['Cube', 'Matron', 'Queen', 'SwarmCommander', 'Agent'] as const;
      
      for (const level of hierarchyLevels) {
        const levelValidation = await this.validateHierarchyLevel(level);
        result.hierarchyLevels.push(levelValidation);
      }

      // 3. Validate DSPy integration
      logger.info('🔍 Step 3: Validating DSPy integration');
      result.dspyIntegrationActive = await this.validateDSPyIntegration();

      // 4. Check shared FACT system status
      logger.info('🔍 Step 4: Validating shared FACT system status');
      result.sharedFACTSystemActive = await this.validateSharedFACTSystem();

      // 5. Calculate performance metrics
      const searchTimes = result.hierarchyLevels.map(l => l.performance.searchTime);
      const storeTimes = result.hierarchyLevels.map(l => l.performance.storeTime);
      
      result.performanceMetrics = {
        averageSearchTime: searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length,
        averageStoreTime: storeTimes.reduce((a, b) => a + b, 0) / storeTimes.length,
        totalValidationTime: Date.now() - startTime,
      };

      // 6. Generate recommendations
      result.recommendations = this.generateRecommendations(result);

      // 7. Determine overall success
      const allLevelsWorking = result.hierarchyLevels.every(l => l.hasAccess && l.sharedInstance);
      result.success = allLevelsWorking && result.universalAccessValidated && result.sharedFACTSystemActive;

      if (result.success) {
        logger.info('✅ Hierarchy FACT validation completed successfully');
      } else {
        logger.warn('❌ Hierarchy FACT validation found issues');
      }

      return result;
    } catch (error) {
      logger.error('❌ Hierarchy FACT validation failed with error:', error);
      
      result.criticalIssues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.performanceMetrics.totalValidationTime = Date.now() - startTime;
      
      return result;
    }
  }

  /**
   * Validate FACT access for a specific hierarchy level.
   */
  private async validateHierarchyLevel(
    level: 'Cube' | 'Matron' | 'Queen' | 'SwarmCommander' | 'Agent'
  ): Promise<HierarchyLevelValidation> {
    logger.debug(`🔍 Validating ${level} FACT access`);

    const validation: HierarchyLevelValidation = {
      level,
      hasAccess: false,
      canSearch: false,
      canStore: false,
      sharedInstance: false,
      dspyIntegration: false,
      performance: {
        searchTime: 0,
        storeTime: 0,
      },
    };

    try {
      // Test basic access
      const startAccess = Date.now();
      const factSystem = await getUniversalFACTAccess(level);
      validation.hasAccess = !!factSystem;

      if (!factSystem) {
        validation.error = 'Failed to get FACT system access';
        return validation;
      }

      // Test search capability
      const startSearch = Date.now();
      try {
        const searchResults = await factSystem.searchFacts({
          query: `test-${level.toLowerCase()}-search`,
          limit: 1,
        });
        validation.canSearch = Array.isArray(searchResults);
        validation.performance.searchTime = Date.now() - startSearch;
      } catch (searchError) {
        validation.error = `Search failed: ${searchError instanceof Error ? searchError.message : 'Unknown error'}`;
      }

      // Test storage capability
      const startStore = Date.now();
      try {
        const testFact = {
          id: `test-${level.toLowerCase()}-${Date.now()}`,
          type: 'general' as const,
          category: 'test',
          subject: `test-fact-${level}`,
          content: { test: true, level },
          source: `${level}-validation`,
          confidence: 0.9,
          timestamp: Date.now(),
          metadata: {
            source: `${level}-validation`,
            timestamp: Date.now(),
            confidence: 0.9,
            testFact: true,
          },
          accessCount: 0,
          cubeAccess: new Set<string>(),
          swarmAccess: new Set<string>(),
        };

        await factSystem.storeFact(testFact);
        validation.canStore = true;
        validation.performance.storeTime = Date.now() - startStore;
      } catch (storeError) {
        validation.error = `Storage failed: ${storeError instanceof Error ? storeError.message : 'Unknown error'}`;
      }

      // Check if using shared instance (same reference)
      try {
        const otherLevelAccess = await getUniversalFACTAccess('Agent');
        validation.sharedInstance = factSystem === otherLevelAccess;
      } catch {
        validation.sharedInstance = false;
      }

      // Check DSPy integration
      try {
        const dspySystem = getDSPySharedFACTSystem();
        validation.dspyIntegration = !!dspySystem;
      } catch {
        validation.dspyIntegration = false;
      }

      logger.debug(`✅ ${level} validation completed: ${validation.hasAccess ? 'SUCCESS' : 'FAILED'}`);
      return validation;
    } catch (error) {
      validation.error = error instanceof Error ? error.message : 'Unknown validation error';
      logger.error(`❌ ${level} validation failed:`, error);
      return validation;
    }
  }

  /**
   * Validate DSPy integration status.
   */
  private async validateDSPyIntegration(): Promise<boolean> {
    try {
      const dspySystem = getDSPySharedFACTSystem();
      
      // Test DSPy functionality
      await dspySystem.learnFromFactAccess('test-integration', 'System', true);
      
      return true;
    } catch (error) {
      logger.warn('DSPy integration validation failed:', error);
      return false;
    }
  }

  /**
   * Validate shared FACT system status.
   */
  private async validateSharedFACTSystem(): Promise<boolean> {
    try {
      // Test that all levels get the same instance
      const levels = ['Cube', 'Matron', 'Queen', 'SwarmCommander', 'Agent'] as const;
      const instances = await Promise.all(
        levels.map(level => getUniversalFACTAccess(level))
      );

      // Check if all instances are the same reference
      const firstInstance = instances[0];
      return instances.every(instance => instance === firstInstance);
    } catch (error) {
      logger.error('Shared FACT system validation failed:', error);
      return false;
    }
  }

  /**
   * Generate recommendations based on validation results.
   */
  private generateRecommendations(result: SystemValidationResult): string[] {
    const recommendations: string[] = [];

    if (!result.universalAccessValidated) {
      recommendations.push('Initialize universal FACT access system during startup');
    }

    if (!result.sharedFACTSystemActive) {
      recommendations.push('Ensure shared FACT system is properly initialized before hierarchy access');
    }

    if (!result.dspyIntegrationActive) {
      recommendations.push('Consider enabling DSPy integration for intelligent FACT operations');
    }

    const failedLevels = result.hierarchyLevels.filter(l => !l.hasAccess);
    if (failedLevels.length > 0) {
      recommendations.push(`Fix FACT access for hierarchy levels: ${failedLevels.map(l => l.level).join(', ')}`);
    }

    const slowLevels = result.hierarchyLevels.filter(l => l.performance.searchTime > 1000);
    if (slowLevels.length > 0) {
      recommendations.push(`Optimize FACT search performance for: ${slowLevels.map(l => l.level).join(', ')}`);
    }

    const sharedInstanceIssues = result.hierarchyLevels.filter(l => !l.sharedInstance);
    if (sharedInstanceIssues.length > 0) {
      recommendations.push('Critical: Fix shared instance access - levels using different FACT instances');
    }

    if (result.performanceMetrics.averageSearchTime > 500) {
      recommendations.push('Consider enabling FACT caching to improve search performance');
    }

    return recommendations;
  }
}

/**
 * Run quick validation of shared FACT system.
 * Useful for health checks and monitoring.
 */
export async function quickValidateSharedFACT(): Promise<{
  healthy: boolean;
  issues: string[];
  timestamp: number;
}> {
  const startTime = Date.now();
  const issues: string[] = [];

  try {
    // Quick universal access check
    const universalValidation = await validateUniversalFACTAccess();
    if (!universalValidation.success) {
      issues.push('Universal FACT access failed');
    }

    // Check that SwarmCommander can access FACT system
    try {
      const swarmAccess = await getUniversalFACTAccess('SwarmCommander');
      await swarmAccess.searchFacts({ query: 'health-check', limit: 1 });
    } catch (error) {
      issues.push('SwarmCommander FACT access failed');
    }

    return {
      healthy: issues.length === 0,
      issues,
      timestamp: Date.now() - startTime,
    };
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      healthy: false,
      issues,
      timestamp: Date.now() - startTime,
    };
  }
}

/**
 * Global validator instance.
 */
export const hierarchyFACTValidator = new HierarchyFACTValidator();

export default HierarchyFACTValidator;