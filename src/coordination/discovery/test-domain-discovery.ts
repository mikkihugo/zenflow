#!/usr/bin/env node

/**
 * Test script for Domain Discovery Bridge
 * 
 * Demonstrates how the DomainDiscoveryBridge connects document processing
 * with domain analysis to automatically discover domains in a codebase.
 * 
 * @example
 * ```bash
 * # Run the test
 * npx ts-node src/coordination/discovery/test-domain-discovery.ts
 * 
 * # With a specific project path
 * npx ts-node src/coordination/discovery/test-domain-discovery.ts /path/to/project
 * ```
 */

import { DocumentProcessor } from '../../core/document-processor';
import { DomainAnalysisEngine } from '../../tools/domain-splitting/analyzers/domain-analyzer';
import ProjectContextAnalyzer from '../../knowledge/project-context-analyzer';
import { IntelligenceCoordinationSystem } from '../../knowledge/intelligence-coordination-system';
import { DomainDiscoveryBridge } from './domain-discovery-bridge';
import { MemorySystem } from '../../core/memory-system';
import { WorkflowEngine } from '../../core/workflow-engine';
import { EventBus } from '../../core/event-bus';
import { createLogger } from '../../core/logger';

const logger = createLogger('DomainDiscoveryTest');

/**
 * Test the Domain Discovery Bridge with a real project
 * 
 * @param projectPath - Path to the project to analyze
 */
