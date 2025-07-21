"use strict";
/**
 * Safe Interactive Wrapper - Handles interactive commands in non-interactive environments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeInteractive = safeInteractive;
exports.nonInteractivePrompt = nonInteractivePrompt;
exports.nonInteractiveSelect = nonInteractiveSelect;
exports.nonInteractiveProgress = nonInteractiveProgress;
const chalk_1 = require("chalk");
const interactive_detector_js_1 = require("./interactive-detector.js");
/**
 * Wraps an interactive function with safety checks
 * @param {Function} interactiveFn - The interactive function to wrap
 * @param {Function} fallbackFn - The non-interactive fallback function
 * @param {Object} options - Options for the wrapper
 * @returns {Function} The wrapped function
 */
function safeInteractive(interactiveFn, fallbackFn, options = {}) {
    return async function (...args) {
        const flags = args[args.length - 1] || {};
        // Check if user explicitly requested non-interactive mode
        if (flags.nonInteractive || flags['no-interactive']) {
            if (fallbackFn) {
                return fallbackFn(...args);
            }
            else {
                console.log(chalk_1.default.yellow('⚠️  Non-interactive mode requested but no fallback available'));
                console.log(chalk_1.default.gray('This command requires interactive mode to function properly'));
                process.exit(1);
            }
        }
        // Auto-detect if we should use non-interactive mode
        if (!(0, interactive_detector_js_1.isInteractive)() || !(0, interactive_detector_js_1.isRawModeSupported)()) {
            const envType = (0, interactive_detector_js_1.getEnvironmentType)();
            if (!options.silent) {
                console.log(chalk_1.default.yellow('\n⚠️  Interactive mode not available'));
                console.log(chalk_1.default.gray(`Detected environment: ${envType}`));
                // Provide specific message based on environment
                if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
                    console.log(chalk_1.default.gray('WSL detected - raw mode may cause process hangs'));
                    console.log(chalk_1.default.cyan('💡 Tip: Use --no-interactive flag or run in native Linux'));
                }
                else if (process.platform === 'win32') {
                    console.log(chalk_1.default.gray('Windows detected - terminal compatibility issues'));
                    console.log(chalk_1.default.cyan('💡 Tip: Use Windows Terminal or WSL2 for better experience'));
                }
                else if (process.env.TERM_PROGRAM === 'vscode') {
                    console.log(chalk_1.default.gray('VS Code terminal detected - limited interactive support'));
                    console.log(chalk_1.default.cyan('💡 Tip: Use external terminal for full functionality'));
                }
                else if (!(0, interactive_detector_js_1.isRawModeSupported)()) {
                    console.log(chalk_1.default.gray('Terminal does not support raw mode'));
                }
                console.log();
            }
            if (fallbackFn) {
                return fallbackFn(...args);
            }
            else {
                console.log(chalk_1.default.red('❌ This command requires interactive mode'));
                console.log(chalk_1.default.gray('Please run in a compatible terminal environment'));
                process.exit(1);
            }
        }
        // Try to run the interactive function
        try {
            return await interactiveFn(...args);
        }
        catch (error) {
            // Check if it's a raw mode error
            if (error.message && (error.message.includes('setRawMode') ||
                error.message.includes('raw mode') ||
                error.message.includes('stdin') ||
                error.message.includes('TTY'))) {
                console.log(chalk_1.default.yellow('\n⚠️  Interactive mode failed'));
                console.log(chalk_1.default.gray(error.message));
                if (fallbackFn) {
                    console.log(chalk_1.default.cyan('Falling back to non-interactive mode...'));
                    return fallbackFn(...args);
                }
                else {
                    console.log(chalk_1.default.red('❌ No non-interactive fallback available'));
                    process.exit(1);
                }
            }
            // Re-throw other errors
            throw error;
        }
    };
}
/**
 * Create a non-interactive version of a prompt
 * @param {string} message - The prompt message
 * @param {*} defaultValue - The default value to use
 * @returns {*} The default value
 */
function nonInteractivePrompt(message, defaultValue) {
    console.log(chalk_1.default.gray(`📝 ${message}`));
    console.log(chalk_1.default.cyan(`   Using default: ${defaultValue}`));
    return defaultValue;
}
/**
 * Create a non-interactive version of a selection
 * @param {string} message - The selection message
 * @param {Array} choices - The available choices
 * @param {*} defaultChoice - The default choice
 * @returns {*} The default choice
 */
function nonInteractiveSelect(message, choices, defaultChoice) {
    console.log(chalk_1.default.gray(`📋 ${message}`));
    console.log(chalk_1.default.gray('   Available choices:'));
    choices.forEach(choice => {
        const isDefault = choice === defaultChoice || choice.value === defaultChoice;
        console.log(chalk_1.default.gray(`   ${isDefault ? '▶' : ' '} ${choice.name || choice}`));
    });
    console.log(chalk_1.default.cyan(`   Using default: ${defaultChoice}`));
    return defaultChoice;
}
/**
 * Show a non-interactive progress indicator
 * @param {string} message - The progress message
 * @returns {Object} Progress control object
 */
function nonInteractiveProgress(message) {
    console.log(chalk_1.default.gray(`⏳ ${message}...`));
    return {
        update: (newMessage) => {
            console.log(chalk_1.default.gray(`   ${newMessage}`));
        },
        succeed: (finalMessage) => {
            console.log(chalk_1.default.green(`✅ ${finalMessage || message}`));
        },
        fail: (errorMessage) => {
            console.log(chalk_1.default.red(`❌ ${errorMessage || 'Failed'}`));
        }
    };
}
