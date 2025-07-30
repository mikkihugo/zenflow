// utils.ts - Shared CLI utility functions

import { Logger } from '../cli/core/logger.ts';
import { SqliteMemoryStore } from '../memory/sqlite-store.ts';

const __logger = new Logger('cli-utils');
// Color formatting functions
export function printSuccess(): unknown {
  throw err;
}
return true;
}
}
export async function fileExists(path = {}: unknown): Promise<object> {
  try {
    const _content = await (process as any).readTextFile(path);
    return JSON.parse(content);
    //   // LINT: unreachable code removed} catch {
    return defaultValue;
    //   // LINT: unreachable code removed}
}
;
export async function _writeJsonFile(_path = 100: unknown): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}
;
export function _formatBytes(): unknown {
  size /= 1024;
  unitIndex++;
}
;
return `${size.toFixed(2)} ${units[unitIndex]}`;
}
// Command execution helpers
export function parseFlags(args = {};
const _providedFlags = new Set<string>(: unknown); // Track explicitly provided flags
const _filteredArgs = [];
for (let i = 0; i < args.length; i++) {
  const _arg = args[i];
  if (arg.startsWith('--')) {
    const _flagName = arg.substring(2);
    const _nextArg = args[i + 1];
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
    const _shortFlags = arg.substring(1);
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
// const { promisify  // LINT: unreachable code removed} = await import('node:util');

return new Promise((resolve) => {
        const _child = spawn(command, args, {stdio = '';
    // let __stderr = ''; // LINT: unreachable code removed
;
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });
;
        child.stderr?.on('data', (data) => {
          _stderr += data.toString();
        });
;
        child.on('close', (code) => {
          resolve({
            success = === 0,
            _code => {
          resolve({success = new (process as any).Command(command, {
        args,
        ...options,
      });
;
      const __result = await cmd.output();
;
      return {success = === 0,code = 'claude-zen.config.json'): Promise<object> {
  const _defaultConfig = {terminal = await (process as any).readTextFile(path);
    // return { ...defaultConfig, ...JSON.parse(content)  // LINT: unreachable code removed};
  } catch {
    return defaultConfig;
    //   // LINT: unreachable code removed}
}
;
export async function saveConfig(config = 'claude-zen.config.json': unknown): Promise<void> {
  await writeJsonFile(path, config);
}
// ID generation
export function generateId(prefix = '': unknown): string {
  const _timestamp = Date.now();
  const _random = Math.random().toString(36).substr(2, 9);
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
export function getEnvVar(name = null: unknown): unknown {
  return (process as any).env.get(name) ?? defaultValue;
}
export function setEnvVar(_name = '': unknown): void {
  const _percentage = Math.round((current / total) * 100);
  const _bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
  console.warn(`\r${bar} ${percentage}% ${message}`);
}
export function clearLine(): void {
  console.warn('\r\x1b[K');
}
// Async helpers
export function sleep(ms = > setTimeout(resolve: unknown, ms: unknown));
}
export async function retry<T>(fn = > Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    //   // LINT: unreachable code removed} catch (/* err */) {
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
const _ruvSwarmInstance = null;
const __memoryStoreInstance = null;
async function _getRuvSwarmInstance(): Promise<any> {
  if (!ruvSwarmInstance) {
    // Initialize memory store
    _memoryStoreInstance = new SqliteMemoryStore({dbName = new RuvSwarm({
      memoryStore,
      telemetryEnabled = {}): Promise<any> 
  try {
    const _ruvSwarm = await _getRuvSwarmInstance();
;
    switch (operation) {
      case 'swarm_init': {
        const __swarm = await ruvSwarm.createSwarm(params);
        return {success = await ruvSwarm.spawnAgent(params);
    // return {success = await ruvSwarm.orchestrateTask(params); // LINT: unreachable code removed
        return {success = await ruvSwarm.getStatus();
    // return { // LINT: unreachable code removed
          success = {}): Promise<any> {
  // Convert MCP tool names to library operations
  const _toolMapping = {
    'neural_train': 'neural_train',
    'swarm_init': 'swarm_init',
    'agent_spawn': 'agent_spawn',
    'task_orchestrate': 'task_orchestrate',
    'swarm_status': 'swarm_status';
  };
;
  const _operation = toolMapping[tool]  ?? tool;
  return await callRuvSwarmLibrary(operation, params);
    //   // LINT: unreachable code removed}
}
;
// Direct ruv-swarm neural training (real WASM implementation)
export async function _callRuvSwarmDirectNeural(params = {}: unknown): Promise<any> {
  try {
    const _modelName = (params as any).model  ?? 'general';
    const __epochs = (params as any).epochs  ?? 50;
    const __dataSource = (params as any).data  ?? 'recent';
;
    console.warn(`🧠 Using REAL ruv-swarm WASM neural training...`);
    console.warn(;
      `🚀Executing = = 'undefined' && (process as any).versions && (process as any).versions.node) {
      // Node.js environment - use spawn with stdio inherit
      const { spawn } = await import('child_process');

      result = await new Promise((resolve) => {
        const _child = spawn(;
          'npx',
          [;
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
            success = === 0,
            code => {
          resolve({success = '.ruv-swarm/neural';
      const _files = await (process as any).readDir(neuralDir);
      let _latestFile = null;
      let _latestTime = 0;
;
      for await (const file of files) {
        if (file.name.startsWith(`training-$modelName-`) && file.name.endsWith('.json')) {
          const _filePath = `$neuralDir/$file.name`;
          const _stat = await (process as any).stat(filePath);
          if (stat.mtime > latestTime) {
            latestTime = stat.mtime;
            latestFile = filePath;
          }
        }
      }
;
      if (latestFile) {
        const _content = await (process as any).readTextFile(latestFile);
;
        return {success = === 0,modelId = === 0,
    // modelId = { // LINT: unreachable code removed}): Promise<any> {
  try {
    const _command = 'npx';
    const _args = ['ruv-swarm', 'hook', hookName];
;
    // Add parameters as CLI arguments
    Object.entries(params).forEach(([key, value]) => {
      args.push(`--$key`);
      if (value !== true && value !== false) {
        args.push(String(value));
      }
    });
;
    const _result = await runCommand(command, args, {stdout = await runCommand('npx', ['ruv-swarm', '--version'], {stdout = 50): Promise<any> {
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
    // strategy: (options as any).strategy  ?? 'adaptive', // LINT: unreachable code removed
    priority: (options as any).priority  ?? 'medium',
    ...options;
  });
}
;
