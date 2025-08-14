import { CliCommandAdapter } from './adapters/cli-command-adapter.ts';
export class AdvancedCLICommands {
    commandAdapter;
    constructor() {
        this.commandAdapter = new CliCommandAdapter();
    }
    async executeCommand(commandName, args, options) {
        const context = {
            command: commandName,
            args,
            options,
            workingDirectory: process.cwd(),
        };
        return await this.commandAdapter.executeCommand(context);
    }
    isAdvancedCommand(commandName) {
        return this.commandAdapter.isValidCommand(commandName);
    }
    getAvailableCommands() {
        return this.commandAdapter.getAvailableCommands();
    }
    getAdvancedCommandHelp(command) {
        return this.commandAdapter.getCommandHelp(command);
    }
}
export default AdvancedCLICommands;
//# sourceMappingURL=advanced-cli-commands.js.map