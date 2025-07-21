"use strict";
// slash-commands.js - Create Claude Code slash commands
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaudeSlashCommands = createClaudeSlashCommands;
const sparc_commands_js_1 = require("./sparc-commands.js");
const claude_flow_commands_js_1 = require("./claude-flow-commands.js");
// Create Claude Code slash commands for SPARC modes
async function createClaudeSlashCommands(workingDir) {
    try {
        console.log('\n📝 Creating Claude Code slash commands...');
        // Parse .roomodes to get all SPARC modes
        const roomodesContent = await Deno.readTextFile(`${workingDir}/.roomodes`);
        const roomodes = JSON.parse(roomodesContent);
        // Create slash commands for each SPARC mode
        for (const mode of roomodes.customModes) {
            const commandPath = `${workingDir}/.claude/commands/sparc/${mode.slug}.md`;
            const commandContent = (0, sparc_commands_js_1.createSparcSlashCommand)(mode);
            await Deno.writeTextFile(commandPath, commandContent);
            console.log(`  ✓ Created slash command: /sparc-${mode.slug}`);
        }
        // Create main SPARC command
        const mainSparcCommand = (0, sparc_commands_js_1.createMainSparcCommand)(roomodes.customModes);
        await Deno.writeTextFile(`${workingDir}/.claude/commands/sparc.md`, mainSparcCommand);
        console.log('  ✓ Created main slash command: /sparc');
        // Create claude-flow specific commands
        await (0, claude_flow_commands_js_1.createClaudeFlowCommands)(workingDir);
    }
    catch (err) {
        console.log(`  ⚠️  Could not create Claude Code slash commands: ${err.message}`);
    }
}
