/**
 * @fileoverview Language Model Interface Definitions
 * 
 * Core interfaces for language model integration in the DSPy ecosystem.
 * Provides standardized interfaces for model interaction, fine-tuning,
 * and lifecycle management.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

/**
 * Language Model Interface
 * 
 * Standardized interface for interacting with language models in DSPy.
 * Supports both inference and training operations.
 */
export interface LMInterface {
  /** Model identifier/name */
  model: string;
  
  /** Cache configuration */
  cache?: boolean;
  
  /**
   * Forward pass through the model
   * @param inputs - Input data for the model
   * @returns Model prediction/response
   */
  forward(inputs: Record<string, any>): Promise<any>;
  
  /**
   * Fine-tune the model with training data
   * @param options - Fine-tuning configuration
   * @returns Promise resolving to fine-tuned model instance
   */
  finetune(options: FinetuneOptions): Promise<LMInterface>;
  
  /**
   * Reinforcement learning training method
   * @param options - RL training configuration
   * @returns Promise resolving to trained model instance
   */
  reinforce?(options: ReinforcementOptions): Promise<LMInterface>;
  
  /**
   * Kill/terminate the model process
   * Used for resource cleanup before fine-tuning
   */
  kill?(): Promise<void>;
  
  /**
   * Launch/initialize the model
   * Used for model startup and resource allocation
   */
  launch?(): Promise<void>;
}

/**
 * Fine-tuning configuration options
 */
export interface FinetuneOptions {
  /** Training data */
  train_data: any[];
  
  /** Data format specification */
  train_data_format?: string;
  
  /** Learning rate */
  learning_rate?: number;
  
  /** Batch size */
  batch_size?: number;
  
  /** Number of training epochs */
  epochs?: number;
  
  /** Additional training parameters */
  [key: string]: any;
}

/**
 * Reinforcement learning training options
 */
export interface ReinforcementOptions {
  /** Training configuration parameters */
  train_kwargs?: Record<string, any>;
  
  /** Number of generations for GRPO */
  num_generations?: number;
  
  /** Additional RL parameters */
  [key: string]: any;
}

/**
 * Model response/prediction interface
 */
export interface ModelResponse {
  /** Primary response content */
  content: any;
  
  /** Raw model response */
  raw_response?: string;
  
  /** Response metadata */
  metadata?: Record<string, any>;
  
  /** Token usage information */
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}