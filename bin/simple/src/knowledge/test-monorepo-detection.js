#!/usr/bin/env nodeimport { getLogger } from '../core/logger.ts';
const logger = getLogger('src-knowledge-test-monorepo-detection');
import { ProjectContextAnalyzer } from './project-context-analyzer.ts';
async function testMonorepoDetection(projectPath) {
    const analyzer = new ProjectContextAnalyzer({
        projectRoot: projectPath,
        swarmConfig: {
            name: 'test-analyzer',
            type: 'knowledge',
            maxAgents: 1,
            swarmSize: 1,
            specializations: [],
            parallelQueries: 1,
            loadBalancingStrategy: 'round-robin',
            crossAgentSharing: false,
            factRepoPath: '/tmp/fact',
            anthropicApiKey: 'test',
        },
        analysisDepth: 'shallow',
        autoUpdate: false,
        cacheDuration: 1,
        priorityThresholds: {
            critical: 90,
            high: 70,
            medium: 50,
        },
    });
    analyzer.on('monorepoDetected', (data) => { });
    try {
        await analyzer.initialize();
        const monorepoInfo = analyzer.getMonorepoInfo();
        if (monorepoInfo && monorepoInfo.type !== 'none') {
            if (monorepoInfo.workspaces) {
            }
            if (monorepoInfo.packages) {
            }
        }
        else {
        }
        const isHighConfidenceMonorepo = analyzer.isMonorepo(0.8);
        const status = analyzer.getStatus();
    }
    catch (error) {
        logger.error('❌ Error during analysis:', error);
    }
    finally {
        await analyzer.shutdown();
    }
}
async function main() {
    const projectPath = process.argv[2] || process.cwd();
    await testMonorepoDetection(projectPath);
}
if (require.main === module) {
    main().catch(console.error);
}
export { testMonorepoDetection };
//# sourceMappingURL=test-monorepo-detection.js.map