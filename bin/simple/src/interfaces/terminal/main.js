#!/usr/bin/env node
import { getLogger } from '../../config/logging-config.ts';
import { detectModeWithReason, launchTerminalInterface } from './index.ts';
const logger = getLogger('interfaces-terminal-main');
async function main() {
    try {
        const args = process.argv.slice(2);
        const commands = args.filter((arg) => !arg.startsWith('-'));
        const flags = parseFlags(args);
        const modeResult = detectModeWithReason(commands, flags);
        if (flags.verbose || flags.debug) {
        }
        logger.info('🚀 Launching Ink-based terminal interface...');
        await launchTerminalInterface({
            mode: flags.mode || modeResult?.mode || 'interactive',
            theme: flags.theme || 'dark',
            verbose: flags.verbose,
            autoRefresh: !flags['no-refresh'],
            refreshInterval: typeof flags['refresh-interval'] === 'number'
                ? flags['refresh-interval']
                : (typeof flags['refresh-interval'] === 'string'
                    ? Number.parseInt(flags['refresh-interval'])
                    : 3000) || 3000,
        });
    }
    catch (error) {
        logger.error('❌ Failed to launch terminal interface:', error);
        process.exit(1);
    }
}
function parseFlags(args) {
    const flags = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg && arg.startsWith('--')) {
            const key = arg.slice(2);
            const nextArg = args[i + 1];
            if (nextArg && !nextArg.startsWith('-')) {
                if (key === 'refresh-interval') {
                    const parsed = Number.parseInt(nextArg);
                    flags[key] = Number.isNaN(parsed) ? 3000 : parsed;
                }
                else if (key === 'port') {
                    const parsed = Number.parseInt(nextArg);
                    flags[key] = Number.isNaN(parsed) ? nextArg : parsed;
                }
                else {
                    flags[key] = nextArg;
                }
                i++;
            }
            else {
                flags[key] = true;
            }
        }
        else if (arg && arg.startsWith('-') && arg.length > 1) {
            const key = arg.slice(1);
            flags[key] = true;
        }
    }
    return flags;
}
process.on('SIGINT', () => {
    process.exit(0);
});
process.on('SIGTERM', () => {
    process.exit(0);
});
const isMainModule = process.argv[1]?.endsWith('main.js') || process.argv[1]?.endsWith('main.ts');
if (isMainModule) {
    main().catch((error) => {
        logger.error('💥 Fatal error:', error);
        process.exit(1);
    });
}
export { main };
export default main;
//# sourceMappingURL=main.js.map