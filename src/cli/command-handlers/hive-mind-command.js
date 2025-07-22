import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { swarmCommand } from './swarm-command.js';
import { scanForUnmappedServices } from '../scanners/service-scanner.js';
import { scanForMissingScopeFiles } from '../scanners/scope-scanner.js';
import inquirer from 'inquirer';
import { generateText } from '../ai-service.js';
import { scanMarkdownFiles } from '../scanners/markdown-scanner.js';
import { scanForDependencyConflicts } from '../scanners/dependency-scanner.js';
import { scanJsonYamlFiles } from '../scanners/json-yaml-scanner.js';
import { scanForCodeComplexity } from '../scanners/code-complexity-scanner.js';
import { scanForDocumentationLinks } from '../scanners/documentation-linker.js';

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

  const swarmArgs = [objective];
  const swarmFlags = { ...flags, internal: true, dbPath: hiveInfo.path };
  await swarmCommand(swarmArgs, swarmFlags);
}

async function scanCommand(args, flags) {
  console.log('Scanning project...');
  const serviceSuggestions = await scanForUnmappedServices(flags);
  const scopeSuggestions = await scanForMissingScopeFiles(flags);
  const markdownSuggestions = await scanMarkdownFiles(flags);
  const dependencySuggestions = await scanForDependencyConflicts(flags);
  const jsonYamlSuggestions = await scanJsonYamlFiles(flags);
  const codeComplexitySuggestions = await scanForCodeComplexity(flags);
  const documentationLinkSuggestions = await scanForDocumentationLinks(flags);
  const suggestions = [...serviceSuggestions, ...scopeSuggestions, ...markdownSuggestions, ...dependencySuggestions, ...jsonYamlSuggestions, ...codeComplexitySuggestions, ...documentationLinkSuggestions];

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

export async function hiveMindCommand(input, flags) {
  const subcommand = input[0];
  const subArgs = input.slice(1);

  switch (subcommand) {
    case 'create':
      await createHive(subArgs, flags);
      break;
    case 'assign':
      await assignTask(subArgs, flags);
      break;
    case 'scan':
      await scanCommand(subArgs, flags);
      break;
    case 'import':
      await importCommand(subArgs, flags);
      break;
    // Add other hive-mind subcommands here
    default:
      console.error(`Error: Unknown hive-mind command "${subcommand}"`);
      // You might want to show help here
      break;
  }
}