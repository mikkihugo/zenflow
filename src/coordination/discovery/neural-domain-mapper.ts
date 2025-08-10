// @ts-ignore
const { GNNModel } = require('../../../neural/models/presets/gnn.js');
// @ts-ignore
const { WasmNeuralAccelerator } = require('../../../neural/wasm/wasm-neural-accelerator');
import { Domain, DependencyGraph, DomainRelationshipMap } from './types';

export class NeuralDomainMapper {
  private gnnModel: any;
  private wasmAccelerator: any;

  constructor() {
    this.gnnModel = new GNNModel();
    this.wasmAccelerator = new WasmNeuralAccelerator();
  }

  async mapDomainRelationships(
    domains: Domain[],
    dependencies: DependencyGraph,
    bazelMetadata?: any
  ): Promise<DomainRelationshipMap> {
    // Convert to graph format with enhanced Bazel data if available
    const graphData = bazelMetadata 
      ? this.convertBazelToGraphData(domains, dependencies, bazelMetadata)
      : this.convertToGraphData(domains, dependencies);

    // Run GNN analysis
    const predictions = await this.gnnModel.forward(graphData);

    // Extract domain boundaries with Bazel-enhanced analysis
    const boundaries = bazelMetadata
      ? this.extractBazelEnhancedBoundaries(predictions, domains, graphData.adjacency, bazelMetadata)
      : this.extractBoundaries(predictions, domains, graphData.adjacency);

    // AGUI validation
    const question = {
      question: 'GNN suggests these domain boundaries. Do you approve?',
      context: boundaries,
      options: ['yes', 'no'],
    };

    // Assuming a global agui object or similar mechanism for human interaction
    // This would typically be handled by a dedicated AGUI adapter
    const humanApproval = await this.askHuman(question);

    if (humanApproval === 'yes') {
      return boundaries;
    } else {
      throw new Error('Human did not approve GNN suggested boundaries.');
    }
  }

  private async askHuman(question: any): Promise<string> {
    // TODO: Implement actual human interaction using AGUI
    // For now, simulate a direct approval
    console.log(`AGUI Question: ${question.question}`);
    console.log(`Context: ${JSON.stringify(question.context, null, 2)}`);
    console.log(`Options: ${question.options.join(', ')}`);
    return 'yes'; // Simulate approval
  }

