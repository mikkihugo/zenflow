#!/usr/bin/env node

/**
 * Fast Import Restoration Script
 * Systematically adds missing imports based on TypeScript error analysis and common patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extended type mappings based on the comprehensive error analysis
const TYPE_MAPPINGS = {
  // Config module
  SystemConfiguration: './types',
  ValidationResult: './types',
  ConfigValidationResult: './types',
  ConfigHealthReport: './types',

  // Core interfaces
  WasmNeuralBinding: '../core/interfaces/base-interfaces',
  NeuralConfig: '../core/interfaces/base-interfaces',
  NeuralNetworkInterface: '../core/interfaces/base-interfaces',
  ILogger: '../core/interfaces/base-interfaces',
  IEventBus: '../core/interfaces/base-interfaces',

  // Common coordination types
  Agent: '../types/agent-types',
  Task: '../types/task-types',
  SwarmConfig: '../types/swarm-types',
  AgentType: '../types/agent-types',
  AgentState: '../types/agent-types',
  AgentId: '../types/agent-types',
  AgentStatus: '../types/agent-types',
  AgentMetrics: '../types/agent-types',

  // Performance and health
  HealthStatus: '../types/health-types',
  PerformanceMetrics: '../types/performance-types',

  // Database types
  IDatabase: '../database/interfaces',
  IRepository: '../database/interfaces',
  IGraphRepository: '../database/interfaces',
  IVectorRepository: '../database/interfaces',
  IMemoryRepository: '../database/interfaces',
  ICoordinationRepository: '../database/interfaces',
  QueryOptions: '../database/interfaces',
  CustomQuery: '../database/interfaces',
  SortCriteria: '../database/interfaces',
  TransactionOperation: '../database/interfaces',
  DatabaseMetadata: '../database/interfaces',

  // Memory types
  MemorySystem: '../memory/memory-system',
  MemoryConfig: '../memory/interfaces',
  JSONValue: '../memory/interfaces',
  BackendInterface: '../memory/interfaces',
  StoreOptions: '../memory/interfaces',
  MemoryStats: '../memory/interfaces',

  // Document types
  DocumentManager: '../core/document-manager',
  DocumentService: '../services/document-service',
  BaseDocumentEntity: '../database/entities/base-document',
  WorkflowEngine: '../workflows/engine',
  VisionDocumentEntity: '../database/entities/vision-document',
  PRDDocumentEntity: '../database/entities/prd-document',
  EpicDocumentEntity: '../database/entities/epic-document',
  FeatureDocumentEntity: '../database/entities/feature-document',
  TaskDocumentEntity: '../database/entities/task-document',
  ADRDocumentEntity: '../database/entities/adr-document',
  ProjectEntity: '../database/entities/project',

  // Event types
  EventMap: '../interfaces/events/types',
  EventMiddleware: '../interfaces/events/types',
  EventBusConfig: '../interfaces/events/types',
  EventListenerAny: '../interfaces/events/types',
  EventMetrics: '../interfaces/events/types',
  SystemEvent: '../interfaces/events/types',
  CoordinationEvent: '../interfaces/events/types',
  CommunicationEvent: '../interfaces/events/types',
  MonitoringEvent: '../interfaces/events/types',
  InterfaceEvent: '../interfaces/events/types',

  // Client types
  ClientManager: '../interfaces/clients/client-manager',
  ClientInstance: '../interfaces/clients/interfaces',
  ClientType: '../interfaces/clients/interfaces',
  HTTPClientConfig: '../interfaces/clients/interfaces',
  WebSocketClientConfig: '../interfaces/clients/interfaces',
  KnowledgeClientConfig: '../interfaces/clients/interfaces',
  MCPClientConfig: '../interfaces/clients/interfaces',

  // Service types
  IService: '../interfaces/services/interfaces',
  ServiceType: '../interfaces/services/types',
  ServiceError: '../interfaces/services/types',
  ServicePriority: '../interfaces/services/types',
  ServiceEnvironment: '../interfaces/services/types',
  ServiceStatus: '../interfaces/services/types',
  ServiceMetrics: '../interfaces/services/types',

  // Common utilities
  getLogger: '../config/logging-config',
  logger: '../config/logging-config',
};

// Directory-specific mappings for context-aware imports
const DIRECTORY_MAPPINGS = {
  'src/config': {
    SystemConfiguration: './types',
    ValidationResult: './types',
    ConfigValidationResult: './types',
    ConfigHealthReport: './types',
    getLogger: './logging-config',
  },
  'src/coordination': {
    Agent: '../types/agent-types',
    Task: '../types/task-types',
    AgentType: '../types/agent-types',
    AgentState: '../types/agent-types',
    SwarmConfig: '../types/swarm-types',
    ILogger: '../core/interfaces/base-interfaces',
    IEventBus: '../core/interfaces/base-interfaces',
  },
  'src/database': {
    IRepository: './interfaces',
    IGraphRepository: './interfaces',
    IVectorRepository: './interfaces',
    QueryOptions: './interfaces',
  },
  'src/interfaces': {
    ILogger: '../core/interfaces/base-interfaces',
    IEventBus: '../core/interfaces/base-interfaces',
  },
};

function getTypeScriptErrors() {
  console.log('🔍 Getting TypeScript compilation errors...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout?.toString() || '';
    return parseErrors(output);
  }
}

function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(
      /^(.+\.ts)\((\d+),(\d+)\): error TS2304: Cannot find name '([^']+)'/,
    );
    if (match) {
      const [, filePath, lineNum, col, typeName] = match;
      errors.push({
        file: filePath,
        line: parseInt(lineNum),
        column: parseInt(col),
        type: 'TS2304',
        typeName,
        message: line,
      });
    }
  }

  return errors;
}

function getImportPathForType(filePath, typeName) {
  // Check directory-specific mappings first
  const dir = path.dirname(filePath);
  if (DIRECTORY_MAPPINGS[dir] && DIRECTORY_MAPPINGS[dir][typeName]) {
    return DIRECTORY_MAPPINGS[dir][typeName];
  }

  // Check if it's a config directory file
  if (dir.includes('src/config')) {
    if (
      [
        'SystemConfiguration',
        'ValidationResult',
        'ConfigValidationResult',
        'ConfigHealthReport',
      ].includes(typeName)
    ) {
      return './types';
    }
  }

  // Check global mappings
  if (TYPE_MAPPINGS[typeName]) {
    return TYPE_MAPPINGS[typeName];
  }

  return null;
}

function addMissingImport(filePath, typeName, importPath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check if import already exists
    const importRegex = new RegExp(
      `import.*{[^}]*\\b${typeName}\\b[^}]*}.*from.*['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
    );
    if (importRegex.test(content)) {
      return false; // Already imported
    }

    // Find existing imports from the same path
    const existingImportIndex = lines.findIndex(
      (line) =>
        line.includes(`from '${importPath}'`) ||
        line.includes(`from "${importPath}"`),
    );

    if (existingImportIndex !== -1) {
      // Add to existing import
      const existingLine = lines[existingImportIndex];
      const match = existingLine.match(
        /import\s*(?:type\s*)?\{\s*([^}]+)\s*\}/,
      );
      if (match) {
        const imports = match[1]
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        if (!imports.includes(typeName)) {
          imports.push(typeName);
          imports.sort(); // Keep imports sorted
          const newImportLine = existingLine.replace(
            /\{[^}]+\}/,
            `{ ${imports.join(', ')} }`,
          );
          lines[existingImportIndex] = newImportLine;
          fs.writeFileSync(filePath, lines.join('\n'));
          return true;
        }
      }
    } else {
      // Add new import after existing imports
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        } else if (
          lines[i].trim() === '' &&
          i > 0 &&
          lines[i - 1].trim().startsWith('import ')
        ) {
          insertIndex = i;
          break;
        }
      }

      const newImport = `import type { ${typeName} } from '${importPath}';`;
      lines.splice(insertIndex, 0, newImport);
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }
  } catch (error) {
    console.warn(
      `Failed to add import for ${typeName} in ${filePath}:`,
      error.message,
    );
  }

  return false;
}

function main() {
  console.log('🚀 Fast Import Restoration Script');
  console.log('==================================');

  const errors = getTypeScriptErrors();
  const ts2304Errors = errors.filter((e) => e.type === 'TS2304');

  console.log(
    `📊 Found ${ts2304Errors.length} TS2304 "Cannot find name" errors`,
  );

  if (ts2304Errors.length === 0) {
    console.log('✅ No TypeScript TS2304 errors found!');
    return;
  }

  // Group by file for efficiency
  const errorsByFile = {};
  for (const error of ts2304Errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  let fixedCount = 0;
  let skippedCount = 0;
  let processedFiles = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    console.log(`\n🔧 Processing ${filePath} (${fileErrors.length} errors)`);
    processedFiles++;

    // Get unique type names for this file
    const uniqueTypes = [...new Set(fileErrors.map((e) => e.typeName))];

    let fileFixCount = 0;
    for (const typeName of uniqueTypes) {
      const importPath = getImportPathForType(filePath, typeName);
      if (importPath) {
        const added = addMissingImport(filePath, typeName, importPath);
        if (added) {
          console.log(`   ✅ Added: ${typeName} from '${importPath}'`);
          fixedCount++;
          fileFixCount++;
        } else {
          console.log(`   ⚪ Already imported: ${typeName}`);
        }
      } else {
        console.log(`   ❓ Unknown type: ${typeName} (manual review needed)`);
        skippedCount++;
      }
    }

    // Show progress every 10 files
    if (processedFiles % 10 === 0) {
      console.log(
        `📈 Progress: ${processedFiles}/${Object.keys(errorsByFile).length} files processed`,
      );
    }
  }

  console.log('\n📊 Final Summary:');
  console.log(`   📁 Files processed: ${processedFiles}`);
  console.log(`   ✅ Imports added: ${fixedCount}`);
  console.log(`   ❓ Types needing manual review: ${skippedCount}`);

  // Verify improvements
  console.log('\n🔍 Verifying improvements...');
  const remainingErrors = getTypeScriptErrors().filter(
    (e) => e.type === 'TS2304',
  );
  const improvement = ts2304Errors.length - remainingErrors.length;

  console.log(
    `📈 Progress: ${improvement}/${ts2304Errors.length} TS2304 errors resolved (${Math.round((improvement / ts2304Errors.length) * 100)}%)`,
  );

  if (remainingErrors.length > 0) {
    console.log(`\n🔍 Remaining TS2304 errors: ${remainingErrors.length}`);

    // Show top 10 remaining unknown types
    const remainingTypes = [...new Set(remainingErrors.map((e) => e.typeName))];
    console.log('🔍 Top remaining unknown types (need manual mapping):');
    remainingTypes.slice(0, 10).forEach((type) => {
      console.log(`   - ${type}`);
    });

    if (remainingTypes.length > 10) {
      console.log(`   ... and ${remainingTypes.length - 10} more`);
    }
  } else {
    console.log('\n🎉 ALL TS2304 errors resolved!');
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run build (to verify fixes)');
  console.log('   2. Review remaining unknown types');
  console.log('   3. Add mappings to TYPE_MAPPINGS for any remaining types');
  console.log('   4. Test transformers on clean files');
}

if (require.main === module) {
  main();
}
