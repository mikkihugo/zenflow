#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Claude-Flow CLI - Main entry point for Node.js
 */
const cli_core_js_1 = require("./cli-core.js");
const index_js_1 = require("./commands/index.js");
const node_url_1 = require("node:url");
const node_path_1 = require("node:path");
async function main() {
    const cli = new cli_core_js_1.CLI("claude-flow", "Advanced AI Agent Orchestration System");
    // Setup all commands
    (0, index_js_1.setupCommands)(cli);
    // Run the CLI (args default to process.argv.slice(2) in Node.js version)
    await cli.run();
}
// Check if this module is being run directly (Node.js equivalent of import.meta.main)
const __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, node_path_1.dirname)(__filename);
const isMainModule = process.argv[1] === __filename || process.argv[1].endsWith('/main.js');
if (isMainModule) {
    main().catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}
