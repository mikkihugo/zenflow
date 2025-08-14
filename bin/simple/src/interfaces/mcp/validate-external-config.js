#!/usr/bin/env nodeimport { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-mcp-validate-external-config');
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
function validateConfigurationFiles() {
    const configFiles = [
        '.github/copilot_settings.yml',
        'claude_desktop_config.json',
        '.copilotrc.json',
        '.github/copilot-config.yml',
    ];
    let _validFiles = 0;
    const totalFiles = configFiles.length;
    const validationReport = {
        totalFiles,
        validFiles: 0,
        errors: [],
        warnings: [],
    };
    for (const file of configFiles) {
        const filePath = resolve(process.cwd(), file);
        if (existsSync(filePath)) {
            try {
                const content = readFileSync(filePath, 'utf8');
                if (file.endsWith('.json')) {
                    JSON.parse(content);
                    _validFiles++;
                    validationReport.validFiles++;
                }
                else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                    validationReport.warnings.push(`YAML validation skipped for ${file}`);
                }
                if (content.includes('context7') ||
                    content.includes('deepwiki') ||
                    content.includes('gitmcp') ||
                    content.includes('semgrep')) {
                }
            }
            catch (error) {
                const errorMsg = `Invalid config file ${file}: ${error.message}`;
                validationReport.errors.push(errorMsg);
                logger.error(`❌ ${errorMsg}`);
            }
        }
        else {
            validationReport.warnings.push(`Config file not found: ${file}`);
        }
    }
}
function testMCPConfiguration() {
    try {
        if (existsSync('claude_desktop_config.json')) {
            const config = JSON.parse(readFileSync('claude_desktop_config.json', 'utf8'));
            if (config?.mcpServers) {
                const _serverCount = Object.keys(config?.mcpServers).length;
                for (const [_name, _serverConfig] of Object.entries(config?.mcpServers)) {
                }
            }
            else {
            }
        }
        if (existsSync('.copilotrc.json')) {
            const config = JSON.parse(readFileSync('.copilotrc.json', 'utf8'));
            if (config?.mcp?.external_servers) {
                const externalServers = Object.keys(config?.mcp?.external_servers);
                for (const server of externalServers) {
                    const _serverConfig = config?.mcp?.external_servers?.[server];
                }
            }
        }
    }
    catch (_error) { }
}
function printSetupInstructions() { }
function main() {
    validateConfigurationFiles();
    testMCPConfiguration();
    printSetupInstructions();
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
//# sourceMappingURL=validate-external-config.js.map