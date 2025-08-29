/**
 * @fileoverview Graph Neural Network (GNN) Preset for Domain Relationship Analysis
 * 
 * Provides pre-configured GNN model settings optimized for domain boundary detection,
 * dependency graph analysis, and cross-domain coupling strength calculation.
 * 
 * This implements the GNN functionality referenced in:
 * - docs/TODO.md: Step 3 GNN Integration for Domain Relationships
 * - docs/archive/CODE_ANALYSIS_STATUS_REPORT.md: Neural Domain Mapper features
 */

// Default GNN configuration for domain relationship analysis
export const gnnDomainPreset = {
  id: 'gnn-domain-relationships',
  name: 'Graph Neural Network for Domain Relationships',
  description: 'Specialized GNN configuration for analyzing code domain relationships and boundaries',
  type: 'graph',
  architecture: 'gnn',
  
  // Network architecture
  layers: [64, 32, 16], // Input -> Hidden -> Output dimensions
  activation: 'relu',
  outputActivation: 'sigmoid',
  dropout: 0.2,
  
  // Training parameters
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  patience: 10, // Early stopping
  
  // Domain-specific parameters
  nodeFeatureDim: 5, // [fileCount, depCount, complexity, depth, connectivity]
  edgeFeatureDim: 2, // [weight, type_encoded]
  maxNodes: 100,     // Maximum domains per graph
  
  // Use cases
  useCase: [
    'domain_boundary_detection',
    'dependency_analysis', 
    'coupling_strength_calculation',
    'topology_recommendation',
    'architecture_optimization'
  ],
  
  // Model-specific configuration
  gnnConfig: {
    messagePassingSteps: 3,
    aggregationFunction: 'mean', // 'mean', 'max', 'sum'
    residualConnections: true,
    batchNormalization: true,
    selfLoops: true,
    
    // Attention mechanism (optional)
    useAttention: true,
    attentionHeads: 4,
    
    // Graph pooling for graph-level predictions
    poolingMethod: 'global_mean', // 'global_mean', 'global_max', 'hierarchical'
    
    // Domain-specific features
    domainEmbeddingDim: 16,
    relationshipTypes: ['dependency', 'coupling', 'cohesion', 'boundary'],
    confidenceThreshold: 0.3,
    
    // Performance optimization
    enableGradientClipping: true,
    gradientClipValue: 1.0,
    useSpectralNormalization: false
  },
  
  // Output interpretation
  outputs: {
    nodeClassification: {
      classes: ['core', 'service', 'utility', 'interface', 'test'],
      threshold: 0.5
    },
    edgePrediction: {
      relationshipStrength: 'continuous', // 0.0 - 1.0
      relationshipType: 'categorical',
      bidirectional: true
    },
    graphProperties: {
      cohesionScore: 'regression',
      couplingMatrix: 'symmetric',
      topologyScore: {
        mesh: 'score',
        hierarchical: 'score', 
        ring: 'score',
        star: 'score'
      }
    }
  },
  
  // Preprocessing configuration
  preprocessing: {
    nodeFeatureNormalization: 'standard', // 'standard', 'minmax', 'robust'
    edgeWeightNormalization: 'minmax',
    graphAugmentation: {
      enabled: true,
      dropNodeProb: 0.1,
      dropEdgeProb: 0.1,
      addNoiseStd: 0.01
    }
  },
  
  // Postprocessing and interpretation
  postprocessing: {
    smoothingKernel: 'gaussian',
    confidenceCalibration: true,
    ensembleVoting: false, // Can be enabled for production
    uncertaintyQuantification: true
  },
  
  // Performance targets
  performance: {
    targetAccuracy: 0.85,
    maxInferenceTimeMs: 100,
    maxMemoryMB: 256,
    cpuFallbackTimeout: 1000
  },
  
  // Monitoring and debugging
  monitoring: {
    logLevel: 'info',
    trackGradients: false,
    visualizeAttention: false,
    saveIntermediateResults: false
  }
};

// Legacy format compatibility (referenced in TODO.md as gnn.js)
export const gnn = gnnDomainPreset;

// Additional specialized presets for different analysis types
export const gnnPresets = {
  // Fast analysis for CI/CD pipelines
  fast: {
    ...gnnDomainPreset,
    id: 'gnn-fast',
    name: 'Fast GNN for CI/CD',
    layers: [32, 16],
    epochs: 50,
    gnnConfig: {
      ...gnnDomainPreset.gnnConfig,
      messagePassingSteps: 2,
      useAttention: false
    },
    performance: {
      targetAccuracy: 0.75,
      maxInferenceTimeMs: 50,
      maxMemoryMB: 128,
      cpuFallbackTimeout: 500
    }
  },
  
  // High accuracy for detailed analysis
  accurate: {
    ...gnnDomainPreset,
    id: 'gnn-accurate',
    name: 'High Accuracy GNN',
    layers: [128, 64, 32, 16],
    epochs: 200,
    gnnConfig: {
      ...gnnDomainPreset.gnnConfig,
      messagePassingSteps: 5,
      attentionHeads: 8,
      useSpectralNormalization: true
    },
    performance: {
      targetAccuracy: 0.92,
      maxInferenceTimeMs: 500,
      maxMemoryMB: 512,
      cpuFallbackTimeout: 2000
    }
  },
  
  // Large-scale analysis for enterprise codebases
  scalable: {
    ...gnnDomainPreset,
    id: 'gnn-scalable',
    name: 'Scalable GNN for Large Codebases',
    maxNodes: 500,
    batchSize: 64,
    gnnConfig: {
      ...gnnDomainPreset.gnnConfig,
      messagePassingSteps: 3,
      poolingMethod: 'hierarchical',
      useAttention: true,
      attentionHeads: 6
    },
    performance: {
      targetAccuracy: 0.80,
      maxInferenceTimeMs: 1000,
      maxMemoryMB: 1024,
      cpuFallbackTimeout: 3000
    }
  }
};

// Factory function to create GNN model configuration
export function createGNNConfig(preset = 'default', overrides = {}) {
  const baseConfig = preset === 'fast' ? gnnPresets.fast :
                    preset === 'accurate' ? gnnPresets.accurate :
                    preset === 'scalable' ? gnnPresets.scalable :
                    gnnDomainPreset;
  
  return {
    ...baseConfig,
    ...overrides,
    gnnConfig: {
      ...baseConfig.gnnConfig,
      ...(overrides.gnnConfig || {})
    }
  };
}

// Validation function for GNN configuration
export function validateGNNConfig(config) {
  const errors = [];
  
  if (!config.layers || !Array.isArray(config.layers) || config.layers.length < 2) {
    errors.push('GNN must have at least 2 layers');
  }
  
  if (config.learningRate <= 0 || config.learningRate > 1) {
    errors.push('Learning rate must be between 0 and 1');
  }
  
  if (config.gnnConfig.messagePassingSteps < 1 || config.gnnConfig.messagePassingSteps > 10) {
    errors.push('Message passing steps must be between 1 and 10');
  }
  
  if (config.nodeFeatureDim < 1) {
    errors.push('Node feature dimension must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  gnnDomainPreset,
  gnn,
  gnnPresets,
  createGNNConfig,
  validateGNNConfig
};