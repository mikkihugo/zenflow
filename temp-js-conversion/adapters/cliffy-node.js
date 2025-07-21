"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = exports.Select = exports.Confirm = exports.Input = exports.colors = void 0;
/**
 * Cliffy Node.js Adapter
 *
 * This adapter provides Node.js-compatible implementations of Cliffy modules
 * by wrapping existing Node.js packages to match the Cliffy API.
 */
const chalk_1 = require("chalk");
const inquirer_1 = require("inquirer");
const cli_table3_1 = require("cli-table3");
exports.Table = cli_table3_1.default;
// Colors adapter - map Cliffy colors to chalk
exports.colors = {
    green: chalk_1.default.green,
    red: chalk_1.default.red,
    yellow: chalk_1.default.yellow,
    blue: chalk_1.default.blue,
    gray: chalk_1.default.gray,
    cyan: chalk_1.default.cyan,
    magenta: chalk_1.default.magenta,
    white: chalk_1.default.white,
    black: chalk_1.default.black,
    bold: chalk_1.default.bold,
    dim: chalk_1.default.dim,
    italic: chalk_1.default.italic,
    underline: chalk_1.default.underline,
    bgRed: chalk_1.default.bgRed,
    bgGreen: chalk_1.default.bgGreen,
    bgYellow: chalk_1.default.bgYellow,
    bgBlue: chalk_1.default.bgBlue,
};
// Prompt adapter - map Cliffy prompt to inquirer
const Input = async (options) => {
    const answers = await inquirer_1.default.prompt([{
            type: 'input',
            name: 'value',
            message: options.message,
            default: options.default,
        }]);
    return answers.value;
};
exports.Input = Input;
const Confirm = async (options) => {
    const answers = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'value',
            message: options.message,
            default: options.default,
        }]);
    return answers.value;
};
exports.Confirm = Confirm;
const Select = async (options) => {
    const answers = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'value',
            message: options.message,
            choices: options.options.map(opt => ({ name: opt.name, value: opt.value })),
            default: options.default,
        }]);
    return answers.value;
};
exports.Select = Select;
