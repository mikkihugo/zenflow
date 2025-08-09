/**
 * @file Shared types for TUI components
 *
 * This file contains all shared types to avoid circular dependencies.
 */

export interface DiscoveryState {
  phase: 'analyzing' | 'reviewing' | 'configuring' | 'deploying' | 'completed' | 'error';
  progress: {
    current: number;
    total: number;
    message: string;
  };
  domains: DiscoveredDomain[];
  selectedDomains: Set<string>;
  swarmConfigs: Map<string, SwarmConfig>;
  deploymentStatus: Map<string, DeploymentStatus>;
  error?: string;
}

export interface DiscoveredDomain {
  name: string;
  path: string;
  confidence: number;
  files: number;
  concepts: string[];
  technologies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high' | 'extreme';
  suggestedTopology: 'mesh' | 'hierarchical' | 'star' | 'ring';
  estimatedAgents: number;
}

export interface SwarmConfig {
  topology: 'mesh' | 'hierarchical' | 'star' | 'ring';
  maxAgents: number;
  autoScaling: boolean;
  persistence: boolean;
  resourceLimits: {
    memory: string;
    cpu: number;
  };
}

export interface DeploymentStatus {
  status: 'pending' | 'deploying' | 'success' | 'failed';
  message: string;
  progress?: number;
  agents: {
    created: number;
    total: number;
  };
  error?: string;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  width?: number;
  character?: string;
  backgroundCharacter?: string;
}
