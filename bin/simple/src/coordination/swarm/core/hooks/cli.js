#!/usr/bin/env node
import { getLogger } from '../../../config/logging-config';
const logger = getLogger('coordination-swarm-core-hooks-cli');
import { handleHook } from './index.ts';
async function main() {
    const args = process.argv.slice(2);
    if (args[0] !== 'hook') {
        return;
    }
    const [, hookType] = args;
    const options = parseArgs(args.slice(2));
    if (!hookType) {
        logger.error('Hook type is required');
        process.exit(1);
    }
    try {
        const result = await handleHook(hookType, options);
        if (result?.continue === false) {
            process.exit(2);
        }
        else {
            process.exit(0);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(JSON.stringify({
            continue: true,
            error: errorMessage,
            stack: process.env['DEBUG'] ? errorStack : undefined,
        }));
        process.exit(1);
    }
}
function parseArgs(args) {
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg)
            continue;
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            const nextArg = args[i + 1];
            if (nextArg != null && !nextArg.startsWith('--')) {
                options[toCamelCase(key)] = nextArg;
                i++;
            }
            else {
                options[toCamelCase(key)] = true;
            }
        }
        else if (!args[i - 1]?.startsWith('--')) {
            if (!options?._) {
                options._ = [];
            }
            options?._?.push(arg);
        }
    }
    return options;
}
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() ?? '');
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
export { main };
//# sourceMappingURL=cli.js.map