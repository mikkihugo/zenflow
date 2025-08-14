import { GNNModel } from '../../neural/models/presets/gnn.js';
import { LLMIntegrationService } from '../services/llm-integration.service.js';
export class NeuralDomainMapper {
    gnnModel;
    _wasmAccelerator;
    _llmService;
    _enableABTesting;
    constructor(options = {}) {
        const { enableABTesting = false } = options;
        this._enableABTesting = enableABTesting;
        this.gnnModel = new GNNModel();
        this._wasmAccelerator = new WasmNeuralAccelerator();
        this._llmService = new LLMIntegrationService({
            projectPath: process.cwd(),
            preferredProvider: 'github-models',
            model: 'openai/gpt-5',
            temperature: 0.1,
            maxTokens: 100000,
            debug: false,
        });
    }
    async mapDomainRelationships(domains, dependencies, bazelMetadata) {
        const graphData = bazelMetadata
            ? this.convertBazelToGraphData(domains, dependencies, bazelMetadata)
            : this.convertToGraphData(domains, dependencies);
        const predictions = await this.gnnModel.forward(graphData);
        if (this._wasmAccelerator &&
            predictions.data &&
            predictions.data.length > 1000) {
            await this._wasmAccelerator.optimizeTensor(predictions);
        }
        const boundaries = bazelMetadata
            ? this.extractBazelEnhancedBoundaries(predictions, domains, graphData.adjacency, bazelMetadata)
            : this.extractBoundaries(predictions, domains, graphData.adjacency);
        let llmAnalysis;
        llmAnalysis = await this._llmService.analyzeSmart({
            task: 'domain-analysis',
            context: {
                domains,
                dependencies,
                gnnResults: boundaries,
                bazelMetadata,
            },
            prompt: `
        Analyze these GNN-suggested domain boundaries and provide validation:
        
        Domains: ${domains.map((d) => d.name).join(', ')}
        Suggested Boundaries: ${JSON.stringify(boundaries, null, 2)}
        
        Please evaluate:
        1. Domain boundary coherence and logical separation
        2. Dependency flow analysis and coupling strength
        3. Potential architecture improvements
        4. Validation: Should these boundaries be approved? (yes/no)
        
        Respond with: {"approved": boolean, "reasoning": string, "improvements": string[]}
      `,
            requiresFileOperations: false,
        });
        let approvalResult;
        try {
            approvalResult =
                typeof llmAnalysis.data === 'string'
                    ? JSON.parse(llmAnalysis.data)
                    : llmAnalysis.data;
        }
        catch {
            const approved = llmAnalysis.data?.toLowerCase?.().includes('yes') ||
                llmAnalysis.data?.approved === true;
            approvalResult = {
                approved,
                reasoning: 'LLM analysis completed',
                improvements: [],
            };
        }
        if (approvalResult.approved) {
            return {
                ...boundaries,
                llmInsights: {
                    reasoning: approvalResult.reasoning,
                    suggestedImprovements: approvalResult.improvements || [],
                    analysisProvider: llmAnalysis.provider,
                    analysisTime: llmAnalysis.executionTime,
                },
            };
        }
        throw new Error(`LLM validation rejected domain boundaries: ${approvalResult.reasoning}`);
    }
    async askHuman(questionJson) {
        const question = JSON.parse(questionJson);
        console.log(`AGUI Question: ${question.question}`);
        console.log(`Context: ${JSON.stringify(question.context, null, 2)}`);
        console.log(`Options: ${question.options.join(', ')}`);
        return 'yes';
    }
    convertToGraphData(domains, dependencies) {
        const numDomains = domains.length;
        const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));
        const nodeFeatures = new Float32Array(numDomains * 3);
        for (let i = 0; i < numDomains; i++) {
            const domain = domains[i];
            if (domain) {
                nodeFeatures[i * 3 + 0] = domain.files.length;
                nodeFeatures[i * 3 + 1] = domain.dependencies.length;
                nodeFeatures[i * 3 + 2] = domain.confidenceScore;
            }
        }
        nodeFeatures.shape = [numDomains, 3];
        const adjacency = [];
        const edgeFeaturesList = [];
        for (const [sourceDomain, targetDomains] of Object.entries(dependencies)) {
            const sourceIndex = domainIndexMap.get(sourceDomain);
            if (sourceIndex === undefined)
                continue;
            for (const targetDomain of Object.keys(targetDomains)) {
                const targetIndex = domainIndexMap.get(targetDomain);
                if (targetIndex === undefined)
                    continue;
                adjacency.push([sourceIndex, targetIndex]);
                edgeFeaturesList.push(targetDomains[targetDomain]);
            }
        }
        const edgeFeatures = new Float32Array(edgeFeaturesList.length);
        for (let i = 0; i < edgeFeaturesList.length; i++) {
            edgeFeatures[i] = edgeFeaturesList[i];
        }
        edgeFeatures.shape = [adjacency.length, 1];
        return {
            nodes: nodeFeatures,
            edges: edgeFeatures,
            adjacency: adjacency,
        };
    }
    extractBoundaries(predictions, domains, adjacency) {
        const relationships = [];
        const cohesionScores = [];
        const crossDomainDependencies = new Map();
        const numDomains = predictions.shape[0];
        for (let i = 0; i < (numDomains ?? 0); i++) {
            let cohesion = 0;
            for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
                cohesion +=
                    (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) ** 2;
            }
            const domain = domains[i];
            if (domain) {
                cohesionScores.push({ domainName: domain.name, score: cohesion });
            }
        }
        for (const [sourceIndex, targetIndex] of adjacency) {
            if (sourceIndex === undefined || targetIndex === undefined)
                continue;
            const sourceDomain = domains[sourceIndex];
            const targetDomain = domains[targetIndex];
            if (!(sourceDomain && targetDomain))
                continue;
            const sourceDomainName = sourceDomain.name;
            const targetDomainName = targetDomain.name;
            const key = `${sourceDomainName}->${targetDomainName}`;
            crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
        }
        for (let i = 0; i < (numDomains ?? 0); i++) {
            for (let j = i + 1; j < (numDomains ?? 0); j++) {
                let strength = 0;
                for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
                    strength +=
                        (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) *
                            (predictions[j * (predictions.shape?.[1] ?? 0) + k] ?? 0);
                }
                if (strength > 0.5) {
                    relationships.push({
                        source: i,
                        target: j,
                        strength: strength,
                    });
                }
            }
        }
        return {
            relationships: relationships,
            cohesionScores: cohesionScores,
            crossDomainDependencies: Array.from(crossDomainDependencies.entries()).map(([key, count]) => {
                const [sourceDomain, targetDomain] = key.split('->');
                return {
                    sourceDomain: sourceDomain || '',
                    targetDomain: targetDomain || '',
                    count,
                };
            }),
        };
    }
    convertBazelToGraphData(domains, dependencies, bazelMetadata) {
        const numDomains = domains.length;
        const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));
        const nodeFeatures = new Float32Array(numDomains * 6);
        for (let i = 0; i < numDomains; i++) {
            const domain = domains[i];
            if (domain) {
                const packageTargets = Array.isArray(bazelMetadata['targets'])
                    ? bazelMetadata['targets'].filter((t) => t.package === domain.name)
                    : [];
                nodeFeatures[i * 6 + 0] = domain.files.length;
                nodeFeatures[i * 6 + 1] = domain.dependencies.length;
                nodeFeatures[i * 6 + 2] = domain.confidenceScore;
                nodeFeatures[i * 6 + 3] = packageTargets.length;
                nodeFeatures[i * 6 + 4] = this.calculateLanguageComplexity(packageTargets, Array.isArray(bazelMetadata['languages'])
                    ? bazelMetadata['languages']
                    : []);
                nodeFeatures[i * 6 + 5] =
                    this.calculateTargetTypeDistribution(packageTargets);
            }
        }
        nodeFeatures.shape = [numDomains, 6];
        const adjacency = [];
        const edgeFeaturesList = [];
        if (bazelMetadata['targetDependencies'] &&
            typeof bazelMetadata['targetDependencies'] === 'object') {
            for (const [sourcePkg, targets] of Object.entries(bazelMetadata['targetDependencies'])) {
                const sourceIndex = domainIndexMap.get(sourcePkg);
                if (sourceIndex === undefined)
                    continue;
                for (const [targetPkg, count] of Object.entries(targets)) {
                    const targetIndex = domainIndexMap.get(targetPkg);
                    if (targetIndex === undefined)
                        continue;
                    adjacency.push([sourceIndex, targetIndex]);
                    const sourceTargets = Array.isArray(bazelMetadata['targets'])
                        ? bazelMetadata['targets'].filter((t) => t.package === sourcePkg)
                        : [];
                    const targetTargets = Array.isArray(bazelMetadata['targets'])
                        ? bazelMetadata['targets'].filter((t) => t.package === targetPkg)
                        : [];
                    edgeFeaturesList.push([
                        count,
                        this.calculateTargetTypeSimilarity(sourceTargets, targetTargets),
                        this.calculateLanguageCompatibility(sourceTargets, targetTargets, Array.isArray(bazelMetadata['languages'])
                            ? bazelMetadata['languages']
                            : []),
                    ]);
                }
            }
        }
        else {
            for (const [sourceDomain, targetDomains] of Object.entries(dependencies)) {
                const sourceIndex = domainIndexMap.get(sourceDomain);
                if (sourceIndex === undefined)
                    continue;
                for (const [targetDomain, count] of Object.entries(targetDomains)) {
                    const targetIndex = domainIndexMap.get(targetDomain);
                    if (targetIndex === undefined)
                        continue;
                    adjacency.push([sourceIndex, targetIndex]);
                    edgeFeaturesList.push([count, 0.5, 0.5]);
                }
            }
        }
        const flatFeatures = edgeFeaturesList.flat();
        const edgeFeatures = new Float32Array(flatFeatures.length);
        for (let i = 0; i < flatFeatures.length; i++) {
            edgeFeatures[i] = flatFeatures[i];
        }
        edgeFeatures.shape = [adjacency.length, 3];
        return {
            nodes: nodeFeatures,
            edges: edgeFeatures,
            adjacency: adjacency,
            metadata: {
                bazelTargets: bazelMetadata['targets'],
                languages: bazelMetadata['languages'],
                toolchains: bazelMetadata['toolchains'],
            },
        };
    }
    extractBazelEnhancedBoundaries(predictions, domains, adjacency, bazelMetadata) {
        const relationships = [];
        const cohesionScores = [];
        const crossDomainDependencies = new Map();
        const numDomains = predictions.shape[0];
        for (let i = 0; i < (numDomains ?? 0); i++) {
            let cohesion = 0;
            for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
                cohesion +=
                    (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) ** 2;
            }
            const domain = domains[i];
            if (domain) {
                const domainTargets = Array.isArray(bazelMetadata['targets'])
                    ? bazelMetadata['targets'].filter((t) => t.package === domain.name)
                    : [];
                const targetTypeBonus = this.calculateTargetCohesionBonus(domainTargets);
                cohesionScores.push({
                    domainName: domain.name,
                    score: cohesion * (1 + targetTypeBonus),
                });
            }
        }
        if (bazelMetadata['targetDependencies'] &&
            typeof bazelMetadata['targetDependencies'] === 'object') {
            for (const [sourcePkg, targets] of Object.entries(bazelMetadata['targetDependencies'])) {
                for (const [targetPkg, count] of Object.entries(targets)) {
                    const key = `${sourcePkg}->${targetPkg}`;
                    crossDomainDependencies.set(key, count);
                }
            }
        }
        else {
            for (const [sourceIndex, targetIndex] of adjacency) {
                if (sourceIndex === undefined || targetIndex === undefined)
                    continue;
                const sourceDomain = domains[sourceIndex];
                const targetDomain = domains[targetIndex];
                if (!(sourceDomain && targetDomain))
                    continue;
                const sourceDomainName = sourceDomain.name;
                const targetDomainName = targetDomain.name;
                const key = `${sourceDomainName}->${targetDomainName}`;
                crossDomainDependencies.set(key, (crossDomainDependencies.get(key) || 0) + 1);
            }
        }
        for (let i = 0; i < (numDomains ?? 0); i++) {
            for (let j = i + 1; j < (numDomains ?? 0); j++) {
                let strength = 0;
                for (let k = 0; k < (predictions.shape?.[1] ?? 0); k++) {
                    strength +=
                        (predictions[i * (predictions.shape?.[1] ?? 0) + k] ?? 0) *
                            (predictions[j * (predictions.shape?.[1] ?? 0) + k] ?? 0);
                }
                const iDomain = domains[i];
                const jDomain = domains[j];
                if (!(iDomain && jDomain))
                    continue;
                const iTargets = Array.isArray(bazelMetadata['targets'])
                    ? bazelMetadata['targets'].filter((t) => t.package === iDomain.name)
                    : [];
                const jTargets = Array.isArray(bazelMetadata['targets'])
                    ? bazelMetadata['targets'].filter((t) => t.package === jDomain.name)
                    : [];
                const bazelBonus = this.calculateBazelRelationshipBonus(iTargets, jTargets);
                const enhancedStrength = strength * (1 + bazelBonus);
                if (enhancedStrength > 0.4) {
                    relationships.push({
                        source: i,
                        target: j,
                        strength: enhancedStrength,
                        bazelInsights: {
                            targetTypes: [
                                ...new Set([
                                    ...iTargets.map((t) => t.type),
                                    ...jTargets.map((t) => t.type),
                                ]),
                            ],
                            sharedLanguages: this.findSharedLanguages(iTargets, jTargets, Array.isArray(bazelMetadata['languages'])
                                ? bazelMetadata['languages']
                                : []),
                            dependencyStrength: bazelBonus,
                        },
                    });
                }
            }
        }
        return {
            relationships: relationships,
            cohesionScores: cohesionScores,
            crossDomainDependencies: Array.from(crossDomainDependencies.entries()).map(([key, count]) => {
                const [sourceDomain, targetDomain] = key.split('->');
                return {
                    sourceDomain: sourceDomain || '',
                    targetDomain: targetDomain || '',
                    count,
                };
            }),
            bazelEnhancements: (() => {
                const enhancement = {
                    totalTargets: Array.isArray(bazelMetadata['targets'])
                        ? bazelMetadata['targets'].length
                        : 0,
                    languages: Array.isArray(bazelMetadata['languages'])
                        ? bazelMetadata['languages']
                        : [],
                    toolchains: Array.isArray(bazelMetadata['toolchains'])
                        ? bazelMetadata['toolchains']
                        : [],
                };
                const workspaceName = bazelMetadata['workspaceName'];
                if (workspaceName && typeof workspaceName === 'string') {
                    return { ...enhancement, workspaceName };
                }
                return enhancement;
            })(),
        };
    }
    calculateLanguageComplexity(targets, languages) {
        const targetLanguages = new Set();
        for (const target of targets) {
            if (target.type.startsWith('java_'))
                targetLanguages.add('java');
            if (target.type.startsWith('py_'))
                targetLanguages.add('python');
            if (target.type.startsWith('go_'))
                targetLanguages.add('go');
            if (target.type.startsWith('cc_'))
                targetLanguages.add('cpp');
            if (target.type.startsWith('ts_'))
                targetLanguages.add('typescript');
        }
        return targetLanguages.size / Math.max(languages.length, 1);
    }
    calculateTargetTypeDistribution(targets) {
        const types = new Set(targets.map((t) => t.type.split('_')[1] || t.type));
        return types.size / Math.max(targets.length, 1);
    }
    calculateTargetTypeSimilarity(sourceTargets, targetTargets) {
        const sourceTypes = new Set(sourceTargets.map((t) => t.type));
        const targetTypes = new Set(targetTargets.map((t) => t.type));
        const intersection = new Set([...sourceTypes].filter((t) => targetTypes.has(t)));
        const union = new Set([...sourceTypes, ...targetTypes]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    calculateLanguageCompatibility(sourceTargets, targetTargets, _languages) {
        const sourceLangs = this.extractLanguagesFromTargets(sourceTargets);
        const targetLangs = this.extractLanguagesFromTargets(targetTargets);
        const intersection = sourceLangs.filter((lang) => targetLangs.includes(lang));
        const union = [...new Set([...sourceLangs, ...targetLangs])];
        return union.length > 0 ? intersection.length / union.length : 0;
    }
    calculateTargetCohesionBonus(targets) {
        const types = targets.map((t) => t.type);
        const hasLibrary = types.some((t) => t.includes('_library'));
        const hasBinary = types.some((t) => t.includes('_binary'));
        const hasTest = types.some((t) => t.includes('_test'));
        let bonus = 0;
        if (hasLibrary && hasTest)
            bonus += 0.2;
        if (hasBinary)
            bonus += 0.1;
        return Math.min(bonus, 0.3);
    }
    calculateBazelRelationshipBonus(iTargets, jTargets) {
        for (const target of iTargets) {
            if (target.deps) {
                for (const dep of target.deps) {
                    const depPkg = dep.match(/^\/\/([^:]+):/)?.[1];
                    if (jTargets.some((jt) => jt.package === depPkg)) {
                        return 0.3;
                    }
                }
            }
        }
        return 0;
    }
    findSharedLanguages(iTargets, jTargets, _languages) {
        const iLangs = this.extractLanguagesFromTargets(iTargets);
        const jLangs = this.extractLanguagesFromTargets(jTargets);
        return iLangs.filter((lang) => jLangs.includes(lang));
    }
    extractLanguagesFromTargets(targets) {
        const languages = [];
        for (const target of targets) {
            if (target.type.startsWith('java_'))
                languages.push('java');
            if (target.type.startsWith('py_'))
                languages.push('python');
            if (target.type.startsWith('go_'))
                languages.push('go');
            if (target.type.startsWith('cc_'))
                languages.push('cpp');
            if (target.type.startsWith('ts_'))
                languages.push('typescript');
        }
        return [...new Set(languages)];
    }
}
//# sourceMappingURL=neural-domain-mapper.js.map