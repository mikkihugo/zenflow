/**
 * @fileoverview Temporary stub for @claude-zen/intelligence/types
 *
 * This file provides fallback types for @claude-zen/intelligence/types submodule0.
 */

// Brain types stub
export interface BrainTaskResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface BrainCoordinationData {
  agentId?: string;
  taskId?: string;
  data?: any;
}

export interface NeuralProcessingResult {
  output?: any;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface BehavioralPattern {
  patternId: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AgentPerformanceData {
  agentId: string;
  metrics: Record<string, number>;
  timestamp: number;
}

// Re-export common types
export type {
  BrainTaskResult,
  BrainCoordinationData,
  NeuralProcessingResult,
  BehavioralPattern,
  AgentPerformanceData,
};
