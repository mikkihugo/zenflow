/**
 * Memory Configuration for Cognitive Patterns
 * 
 * Centralized memory configuration to avoid circular dependencies
 * and provide optimized memory settings for different cognitive patterns.
 */

export interface PatternMemoryConfig {
  baseMemory: number;      // Base memory allocation in MB
  poolSharing: number;     // Percentage of shared memory (0.0-1.0)
  lazyLoading: boolean;    // Enable lazy loading for memory optimization
}

export interface MemoryConfigOptions {
  convergent: PatternMemoryConfig;
  divergent: PatternMemoryConfig;
  lateral: PatternMemoryConfig;
  systems: PatternMemoryConfig;
  critical: PatternMemoryConfig;
  abstract: PatternMemoryConfig;
}

/**
 * Optimized memory configuration for cognitive patterns
 * Memory allocations reduced from original values with enhanced sharing
 */
export const PATTERN_MEMORY_CONFIG: MemoryConfigOptions = {
  convergent: {
    baseMemory: 250,        // Reduced from 291 MB
    poolSharing: 0.8,       // 80% shared memory
    lazyLoading: true,
  },
  divergent: {
    baseMemory: 280,        // Reduced from 473 MB
    poolSharing: 0.7,       // 70% shared memory
    lazyLoading: true,
  },
  lateral: {
    baseMemory: 300,        // Reduced from 557 MB
    poolSharing: 0.65,      // 65% shared memory
    lazyLoading: true,
  },
  systems: {
    baseMemory: 270,
    poolSharing: 0.75,
    lazyLoading: true,
  },
  critical: {
    baseMemory: 260,
    poolSharing: 0.75,
    lazyLoading: true,
  },
  abstract: {
    baseMemory: 265,
    poolSharing: 0.75,
    lazyLoading: true,
  },
};

/**
 * Get memory configuration for a specific cognitive pattern
 */
export function getPatternMemoryConfig(pattern: keyof MemoryConfigOptions): PatternMemoryConfig {
  return PATTERN_MEMORY_CONFIG[pattern];
}

/**
 * Calculate total memory usage for all patterns
 */
export function calculateTotalMemoryUsage(): number {
  return Object.values(PATTERN_MEMORY_CONFIG).reduce(
    (total, config) => total + config.baseMemory * (1 - config.poolSharing),
    0
  );
}

/**
 * Get shared memory pool size
 */
export function getSharedMemoryPoolSize(): number {
  return Object.values(PATTERN_MEMORY_CONFIG).reduce(
    (total, config) => total + config.baseMemory * config.poolSharing,
    0
  );
}

/**
 * Memory configuration utilities
 */
export const MemoryConfigUtils = {
  /**
   * Validate memory configuration
   */
  validate(config: Partial<MemoryConfigOptions>): boolean {
    for (const [pattern, patternConfig] of Object.entries(config)) {
      if (!patternConfig || typeof patternConfig !== 'object') {
        return false;
      }
      
      const { baseMemory, poolSharing, lazyLoading } = patternConfig;
      
      if (typeof baseMemory !== 'number' || baseMemory <= 0) {
        return false;
      }
      
      if (typeof poolSharing !== 'number' || poolSharing < 0 || poolSharing > 1) {
        return false;
      }
      
      if (typeof lazyLoading !== 'boolean') {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Merge configurations with defaults
   */
  merge(customConfig: Partial<MemoryConfigOptions>): MemoryConfigOptions {
    return {
      ...PATTERN_MEMORY_CONFIG,
      ...customConfig,
    };
  },

  /**
   * Optimize configuration based on system resources
   */
  optimize(availableMemoryMB: number): MemoryConfigOptions {
    const totalRequired = calculateTotalMemoryUsage();
    const scaleFactor = Math.min(1.0, availableMemoryMB * 0.8 / totalRequired);
    
    const optimized: MemoryConfigOptions = {} as MemoryConfigOptions;
    
    for (const [pattern, config] of Object.entries(PATTERN_MEMORY_CONFIG)) {
      optimized[pattern as keyof MemoryConfigOptions] = {
        ...config,
        baseMemory: Math.floor(config.baseMemory * scaleFactor),
      };
    }
    
    return optimized;
  },
};

export default PATTERN_MEMORY_CONFIG;