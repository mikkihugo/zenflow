import { projectInitBatchTool, } from '../coordination/swarm/mcp/batch-tools.ts';
export async function exampleBasicClaudeZenPattern() {
    throw new Error('createClaudeZenPattern function not available - needs implementation');
}
export async function exampleProjectInitialization() {
    const params = {
        projectName: 'claude-zen-mvc-app',
        basePath: '/tmp/claude-zen-mvc-app',
        swarmConfig: {
            topology: 'hierarchical',
            maxAgents: 8,
        },
        agentTypes: ['architect', 'researcher', 'coder', 'analyst', 'tester'],
        fileStructure: {
            '/tmp/claude-zen-mvc-app/src/models': null,
            '/tmp/claude-zen-mvc-app/src/views': null,
            '/tmp/claude-zen-mvc-app/src/controllers': null,
            '/tmp/claude-zen-mvc-app/src/utils': null,
            '/tmp/claude-zen-mvc-app/tests/unit': null,
            '/tmp/claude-zen-mvc-app/tests/integration': null,
            '/tmp/claude-zen-mvc-app/docs/api': null,
        },
        packageJson: {
            description: 'MVC application with claude-zen batch optimization',
            scripts: {
                build: 'tsc',
                dev: 'ts-node src/index.ts',
                test: 'jest',
                'test:watch': 'jest --watch',
                lint: 'eslint src',
                'start:prod': 'node dist/index.js',
            },
            dependencies: {
                express: '^4.18.0',
                typescript: '^5.0.0',
            },
            devDependencies: {
                '@types/node': '^20.0.0',
                '@types/express': '^4.17.0',
                jest: '^29.0.0',
                eslint: '^8.0.0',
                'ts-node': '^10.0.0',
            },
        },
    };
    const result = await projectInitBatchTool.handler(params);
    if (result?.success &&
        result?.content &&
        result?.content?.[0] &&
        result?.content?.[0]?.text) {
        const response = result?.content?.[0]?.text;
        if (response) {
            const speedMatch = response?.match(/(\d+\.?\d*)x speed improvement/);
            const tokenMatch = response?.match(/(\d+\.?\d*)% token reduction/);
            const resultWithPerformance = result;
            if (!resultWithPerformance?.performance) {
                resultWithPerformance.performance = {};
            }
            if (speedMatch && speedMatch?.[1]) {
                resultWithPerformance?.performance.speedImprovement = Number.parseFloat(speedMatch?.[1]);
            }
            if (tokenMatch && tokenMatch?.[1]) {
                resultWithPerformance?.performance.tokenReduction = Number.parseFloat(tokenMatch?.[1]);
            }
        }
    }
    return result;
}
export async function runClaudeZenExamples() {
    try {
        await exampleBasicClaudeZenPattern();
        await exampleProjectInitialization();
    }
    catch (error) {
        console.error('❌ Example execution failed:', error);
        throw error;
    }
}
export const ClaudeZenExamples = {
    exampleBasicClaudeZenPattern,
    exampleProjectInitialization,
    runClaudeZenExamples,
};
if (import.meta.url === `file://${process.argv[1]}`) {
    runClaudeZenExamples().catch(console.error);
}
//# sourceMappingURL=claude-zen-examples.js.map