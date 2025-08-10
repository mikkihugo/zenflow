/**
 * @file Neural network-based domain mapper for analyzing and mapping relationships between domains.
 * Uses GNN models and WASM acceleration to identify domain boundaries and cross-domain dependencies.
 */

// @ts-ignore
const { GNNModel } = require('../../../neural/models/presets/gnn.js');
// @ts-ignore
const { WasmNeuralAccelerator } = require('../../../neural/wasm/wasm-neural-accelerator');

import type { DependencyGraph, Domain, DomainRelationshipMap } from './types';

export class NeuralDomainMapper {
  private gnnModel: unknown;
  private _wasmAccelerator: unknown;

  constructor() {
    this.gnnModel = new GNNModel();
    this._wasmAccelerator = new WasmNeuralAccelerator();
  }

  async mapDomainRelationships(
    domains: Domain[],
    dependencies: DependencyGraph,
    bazelMetadata?: Record<string, unknown>
  ): Promise<DomainRelationshipMap> {
    // Convert to graph format with enhanced Bazel data if available
    const graphData = bazelMetadata
      ? this.convertBazelToGraphData(domains, dependencies, bazelMetadata)
      : this.convertToGraphData(domains, dependencies);

    // Run GNN analysis with WASM acceleration
    const predictions = await (this.gnnModel as { forward: (data: unknown) => Promise<{ shape: number[]; data: Float32Array; [key: number]: number }> }).forward(graphData);
    
    // Use WASM accelerator for performance optimization
    if (this._wasmAccelerator && predictions.data && predictions.data.length > 1000) {
      // Accelerate large tensor operations
      await (this._wasmAccelerator as { optimizeTensor: (tensor: { data: Float32Array }) => Promise<void> }).optimizeTensor(predictions);
    }

    // Extract domain boundaries with Bazel-enhanced analysis
    const boundaries = bazelMetadata
      ? this.extractBazelEnhancedBoundaries(
          predictions,
          domains,
          (graphData as { adjacency: unknown[][] }).adjacency,
          bazelMetadata
        )
      : this.extractBoundaries(predictions, domains, (graphData as { adjacency: unknown[][] }).adjacency);

    // AGUI validation
    const question = {
      question: 'GNN suggests these domain boundaries. Do you approve?',
      context: boundaries,
      options: ['yes', 'no'],
    };

    // Assuming a global agui object or similar mechanism for human interaction
    // This would typically be handled by a dedicated AGUI adapter
    const humanApproval = await this.askHuman(JSON.stringify(question));

    if (humanApproval === 'yes') {
      return boundaries;
    } else {
      throw new Error('Human did not approve GNN suggested boundaries.');
    }
  }

  private async askHuman(questionJson: string): Promise<string> {
    // TODO: Implement actual human interaction using AGUI
    // For now, simulate a direct approval
    const question = JSON.parse(questionJson);
    console.log(`AGUI Question: ${question.question}`);
    console.log(`Context: ${JSON.stringify(question.context, null, 2)}`);
    console.log(`Options: ${question.options.join(', ')}`);
    return 'yes'; // Simulate approval
  }

