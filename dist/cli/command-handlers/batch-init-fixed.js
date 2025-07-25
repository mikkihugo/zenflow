// batch-init-fixed.js - Simplified batch initialization
// Fixed imports and integrated with meow/ink system

import { promises as fs } from 'fs';
import path from 'path';
import { initCommand } from './init-command.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { PROJECT_TEMPLATES, ENVIRONMENT_CONFIGS } from './batch-constants.js';

// Progress tracking for batch operations
class BatchProgressTracker {
  constructor(totalProjects) {
    this.totalProjects = totalProjects;
    this.completed = 0;
    this.failed = 0;
    this.inProgress = new Map();
    this.startTime = Date.now();
  }

  startProject(projectName) {
    this.inProgress.set(projectName, Date.now());
    this.updateDisplay();
  }

  completeProject(projectName, success = true) {
    this.inProgress.delete(projectName);
    if (success) {
      this.completed++;
    } else {
      this.failed++;
    }
    this.updateDisplay();
  }

  updateDisplay() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const progress = Math.floor(((this.completed + this.failed) / this.totalProjects) * 100);

    console.clear();
    console.log('🚀 Batch Initialization Progress');
    console.log('================================');
    console.log(`Total Projects: ${this.totalProjects}`);
    console.log(`Completed: ${this.completed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);
    console.log(`In Progress: ${this.inProgress.size} 🔄`);
    console.log(`Progress: ${progress}% [${this.getProgressBar(progress)}]`);
    console.log(`Elapsed Time: ${elapsed}s`);

    if (this.inProgress.size > 0) {
      console.log('\nActive Projects:');
      for (const [project, startTime] of this.inProgress) {
        const projectElapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`  - ${project} (${projectElapsed}s)`);
      }
    }
  }

  getProgressBar(progress) {
    const filled = Math.floor(progress / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  getReport() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      total: this.totalProjects,
      completed: this.completed,
      failed: this.failed,
      elapsedTime: elapsed,
      successRate: this.totalProjects > 0 ? ((this.completed / this.totalProjects) * 100).toFixed(1) : 0,
    };
  }
}

// Resource management to prevent overload
class ResourceManager {
  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.currentTasks = 0;
    this.queue = [];
  }

  async acquire() {
    while (this.currentTasks >= this.maxConcurrency) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.currentTasks++;
  }

  release() {
    this.currentTasks--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    }
  }

  async withResource(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Initialize a single project with options
async function initializeProject(projectPath, options = {}) {
  const {
    template = null,
    environment = 'development',
    force = false,
    minimal = false,
  } = options;

  try {
    // Use the existing init command
    await initCommand([projectPath], {
      force,
      minimal,
      template,
      environment
    });

    return { success: true, projectPath };
  } catch (error) {
    return { success: false, projectPath, error: error.message };
  }
}

// Batch initialization with parallel processing
export async function batchInitCommand(projects, options = {}) {
  const {
    parallel = true,
    maxConcurrency = 5,
    template = null,
    environments = ['development'],
    force = false,
    minimal = false,
    progressTracking = true,
  } = options;

  if (!projects || projects.length === 0) {
    printError('No projects specified for batch initialization');
    return;
  }

  const totalProjects = projects.length * environments.length;
  const tracker = progressTracking ? new BatchProgressTracker(totalProjects) : null;
  const resourceManager = new ResourceManager(parallel ? maxConcurrency : 1);

  printSuccess(`Starting batch initialization for ${projects.length} projects across ${environments.length} environments`);
  console.log(`Template: ${template || 'default'}`);
  console.log(`Parallelism: ${parallel ? `Yes (max ${maxConcurrency} concurrent)` : 'No'}\n`);

  const results = [];
  const initTasks = [];

  for (const project of projects) {
    for (const env of environments) {
      const projectPath = environments.length > 1 ? `${project}-${env}` : project;

      const initTask = async () => {
        if (tracker) tracker.startProject(projectPath);

        const result = await resourceManager.withResource(async () => {
          return await initializeProject(projectPath, {
            template,
            environment: env,
            minimal,
            force,
          });
        });

        if (tracker) tracker.completeProject(projectPath, result.success);
        results.push(result);
      };

      if (parallel) {
        initTasks.push(initTask());
      } else {
        await initTask();
      }
    }
  }

  if (parallel) {
    await Promise.all(initTasks);
  }

  // Final report
  console.log('\n\n📊 Batch Initialization Report');
  console.log('================================');

  if (tracker) {
    const report = tracker.getReport();
    console.log(`Total Projects: ${report.total}`);
    console.log(`Successful: ${report.completed} ✅`);
    console.log(`Failed: ${report.failed} ❌`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Total Time: ${report.elapsedTime}s`);
    console.log(`Average Time per Project: ${(report.elapsedTime / report.total).toFixed(1)}s`);
  }

  // List successful projects
  const successful = results.filter((r) => r.success);
  if (successful.length > 0) {
    console.log('\n✅ Successfully initialized:');
    successful.forEach((r) => console.log(`  - ${r.projectPath}`));
  }

  // List failed projects
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed to initialize:');
    failed.forEach((r) => console.log(`  - ${r.projectPath}: ${r.error}`));
  }

  return results;
}

// Parse batch initialization config from file
export async function parseBatchConfig(configFile) {
  try {
    const content = await fs.readFile(configFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    printError(`Failed to read batch config file: ${error.message}`);
    return null;
  }
}

// Create batch initialization from config file
export async function batchInitFromConfig(configFile, options = {}) {
  const config = await parseBatchConfig(configFile);
  if (!config) return;

  const { projects = [], baseOptions = {}, projectConfigs = {} } = config;

  // Merge options with config
  const mergedOptions = { ...baseOptions, ...options };

  // If projectConfigs are specified, use them for individual project customization
  if (Object.keys(projectConfigs).length > 0) {  
    const results = [];
    const resourceManager = new ResourceManager(mergedOptions.maxConcurrency || 5);

    for (const [projectName, projectConfig] of Object.entries(projectConfigs)) {
      const projectOptions = { ...mergedOptions, ...projectConfig };
      const result = await resourceManager.withResource(async () => {
        return await initializeProject(projectName, projectOptions);
      });
      results.push(result);
    }

    return results;
  }

  // Otherwise, use standard batch init
  return await batchInitCommand(projects, mergedOptions);
}

// Validation for batch operations
export function validateBatchOptions(options) {
  const errors = [];

  if (options.maxConcurrency && (options.maxConcurrency < 1 || options.maxConcurrency > 20)) {
    errors.push('maxConcurrency must be between 1 and 20');
  }

  if (options.template && !PROJECT_TEMPLATES[options.template]) {
    errors.push(
      `Unknown template: ${options.template}. Available: ${Object.keys(PROJECT_TEMPLATES).join(', ')}`,
    );
  }

  if (options.environments) {
    for (const env of options.environments) {
      if (!ENVIRONMENT_CONFIGS[env]) {
        errors.push(
          `Unknown environment: ${env}. Available: ${Object.keys(ENVIRONMENT_CONFIGS).join(', ')}`,
        );
      }
    }
  }

  return errors;
}