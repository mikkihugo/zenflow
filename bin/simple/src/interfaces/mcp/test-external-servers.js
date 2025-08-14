#!/usr/bin/env node
import { getLogger } from '../../config/logging-config.ts';
import { ExternalMCPClient } from './external-mcp-client.ts';
const logger = getLogger('MCP-Test');
async function testExternalMCPServers() {
    logger.info('Starting external MCP server connection tests...');
    try {
        const client = new ExternalMCPClient({
            timeout: 30000,
            retryAttempts: 3,
            enableLogging: true,
        });
        client.on('serverConnected', (data) => {
            logger.info(`✅ Server connected: ${data?.server} (${data?.tools} tools)`);
        });
        client.on('serverError', (data) => {
            logger.error(`❌ Server error: ${data?.server} - ${data?.error}`);
        });
        client.on('toolExecuted', (data) => {
            logger.info(`🔧 Tool executed: ${data?.tool} on ${data?.server}`);
        });
        logger.info('Connecting to external MCP servers...');
        const connectionResults = await client.connectAll();
        for (const result of connectionResults) {
            const _status = result?.success ? '✅' : '❌';
            if (result?.success) {
                logger.info(`Successfully connected to ${result?.serverName}`);
            }
            else {
                logger.error(`Failed to connect to ${result?.serverName}: ${result?.error}`);
            }
        }
        const serverStatus = client.getServerStatus();
        for (const [_name, status] of Object.entries(serverStatus)) {
            const _connectionIcon = status.connected ? '🟢' : '🔴';
            if (status.lastPing) {
            }
        }
        const availableTools = client.getAvailableTools();
        for (const [_serverName, tools] of Object.entries(availableTools)) {
            if (tools.length === 0) {
            }
            else {
                for (const _tool of tools) {
                }
            }
        }
        logger.info('\nTesting tool execution...');
        const testExecutions = [
            {
                server: 'context7',
                tool: 'research_analysis',
                params: { topic: 'AI development' },
            },
            {
                server: 'deepwiki',
                tool: 'knowledge_search',
                params: { query: 'TypeScript best practices' },
            },
            {
                server: 'gitmcp',
                tool: 'repository_analysis',
                params: { repo: 'claude-code-zen' },
            },
            {
                server: 'semgrep',
                tool: 'security_scan',
                params: { language: 'typescript' },
            },
        ];
        for (const test of testExecutions) {
            try {
                const result = await client.executeTool(test.server, test.tool, test.params);
                if (result?.success) {
                }
                else {
                }
            }
            catch (_error) { }
        }
        const _totalTools = Object.values(availableTools).reduce((sum, tools) => sum + tools.length, 0);
        await client.disconnectAll();
        logger.info('External MCP server test completed successfully');
    }
    catch (error) {
        logger.error('External MCP server test failed:', error);
        process.exit(1);
    }
}
function validateConfigurationFiles() {
    import('node:fs')
        .then((fs) => {
        import('node:path')
            .then((path) => {
            const configFiles = [
                '.github/copilot_settings.yml',
                'claude_desktop_config.json',
                '.copilotrc.json',
                '.github/copilot-config.yml',
            ];
            for (const file of configFiles) {
                const filePath = path.resolve(process.cwd(), file);
                if (fs.existsSync(filePath)) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (file.endsWith('.json')) {
                            JSON.parse(content);
                        }
                        else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                        }
                        if (content.includes('context7') ||
                            content.includes('deepwiki') ||
                            content.includes('gitmcp') ||
                            content.includes('semgrep')) {
                        }
                    }
                    catch (_error) { }
                }
                else {
                }
            }
        })
            .catch(console.error);
    })
        .catch(console.error);
}
async function main() {
    validateConfigurationFiles();
    await testExternalMCPServers();
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        logger.error('Test failed:', error);
        process.exit(1);
    });
}
export { testExternalMCPServers, validateConfigurationFiles };
//# sourceMappingURL=test-external-servers.js.map