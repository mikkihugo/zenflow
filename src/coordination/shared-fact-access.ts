/**
 * @file Universal FACT System Access Layer
 * Provides shared FACT access across ALL hierarchy levels.
 * 
 * CRITICAL DESIGN PRINCIPLE:
 * FACT system is SHARED like "manuals of the internet" - same access for ALL levels
 * (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 */

import { getLogger } from '../config/logging-config.ts';
import type { 
  CollectiveFACTSystem, 
  getCollectiveFACT, 
  initializeCollectiveFACT 
} from './collective-fact-integration.ts';

const logger = getLogger('Shared-FACT-Access');

/**
 * Universal FACT access interface for all hierarchy levels.
 * This ensures consistent access patterns across the entire system.
 */
export interface UniversalFACTAccess {
  /**
   * Get shared FACT system instance.
   * Same instance returned for all hierarchy levels.
   */
  getSharedFACT(): Promise<CollectiveFACTSystem>;
  
  /**
   * Verify universal access permissions.
   * All levels have same permissions.
   */
  verifyUniversalAccess(): Promise<boolean>;
  
  /**
   * Get FACT system statistics.
   */
  getSharedStats(): Promise<unknown>;
}

/**
 * Shared FACT Access Manager.
 * Ensures all hierarchy levels use the same CollectiveFACTSystem instance.
 */
export class SharedFACTAccessManager implements UniversalFACTAccess {
  private static instance: SharedFACTAccessManager | null = null;
  private sharedFactSystem: CollectiveFACTSystem | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of SharedFACTAccessManager.
   * Ensures single point of access management.
   */
  public static getInstance(): SharedFACTAccessManager {
    if (!SharedFACTAccessManager.instance) {
      SharedFACTAccessManager.instance = new SharedFACTAccessManager();
    }
    return SharedFACTAccessManager.instance;
  }

  /**
   * Initialize shared FACT system for universal access.
   */
  public async initialize(): Promise<void> {
    if (this.sharedFactSystem) {
      logger.debug('Shared FACT system already initialized');
      return;
    }

    try {
      logger.info('Initializing shared FACT system for universal hierarchy access');
      
      // Import dynamically to avoid circular dependencies
      const { getCollectiveFACT, initializeCollectiveFACT } = await import('./collective-fact-integration.ts');
      
      let sharedFact = getCollectiveFACT();
      
      if (!sharedFact) {
        // Initialize the shared FACT system once for all hierarchy levels
        sharedFact = await initializeCollectiveFACT({
          enableCache: true,
          cacheSize: 100000, // Large cache for universal access
          knowledgeSources: [
            'context7', 
            'deepwiki', 
            'gitmcp', 
            'semgrep', 
            'rust-fact-core',
            'collective-memory'
          ],
          autoRefreshInterval: 1800000, // 30 minutes
        });
      }
      
      this.sharedFactSystem = sharedFact;
      
      logger.info('✅ Shared FACT system initialized for universal hierarchy access');
    } catch (error) {
      logger.error('Failed to initialize shared FACT system:', error);
      throw error;
    }
  }

  /**
   * Get shared FACT system instance.
   * Returns the same instance for ALL hierarchy levels.
   */
  public async getSharedFACT(): Promise<CollectiveFACTSystem> {
    if (!this.sharedFactSystem) {
      await this.initialize();
    }
    
    if (!this.sharedFactSystem) {
      throw new Error('Failed to initialize shared FACT system');
    }
    
    return this.sharedFactSystem;
  }

  /**
   * Verify universal access permissions.
   * All hierarchy levels have the same permissions.
   */
  public async verifyUniversalAccess(): Promise<boolean> {
    try {
      const factSystem = await this.getSharedFACT();
      
      // Test basic FACT operations to verify access
      const testResult = await factSystem.searchFacts({
        query: 'test-universal-access',
        limit: 1,
      });
      
      // If we can search, we have access
      return Array.isArray(testResult);
    } catch (error) {
      logger.error('Universal FACT access verification failed:', error);
      return false;
    }
  }

  /**
   * Get FACT system statistics.
   * Same stats available to all hierarchy levels.
   */
  public async getSharedStats(): Promise<unknown> {
    try {
      const factSystem = await this.getSharedFACT();
      return await factSystem.getStats();
    } catch (error) {
      logger.error('Failed to get shared FACT stats:', error);
      return {
        error: 'Stats unavailable',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Convenience function for any hierarchy level to access shared FACT system.
 * 
 * @param hierarchyLevel - For logging purposes (Cube, Matron, Queen, SwarmCommander, Agent)
 * @returns Promise resolving to shared CollectiveFACTSystem
 */
export async function getUniversalFACTAccess(
  hierarchyLevel: 'Cube' | 'Matron' | 'Queen' | 'SwarmCommander' | 'Agent' = 'Agent'
): Promise<CollectiveFACTSystem> {
  logger.debug(`${hierarchyLevel} requesting universal FACT access`);
  
  const manager = SharedFACTAccessManager.getInstance();
  const factSystem = await manager.getSharedFACT();
  
  logger.debug(`✅ ${hierarchyLevel} granted universal FACT access`);
  return factSystem;
}

/**
 * Verify that all hierarchy levels can access the shared FACT system.
 * Used for system health checks and validation.
 */
export async function validateUniversalFACTAccess(): Promise<{
  success: boolean;
  accessLevels: Record<string, boolean>;
  error?: string;
}> {
  const hierarchyLevels = ['Cube', 'Matron', 'Queen', 'SwarmCommander', 'Agent'] as const;
  const accessLevels: Record<string, boolean> = {};
  
  try {
    logger.info('Validating universal FACT access across all hierarchy levels');
    
    for (const level of hierarchyLevels) {
      try {
        const factSystem = await getUniversalFACTAccess(level);
        
        // Test that the system can perform basic operations
        const testSearch = await factSystem.searchFacts({
          query: `test-${level.toLowerCase()}-access`,
          limit: 1,
        });
        
        accessLevels[level] = Array.isArray(testSearch);
        logger.debug(`✅ ${level} universal FACT access: VALIDATED`);
      } catch (error) {
        accessLevels[level] = false;
        logger.error(`❌ ${level} universal FACT access: FAILED`, error);
      }
    }
    
    const allAccessible = Object.values(accessLevels).every(accessible => accessible);
    
    if (allAccessible) {
      logger.info('✅ Universal FACT access validated for all hierarchy levels');
    } else {
      logger.warn('❌ Universal FACT access validation failed for some hierarchy levels');
    }
    
    return {
      success: allAccessible,
      accessLevels,
    };
  } catch (error) {
    logger.error('Universal FACT access validation encountered an error:', error);
    return {
      success: false,
      accessLevels,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Initialize universal FACT access for the entire system.
 * Should be called during system startup.
 */
export async function initializeUniversalFACTAccess(): Promise<void> {
  logger.info('🚀 Initializing universal FACT access system');
  
  try {
    const manager = SharedFACTAccessManager.getInstance();
    await manager.initialize();
    
    // Validate that all levels can access the system
    const validation = await validateUniversalFACTAccess();
    
    if (!validation.success) {
      throw new Error(`Universal FACT access validation failed: ${JSON.stringify(validation.accessLevels)}`);
    }
    
    logger.info('✅ Universal FACT access system initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize universal FACT access system:', error);
    throw error;
  }
}

export default SharedFACTAccessManager;