/**
 * @fileoverview Neural Coordination Configuration
 * 
 * Configuration options for enabling/disabling DSPy neural coordination
 * at different hierarchy levels within THE COLLECTIVE.
 * 
 * This allows fine-grained control over where neural optimization is used:
 * - Keep the full hierarchy structure (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 * - But disable DSPy neural processing on higher levels if not needed
 * - Maintain strategic coordination without neural overhead
 */

export interface NeuralCoordinationConfig {
  /** Global DSPy neural coordination toggle */
  enabled: boolean;

  /** Per-hierarchy level DSPy configuration */
  hierarchyLevels: {
    /** THE COLLECTIVE neural hub - advanced collective intelligence */
    collective: {
      dspyEnabled: boolean;
      neuralPatterns: boolean;
      crossLevelLearning: boolean;
    };

    /** CUBES - Domain-specific neural optimization */
    cubes: {
      dspyEnabled: boolean;
      domainSpecificPatterns: boolean;
      crossDomainLearning: boolean;
    };

    /** MATRONS - Domain leadership neural coordination */
    matrons: {
      dspyEnabled: boolean;
      leadershipPatterns: boolean;
      strategicOptimization: boolean;
    };

    /** QUEENS - Strategic multi-swarm neural coordination */
    queens: {
      dspyEnabled: boolean;
      strategicPatterns: boolean;
      multiSwarmOptimization: boolean;
    };

    /** SWARMCOMMANDERS - Tactical neural coordination */
    swarmCommanders: {
      dspyEnabled: boolean;
      tacticalPatterns: boolean;
      taskOptimization: boolean;
    };

    /** AGENTS - Execution-level neural coordination */
    agents: {
      dspyEnabled: boolean;
      executionPatterns: boolean;
      performanceLearning: boolean;
    };
  };

  /** DSPy optimization settings */
  dspySettings: {
    /** Maximum optimization rounds per level */
    maxOptimizationRounds: {
      collective: number;
      cubes: number;
      matrons: number;
      queens: number;
      swarmCommanders: number;
      agents: number;
    };

    /** Learning rate adjustments per level */
    learningRates: {
      collective: number;
      cubes: number;
      matrons: number;
      queens: number;
      swarmCommanders: number;
      agents: number;
    };

    /** Cross-level pattern sharing */
    crossLevelSharing: {
      enabled: boolean;
      upwardPropagation: boolean;  // Agents → Queens → Cubes → Collective
      downwardPropagation: boolean; // Collective → Cubes → Queens → Agents
    };
  };

  /** Performance and resource limits */
  resourceLimits: {
    /** Max memory per hierarchy level (MB) */
    maxMemoryPerLevel: {
      collective: number;
      cubes: number;
      matrons: number;
      queens: number;
      swarmCommanders: number;
      agents: number;
    };

    /** Max concurrent neural operations per level */
    maxConcurrentOperations: {
      collective: number;
      cubes: number;
      matrons: number;
      queens: number;
      swarmCommanders: number;
      agents: number;
    };
  };
}

/**
 * Default configuration - Conservative approach
 * Enables DSPy only on execution levels (SwarmCommanders + Agents)
 * Strategic levels (Queens, Matrons, Cubes) focus on coordination without neural overhead
 */
export const DEFAULT_NEURAL_CONFIG: NeuralCoordinationConfig = {
  enabled: true,

  hierarchyLevels: {
    collective: {
      dspyEnabled: false,        // Keep strategic focus
      neuralPatterns: false,
      crossLevelLearning: true   // Still learn from lower levels
    },

    cubes: {
      dspyEnabled: false,        // Domain expertise without neural overhead
      domainSpecificPatterns: false,
      crossDomainLearning: true
    },

    matrons: {
      dspyEnabled: false,        // Leadership without neural processing
      leadershipPatterns: false,
      strategicOptimization: false
    },

    queens: {
      dspyEnabled: false,        // Strategic coordination without DSPy
      strategicPatterns: false,
      multiSwarmOptimization: false
    },

    swarmCommanders: {
      dspyEnabled: true,         // ✅ Tactical level gets DSPy
      tacticalPatterns: true,
      taskOptimization: true
    },

    agents: {
      dspyEnabled: true,         // ✅ Execution level gets DSPy
      executionPatterns: true,
      performanceLearning: true
    }
  },

  dspySettings: {
    maxOptimizationRounds: {
      collective: 0,             // No optimization
      cubes: 0,                  // No optimization
      matrons: 0,                // No optimization
      queens: 0,                 // No optimization
      swarmCommanders: 5,        // Moderate optimization
      agents: 10                 // Full optimization
    },

    learningRates: {
      collective: 0.0,
      cubes: 0.0,
      matrons: 0.0,
      queens: 0.0,
      swarmCommanders: 0.1,
      agents: 0.2
    },

    crossLevelSharing: {
      enabled: true,
      upwardPropagation: true,   // Learn from execution levels
      downwardPropagation: false // Don't push neural patterns down
    }
  },

  resourceLimits: {
    maxMemoryPerLevel: {
      collective: 512,           // Minimal memory
      cubes: 256,
      matrons: 256,
      queens: 512,
      swarmCommanders: 1024,     // More memory for DSPy
      agents: 2048               // Most memory for neural processing
    },

    maxConcurrentOperations: {
      collective: 1,
      cubes: 2,
      matrons: 2,
      queens: 5,
      swarmCommanders: 10,       // More concurrent DSPy operations
      agents: 20                 // Most concurrent operations
    }
  }
};

