"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayStartBanner = displayStartBanner;
exports.displaySystemStatus = displaySystemStatus;
exports.displayInteractiveMenu = displayInteractiveMenu;
exports.displayOrchestratorArt = displayOrchestratorArt;
const chalk_1 = require("chalk");
function displayStartBanner(version = '1.0.71') {
    console.log();
    console.log(chalk_1.default.cyan('┌─────────────────────────────────────────────────┐'));
    console.log(chalk_1.default.cyan('│') + chalk_1.default.cyan.bold('   🧠 Claude-Flow Orchestration System') + chalk_1.default.cyan('           │'));
    console.log(chalk_1.default.cyan('│') + chalk_1.default.gray(`      v${version} - Advanced AI Agent Platform`) + chalk_1.default.cyan('      │'));
    console.log(chalk_1.default.cyan('└─────────────────────────────────────────────────┘'));
    console.log();
}
function displaySystemStatus(components) {
    console.log(chalk_1.default.yellow('System Components:'));
    components.forEach(component => {
        console.log(chalk_1.default.green('  ✓') + ' ' + component);
    });
    console.log();
}
function displayInteractiveMenu() {
    console.log(chalk_1.default.white.bold('Interactive Mode - Quick Actions:'));
    console.log();
    console.log('  ' + chalk_1.default.cyan('[1]') + ' Start all processes');
    console.log('  ' + chalk_1.default.cyan('[2]') + ' Start core processes only');
    console.log('  ' + chalk_1.default.cyan('[3]') + ' Launch process management UI');
    console.log('  ' + chalk_1.default.cyan('[4]') + ' Show system status');
    console.log('  ' + chalk_1.default.cyan('[5]') + ' Open web UI (http://localhost:3000)');
    console.log('  ' + chalk_1.default.cyan('[q]') + ' Quit');
    console.log();
    console.log(chalk_1.default.gray('Press a key to select an option...'));
}
function displayOrchestratorArt() {
    const art = `
    ╔═══════════════════════════════════════════════╗
    ║          Claude-Flow Orchestrator             ║
    ║  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐   ║
    ║  │Agent│◄──►│Tasks│◄──►│Memory│◄──►│ MCP │   ║
    ║  └─────┘    └─────┘    └─────┘    └─────┘   ║
    ║      ▲          ▲          ▲          ▲       ║
    ║      └──────────┴──────────┴──────────┘       ║
    ║                 Event Bus                      ║
    ╚═══════════════════════════════════════════════╝
  `;
    console.log(chalk_1.default.cyan(art));
}
