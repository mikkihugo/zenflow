/**
 * Native FANN Bindings for ruv-FANN
 * Direct integration with compiled Rust neural network
 */

import { createRequire } from 'module';
import { execSync, spawn } from 'child_process';
import path from 'path';
import { existsSync } from 'fs';
import { Logger } from '../utils/logger.js';

export class NativeFannBindings {
  constructor() {
    this.logger = new Logger('NativeFannBindings');
    this.ruvFannPath = path.join(process.cwd(), 'ruv-FANN');
    this.isInitialized = false;
    this.capabilities = {
      training: false,
      inference: false,
      gpu: false,
      simd: false
    };
  }

  /**
   * Initialize native FANN bindings
   */
  async initialize() {
    this.logger.info('🧠 Initializing native ruv-FANN bindings...');
    
    try {
      // Check if ruv-FANN binary exists
      const binaryPath = path.join(this.ruvFannPath, 'target/release/ruv-fann');
      const binaryExists = existsSync(binaryPath) || existsSync(binaryPath + '.exe');
      
      if (!binaryExists) {
        throw new Error('ruv-FANN binary not found. Run: cd ruv-FANN && cargo build --release');
      }
      
      // Test binary capabilities
      await this.testCapabilities();
      
      this.isInitialized = true;
      this.logger.info('✅ Native ruv-FANN bindings initialized successfully');
      
      return {
        native: true,
        capabilities: this.capabilities,
        version: await this.getVersion()
      };
      
    } catch (error) {
      this.logger.warn(`⚠️ Native bindings initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test binary capabilities
   */
  async testCapabilities() {
    try {
      // Test basic functionality
      const result = await this.executeCommand(['--help']);
      this.capabilities.inference = true;
      
      // Test training capability
      try {
        await this.executeCommand(['--test-training']);
        this.capabilities.training = true;
      } catch (e) {
        this.logger.debug('Training capability not available');
      }
      
      // Test GPU capability
      try {
        await this.executeCommand(['--test-gpu']);
        this.capabilities.gpu = true;
      } catch (e) {
        this.logger.debug('GPU capability not available');
      }
      
      // Test SIMD capability
      try {
        await this.executeCommand(['--test-simd']);
        this.capabilities.simd = true;
      } catch (e) {
        this.logger.debug('SIMD capability not available');
      }
      
    } catch (error) {
      throw new Error(`Capability testing failed: ${error.message}`);
    }
  }

  /**
   * Get ruv-FANN version
   */
  async getVersion() {
    try {
      const result = await this.executeCommand(['--version']);
      return result.stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Execute ruv-FANN command
   */
  async executeCommand(args, input = null) {
    return new Promise((resolve, reject) => {
      const binaryPath = path.join(this.ruvFannPath, 'target/release/ruv-fann');
      const process = spawn(binaryPath, args, {
        cwd: this.ruvFannPath,
        stdio: input ? 'pipe' : 'inherit'
      });

      let stdout = '';
      let stderr = '';

      if (input) {
        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        if (input) {
          process.stdin.write(input);
          process.stdin.end();
        }
      }

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Create neural network
   */
  async createNetwork(config) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    const networkConfig = {
      layers: config.layers || [784, 100, 10],
      activation: config.activation || 'sigmoid',
      learning_rate: config.learningRate || 0.7,
      epochs: config.epochs || 500
    };

    try {
      const configJson = JSON.stringify(networkConfig);
      const result = await this.executeCommand(['create-network'], configJson);
      
      return {
        id: Date.now().toString(),
        config: networkConfig,
        native: true,
        created: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Network creation failed: ${error.message}`);
    }
  }

  /**
   * Train neural network
   */
  async trainNetwork(networkId, trainingData) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    if (!this.capabilities.training) {
      throw new Error('Training capability not available');
    }

    try {
      const trainingJson = JSON.stringify({
        network_id: networkId,
        data: trainingData,
        epochs: trainingData.epochs || 500
      });

      const result = await this.executeCommand(['train'], trainingJson);
      
      return {
        networkId,
        epochs: trainingData.epochs || 500,
        finalError: parseFloat(result.stdout.match(/Final error: ([\d.]+)/)?.[1] || '0'),
        trainingTime: parseFloat(result.stdout.match(/Training time: ([\d.]+)s/)?.[1] || '0'),
        native: true
      };
      
    } catch (error) {
      throw new Error(`Training failed: ${error.message}`);
    }
  }

  /**
   * Run inference
   */
  async runInference(networkId, inputData) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    try {
      const inferenceJson = JSON.stringify({
        network_id: networkId,
        input: inputData
      });

      const result = await this.executeCommand(['inference'], inferenceJson);
      const output = JSON.parse(result.stdout);
      
      return {
        networkId,
        input: inputData,
        output: output.result,
        confidence: output.confidence || 0.0,
        processingTime: output.processing_time || 0,
        native: true
      };
      
    } catch (error) {
      throw new Error(`Inference failed: ${error.message}`);
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(networkId) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    try {
      const result = await this.executeCommand(['stats', networkId]);
      return JSON.parse(result.stdout);
    } catch (error) {
      throw new Error(`Stats retrieval failed: ${error.message}`);
    }
  }

  /**
   * Save network to file
   */
  async saveNetwork(networkId, filePath) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    try {
      await this.executeCommand(['save', networkId, filePath]);
      return { saved: true, path: filePath };
    } catch (error) {
      throw new Error(`Save failed: ${error.message}`);
    }
  }

  /**
   * Load network from file
   */
  async loadNetwork(filePath) {
    if (!this.isInitialized) {
      throw new Error('Native bindings not initialized');
    }

    try {
      const result = await this.executeCommand(['load', filePath]);
      const networkData = JSON.parse(result.stdout);
      return {
        id: networkData.id,
        config: networkData.config,
        loaded: true,
        native: true
      };
    } catch (error) {
      throw new Error(`Load failed: ${error.message}`);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.isInitialized) {
      try {
        await this.executeCommand(['cleanup']);
      } catch (error) {
        this.logger.warn(`Cleanup warning: ${error.message}`);
      }
    }
    this.isInitialized = false;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      isInitialized: this.isInitialized,
      capabilities: { ...this.capabilities },
      backend: 'native',
      performance: {
        supportsGPU: this.capabilities.gpu,
        supportsSIMD: this.capabilities.simd,
        supportsTraining: this.capabilities.training
      }
    };
  }
}

export default NativeFannBindings;