import { getLogger } from './config/logging-config.js';
const logger = getLogger('comprehensive-sparc-test');
import { writeFile } from 'node:fs/promises';
async function runComprehensiveTest() {
    const results = {
        coreEngine: false,
        cliIntegration: false,
        mcpIntegration: false,
        endToEndFlow: false,
        overallSuccess: false,
    };
    try {
        const coreTest = await testCoreEngine();
        results.coreEngine = coreTest.success;
        const cliTest = await testCLIIntegration();
        results.cliIntegration = cliTest.success;
        const mcpTest = await testMCPIntegration();
        results.mcpIntegration = mcpTest.success;
        const e2eTest = await testEndToEndFlow();
        results.endToEndFlow = e2eTest.success;
        results.overallSuccess = Object.values(results)
            .slice(0, -1)
            .every((r) => r);
        if (results.overallSuccess) {
        }
        else {
        }
        return results;
    }
    catch (error) {
        logger.error('💥 Comprehensive test failed:', error);
        return { ...results, overallSuccess: false };
    }
}
async function testCoreEngine() {
    try {
        const { PseudocodePhaseEngine } = await import('./coordination/swarm/sparc/phases/pseudocode/pseudocode-engine.js');
        const engine = new PseudocodePhaseEngine();
        const testSpec = {
            id: 'comprehensive-test-spec',
            domain: 'swarm-coordination',
            functionalRequirements: [
                {
                    id: 'req-001',
                    title: 'Core Algorithm Test',
                    description: 'Test core algorithm generation',
                    type: 'algorithmic',
                    priority: 'HIGH',
                    testCriteria: ['Algorithm generates correctly'],
                },
            ],
            nonFunctionalRequirements: [],
            constraints: [],
            assumptions: [],
            dependencies: [],
            acceptanceCriteria: [],
            riskAssessment: {
                risks: [],
                mitigationStrategies: [],
                overallRisk: 'LOW',
            },
            successMetrics: [],
        };
        const algorithms = await engine.generateAlgorithmPseudocode(testSpec);
        const dataStructures = await engine.designDataStructures(testSpec.functionalRequirements);
        const controlFlows = await engine.mapControlFlows(algorithms);
        const validation = await engine.validatePseudocodeLogic(algorithms);
        const pseudocodeStructure = await engine.generatePseudocode(testSpec);
        const success = algorithms.length > 0 &&
            dataStructures.length > 0 &&
            controlFlows.length > 0 &&
            validation.length > 0 &&
            !!pseudocodeStructure.id;
        return {
            success,
            details: {
                algorithms: algorithms.length,
                dataStructures: dataStructures.length,
                controlFlows: controlFlows.length,
                validationResults: validation.length,
                pseudocodeGenerated: !!pseudocodeStructure.id,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
async function testCLIIntegration() {
    try {
        const testSpec = {
            id: 'cli-test-spec',
            domain: 'memory-systems',
            functionalRequirements: [
                {
                    id: 'req-cli-001',
                    title: 'CLI Memory Algorithm',
                    description: 'Test memory algorithm via CLI',
                    type: 'algorithmic',
                    priority: 'HIGH',
                    testCriteria: ['CLI generation works'],
                },
            ],
            nonFunctionalRequirements: [],
            constraints: [],
            assumptions: [],
            dependencies: [],
            acceptanceCriteria: [],
            riskAssessment: {
                risks: [],
                mitigationStrategies: [],
                overallRisk: 'LOW',
            },
            successMetrics: [],
        };
        await writeFile('/tmp/cli-test-spec.json', JSON.stringify(testSpec, null, 2));
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);
        const generateCommand = `cd ${process.cwd()} && npx tsx src/sparc-pseudocode-cli.ts generate --spec-file /tmp/cli-test-spec.json --output /tmp/cli-test-output.json`;
        const validateCommand = `cd ${process.cwd()} && npx tsx src/sparc-pseudocode-cli.ts validate --pseudocode-file /tmp/cli-test-output.json`;
        const generateResult = await execAsync(generateCommand);
        const validateResult = await execAsync(validateCommand);
        const success = generateResult?.stdout?.includes('✅ Pseudocode generation completed') &&
            validateResult?.stdout?.includes('✅ APPROVED');
        return {
            success,
            details: {
                generateOutput: generateResult?.stdout?.includes('Generated'),
                validateOutput: validateResult?.stdout?.includes('APPROVED'),
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
async function testMCPIntegration() {
    try {
        const createSPARCTools = (await import('./interfaces/mcp/tools/sparc-integration-tools.js')).default;
        const tools = createSPARCTools({});
        const pseudocodeGenerationTool = tools.find((tool) => tool.name === 'sparc_generate_pseudocode');
        const validationTool = tools.find((tool) => tool.name === 'sparc_validate_pseudocode');
        const algorithmsOnlyTool = tools.find((tool) => tool.name === 'sparc_generate_algorithms_only');
        if (!(pseudocodeGenerationTool && validationTool && algorithmsOnlyTool)) {
            return { success: false, error: 'Required MCP tools not found' };
        }
        const testSpec = {
            id: 'mcp-test-spec',
            domain: 'neural-networks',
            functionalRequirements: [
                {
                    id: 'req-mcp-001',
                    title: 'MCP Neural Algorithm',
                    description: 'Test neural algorithm via MCP',
                    type: 'algorithmic',
                    priority: 'HIGH',
                    testCriteria: ['MCP generation works'],
                },
            ],
            nonFunctionalRequirements: [],
            constraints: [],
            assumptions: [],
            dependencies: [],
            acceptanceCriteria: [],
            riskAssessment: {
                risks: [],
                mitigationStrategies: [],
                overallRisk: 'LOW',
            },
            successMetrics: [],
        };
        const generateResult = await pseudocodeGenerationTool.handler({
            specification: testSpec,
        });
        if (!generateResult?.success) {
            return { success: false, error: 'MCP generation failed' };
        }
        const validateResult = await validationTool.handler({
            pseudocodeStructure: {
                id: generateResult?.data?.pseudocodeId,
                algorithms: generateResult?.data?.algorithms,
                dataStructures: generateResult?.data?.dataStructures,
                controlFlows: generateResult?.data?.controlFlows,
            },
        });
        const algorithmsResult = await algorithmsOnlyTool.handler({
            specification: testSpec,
        });
        const success = generateResult?.success &&
            validateResult?.success &&
            algorithmsResult?.success &&
            validateResult?.data?.validation?.approved;
        return {
            success,
            details: {
                generation: generateResult?.success,
                validation: validateResult?.success,
                algorithmsOnly: algorithmsResult?.success,
                approved: validateResult?.data?.validation?.approved,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
async function testEndToEndFlow() {
    try {
        const phase1Output = {
            id: 'e2e-test-phase1-output',
            domain: 'general',
            functionalRequirements: [
                {
                    id: 'req-e2e-001',
                    title: 'E2E Data Processing',
                    description: 'End-to-end data processing algorithm',
                    type: 'algorithmic',
                    priority: 'HIGH',
                    testCriteria: ['Processes data correctly', 'Handles edge cases'],
                },
                {
                    id: 'req-e2e-002',
                    title: 'E2E Validation',
                    description: 'Data validation and error handling',
                    type: 'algorithmic',
                    priority: 'MEDIUM',
                    testCriteria: ['Validates input', 'Reports errors clearly'],
                },
            ],
            nonFunctionalRequirements: [
                {
                    id: 'nf-e2e-001',
                    title: 'Performance',
                    description: 'System performance requirements',
                    metrics: { latency: '<50ms', throughput: '>2000/sec' },
                    priority: 'HIGH',
                },
            ],
            constraints: [
                {
                    id: 'const-e2e-001',
                    type: 'performance',
                    description: 'Must process within time limits',
                    impact: 'high',
                },
            ],
            assumptions: [],
            dependencies: [],
            acceptanceCriteria: [],
            riskAssessment: {
                risks: [],
                mitigationStrategies: [],
                overallRisk: 'LOW',
            },
            successMetrics: [
                {
                    id: 'metric-e2e-001',
                    name: 'Processing Speed',
                    description: 'Data processing performance',
                    target: '2000 items/sec',
                    measurement: 'automated testing',
                },
            ],
        };
        const { PseudocodePhaseEngine } = await import('./coordination/swarm/sparc/phases/pseudocode/pseudocode-engine.js');
        const engine = new PseudocodePhaseEngine();
        const phase2Output = await engine.generatePseudocode(phase1Output);
        const validation = await engine.validatePseudocode(phase2Output);
        const hasRequiredAlgorithms = phase2Output.algorithms.length >= 2;
        const hasDataStructures = phase2Output.dataStructures.length > 0;
        const hasComplexityAnalysis = !!phase2Output.complexityAnalysis;
        const hasOptimizations = phase2Output.optimizations.length > 0;
        const validationPassed = validation.approved;
        const success = hasRequiredAlgorithms &&
            hasDataStructures &&
            hasComplexityAnalysis &&
            hasOptimizations &&
            validationPassed;
        return {
            success,
            details: {
                algorithmsGenerated: phase2Output.algorithms.length,
                dataStructuresGenerated: phase2Output.dataStructures.length,
                optimizationsIdentified: phase2Output.optimizations.length,
                complexityAnalysisPresent: hasComplexityAnalysis,
                validationScore: validation.overallScore,
                approved: validationPassed,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runComprehensiveTest().then((results) => {
        process.exit(results.overallSuccess ? 0 : 1);
    });
}
export { runComprehensiveTest };
//# sourceMappingURL=comprehensive-sparc-test.js.map