async function testDomainDiscovery(projectPath: string = process.cwd()) {
  console.log('\n🔍 Testing Domain Discovery Bridge\n');
  console.log(`Project Path: ${projectPath}\n`);

  try {
    // Step 1: Initialize core systems
    console.log('1️⃣ Initializing core systems...');
    
    // Create memory system
    const memorySystem = new MemorySystem({
      backend: 'json',
      persistPath: './.claude/cache/domain-discovery-test'
    });
    await memorySystem.initialize();

    // Create workflow engine
    const workflowEngine = new WorkflowEngine({
      workflowPath: './workflows',
      enableMonitoring: true
    });

    // Create document processor
    const documentProcessor = new DocumentProcessor(
      memorySystem,
      workflowEngine,
      {
        workspaceRoot: projectPath,
        autoWatch: false,
        enableWorkflows: false
      }
    );
    await documentProcessor.initialize();

    // Create domain analyzer
    const domainAnalyzer = new DomainAnalysisEngine({
      analysisDepth: 'medium',
      includeTests: false,
      includeConfig: false,
      minFilesForSplit: 3,
      coupling: {
        threshold: 0.7,
        maxGroupSize: 10
      }
    });

    // Create project context analyzer
    const projectAnalyzer = new ProjectContextAnalyzer({
      projectRoot: projectPath,
      swarmConfig: {
        name: 'domain-discovery-test',
        type: 'knowledge',
        maxAgents: 1
      },
      analysisDepth: 'shallow',
      autoUpdate: false,
      cacheDuration: 1
    });

    // Create event bus for intelligence coordinator
    const eventBus = new EventBus();

    // Create intelligence coordination system
    const intelligenceCoordinator = new IntelligenceCoordinationSystem(
      {
        expertiseDiscovery: { enabled: true },
        knowledgeRouting: { enabled: true },
        specializationDetection: { enabled: true },
        crossDomainTransfer: { enabled: true },
        collectiveMemory: { enabled: true }
      },
      logger,
      eventBus
    );

    console.log('✅ Core systems initialized\n');

    // Step 2: Create Domain Discovery Bridge
    console.log('2️⃣ Creating Domain Discovery Bridge...');
    const bridge = new DomainDiscoveryBridge(
      documentProcessor,
      domainAnalyzer,
      projectAnalyzer,
      intelligenceCoordinator,
      {
        confidenceThreshold: 0.6,
        autoDiscovery: true,
        maxDomainsPerDocument: 3,
        useNeuralAnalysis: true,
        enableCache: true
      }
    );

    // Listen for events
    bridge.on('initialized', () => {
      console.log('✅ Domain Discovery Bridge initialized');
    });

    bridge.on('discovery:complete', (results) => {
      console.log(`\n✅ Discovery complete!`);
      console.log(`   - Domains found: ${results.domainCount}`);
      console.log(`   - Documents analyzed: ${results.documentCount}`);
      console.log(`   - Mappings created: ${results.mappingCount}`);
    });

    await bridge.initialize();
    console.log('✅ Bridge created and initialized\n');

    // Step 3: Load workspace
    console.log('3️⃣ Loading workspace...');
    const workspaceId = await documentProcessor.loadWorkspace(projectPath);
    console.log(`✅ Workspace loaded: ${workspaceId}\n`);

    // Step 4: Run domain discovery
    console.log('4️⃣ Running domain discovery...');
    console.log('This will:');
    console.log('   - Analyze monorepo structure');
    console.log('   - Scan all documents');
    console.log('   - Extract concepts using NLP');
    console.log('   - Map documents to code domains');
    console.log('   - Validate with human simulation\n');

    const domains = await bridge.discoverDomains();

    // Step 5: Display results
    console.log('\n📊 Discovery Results:\n');
    console.log(`Found ${domains.length} domains:\n`);

    domains.forEach((domain, index) => {
      console.log(`${index + 1}. ${domain.name.toUpperCase()}`);
      console.log(`   ID: ${domain.id}`);
      console.log(`   Description: ${domain.description}`);
      console.log(`   Confidence: ${(domain.confidence * 100).toFixed(1)}%`);
      console.log(`   Documents: ${domain.documents.length}`);
      console.log(`   Code Files: ${domain.codeFiles.length}`);
      console.log(`   Key Concepts: ${domain.concepts.slice(0, 5).join(', ')}`);
      console.log(`   Suggested Topology: ${domain.suggestedTopology}`);
      if (domain.relatedDomains.length > 0) {
        console.log(`   Related Domains: ${domain.relatedDomains.join(', ')}`);
      }
      console.log('');
    });

    // Step 6: Show document mappings
    const mappings = bridge.getDocumentMappings();
    if (mappings.size > 0) {
      console.log('📄 Document-Domain Mappings:\n');
      let mappingIndex = 0;
      mappings.forEach((mapping, docPath) => {
        if (mappingIndex < 5) { // Show first 5 mappings
          console.log(`${docPath.split('/').pop()} →`);
          mapping.domainIds.forEach((domainId, i) => {
            console.log(`   - ${domainId} (${(mapping.confidenceScores[i] * 100).toFixed(0)}%)`);
          });
          console.log('');
          mappingIndex++;
        }
      });
      if (mappings.size > 5) {
        console.log(`... and ${mappings.size - 5} more mappings\n`);
      }
    }

    // Step 7: Monorepo information
    const monorepoInfo = projectAnalyzer.getMonorepoInfo();
    if (monorepoInfo && monorepoInfo.type !== 'none') {
      console.log('📦 Monorepo Information:\n');
      console.log(`   Type: ${monorepoInfo.type}`);
      console.log(`   Tool: ${monorepoInfo.tool || 'N/A'}`);
      console.log(`   Confidence: ${(monorepoInfo.confidence * 100).toFixed(1)}%`);
      if (monorepoInfo.packages) {
        console.log(`   Packages: ${monorepoInfo.packages.slice(0, 5).join(', ')}${monorepoInfo.packages.length > 5 ? '...' : ''}`);
      }
      console.log('');
    }

    // Step 8: Performance metrics
    console.log('⚡ Performance Metrics:\n');
    const stats = await documentProcessor.getStats();
    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Documents by Type:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`     - ${type}: ${count}`);
      }
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await bridge.shutdown();
    await documentProcessor.shutdown();
    await projectAnalyzer.shutdown();
    await intelligenceCoordinator.shutdown();
    await memorySystem.shutdown();

    console.log('✅ Test complete!\n');

  } catch (error) {
    console.error('\n❌ Error during domain discovery test:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log('🚀 Domain Discovery Bridge Test');
  console.log('================================\n');
  console.log('This test demonstrates how the DomainDiscoveryBridge:');
  console.log('1. Connects document processing with domain analysis');
  console.log('2. Extracts concepts from documents using NLP');
  console.log('3. Maps documents to code domains');
  console.log('4. Provides human validation touchpoints');
  console.log('5. Generates enriched domain metadata\n');

  await testDomainDiscovery(projectPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { testDomainDiscovery };