import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import inquirer from 'inquirer';
import { scanForDocumentationLinks } from '../scanners/documentation-linker.js';
import { scanForMissingScopeFiles } from '../scanners/scope-scanner.js';
import { scanForUnmappedServices } from '../scanners/service-scanner.js';
import { printInfo } from '../utils.js';

const _HIVE_MIND_DIR = path.join(process.cwd(), '.hive-mind');
const _HIVE_REGISTRY_FILE = path.join(HIVE_MIND_DIR, 'registry.json');
export async function readHiveRegistry() {
  try {
// const _content = awaitreadFile(HIVE_REGISTRY_FILE, 'utf8');
    return JSON.parse(content);
    //   // LINT: unreachable code removed} catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    //   // LINT: unreachable code removed}
    throw error;
  //   }
// }


async function _writeHiveRegistry() {
    console.error('Error = flags.path  ?? path.join(process.cwd(), 'services', hiveName);
  const _hiveDbPath = path.join(servicePath, '.hive', `${hiveName}.db`);
// await mkdir(path.dirname(hiveDbPath), {recursive = await readHiveRegistry();
  if(registry[hiveName]) {
    console.error(`Error = {path = flags.name;
  if(!hiveName) {
    console.error('Error = await readHiveRegistry();
  const _hiveInfo = registry[hiveName];
  if(!hiveInfo) {
    console.error(`Error = args.join(' ').trim();
  if(!objective) {
    console.error('Error = new PluginManager();
// await pluginManager.initialize();
  // Use new plugin system for scanning
// const __serviceSuggestions = awaitscanForUnmappedServices(flags);
// const __scopeSuggestions = awaitscanForMissingScopeFiles(flags);
// const __documentationLinkSuggestions = awaitscanForDocumentationLinks(flags);

  // Plugin-based scanning
  const _pluginSuggestions = [];

  // Run scanner plugins
  const _scannerPlugins = ['code-complexity-scanner', 'dependency-scanner', 'markdown-scanner'];
  for(const pluginName of scannerPlugins) {
    try {
      const _plugin = pluginManager.getPlugin(pluginName);
      if(plugin) {
// const _results = awaitplugin.scan(process.cwd(), flags);
        if(results?.suggestions) {
          pluginSuggestions.push(...results.suggestions);
        //         }
      //       }
    } catch (/* _error */) {
      console.warn(`⚠️ Plugin ${pluginName}failed = [...serviceSuggestions, ...scopeSuggestions, ...documentationLinkSuggestions, ...pluginSuggestions];

  for(const suggestion of suggestions) {
    console.warn(`\n[Suggestion ${suggestion.id}/${suggestions.length}]`);
    console.warn(suggestion.description);

    const { choice } = await inquirer.prompt([;
      {type = === 'yes')
      console.warn('Applying suggestion...');
      switch(suggestion.action) {
        case 'create_hive':;
// await createHive([suggestion.servicePath.split('/')[1]], {path = path.join(suggestion.servicePath, 'scope.md');
// await writeFile(scopeFilePath, suggestion.generatedScope);
          console.warn(`Created ${scopeFilePath}`);
          break;
        case 'add_md_header': {;
// const _fileContent = awaitreadFile(suggestion.file, 'utf8');
// await writeFile(suggestion.file, suggestion.suggestedHeader + fileContent);
          console.warn(`Added header to ${suggestion.file}`);
          break;
        //         }
        case 'fix_md_lint':;
          console.warn(`Please manually fix linting issue in ${suggestion.file} at line ${suggestion.lineNumber});
          break;
        case 'suggest_adr': {;
          const _adrDir = path.join(process.cwd(), '.hive-mind', 'adrs');
// await mkdir(adrDir, {recursive = `${suggestion.adrTitle.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.md`;
          const _adrFilePath = path.join(adrDir, adrFileName);
// await writeFile(adrFilePath, suggestion.adrContent);
          console.warn(`CreatedADR = === 'quit') {
      console.warn('Quitting scanner.');
      break;
    } else if(choice === 'skip_all') {
      console.warn('Skipping all remaining suggestions.');
      break;
    } else if(choice === 'refine') {
      const { refinement } = await inquirer.prompt([{type = await generateText(`;
        Originalsuggestion = `[REFINED] ${newSuggestionDescription}`;
      suggestions.unshift(suggestion);
        //         }
    //     }
// }


/**
 * Launch persistent service-level hive swarm;
 */;
async function _launchServiceHive(objective = {}) {
  const _serviceName = flags.hiveName  ?? flags.service  ?? 'default';

  printInfo(`🏗️ Launching persistent hive for service = {serviceName = await restorePersistentHive(serviceName);

    if(!hive) {
      // Create new persistent hive if restoration failed
      if (await isRuvSwarmAvailable()) {
        printInfo('🚀 Creating new persistent hive with ruv-swarm library');
        hive = await initializePersistentHive(hiveConfig);
      } else {
        // Fallback to local orchestrator for basic functionality
        printInfo('🔄 Using local orchestrator (ruv-swarm library unavailable)');
        const _orchestrator = new SwarmOrchestrator();
// await orchestrator.initialize();
        return await orchestrator.launchSwarm(objective, hiveConfig);
    //   // LINT: unreachable code removed}
    //     }


    // Execute objective with persistent hive
    printInfo('🎯 Executing objective with persistent hive coordination');
// const _result = awaithive.executeObjective(objective, {priority = = false;
    });

    printSuccess(`✅ Hive execution completed forservice = input[0];
  const _subArgs = input.slice(1);

  // Handle help
  if (flags.help  ?? flags.h  ?? subcommand === 'help'  ?? (!subcommand)) {
    showHiveMindHelp();
    return;
    //   // LINT: unreachable code removed}

  switch(subcommand) {
    case 'create':;
// await createHive(subArgs, flags);
      break;
    case 'assign':;
// await assignTask(subArgs, flags);
      break;
    case 'spawn': {;
      // Launch persistent service-level hive
      const _objective = subArgs.join(' ').trim();
      if(!objective) {
        printError('Objective required for hive spawn');
        printInfo('Usage = await readHiveRegistry();

  printInfo('🐝 Hive Mind Status');
  console.warn('━'.repeat(60));
  console.warn(`📊 TotalHives = === 0) {
    console.warn('No hives found. Create onewith = await readHiveRegistry();

  if(flags.json) {
    console.warn(JSON.stringify(registry, null, 2));
  } else {
    printInfo('🐝 Available Hives');
    console.warn('━'.repeat(40));

    if (Object.keys(registry).length === 0) {
      console.warn('No hives found.');
    } else {
      Object.entries(registry).forEach(([name, info]) => {
        console.warn(`• ${name} → ${info.path}`);
      });
    //     }
  //   }
// }


/**
 * Show consensus decisions (placeholder);
 */;
async function showConsensus(flags) {
  printInfo('🗳️ Consensus Decisions');
  console.warn('━'.repeat(50));
  console.warn('Consensus tracking not yet implemented.');
  console.warn('This will show collective decisions made by hive agents.');
// }


/**
 * Show hive metrics (placeholder);
 */;
async function showHiveMetrics(flags) {
  printInfo('📊 Hive Mind Metrics');
  console.warn('━'.repeat(50));
  console.warn('Metrics tracking not yet implemented.');
  console.warn('This will show performance analytics across all hives.');
// }


// Export functions for direct CLI use
export { createHive, listHives, showHiveStatus, launchServiceHive };

    // 
    }

