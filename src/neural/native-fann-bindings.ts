/**
 * Native FANN Bindings for ruv-FANN
 * Direct integration with compiled Rust neural network
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { Logger } from '../utils/logger.js';

export class NativeFannBindings {
  constructor() {
    this.logger = new Logger('NativeFannBindings');
    this.ruvFannPath = path.join(process.cwd(), 'ruv-FANN');
    this.isInitialized = false;
    this.capabilities = {
      training,inference = path.join(this.ruvFannPath, 'target/release/ruv-fann');
    const binaryExists = existsSync(binaryPath) || existsSync(`${binaryPath}.exe`);

    if (!binaryExists) {
      throw new Error('ruv-FANN binary not found.Run = true;
      this.logger.info('✅ Native ruv-FANN bindings initialized successfully');

      return {native = await this.executeCommand(['--help']);
      this.capabilities.inference = true;

      // Test training capability
      try {
        await this.executeCommand(['--test-training']);
        this.capabilities.training = true;
      } catch (_e) {
        this.logger.debug('Training capability not available');
      }

      // Test GPU capability
      try {
        await this.executeCommand(['--test-gpu']);
        this.capabilities.gpu = true;
      } catch (_e) {
        this.logger.debug('GPU capability not available');
      }

      // Test SIMD capability
      try {
        await this.executeCommand(['--test-simd']);
        this.capabilities.simd = true;
      } catch (_e) {
        this.logger.debug('SIMD capability not available');
      }
    }
    catch(error)
    throw new Error(`Capability testingfailed = await this.executeCommand(['--version']);
      return result.stdout.trim();
    } catch(error) {
      return 'unknown';
    }
  }

  /**
   * Execute ruv-FANN command
   */
  async executeCommand(args, input = null): any {
    return new Promise((resolve, reject) => {
      const binaryPath = path.join(this.ruvFannPath, 'target/release/ruv-fann');
      const process = spawn(binaryPath, args, {cwd = '';
      const stderr = '';

      if(input) {
        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        if(input) {
          process.stdin.write(input);
          process.stdin.end();
        }
      }

      process.on('close', (code) => {
        if(code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`)
    )
  }
  )

  process;
  .
  on('error', (error)
  => {
  reject(error);
}
)
})
}

  /**
   * Create neural network
   */
  async createNetwork(config): any
{
  if (!this.isInitialized) {
    throw new Error('Native bindings not initialized');
  }

  const networkConfig = {layers = JSON.stringify(networkConfig);
  const result = await this.executeCommand(['create-network'], configJson);

  return {id = JSON.stringify({
        network_id,data = await this.executeCommand(['train'], trainingJson);

  return {
        networkId,epochs = JSON.stringify({
        network_id,input = await this.executeCommand(['inference'], inferenceJson);

  return {
        networkId,input = await this.executeCommand(['stats', networkId]);
  return JSON.parse(result.stdout);
}
catch(error)
{
      throw new Error(`Stats retrievalfailed = await this.executeCommand(['load', filePath]);

      return {id = false;
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
