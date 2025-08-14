import { getLogger } from '../../config/logging-config.ts';
import { WorkflowEngine } from '../../workflows/workflow-engine.ts';
import { DocumentProcessor } from '../core/document-processor';
import { EventBus } from '../core/event-bus.ts';
import { MemorySystem } from '../core/memory-system';
import { IntelligenceCoordinationSystem } from '../knowledge/intelligence-coordination-system';
import ProjectContextAnalyzer from '../knowledge/project-context-analyzer';
import { DomainAnalysisEngine } from '../tools/domain-splitting/analyzers/domain-analyzer';
import { DomainDiscoveryBridge } from './domain-discovery-bridge.ts';
const logger = getLogger('DomainDiscoveryTest');
async function testDomainDiscovery(projectPath = process.cwd()) {
    try {
        const memorySystem = new MemorySystem({
            backend: 'json',
            persistPath: './.claude/cache/domain-discovery-test',
        });
        await memorySystem.initialize();
        const workflowEngine = new WorkflowEngine({
            workflowPath: './workflows',
            enableMonitoring: true,
        });
        const documentProcessor = new DocumentProcessor(memorySystem, workflowEngine, {
            workspaceRoot: projectPath,
            autoWatch: false,
            enableWorkflows: false,
        });
        await documentProcessor.initialize();
        const domainAnalyzer = new DomainAnalysisEngine({
            analysisDepth: 'medium',
            includeTests: false,
            includeConfig: false,
            minFilesForSplit: 3,
            coupling: {
                threshold: 0.7,
                maxGroupSize: 10,
            },
        });
        const projectAnalyzer = new ProjectContextAnalyzer({
            projectRoot: projectPath,
            swarmConfig: {
                name: 'domain-discovery-test',
                type: 'knowledge',
                maxAgents: 1,
            },
            analysisDepth: 'shallow',
            autoUpdate: false,
            cacheDuration: 1,
        });
        const eventBus = new EventBus();
        const intelligenceCoordinator = new IntelligenceCoordinationSystem({
            expertiseDiscovery: { enabled: true },
            knowledgeRouting: { enabled: true },
            specializationDetection: { enabled: true },
            crossDomainTransfer: { enabled: true },
            collectiveMemory: { enabled: true },
        }, logger, eventBus);
        const bridge = new DomainDiscoveryBridge(documentProcessor, domainAnalyzer, projectAnalyzer, intelligenceCoordinator, {
            confidenceThreshold: 0.6,
            autoDiscovery: true,
            maxDomainsPerDocument: 3,
            useNeuralAnalysis: true,
            enableCache: true,
        });
        bridge.on('initialized', () => { });
        bridge.on('discovery:complete', (results) => { });
        await bridge.initialize();
        const workspaceId = await documentProcessor.loadWorkspace(projectPath);
        const domains = await bridge.discoverDomains();
        domains.forEach((domain, index) => {
            if (domain.relatedDomains.length > 0) {
            }
        });
        const mappings = bridge.getDocumentMappings();
        if (mappings.size > 0) {
            let mappingIndex = 0;
            mappings.forEach((mapping, docPath) => {
                if (mappingIndex < 5) {
                    mapping.domainIds.forEach((domainId, i) => { });
                    mappingIndex++;
                }
            });
            if (mappings.size > 5) {
            }
        }
        const monorepoInfo = projectAnalyzer.getMonorepoInfo();
        if (monorepoInfo && monorepoInfo.type !== 'none') {
            if (monorepoInfo.packages) {
            }
        }
        const stats = await documentProcessor.getStats();
        Object.entries(stats.byType).forEach(([type, count]) => {
            if (count > 0) {
            }
        });
        await bridge.shutdown();
        await documentProcessor.shutdown();
        await projectAnalyzer.shutdown();
        await intelligenceCoordinator.shutdown();
        await memorySystem.shutdown();
    }
    catch (error) {
        logger.error('\n❌ Error during domain discovery test:', error);
        process.exit(1);
    }
}
async function main() {
    const projectPath = process.argv[2] || process.cwd();
    await testDomainDiscovery(projectPath);
}
if (require.main === module) {
    main().catch(console.error);
}
export { testDomainDiscovery };
//# sourceMappingURL=test-domain-discovery.js.map