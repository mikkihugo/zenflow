export * from './api/index.js';
export * from './cli';
export * from './mcp/index.js';
export * from './terminal/index.js';
export * from './web/index.js';
export const InterfaceUtils = {
    detectMode() {
        if (process.env['CLAUDE_CODE_MCP'])
            return 'mcp';
        if (process.env['CLAUDE_FLOW_WEB'])
            return 'web';
        if (process.env['CLAUDE_FLOW_API'])
            return 'api';
        const args = process.argv.slice(2);
        const advancedCommands = [
            'create',
            'optimize',
            'generate',
            'swarm',
            'neural',
        ];
        const aiFlags = [
            '--ai-assist',
            '--real-time',
            '--optimize',
            '--neural',
            '--swarm',
        ];
        const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg));
        const hasAIFlag = args.some((arg) => aiFlags.includes(arg));
        if (hasAdvancedCommand || hasAIFlag)
            return 'advanced-cli';
        return 'terminal';
    },
    detectTerminalMode() {
        const args = process.argv.slice(2);
        const advancedCommands = [
            'create',
            'optimize',
            'generate',
            'swarm',
            'neural',
        ];
        const aiFlags = [
            '--ai-assist',
            '--real-time',
            '--optimize',
            '--neural',
            '--swarm',
        ];
        const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg));
        const hasAIFlag = args.some((arg) => aiFlags.includes(arg));
        if (hasAdvancedCommand || hasAIFlag)
            return 'advanced';
        if (process.argv.includes('--ui') || process.argv.includes('--tui'))
            return 'tui';
        if (process.argv.includes('--interactive') || process.argv.includes('-i'))
            return 'tui';
        if (process.argv.length > 2 &&
            !process.argv.slice(2).some((arg) => arg.startsWith('-')))
            return 'cli';
        if (process.stdout.isTTY)
            return 'tui';
        return 'cli';
    },
    validateConfig(config) {
        return ['terminal', 'web', 'mcp', 'api', 'advanced-cli'].includes(config?.['mode']);
    },
    isAdvancedCLIEnabled() {
        const args = process.argv.slice(2);
        const flags = process.env;
        const advancedCommands = [
            'create',
            'optimize',
            'generate',
            'swarm',
            'neural',
        ];
        const aiFlags = [
            '--ai-assist',
            '--real-time',
            '--optimize',
            '--neural',
            '--swarm',
        ];
        const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg));
        const hasAIFlag = args.some((arg) => aiFlags.includes(arg));
        return (hasAdvancedCommand || hasAIFlag || flags['CLAUDE_ADVANCED_CLI'] === 'true');
    },
};
export const INTERFACE_CAPABILITIES = {
    advancedCLI: true,
    aiAssistedDevelopment: true,
    realTimeMonitoring: true,
    intelligentScaffolding: true,
    swarmCoordination: true,
    neuralNetworkOptimization: true,
    quantumInspiredAlgorithms: true,
    enterpriseIntegration: true,
};
export default {
    InterfaceUtils,
    INTERFACE_CAPABILITIES,
};
//# sourceMappingURL=index.js.map