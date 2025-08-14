import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-integration-index');
export * from './multi-system-coordinator.ts';
export { MultiSystemCoordinator as default } from './multi-system-coordinator.ts';
export const IntegrationUtils = {
    validateCompatibility: (systemA, systemB) => {
        const compatiblePairs = [
            ['neural', 'coordination'],
            ['memory', 'database'],
            ['interfaces', 'api'],
            ['workflows', 'coordination'],
        ];
        return compatiblePairs.some((pair) => (pair[0] === systemA && pair[1] === systemB) ||
            (pair[1] === systemA && pair[0] === systemB));
    },
    getRequirements: (systems) => {
        const requirements = new Set();
        systems.forEach((system) => {
            switch (system) {
                case 'neural':
                    requirements.add('wasm');
                    requirements.add('memory');
                    break;
                case 'database':
                    requirements.add('storage');
                    break;
                case 'coordination':
                    requirements.add('mcp');
                    requirements.add('agents');
                    break;
            }
        });
        return Array.from(requirements);
    },
    checkSystemHealth: async (system) => {
        try {
            switch (system) {
                case 'neural': {
                    const neural = await import('../neural/index.ts');
                    return Boolean(neural);
                }
                case 'database': {
                    const database = await import('../database/index.ts');
                    return Boolean(database);
                }
                case 'coordination': {
                    const coordination = await import('../coordination/index.ts');
                    return Boolean(coordination);
                }
                default:
                    return false;
            }
        }
        catch {
            return false;
        }
    },
};
export class IntegrationFactory {
    static coordinators = new Map();
    static async getCoordinator(systems, instanceKey = 'default') {
        const key = `${systems.sort().join('-')}:${instanceKey}`;
        if (!IntegrationFactory.coordinators.has(key)) {
            const { MultiSystemCoordinator } = await import('./multi-system-coordinator.ts');
            const logger = {
                debug: (_msg, _meta) => { },
                info: (_msg, _meta) => { },
                warn: (msg, meta) => logger.warn(`[MultiSystemCoordinator] ${msg}`, meta),
                error: (msg, meta) => logger.error(`[MultiSystemCoordinator] ${msg}`, meta),
            };
            const coordinator = new MultiSystemCoordinator(logger, {
                systems,
            });
            IntegrationFactory.coordinators.set(key, coordinator);
        }
        return IntegrationFactory.coordinators.get(key);
    }
    static clearCoordinators() {
        IntegrationFactory.coordinators.clear();
    }
}
//# sourceMappingURL=index.js.map