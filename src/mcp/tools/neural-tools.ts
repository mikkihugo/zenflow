/**
 * @fileoverview Neural MCP Tools
 * MCP tools for neural network operations
 */

import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { NeuralBridge, type NeuralConfig, type TrainingData } from '../../neural/neural-bridge';
import { createLogger } from '../../utils/logger';

const logger = createLogger({ prefix: 'MCP-Neural' });

export interface NeuralCreateParams {
  networkId: string;
  type: 'feedforward' | 'lstm' | 'transformer' | 'autoencoder';
  layers: number[];
}

export interface NeuralTrainParams {
  networkId: string;
  trainingData: {
    inputs: number[][];
    outputs: number[][];
  };
  epochs?: number;
}

export interface NeuralPredictParams {
  networkId: string;
  inputs: number[];
}

/**
 * Create neural network
 */
export const neuralCreateTool: MCPTool = {
  name: 'neural_create',
  description: 'Create a new neural network for swarm intelligence',
  inputSchema: {
    type: 'object',
    properties: {
      networkId: {
        type: 'string',
        description: 'Unique identifier for the neural network'
      },
      type: {
        type: 'string',
        enum: ['feedforward', 'lstm', 'transformer', 'autoencoder'],
        description: 'Type of neural network architecture'
      },
      layers: {
        type: 'array',
        items: { type: 'number' },
        description: 'Array defining layer sizes (e.g., [784, 128, 64, 10])'
      }
    },
    required: ['networkId', 'type', 'layers']
  },
  handler: async (params: NeuralCreateParams): Promise<MCPToolResult> => {
    try {
      logger.info('Creating neural network:', params);
      
      const neuralBridge = NeuralBridge.getInstance();
      const networkId = await neuralBridge.createNetwork(
        params.networkId,
        params.type,
        params.layers
      );
      
      logger.info(`Neural network created: ${networkId}`);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🧠 Neural network created successfully!

Network ID: ${networkId}
Type: ${params.type}
Architecture: ${params.layers.join(' → ')} neurons
Status: Ready for training

The neural network is now available for training and predictions.`
        }]
      };
    } catch (error) {
      logger.error('Neural network creation failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Neural network creation failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Train neural network
 */
export const neuralTrainTool: MCPTool = {
  name: 'neural_train',
  description: 'Train a neural network with provided data',
  inputSchema: {
    type: 'object',
    properties: {
      networkId: {
        type: 'string',
        description: 'ID of the neural network to train'
      },
      trainingData: {
        type: 'object',
        properties: {
          inputs: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' }
            },
            description: 'Training input data'
          },
          outputs: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' }
            },
            description: 'Training output data'
          }
        },
        required: ['inputs', 'outputs']
      },
      epochs: {
        type: 'number',
        description: 'Number of training epochs',
        default: 1000
      }
    },
    required: ['networkId', 'trainingData']
  },
  handler: async (params: NeuralTrainParams): Promise<MCPToolResult> => {
    try {
      logger.info('Training neural network:', { networkId: params.networkId, epochs: params.epochs });
      
      const neuralBridge = NeuralBridge.getInstance();
      const success = await neuralBridge.trainNetwork(
        params.networkId,
        params.trainingData,
        params.epochs || 1000
      );
      
      if (success) {
        logger.info(`Neural network training completed: ${params.networkId}`);
        
        return {
          success: true,
          content: [{
            type: 'text',
            text: `🎯 Neural network training completed!

Network ID: ${params.networkId}
Training Samples: ${params.trainingData.inputs.length}
Epochs: ${params.epochs || 1000}
Status: Training successful

The neural network is now ready for predictions.`
          }]
        };
      } else {
        return {
          success: false,
          content: [{
            type: 'text',
            text: `❌ Neural network training failed for ${params.networkId}`
          }]
        };
      }
    } catch (error) {
      logger.error('Neural network training failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Neural network training failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Make prediction with neural network
 */
export const neuralPredictTool: MCPTool = {
  name: 'neural_predict',
  description: 'Make predictions using a trained neural network',
  inputSchema: {
    type: 'object',
    properties: {
      networkId: {
        type: 'string',
        description: 'ID of the neural network to use for prediction'
      },
      inputs: {
        type: 'array',
        items: { type: 'number' },
        description: 'Input data for prediction'
      }
    },
    required: ['networkId', 'inputs']
  },
  handler: async (params: NeuralPredictParams): Promise<MCPToolResult> => {
    try {
      logger.info('Making neural prediction:', { networkId: params.networkId });
      
      const neuralBridge = NeuralBridge.getInstance();
      const result = await neuralBridge.predict(params.networkId, params.inputs);
      
      logger.info(`Neural prediction completed: ${params.networkId}`);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🔮 Neural network prediction completed!

Network ID: ${params.networkId}
Input: [${params.inputs.join(', ')}]
Output: [${result.outputs.map(x => x.toFixed(4)).join(', ')}]
Confidence: ${(result.confidence * 100).toFixed(1)}%
Processing Time: ${result.processingTime}ms

The neural network has processed your input successfully.`
        }]
      };
    } catch (error) {
      logger.error('Neural prediction failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Neural prediction failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Get neural system status
 */
export const neuralStatusTool: MCPTool = {
  name: 'neural_status',
  description: 'Get status of neural networks and system',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (): Promise<MCPToolResult> => {
    try {
      const neuralBridge = NeuralBridge.getInstance();
      const stats = neuralBridge.getStats();
      const networks = neuralBridge.listNetworks();
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🧠 Neural System Status

System Information:
  Total Networks: ${stats.totalNetworks}
  Active Networks: ${stats.activeNetworks}
  Training Networks: ${stats.trainingNetworks}
  GPU Acceleration: ${stats.gpuEnabled ? 'Enabled' : 'Disabled'}
  WASM Support: ${stats.wasmEnabled ? 'Enabled' : 'Disabled'}

Network Details:
${networks.map(net => `  • ${net.id} (${net.type}) - Status: ${net.status}`).join('\n')}

The neural system is operational and ready for AI tasks.`
        }]
      };
    } catch (error) {
      logger.error('Neural status check failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Neural status check failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * List neural networks
 */
export const neuralListTool: MCPTool = {
  name: 'neural_list',
  description: 'List all available neural networks',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (): Promise<MCPToolResult> => {
    try {
      const neuralBridge = NeuralBridge.getInstance();
      const networks = neuralBridge.listNetworks();
      
      if (networks.length === 0) {
        return {
          success: true,
          content: [{
            type: 'text',
            text: `📋 Neural Networks

No neural networks found. Create one using neural_create tool.`
          }]
        };
      }
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `📋 Neural Networks (${networks.length} total)

${networks.map(net => `🧠 ${net.id}
   Type: ${net.type}
   Architecture: ${net.layers.join(' → ')} neurons
   Status: ${net.status}
`).join('\n')}

Use neural_train to train networks or neural_predict to make predictions.`
        }]
      };
    } catch (error) {
      logger.error('Neural list failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Neural list failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

// Export all neural tools
export const neuralTools = {
  neural_create: neuralCreateTool,
  neural_train: neuralTrainTool,
  neural_predict: neuralPredictTool,
  neural_status: neuralStatusTool,
  neural_list: neuralListTool
};