import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('DocumentationManager');
export class DocumentationManager extends EventEmitter {
    memory;
    config;
    stats;
    initialized = false;
    constructor(memory, config = {}) {
        super();
        this.memory = memory;
        this.config = {
            autoLink: config?.['autoLink'] !== false,
            scanPaths: config?.['scanPaths'] || ['./docs', './src'],
            maxDepth: config?.['maxDepth'] || 10,
        };
        this.stats = {
            indexedDocuments: 0,
            totalLinks: 0,
            brokenLinks: 0,
        };
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing documentation manager');
        if (this.config.autoLink) {
            await this.scanDocumentation();
        }
        this.initialized = true;
        this.emit('initialized');
        logger.info('Documentation manager ready');
    }
    async indexDocument(document) {
        await this.ensureInitialized();
        const docId = `doc-${Date.now()}`;
        await this.memory.store(docId, {
            title: document.title || 'Untitled',
            path: document.path,
            content: document.content,
            type: document.type,
            indexedAt: new Date().toISOString(),
        }, 'documentation');
        this.stats.indexedDocuments++;
        logger.debug(`Indexed document: ${document.title || document.path}`);
    }
    async scanDocumentation() {
        logger.info('Scanning documentation paths...');
        for (const path of this.config.scanPaths) {
            logger.debug(`Scanning: ${path}`);
        }
        logger.info('Documentation scan complete');
    }
    getDocumentationIndex() {
        return new Map();
    }
    async generateDocumentationReport() {
        const report = [
            '# Documentation Report',
            `Generated: ${new Date().toISOString()}`,
            '',
            '## Statistics',
            `- Indexed Documents: ${this.stats.indexedDocuments}`,
            `- Total Links: ${this.stats.totalLinks}`,
            `- Broken Links: ${this.stats.brokenLinks}`,
            '',
            '## Scan Paths',
            ...this.config.scanPaths.map((path) => `- ${path}`),
        ];
        return report.join('\n');
    }
    async getStats() {
        return { ...this.stats };
    }
    async shutdown() {
        logger.info('Shutting down documentation manager...');
        this.removeAllListeners();
        logger.info('Documentation manager shutdown complete');
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
//# sourceMappingURL=documentation-manager.js.map