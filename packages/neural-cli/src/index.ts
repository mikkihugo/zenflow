/**
 * @fileoverview Neural-enhanced CLI commands entry point
 * @module neural-cli
 */

export { NeuralImportCommand } from './commands/neural-import.js';

// Re-export neural command handlers
export * from './commands/neural-import.js';

// CLI command registration helper
export function registerNeuralCommands(commandRegistry: Map<string, any>): void {
  commandRegistry.set('neural-import', {
    handler: async (args: string[], flags: any) => {
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