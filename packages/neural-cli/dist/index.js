"use strict";
/**
 * @fileoverview Neural-enhanced CLI commands entry point
 * @module neural-cli
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralImportCommand = void 0;
exports.registerNeuralCommands = registerNeuralCommands;
var neural_import_js_1 = require("./commands/neural-import.js");
Object.defineProperty(exports, "NeuralImportCommand", { enumerable: true, get: function () { return neural_import_js_1.NeuralImportCommand; } });
// Re-export neural command handlers
__exportStar(require("./commands/neural-import.js"), exports);
// CLI command registration helper
function registerNeuralCommands(commandRegistry) {
    commandRegistry.set('neural-import', {
        handler: async (args, flags) => {
            const { NeuralImportCommand } = await import('./commands/neural-import.js');
            const command = new NeuralImportCommand();
            const monorepoPath = args[0] || process.cwd();
            return await command.execute(monorepoPath, flags);
        },
        description: '🧠 Neural-enhanced monorepo import with ruv-swarm intelligence',
        usage: 'neural-import [monorepo-path] [options]',
        examples: [
            'neural-import /path/to/monorepo',
            'neural-import . --max-services 15 --analyze-code',
            'neural-import ../my-monorepo --neural-training --cognitive-diversity'
        ],
        details: `
Neural-Enhanced Monorepo Import:
  • Uses ruv-swarm neural networks for intelligent service discovery
  • Spawns specialized AI agents for different analysis tasks
  • Trains neural patterns from monorepo architecture
  • Provides intelligent recommendations based on learned patterns
  • Supports continuous learning and pattern improvement

Neural Features:
  🧠 Neural pattern recognition for service identification
  🤖 Multi-agent coordination for parallel analysis
  📊 Cognitive diversity for comprehensive insights
  ⚡ Neural performance optimization
  🎯 Intelligent recommendation generation
  🔄 Continuous learning from analysis results

Options:
  --max-services <number>        Limit services to analyze (default: 15)
  --analyze-code                Enable deep neural code analysis (default: true)
  --neural-training             Enable pattern training (default: true)
  --cognitive-diversity         Enable cognitive diversity (default: true)
  --neural-agents <number>      Number of neural agents (default: 5)
  --learning-rate <number>      Neural learning rate (default: 0.01)
  --training-iterations <number> Training iterations (default: 5)

Perfect for: Large-scale monorepo analysis with AI-powered insights
and continuous learning from architectural patterns.`
    });
}
//# sourceMappingURL=index.js.map