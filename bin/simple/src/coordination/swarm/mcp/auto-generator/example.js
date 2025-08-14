import { join } from 'path';
import { getLogger } from '../../../../config/logging-config.js';
import { OpenAPIMCPGenerator } from './openapi-mcp-generator.js';
const logger = getLogger('openapi-mcp-example');
async function generateFromLocalAPI() {
    console.log('🚀 Generating MCP tools from Claude Code Zen API...');
    const generator = new OpenAPIMCPGenerator({
        specUrl: 'http://localhost:3456/openapi.json',
        outputDir: join(__dirname, '../generated/api-tools'),
        namespace: 'api',
        baseUrl: 'http://localhost:3456',
        enableSync: false,
        auth: {
            type: 'bearer',
        },
        options: {
            includeDeprecated: false,
            generateTests: true,
            validateResponses: true,
            timeout: 30000,
        },
    });
    try {
        await generator.generateAll();
        const stats = generator.getStats();
        console.log('✅ Generation completed!');
        console.log(`   Tools generated: ${stats.toolsGenerated}`);
        console.log(`   Output directory: ${stats.outputDir}`);
    }
    catch (error) {
        console.error('❌ Generation failed:', error);
    }
}
async function generateWithSync() {
    console.log('👁️  Generating MCP tools with sync monitoring...');
    const generator = new OpenAPIMCPGenerator({
        specUrl: 'http://localhost:3456/openapi.json',
        outputDir: join(__dirname, '../generated/synced-tools'),
        namespace: 'sync',
        baseUrl: 'http://localhost:3456',
        enableSync: true,
        options: {
            generateTests: true,
            validateResponses: false,
        },
    });
    try {
        await generator.generateAll();
        console.log('✅ Initial generation completed with sync monitoring enabled!');
        console.log('   Monitoring API for changes...');
    }
    catch (error) {
        console.error('❌ Generation with sync failed:', error);
    }
}
async function generateFromFile() {
    console.log('📁 Generating MCP tools from OpenAPI file...');
    try {
        const response = await fetch('http://localhost:3456/openapi.json');
        const spec = await response.json();
        const fs = await import('fs/promises');
        const specPath = join(__dirname, 'openapi-spec.json');
        await fs.writeFile(specPath, JSON.stringify(spec, null, 2));
        const generator = new OpenAPIMCPGenerator({
            specUrl: specPath,
            outputDir: join(__dirname, '../generated/file-tools'),
            namespace: 'file',
            baseUrl: 'http://localhost:3456',
            enableSync: true,
            options: {
                generateTests: true,
                includeDeprecated: true,
            },
        });
        await generator.generateAll();
        console.log('✅ Generation from file completed!');
    }
    catch (error) {
        console.error('❌ File generation failed:', error);
    }
}
async function generateDomainSpecific() {
    console.log('🎯 Generating domain-specific MCP tools...');
    const domains = [
        { namespace: 'coordination', pattern: '/api/v1/coordination' },
        { namespace: 'neural', pattern: '/api/v1/neural' },
        { namespace: 'memory', pattern: '/api/v1/memory' },
        { namespace: 'database', pattern: '/api/v1/database' },
    ];
    for (const domain of domains) {
        console.log(`   Generating ${domain.namespace} tools...`);
        const generator = new OpenAPIMCPGenerator({
            specUrl: 'http://localhost:3456/openapi.json',
            outputDir: join(__dirname, `../generated/${domain.namespace}-tools`),
            namespace: domain.namespace,
            baseUrl: 'http://localhost:3456',
            options: {
                generateTests: true,
            },
        });
        try {
            await generator.generateAll();
            console.log(`   ✅ ${domain.namespace} tools generated`);
        }
        catch (error) {
            console.error(`   ❌ ${domain.namespace} generation failed:`, error);
        }
    }
}
async function demonstrateIntegration() {
    console.log('🔗 Demonstrating MCP server integration...');
    const generator = new OpenAPIMCPGenerator({
        specUrl: 'http://localhost:3456/openapi.json',
        outputDir: join(__dirname, '../generated/integration-demo'),
        namespace: 'demo',
        baseUrl: 'http://localhost:3456',
    });
    await generator.generateAll();
    try {
        const { GENERATED_MCP_TOOLS, GENERATED_MCP_HANDLERS, executeGeneratedTool, } = await import('../generated/integration-demo/index.js');
        console.log('🔧 Generated tools integration:');
        console.log(`   Available tools: ${GENERATED_MCP_TOOLS.length}`);
        GENERATED_MCP_TOOLS.forEach((tool, index) => {
            console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
        });
        if (GENERATED_MCP_TOOLS.length > 0) {
            const firstTool = GENERATED_MCP_TOOLS[0];
            console.log(`\n   Testing tool: ${firstTool.name}`);
            try {
                const sampleArgs = {};
                const result = await executeGeneratedTool(firstTool.name, sampleArgs);
                console.log(`   ✅ Tool executed successfully:`, result);
            }
            catch (error) {
                console.log(`   ℹ️  Tool execution example (expected to fail without proper args):`, error instanceof Error ? error.message : String(error));
            }
        }
    }
    catch (error) {
        console.log(`   ℹ️  Integration files not found (run generator first): ${error}`);
    }
}
async function runDemo() {
    console.log('🎪 OpenAPI → MCP Auto-Generator Demo\n');
    try {
        const response = await fetch('http://localhost:3456/health');
        if (!response.ok) {
            throw new Error('API server not responding');
        }
        console.log('✅ API server is running\n');
    }
    catch (error) {
        console.log('⚠️  API server not available - some examples may fail');
        console.log('   Start the server with: npm run start:api\n');
    }
    const examples = [
        { name: 'Basic Generation', fn: generateFromLocalAPI },
        { name: 'File-based Generation', fn: generateFromFile },
        { name: 'Domain-specific Generation', fn: generateDomainSpecific },
        { name: 'Integration Demo', fn: demonstrateIntegration },
    ];
    for (const example of examples) {
        console.log(`\n📋 Running: ${example.name}`);
        console.log('─'.repeat(50));
        try {
            await example.fn();
        }
        catch (error) {
            console.error(`❌ ${example.name} failed:`, error);
        }
        console.log('');
    }
    console.log('🎉 Demo completed!');
    console.log('\nTo run with sync monitoring:');
    console.log('   npm run demo:sync\n');
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runDemo().catch(console.error);
}
export { generateFromLocalAPI, generateWithSync, generateFromFile, generateDomainSpecific, demonstrateIntegration, runDemo, };
//# sourceMappingURL=example.js.map