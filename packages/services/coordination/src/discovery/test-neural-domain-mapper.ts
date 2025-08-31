#!/usr/bin/env node
/**
 * @fileoverview Test Neural Domain Mapper Implementation
 *
 * Simple test to verify the GNN-based domain relationship mapping works
 * and that the documented functionality is actually implemented.
 */

import { NeuralDomainMapper as _NeuralDomainMapper } from './neural-domain-mapper.js';
import type { Domain, DependencyGraph } from './types.js';

async function testNeuralDomainMapper() {
  console.log('🧠 Testing Neural Domain Mapper Implementation...\n');

  // Create sample domain data
  const domains: Domain[] = [
    {
      id: 'domain-1',
      name: 'coordination',
      _path: 'src/coordination',
      files: ['agent.ts', 'swarm.ts', 'protocols.ts'],
      dependencies: ['domain-3', 'domain-4'],
      complexity: 0.7,
      type: 'core',
      language: 'typescript',
      size: { lines: 1500, bytes: 45000 },
      lastModified: new Date(),
    },
    {
      id: 'domain-2',
      name: 'neural',
      _path: 'src/neural',
      files: ['network.ts', 'models.ts', 'wasm.ts'],
      dependencies: ['domain-4'],
      complexity: 0.8,
      type: 'core',
      language: 'typescript',
      size: { lines: 2000, bytes: 60000 },
      lastModified: new Date(),
    },
    {
      id: 'domain-3',
      name: 'interfaces',
      _path: 'src/interfaces',
      files: ['api.ts', 'cli.ts', 'mcp.ts'],
      dependencies: ['domain-1', 'domain-2'],
      complexity: 0.5,
      type: 'interface',
      language: 'typescript',
      size: { lines: 800, bytes: 24000 },
      lastModified: new Date(),
    },
    {
      id: 'domain-4',
      name: 'memory',
      _path: 'src/memory',
      files: ['store.ts', 'cache.ts', 'backends.ts'],
      dependencies: [],
      complexity: 0.6,
      type: 'service',
      language: 'typescript',
      size: { lines: 1200, bytes: 36000 },
      lastModified: new Date(),
    },
  ];

  // Create sample dependency graph
  const dependencies: DependencyGraph = {
    nodes: domains.map((domain) => ({
      id: domain.id,
      domain,
      features: [
        domain.files.length,
        domain.dependencies.length,
        domain.complexity,
        domain.path.split('/').length,
        0, // will be calculated
      ],
    })),
    edges: [
      { source: 'domain-1', target: 'domain-3', weight: 0.8, type: 'import' },
      { source: 'domain-1', target: 'domain-4', weight: 0.6, type: 'call' },
      {
        source: 'domain-2',
        target: 'domain-4',
        weight: 0.7,
        type: 'composition',
      },
      { source: 'domain-3', target: 'domain-1', weight: 0.5, type: 'import' },
      { source: 'domain-3', target: 'domain-2', weight: 0.4, type: 'call' },
    ],
    metadata: {
      totalNodes: 4,
      totalEdges: 5,
      density: 0.42,
      avgDegree: 2.5,
    },
  };

  console.log('📊 Input Data:');
  console.log(`  - Domains: ${domains.length}"Fixed unterminated template"(`  - Dependencies: ${dependencies.edges.length}"Fixed unterminated template"(`  - Graph density: ${dependencies.metadata.density}\n"Fixed unterminated template"(`  ${i + 1}. ${rel.sourceDomain} → ${rel.targetDomain}"Fixed unterminated template"(`     Type: ${rel.relationshipType}"Fixed unterminated template"(`     Strength: ${rel.strength.toFixed(3)}"Fixed unterminated template"(`     Direction: ${rel.direction}"Fixed unterminated template"(`     Confidence: ${rel.confidence.toFixed(3)}\n"Fixed unterminated template"(`  - ${domain?.name || domainId}: ${score.toFixed(3)}"Fixed unterminated template"(`  Recommended: ${topo.recommended}"Fixed unterminated template"(`  Confidence: ${topo.confidence.toFixed(3)}"Fixed unterminated template"(`  Reasons:"Fixed unterminated template"(`    - ${reason}"Fixed unterminated template" `  - ${alt.topology}: ${alt.score.toFixed(3)} (${alt.rationale})"Fixed unterminated template"(`  ${domainName} ${rowStr}"Fixed unterminated template"}"Fixed unterminated template"