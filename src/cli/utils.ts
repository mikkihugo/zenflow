// utils.ts - Shared CLI utility functions

import { Logger } from '../cli/core/logger.ts';
import { SqliteMemoryStore } from '../memory/sqlite-store.ts';

const _logger = new Logger('cli-utils');

// Color formatting functions
export function printSuccess(_message = = 'EEXIST') {
      throw err;
    }
return true;
}
}

export async function fileExists(path = {}): Promise<object> {
  try {
    const content = await (process as any).readTextFile(path);
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

export async function writeJsonFile(_path = 100): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function formatBytes(bytes = ['B', 'KB', 'MB', 'GB'];
let size = bytes;
let unitIndex = 0;

while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
}

return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Command execution helpers
export function parseFlags(args = {};
const providedFlags = new Set<string>(); // Track explicitly provided flags
const filteredArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg.startsWith('--')) {
    const flagName = arg.substring(2);
    const nextArg = args[i + 1];

    if (nextArg && !nextArg.startsWith('--')) {
      flags[flagName] = nextArg;
      providedFlags.add(flagName);
      i++; // Skip next arg since we consumed it
    } else {
      flags[flagName] = true;
      providedFlags.add(flagName);
    }
  } else if (arg.startsWith('-') && arg.length > 1) {
    // Short flags
    const shortFlags = arg.substring(1);
    for (const flag of shortFlags) {
      flags[flag] = true;
      providedFlags.add(flag);
    }
  } else {
    filteredArgs.push(arg);
  }
}

return {
    flags,args = [], options = {}): Promise<any> {
  try {
    // Check if we're in Node.js or node environment
    if (typeof process !== 'undefined' && (_process _as _any).versions && (process as any).versions.node) {
      // Node.js environment
      const { spawn } = await import('node:child_process');
const { promisify } = await import('node:util');

return new Promise((resolve) => {
        const child = spawn(command, args, {stdio = '';
        let _stderr = '';

        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          _stderr += data.toString();
        });

        child.on('close', (code) => {
          resolve({
            success = === 0,
            code => {
          resolve({success = new (process as any).Command(command, {
        args,
        ...options,
      });

      const _result = await cmd.output();

      return {success = === 0,code = 'claude-zen.config.json'): Promise<object> {
  const defaultConfig = {terminal = await (process as any).readTextFile(path);
    return { ...defaultConfig, ...JSON.parse(content) };
  } catch {
    return defaultConfig;
  }
}

export async function saveConfig(config = 'claude-zen.config.json'): Promise<void> {
  await writeJsonFile(path, config);
}

// ID generation
export function generateId(prefix = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

// Array helpers
export function chunk<_T>(array = [];
for (let i = 0; i < array.length; i += size) {
  chunks.push(array.slice(i, i + size));
}
return chunks;
}

// Environment helpers
export function getEnvVar(name = null): any {
  return (process as any).env.get(name) ?? defaultValue;
}

export function setEnvVar(_name = ''): void {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
  console.warn(`\r${bar} ${percentage}% ${message}`);
}

export function clearLine(): void {
  console.warn('\r\x1b[K');
}

// Async helpers
export function sleep(ms = > setTimeout(resolve, ms));
}

export async function retry<T>(fn = > Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      await sleep(delay * attempt);
    }
  }
}

// ruv-swarm source integration - Using consolidated main implementation
import { RuvSwarm } from '../../ruv-FANN/ruv-swarm/npm/src/index.js';

// Singleton ruv-swarm instance
const ruvSwarmInstance = null;
let _memoryStoreInstance = null;

async function _getRuvSwarmInstance(): Promise<any> {
  if (!ruvSwarmInstance) {
    // Initialize memory store
    _memoryStoreInstance = new SqliteMemoryStore({dbName = new RuvSwarm({
      memoryStore,
      telemetryEnabled = {}): Promise<any> {
  try {
    const ruvSwarm = await _getRuvSwarmInstance();
    
    switch (operation) {
      case 'swarm_init': {
        const _swarm = await ruvSwarm.createSwarm(params);
        return {success = await ruvSwarm.spawnAgent(params);
        return {success = await ruvSwarm.orchestrateTask(params);
        return {success = await ruvSwarm.getStatus();
        return {
          success = {}): Promise<any> {
  // Convert MCP tool names to library operations
  const toolMapping = {
    'neural_train': 'neural_train',
    'swarm_init': 'swarm_init',
    'agent_spawn': 'agent_spawn',
    'task_orchestrate': 'task_orchestrate',
    'swarm_status': 'swarm_status'
  };
  
  const operation = toolMapping[tool] || tool;
  return await callRuvSwarmLibrary(operation, params);
      }
}

// Direct ruv-swarm neural training (real WASM implementation)
export async function _callRuvSwarmDirectNeural(params = {}): Promise<any> {
  try {
    const modelName = (params as any).model || 'general';
    const _epochs = (params as any).epochs || 50;
    const _dataSource = (params as any).data || 'recent';

    console.warn(`🧠 Using REAL ruv-swarm WASM neural training...`);
    console.warn(
      `🚀Executing = = 'undefined' && (process as any).versions && (process as any).versions.node) {
      // Node.js environment - use spawn with stdio inherit
      const { spawn } = await import('child_process');

      result = await new Promise((resolve) => {
        const child = spawn(
          'npx',
          [
            'ruv-swarm',
            'neural',
            'train',
            '--model',
            modelName,
            '--iterations',
            epochs.toString(),
            '--data-source',
            dataSource,
            '--output-format',
            'json',
          ],
          {
            stdio => {
          resolve({
            success = == 0,
            code => {
          resolve({success = '.ruv-swarm/neural';
      const files = await (process as any).readDir(neuralDir);
      let latestFile = null;
      let latestTime = 0;

      for await (const file of files) {
        if (file.name.startsWith(`training-${modelName}-`) && file.name.endsWith('.json')) {
          const filePath = `${neuralDir}/${file.name}`;
          const stat = await (process as any).stat(filePath);
          if (stat.mtime > latestTime) {
            latestTime = stat.mtime;
            latestFile = filePath;
          }
        }
      }

      if (latestFile) {
        const content = await (process as any).readTextFile(latestFile);

        return {success = == 0,modelId = == 0,
      modelId = {}): Promise<any> {
  try {
    const command = 'npx';
    const args = ['ruv-swarm', 'hook', hookName];

    // Add parameters as CLI arguments
    Object.entries(params).forEach(([key, value]) => {
      args.push(`--${key}`);
      if (value !== true && value !== false) {
        args.push(String(value));
      }
    });

    const result = await runCommand(command, args, {stdout = await runCommand('npx', ['ruv-swarm', '--version'], {stdout = 50): Promise<any> {
  return await callRuvSwarmMCP('neural_train', {
    model = {}): Promise<any> {
  return await callRuvSwarmMCP('neural_patterns', {action = null): Promise<any> {
  return await callRuvSwarmMCP('swarm_status', {
    swarmId = {}): Promise<any> {
  return await callRuvSwarmLibrary('agent_spawn', {
    type = {}): Promise<any> {
  return await callRuvSwarmLibrary('swarm_init', {
    topology = {}): Promise<any> {
  return await callRuvSwarmLibrary('task_orchestrate', {
    task: taskDescription,
    strategy: (options as any).strategy || 'adaptive',
    priority: (options as any).priority || 'medium',
    ...options
  });
}
