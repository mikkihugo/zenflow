import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { SwarmOrchestrator } from './swarm-orchestrator.js';
import { scanForUnmappedServices } from '../scanners/service-scanner.js';
import { scanForMissingScopeFiles } from '../scanners/scope-scanner.js';
import inquirer from 'inquirer';
import { generateText } from '../ai-service.js';
// New plugin system imports
import { PluginManager } from '../../plugins/plugin-manager.js';
import { scanForDocumentationLinks } from '../scanners/documentation-linker.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

// ruv-swarm library integration for persistent hives
import { 
  isRuvSwarmAvailable, 
  initializePersistentHive, 
  restorePersistentHive,
  getServiceHivePath 
} from './ruv-swarm-integration.js';

const HIVE_MIND_DIR = path.join(process.cwd(), '.hive-mind');
const HIVE_REGISTRY_FILE = path.join(HIVE_MIND_DIR, 'registry.json');

export async function readHiveRegistry() {
  try {
    const content = await readFile(HIVE_REGISTRY_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeHiveRegistry(registry) {
  await writeFile(HIVE_REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

async function createHive(args, flags) {
  const hiveName = args[0];
  if (!hiveName) {
    console.error('Error: Please provide a name for the hive.');
    return;
  }

  const servicePath = flags.path || path.join(process.cwd(), 'services', hiveName);
  const hiveDbPath = path.join(servicePath, '.hive', `${hiveName}.db`);

  await mkdir(path.dirname(hiveDbPath), { recursive: true });

  const registry = await readHiveRegistry();
  if (registry[hiveName]) {
    console.error(`Error: Hive "${hiveName}" already exists.`);
    return;
  }
  registry[hiveName] = { path: hiveDbPath };
  await writeHiveRegistry(registry);

  console.log(`Successfully created hive "${hiveName}" at ${servicePath}`);
}

async function assignTask(args, flags) {
  const hiveName = flags.name;
  if (!hiveName) {
    console.error('Error: Please specify a hive to assign the task to with the --name flag.');
    return;
  }

  const registry = await readHiveRegistry();
  const hiveInfo = registry[hiveName];
  if (!hiveInfo) {
    console.error(`Error: Hive "${hiveName}" not found.`);
    return;
  }

  const objective = args.join(' ').trim();
  if (!objective) {
    console.error('Error: Please provide an objective for the task.');
    return;
  }

  // Use persistent service-level hive instead of basic swarm
  await launchServiceHive(objective, { ...flags, hiveName, dbPath: hiveInfo.path });
}

async function scanCommand(args, flags) {
  console.log('Scanning project...');
  
  // Initialize plugin manager
  const pluginManager = new PluginManager();
  await pluginManager.initialize();
  
  // Use new plugin system for scanning
  const serviceSuggestions = await scanForUnmappedServices(flags);
  const scopeSuggestions = await scanForMissingScopeFiles(flags);
  const documentationLinkSuggestions = await scanForDocumentationLinks(flags);
  
  // Plugin-based scanning
  const pluginSuggestions = [];
  
  // Run scanner plugins
  const scannerPlugins = ['code-complexity-scanner', 'dependency-scanner', 'markdown-scanner'];
  for (const pluginName of scannerPlugins) {
    try {
      const plugin = pluginManager.getPlugin(pluginName);
      if (plugin) {
        const results = await plugin.scan(process.cwd(), flags);
        if (results && results.suggestions) {
          pluginSuggestions.push(...results.suggestions);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Plugin ${pluginName} failed: ${error.message}`);
    }
  }
  
  const suggestions = [...serviceSuggestions, ...scopeSuggestions, ...documentationLinkSuggestions, ...pluginSuggestions];

  for (const suggestion of suggestions) {
    console.log(`\n[Suggestion ${suggestion.id}/${suggestions.length}]`);
    console.log(suggestion.description);

    const { choice } = await inquirer.prompt([
      {
        type: 'expand',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          { key: 'y', name: 'Yes, apply this change', value: 'yes' },
          { key: 'n', name: 'No, skip this change', value: 'no' },
          { key: 'r', name: 'Refine this suggestion', value: 'refine' },
          { key: 's', name: 'Skip all remaining suggestions', value: 'skip_all' },
          { key: 'q', name: 'Quit and exit the scanner', value: 'quit' },
        ],
      },
    ]);

    if (choice === 'yes') {
      console.log('Applying suggestion...');
      switch (suggestion.action) {
        case 'create_hive':
          await createHive([suggestion.servicePath.split('/')[1]], { path: suggestion.servicePath });
          break;
        case 'create_scope_file':
          const scopeFilePath = path.join(suggestion.servicePath, 'scope.md');
          await writeFile(scopeFilePath, suggestion.generatedScope);
          console.log(`Created ${scopeFilePath}`);
          break;
        case 'add_md_header':
          const fileContent = await readFile(suggestion.file, 'utf8');
          await writeFile(suggestion.file, suggestion.suggestedHeader + fileContent);
          console.log(`Added header to ${suggestion.file}`);
          break;
        case 'fix_md_lint':
          console.log(`Please manually fix linting issue in ${suggestion.file} at line ${suggestion.lineNumber}: ${suggestion.rule}`);
          break;
        case 'suggest_adr':
          const adrDir = path.join(process.cwd(), '.hive-mind', 'adrs');
          await mkdir(adrDir, { recursive: true });
          const adrFileName = `${suggestion.adrTitle.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.md`;
          const adrFilePath = path.join(adrDir, adrFileName);
          await writeFile(adrFilePath, suggestion.adrContent);
          console.log(`Created ADR: ${adrFilePath}`);
          break;
        case 'fix_syntax':
          console.log(`Please manually fix syntax error in ${suggestion.file}: ${suggestion.errorMessage}`);
          break;
        case 'fix_formatting':
          await writeFile(suggestion.file, suggestion.formattedContent);
          console.log(`Fixed formatting in ${suggestion.file}`);
          break;
        case 'suggest_refactor':
          console.log(`Refactoring suggestion for ${suggestion.file} - ${suggestion.methodName} (Complexity: ${suggestion.complexity}):`);
          console.log(suggestion.refactorSuggestion);
          console.log(`Please review and apply manually.`);
          break;
        case 'suggest_doc_link':
          console.log(`Documentation linking suggestion: ${suggestion.description}`);
          console.log(`Files: ${suggestion.files.join(', ')}`);
          console.log(`Common Keywords: ${suggestion.commonKeywords.join(', ')}`);
          console.log(`Please review and add links manually.`);
          break;
        default:
          console.error(`Unknown action: ${suggestion.action}`);
      }
    } else if (choice === 'quit') {
      console.log('Quitting scanner.');
      break;
    } else if (choice === 'skip_all') {
      console.log('Skipping all remaining suggestions.');
      break;
    } else if (choice === 'refine') {
      const { refinement } = await inquirer.prompt([{
        type: 'input',
        name: 'refinement',
        message: 'Please provide your feedback or instructions for refinement:',
      }]);

      const newSuggestionDescription = await generateText(`
        Original suggestion: ${suggestion.description}
        User refinement: ${refinement}
        Please generate a new suggestion description based on the user refinement.
      `);

      suggestion.description = `[REFINED] ${newSuggestionDescription}`;
      suggestions.unshift(suggestion);
    }
  }
}

/**
 * Launch persistent service-level hive swarm
 */
async function launchServiceHive(objective, flags = {}) {
  const serviceName = flags.hiveName || flags.service || 'default';
  
  printInfo(`🏗️ Launching persistent hive for service: ${serviceName}`);
  printInfo(`🎯 Objective: "${objective}"`);
  
  const hiveConfig = {
    serviceName,
    strategy: flags.strategy || 'adaptive',
    topology: flags.topology || 'hierarchical',
    maxAgents: flags['max-agents'] || flags.agents || 8,
    persistenceDb: flags.dbPath || getServiceHivePath(serviceName),
    readOnly: flags.analysis || flags['read-only'],
    enableMonitoring: flags.monitor || flags.monitoring,
    background: flags.background
  };

  try {
    let hive;
    
    // Try to restore existing persistent hive first
    hive = await restorePersistentHive(serviceName);
    
    if (!hive) {
      // Create new persistent hive if restoration failed
      if (await isRuvSwarmAvailable()) {
        printInfo('🚀 Creating new persistent hive with ruv-swarm library');
        hive = await initializePersistentHive(hiveConfig);
      } else {
        // Fallback to local orchestrator for basic functionality
        printInfo('🔄 Using local orchestrator (ruv-swarm library unavailable)');
        const orchestrator = new SwarmOrchestrator();
        await orchestrator.initialize();
        return await orchestrator.launchSwarm(objective, hiveConfig);
      }
    }
    
    // Execute objective with persistent hive
    printInfo('🎯 Executing objective with persistent hive coordination');
    const result = await hive.executeObjective(objective, {
      priority: flags.priority || 'high',
      qualityThreshold: flags['quality-threshold'] || 0.8,
      parallel: flags.parallel !== false
    });
    
    printSuccess(`✅ Hive execution completed for service: ${serviceName}`);
    return result;
    
  } catch (error) {
    printError(`Persistent hive failed: ${error.message}`);
    throw error;
  }
}

/**
 * Show hive mind help
 */
function showHiveMindHelp() {
  console.log(`
🧠 HIVE MIND - Advanced AI Orchestration with Collective Intelligence

USAGE:
  claude-zen hive-mind <command> [options]
  claude-zen hive-mind spawn <objective> [options]

COMMANDS:
  create <name>              Create new hive
  assign <objective>         Assign task to hive
  spawn <objective>          Launch swarm with objective (integrated)
  scan                       Scan project for optimization
  status                     Show hive status
  list                       List all hives
  consensus                  View consensus decisions
  metrics                    Performance analytics

OPTIONS:
  --strategy <type>          Execution strategy: research, development, analysis
  --topology <type>          Coordination topology: hierarchical, mesh, ring, star
  --max-agents <n>           Maximum number of agents (default: 5)
  --parallel                 Enable parallel execution
  --monitor                  Real-time monitoring
  --background               Run in background
  --analysis                 Read-only analysis mode
  --quality-threshold <n>    Minimum quality threshold (0-1)

EXAMPLES:
  claude-zen hive-mind create my-project
  claude-zen hive-mind spawn "Build a REST API" --strategy development
  claude-zen hive-mind assign "Research architecture" --name my-hive
  claude-zen hive-mind status --verbose

INTEGRATION:
  • Direct ruv-swarm NPM library integration for high performance
  • Fallback to local orchestrator if ruv-swarm unavailable
  • Unified command interface for all swarm operations
`);
}

export async function hiveMindCommand(input, flags) {
  const subcommand = input[0];
  const subArgs = input.slice(1);

  // Handle help
  if (flags.help || flags.h || subcommand === 'help' || (!subcommand)) {
    showHiveMindHelp();
    return;
  }

  switch (subcommand) {
    case 'create':
      await createHive(subArgs, flags);
      break;
    case 'assign':
      await assignTask(subArgs, flags);
      break;
    case 'spawn':
      // Launch persistent service-level hive
      const objective = subArgs.join(' ').trim();
      if (!objective) {
        printError('Objective required for hive spawn');
        printInfo('Usage: claude-zen hive-mind spawn "Your objective here" --service my-service');
        return;
      }
      await launchServiceHive(objective, flags);
      break;
    case 'scan':
      await scanCommand(subArgs, flags);
      break;
    case 'status':
      await showHiveStatus(flags);
      break;
    case 'list':
      await listHives(flags);
      break;
    case 'consensus':
      await showConsensus(flags);
      break;
    case 'metrics':
      await showHiveMetrics(flags);
      break;
    case 'import':
      await importCommand(subArgs, flags);
      break;
    default:
      console.error(`Error: Unknown hive-mind command "${subcommand}"`);
      showHiveMindHelp();
      break;
  }
}

/**
 * Show hive status
 */
async function showHiveStatus(flags) {
  const registry = await readHiveRegistry();
  const hiveNames = Object.keys(registry);
  
  printInfo('🐝 Hive Mind Status');
  console.log('━'.repeat(60));
  console.log(`📊 Total Hives: ${hiveNames.length}`);
  
  if (hiveNames.length === 0) {
    console.log('No hives found. Create one with: claude-zen hive-mind create <name>');
    return;
  }
  
  for (const [name, info] of Object.entries(registry)) {
    console.log(`\n🏠 ${name}`);
    console.log(`   Path: ${info.path}`);
    // Add more status info as needed
  }
}

/**
 * List all hives
 */
async function listHives(flags) {
  const registry = await readHiveRegistry();
  
  if (flags.json) {
    console.log(JSON.stringify(registry, null, 2));
  } else {
    printInfo('🐝 Available Hives');
    console.log('━'.repeat(40));
    
    if (Object.keys(registry).length === 0) {
      console.log('No hives found.');
    } else {
      Object.entries(registry).forEach(([name, info]) => {
        console.log(`• ${name} → ${info.path}`);
      });
    }
  }
}

/**
 * Show consensus decisions (placeholder)
 */
async function showConsensus(flags) {
  printInfo('🗳️ Consensus Decisions');
  console.log('━'.repeat(50));
  console.log('Consensus tracking not yet implemented.');
  console.log('This will show collective decisions made by hive agents.');
}

/**
 * Show hive metrics (placeholder)
 */
async function showHiveMetrics(flags) {
  printInfo('📊 Hive Mind Metrics');
  console.log('━'.repeat(50));
  console.log('Metrics tracking not yet implemented.');
  console.log('This will show performance analytics across all hives.');
}

// Export functions for direct CLI use
export { createHive, listHives, showHiveStatus, launchServiceHive };