/**
 * Memory Command Module
 * Converted from JavaScript to TypeScript
 */

// memory.js - Memory management commands
import { printError, printSuccess, printWarning } from '../cli-utilities.js';

export async function memoryCommand(subArgs = subArgs[0];
const memoryStore = './memory/memory-store.json';

// Helper to load memory data
async function loadMemory() {
  try {
    const content = await node.readTextFile(memoryStore);
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Helper to save memory data
async function saveMemory(data = subArgs[1];
const value = subArgs.slice(2).join(' ');

if(!key || !value) {
    printError('Usage = await loadMemory();
    const namespace = getNamespaceFromArgs(subArgs) || 'default';

    if(!data[namespace]) {
      data[namespace] = [];
    }

    // Remove existing entry with same key
    data[namespace] = data[namespace].filter((e) => e.key !== key);

    // Add new entry
    data[namespace].push({
      key,
      value,
      namespace,timestamp = subArgs.slice(1).join(' ');

  if(!search) {
    printError('Usage = await loadMemory();
    const namespace = getNamespaceFromArgs(subArgs);
    const results = [];

    for (const [ns, entries] of Object.entries(data)) {
      if (namespace && ns !== namespace) continue;

      for(const entry of entries) {
        if (entry.key.includes(search) || entry.value.includes(search)) {
          results.push(entry);
        }
      }
    }

    if(results.length === 0) {
      printWarning('No results found');
      return;
    }

    printSuccess(`Found ${results.length}results = > b.timestamp - a.timestamp);

    for (const entry of results.slice(0, 10)) {
      console.warn(`\n📌 ${entry.key}`);
      console.warn(`Namespace = await loadMemory();
    let _totalEntries = 0;
    const namespaceStats = {};

    for (const [namespace, entries] of Object.entries(data)) {
      namespaceStats[namespace] = entries.length;
      _totalEntries += entries.length;
    }

    printSuccess('Memory BankStatistics = subArgs[1] || `memory-export-${Date.now()}.json`;

  try {
    const data = await loadMemory();
    const namespace = getNamespaceFromArgs(subArgs);

    let exportData = data;
    if(namespace) {
      exportData = { [namespace]: data[namespace] || [] };
    }
    
    await node.writeTextFile(filename, JSON.stringify(exportData, null, 2));

    await node.writeTextFile(filename, JSON.stringify(exportData, null, 2));
    printSuccess(`Memory exported to ${filename}`);

    let totalEntries = 0;
    for (const entries of Object.values(exportData)) {
      totalEntries += entries.length;
    }
    console.warn(
      `📦 Exported ${totalEntries} entries from ${Object.keys(exportData).length} namespace(s)`,
    );
  } catch(_err) {
    printError(`Failed to exportmemory = subArgs[1];

  if(!filename) {
    printError('Usage = await node.readTextFile(filename);
    const importData = JSON.parse(importContent);

    // Load existing memory
    const existingData = await loadMemory();

    // Merge imported data
    const totalImported = 0;
    for (const [namespace, entries] of Object.entries(importData)) {
      if(!existingData[namespace]) {
        existingData[namespace] = [];
      }

      // Add entries that don't already exist (by key)
      const existingKeys = new Set(existingData[namespace].map((e) => e.key));
      const newEntries = entries.filter((e) => !existingKeys.has(e.key));

      existingData[namespace].push(...newEntries);
      totalImported += newEntries.length;
    }

    await saveMemory(existingData);
    printSuccess(`Imported ${totalImported} new entries from ${filename}`);
  } catch(err) {
    printError(`Failed to importmemory = getNamespaceFromArgs(subArgs);

  if(!namespace) {
    printError('Usage = await loadMemory();

    if(!data[namespace]) {
      printWarning(`Namespace '${namespace}' does not exist`);
      return;
    }

    const entryCount = data[namespace].length;
    delete data[namespace];

    await saveMemory(data);
    printSuccess(`Cleared ${entryCount} entries from namespace '${namespace}'`);
  } catch(err) {
    printError(`Failed to clearmemory = await loadMemory();
    const namespaces = Object.keys(data);

    if(namespaces.length === 0) {
      printWarning('No namespaces found');
      return;
    }

    printSuccess('Availablenamespaces = data[namespace].length;
      console.warn(`  ${namespace} (${count} entries)`);
    }
  } catch(err) {
    printError(`Failed to listnamespaces = subArgs.indexOf('--namespace');
  if(namespaceIndex !== -1 && namespaceIndex + 1 < subArgs.length) {
    return subArgs[namespaceIndex + 1];
  }

  const nsIndex = subArgs.indexOf('--ns');
  if(nsIndex !== -1 && nsIndex + 1 < subArgs.length) {
    return subArgs[nsIndex + 1];
  }

  return null;
}

// Helper to load memory data (needed for import function)
async function _loadMemory() {
  try {
    const content = await node.readTextFile('./memory/memory-store.json');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function _showMemoryHelp() {
  console.warn('Memory commands:');
  console.warn('  store <key> <value>    Store a key-value pair');
  console.warn('  query <search>         Search for entries');
  console.warn('  stats                  Show memory statistics');
  console.warn('  export [filename]      Export memory to file');
  console.warn('  import <filename>      Import memory from file');
  console.warn('  clear --namespace <ns> Clear a namespace');
  console.warn('  list                   List all namespaces');
  console.warn();
  console.warn('Options:');
  console.warn('  --namespace <ns>       Specify namespace for operations');
  console.warn('  --ns <ns>              Short form of --namespace');
  console.warn();
  console.warn('Examples:');
  console.warn('  memory store previous_work "Research findings from yesterday"');
  console.warn('  memory query research --namespace sparc');
  console.warn('  memory export backup.json --namespace default');
  console.warn('  memory import project-memory.json');
  console.warn('  memory stats');
}