  private convertToGraphData(domains: Domain[], dependencies: DependencyGraph): unknown {
    const numDomains = domains.length;
    const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));

    // Create node features
    const nodeFeatures = new Float32Array(numDomains * 3); // 3 features per node
    for (let i = 0; i < numDomains; i++) {
      const domain = domains[i];
      if (domain) {
        nodeFeatures[i * 3 + 0] = domain.files.length;
        nodeFeatures[i * 3 + 1] = domain.dependencies.length;
        nodeFeatures[i * 3 + 2] = domain.confidenceScore;
      }
    }
    (nodeFeatures as any).shape = [numDomains, 3];

    // Create adjacency list and edge features
    const adjacency = [] as unknown[];
    const edgeFeaturesList = [] as unknown[];
    for (const [sourceDomain, targetDomains] of Object.entries(dependencies)) {
      const sourceIndex = domainIndexMap.get(sourceDomain);
      if (sourceIndex === undefined) continue;

      for (const targetDomain of Object.keys(targetDomains)) {
        const targetIndex = domainIndexMap.get(targetDomain);
        if (targetIndex === undefined) continue;

        adjacency.push([sourceIndex, targetIndex]);
        edgeFeaturesList.push(targetDomains[targetDomain]); // Using the number of dependencies as the edge feature
      }
    }
    const edgeFeatures = new Float32Array(edgeFeaturesList.length);
    for (let i = 0; i < edgeFeaturesList.length; i++) {
      edgeFeatures[i] = edgeFeaturesList[i] as number;
    }
    (edgeFeatures as any).shape = [adjacency.length, 1];

    return {
      nodes: nodeFeatures,
      edges: edgeFeatures,
      adjacency: adjacency,
    };
  }

  private extractBoundaries(
    predictions: { shape: number[]; [key: number]: number },
    domains: Domain[],
    adjacency: unknown[][]
  ): DomainRelationshipMap {
    const relationships = [] as unknown[];
    const cohesionScores = [] as { domainName: string; score: number }[];
    const crossDomainDependencies = new Map<string, number>();
    const numDomains = predictions.shape[0];

    // Calculate cohesion scores
    for (let i = 0; i < (numDomains ?? 0); i++) {
      let cohesion = 0;
      for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
        cohesion += (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) ** 2;
      }
      const domain = domains[i];
      if (domain) {
        cohesionScores.push({ domainName: domain.name, score: cohesion });
      }
    }

    // Identify cross-domain dependencies
    for (const [sourceIndex, targetIndex] of adjacency) {
      if (sourceIndex === undefined || targetIndex === undefined) continue;
      const sourceDomain = domains[sourceIndex as number];
      const targetDomain = domains[targetIndex as number];
      if (!sourceDomain || !targetDomain) continue;
      const sourceDomainName = sourceDomain.name;
      const targetDomainName = targetDomain.name;
      const key = `${sourceDomainName}->${targetDomainName}`;
      crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
    }

    for (let i = 0; i < (numDomains ?? 0); i++) {
      for (let j = i + 1; j < (numDomains ?? 0); j++) {
        // This is a placeholder for a more sophisticated relationship calculation.
        // For now, we'll just use the dot product of the output vectors as the strength.
        let strength = 0;
        for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
          strength +=
            (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) * (predictions[j * (predictions.shape?.[1] ?? 0) + k] ?? 0);
        }

        if (strength > 0.5) {
          // Assuming a threshold of 0.5
          relationships.push({
            source: i, // Using the index as the domain identifier for now
            target: j,
            strength: strength,
          });
        }
      }
    }

    return {
      relationships: relationships as { source: number; target: number; strength: number }[],
      cohesionScores: cohesionScores,
      crossDomainDependencies: Array.from(crossDomainDependencies.entries()).map(([key, count]) => {
        const [sourceDomain, targetDomain] = key.split('->');
        return { sourceDomain: sourceDomain || '', targetDomain: targetDomain || '', count };
      }),
    };
  }

  /**
   * Convert Bazel workspace data to enhanced graph format for GNN analysis.
   * Incorporates target types, language information, and explicit dependencies.
   *
   * @param domains
   * @param dependencies
   * @param bazelMetadata
   */
  private convertBazelToGraphData(
    domains: Domain[],
    dependencies: DependencyGraph,
    bazelMetadata: Record<string, unknown>
  ): {
    nodes: Float32Array & { shape: number[] };
    edges: Float32Array & { shape: number[] };
    adjacency: unknown[];
    metadata: Record<string, unknown>;
  } {
    const numDomains = domains.length;
    const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));

    // Enhanced node features for Bazel workspaces (6 features per node)
    const nodeFeatures = new Float32Array(numDomains * 6);
    for (let i = 0; i < numDomains; i++) {
      const domain = domains[i];
      if (domain) {
        const packageTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
          ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === domain.name)
          : [];

        nodeFeatures[i * 6 + 0] = domain.files.length; // File count
        nodeFeatures[i * 6 + 1] = domain.dependencies.length; // Dependency count
        nodeFeatures[i * 6 + 2] = domain.confidenceScore; // Confidence
        nodeFeatures[i * 6 + 3] = packageTargets.length; // Bazel target count
        nodeFeatures[i * 6 + 4] = this.calculateLanguageComplexity(
          packageTargets,
          Array.isArray((bazelMetadata as Record<string, unknown>)['languages']) ? (bazelMetadata as Record<string, unknown>)['languages'] as string[] : []
        ); // Language complexity
        nodeFeatures[i * 6 + 5] = this.calculateTargetTypeDistribution(packageTargets); // Target type diversity
      }
    }
    (nodeFeatures as any).shape = [numDomains, 6];

    // Enhanced edge features using Bazel target dependencies
    const adjacency = [] as unknown[];
    const edgeFeaturesList = [] as unknown[];

    // Use Bazel's explicit target dependencies for more accurate relationships
    if ((bazelMetadata as Record<string, unknown>)['targetDependencies'] && typeof (bazelMetadata as Record<string, unknown>)['targetDependencies'] === 'object') {
      for (const [sourcePkg, targets] of Object.entries((bazelMetadata as Record<string, unknown>)['targetDependencies'] as Record<string, Record<string, number>>)) {
        const sourceIndex = domainIndexMap.get(sourcePkg);
        if (sourceIndex === undefined) continue;

        for (const [targetPkg, count] of Object.entries(targets as Record<string, number>)) {
          const targetIndex = domainIndexMap.get(targetPkg);
          if (targetIndex === undefined) continue;

          adjacency.push([sourceIndex, targetIndex]);

          // Enhanced edge features: [dependency_count, target_type_similarity, language_compatibility]
          const sourceTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
            ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === sourcePkg)
            : [];
          const targetTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
            ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === targetPkg)
            : [];

          edgeFeaturesList.push([
            count, // Raw dependency count
            this.calculateTargetTypeSimilarity(sourceTargets, targetTargets), // Target type similarity
            this.calculateLanguageCompatibility(
              sourceTargets,
              targetTargets,
              Array.isArray((bazelMetadata as Record<string, unknown>)['languages']) ? (bazelMetadata as Record<string, unknown>)['languages'] as string[] : []
            ), // Language compatibility
          ]);
        }
      }
    } else {
      // Fallback to regular dependency analysis
      for (const [sourceDomain, targetDomains] of Object.entries(dependencies)) {
        const sourceIndex = domainIndexMap.get(sourceDomain);
        if (sourceIndex === undefined) continue;

        for (const [targetDomain, count] of Object.entries(targetDomains)) {
          const targetIndex = domainIndexMap.get(targetDomain);
          if (targetIndex === undefined) continue;

          adjacency.push([sourceIndex, targetIndex]);
          edgeFeaturesList.push([count, 0.5, 0.5]); // Default values when Bazel data unavailable
        }
      }
    }

    const flatFeatures = edgeFeaturesList.flat();
    const edgeFeatures = new Float32Array(flatFeatures.length);
    for (let i = 0; i < flatFeatures.length; i++) {
      edgeFeatures[i] = flatFeatures[i] as number;
    }
    (edgeFeatures as any).shape = [adjacency.length, 3];

    return {
      nodes: nodeFeatures as Float32Array & { shape: number[] },
      edges: edgeFeatures as Float32Array & { shape: number[] },
      adjacency: adjacency,
      metadata: {
        bazelTargets: (bazelMetadata as Record<string, unknown>)['targets'],
        languages: (bazelMetadata as Record<string, unknown>)['languages'],
        toolchains: (bazelMetadata as Record<string, unknown>)['toolchains'],
      },
    };
  }

  /**
   * Extract enhanced domain boundaries using Bazel metadata.
   *
   * @param predictions
   * @param domains
   * @param adjacency
   * @param bazelMetadata
   */
  private extractBazelEnhancedBoundaries(
    predictions: { shape: number[]; [key: number]: number },
    domains: Domain[],
    adjacency: unknown[][],
    bazelMetadata: Record<string, unknown>
  ): DomainRelationshipMap {
    const relationships = [] as unknown[];
    const cohesionScores = [] as { domainName: string; score: number }[];
    const crossDomainDependencies = new Map<string, number>();
    const numDomains = predictions.shape[0];

    // Enhanced cohesion scores incorporating Bazel target analysis
    for (let i = 0; i < (numDomains ?? 0); i++) {
      let cohesion = 0;
      for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
        cohesion += (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) ** 2;
      }

      // Boost cohesion for domains with strong Bazel target relationships
      const domain = domains[i];
      if (domain) {
        const domainTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
          ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === domain.name)
          : [];
        const targetTypeBonus = this.calculateTargetCohesionBonus(domainTargets);

        cohesionScores.push({
          domainName: domain.name,
          score: cohesion * (1 + targetTypeBonus),
        });
      }
    }

    // Enhanced cross-domain dependencies using Bazel's explicit relationships
    if ((bazelMetadata as Record<string, unknown>)['targetDependencies'] && typeof (bazelMetadata as Record<string, unknown>)['targetDependencies'] === 'object') {
      for (const [sourcePkg, targets] of Object.entries((bazelMetadata as Record<string, unknown>)['targetDependencies'] as Record<string, Record<string, number>>)) {
        for (const [targetPkg, count] of Object.entries(targets as Record<string, number>)) {
          const key = `${sourcePkg}->${targetPkg}`;
          crossDomainDependencies.set(key, count);
        }
      }
    } else {
      // Fallback to adjacency matrix analysis
      for (const [sourceIndex, targetIndex] of adjacency) {
        if (sourceIndex === undefined || targetIndex === undefined) continue;
        const sourceDomain = domains[sourceIndex as number];
        const targetDomain = domains[targetIndex as number];
        if (!sourceDomain || !targetDomain) continue;
        const sourceDomainName = sourceDomain.name;
        const targetDomainName = targetDomain.name;
        const key = `${sourceDomainName}->${targetDomainName}`;
        crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
      }
    }

    // Enhanced relationship extraction with Bazel-specific insights
    for (let i = 0; i < (numDomains ?? 0); i++) {
      for (let j = i + 1; j < (numDomains ?? 0); j++) {
        let strength = 0;
        for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
          strength +=
            (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) * (predictions[j * (predictions.shape?.[1] ?? 0) + k] ?? 0);
        }

        // Enhance relationship strength with Bazel target analysis
        const iDomain = domains[i];
        const jDomain = domains[j];
        if (!iDomain || !jDomain) continue;
        const iTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
          ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === iDomain.name)
          : [];
        const jTargets = Array.isArray((bazelMetadata as Record<string, unknown>)['targets'])
          ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).filter((t: any) => t.package === jDomain.name)
          : [];
        const bazelBonus = this.calculateBazelRelationshipBonus(iTargets, jTargets);

        const enhancedStrength = strength * (1 + bazelBonus);

        if (enhancedStrength > 0.4) {
          // Slightly lower threshold due to enhancement
          relationships.push({
            source: i,
            target: j,
            strength: enhancedStrength,
            bazelInsights: {
              targetTypes: [
                ...new Set([
                  ...iTargets.map((t: any) => t.type),
                  ...jTargets.map((t: any) => t.type),
                ]),
              ],
              sharedLanguages: this.findSharedLanguages(
                iTargets,
                jTargets,
                Array.isArray((bazelMetadata as Record<string, unknown>)['languages']) ? (bazelMetadata as Record<string, unknown>)['languages'] as string[] : []
              ),
              dependencyStrength: bazelBonus,
            },
          });
        }
      }
    }

    return {
      relationships: relationships as { source: number; target: number; strength: number }[],
      cohesionScores: cohesionScores,
      crossDomainDependencies: Array.from(crossDomainDependencies.entries()).map(([key, count]) => {
        const [sourceDomain, targetDomain] = key.split('->');
        return { sourceDomain: sourceDomain || '', targetDomain: targetDomain || '', count };
      }),
      bazelEnhancements: (() => {
        const enhancement = {
          totalTargets: Array.isArray((bazelMetadata as Record<string, unknown>)['targets']) ? ((bazelMetadata as Record<string, unknown>)['targets'] as any[]).length : 0,
          languages: Array.isArray((bazelMetadata as Record<string, unknown>)['languages']) ? ((bazelMetadata as Record<string, unknown>)['languages'] as string[]) : [],
          toolchains: Array.isArray((bazelMetadata as Record<string, unknown>)['toolchains']) ? ((bazelMetadata as Record<string, unknown>)['toolchains'] as string[]) : [],
        };
        const workspaceName = (bazelMetadata as Record<string, unknown>)['workspaceName'];
        if (workspaceName && typeof workspaceName === 'string') {
          return { ...enhancement, workspaceName };
        }
        return enhancement;
      })()
    };
  }

  // Helper methods for Bazel-specific calculations

  private calculateLanguageComplexity(targets: Array<{ type: string }>, languages: string[]): number {
    const targetLanguages = new Set<string>();
    for (const target of targets) {
      // Infer language from target type
      if (target.type.startsWith('java_')) targetLanguages.add('java');
      if (target.type.startsWith('py_')) targetLanguages.add('python');
      if (target.type.startsWith('go_')) targetLanguages.add('go');
      if (target.type.startsWith('cc_')) targetLanguages.add('cpp');
      if (target.type.startsWith('ts_')) targetLanguages.add('typescript');
    }
    return targetLanguages.size / Math.max(languages.length, 1);
  }

  private calculateTargetTypeDistribution(targets: Array<{ type: string }>): number {
    const types = new Set(targets.map((t) => t.type.split('_')[1] || t.type)); // library, binary, test
    return types.size / Math.max(targets.length, 1);
  }

  private calculateTargetTypeSimilarity(sourceTargets: Array<{ type: string }>, targetTargets: Array<{ type: string }>): number {
    const sourceTypes = new Set(sourceTargets.map((t) => t.type));
    const targetTypes = new Set(targetTargets.map((t) => t.type));
    const intersection = new Set([...sourceTypes].filter((t) => targetTypes.has(t)));
    const union = new Set([...sourceTypes, ...targetTypes]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateLanguageCompatibility(
    sourceTargets: Array<{ type: string }>,
    targetTargets: Array<{ type: string }>,
    _languages: string[]
  ): number {
    const sourceLangs = this.extractLanguagesFromTargets(sourceTargets);
    const targetLangs = this.extractLanguagesFromTargets(targetTargets);
    const intersection = sourceLangs.filter((lang) => targetLangs.includes(lang));
    const union = [...new Set([...sourceLangs, ...targetLangs])];
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private calculateTargetCohesionBonus(targets: Array<{ type: string }>): number {
    // Higher bonus for packages with diverse but related target types
    const types = targets.map((t) => t.type);
    const hasLibrary = types.some((t) => t.includes('_library'));
    const hasBinary = types.some((t) => t.includes('_binary'));
    const hasTest = types.some((t) => t.includes('_test'));

    // Ideal package has library + test, optionally binary
    let bonus = 0;
    if (hasLibrary && hasTest) bonus += 0.2;
    if (hasBinary) bonus += 0.1;
    return Math.min(bonus, 0.3); // Cap at 30% bonus
  }

  private calculateBazelRelationshipBonus(iTargets: Array<{ package?: string; deps?: string[] }>, jTargets: Array<{ package?: string }>): number {
    // Check for direct target dependencies
    for (const target of iTargets) {
      if (target.deps) {
        for (const dep of target.deps) {
          const depPkg = dep.match(/^\/\/([^:]+):/)?.[1];
          if (jTargets.some((jt) => jt.package === depPkg)) {
            return 0.3; // Strong relationship bonus
          }
        }
      }
    }
    return 0;
  }

  private findSharedLanguages(iTargets: Array<{ type: string }>, jTargets: Array<{ type: string }>, _languages: string[]): string[] {
    const iLangs = this.extractLanguagesFromTargets(iTargets);
    const jLangs = this.extractLanguagesFromTargets(jTargets);
    return iLangs.filter((lang) => jLangs.includes(lang));
  }

  private extractLanguagesFromTargets(targets: Array<{ type: string }>): string[] {
    const languages: string[] = [];
    for (const target of targets) {
      if (target.type.startsWith('java_')) languages.push('java');
      if (target.type.startsWith('py_')) languages.push('python');
      if (target.type.startsWith('go_')) languages.push('go');
      if (target.type.startsWith('cc_')) languages.push('cpp');
      if (target.type.startsWith('ts_')) languages.push('typescript');
    }
    return [...new Set(languages)];
  }
}