/**
 * Full neural configuration - Everything enabled
 * Use this if you want DSPy optimization at all hierarchy levels
 */
export const FULL_NEURAL_CONFIG: NeuralCoordinationConfig = {
  enabled: true,

  hierarchyLevels: {
    collective: {
      dspyEnabled: true,
      neuralPatterns: true,
      crossLevelLearning: true
    },

    cubes: {
      dspyEnabled: true,
      domainSpecificPatterns: true,
      crossDomainLearning: true
    },

    matrons: {
      dspyEnabled: true,
      leadershipPatterns: true,
      strategicOptimization: true
    },

    queens: {
      dspyEnabled: true,
      strategicPatterns: true,
      multiSwarmOptimization: true
    },

    swarmCommanders: {
      dspyEnabled: true,
      tacticalPatterns: true,
      taskOptimization: true
    },

    agents: {
      dspyEnabled: true,
      executionPatterns: true,
      performanceLearning: true
    }
  },

  dspySettings: {
    maxOptimizationRounds: {
      collective: 3,
      cubes: 5,
      matrons: 5,
      queens: 7,
      swarmCommanders: 10,
      agents: 15
    },

    learningRates: {
      collective: 0.05,
      cubes: 0.1,
      matrons: 0.1,
      queens: 0.15,
      swarmCommanders: 0.2,
      agents: 0.3
    },

    crossLevelSharing: {
      enabled: true,
      upwardPropagation: true,
      downwardPropagation: true
    }
  },

  resourceLimits: {
    maxMemoryPerLevel: {
      collective: 2048,
      cubes: 1024,
      matrons: 1024,
      queens: 1024,
      swarmCommanders: 2048,
      agents: 4096
    },

    maxConcurrentOperations: {
      collective: 5,
      cubes: 10,
      matrons: 10,
      queens: 15,
      swarmCommanders: 20,
      agents: 30
    }
  }
};

/**
 * Disabled neural configuration - No DSPy anywhere
 * Pure coordination without neural optimization
 */
export const NO_NEURAL_CONFIG: NeuralCoordinationConfig = {
  enabled: false,

  hierarchyLevels: {
    collective: {
      dspyEnabled: false,
      neuralPatterns: false,
      crossLevelLearning: false
    },

    cubes: {
      dspyEnabled: false,
      domainSpecificPatterns: false,
      crossDomainLearning: false
    },

    matrons: {
      dspyEnabled: false,
      leadershipPatterns: false,
      strategicOptimization: false
    },

    queens: {
      dspyEnabled: false,
      strategicPatterns: false,
      multiSwarmOptimization: false
    },

    swarmCommanders: {
      dspyEnabled: false,
      tacticalPatterns: false,
      taskOptimization: false
    },

    agents: {
      dspyEnabled: false,
      executionPatterns: false,
      performanceLearning: false
    }
  },

  dspySettings: {
    maxOptimizationRounds: {
      collective: 0,
      cubes: 0,
      matrons: 0,
      queens: 0,
      swarmCommanders: 0,
      agents: 0
    },

    learningRates: {
      collective: 0.0,
      cubes: 0.0,
      matrons: 0.0,
      queens: 0.0,
      swarmCommanders: 0.0,
      agents: 0.0
    },

    crossLevelSharing: {
      enabled: false,
      upwardPropagation: false,
      downwardPropagation: false
    }
  },

  resourceLimits: {
    maxMemoryPerLevel: {
      collective: 128,
      cubes: 128,
      matrons: 128,
      queens: 256,
      swarmCommanders: 512,
      agents: 512
    },

    maxConcurrentOperations: {
      collective: 1,
      cubes: 1,
      matrons: 1,
      queens: 2,
      swarmCommanders: 5,
      agents: 10
    }
  }
};

/**
 * Current active configuration
 * Change this to switch between different neural coordination modes
 */
export let ACTIVE_NEURAL_CONFIG: NeuralCoordinationConfig = DEFAULT_NEURAL_CONFIG;

/**
 * Update the active neural configuration
 * @param config New configuration to use
 */
export function setNeuralCoordinationConfig(config: NeuralCoordinationConfig): void {
  ACTIVE_NEURAL_CONFIG = config;
}

/**
 * Get the current neural configuration
 * @returns Current active configuration
 */
export function getNeuralCoordinationConfig(): NeuralCoordinationConfig {
  return ACTIVE_NEURAL_CONFIG;
}

/**
 * Check if DSPy is enabled for a specific hierarchy level
 * @param level Hierarchy level to check
 * @returns True if DSPy is enabled for that level
 */
export function isDSPyEnabledForLevel(level: keyof NeuralCoordinationConfig['hierarchyLevels']): boolean {
  return ACTIVE_NEURAL_CONFIG.enabled && ACTIVE_NEURAL_CONFIG.hierarchyLevels[level].dspyEnabled;
}

/**
 * Get resource limits for a specific hierarchy level
 * @param level Hierarchy level
 * @returns Resource limits for that level
 */
export function getResourceLimitsForLevel(level: keyof NeuralCoordinationConfig['hierarchyLevels']) {
  return {
    maxMemory: ACTIVE_NEURAL_CONFIG.resourceLimits.maxMemoryPerLevel[level],
    maxConcurrentOps: ACTIVE_NEURAL_CONFIG.resourceLimits.maxConcurrentOperations[level]
  };
}