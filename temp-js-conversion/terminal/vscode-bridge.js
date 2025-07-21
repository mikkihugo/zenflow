"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTerminalBridge = initializeTerminalBridge;
exports.createCapturedTerminal = createCapturedTerminal;
exports.executeTerminalCommand = executeTerminalCommand;
exports.getTerminalById = getTerminalById;
exports.disposeTerminalBridge = disposeTerminalBridge;
/**
 * VSCode Extension Bridge for Terminal Integration
 *
 * This file provides the bridge between Claude-Flow and VSCode extension API
 * for terminal management and output capture.
 *
 * NOTE: This file is only used when Claude-Flow is packaged as a VS Code extension.
 * It is excluded from the main CLI build. If you need to use this in a VS Code
 * extension context, install @types/vscode as a devDependency.
 */
const vscode = require("vscode");
/**
 * Terminal output processors registry
 */
const terminalOutputProcessors = new Map();
/**
 * Active terminals registry
 */
const activeTerminals = new Map();
/**
 * Terminal write emulators for output capture
 */
const terminalWriteEmulators = new Map();
/**
 * Initialize the VSCode terminal bridge
 */
function initializeTerminalBridge(context) {
    // Inject VSCode API into global scope for Claude-Flow
    globalThis.vscode = vscode;
    // Register terminal output processor function
    globalThis.registerTerminalOutputProcessor = (terminalId, processor) => {
        terminalOutputProcessors.set(terminalId, processor);
    };
    // Override terminal creation to capture output
    const originalCreateTerminal = vscode.window.createTerminal;
    vscode.window.createTerminal = function (options) {
        const terminal = originalCreateTerminal.call(vscode.window, options);
        // Create write emulator for this terminal
        const writeEmulator = new vscode.EventEmitter();
        terminalWriteEmulators.set(terminal, writeEmulator);
        // Find terminal ID from name
        const match = options.name?.match(/Claude-Flow Terminal ([\w-]+)/);
        if (match) {
            const terminalId = match[1];
            activeTerminals.set(terminalId, terminal);
            // Set up output capture
            captureTerminalOutput(terminal, terminalId);
        }
        return terminal;
    };
    // Clean up on terminal close
    context.subscriptions.push(vscode.window.onDidCloseTerminal((terminal) => {
        // Find and remove from registries
        for (const [id, term] of activeTerminals.entries()) {
            if (term === terminal) {
                activeTerminals.delete(id);
                terminalOutputProcessors.delete(id);
                break;
            }
        }
        // Clean up write emulator
        const emulator = terminalWriteEmulators.get(terminal);
        if (emulator) {
            emulator.dispose();
            terminalWriteEmulators.delete(terminal);
        }
    }));
}
/**
 * Capture terminal output using various methods
 */
function captureTerminalOutput(terminal, terminalId) {
    // Method 1: Use terminal.sendText override to capture commands
    const originalSendText = terminal.sendText;
    terminal.sendText = function (text, addNewLine) {
        // Call original method
        originalSendText.call(terminal, text, addNewLine);
        // Process command
        const processor = terminalOutputProcessors.get(terminalId);
        if (processor && text) {
            // Simulate command echo
            processor(text + (addNewLine !== false ? '\n' : ''));
        }
    };
    // Method 2: Use proposed API if available
    if ('onDidWriteData' in terminal) {
        const writeDataEvent = terminal.onDidWriteData;
        if (writeDataEvent) {
            writeDataEvent((data) => {
                const processor = terminalOutputProcessors.get(terminalId);
                if (processor) {
                    processor(data);
                }
            });
        }
    }
    // Method 3: Use terminal renderer if available
    setupTerminalRenderer(terminal, terminalId);
}
/**
 * Set up terminal renderer for output capture
 */
function setupTerminalRenderer(terminal, terminalId) {
    // Check if terminal renderer API is available
    if (vscode.window.registerTerminalProfileProvider) {
        // This is a more advanced method that requires additional setup
        // It would involve creating a custom terminal profile that captures output
        // For now, we'll use a simpler approach with periodic output checking
        let lastOutput = '';
        const checkOutput = setInterval(() => {
            // This is a placeholder - actual implementation would depend on
            // available VSCode APIs for reading terminal content
            // Check if terminal is still active
            if (!activeTerminals.has(terminalId)) {
                clearInterval(checkOutput);
            }
        }, 100);
    }
}
/**
 * Create a terminal with output capture
 */
async function createCapturedTerminal(name, shellPath, shellArgs) {
    const writeEmulator = new vscode.EventEmitter();
    const terminal = vscode.window.createTerminal({
        name,
        shellPath,
        shellArgs,
    });
    terminalWriteEmulators.set(terminal, writeEmulator);
    return {
        terminal,
        onData: writeEmulator.event,
    };
}
/**
 * Send command to terminal and capture output
 */
async function executeTerminalCommand(terminal, command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const writeEmulator = terminalWriteEmulators.get(terminal);
        if (!writeEmulator) {
            reject(new Error('No write emulator for terminal'));
            return;
        }
        let output = '';
        const marker = `__COMMAND_COMPLETE_${Date.now()}__`;
        // Set up output listener
        const disposable = writeEmulator.event((data) => {
            output += data;
            if (output.includes(marker)) {
                // Command completed
                disposable.dispose();
                const result = output.substring(0, output.indexOf(marker));
                resolve(result);
            }
        });
        // Set timeout
        const timer = setTimeout(() => {
            disposable.dispose();
            reject(new Error('Command timeout'));
        }, timeout);
        // Execute command with marker
        terminal.sendText(`${command} && echo "${marker}"`);
        // Clear timeout on success
        writeEmulator.event(() => {
            if (output.includes(marker)) {
                clearTimeout(timer);
            }
        });
    });
}
/**
 * Get terminal by ID
 */
function getTerminalById(terminalId) {
    return activeTerminals.get(terminalId);
}
/**
 * Dispose all terminal resources
 */
function disposeTerminalBridge() {
    // Clean up all terminals
    for (const terminal of activeTerminals.values()) {
        terminal.dispose();
    }
    activeTerminals.clear();
    // Clean up processors
    terminalOutputProcessors.clear();
    // Clean up write emulators
    for (const emulator of terminalWriteEmulators.values()) {
        emulator.dispose();
    }
    terminalWriteEmulators.clear();
}
