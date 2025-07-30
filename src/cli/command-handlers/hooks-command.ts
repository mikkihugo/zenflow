/**
 * Hooks Command Module
 * Converted from JavaScript to TypeScript
 */

{
  Logger, JSONObject, JSONValue, JSONArray;
}
from;
('../types/core.js');

printSuccess,
  printError,
  printWarning,
  execRuvSwarmHook,
  checkRuvSwarmAvailable,
} from '../utils.js'

import { SqliteMemoryStore } from '../../memory/sqlite-store.js';
import TimeoutProtection from '../../utils/timeout-protection.js';

// Initialize memory store
let memoryStore = null;

async function getMemoryStore() {
  if (!memoryStore) {
    memoryStore = new SqliteMemoryStore();
    await memoryStore.initialize();
  }
  return memoryStore;
}

// Simple ID generator
function generateId(prefix = 'id'): any {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function hooksAction(subArgs = subArgs[0];
const options = flags;

if (options.help || options.h || !subcommand) {
  showHooksHelp();
  return;
}

try {
    switch(subcommand) {
      // Pre-Operation Hooks
      case 'pre-task':
        await preTaskCommand(subArgs, flags);
        break;
      case 'pre-edit':
        await preEditCommand(subArgs, flags);
        break;
      case 'pre-bash':
      case 'pre-command': // Support both names for compatibility
        await preBashCommand(subArgs, flags);
        break;

      // Post-Operation Hooks
      case 'post-task':
        await postTaskCommand(subArgs, flags);
        break;
      case 'post-edit':
        await postEditCommand(subArgs, flags);
        break;
      case 'post-bash':
      case 'post-command': // Support both names for compatibility
        await postBashCommand(subArgs, flags);
        break;
      case 'post-search':
        await postSearchCommand(subArgs, flags);
        break;

      // MCP Integration Hooks
      case 'mcp-initialized':
        await mcpInitializedCommand(subArgs, flags);
        break;
      case 'agent-spawned':
        await agentSpawnedCommand(subArgs, flags);
        break;
      case 'task-orchestrated':
        await taskOrchestratedCommand(subArgs, flags);
        break;
      case 'neural-trained':
        await neuralTrainedCommand(subArgs, flags);
        break;

      // Session Hooks
      case 'session-end':
        await sessionEndCommand(subArgs, flags);
        break;
      case 'session-restore':
        await sessionRestoreCommand(subArgs, flags);
        break;
      case 'notify':
        await notifyCommand(subArgs, flags);
        break;default = ==== PRE-OPERATION HOOKS = ====

async function preTaskCommand(subArgs,flags = flags;
  const _description = options.description || 'Unnamed task';
  const _taskId = options['task-id'] || options.taskId || generateId('task');
  const _agentId = options['agent-id'] || options.agentId;
  const _autoSpawnAgents = options['auto-spawn-agents'] !== 'false';

  console.warn(`🔄 Executing pre-task hook...`);
  console.warn(`📋Task = await getMemoryStore();
    const taskData = {
      taskId,
      description,
      agentId,
      autoSpawnAgents,status = await TimeoutProtection.checkRuvSwarmAvailableWithTimeout();
    if(isAvailable) {
      console.warn(`\n🔄 Executing ruv-swarm pre-task hook...`);
      const hookResult = await TimeoutProtection.execRuvSwarmHookWithTimeout('pre-task', {
        description,
        'task-id': taskId,
        'auto-spawn-agents': autoSpawnAgents,
        ...(agentId ? { 'agent-id': agentId } : {}),
      });

      if(hookResult.success) {
        await store.store(
          `task = flags;
  const _file = options.file || 'unknown-file';
  const _operation = options.operation || 'edit';
  const _autoAssignAgents = options['auto-assign-agents'] || false;
  const _loadContext = options['load-context'] || false;

  console.warn(`📝 Executing pre-edit hook...`);
  console.warn(`📄File = await getMemoryStore();

    // Auto-assign agents based on file type
    let assignedAgentType = 'general';
    let recommendedAgent = null;

    if(autoAssignAgents) {
      const path = await import('path');
      const ext = path.extname(file).toLowerCase();

      const agentMapping = {
        '.js': 'javascript-developer',
        '.ts': 'typescript-developer',
        '.py': 'python-developer',
        '.go': 'golang-developer',
        '.rs': 'rust-developer',
        '.java': 'java-developer',
        '.cpp': 'cpp-developer',
        '.c': 'c-developer',
        '.css': 'frontend-developer',
        '.html': 'frontend-developer',
        '.vue': 'frontend-developer',
        '.react': 'frontend-developer',
        '.md': 'technical-writer',
        '.yml': 'devops-engineer',
        '.yaml': 'devops-engineer',
        '.json': 'config-specialist',
        '.sql': 'database-expert',
        '.sh': 'system-admin',
        '.dockerfile': 'devops-engineer',
      };

      assignedAgentType = agentMapping[ext] || 'general-developer';
      recommendedAgent = {
        type,file = null;
    if(loadContext) {
      try {
        // Check if file exists and get basic info
        const fs = await import('fs');
        const path = await import('path');

        if (fs.existsSync(file)) {

          const dirname = path.dirname(file);
          const basename = path.basename(file);

          contextData = {fileExists = {fileExists = {error = {
      file,
      operation,timestamp = flags;
  const command = options.command || subArgs.slice(1).join(' ') || '';
  const workingDir = options.cwd || process.cwd();
  const validateSafety = options['validate-safety'] === true || options['validate-safety'] === 'true' || options.validate === true || options.validate === 'true' || false;

  console.warn(`🔧 Executing pre-bash hook...`);
  console.warn(`📜Command = await getMemoryStore();
    let _safetyResult = 'skipped';

    if(validateSafety) {
      // Basic safety validation
      const dangerousCommands = [
        'rm -rf /',
        'rm -rf .',
        'rm -rf *',
        'format',
        'fdisk',
        'mkfs',
        'curl * | bash',
        'wget * | sh',
        'eval',
        'exec',
        'chmod 777',
      ];

      const isDangerous = command && typeof command === 'string' && command.length > 0 
        ? dangerousCommands.some((dangerous) =>
            command.toLowerCase().includes(dangerous.toLowerCase()),
          )
        : false;

      _safetyResult = isDangerous ? 'dangerous' : 'safe';

      if(isDangerous) {
        console.warn(`  ⚠️  Safetycheck = await import('fs');
      const path = await import('path');

      if (!fs.existsSync(workingDir)) {
        fs.mkdirSync(workingDir, {recursive = fs.statSync(workingDir);
        console.warn(`  💾 Working directory prepared`);
      } catch(err) {
        console.warn(`  ⚠️  Warning = {command = ==== POST-OPERATION HOOKS = ====

async function postTaskCommand(_subArgs,flags = flags;
  const taskId = options['task-id'] || options.taskId || generateId('task');

  console.warn(`🏁 Executing post-task hook...`);
  console.warn(`🆔 TaskID = await getMemoryStore();
    const taskData = await store.retrieve(`task = {
      ...(taskData || {}),
      status = {taskId = flags;
  const file = options.file || 'unknown-file';
  const _memoryKey = options['memory-key'] || options.memoryKey;
  const _format = options.format || false;
  const _updateMemory = options['update-memory'] || false;
  const trainNeural = options['train-neural'] || false;

  console.warn(`📝 Executing post-edit hook...`);
  console.warn(`📄File = await getMemoryStore();
    const path = await import('path');
    const fs = await import('fs');

    // Auto-format file if requested
    let formatResult = null;
    if (format && fs.existsSync(file)) {
      const ext = path.extname(file).toLowerCase();
      const formatters = {
        '.js': 'prettier',
        '.ts': 'prettier',
        '.json': 'prettier',
        '.css': 'prettier',
        '.html': 'prettier',
        '.py': 'black',
        '.go': 'gofmt',
        '.rs': 'rustfmt',
        '.java': 'google-java-format',
        '.cpp': 'clang-format',
        '.c': 'clang-format',
      };

      const formatter = formatters[ext];
      if(formatter) {
        console.warn(`  🎨 Auto-formatting with ${formatter}...`);
        formatResult = {
          formatter,
          extension = {extension = null;
    if(updateMemory) {
      const editContext = {
        file,editedAt = editContext;

      // Store in coordination namespace
      await store.store(`edit-context = null;
    if(trainNeural) {
      // Simulate neural training with file patterns
      const _ext = path.extname(file).toLowerCase();
      const _basename = path.basename(file);

      const _patterns = {fileType = patterns;

      await store.store(`neural-pattern = {file = `file-history:${file.replace(/\//g, '_')}:${Date.now()}`;
    await store.store(
      historyKey,
      {
        file,editId = flags;
  const command = options.command || subArgs.slice(1).join(' ');
  const _exitCode = options['exit-code'] || '0';
  const _output = options.output || '';
  const _trackMetrics = options['track-metrics'] || false;
  const _storeResults = options['store-results'] || false;
  const _duration = options.duration || 0;

  console.warn(`🔧 Executing post-bash hook...`);
  console.warn(`📜Command = await getMemoryStore();

    // Calculate performance metrics if enabled
    let metrics = null;
    if(trackMetrics) {
      const commandLength = command.length;
      const outputLength = output.length;
      const success = parseInt(exitCode) === 0;

      metrics = {
        commandLength,
        outputLength,
        success,
        duration = {command = == 0 },
    });

    // Store detailed results if enabled
    if(storeResults) {
      await store.store(
        `command-results = (await store.retrieve('command-metrics-summary', {namespace = 1;
      existingMetrics.successRate =
        (existingMetrics.successRate * (existingMetrics.totalCommands - 1) +
          (metrics.success ?1 = (existingMetrics.avgDuration * (existingMetrics.totalCommands - 1) + metrics.duration) /
        existingMetrics.totalCommands;
      existingMetrics.lastUpdated = new Date().toISOString();

      await store.store('command-metrics-summary', existingMetrics, {namespace = === 0,hasMetrics = flags;
  const _query = options.query || subArgs.slice(1).join(' ');
  const _resultCount = options['result-count'] || '0';

  console.warn(`🔍 Executing post-search hook...`);
  console.warn(`🔎Query = await getMemoryStore();

  const serverName = options.server || 'claude-zen';
  const sessionId = options['session-id'] || generateId('mcp-session');

  console.warn(`🔌 Executing mcp-initialized hook...`);
  console.warn(`💻Server = await getMemoryStore();

  const _agentType = options.type || 'generic';
  const _agentName = options.name || generateId('agent');
  const _swarmId = options['swarm-id'] || 'default';

  console.warn(`🤖 Executing agent-spawned hook...`);
  console.warn(`📛Agent = await getMemoryStore();

  const taskId = options['task-id'] || generateId('orchestrated-task');
  const strategy = options.strategy || 'balanced';
  const priority = options.priority || 'medium';

  console.warn(`🎭 Executing task-orchestrated hook...`);
  console.warn(`🆔Task = await getMemoryStore();

  const _modelName = options.model || 'default-neural';
  const _accuracy = options.accuracy || '0.0';
  const patterns = options.patterns || '0';

  console.warn(`🧠 Executing neural-trained hook...`);
  console.warn(`🤖Model = await getMemoryStore();

  const generateSummary = options['generate-summary'] !== 'false';

  const exportMetrics = options['export-metrics'] || false;

  console.warn(`🔚 Executing session-end hook...`);
  if (generateSummary) console.warn(`📊 Summarygeneration = await getMemoryStore();
    const tasks = await store.list({namespace = await store.list({ namespace: 'file-history',limit = await store.list({ namespace: 'command-history',limit = await store.list({ namespace: 'agent-roster',limit = null;
    if(exportMetrics) {
      const now = new Date();
      const sessionStart = Math.min(
        ...tasks.map((t) => new Date(t.value.timestamp || now).getTime()),
        ...edits.map((e) => new Date(e.value.timestamp || now).getTime()),
        ...commands.map((c) => new Date(c.value.timestamp || now).getTime()),
      );

      const _duration = now.getTime() - sessionStart;
      const _successfulCommands = commands.filter((c) => c.value.success !== false).length;

    }
    
    // Setup safe exit to prevent hanging
    TimeoutProtection.forceExit(1000);

    printSuccess(`✅ Session-end hook completed`);
  } catch(err) {
    printError(`Session-end hookfailed = flags;
  const sessionId = options['session-id'] || 'latest';

  console.warn(`🔄 Executing session-restore hook...`);
  console.warn(`🆔Session = await getMemoryStore();

    // Find session to restore
    let _sessionData;
    if(sessionId === 'latest') {
      const sessions = await store.list({namespace = sessions[0]?.value;
    } else {
      _sessionData = await store.retrieve(`session = flags;
  const message = options.message || subArgs.slice(1).join(' ');
  const level = options.level || 'info';
  const swarmStatus = options['swarm-status'] || 'active';

  console.warn(`📢 Executing notify hook...`);
  console.warn(`💬Message = await getMemoryStore();

    console.warn(`\n${icon} NOTIFICATION:`);
    console.warn(`  ${message}`);
    console.warn(`  🐝 Swarm: ${swarmStatus}`);

    console.warn(`\n  💾 Notification saved to .swarm/memory.db`);
    printSuccess(`✅ Notify hook completed`);
  } catch(err) 
    printError(`Notify hook failed: $err.message`);
}

function _showHooksHelp() {
  console.warn('Claude Flow Hooks (with .swarm/memory.db persistence):\n');

  console.warn('Pre-Operation Hooks:');
  console.warn('  pre-task        Execute before starting a task');
  console.warn('  pre-edit        Validate before file modifications');
  console.warn('                  --auto-assign-agents  Auto-assign agents based on file type');
  console.warn('                  --load-context        Load file context');
  console.warn('  pre-bash        Check command safety (alias: pre-command)');
  console.warn('  pre-command     Same as pre-bash');
  console.warn('                  --validate-safety     Enable safety validation');
  console.warn('                  --prepare-resources   Prepare execution resources');

  console.warn('\nPost-Operation Hooks:');
  console.warn('  post-task       Execute after completing a task');
  console.warn('  post-edit       Auto-format and log edits');
  console.warn('                  --format              Auto-format code');
  console.warn('                  --update-memory       Update agent memory');
  console.warn('                  --train-neural        Train neural patterns');
  console.warn('  post-bash       Log command execution (alias: post-command)');
  console.warn('  post-command    Same as post-bash');
  console.warn('                  --track-metrics       Track performance metrics');
  console.warn('                  --store-results       Store detailed results');
  console.warn('  post-search     Cache search results');

  console.warn('\nMCP Integration Hooks:');
  console.warn('  mcp-initialized    Persist MCP configuration');
  console.warn('  agent-spawned      Update agent roster');
  console.warn('  task-orchestrated  Monitor task progress');
  console.warn('  neural-trained     Save pattern improvements');

  console.warn('\nSession Hooks:');
  console.warn('  session-end        Generate summary and save state');
  console.warn('                     --generate-summary    Generate session summary');
  console.warn('                     --persist-state       Persist session state');
  console.warn('                     --export-metrics      Export performance metrics');
  console.warn('  session-restore    Load previous session state');
  console.warn('  notify             Custom notifications');

  console.warn('\nExamples:');
  console.warn('  hooks pre-command --command "npm test" --validate-safety true');
  console.warn('  hooks pre-edit --file "src/app.js" --auto-assign-agents true');
  console.warn('  hooks post-command --command "build" --track-metrics true');
  console.warn('  hooks post-edit --file "src/app.js" --format true --train-neural true');
  console.warn('  hooks session-end --generate-summary true --export-metrics true');
  console.warn('  hooks agent-spawned --name "CodeReviewer" --type "reviewer"');
  console.warn('  hooks post-task --task-id "build-task" --analyze-performance true');

  console.warn('\nCompatibility:');
  console.warn('  • pre-command and pre-bash are aliases');
  console.warn('  • post-command and post-bash are aliases');
  console.warn('  • Both --dash-case and camelCase parameters supported');
  console.warn('  • All parameters from settings.json template supported');
}

export default hooksAction;