  private convertToGraphData(domains: Domain[], dependencies: DependencyGraph): any {
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

  private extractBoundaries(predictions: any, domains: Domain[], adjacency: number[][]): DomainRelationshipMap {
    const relationships = [] as unknown[];
    const cohesionScores = [] as { domainName: string; score: number }[];
    const crossDomainDependencies = new Map<string, number>();
    const numDomains = predictions.shape[0];

    // Calculate cohesion scores
    for (let i = 0; i < numDomains; i++) {
      let cohesion = 0;
      for (let k = 0; k < predictions.shape[1]; k++) {
        cohesion += predictions[i * predictions.shape[1] + k] ** 2;
      }
      const domain = domains[i];
      if (domain) {
        cohesionScores.push({ domainName: domain.name, score: cohesion });
      }
    }

    // Identify cross-domain dependencies
    for (const [sourceIndex, targetIndex] of adjacency) {
      const sourceDomain = domains[sourceIndex];
      const targetDomain = domains[targetIndex];
      if (!sourceDomain || !targetDomain) continue;
      const sourceDomainName = sourceDomain.name;
      const targetDomainName = targetDomain.name;
      const key = `${sourceDomainName}->${targetDomainName}`;
      crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
    }

    for (let i = 0; i < numDomains; i++) {
      for (let j = i + 1; j < numDomains; j++) {
        // This is a placeholder for a more sophisticated relationship calculation.
        // For now, we'll just use the dot product of the output vectors as the strength.
        let strength = 0;
        for (let k = 0; k < predictions.shape[1]; k++) {
          strength += predictions[i * predictions.shape[1] + k] * predictions[j * predictions.shape[1] + k];
        }

        if (strength > 0.5) { // Assuming a threshold of 0.5
          relationships.push({
            source: i, // Using the index as the domain identifier for now
            target: j,
            strength: strength,
          });
        }
      }
    }

    return {
      relationships: relationships as { source: number; target: number; strength: number; }[],
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
  private convertBazelToGraphData(domains: Domain[], dependencies: DependencyGraph, bazelMetadata: any): any {
    const numDomains = domains.length;
    const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));

    // Enhanced node features for Bazel workspaces (6 features per node)
    const nodeFeatures = new Float32Array(numDomains * 6);
    for (let i = 0; i < numDomains; i++) {
      const domain = domains[i];
      if (domain) {
        const packageTargets = bazelMetadata.targets?.filter((t: any) => t.package === domain.name) || [];
        
        nodeFeatures[i * 6 + 0] = domain.files.length; // File count
        nodeFeatures[i * 6 + 1] = domain.dependencies.length; // Dependency count
        nodeFeatures[i * 6 + 2] = domain.confidenceScore; // Confidence
        nodeFeatures[i * 6 + 3] = packageTargets.length; // Bazel target count
        nodeFeatures[i * 6 + 4] = this.calculateLanguageComplexity(packageTargets, bazelMetadata.languages); // Language complexity
        nodeFeatures[i * 6 + 5] = this.calculateTargetTypeDistribution(packageTargets); // Target type diversity
      }
    }
    (nodeFeatures as any).shape = [numDomains, 6];

    // Enhanced edge features using Bazel target dependencies
    const adjacency = [] as unknown[];
    const edgeFeaturesList = [] as unknown[];
    
    // Use Bazel's explicit target dependencies for more accurate relationships
    if (bazelMetadata.targetDependencies) {
      for (const [sourcePkg, targets] of Object.entries(bazelMetadata.targetDependencies)) {
        const sourceIndex = domainIndexMap.get(sourcePkg);
        if (sourceIndex === undefined) continue;

        for (const [targetPkg, count] of Object.entries(targets as Record<string, number>)) {
          const targetIndex = domainIndexMap.get(targetPkg);
          if (targetIndex === undefined) continue;

          adjacency.push([sourceIndex, targetIndex]);
          
          // Enhanced edge features: [dependency_count, target_type_similarity, language_compatibility]
          const sourceTargets = bazelMetadata.targets?.filter((t: any) => t.package === sourcePkg) || [];
          const targetTargets = bazelMetadata.targets?.filter((t: any) => t.package === targetPkg) || [];
          
          edgeFeaturesList.push([
            count, // Raw dependency count
            this.calculateTargetTypeSimilarity(sourceTargets, targetTargets), // Target type similarity
            this.calculateLanguageCompatibility(sourceTargets, targetTargets, bazelMetadata.languages) // Language compatibility
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
      nodes: nodeFeatures,
      edges: edgeFeatures,
      adjacency: adjacency,
      metadata: {
        bazelTargets: bazelMetadata.targets,
        languages: bazelMetadata.languages,
        toolchains: bazelMetadata.toolchains
      }
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
    predictions: any, 
    domains: Domain[], 
    adjacency: number[][], 
    bazelMetadata: any
  ): DomainRelationshipMap {
    const relationships = [] as unknown[];
    const cohesionScores = [] as { domainName: string; score: number }[];
    const crossDomainDependencies = new Map<string, number>();
    const numDomains = predictions.shape[0];

    // Enhanced cohesion scores incorporating Bazel target analysis
    for (let i = 0; i < numDomains; i++) {
      let cohesion = 0;
      for (let k = 0; k < predictions.shape[1]; k++) {
        cohesion += predictions[i * predictions.shape[1] + k] ** 2;
      }
      
      // Boost cohesion for domains with strong Bazel target relationships
      const domain = domains[i];
      if (domain) {
        const domainTargets = bazelMetadata.targets?.filter((t: any) => t.package === domain.name) || [];
        const targetTypeBonus = this.calculateTargetCohesionBonus(domainTargets);
        
        cohesionScores.push({ 
          domainName: domain.name, 
          score: cohesion * (1 + targetTypeBonus) 
        });
      }
    }

    // Enhanced cross-domain dependencies using Bazel's explicit relationships
    if (bazelMetadata.targetDependencies) {
      for (const [sourcePkg, targets] of Object.entries(bazelMetadata.targetDependencies)) {
        for (const [targetPkg, count] of Object.entries(targets as Record<string, number>)) {
          const key = `${sourcePkg}->${targetPkg}`;
          crossDomainDependencies.set(key, count);
        }
      }
    } else {
      // Fallback to adjacency matrix analysis
      for (const [sourceIndex, targetIndex] of adjacency) {
        const sourceDomain = domains[sourceIndex];
        const targetDomain = domains[targetIndex];
        if (!sourceDomain || !targetDomain) continue;
        const sourceDomainName = sourceDomain.name;
        const targetDomainName = targetDomain.name;
        const key = `${sourceDomainName}->${targetDomainName}`;
        crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
      }
    }

    // Enhanced relationship extraction with Bazel-specific insights
    for (let i = 0; i < numDomains; i++) {
      for (let j = i + 1; j < numDomains; j++) {
        let strength = 0;
        for (let k = 0; k < predictions.shape[1]; k++) {
          strength += predictions[i * predictions.shape[1] + k] * predictions[j * predictions.shape[1] + k];
        }

        // Enhance relationship strength with Bazel target analysis
        const iDomain = domains[i];
        const jDomain = domains[j];
        if (!iDomain || !jDomain) continue;
        const iTargets = bazelMetadata.targets?.filter((t: any) => t.package === iDomain.name) || [];
        const jTargets = bazelMetadata.targets?.filter((t: any) => t.package === jDomain.name) || [];
        const bazelBonus = this.calculateBazelRelationshipBonus(iTargets, jTargets);
        
        const enhancedStrength = strength * (1 + bazelBonus);

        if (enhancedStrength > 0.4) { // Slightly lower threshold due to enhancement
          relationships.push({
            source: i,
            target: j,
            strength: enhancedStrength,
            bazelInsights: {
              targetTypes: [...new Set([...iTargets.map((t: any) => t.type), ...jTargets.map((t: any) => t.type)])],
              sharedLanguages: this.findSharedLanguages(iTargets, jTargets, bazelMetadata.languages),
              dependencyStrength: bazelBonus
            }
          });
        }
      }
    }

    return {
      relationships: relationships as { source: number; target: number; strength: number; }[],
      cohesionScores: cohesionScores,
      crossDomainDependencies: Array.from(crossDomainDependencies.entries()).map(([key, count]) => {
        const [sourceDomain, targetDomain] = key.split('->');
        return { sourceDomain: sourceDomain || '', targetDomain: targetDomain || '', count };
      }),
      bazelEnhancements: {
        totalTargets: bazelMetadata.targets?.length || 0,
        languages: bazelMetadata.languages || [],
        toolchains: bazelMetadata.toolchains || [],
        workspaceName: bazelMetadata.workspaceName
      }
    };
  }

  // Helper methods for Bazel-specific calculations

  private calculateLanguageComplexity(targets: any[], languages: string[]): number {
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

  private calculateTargetTypeDistribution(targets: any[]): number {
    const types = new Set(targets.map(t => t.type.split('_')[1] || t.type)); // library, binary, test
    return types.size / Math.max(targets.length, 1);
  }

  private calculateTargetTypeSimilarity(sourceTargets: any[], targetTargets: any[]): number {
    const sourceTypes = new Set(sourceTargets.map(t => t.type));
    const targetTypes = new Set(targetTargets.map(t => t.type));
    const intersection = new Set([...sourceTypes].filter(t => targetTypes.has(t)));
    const union = new Set([...sourceTypes, ...targetTypes]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateLanguageCompatibility(sourceTargets: any[], targetTargets: any[], languages: string[]): number {
    const sourceLangs = this.extractLanguagesFromTargets(sourceTargets);
    const targetLangs = this.extractLanguagesFromTargets(targetTargets);
    const intersection = sourceLangs.filter(lang => targetLangs.includes(lang));
    const union = [...new Set([...sourceLangs, ...targetLangs])];
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private calculateTargetCohesionBonus(targets: any[]): number {
    // Higher bonus for packages with diverse but related target types
    const types = targets.map(t => t.type);
    const hasLibrary = types.some(t => t.includes('_library'));
    const hasBinary = types.some(t => t.includes('_binary'));
    const hasTest = types.some(t => t.includes('_test'));
    
    // Ideal package has library + test, optionally binary
    let bonus = 0;
    if (hasLibrary && hasTest) bonus += 0.2;
    if (hasBinary) bonus += 0.1;
    return Math.min(bonus, 0.3); // Cap at 30% bonus
  }

  private calculateBazelRelationshipBonus(iTargets: any[], jTargets: any[]): number {
    // Check for direct target dependencies
    for (const target of iTargets) {
      if (target.deps) {
        for (const dep of target.deps) {
          const depPkg = dep.match(/^\/\/([^:]+):/)?.[1];
          if (jTargets.some(jt => jt.package === depPkg)) {
            return 0.3; // Strong relationship bonus
          }
        }
      }
    }
    return 0;
  }

  private findSharedLanguages(iTargets: any[], jTargets: any[], languages: string[]): string[] {
    const iLangs = this.extractLanguagesFromTargets(iTargets);
    const jLangs = this.extractLanguagesFromTargets(jTargets);
    return iLangs.filter(lang => jLangs.includes(lang));
  }

  private extractLanguagesFromTargets(targets: any[]): string[] {
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
